import { testnet } from "@recallnet/chains";
import { RecallClient } from "@recallnet/sdk/client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { parseEther } from "viem/utils";
import { AaveSupplyIntent } from "./seedData/Intents/supply_on_aave";
import { L2EncoderContract } from "./seedData/Contracts/0x39e97c588B2907Fb67F44fea256Ae3BA064207C5";
import { L2PoolContract } from "./seedData/Contracts/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";
import { USDCContract } from "./seedData/Contracts/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
import dotenv from "dotenv";

dotenv.config();

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
// const { meta: creditMeta } = await creditManager.buy(parseEther("1"));
// console.log("Credit purchased at:", creditMeta?.tx?.transactionHash);

const bucketManager = recall.bucketManager();

const bucket = '0xFF00000000000000000000000000000000000164';

// const key = AaveSupplyIntent.key;
// const content = new TextEncoder().encode(JSON.stringify(AaveSupplyIntent.content));
// For RAG 
// 1. Store bucket of intents & resulting Contract-Level Interactions Chain
// 2. Store bucket of contracts with full ABI, description, common functions, and related contracts

const key = AaveSupplyIntent.key;
const { result: objectDeleted } = await bucketManager.delete(bucket, key);
console.log("Object deleted at:", objectDeleted);



// const key = AaveSupplyIntent.key;
const content = new TextEncoder().encode(JSON.stringify(AaveSupplyIntent.content));

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

// const keyL2Pool = L2PoolContract.key;
// const contentL2Pool = new TextEncoder().encode(JSON.stringify(L2PoolContract.content));

// const { meta: addMetaL2Pool } = await bucketManager.add(bucket, keyL2Pool, contentL2Pool);
// console.log("Object added at:", addMeta?.tx?.transactionHash);

// const prefixAaveV3 = "contracts/AaveV3/";
// const {
//   result: { objects: objectsL2Pool },
// } = await bucketManager.query(bucket, { prefix: prefixAaveV3 });
// console.log("Objects:", objectsL2Pool);

// const { result: objectL2Pool } = await bucketManager.get(bucket, keyL2Pool);
// const contentsL2Pool = new TextDecoder().decode(objectL2Pool);
// console.log("Contents:", contentsL2Pool);

// const keyUSDC = USDCContract.key;
// const contentUSDC = new TextEncoder().encode(JSON.stringify(USDCContract.content));

// const { meta: addMetaUSDC } = await bucketManager.add(bucket, keyUSDC, contentUSDC);
// console.log("USDC contract added at:", addMetaUSDC?.tx?.transactionHash);

// const prefixERC20 = "contracts/ERC20/";
// const {
//   result: { objects: objectsERC20 },
// } = await bucketManager.query(bucket, { prefix: prefixERC20 });
// console.log("ERC20 Objects:", objectsERC20);

// const { result: objectUSDC } = await bucketManager.get(bucket, keyUSDC);
// const contentsUSDC = new TextDecoder().decode(objectUSDC);
// console.log("USDC Contract Contents:", contentsUSDC);

// const keyL2Encoder = L2EncoderContract.key;
// const contentL2Encoder = new TextEncoder().encode(JSON.stringify(L2EncoderContract.content));

// const { meta: addMetaL2Encoder } = await bucketManager.add(bucket, keyL2Encoder, contentL2Encoder);
// console.log("Object added at:", addMeta?.tx?.transactionHash);

// const {
//   result: { objects: objectsL2Encoder },
// } = await bucketManager.query(bucket, { prefix: prefixAaveV3 });
// console.log("Objects:", objectsL2Encoder);

// const { result: objectL2Encoder } = await bucketManager.get(bucket, keyL2Encoder);
// const contentsL2Encoder = new TextDecoder().decode(objectL2Encoder);
// console.log("Contents:", contentsL2Encoder);