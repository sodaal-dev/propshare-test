"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, maxUint256 } from "viem";
import { TxStatus } from "@/components/TxStatus";
import {
  isDeployed,
  usdcAddress,
  usdcAbi,
  sharesAddress,
  sharesAbi,
} from "@/lib/contracts";

export function BuySharesCard() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("1");

  const enabled = isDeployed && isConnected && Boolean(address);

  const { data: pricePerShare, refetch: refetchPrice } = useReadContract({
    address: sharesAddress,
    abi: sharesAbi,
    functionName: "pricePerShare",
    query: { enabled: enabled && Boolean(sharesAddress) },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress,
    abi: usdcAbi,
    functionName: "allowance",
    args: address && sharesAddress ? [address, sharesAddress] : undefined,
    query: { enabled: enabled && Boolean(usdcAddress) && Boolean(sharesAddress) },
  });

  const {
    writeContract,
    data: approveHash,
    isPending: isApprovePending,
    isError: isApproveWriteError,
    error: approveWriteError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess,
    isError: isApproveReceiptError,
    error: approveReceiptError,
  } = useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    if (isApproveSuccess) {
      void refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  const shareCount = BigInt(amount || "0");
  const cost =
    pricePerShare !== undefined ? shareCount * (pricePerShare as bigint) : 0n;
  const needsApproval =
    allowance !== undefined && cost > 0n && (allowance as bigint) < cost;

  const onApprove = () => {
    if (!usdcAddress || !sharesAddress) return;
    resetApprove();
    writeContract({
      address: usdcAddress,
      abi: usdcAbi,
      functionName: "approve",
      args: [sharesAddress, maxUint256],
    });
  };

  const onBuy = () => {
    // TODO (candidate): call buyShares(uint256 amount) on PropertyShares with the
    // input amount, then refresh share balance, totalSupply, mUSDC balance, and allowance.
    void refetchPrice();
    alert("Not implemented");
  };

  return (
    <section className="card">
      <h2 className="card-title">Buy shares</h2>
      <div className="mt-4 space-y-3">
        <label className="block text-sm text-[var(--muted)]">
          Amount
          <input
            className="field mt-1"
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isConnected || !isDeployed}
          />
        </label>
        <p className="text-xs text-[var(--muted)]">
          Cost:{" "}
          {pricePerShare !== undefined ? `${formatUnits(cost, 6)} mUSDC` : "—"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={onApprove}
            disabled={!isConnected || !isDeployed || isApprovePending || isApproveConfirming}
          >
            {needsApproval ? "Approve mUSDC" : "Approve mUSDC (max)"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={onBuy}
            disabled={!isConnected || !isDeployed || shareCount === 0n}
          >
            Buy
          </button>
        </div>
        <TxStatus
          isPending={isApprovePending}
          isConfirming={isApproveConfirming}
          isSuccess={isApproveSuccess}
          isError={isApproveWriteError || isApproveReceiptError}
          errorMessage={
            (approveWriteError ?? approveReceiptError)?.message ?? "Approve failed"
          }
          successMessage="mUSDC approved"
        />
      </div>
    </section>
  );
}
