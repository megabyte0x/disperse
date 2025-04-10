"use client";

import dynamic from "next/dynamic";


// note: dynamic import is required for components that use the Frame SDK
const Disperse = dynamic(() => import("~/components/Disperse"), {
  ssr: false,
});

export default function App() {
  return <Disperse />;
}
