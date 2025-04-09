"use client";

import { useState, useCallback } from "react";
import { type Address, parseEther, parseUnits } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import TokenField from "./TokenField";
import RecipientsInput from "./RecipientsInput";

// ABI for the Disperse contract
const DISPERSE_ABI = [
    {
        inputs: [
            { internalType: "address[]", name: "recipients", type: "address[]" },
            { internalType: "uint256[]", name: "values", type: "uint256[]" },
        ],
        name: "disperseETH",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "address[]", name: "recipients", type: "address[]" },
            { internalType: "uint256[]", name: "values", type: "uint256[]" },
        ],
        name: "disperseToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "address", name: "token", type: "address" },
            { internalType: "address[]", name: "recipients", type: "address[]" },
            { internalType: "uint256[]", name: "values", type: "uint256[]" },
        ],
        name: "disperseTokenSimple",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];

// Disperse contract address
const DISPERSE_CONTRACT = "0x3e59c87d81a21cc9ff818e85db23715d362c8faa";

// Special address for native token
const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

interface Recipient {
    address: string;
    amount: string;
    valid: boolean;
}

interface TokenData {
    name: string;
    symbol: string;
    decimals: number;
    balance: {
        symbol: string;
        formatted: string;
        decimals: number;
        value: bigint;
    } | undefined;
}

export default function DisperseForms() {
    const [tokenAddress, setTokenAddress] = useState<string>("");
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [disperseMethod, setDisperseMethod] = useState<'disperseETH' | 'disperseToken' | 'disperseTokenSimple'>('disperseETH');
    const [txHash, setTxHash] = useState<string | null>(null);
    const { data: hash, isPending, sendTransaction } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })

    // Determine if using native token (ETH)
    const isNativeToken = tokenAddress === NATIVE_TOKEN_ADDRESS || tokenAddress === "";

    // Calculate total amount to disperse
    const totalAmount = recipients.reduce((sum, recipient) => {
        return sum + (Number(recipient.amount) || 0);
    }, 0);

    // Prepare valid recipients and amounts for contract call
    const preparedRecipients = recipients.filter(r => r.valid).map(r => r.address as Address);

    const preparedAmounts = recipients.filter(r => r.valid).map(r => {
        // For ETH and tokens with 18 decimals (most common)
        const decimals = tokenData?.decimals || 18;
        const amount = r.amount.toString();
        return parseUnits(amount, decimals);
    });

    // Calculate total ETH value for native token transfers
    const totalValue = isNativeToken
        ? parseEther(totalAmount.toString())
        : parseEther("0");

    // Validate form
    const isValid = preparedRecipients.length > 0 &&
        preparedAmounts.length === preparedRecipients.length &&
        (isNativeToken || tokenAddress !== "") &&
        totalAmount > 0;

    // Prepare contract write configuration
    const getContractConfig = () => {
        const baseConfig = {
            to: DISPERSE_CONTRACT as Address,
            abi: DISPERSE_ABI,
        };

        if (isNativeToken) {
            return {
                ...baseConfig,
                functionName: 'disperseETH',
                args: [preparedRecipients, preparedAmounts],
                value: totalValue,
            };
        }

        if (disperseMethod === 'disperseToken') {
            return {
                ...baseConfig,
                functionName: 'disperseToken',
                args: [tokenAddress as Address, preparedRecipients, preparedAmounts],
            };
        }

        return {
            ...baseConfig,
            functionName: 'disperseTokenSimple',
            args: [tokenAddress as Address, preparedRecipients, preparedAmounts],
        };
    };

    // Get configuration for contract write
    const contractConfig = getContractConfig();

    // Handle token address change
    const handleTokenAddressChange = useCallback((address: string) => {
        setTokenAddress(address);
        setTxHash(null);
    }, []);

    // Handle token data change
    const handleTokenDataChange = useCallback((data: TokenData) => {
        setTokenData(data);

        // Set the disperse method based on the token type
        if (data.symbol === 'ETH' || data.symbol === 'SHM') {
            setDisperseMethod('disperseETH');
        } else {
            setDisperseMethod('disperseToken');
        }
    }, []);

    // Handle recipients change
    const handleRecipientsChange = useCallback((recipients: Recipient[]) => {
        setRecipients(recipients);
        setTxHash(null);
    }, []);

    // Toggle between token disperse methods
    const toggleDisperseMethod = () => {
        if (!isNativeToken) {
            setDisperseMethod(
                disperseMethod === 'disperseToken'
                    ? 'disperseTokenSimple'
                    : 'disperseToken'
            );
        }
    };

    // Handle form submission
    const handleDisperse = async () => {
        console.log("check")
        if (!isPending) {
            console.log("check")

            try {
                sendTransaction({
                    ...contractConfig,
                }, {
                    onSuccess(data) {
                        setTxHash(data);
                    }
                })

            } catch (error) {
                console.error("Transaction failed", error);
            }
        }
    };

    const isLoading = isConfirming || isPending;

    return (
        <div>
            <form onSubmit={(e) => { e.preventDefault(); void handleDisperse(); }}>
                <TokenField
                    tokenAddress={tokenAddress}
                    onTokenAddressChange={handleTokenAddressChange}
                    onTokenDataChange={handleTokenDataChange}
                />

                <RecipientsInput
                    onRecipientsChange={handleRecipientsChange}
                    tokenDecimals={tokenData?.decimals || 18}
                />

                {!isNativeToken && (
                    <div className="mb-6">
                        <label className="flex items-center text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={disperseMethod === 'disperseTokenSimple'}
                                onChange={toggleDisperseMethod}
                                className="form-checkbox h-4 w-4 mr-2 text-blue-600"
                            />
                            <span>Use simple token transfer method (requires less gas but more approvals)</span>
                        </label>
                    </div>
                )}

                <div className="flex items-center justify-between mt-8">
                    <button
                        type="submit"
                        disabled={isPending || isLoading}
                        className={`px-6 py-3 rounded-md font-semibold ${isPending || isLoading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#0052FF] text-white hover:bg-[#0049E5]"
                            }`}
                    >
                        {isLoading
                            ? "Processing..."
                            : `Disperse ${tokenData?.symbol || "Tokens"}`}
                    </button>

                    <div>
                        {isValid && preparedRecipients.length > 0 && (
                            <div className="text-sm text-gray-700">
                                Sending to {preparedRecipients.length} recipients
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {txHash && (
                <div className={`mt-6 p-4 rounded-md ${isConfirmed
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}>
                    <div className="font-medium mb-1">
                        {isConfirmed ? "Transaction Successful!" : "Transaction Submitted"}
                    </div>
                    <div className="text-sm break-all">
                        Transaction Hash: {txHash}
                    </div>
                    <a
                        href={`https://basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline mt-2 inline-block"
                    >
                        View on BaseScan
                    </a>
                </div>
            )}
        </div>
    );
} 