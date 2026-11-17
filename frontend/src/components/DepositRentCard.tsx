"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { isDeployed, managerAddress } from "@/lib/contracts";

export function DepositRentCard() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("1000");

  const isManager =
    isConnected &&
    Boolean(address) &&
    Boolean(managerAddress) &&
    address?.toLowerCase() === managerAddress?.toLowerCase();

  if (!isManager) return null;

  const onDeposit = () => {
    // TODO (candidate): call depositRent(uint256 amount) on PropertyShares (amount in
    // mUSDC base units, 6 decimals). Ensure the manager has approved mUSDC first.
    // After success, refresh claimable rent for holders and the contract/manager balances.
    alert("Not implemented");
  };

  return (
    <section className="card">
      <h2 className="card-title">Manager: deposit rent</h2>
      <div className="mt-4 space-y-3">
        <label className="block text-sm text-[var(--muted)]">
          Amount (mUSDC)
          <input
            className="field mt-1"
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isDeployed}
          />
        </label>
        <button
          type="button"
          className="btn"
          onClick={onDeposit}
          disabled={!isDeployed}
        >
          Deposit rent
        </button>
      </div>
    </section>
  );
}
