"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { type Address, isAddress } from "viem";

interface TokenBalance {
    symbol: string;
    formatted: string;
    decimals: number;
    value: bigint;
}

interface TokenData {
    name: string;
    symbol: string;
    decimals: number;
    balance: TokenBalance | undefined;
}

interface TokenFieldProps {
    tokenAddress: string;
    onTokenAddressChange: (address: string) => void;
    onTokenDataChange: (data: TokenData) => void;
}

export default function TokenField({
    tokenAddress,
    onTokenAddressChange,
    onTokenDataChange,
}: TokenFieldProps) {
    const { address } = useAccount();
    const [isValidAddress, setIsValidAddress] = useState(false);

    // For the native token (ETH), we'll use a special address
    const nativeTokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const isNativeToken = tokenAddress === nativeTokenAddress || tokenAddress === "";

    // Get token balance
    const { data: tokenBalance } = useBalance({
        address,
        token: !isNativeToken && isValidAddress ? (tokenAddress as Address) : undefined,
    });

    // Get native token balance
    const { data: nativeBalance } = useBalance({
        address,
    });

    // Validate token address
    useEffect(() => {
        if (isNativeToken) {
            setIsValidAddress(false);

            // Pass token data to parent
            onTokenDataChange({
                name: "Base",
                symbol: nativeBalance?.symbol || "ETH",
                decimals: 18,
                balance: nativeBalance,
            });
            return;
        }

        const valid = isAddress(tokenAddress as Address);
        setIsValidAddress(valid);

        if (valid && tokenBalance) {
            // Pass token data to parent
            onTokenDataChange({
                name: tokenBalance.symbol,
                symbol: tokenBalance.symbol,
                decimals: 18, // Default to 18, would need contract call to get actual decimals
                balance: tokenBalance,
            });
        }
    }, [tokenAddress, tokenBalance, nativeBalance, isNativeToken, onTokenDataChange]);

    const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTokenAddressChange(e.target.value);
    };

    const handleNativeTokenSelect = () => {
        onTokenAddressChange(nativeTokenAddress);
    };

    return (
        <div className="mb-6">
            <label htmlFor="token-address" className="block text-gray-700 text-sm font-medium mb-2">
                Token Address (Leave blank for {nativeBalance?.symbol || "ETH"})
            </label>
            <div className="flex">
                <div className="relative flex-grow">
                    <input
                        id="token-address"
                        type="text"
                        value={tokenAddress === nativeTokenAddress ? "" : tokenAddress}
                        onChange={handleTokenChange}
                        placeholder="0x..."
                        className={`w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 ${tokenAddress && !isValidAddress && tokenAddress !== nativeTokenAddress
                                ? "border-red-300 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                    />
                    {tokenAddress && !isNativeToken && !isValidAddress && (
                        <div className="text-red-500 text-xs mt-1">
                            Please enter a valid token address
                        </div>
                    )}
                    {isValidAddress && tokenBalance && (
                        <div className="text-green-600 text-xs mt-1">
                            Token: {tokenBalance.symbol} • Balance: {Number.parseFloat(tokenBalance.formatted).toFixed(4)}
                        </div>
                    )}
                    {isNativeToken && nativeBalance && (
                        <div className="text-green-600 text-xs mt-1">
                            Token: {nativeBalance.symbol} • Balance: {Number.parseFloat(nativeBalance.formatted).toFixed(4)}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleNativeTokenSelect}
                    className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-r-md hover:bg-gray-200"
                >
                    Use {nativeBalance?.symbol || "ETH"}
                </button>
            </div>
        </div>
    );
} 