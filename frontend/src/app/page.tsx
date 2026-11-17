"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { DeployBanner } from "@/components/DeployBanner";
import { PropertyCard } from "@/components/PropertyCard";
import { PositionCard } from "@/components/PositionCard";
import { BuySharesCard } from "@/components/BuySharesCard";
import { DepositRentCard } from "@/components/DepositRentCard";
import { ClaimRentButton } from "@/components/ClaimRentButton";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            PropShare Lite
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            Main St shares
          </h1>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </header>

      <DeployBanner />

      <div className="grid gap-4">
        <PropertyCard />
        <PositionCard />
        <BuySharesCard />
        <DepositRentCard />
        <ClaimRentButton />
      </div>
    </main>
  );
}
