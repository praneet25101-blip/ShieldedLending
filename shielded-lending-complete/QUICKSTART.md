# 🚀 Quick Start Guide - ShieldedLending

Get up and running in 10 minutes!

## Prerequisites (5 min)

### 1. Install Compact Compiler
```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

source $HOME/.local/bin/env
compact --version
```

### 2. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop/

### 3. Install Lace Wallet
Chrome extension: https://www.lace.io/

## Setup (5 min)

### 1. Start Proof Server (Terminal 1)
```bash
docker run -p 6300:6300 midnightnetwork/proof-server -- \
  'midnight-proof-server --network testnet'
```

Keep this running!

### 2. Compile Contract (Terminal 2)
```bash
cd shielded-lending-complete/contract
compact compile ShieldedLending.compact build/
```

### 3. Start UI (Same terminal)
```bash
cd ../ui
npm install
npm run dev
```

## Using the App

### Open in Browser
http://localhost:3000

### Connect Wallet
1. Click "Connect Wallet"
2. Approve Lace connection
3. Get testnet tokens: https://midnight.network/test-faucet/

### Try It Out

**As a Borrower:**
1. Go to "Credit Proof" → Submit proof
2. Go to "Borrow" → Create loan request
3. Wait for funding
4. "My Loans" → Repay when ready

**As a Lender:**
1. Go to "Lend" → Browse loans
2. Fund a loan you like
3. "My Loans" → Track your investments

## That's It! 🎉

Your privacy-preserving lending platform is running!

## Troubleshooting

**Proof server won't start?**
```bash
docker ps  # Check if running
# Restart Docker Desktop
```

**Compact not found?**
```bash
source $HOME/.local/bin/env
# Or add to ~/.bashrc:
export PATH="$HOME/.local/bin:$PATH"
```

**UI won't load?**
```bash
cd ui
rm -rf node_modules
npm install
npm run dev
```

## Need Help?

- 📚 Full README: See README.md
- 💬 Discord: https://discord.com/invite/midnightnetwork
- 📖 Docs: https://docs.midnight.network
