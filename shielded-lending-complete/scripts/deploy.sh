#!/bin/bash

# ShieldedLending Deployment Script
# Deploys contract and UI to Midnight testnet

set -e  # Exit on error

echo "🚀 ShieldedLending Deployment Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v compact &> /dev/null; then
    echo -e "${RED}❌ Compact compiler not found${NC}"
    echo "Install it from: https://github.com/midnightntwrk/compact/releases"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found (needed for proof server)${NC}"
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 2: Compile contract
echo "🔨 Compiling Smart Contract..."
cd contract

if [ ! -d "build" ]; then
    mkdir build
fi

compact compile ShieldedLending.compact build/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contract compiled successfully${NC}"
else
    echo -e "${RED}❌ Contract compilation failed${NC}"
    exit 1
fi

echo ""

# Step 3: Build UI
echo "🎨 Building UI..."
cd ../ui

npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ UI built successfully${NC}"
else
    echo -e "${RED}❌ UI build failed${NC}"
    exit 1
fi

echo ""

# Step 4: Summary
echo "🎉 Deployment Complete!"
echo ""
echo "📦 Contract:"
echo "   - Compiled: contract/build/"
echo "   - Ready to deploy to Midnight testnet"
echo ""
echo "🌐 UI:"
echo "   - Built: ui/dist/"
echo "   - Ready to deploy to hosting service"
echo ""
echo "🚀 Next Steps:"
echo "   1. Deploy contract: cd contract && compact deploy build/ --network testnet"
echo "   2. Update UI with contract address"
echo "   3. Deploy UI: cd ui && npm run preview (or deploy to Vercel/Netlify)"
echo ""
echo -e "${YELLOW}⚠️  Remember: This is testnet. Don't use with real funds without audit!${NC}"
