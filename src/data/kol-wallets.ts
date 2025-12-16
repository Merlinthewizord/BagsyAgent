/**
 * KOL (Key Opinion Leader) wallet addresses for consensus-based trading
 *
 * INSTRUCTIONS: Replace this list with top performers from your Dune Analytics dashboards:
 * 1. https://dune.com/couldbebasic/top-traders
 * 2. https://dune.com/couldbebasic/wallet-analyzer-for-copy-traders
 * 3. https://dune.com/couldbebasic/token-analyzer
 *
 * RECOMMENDED CRITERIA FOR SELECTING WALLETS:
 * - Win Rate: >60% (higher is better)
 * - Total PnL: >50 SOL profit
 * - Number of Trades: >20 (shows activity and experience)
 * - ROI: >200% (at least 2x return)
 * - Recent Activity: Active within last 7 days
 * - Avg Trade Size: 1-10 SOL (not too small, not whale-sized)
 *
 * Sort wallets by win rate * total profit to find the most reliable performers
 */

export interface KOLWallet {
  address: string;
  name?: string;
  winRate?: number;      // Win rate percentage (e.g., 75.5 for 75.5%)
  totalPnL?: number;      // Total profit/loss in SOL
  numTrades?: number;     // Total number of trades
  roi?: number;           // Return on investment percentage
  avgTradeSize?: number;  // Average trade size in SOL
  lastActive?: string;    // Last activity date
  tags?: string[];        // Optional tags like ['aggressive', 'conservative', 'memecoins']
}

/**
 * PASTE YOUR TOP WALLETS FROM DUNE DASHBOARDS HERE
 *
 * Example format:
 * {
 *   address: "ABC123...",
 *   name: "TopTrader1",
 *   winRate: 75.5,
 *   totalPnL: 150.5,
 *   numTrades: 45,
 *   roi: 320
 * }
 */
export const KOL_WALLETS: KOLWallet[] = [
  // ============================================================================
  // TODO: Replace this placeholder list with data from your Dune dashboards
  // ============================================================================

  // PLACEHOLDER - Remove these and add your top performers from Dune Analytics
  {
    address: "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY",
    name: "Example Trader 1",
    winRate: 70,
    totalPnL: 100,
    numTrades: 30,
    tags: ['placeholder']
  },

  // Add more wallets below in the same format...
  // Copy from: https://dune.com/couldbebasic/top-traders

];

/**
 * Validation: Filter out wallets that don't meet minimum criteria
 */
export function getQualifiedWallets(
  minWinRate: number = 60,
  minPnL: number = 20,
  minTrades: number = 10
): KOLWallet[] {
  return KOL_WALLETS.filter(wallet => {
    const meetsWinRate = !wallet.winRate || wallet.winRate >= minWinRate;
    const meetsPnL = !wallet.totalPnL || wallet.totalPnL >= minPnL;
    const meetsTrades = !wallet.numTrades || wallet.numTrades >= minTrades;

    return meetsWinRate && meetsPnL && meetsTrades;
  });
}

/**
 * Get wallet addresses sorted by performance score
 * Score = winRate * totalPnL * (1 + numTrades/100)
 */
export function getWalletsByPerformance(): KOLWallet[] {
  return [...KOL_WALLETS].sort((a, b) => {
    const scoreA = (a.winRate || 50) * (a.totalPnL || 1) * (1 + (a.numTrades || 0) / 100);
    const scoreB = (b.winRate || 50) * (b.totalPnL || 1) * (1 + (b.numTrades || 0) / 100);
    return scoreB - scoreA;
  });
}

/**
 * Get all KOL wallet addresses
 */
export function getKOLAddresses(): string[] {
  return KOL_WALLETS.map(kol => kol.address);
}

/**
 * Get KOL info by address
 */
export function getKOLByAddress(address: string): KOLWallet | undefined {
  return KOL_WALLETS.find(kol => kol.address === address);
}

/**
 * Get KOL name by address (for logging)
 */
export function getKOLName(address: string): string {
  const kol = getKOLByAddress(address);
  return kol?.name || address.slice(0, 8) + '...';
}

/**
 * Check if an address is a tracked KOL
 */
export function isKOLWallet(address: string): boolean {
  return KOL_WALLETS.some(kol => kol.address === address);
}

/**
 * Stats about the current wallet list
 */
export function getWalletStats() {
  const qualified = getQualifiedWallets();
  const avgWinRate = qualified.reduce((sum, w) => sum + (w.winRate || 0), 0) / qualified.length;
  const avgPnL = qualified.reduce((sum, w) => sum + (w.totalPnL || 0), 0) / qualified.length;

  return {
    totalWallets: KOL_WALLETS.length,
    qualifiedWallets: qualified.length,
    avgWinRate: avgWinRate.toFixed(1),
    avgPnL: avgPnL.toFixed(2),
    topPerformer: getWalletsByPerformance()[0]
  };
}
