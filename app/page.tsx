"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import DisperseForms from "./components/DisperseForms";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";


export default function DispersePage() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const addFrame = useAddFrame();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#0052FF] bg-opacity-5 text-[#0F1419]">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/base-logo.svg" alt="Base Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Disperse</h1>
          </div>
          <div className="flex items-center space-x-4">
            {context && !context.client.added && (
              <button
                type="button"
                onClick={handleAddFrame}
                className="cursor-pointer bg-[#0052FF] text-white px-4 py-2 rounded-md font-semibold text-sm"
              >
                Save Frame
              </button>
            )}
            {frameAdded && (
              <div className="flex items-center space-x-1 text-sm font-semibold text-green-600">
                <span>✓ Frame Saved</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Disperse Tokens</h2>
          {isConnected ? (
            <DisperseForms />
          ) : (
            <div className="text-center py-10">
              <p className="text-lg mb-4">Connect your wallet to use Disperse</p>
              <Wallet>
                <ConnectWallet >
                  <Avatar />
                  <Name />
                </ConnectWallet>
              </Wallet>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white p-4 shadow-inner">
        <div className="container mx-auto text-center text-sm text-gray-600">
          <p>Built on Base with ❤️</p>
        </div>
      </footer>
    </div>
  );
}
