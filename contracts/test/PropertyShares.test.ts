import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MockUSDC, PropertyShares } from "../typechain-types";

const PROPERTY_SHARES_CONTRACT = "PropertyShares";

const PRICE_PER_SHARE = 100n * 10n ** 6n; // 100 mUSDC
const MINT_AMOUNT = 1_000_000n * 10n ** 6n; // 1,000,000 mUSDC
const MAX_UINT = ethers.MaxUint256;

async function deployFixture() {
  const [owner, manager, alice, bob, carol, outsider] = await ethers.getSigners();

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = (await MockUSDC.deploy()) as unknown as MockUSDC;
  await usdc.waitForDeployment();

  const PropertySharesFactory = await ethers.getContractFactory(PROPERTY_SHARES_CONTRACT);
  const shares = (await PropertySharesFactory.deploy(
    await usdc.getAddress(),
    manager.address,
    PRICE_PER_SHARE
  )) as unknown as PropertyShares;
  await shares.waitForDeployment();

  const sharesAddress = await shares.getAddress();

  for (const account of [manager, alice, bob, carol]) {
    await (await usdc.mint(account.address, MINT_AMOUNT)).wait();
    await (await usdc.connect(account).approve(sharesAddress, MAX_UINT)).wait();
  }

  return { usdc, shares, owner, manager, alice, bob, carol, outsider };
}

