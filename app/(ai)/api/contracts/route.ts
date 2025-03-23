import { NextResponse } from "next/server";
import { dae } from "../../../../lib/ai/agent";
import { HumanMessage } from "@langchain/core/messages";
import { getRecallData } from "@/lib/recall/recallUtils";


export async function POST(request: Request) {

  // Get the JSON body from the request
  const body = await request.json();
  const { recallKey, functionName } = body;

  try {
    const contractData = await getRecallData("0xFF00000000000000000000000000000000000164",recallKey);
    if(contractData.abi) {
      const abiItem = contractData.abi.filter((abiItem: any) => abiItem.name === functionName);
      return NextResponse.json(abiItem);
    } else {
      return "No ABI found";
    }
  } catch (error) {
    console.error("Error processing intent:", error);
    return NextResponse.json(
      { error: "Failed to process intent" },
      { status: 500 }
    );
  }
  
}
