# ShieldedLending - Complete Full-Stack Project

A privacy-preserving P2P lending platform built on Midnight Network with a modern React UI.

## 🌟 Features

### Smart Contract (Compact)
- ✅ Zero-knowledge credit proofs
- ✅ Privacy-preserving loan requests
- ✅ Automated collateral management
- ✅ Borrower identity protection
- ✅ Reputation tracking (private)

### UI (React + TypeScript)
- ✅ Modern, responsive design
- ✅ Wallet integration (Lace wallet)
- ✅ Browse and fund loans
- ✅ Create loan requests
- ✅ Manage your loans
- ✅ Submit credit proofs
- ✅ Real-time status updates

## 📁 Project Structure

```
shielded-lending-complete/
├── contract/
│   └── ShieldedLending.compact      # Smart contract
├── ui/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Header.tsx
│   │   │   └── Tabs.tsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BorrowPage.tsx
│   │   │   ├── LendPage.tsx
│   │   │   ├── MyLoansPage.tsx
│   │   │   └── CreditProofPage.tsx
│   │   ├── store/                   # State management
│   │   │   └── walletStore.ts
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
└── scripts/
    └── deploy.sh
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** and npm
2. **Docker** (for proof server)
3. **Compact compiler** installed
4. **Lace wallet** browser extension

### Step 1: Install Compact Compiler

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

# Update PATH
source $HOME/.local/bin/env

# Verify
compact --version
```

### Step 2: Start Proof Server

Open a new terminal and run:

```bash
docker run -p 6300:6300 midnightnetwork/proof-server -- \
  'midnight-proof-server --network testnet'
```

Keep this running in the background.

### Step 3: Compile Smart Contract

```bash
cd contract
compact compile ShieldedLending.compact build/
```

This will:
- Compile the Compact contract
- Generate TypeScript bindings
- Create ZK circuits
- Download proving parameters (~500MB first time)

### Step 4: Install UI Dependencies

```bash
cd ../ui
npm install
```

### Step 5: Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🔧 Development

### Compile Contract

```bash
cd contract
compact compile ShieldedLending.compact build/
```

### Run UI Development Server

```bash
cd ui
npm run dev
```

### Build for Production

```bash
cd ui
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deploying

### Deploy Smart Contract

```bash
cd contract

# Deploy to testnet
compact deploy build/ --network testnet

# Or use custom deployment script
ts-node scripts/deploy.ts
```

### Deploy UI

The UI can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Build and deploy `dist/` folder

## 💻 Using the Application

### 1. Connect Wallet

1. Install [Lace wallet browser extension](https://www.lace.io/)
2. Create/import wallet
3. Get testnet tokens from [faucet](https://midnight.network/test-faucet/)
4. Click "Connect Wallet" in the app

### 2. Get Credit Proof

1. Go to "Credit Proof" page
2. Enter your credit score (demo mode)
3. Submit proof
4. Wait for ZK proof generation

### 3. Request a Loan (Borrower)

1. Go to "Borrow" page
2. Fill in loan details:
   - Amount needed
   - Interest rate willing to pay
   - Loan duration
   - Collateral amount
3. Submit request
4. Your identity remains private!

### 4. Fund Loans (Lender)

1. Go to "Lend" page
2. Browse available loans
3. Check credit proofs (you won't see actual scores)
4. Fund loans you're comfortable with
5. Earn interest when repaid

### 5. Manage Loans

1. Go to "My Loans" page
2. View borrowed and lent loans
3. Repay loans to get collateral back
4. Claim collateral if borrower defaults

## 🔐 Privacy Features

### What's Private:
- ✅ Borrower identity (hidden behind commitment)
- ✅ Actual credit scores (never on-chain)
- ✅ Reputation scores (only you can see yours)
- ✅ Loan ownership (proven with ZK)

### What's Public:
- ✅ Loan amounts and terms
- ✅ Interest rates
- ✅ Lender addresses
- ✅ Credit proof commitments (hashes only)

## 📚 Tech Stack

### Smart Contract
- **Language**: Compact (Midnight Network)
- **Features**: Zero-knowledge proofs, private state
- **Network**: Midnight testnet/mainnet

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router
- **Icons**: Lucide React
- **Date Formatting**: date-fns

### Infrastructure
- **Wallet**: Lace (Midnight wallet)
- **Proof Server**: Docker container
- **Deployment**: Vercel/Netlify

## 🧪 Testing

```bash
cd ui
npm run test
```

## 📖 Documentation

- [Midnight Docs](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact)
- [Lace Wallet](https://www.lace.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Troubleshooting

### Compact compiler not found
```bash
source $HOME/.local/bin/env
# Or add to ~/.bashrc:
export PATH="$HOME/.local/bin:$PATH"
```

### Proof server connection failed
```bash
# Make sure Docker is running
docker ps

# Restart proof server
docker run -p 6300:6300 midnightnetwork/proof-server -- \
  'midnight-proof-server --network testnet'
```

### Wallet not connecting
1. Make sure Lace wallet extension is installed
2. Refresh the page
3. Check browser console for errors

### UI not loading
```bash
cd ui
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📄 License

MIT License

## 🙏 Acknowledgments

- Built on [Midnight Network](https://midnight.network)
- Powered by zero-knowledge proofs
- Inspired by privacy-preserving DeFi

## 📞 Support

- **Discord**: [Join Midnight Discord](https://discord.com/invite/midnightnetwork)
- **Docs**: https://docs.midnight.network
- **GitHub**: [Issues](https://github.com/midnightntwrk)

---

**⚠️ Testnet Only**: This is for demonstration purposes. Do not use with real funds on mainnet without proper security audits.

Built with ❤️ for a privacy-first future
