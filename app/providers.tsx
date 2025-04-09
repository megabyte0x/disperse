"use client";

import type { ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={baseSepolia}
      config={{
        appearance: {
          mode: "auto",
          theme: "snake",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
        wallet: {
          // No explicit wallet configuration needed - will use defaults including Coinbase Wallet
        },
      }}
      projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "your-project-id"}
      notificationProxyUrl="/api/notification"
    >
      {props.children}
    </MiniKitProvider>
  );
}
