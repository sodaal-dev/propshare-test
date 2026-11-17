import type { Address, Abi } from "viem";
import deploymentsJson from "@/contracts/deployments.json";

export type Deployments = {
  chainId: number;
  MockUSDC: { address: string; abi: Abi };
  PropertyShares: { address: string; abi: Abi };
  manager: string;
  pricePerShare: string;
};

export const deployments = deploymentsJson as Deployments;

export const isDeployed =
  Boolean(deployments.MockUSDC.address) &&
  Boolean(deployments.PropertyShares.address);

export const usdcAddress = (deployments.MockUSDC.address || undefined) as
  | Address
  | undefined;
export const sharesAddress = (deployments.PropertyShares.address || undefined) as
  | Address
  | undefined;
export const managerAddress = (deployments.manager || undefined) as
  | Address
  | undefined;

export const usdcAbi = deployments.MockUSDC.abi;
export const sharesAbi = deployments.PropertyShares.abi;
