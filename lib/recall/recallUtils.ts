import { testnet } from "@recallnet/chains";
import { RecallClient } from "@recallnet/sdk/client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { parseEther } from "viem/utils";
import { AaveSupplyIntent } from "./seedData/Intents/supply_on_aave";
import { L2EncoderContract } from "./seedData/Contracts/0x39e97c588B2907Fb67F44fea256Ae3BA064207C5";
import { L2PoolContract } from "./seedData/Contracts/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";

const privateKey = process.env.PRIVATE_KEY;
const walletClient = createWalletClient({
  account: privateKeyToAccount(privateKey as `0x${string}`),
  chain: testnet,
  transport: http(),
});

const recall = new RecallClient({ walletClient });

const bucketManager = recall.bucketManager();

/**
 * Retrieves JSON data from a Recall bucket
 * @param bucketId The ID of the bucket to retrieve from
 * @param key The key of the object to retrieve
 * @returns The parsed JSON data
 */
export async function getRecallData(bucketId: `0x${string}`, key: string) {
  const { result } = await bucketManager.get(bucketId, key);
  const contents = new TextDecoder().decode(result);
  return JSON.parse(contents);
}

