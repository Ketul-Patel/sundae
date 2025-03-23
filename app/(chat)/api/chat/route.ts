import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import {
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
  stripPrivyDID,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { PrivyClient } from '@privy-io/server-auth'

import { dae } from '@/lib/ai/agent';
import { LangChainAdapter } from 'ai';
import { HumanMessage } from '@langchain/core/messages';
import { AIMessage } from '@langchain/core/messages';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { encodeFunctionData, parseAbi } from 'viem';
import { getRecallData } from '@/lib/recall/recallUtils';
import { tokens } from '@/lib/utils';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    console.log("request", request.headers);

    const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

    console.log("accessToken", accessToken);

    let userId: string | null = null;

    try {
      const verifiedClaims = await privy.verifyAuthToken(accessToken!);
      if (!verifiedClaims || !verifiedClaims.userId) {
        return new Response('Unauthorized', { status: 401 });
      }

      userId = stripPrivyDID(verifiedClaims.userId) || null;
    } catch (error) {
      console.log("error", error);
      return new Response('Unauthorized', { status: 401 });
    }
    

    
    console.log("down to the user message", messages);
    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    console.log("this is the chat", chat);

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      console.log("this is the title", title);  

      await saveChat({ id, userId: userId!, title });
      console.log("just saved!");
    } else {
      if (chat.userId !== userId) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    console.log("just saved the messages!");

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          //@ts-ignore
          model: openai('gpt-4o'),
          system: `You are an agent that specializes in fulfilling a user request by taking multiple actions on the blockchain.
                  Given a user request you should first use the getContractLevelInteractionChain tool to get the chain of contract interactions that are needed to fulfill the user request as well as all of the information you need to acquire from the user. 
                  By default assume that the chain that the user is operating on is Base.
                  When dealing with assets, make sure that you are using the correct contract address for the asset. Injected below is a list of popular assets and their contract addresses on Base. If the user is asking for an asset not included here then make sure to clarify the contract address with the user.
                  ${JSON.stringify(tokens)}
                 For each Contract-Level Interaction, you should use the executeContractLevelInteraction tool to execute the transaction.
                 You should only call the executeContractLevelInteraction tool on one step at a time. Do not call it on multiple steps without first waiting for a step to finish.
                 You should evaluate the messages below to determine where you are in the process of fulfilling the user request prior to proceeding.
                  `,
          messages,
          maxSteps: 10,
          experimental_activeTools:
            ['executeContractLevelInteraction', 'getContractLevelInteractionChain'],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getContractLevelInteractionChain: {
              description: 'get the chain of contract interactions that are needed to fulfill the user request',
              parameters: z.object({
                userRequest: z.string().describe('the user request verbatim as it was requested by the user'),
              }),
              execute: async ({ userRequest }: { userRequest: string }) => {
                // Call the agent with the intent as the prompt
                const result = await dae.invoke({
                  messages: [new HumanMessage({ content: userRequest })]
                });
                // Extract the last message which contains the structured intent
                const messages = result.messages;
                const lastMessage = messages[messages.length - 1];
                
                // Parse the JSON content from the last message
                const intents = JSON.parse(lastMessage.content as string);
                return intents;
              }
            },
            executeContractLevelInteraction: {
              description: 'Execute a contract interaction from the chain of contract interactions previously generated',
              parameters: z.object({ // TODO: add chain parameter to allow for transactions across different chains
                recallKey: z.string(),
                functionName: z.string(),
                functionArgs: z.array(z.string()),
                address: z.string(),
                amount: z.string().optional(),
                chain: z.string().default('base'),
                readOnly: z.boolean(),
                isLastStep: z.boolean().describe('whether this is the last step in the chain of contract interactions'),
                messageAfterCompletion: z.string().describe('a message to share with the user if the contract interaction has been successfully executed')
              })
            }
            //Test Prompt: Execute the encodeSupplyParams function to supply 1 USDC to AaveV3 on Base. The human readable ABI function is 'function encodeSupplyParams(address asset,uint256 amount,uint16 referralCode) external view returns (bytes32)', the asset contract address for USDC is '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'. The contract address for the L2Encoder contract which the encodeSupplyParams should be run on is '0x39e97c588B2907Fb67F44fea256Ae3BA064207C5'

          },
          onStepFinish: async (step) => {
            console.log("stepFinish!", step);
          },
          onFinish: async ({ response }) => {
            if (userId) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occured!';
      },
    });

  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  let userId: string | null = null;

  try {
    const verifiedClaims = await privy.verifyAuthToken(accessToken!);
    if (!verifiedClaims || !verifiedClaims.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    userId = stripPrivyDID(verifiedClaims.userId) || null;
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const messages = await getMessagesByChatId({ id });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_SECRET_KEY!);

    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

    let userId: string | null = null;

    try {
      const verifiedClaims = await privy.verifyAuthToken(accessToken!);
      if (!verifiedClaims || !verifiedClaims.userId) {
        return new Response('Unauthorized', { status: 401 });
      }

      userId = stripPrivyDID(verifiedClaims.userId) || null;
    } catch (error) {
      return new Response('Unauthorized', { status: 401 });
    }


  try {
    const chat = await getChatById({ id });

    if (chat.userId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
