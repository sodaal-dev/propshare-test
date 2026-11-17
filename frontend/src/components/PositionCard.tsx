"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  isDeployed,
  usdcAddress,
  usdcAbi,
  sharesAddress,
  sharesAbi,
} from "@/lib/contracts";

export function PositionCard() {
  const { address, isConnected } = useAccount();
  const enabled = isDeployed && isConnected && Boolean(address);

  const { data: usdcBalance } = useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: enabled && Boolean(usdcAddress) },
  });

  const { data: shareBalance } = useReadContract({
    address: sharesAddress,
    abi: sharesAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: enabled && Boolean(sharesAddress) },
  });

  // TODO (candidate): call claimableRent(address) for the connected wallet and
  // display the formatted mUSDC amount; refresh after claimRent / depositRent / buyShares / transfers.
  const claimableDisplay = "—";

  return (
    <section className="card">
      <h2 className="card-title">Your position</h2>
      {!isConnected ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Connect a wallet to see balances.</p>
      ) : (
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[var(--muted)]">mUSDC balance</dt>
            <dd className="font-medium">
              {usdcBalance !== undefined
                ? `${formatUnits(usdcBalance as bigint, 6)} mUSDC`
                : "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[var(--muted)]">Share balance</dt>
            <dd className="font-medium">
              {shareBalance !== undefined ? (shareBalance as bigint).toString() : "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[var(--muted)]">Claimable rent</dt>
            <dd className="font-medium">{claimableDisplay}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
