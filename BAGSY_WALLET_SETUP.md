# Bagsy Wallet Configuration

## Bagsy's Wallet Address
**Public Key**: `7ebKtZD4zdXxDxP4E4DcnPoAjp2mPER9471f36U56JHJ`

This wallet is now configured for:
1. Transaction monitoring (server dashboard)
2. Portfolio tracking
3. Trade history display

## Configuration Files Updated

### 1. Server Configuration (`server/.env`)
The server now monitors Bagsy's wallet for:
- All token balances
- Transaction history
- Buy/sell activities
- Real-time updates every 30 seconds

```bash
WALLET_PUBLIC_KEY=7ebKtZD4zdXxDxP4E4DcnPoAjp2mPER9471f36U56JHJ
```

### 2. Main Bot Configuration (`.env`)
**Important**: The main trading bot needs the PRIVATE KEY to execute trades.

You need to set this manually in the root `.env` file:
```bash
WALLET_PRIVATE_KEY=your_wallet_private_key_base58_here
```

⚠️ **Security Note**: Keep your private key secure and never commit it to git!

## What the Server Will Display

Once you start the server with:
```bash
cd server
npm install
npm run dev
```

The dashboard will show:
- ✅ All tokens in Bagsy's wallet (updates every 30s)
- ✅ Recent transactions (checks every 5 minutes)
- ✅ Portfolio value in USD
- ✅ Buy/sell history with prices and fees
- ✅ Links to Solscan for each transaction

## Verification

To verify the wallet is tracking correctly, check the server logs:
```bash
cd server
npm run dev
```

You should see:
```
Fetching initial wallet tokens...
✅ Found X tokens in wallet
Fetching recent wallet transactions...
✅ Found X recent transactions
```

## Frontend Access

Open the frontend dashboard at:
```
http://localhost:3000
```

The "Wallet Positions" panel will show all tokens from Bagsy's wallet in real-time.

## Note on Copy Trading

The copy trading bot (main bot) tracks the 314 KOL wallets we configured earlier.
This wallet configuration is separate - it's for monitoring Bagsy's own trading activity and displaying it on the dashboard.

If you want Bagsy's wallet to EXECUTE the copy trades, you need to:
1. Set the WALLET_PRIVATE_KEY in the main `.env` file
2. Ensure you have SOL in the wallet for trading
3. Configure OdinBot with the same wallet
