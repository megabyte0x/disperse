import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

// frame preview metadata
const appName = process.env.NEXT_PUBLIC_FRAME_NAME || "Disperse App";
const splashImageUrl = `${appUrl}/splash.png`;
const iconUrl = `${appUrl}/icon.png`;

const framePreviewMetadata = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT || "Open Disperse",
    action: {
      type: "launch_frame",
      name: appName,
      url: appUrl,
      splashImageUrl,
      iconUrl,
      splashBackgroundColor: "#0052FF", // Base color
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: appName,
    openGraph: {
      title: appName,
      description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION || "Distribute ETH and tokens to multiple addresses in one transaction",
    },
    other: {
      "fc:frame": JSON.stringify(framePreviewMetadata),
    },
  };
}

export default function Home() {
  return (<App />);
}
