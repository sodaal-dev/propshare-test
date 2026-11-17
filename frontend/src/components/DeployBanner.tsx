"use client";

import { isDeployed } from "@/lib/contracts";

export function DeployBanner() {
  if (isDeployed) return null;

  return (
    <div
      className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="status"
    >
      Run npm run deploy:local first
    </div>
  );
}
