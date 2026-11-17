"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { hardhat } from "wagmi/chains";

const hardhatLocal = {
  ...hardhat,
  id: 31337,
  name: "Hardhat Local",
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: "PropShare Lite",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "00000000000000000000000000000000",
  chains: [hardhatLocal],
  transports: {
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
