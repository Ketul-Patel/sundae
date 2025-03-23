import { testnet } from "@recallnet/chains";
import { RecallClient } from "@recallnet/sdk/client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { parseEther } from "viem/utils";
import AaveSupplyIntent from "./seedData/Intents/supply_on_aave.json";
import L2EncoderContract from "./seedData/Contracts/0x39e97c588B2907Fb67F44fea256Ae3BA064207C5.json";
import L2PoolContract from "./seedData/Contracts/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5.json";

const privateKey = process.env.PRIVATE_KEY;
const walletClient = createWalletClient({
  account: privateKeyToAccount(privateKey as `0x${string}`),
  chain: testnet,
  transport: http(),
});

const recall = new RecallClient({ walletClient });

// Set up credit manager
const creditManager = recall.creditManager();
 
// Buy 1 credit
const { meta: creditMeta } = await creditManager.buy(parseEther("1"));
console.log("Credit purchased at:", creditMeta?.tx?.transactionHash);

const bucketManager = recall.bucketManager();
const {
  result: { bucket },
} = await bucketManager.create();

console.log("Bucket created:", bucket);

const key = AaveSupplyIntent.key;
const content = new TextEncoder().encode(JSON.stringify(AaveSupplyIntent.content));
// For RAG 
// 1. Store bucket of intents & resulting Contract-Level Interactions Chain
// 2. Store bucket of contracts with full ABI, description, common functions, and related contracts

const file = new File([content], "file.json", {
  type: "application/json",
});

const { meta: addMeta } = await bucketManager.add(bucket, key, content);
console.log("Object added at:", addMeta?.tx?.transactionHash);

const prefix = "intents/defi/";
const {
  result: { objects },
} = await bucketManager.query(bucket, { prefix });
console.log("Objects:", objects);

const { result: object } = await bucketManager.get(bucket, key);
const contents = new TextDecoder().decode(object);
console.log("Contents:", contents);