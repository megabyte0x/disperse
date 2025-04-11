import { NeynarContextProvider } from "@neynar/react";

const NEYNAR_CLIENT_ID = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

export function NeynarProvider({ children }: { children: React.ReactNode }) {

    if (!NEYNAR_CLIENT_ID) {
        throw new Error("NEXT_PUBLIC_NEYNAR_CLIENT_ID is not set");
    }

    return (
        <NeynarContextProvider settings={{
            clientId: NEYNAR_CLIENT_ID
        }}>
            {children}
        </NeynarContextProvider>
    );
} 