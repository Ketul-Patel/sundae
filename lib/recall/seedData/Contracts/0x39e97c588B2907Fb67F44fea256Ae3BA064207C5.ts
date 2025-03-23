export const L2EncoderContract = {
    "key": "contracts/AaveV3/0x39e97c588B2907Fb67F44fea256Ae3BA064207C5",
    "content": {
        "name": "L2Encoder",
        "description": "The L2Encoder contract is a helper contract that is primarily used to encode parameters for use in the AaveV3 L2 Pool contract.",
        "address": "0x39e97c588B2907Fb67F44fea256Ae3BA064207C5",
        "chains": [
            "base"
        ],
        "abi": [
            {
                "inputs": [
                    {
                        "internalType": "contract IPool",
                        "name": "pool",
                        "type": "address"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [],
                "name": "POOL",
                "outputs": [
                    {
                        "internalType": "contract IPool",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "interestRateMode",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint16",
                        "name": "referralCode",
                        "type": "uint16"
                    }
                ],
                "name": "encodeBorrowParams",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "collateralAsset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "debtAsset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "debtToCover",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "receiveAToken",
                        "type": "bool"
                    }
                ],
                "name": "encodeLiquidationCall",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "user",
                        "type": "address"
                    }
                ],
                "name": "encodeRebalanceStableBorrowRate",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "interestRateMode",
                        "type": "uint256"
                    }
                ],
                "name": "encodeRepayParams",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "interestRateMode",
                        "type": "uint256"
                    }
                ],
                "name": "encodeRepayWithATokensParams",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "interestRateMode",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint8",
                        "name": "permitV",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "permitR",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "permitS",
                        "type": "bytes32"
                    }
                ],
                "name": "encodeRepayWithPermitParams",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "useAsCollateral",
                        "type": "bool"
                    }
                ],
                "name": "encodeSetUserUseReserveAsCollateral",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint16",
                        "name": "referralCode",
                        "type": "uint16"
                    }
                ],
                "name": "encodeSupplyParams",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint16",
                        "name": "referralCode",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint8",
                        "name": "permitV",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "permitR",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "permitS",
                        "type": "bytes32"
                    }
                ],
                "name": "encodeSupplyWithPermitParams",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "interestRateMode",
                        "type": "uint256"
                    }
                ],
                "name": "encodeSwapBorrowRateMode",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "encodeWithdrawParams",
                "outputs": [
                    {
                        "internalType": "bytes32",
                        "name": "",
                        "type": "bytes32"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    }
}