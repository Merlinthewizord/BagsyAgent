#!/bin/bash

# BagsyAgent Setup Script
# This script helps set up the trading bot

set -e

echo "=================================="
echo "  BagsyAgent Setup Wizard"
echo "=================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old (found v$NODE_VERSION, need v18+)"
    echo "Please upgrade Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file..."
    else
        cp .env.example .env
        echo "✅ Created new .env file"
    fi
else
    cp .env.example .env
    echo "✅ Created .env file from template"
fi

echo ""
echo "=================================="
echo "  Configuration"
echo "=================================="
echo ""

# Collect API keys
read -p "Enter your Dune API key (or press Enter to skip): " DUNE_KEY
if [ ! -z "$DUNE_KEY" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/DUNE_API_KEY=.*/DUNE_API_KEY=$DUNE_KEY/" .env
    else
        sed -i "s/DUNE_API_KEY=.*/DUNE_API_KEY=$DUNE_KEY/" .env
    fi
    echo "✅ Dune API key saved"
fi

read -p "Enter your Bags.fm API key (or press Enter to skip): " BAGS_KEY
if [ ! -z "$BAGS_KEY" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/BAGS_API_KEY=.*/BAGS_API_KEY=$BAGS_KEY/" .env
    else
        sed -i "s/BAGS_API_KEY=.*/BAGS_API_KEY=$BAGS_KEY/" .env
    fi
    echo "✅ Bags.fm API key saved"
fi

read -p "Enter your Solana RPC URL (or press Enter for default): " RPC_URL
if [ ! -z "$RPC_URL" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|SOLANA_RPC_URL=.*|SOLANA_RPC_URL=$RPC_URL|" .env
    else
        sed -i "s|SOLANA_RPC_URL=.*|SOLANA_RPC_URL=$RPC_URL|" .env
    fi
    echo "✅ Solana RPC URL saved"
fi

echo ""
echo "⚠️  Important: You still need to set WALLET_PRIVATE_KEY in .env"
echo "   Edit .env and add your wallet's base58-encoded private key"
echo ""

# Install dependencies
echo "=================================="
echo "  Installing Dependencies"
echo "=================================="
echo ""

if [ -d "node_modules" ]; then
    echo "node_modules already exists, skipping installation..."
else
    echo "Installing npm packages..."
    npm install
    echo "✅ Dependencies installed"
fi

echo ""

# Build project
echo "=================================="
echo "  Building Project"
echo "=================================="
echo ""

npm run build
echo "✅ Project built successfully"

echo ""
echo "=================================="
echo "  Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env and add your WALLET_PRIVATE_KEY"
echo "2. Set up Dune queries (see docs/DUNE_QUERIES.md)"
echo "3. Update query IDs in src/services/DuneClient.ts"
echo "4. Rebuild: npm run build"
echo "5. Start the bot: npm start"
echo ""
echo "For detailed instructions, see:"
echo "  - README.md"
echo "  - SETUP_GUIDE.md"
echo "  - docs/DUNE_QUERIES.md"
echo ""
echo "⚠️  WARNING: Start with small amounts for testing!"
echo ""
