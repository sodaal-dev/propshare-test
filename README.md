# PropShare Lite

Hiring test template: tokenize one property into ERC-20 shares, sell them for mock USDC, and distribute rent pro-rata.

**Implementation requirements:** see [REQUIREMENTS.md](./REQUIREMENTS.md) (what to build).  
**This README:** how to install, run, and use the local stack.

## Scenario

A single property is represented by **1,000** `PropertyShares` tokens (`PSMS`, 0 decimals). Investors buy shares with **Mock USDC** (`mUSDC`, 6 decimals) at a fixed price. A **manager** deposits rent in mUSDC. Holders claim their share of rent based on how many shares they held when each deposit landed — transfers must not move rent already earned.

## Prerequisites

- Node.js **20+**
- MetaMask (or another injected wallet)
- A [WalletConnect Cloud](https://cloud.walletconnect.com) project id (optional for local injected wallets; still set in `.env`)

## Setup

```bash
npm install
```

Copy the frontend env example and set a WalletConnect project id (placeholder is fine for local MetaMask):

```bash
# macOS / Linux
cp frontend/.env.example frontend/.env.local

# Windows (PowerShell)
Copy-Item frontend/.env.example frontend/.env.local
```

A placeholder `NEXT_PUBLIC_WC_PROJECT_ID` is enough for MetaMask on localhost.

Run **three terminals** from the repo root, in this order:

```bash
# Terminal 1 — local chain (leave running)
npm run chain

# Terminal 2 — deploy contracts + write frontend/src/contracts/deployments.json
npm run deploy

# Terminal 3 — Next.js app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If addresses are empty you will see: **Run npm run deploy:local first** (run `npm run deploy` with the chain up).

**Important:** every time you restart `npm run chain`, chain state resets — run `npm run deploy` again, and in MetaMask use “Clear activity tab data” (or reset the account) if transactions get stuck on a bad nonce.

### MetaMask: local network

Add a network:

| Field | Value |
| --- | --- |
| Network name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency symbol | `ETH` |

### MetaMask: import Hardhat accounts

Hardhat exposes well-known test keys. Import accounts **#0–#4** (Settings → Security & privacy → Import account → private key).

Default Hardhat mnemonic: `test test test test test test test test test test test junk`

| Account | Role | Address (default Hardhat) |
| --- | --- | --- |
| #0 | Deployer / owner | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| #1 | **Manager** (can `depositRent`) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| #2 | Alice (investor) | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| #3 | Bob (investor) | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` |
| #4 | Carol (investor) | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` |

Private keys (local test only — never use on mainnet):

```
#0  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
#1  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
#2  0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
#3  0x7c852118294e51e653532a3d99f14762bfe89b5fe848fd6c37f91e6e9a2e0b3c
#4  0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

After `npm run deploy`, each of these accounts has **1,000,000 mUSDC**. Connect with account #1 to see the manager deposit UI.

## What to implement

Full task list, acceptance criteria, frontend TODOs, deliverables, bonus, and evaluation criteria: **[REQUIREMENTS.md](./REQUIREMENTS.md)**.

Quick check after you finish contracts:

```bash
npm run test   # all existing tests must pass
```

## Useful scripts

| Script | Description |
| --- | --- |
| `npm run chain` | Start Hardhat node |
| `npm run deploy` | Deploy to localhost and refresh `deployments.json` |
| `npm run dev` | Start the frontend |
| `npm run test` | Run contract tests |
| `npm run compile` | Compile Solidity |
| `npm run build` | Production build of the frontend |
