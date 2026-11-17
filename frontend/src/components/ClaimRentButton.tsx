"use client";

import { useAccount } from "wagmi";
import { isDeployed } from "@/lib/contracts";

export function ClaimRentButton() {
  const { isConnected } = useAccount();

  const onClaim = () => {
    // TODO (candidate): call claimRent() on PropertyShares, then refresh claimable rent
    // and the connected wallet's mUSDC balance.
    alert("Not implemented");
  };

  return (
    <section className="card">
      <h2 className="card-title">Claim rent</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Withdraw your accrued pro-rata rent in mUSDC.
      </p>
      <button
        type="button"
        className="btn mt-4"
        onClick={onClaim}
        disabled={!isConnected || !isDeployed}
      >
        Claim rent
      </button>
    </section>
  );
}
