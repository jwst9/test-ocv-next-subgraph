"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "~/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";
import type { LayoutProps } from "../layout";
import Image from "next/image";

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  const { mutateAsync: signout, isPending } = useMutation({
    mutationFn: () => signOut({ redirect: false }),
  });

  const { isConnected } = useAccount();

  return (
    <div className="flex h-screen flex-col gap-4 p-4 sm:flex-row">
      <div className="flex w-full flex-row justify-between gap-4 sm:w-48 sm:flex-col">
        <ConnectButton showBalance={false} />
        <div className="hidden space-y-12 sm:block">
          <Image
            src="https://cryptologos.cc/logos/uniswap-uni-logo.png"
            alt="uniswap-logo"
            className="m-auto"
            width={128}
            height={128}
          />
          <Image
            src="https://cryptologos.cc/logos/pancakeswap-cake-logo.png"
            alt="pancakeswap-logo"
            className="m-auto"
            width={128}
            height={128}
          />
        </div>
        <Button
          onClick={() => signout().then(() => router.push("/signin"))}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign out
        </Button>
      </div>
      {isConnected ? (
        <div className="flex-1">{children}</div>
      ) : (
        <div className="flex flex-1">
          <span className="m-auto">Connect your wallet</span>
        </div>
      )}
    </div>
  );
};

export default Layout;
