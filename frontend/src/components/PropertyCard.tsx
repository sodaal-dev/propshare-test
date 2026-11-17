"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  isDeployed,
  sharesAddress,
  sharesAbi,
  deployments,
} from "@/lib/contracts";

export function PropertyCard() {
  const enabled = isDeployed && Boolean(sharesAddress);

  const { data: name } = useReadContract({
    address: sharesAddress,
    abi: sharesAbi,
    functionName: "name",
    query: { enabled },
  });

  const { data: pricePerShare } = useReadContract({
    address: sharesAddress,
    abi: sharesAbi,
    functionName: "pricePerShare",
    query: { enabled },
  });

  const { data: totalSupply } = useReadContract({
    address: sharesAddress,
    abi: sharesAbi,
    functionName: "totalSupply",
    query: { enabled },
  });

  const price =
    pricePerShare !== undefined
      ? formatUnits(pricePerShare as bigint, 6)
      : formatUnits(BigInt(deployments.pricePerShare || "0"), 6);

  const sold = totalSupply !== undefined ? (totalSupply as bigint).toString() : "—";

  return (
    <section className="card">
      <h2 className="card-title">Property</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[var(--muted)]">Name</dt>
          <dd className="font-medium">{(name as string) ?? "—"}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[var(--muted)]">Price per share</dt>
          <dd className="font-medium">{price} mUSDC</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[var(--muted)]">Shares sold</dt>
          <dd className="font-medium">
            {sold} / 1000
          </dd>
        </div>
      </dl>
    </section>
  );
}
