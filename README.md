# ShieldedLending

This website provides a minimal Midnight-style compact contract and a simple React frontend that demonstrates Lace wallet connectivity and local simulation flows.

Bash quick commands (copy-paste)

Prerequisites: Node.js v22+, git, and a working `compact` compiler if you plan to compile contracts.

If you prefer `npm` (WSL or other environments) you can use the equivalent `npm` commands shown below instead of `pnpm`.

Install `pnpm` (optional):

```bash
# optional - only if you want pnpm
npm install -g pnpm
```

Workspace install (root)

```bash
# from repo root
cd p2p-lending-midnight
pnpm install
```

Contract: compile & build

```bash
cd contract
# install contract-specific dependencies
pnpm install
# compile Compact circuits (requires `compact` CLI in PATH)
pnpm run compact
# copy/build artifacts
pnpm run build
```

Frontend: install & run dev server

```bash
cd ../frontend
pnpm install
pnpm dev
```

Quick local simulation (no Midnight node)

```bash
# Open the frontend in your browser (Vite prints the URL).
# Use the UI to: Connect Lace (optional), Generate Commitment, Register Commitment.
# Commitments are stored locally in localStorage['p2p_sim_ledger']
```

Real local deployment (requires Midnight node / providers)

1) Ensure a local Midnight node and proof provider are running. Follow Midnight docs for your runtime.

2) Compile & build the contract (see above).

3) Run the deploy template (fill TODOs in `contract/deploy-sample.ts` first):

```bash
# From workspace root
cd contract
# Option A: run using npx ts-node (installs ts-node temporarily if missing)
npx ts-node deploy-sample.ts
# Option B: install dev tooling then run
pnpm add -D ts-node typescript @types/node
npx ts-node deploy-sample.ts
```

Notes

- The `deploy-sample.ts` file is a template that shows where to wire `proofProvider`, `zkConfigProvider`, `publicDataProvider`, `privateStateProvider`, and `walletProvider`. See `../cli/src/api.ts` for a full example of provider wiring.
- If you want, I can auto-fill `deploy-sample.ts` for a specific local Midnight setup (provide endpoints).

Notes

- The compact contract here is simplified and demonstrates the register / create_loan_request / prove_credit_threshold circuits. For production, convert the single-slot ledgers into maps, implement robust identifier handling, and implement concrete parsing of `secret` inside the circuit so `prove_credit_threshold` can assert numeric comparisons.
- The frontend is intentionally minimal. If you want, I can wire it to the compiled contract using the same `MidnightDAppAPI` pattern from the original frontend, implement transaction submission, and provide deploy scripts for a specific Midnight testnet.
- ## 📖 Detailed Learning Guides

If you are new to Midnight, please read these files in order:
1.  **[What is this project?](./docs/OVERVIEW.md)** - Concepts of ZK and Privacy.
2.  **[How does the code work?](./docs/CONTRACT_GUIDE.md)** - A beginner's look at Compact.
3.  **[The UI Design](./docs/FRONTEND_GUIDE.md)** - Why the frontend looks and feels premium.
4.  **[Advanced Running](./docs/RUNNING.md)** - Complex setups and Testnet details.

---

## 🐞 Troubleshooting
- **Compiler Errors**: Ensure you have `compact` version `0.28.0` via `c
- Here is the preview of the website
- I have attached live demonstration video below

<img width=

https://github.com/user-attachments/assets/fa1b7d93-f16d-443a-a834-b79117b9ff51

"2879" height="1473" alt="Screenshot 2026-02-10 220912" src="https://github.com/user-attachments/assets/7d523541-a95a-4482-be14-23fbe2c5b950" />

