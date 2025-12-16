# BagsyAgent - Buyback & Burn Feature

## Overview

Bagsy automatically claims creator fees from the $BAGSY token and uses 100% of those fees to:
1. **Buy back** $BAGSY tokens from the market
2. **Burn** the bought tokens (send to incinerator address)

This creates deflationary tokenomics and shows Bagsy's commitment to the token!

## How It Works

### Automated Fee Management

Every hour (configurable), Bagsy:
1. Checks claimable creator fees from $BAGSY token
2. If fees are above minimum threshold (0.01 SOL), claims them
3. Immediately uses all claimed SOL to buy back $BAGSY
4. Burns all bought-back tokens

### Transparency

All buyback & burn activity is:
- **Logged** in the bot console
- **Reported** to the frontend dashboard
- **Visible** in the thought stream
- **Tracked** in trade history

### Bagsy's Thoughts During Buyback & Burn

Bagsy will share thoughts like:
- "💸 Found 0.5 SOL in creator fees! Time to claim and burn baby!"
- "🦍 Aping 0.5 SOL into $BAGSY buyback! Every fee goes back to the token!"
- "📈 Bought back 10,000 $BAGSY tokens! Sending to the incinerator!"
- "🔥🔥🔥 BURN COMPLETE! Supply just got tighter! Deflationary gang!"

## Configuration

Add these to your `.env` file:

```env
# Bagsy Token Mint Address
BAGSY_TOKEN_MINT=YourBagsyTokenMintAddressHere

# How often to check for claimable fees (in hours)
FEE_CLAIM_INTERVAL_HOURS=1

# Minimum fees to claim (in SOL)
MIN_CLAIM_AMOUNT_SOL=0.01
```

## Setup Steps

1. **Create $BAGSY Token** on bags.fm with creator fees enabled
2. **Get Token Mint Address** from bags.fm or Solscan
3. **Add to Environment**:
   ```env
   BAGSY_TOKEN_MINT=<your_token_mint_address>
   ```
4. **Restart Bot** - it will start checking for fees automatically

## Technical Details

### Fee Claiming API

The bot uses bags.fm's fee claiming endpoint:
```
POST /fees/claim
{
  "tokenMint": "...",
  "walletAddress": "..."
}
```

### Burning Mechanism

Tokens are burned by sending them to Solana's incinerator address:
```
1nc1nerator11111111111111111111111111111111
```

This is an irreversible burn - tokens are permanently removed from circulation.

### Buyback Logic

1. Claim fees → Get SOL
2. Use bags.fm trade API to swap SOL → $BAGSY
3. Get token amount from swap
4. Send all tokens to incinerator
5. Report to frontend

## Benefits

### For Token Holders
- **Reduced Supply**: Every burn reduces circulating supply
- **Price Support**: Regular buybacks create buying pressure
- **Transparency**: All burns visible on-chain and in dashboard

### For Bagsy's Mission
- **Demonstrates Commitment**: Uses 100% of fees for token
- **Builds Trust**: Automated and transparent
- **Community Engagement**: Exciting to watch live burns

### For Tokenomics
- **Deflationary**: Supply constantly decreasing
- **Sustainable**: Uses earned fees, not wallet funds
- **Automatic**: No manual intervention needed

## Monitoring

### Dashboard
Watch buyback & burn activity in real-time:
- **Thought Stream**: See Bagsy's excitement about burns
- **Trade History**: All buybacks and burns logged
- **Chat**: Ask Bagsy about recent burns

### On-Chain
Verify burns on Solana explorers:
- Solscan: Search for incinerator address transactions
- Solana Explorer: View burn transactions
- All transactions include TxSignatures in logs

## Example Scenario

```
Hour 1:
- Bagsy checks fees: 0.005 SOL (below threshold)
- No action taken

Hour 2:
- Bagsy checks fees: 0.05 SOL ✅
- Claims 0.05 SOL in fees
- Buys 5,000 $BAGSY tokens
- Burns all 5,000 tokens
- Reports to dashboard

Hour 3:
- Checks again (1 hour later)
- Process repeats...
```

## Troubleshooting

**No fees being claimed:**
- Check if `BAGSY_TOKEN_MINT` is set
- Verify token has creator fees enabled
- Check minimum threshold setting
- Review bot logs for errors

**Buyback failing:**
- Check SOL balance for gas fees
- Verify liquidity exists for $BAGSY
- Review slippage settings
- Check bags.fm API status

**Burn not working:**
- Verify token transfer permissions
- Check wallet has authority
- Review transaction logs
- Ensure enough SOL for gas

## Future Enhancements

Potential improvements:
- Variable buyback percentage (save some fees)
- LP fee distribution option
- Burn statistics tracking
- Burn leaderboards
- Community burn events

---

**Let Bagsy burn! 🔥**

Every fee claimed makes $BAGSY more scarce. Watch the supply shrink in real-time!
