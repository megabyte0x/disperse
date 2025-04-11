import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import type { SearchedUser } from '@neynar/nodejs-sdk/build/api';

let neynarClient: NeynarAPIClient | null = null;

// Example usage:
// const client = getNeynarClient();
// const user = await client.lookupUserByFid(fid); 
export function getNeynarClient() {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY not configured');
    }
    const config = new Configuration({ apiKey });
    neynarClient = new NeynarAPIClient(config);
  }
  return neynarClient;
}

type SendFrameNotificationResult =
  | {
    state: "error";
    error: unknown;
  }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export async function sendNeynarFrameNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendFrameNotificationResult> {
  try {
    const client = getNeynarClient();
    const targetFids = [fid];
    const notification = {
      title,
      body,
      target_url: process.env.NEXT_PUBLIC_URL || 'https://disperse.megabyte0x.xyz',
    };

    const result = await client.publishFrameNotifications({
      targetFids,
      notification
    });

    if (result.notification_deliveries.length > 0) {
      return { state: "success" };
    }
    if (result.notification_deliveries.length === 0) {
      return { state: "no_token" };
    }
    return { state: "error", error: result || "Unknown error" };
  } catch (error) {
    return { state: "error", error };
  }
}

export async function searchUser(query: string): Promise<SearchedUser[]> {
  const client = getNeynarClient();
  let users: SearchedUser[] = [];
  try {
    const result = await client.searchUser({ q: query, limit: 5 });
    users = result.result.users;
  } catch (error) {
    console.error('Error searching users:', error);
  }
  return users;
}