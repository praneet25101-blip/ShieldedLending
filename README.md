# ShieldedLending

**Privacy-First P2P Lending on Midnight Blockchain**

ShieldedLending is a peer-to-peer lending platform where borrowers can access loans without revealing their credit history publicly, while lenders receive cryptographic proof of creditworthiness through zero-knowledge proofs.

## 🎥 Demo

[View Live Demonstration Video](https://github.com/user-attachments/assets/fa1b7d93-f16d-443a-a834-b79117b9ff51)

![ShieldedLending Preview](https://github.com/user-attachments/assets/7d523541-a95a-4482-be14-23fbe2c5b950)

## 📋 Table of Contents

- [Overview](#overview)
- [Deployment Details](#deployment-details)
- [Architecture](#architecture)
- [Privacy Model](#privacy-model)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Deployment Guide](#deployment-guide)
- [Wallet Integration](#wallet-integration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 🌟 Overview

Current lending platforms require borrowers to expose sensitive financial information publicly. ShieldedLending inverts this model using Midnight's zero-knowledge proof infrastructure:

- **Private Credit History**: Borrowers prove creditworthiness without revealing exact credit scores or financial details
- **ZK Proof Verification**: Lenders receive cryptographic proof that borrowers meet credit thresholds
- **Anonymous Loan Requests**: Loan requests are cryptographically anonymous while maintaining verifiability
- **On-Chain Aggregates**: Public counters track platform activity without exposing individual records

ShieldedLending consists of Compact smart contracts, a TypeScript DApp layer, and a React frontend that connects to the Lace Midnight Preview wallet.

## 🚀 Deployment Details

### Contract Address

```
aa1e246cb24a57ceab4f18363c86cc377b5e00e25f1a6317a2b0bd2ab15e2bcf
```

### Network Information

- **Network**: Midnight Testnet
- **Indexer**: https://indexer.testnet-02.midnight.network/api/v1/graphql
- **RPC Node**: https://rpc.testnet-02.midnight.network

## 🏗️ Architecture

### Privacy Model

ShieldedLending uses several cryptographic primitives to ensure privacy:

#### Commitments

When users register or create loan requests, they generate commitments that hide sensitive data while allowing verification. A commitment is a cryptographic hash that binds to the data without revealing it.

#### Nullifiers

Nullifiers prevent double-spending and ensure each commitment can only be used once. When a loan is repaid or a commitment is consumed, a nullifier is published on-chain to mark it as spent.

#### Merkle Trees

All commitments are stored in a Merkle tree, allowing users to prove membership (e.g., "I am a registered user") without revealing which specific commitment is theirs.

#### Domain Separation

Different circuits use different Merkle trees to prevent cross-circuit attacks and maintain clear separation of concerns.

### What's Public (on-chain)

- Total number of registered users
- Total number of loan requests
- Loan request amounts (but not who requested them)
- Merkle tree roots
- Nullifiers (spent commitment markers)

### What's Private (never on-chain)

- User identities
- Credit scores
- Exact credit history
- Which user created which loan request
- Private keys and secrets

## 🛠️ Tech Stack

### Smart Contracts

- **Compact** - Midnight's ZK-friendly smart contract language
- **Midnight SDK v3** - Contract deployment and interaction

### Frontend

- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Lace Wallet** - Midnight wallet integration

### Backend/Infrastructure

- **Node.js** >= 18
- **Docker** - Local development environment
- **Midnight Indexer** - On-chain data queries
- **Proof Server** - ZK proof generation

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Lace Midnight Preview** Chrome extension ([install](https://chromewebstore.google.com/detail/lace-midnight-preview/hgeekaiplokcnmakghbdfbgnlfheichg))
- **Compact compiler** (for contract compilation) - `compact-compiler` v0.28.0+
- **Docker Desktop** (for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/praneet25101-blip/ShieldedLending.git
cd ShieldedLending

# Install workspace dependencies
npm install
```

### Contract Setup

```bash
cd contract

# Install contract dependencies
npm install

# Compile Compact circuits (requires compact CLI in PATH)
npm run compact

# Build contract artifacts
npm run build
```

### Frontend Setup

```bash
cd ../frontend

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Quick Local Simulation (No Midnight Node)

The frontend can run in simulation mode for development:

1. Open the frontend in your browser (Vite prints the URL)
2. Connect Lace wallet (optional in simulation mode)
3. Use the UI to generate commitments and register
4. Commitments are stored locally in `localStorage['p2p_sim_ledger']`

## 📁 Project Structure

```
ShieldedLending/
├── contract/                    # Smart contract code
│   ├── src/
│   │   ├── lending.compact     # Main Compact contract
│   │   └── managed/            # Compiled contract artifacts
│   ├── config.ts               # Network configuration
│   ├── providers.ts            # SDK provider setup
│   ├── deploy-sample.ts        # Deployment script
│   └── package.json
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx       # Login page with wallet integration
│   │   │   └── Login.css       # Premium login styles
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
├── docker-compose.yml          # Local Midnight services
└── README.md
```

## 🌐 Deployment Guide

### Local Deployment (Devnet)

#### 1. Start Midnight Services

```bash
# Start local Midnight node, indexer, and proof server
docker-compose up -d

# Verify services are running
docker-compose ps
```

#### 2. Deploy Contract

```bash
cd contract

# Set wallet seed (or let script generate one)
export WALLET_SEED_HEX="your-64-character-hex-seed"

# Deploy to local network
npm run deploy:local
```

The script will:
- ✓ Verify services are reachable
- ✓ Build wallet from seed
- ✓ Sync with network
- ✓ Register for DUST token generation
- ✓ Deploy contract
- ✓ Print contract address

**Save the contract address** - you'll need it for frontend configuration.

### Testnet Deployment

#### 1. Get Testnet Funds

1. Deploy generates a wallet address
2. Visit [Midnight Faucet](https://faucet.preprod.midnight.network/)
3. Request tNIGHT tokens for your address

#### 2. Start Local Proof Server

```bash
# Proof server must run locally even for testnet
docker run -p 6300:6300 bricktowers/proof-server:7.0.0
```

#### 3. Deploy Contract

```bash
cd contract

# Set wallet seed
export WALLET_SEED_HEX="your-64-character-hex-seed"

# Deploy to testnet
npm run deploy:testnet
```

## 🔗 Wallet Integration

### Lace Wallet Setup

1. Install [Lace Midnight Preview](https://chromewebstore.google.com/detail/lace-midnight-preview/hgeekaiplokcnmakghbdfbgnlfheichg)
2. Create or import a wallet
3. Switch to Midnight Testnet network
4. Get tNIGHT tokens from the faucet

### Connection Flow

The login page handles wallet connection:

```typescript
// Check if wallet is installed
const isInstalled = 'midnight' in window;

// Request connection
await window.midnight.enable();

// Get wallet address
const { unshieldedAddress } = await window.midnight.getUnshieldedAddress();

// Get balance
const balance = await window.midnight.getBalance();
```

### Using Wallet State

Once connected, the wallet provides:
- **Unshielded address** - For receiving tNIGHT tokens
- **Balance** - Current tNIGHT balance
- **Transaction signing** - Sign and submit transactions
- **ZK proof generation** - Generate proofs for private operations

## 💻 Development

### Key Scripts

#### Contract

```bash
npm run compact        # Compile Compact contracts
npm run build          # Build contract artifacts
npm run deploy         # Deploy to local network
npm run deploy:testnet # Deploy to testnet
```

#### Frontend

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

### Environment Variables

Create a `.env` file in the contract directory:

```env
# Wallet configuration
WALLET_SEED_HEX=your-64-character-hex-seed

# Network endpoints (optional, defaults in config.ts)
MIDNIGHT_INDEXER_URI=http://localhost:8088/api/v3/graphql
MIDNIGHT_INDEXER_WS=ws://localhost:8088/api/v3/graphql/ws
MIDNIGHT_NODE_URI=http://localhost:9944
MIDNIGHT_PROVER_SERVER_URI=http://127.0.0.1:6300
```

## 🐞 Troubleshooting

### Contract Compilation Errors

**Issue**: `compact: command not found`

**Solution**: Install the Compact compiler:
```bash
# Download from Midnight releases
# Add to PATH
export PATH=$PATH:/path/to/compact-compiler
```

**Issue**: Contract compilation fails with circuit errors

**Solution**: Ensure you have Compact compiler v0.28.0 or later:
```bash
compact --version
```

### Deployment Errors

**Issue**: `Services unreachable` error

**Solution**: Verify Docker containers are running:
```bash
docker-compose ps
docker-compose logs
```

**Issue**: `Waiting for genesis funds...` hangs

**Solution**: 
- For local: Check if node is generating blocks
- For testnet: Request funds from faucet

**Issue**: `Failed to register for DUST generation`

**Solution**: Ensure you have sufficient tNIGHT balance (minimum 1000 tNIGHT)

### Wallet Connection Errors

**Issue**: Lace wallet not detected

**Solution**: 
1. Install Lace Midnight Preview extension
2. Refresh the page
3. Check browser console for errors

**Issue**: Connection rejected

**Solution**: 
1. Open Lace wallet
2. Ensure you're on the correct network (Testnet)
3. Try connecting again

### Frontend Errors

**Issue**: `Module not found` errors

**Solution**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Vite build fails

**Solution**: Clear cache and rebuild:
```bash
npm run clean
npm run build
```

## 📚 Learning Resources

For detailed guides, see:

1. **[What is this project?](./docs/OVERVIEW.md)** - Concepts of ZK and Privacy
2. **[How does the code work?](./docs/CONTRACT_GUIDE.md)** - A beginner's look at Compact
3. **[The UI Design](./docs/FRONTEND_GUIDE.md)** - Why the frontend looks and feels premium
4. **[Advanced Running](./docs/RUNNING.md)** - Complex setups and Testnet details

## 📄 License

This project is licensed under the MIT License 





