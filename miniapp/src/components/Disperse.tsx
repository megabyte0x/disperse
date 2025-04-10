"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useDisconnect, useConnect, useSwitchChain, useChainId } from "wagmi";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import { base } from "wagmi/chains";
import { useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import sdk from "@farcaster/frame-sdk";

import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "~/lib/constants";

export default function Disperse() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { disconnect } = useDisconnect();
    const { connect, connectors } = useConnect();
    const { switchChain } = useSwitchChain();

    const [inputText, setInputText] = useState("");
    const [token, setToken] = useState("eth");
    const [tokenAddress, setTokenAddress] = useState("");
    const [amountSum, setAmountSum] = useState(0n);
    const [recipients, setRecipients] = useState<{ address: string; amount: bigint }[]>([]);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);

    const {
        sendTransaction,
        isPending: isSendTxPending,
    } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash: txHash as `0x${string}`,
        });

    // Initialize SDK and check if it's loaded
    useEffect(() => {
        const checkSDK = async () => {
            try {
                // The SDK's ready function will resolve when the SDK is loaded
                await sdk.actions.ready();
                setIsSDKLoaded(true);
            } catch (error) {
                console.error("Error initializing SDK:", error);
                setIsSDKLoaded(false);
            }
        };

        checkSDK();
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);

        // Parse the input text to get recipients and amounts
        try {
            const lines = e.target.value.split('\n').filter(line => line.trim());
            const parsedRecipients = lines.map(line => {
                const [address, amountStr] = line.split(/[,\s]+/).filter(Boolean);

                if (!address || !amountStr) {
                    throw new Error(`Invalid line: ${line}`);
                }

                // Basic address validation
                if (!address.startsWith('0x') || address.length !== 42) {
                    throw new Error(`Invalid Ethereum address: ${address}`);
                }

                // Parse amount
                const amount = parseUnits(amountStr, 18); // Assuming 18 decimals
                return { address, amount };
            });

            const sum = parsedRecipients.reduce((acc, { amount }) => acc + amount, 0n);
            setAmountSum(sum);
            setRecipients(parsedRecipients);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
            setRecipients([]);
            setAmountSum(0n);
        }
    }, []);

    const handleTokenChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setToken(e.target.value);
    }, []);

    const handleTokenAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTokenAddress(e.target.value);
    }, []);

    const handleDisperseEth = useCallback(() => {
        if (!isConnected || recipients.length === 0) return;

        try {
            const addresses = recipients.map(r => r.address as `0x${string}`);
            const amounts = recipients.map(r => r.amount);

            // Encode function call for disperseEther
            const data = encodeFunctionData({
                abi: CONTRACT_ABI,
                functionName: 'disperseEther',
                args: [addresses, amounts]
            });

            sendTransaction(
                {
                    to: CONTRACT_ADDRESS as `0x${string}`,
                    data,
                    value: amountSum,
                },
                {
                    onSuccess: (hash) => {
                        setTxHash(hash);
                    },
                }
            );
        } catch (err) {
            setError((err as Error).message);
        }
    }, [isConnected, recipients, amountSum, sendTransaction]);

    const handleDisperseToken = useCallback(() => {
        if (!isConnected || recipients.length === 0 || !tokenAddress) return;

        try {
            const addresses = recipients.map(r => r.address as `0x${string}`);
            const amounts = recipients.map(r => r.amount);

            // Encode function call for disperseToken
            const data = encodeFunctionData({
                abi: CONTRACT_ABI,
                functionName: 'disperseToken',
                args: [tokenAddress as `0x${string}`, addresses, amounts]
            });

            sendTransaction(
                {
                    to: CONTRACT_ADDRESS as `0x${string}`,
                    data,
                },
                {
                    onSuccess: (hash) => {
                        setTxHash(hash);
                    },
                }
            );
        } catch (err) {
            setError((err as Error).message);
        }
    }, [isConnected, recipients, tokenAddress, sendTransaction]);

    const connectWallet = useCallback(() => {
        connect({ connector: connectors[0] });
    }, [connect, connectors]);

    const switchToBase = useCallback(() => {
        switchChain({ chainId: base.id });
    }, [switchChain]);

    if (!isSDKLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-[300px] mx-auto py-2 px-2">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-center mb-4">Disperse</h1>
                <p className="text-center text-sm mb-4">
                    Distribute ETH or tokens to multiple addresses
                </p>
            </div>

            {!isConnected ? (
                <div className="mb-4">
                    <Button onClick={connectWallet} className="w-full">
                        Connect Wallet
                    </Button>
                </div>
            ) : chainId !== base.id ? (
                <div className="mb-4">
                    <Button onClick={switchToBase} className="w-full">
                        Switch to Base
                    </Button>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span>Connected: {truncateAddress(address || '')}</span>
                            <Button
                                onClick={() => disconnect()}
                                className="text-xs px-2 py-1"
                            >
                                Disconnect
                            </Button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="token-select">Token</Label>
                        <div className="flex gap-2 mt-1">
                            <select
                                id="token-select"
                                value={token}
                                onChange={handleTokenChange}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="eth">ETH</option>
                                <option value="token">ERC20 Token</option>
                            </select>
                        </div>
                    </div>

                    {token === 'token' && (
                        <div className="mb-4">
                            <Label htmlFor="token-address">Token Address</Label>
                            <Input
                                id="token-address"
                                type="text"
                                placeholder="0x..."
                                value={tokenAddress}
                                onChange={handleTokenAddressChange}
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <Label htmlFor="recipients">
                            Addresses with Amounts
                            <span className="text-xs ml-1 text-gray-500">(one per line)</span>
                        </Label>
                        <textarea
                            id="recipients"
                            className="flex h-40 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0xAddress1 1.5&#10;0xAddress2 2.3&#10;..."
                            value={inputText}
                            onChange={handleInputChange}
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-1">{error}</p>
                        )}
                        {amountSum > 0n && (
                            <p className="text-xs mt-1">
                                Total: {formatUnits(amountSum, 18)} {token === 'eth' ? 'ETH' : 'Tokens'}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <Button
                            onClick={token === 'eth' ? handleDisperseEth : handleDisperseToken}
                            className="w-full"
                            disabled={recipients.length === 0 || isSendTxPending || isConfirming}
                        >
                            {isSendTxPending || isConfirming ? 'Processing...' : 'Disperse'}
                        </Button>
                    </div>

                    {txHash && (
                        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-xs">
                                Transaction:
                                <a
                                    href={`https://base.blockscout.com/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 ml-1 break-all"
                                >
                                    {txHash}
                                </a>
                            </p>
                            <p className="text-xs mt-1">
                                Status: {isConfirming ? 'Confirming...' : isConfirmed ? 'Confirmed!' : 'Pending'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 