describe("PropertyShares", function () {
  describe("Deployment", function () {
    it("sets name, symbol, decimals, MAX_SUPPLY, manager, and price", async function () {
      const { shares, manager } = await loadFixture(deployFixture);

      expect(await shares.name()).to.equal("PropShare Main St");
      expect(await shares.symbol()).to.equal("PSMS");
      expect(await shares.decimals()).to.equal(0);
      expect(await shares.MAX_SUPPLY()).to.equal(1000n);
      expect(await shares.manager()).to.equal(manager.address);
      expect(await shares.pricePerShare()).to.equal(PRICE_PER_SHARE);
    });
  });

  describe("buyShares", function () {
    it("mints shares and charges the exact USDC cost", async function () {
      const { usdc, shares, alice } = await loadFixture(deployFixture);
      const amount = 10n;
      const cost = amount * PRICE_PER_SHARE;

      const aliceUsdcBefore = await usdc.balanceOf(alice.address);
      await shares.connect(alice).buyShares(amount);

      expect(await shares.balanceOf(alice.address)).to.equal(amount);
      expect(await shares.totalSupply()).to.equal(amount);
      expect(await usdc.balanceOf(alice.address)).to.equal(aliceUsdcBefore - cost);
      expect(await usdc.balanceOf(await shares.getAddress())).to.equal(cost);
    });

    it("emits SharesPurchased", async function () {
      const { shares, alice } = await loadFixture(deployFixture);
      const amount = 5n;
      const cost = amount * PRICE_PER_SHARE;

      await expect(shares.connect(alice).buyShares(amount))
        .to.emit(shares, "SharesPurchased")
        .withArgs(alice.address, amount, cost);
    });

    it("reverts ZeroAmount on 0", async function () {
      const { shares, alice } = await loadFixture(deployFixture);

      await expect(shares.connect(alice).buyShares(0n)).to.be.revertedWithCustomError(
        shares,
        "ZeroAmount"
      );
    });

    it("reverts ExceedsMaxSupply above 1000 in total", async function () {
      const { shares, alice, bob } = await loadFixture(deployFixture);

      await shares.connect(alice).buyShares(600n);
      await expect(shares.connect(bob).buyShares(401n)).to.be.revertedWithCustomError(
        shares,
        "ExceedsMaxSupply"
      );
    });
  });

  describe("depositRent", function () {
    it("reverts NotManager for non-managers", async function () {
      const { shares, alice } = await loadFixture(deployFixture);

      await expect(shares.connect(alice).depositRent(1000n * 10n ** 6n)).to.be.revertedWithCustomError(
        shares,
        "NotManager"
      );
    });

    it("reverts ZeroAmount", async function () {
      const { shares, manager } = await loadFixture(deployFixture);

      await expect(shares.connect(manager).depositRent(0n)).to.be.revertedWithCustomError(
        shares,
        "ZeroAmount"
      );
    });

    it("moves USDC into the contract and emits RentDeposited", async function () {
      const { usdc, shares, manager, alice } = await loadFixture(deployFixture);
      await shares.connect(alice).buyShares(100n);

      const amount = 1000n * 10n ** 6n;
      const sharesAddress = await shares.getAddress();
      const contractBefore = await usdc.balanceOf(sharesAddress);
      const managerBefore = await usdc.balanceOf(manager.address);

      await expect(shares.connect(manager).depositRent(amount))
        .to.emit(shares, "RentDeposited")
        .withArgs(amount);

      expect(await usdc.balanceOf(sharesAddress)).to.equal(contractBefore + amount);
      expect(await usdc.balanceOf(manager.address)).to.equal(managerBefore - amount);
    });
  });

  describe("claimRent pro-rata", function () {
    it("splits rent 600/400 and supports a one-time claim", async function () {
      const { usdc, shares, manager, alice, bob } = await loadFixture(deployFixture);

      await shares.connect(alice).buyShares(600n);
      await shares.connect(bob).buyShares(400n);

      const deposit = 1000n * 10n ** 6n;
      await shares.connect(manager).depositRent(deposit);

      expect(await shares.claimableRent(alice.address)).to.equal(600n * 10n ** 6n);
      expect(await shares.claimableRent(bob.address)).to.equal(400n * 10n ** 6n);

      const aliceUsdcBefore = await usdc.balanceOf(alice.address);
      await expect(shares.connect(alice).claimRent())
        .to.emit(shares, "RentClaimed")
        .withArgs(alice.address, 600n * 10n ** 6n);
      expect(await usdc.balanceOf(alice.address)).to.equal(aliceUsdcBefore + 600n * 10n ** 6n);

      const bobUsdcBefore = await usdc.balanceOf(bob.address);
      await expect(shares.connect(bob).claimRent())
        .to.emit(shares, "RentClaimed")
        .withArgs(bob.address, 400n * 10n ** 6n);
      expect(await usdc.balanceOf(bob.address)).to.equal(bobUsdcBefore + 400n * 10n ** 6n);

      await expect(shares.connect(alice).claimRent()).to.be.revertedWithCustomError(
        shares,
        "NothingToClaim"
      );
      await expect(shares.connect(bob).claimRent()).to.be.revertedWithCustomError(
        shares,
        "NothingToClaim"
      );
    });
  });

  describe("Transfer correctness", function () {
    it("keeps pre-transfer rent with sender; receiver earns only future deposits", async function () {
      const { shares, manager, alice, bob, carol } = await loadFixture(deployFixture);

      await shares.connect(alice).buyShares(600n);
      await shares.connect(bob).buyShares(400n);

      const deposit = 1000n * 10n ** 6n;
      await shares.connect(manager).depositRent(deposit);

      // alice transfers 300 to carol after the first deposit
      await shares.connect(alice).transfer(carol.address, 300n);

      await shares.connect(manager).depositRent(deposit);

      // alice: 600 from first + 300 from second = 900
      // bob:   400 from first + 400 from second = 800
      // carol: 0 from first   + 300 from second = 300
      expect(await shares.claimableRent(alice.address)).to.equal(900n * 10n ** 6n);
      expect(await shares.claimableRent(bob.address)).to.equal(800n * 10n ** 6n);
      expect(await shares.claimableRent(carol.address)).to.equal(300n * 10n ** 6n);
    });
  });

  describe("Late buyer", function () {
    it("does not earn rent from deposits before purchase", async function () {
      const { shares, manager, alice, bob, carol } = await loadFixture(deployFixture);

      await shares.connect(alice).buyShares(500n);
      await shares.connect(bob).buyShares(400n);

      const deposit = 1000n * 10n ** 6n;
      await shares.connect(manager).depositRent(deposit);

      expect(await shares.claimableRent(carol.address)).to.equal(0n);

      // Carol buys after the deposit — claimable stays 0 until the next deposit.
      await shares.connect(carol).buyShares(100n);
      expect(await shares.claimableRent(carol.address)).to.equal(0n);

      await shares.connect(manager).depositRent(deposit);
      // after next deposit: carol holds 100 / 1000 of 1000e6 = 100e6
      expect(await shares.claimableRent(carol.address)).to.equal(100n * 10n ** 6n);
    });
  });

  describe("Rounding", function () {
    it("never lets total claimed exceed the contract's USDC rent balance", async function () {
      const { usdc, shares, manager, alice, bob, carol } = await loadFixture(deployFixture);

      await shares.connect(alice).buyShares(333n);
      await shares.connect(bob).buyShares(333n);
      await shares.connect(carol).buyShares(334n);

      const deposit = 1000n * 10n ** 6n + 1n;
      await shares.connect(manager).depositRent(deposit);

      const sharesAddress = await shares.getAddress();
      // USDC in contract = purchase proceeds + rent. Track rent pool via claimables.
      const claimableAlice = await shares.claimableRent(alice.address);
      const claimableBob = await shares.claimableRent(bob.address);
      const claimableCarol = await shares.claimableRent(carol.address);
      const totalClaimable = claimableAlice + claimableBob + claimableCarol;

      expect(totalClaimable).to.be.lte(deposit);

      await shares.connect(alice).claimRent();
      await shares.connect(bob).claimRent();
      await shares.connect(carol).claimRent();

      // Remaining USDC must cover unclaimed purchase proceeds (1000 * price) plus any dust
      const remaining = await usdc.balanceOf(sharesAddress);
      const purchaseProceeds = 1000n * PRICE_PER_SHARE;
      expect(remaining).to.equal(purchaseProceeds + (deposit - totalClaimable));
      expect(claimableAlice + claimableBob + claimableCarol).to.be.lte(deposit);
    });
  });

  describe("Reentrancy", function () {
    it("allows claiming after multiple deposits (nonReentrant path works)", async function () {
      const { usdc, shares, manager, alice } = await loadFixture(deployFixture);

      await shares.connect(alice).buyShares(100n);

      const deposit = 100n * 10n ** 6n;
      await shares.connect(manager).depositRent(deposit);
      await shares.connect(manager).depositRent(deposit);
      await shares.connect(manager).depositRent(deposit);

      const expected = 300n * 10n ** 6n;
      expect(await shares.claimableRent(alice.address)).to.equal(expected);

      const before = await usdc.balanceOf(alice.address);
      await shares.connect(alice).claimRent();
      expect(await usdc.balanceOf(alice.address)).to.equal(before + expected);

      await expect(shares.connect(alice).claimRent()).to.be.revertedWithCustomError(
        shares,
        "NothingToClaim"
      );
    });
  });
});
