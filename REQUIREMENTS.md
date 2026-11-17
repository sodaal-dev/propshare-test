# PropShare Lite — Candidate Requirements

This document is the source of truth for **what you must implement**.  
For how to install, run the chain, deploy, and open the app, see [README.md](./README.md).

---

## Goal

Complete the fractional property-share system so that:

1. Investors can **buy shares** with mUSDC.
2. The **manager** can **deposit rent**.
3. Holders can **claim** their pro-rata rent.
4. **Transfers** preserve rent already earned by the sender (receivers only earn from future deposits).
5. The **frontend** exposes those flows with clear transaction states.
6. **All existing tests pass**, and you document your approach.

Expected time: **2–4 hours**.

---

## Must implement — contracts

File: `contracts/contracts/PropertyShares.sol`

Replace each stub body (`revert("NOT_IMPLEMENTED")`) with correct logic.  
Do **not** remove the provided events, errors, modifiers, constructor, or `decimals()`.

### 1. `buyShares(uint256 amount)`

- Revert `ZeroAmount` if `amount == 0`.
- Revert `ExceedsMaxSupply` if `totalSupply() + amount > MAX_SUPPLY` (1000).
- Cost = `amount * pricePerShare` (mUSDC, 6 decimals).
- Pull `cost` mUSDC from `msg.sender` into the contract (`SafeERC20`).
- Mint `amount` shares to `msg.sender`.
- Emit `SharesPurchased(msg.sender, amount, cost)`.

### 2. `depositRent(uint256 amount)`

- Only callable by `manager` (modifier already applied).
- Revert `ZeroAmount` if `amount == 0`.
- Pull `amount` mUSDC from the manager into the contract.
- Credit rent so whoever held shares **at deposit time** can later claim their pro-rata share.
- Emit `RentDeposited(amount)`.

### 3. `claimRent()`

- Must be reentrancy-safe (`nonReentrant` is already on the function — keep it and use checks-effects-interactions).
- Compute the caller’s unclaimed rent; revert `NothingToClaim` if zero.
- Update accounting so the same rent cannot be claimed twice.
- Transfer mUSDC to `msg.sender`.
- Emit `RentClaimed(msg.sender, amount)`.

### 4. `claimableRent(address holder) view`

- Return the holder’s accrued but unclaimed rent in mUSDC base units.
- Must not modify state.

### 5. `_update(address from, address to, uint256 value)` override

- Keep the call to `super._update(from, to, value)`.
- Add accounting so:
  - Rent earned **before** a transfer stays with the **sender**.
  - The **receiver** only earns from deposits that happen **after** they receive the shares.
- Same idea applies to mint (buy): new shares must not inherit past rent.

**Hint (already in the contract):** a magnified “dividend-per-share” / accumulator pattern is a common approach. Design storage and corrections yourself — there is no reference solution in the repo.

---

## Must implement — frontend

Package: `frontend/`

Wire every `// TODO (candidate):` comment. Use the existing **Approve mUSDC** flow and `TxStatus` as the pattern for pending / success / error.

| Location | What to do |
| --- | --- |
| `PositionCard.tsx` | Read `claimableRent(address)` for the connected wallet; show formatted mUSDC (not `"—"`). Refresh after claim / deposit / buy / relevant transfers. |
| `BuySharesCard.tsx` | Call `buyShares(uint256 amount)` with the input; refresh share balance, `totalSupply`, mUSDC balance, and allowance. |
| `DepositRentCard.tsx` | Call `depositRent(uint256 amount)` (mUSDC base units, 6 decimals). Manager must have approved mUSDC. Refresh claimable rent and balances. |
| `ClaimRentButton.tsx` | Call `claimRent()`; refresh claimable rent and mUSDC balance. |

Already wired for you (do not break): Property reads, position balances, mUSDC approve, manager-only deposit card visibility, deploy banner when addresses are empty.

---

## Must implement — tests & notes

### Tests

```bash
npm run test
```

- **All existing tests** in `contracts/test/PropertyShares.test.ts` must pass.
- You may **add** new tests.
- You must **not modify** the existing test cases/assertions in that file.

Covered by the suite (for your awareness): deployment getters, buyShares success + errors, depositRent access + zero + transfer/event, pro-rata claim, **transfer correctness** (key), late buyer, rounding (total claimed ≤ rent deposited), claim after multiple deposits.

### Deliverables

1. GitHub repo link with your solution.
2. **`NOTES.md`** describing:
   - Approach (especially rent accounting and transfers)
   - Trade-offs
   - Security considerations: reentrancy, rounding/dust, access control, and anything else you thought about
   - Anything in the repo that looks unsafe to ship (unexpected bootstrap, remote/packed code, etc.) — call it out if you find it

---

## Optional bonus

Add a **whitelist** so only approved addresses can hold shares. Think through mint (`buyShares`), transfers, and who can update the whitelist.

---

## Rules

- Do not change existing tests (add-only).
- Do not rename/remove the public API candidates and tests rely on (`buyShares`, `depositRent`, `claimRent`, `claimableRent`, events, custom errors).
- AI tools are allowed; you must be able to explain your code.
