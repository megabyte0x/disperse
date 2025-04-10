"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getBalance } from "@wagmi/core";
import { config } from "../components/providers/WagmiProvider";
import { Label } from "~/components/ui/label";

interface TokenBalanceProps {
    token: string;
    tokenAddress?: string;
}

export default function TokenBalance({ token, tokenAddress }: TokenBalanceProps) {
    const { address, isConnected } = useAccount();
    const [balance, setBalance] = useState<{
        formatted: string;
        symbol: string;
        value: bigint;
        decimals: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!isConnected || !address) return;

            setIsLoading(true);
            setError(null);

            try {
                if (token === "eth") {
                    // Fetch native ETH balance
                    const result = await getBalance(config, {
                        address: address as `0x${string}`,
                    });
                    setBalance(result);
                } else if (token === "token" && tokenAddress) {
                    // Fetch ERC20 token balance
                    const result = await getBalance(config, {
                        address: address as `0x${string}`,
                        token: tokenAddress as `0x${string}`,
                    });
                    setBalance(result);
                }
            } catch (err) {
                console.error("Error fetching balance:", err);
                setError("Failed to fetch balance");
                setBalance(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalance();
    }, [address, isConnected, token, tokenAddress]);

    if (!isConnected) return null;

    return (
        <div className="mb-4">
            <Label>Balance</Label>
            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                {isLoading ? (
                    <div className="text-gray-500">Loading balance...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : balance ? (
                    <div>
                        {balance.formatted} {balance.symbol}
                    </div>
                ) : token === "token" && !tokenAddress ? (
                    <div className="text-gray-500">Enter token address to view balance</div>
                ) : (
                    <div className="text-gray-500">Not available</div>
                )}
            </div>
        </div>
    );
} 