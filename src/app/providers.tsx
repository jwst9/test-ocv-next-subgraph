"use client";

import { TRPCReactProvider } from "~/trpc/react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { SessionProvider } from "next-auth/react";
import type { LayoutProps } from "./layout";
import { env } from "~/env";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "John Test",
  projectId: env.NEXT_PUBLIC_WALLET_CONNECY_PROJECT_ID,
  chains: [mainnet],
});

const Providers: React.FC<LayoutProps> = ({ children }) => (
  <TRPCReactProvider>
    <WagmiProvider config={config}>
      <SessionProvider>
        <RainbowKitSiweNextAuthProvider>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiProvider>
  </TRPCReactProvider>
);

export default Providers;
