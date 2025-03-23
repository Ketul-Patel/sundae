// agent.ts
import { v4 as uuidv4 } from "uuid";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredToolInterface, tool } from "@langchain/core/tools";
import { z } from "zod";
import { AIMessage, BaseMessage, BaseMessageLike, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { StateGraph, MessagesAnnotation, START, END, LangGraphRunnableConfig, Annotation } from "@langchain/langgraph";
import { createWalletClient, encodeFunctionData, http, parseAbi, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

dotenv.config();

import { ToolNode } from "@langchain/langgraph/prebuilt";
import { testnet } from "@recallnet/chains";
import { RecallClient } from "@recallnet/sdk/client";

// const checkpointer = new PostgresSaver(graphPool);

// await checkpointer.setup()

const privateKey = process.env.PRIVATE_KEY;
const walletClient = createWalletClient({
  account: privateKeyToAccount(privateKey as `0x${string}`),
  chain: testnet,
  transport: http(),
});

const recall = new RecallClient({ walletClient });

const bucketManager = recall.bucketManager();

const generateByteCode = tool(async (input, config: LangGraphRunnableConfig) => {
  console.log("generateByteCode with ", input)
  const functionData = encodeFunctionData({
    abi: parseAbi(input.readableAbi),
    functionName: input.functionName as any,
    args: input.functionArgs as any,
  })
  console.log("functionData", functionData)

  return {
    functionData: functionData,
  }
}, {
  name: "generateByteCode",
  description: "Generate byte code for a given function call ",
  schema: z.object({
    readableAbi: z.array(z.string()),
    functionName: z.string(),
    functionArgs: z.array(z.string()),
  })
})

const getAllIntents = tool(async (input, config: LangGraphRunnableConfig) => {
  console.log("getAllIntents")
  console.log("input", input)
  const bucket = input.bucketAddress as `0x${string}`;
  const { result: { objects } } = await bucketManager.query(bucket, { prefix: `intents/${input.category}/` });
  const intents = await Promise.all(objects.map(async (object) => {
    const { result } = await bucketManager.get(bucket, object.key);
    const contents = new TextDecoder().decode(result);
    return JSON.parse(contents);
  }))
  console.log("intents", intents)
  return {
    intents: intents,
  }
}, {
  name: "getAllIntents",
  description: "Get all intents from the bucket",
  schema: z.object({
    bucketAddress: z.string().default("0xFF00000000000000000000000000000000000164"),
    category: z.enum(["defi"]),
  })
})


const tools = [generateByteCode, getAllIntents]

const toolNode = new ToolNode(tools)

const shouldContinue = async (
  state: typeof MessagesAnnotation.State,
) => {
  console.log("asking shouldContinue")
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
      return "tools";
  }
  return "structuredIntentParser";
}

const model = new ChatOpenAI({temperature: 0, model: 'gpt-4o'}).bindTools(tools, {parallel_tool_calls: false});

const StepSchema = z.object({
  step: z.number(),
  type: z.enum(["readContract", "writeContract"]),
  description: z.string(),
  contractAddress: z.string(),
  functionName: z.string(),
  functionArgs: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string()
  })),
  recallKey: z.string()
});

const UserInputSchema = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string()
});

const IntentSchema = z.object({
  steps: z.array(StepSchema)
});

type Step = z.infer<typeof StepSchema>;
type UserInput = z.infer<typeof UserInputSchema>;
type Intent = z.infer<typeof IntentSchema>;

const actor = async (
  state: typeof MessagesAnnotation.State,
) => {
  console.log("Calling actor")
  const systemMessage = new SystemMessage(`
    You are an agent specializes in creating a sequence of blockchain actions to take to achieve a given user intent.
    You should start by getting all intents using the getAllIntents tool. This will return a list of intents that you can compare to the user intent to help build the sequence of actions.
    Respond with a valid JSON object containing 1 field: steps. 
    The steps field should be a list of objects with the following fields:
      - step: The step number
      - type: The type of action to take. This can be one of the following values: "readContract", "writeContract"
      - description: A description of the action to take
      - contractAddress: The address of the contract to take the action on
      - functionName: The name of the function to call
      - functionArgs: Information about the arguments to pass to the function. This is a list of objects with the following fields:
        - name: The name of the argument
        - type: The type of the argument
        - description: A description of the argument
      - recallKey: The key of the contract data in the recall bucket
    `)
  const outputParser = new JsonOutputParser<Intent>();
  const response = await model.invoke([systemMessage, ...state.messages])
  console.log("response", response)
  return ({messages: response})
}

const intentParserModel = new ChatOpenAI({temperature: 0, model: 'gpt-4o'})

const structuredIntentParserModel = intentParserModel.withStructuredOutput(IntentSchema)

const callStructuredIntentParserModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await structuredIntentParserModel.invoke([new HumanMessage({content: state.messages[state.messages.length - 1].content})])
  console.log("response", response)
  return ({messages: [new AIMessage({content: JSON.stringify(response)})]})
}



const daeBuilder = new StateGraph(MessagesAnnotation)
  .addNode("tools", toolNode)
  .addNode("actor", actor)
  .addNode("structuredIntentParser", callStructuredIntentParserModel)
  .addConditionalEdges("actor", shouldContinue, ['tools', 'structuredIntentParser'])
  .addEdge("tools", "actor")
  .addEdge("structuredIntentParser", END)
  .addEdge(START, "actor")

export const dae = daeBuilder.compile()