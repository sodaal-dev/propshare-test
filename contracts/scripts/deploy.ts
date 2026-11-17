import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer, manager, ...rest] = await ethers.getSigners();
  const recipients = [deployer, manager, ...rest].slice(0, 5);

  console.log("Deployer:", deployer.address);
  console.log("Manager:", manager.address);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("MockUSDC:", usdcAddress);

  const pricePerShare = 100n * 10n ** 6n; // 100 mUSDC
  const PropertyShares = await ethers.getContractFactory("PropertyShares");
  const shares = await PropertyShares.deploy(usdcAddress, manager.address, pricePerShare);
  await shares.waitForDeployment();
  const sharesAddress = await shares.getAddress();
  console.log("PropertyShares:", sharesAddress);

  const mintAmount = 1_000_000n * 10n ** 6n; // 1,000,000 mUSDC
  for (const account of recipients) {
    const tx = await usdc.mint(account.address, mintAmount);
    await tx.wait();
    console.log(`Minted 1,000,000 mUSDC to ${account.address}`);
  }

  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const usdcArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, "MockUSDC.sol", "MockUSDC.json"), "utf8")
  );
  const sharesArtifact = JSON.parse(
    fs.readFileSync(
      path.join(artifactsDir, "PropertyShares.sol", "PropertyShares.json"),
      "utf8"
    )
  );

  const deployments = {
    chainId: 31337,
    MockUSDC: {
      address: usdcAddress,
      abi: usdcArtifact.abi,
    },
    PropertyShares: {
      address: sharesAddress,
      abi: sharesArtifact.abi,
    },
    manager: manager.address,
    pricePerShare: pricePerShare.toString(),
  };

  const outDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deployments, null, 2));
  console.log("Wrote", outPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
