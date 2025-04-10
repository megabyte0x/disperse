import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Disperse App";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0052FF", // Base blue
          color: "white",
          fontSize: 48,
          fontWeight: 600,
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" rx="100" fill="white" />
            <path d="M100 50C72.3858 50 50 72.3858 50 100C50 127.614 72.3858 150 100 150C127.614 150 150 127.614 150 100C150 72.3858 127.614 50 100 50Z" fill="#0052FF" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ marginBottom: 10 }}>Disperse App</div>
          <div style={{ fontSize: 24 }}>Distribute ETH and tokens efficiently</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
