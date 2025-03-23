export const AaveSupplyIntent = {
    "key": "intents/defi/supply_usdc_on_aave",
    "content": {
        "shortDescription": "Supply USDC on AaveV3 on Base",
        "longDescription": "Supply USDC on AaveV3 on Base. The user needs to provide the amount of USDC to supply. Users will typically supply assets on Aave to earn a yield by providing liquidity to the protocol. Aave is a leading DeFi lending protocol for providing liquidity to borrowers.",
        "variables": [
            {
                "name": "amount",
                "type": "string",
                "description": "The amount of the asset to supply"
            }
        ],
        "clic": [
            {
                "step": "1",
                "type": "readContract",
                "description": "Call the encodeSupplyParams view function on the L2Encoder contract to encode the supply parameters into a bytes32 value that will be used in the subsequent supply write contract call.",
                "contractAddress": "0x39e97c588B2907Fb67F44fea256Ae3BA064207C5",
                "functionName": "encodeSupplyParams",
                "functionArgs": [
                    {
                        "name": "asset",
                        "type": "address",
                        "description": "The contract address of the asset to supply"
                    },
                    {
                        "name": "amount",
                        "type": "uint256",
                        "description": "The amount of the asset to supply"
                    },
                    {
                        "name": "referralCode",
                        "type": "uint16",
                        "description": "The referral code to use if any or 0 if no referral code is used"
                    }
                ],
                "recallKey": "contracts/AaveV3/0x39e97c588B2907Fb67F44fea256Ae3BA064207C5"
            },
            {
                "step": "2",
                "type": "writeContract",
                "description": "Approve the AaveV3 L2 Pool contract to spend the user's USDC. This is required before supplying assets to the protocol.",
                "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                "functionName": "approve",
                "functionArgs": [
                    {
                        "name": "spender",
                        "type": "address",
                        "description": "The address of the AaveV3 L2 Pool contract that will be approved to spend the USDC"
                    },
                    {
                        "name": "amount",
                        "type": "uint256",
                        "description": "The amount of USDC to approve for spending"
                    }
                ],
                "recallKey": "contracts/ERC20/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
            },
            {
                "step": "3",
                "type": "writeContract",
                "description": "Call the supply function on the AaveV3 L2 Pool contract to supply the asset using the encoded parameters from step 1.",
                "contractAddress": "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
                "functionName": "supply",
                "functionArgs": [
                    {
                        "name": "encodedParams",
                        "type": "bytes32",
                        "description": "The encoded parameters from step 1"
                    }
                ],
                "recallKey": "contracts/AaveV3/0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
            }
        ]
    }
}