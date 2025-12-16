/**
 * Script to fetch top trader wallets from Dune Analytics dashboards
 * and update the KOL wallet list
 *
 * Usage: npx tsx scripts/update-kol-wallets.ts
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface DuneQueryResult {
  wallet_address: string;
  name?: string;
  win_rate?: number;
  total_pnl?: number;
  num_trades?: number;
  roi?: number;
  avg_trade_size?: number;
  last_active?: string;
}

/**
 * Fetch results from a Dune query
 */
async function fetchDuneQuery(queryId: number, apiKey: string): Promise<any[]> {
  const url = `https://api.dune.com/api/v1/query/${queryId}/results`;

  try {
    console.log(`Fetching Dune query ${queryId}...`);
    const response = await axios.get(url, {
      headers: {
        'X-Dune-API-Key': apiKey
      }
    });

    if (response.data && response.data.result && response.data.result.rows) {
      console.log(`✓ Fetched ${response.data.result.rows.length} rows from query ${queryId}`);
      return response.data.result.rows;
    }

    return [];
  } catch (error: any) {
    console.error(`✗ Error fetching query ${queryId}:`, error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    return [];
  }
}

/**
 * Main function to update KOL wallets
 */
async function main() {
  const apiKey = process.env.DUNE_API_KEY || '';

  if (!apiKey || apiKey.startsWith('sim_')) {
    console.error('ERROR: Need a regular Dune API key (not Sim API key)');
    console.error('Set DUNE_API_KEY environment variable with your Dune API key');
    console.error('\nGet your API key from: https://dune.com/settings/api');
    process.exit(1);
  }

  console.log('Fetching top trader wallets from Dune Analytics...\n');

  // QUERY IDs - Replace these with actual query IDs from your dashboards
  // To find query IDs: Open dashboard -> Click on chart -> URL will show query ID
  // Example: https://dune.com/queries/1234567
  const QUERY_IDS = {
    topTraders: 0,              // TODO: Replace with actual query ID from top-traders dashboard
    walletAnalyzer: 0,          // TODO: Replace with actual query ID from wallet-analyzer dashboard
    tokenAnalyzer: 0            // TODO: Replace with actual query ID from token-analyzer dashboard
  };

  if (QUERY_IDS.topTraders === 0) {
    console.log('⚠ Query IDs not configured!');
    console.log('\nTo configure:');
    console.log('1. Visit: https://dune.com/couldbebasic/top-traders');
    console.log('2. Click on the main table/chart');
    console.log('3. Copy the query ID from the URL');
    console.log('4. Update QUERY_IDS in this script\n');
  }

  const allWallets: Map<string, any> = new Map();

  // Fetch from all configured queries
  for (const [name, queryId] of Object.entries(QUERY_IDS)) {
    if (queryId === 0) continue;

    const results = await fetchDuneQuery(queryId, apiKey);

    for (const row of results) {
      const address = row.wallet_address || row.address || row.trader_address;
      if (!address) continue;

      // Merge data if wallet already exists
      if (allWallets.has(address)) {
        allWallets.set(address, {
          ...allWallets.get(address),
          ...row
        });
      } else {
        allWallets.set(address, row);
      }
    }
  }

  if (allWallets.size === 0) {
    console.log('\n⚠ No wallets fetched. Please configure query IDs and try again.');
    return;
  }

  // Convert to KOL wallet format
  const kolWallets = Array.from(allWallets.values())
    .map((row: any) => {
      const address = row.wallet_address || row.address || row.trader_address;
      const winRate = row.win_rate || row.winRate || row.success_rate;
      const totalPnL = row.total_pnl || row.totalPnL || row.profit;
      const numTrades = row.num_trades || row.numTrades || row.trade_count;
      const roi = row.roi || row.return_on_investment;

      return {
        address,
        name: row.name || row.trader_name || undefined,
        winRate: winRate ? parseFloat(winRate) : undefined,
        totalPnL: totalPnL ? parseFloat(totalPnL) : undefined,
        numTrades: numTrades ? parseInt(numTrades) : undefined,
        roi: roi ? parseFloat(roi) : undefined,
        avgTradeSize: row.avg_trade_size ? parseFloat(row.avg_trade_size) : undefined,
        lastActive: row.last_active || row.last_trade_date,
      };
    })
    // Filter: only keep wallets with decent metrics
    .filter(w => {
      const hasWinRate = !w.winRate || w.winRate >= 55;
      const hasPnL = !w.totalPnL || w.totalPnL > 10;
      const hasTrades = !w.numTrades || w.numTrades >= 5;
      return hasWinRate && hasPnL && hasTrades;
    })
    // Sort by performance score
    .sort((a, b) => {
      const scoreA = (a.winRate || 50) * (a.totalPnL || 1) * (1 + (a.numTrades || 0) / 100);
      const scoreB = (b.winRate || 50) * (b.totalPnL || 1) * (1 + (b.numTrades || 0) / 100);
      return scoreB - scoreA;
    })
    // Take top 50
    .slice(0, 50);

  console.log(`\n✓ Processed ${kolWallets.length} qualified wallets`);

  // Generate TypeScript file content
  const fileContent = `/**
 * KOL (Key Opinion Leader) wallet addresses for consensus-based trading
 *
 * Auto-generated from Dune Analytics dashboards on ${new Date().toISOString()}
 * Source dashboards:
 * - https://dune.com/couldbebasic/top-traders
 * - https://dune.com/couldbebasic/wallet-analyzer-for-copy-traders
 * - https://dune.com/couldbebasic/token-analyzer
 */

export interface KOLWallet {
  address: string;
  name?: string;
  winRate?: number;
  totalPnL?: number;
  numTrades?: number;
  roi?: number;
  avgTradeSize?: number;
  lastActive?: string;
  tags?: string[];
}

export const KOL_WALLETS: KOLWallet[] = ${JSON.stringify(kolWallets, null, 2)};

// Helper functions...
export function getQualifiedWallets(minWinRate = 60, minPnL = 20, minTrades = 10): KOLWallet[] {
  return KOL_WALLETS.filter(w => {
    const meetsWinRate = !w.winRate || w.winRate >= minWinRate;
    const meetsPnL = !w.totalPnL || w.totalPnL >= minPnL;
    const meetsTrades = !w.numTrades || w.numTrades >= minTrades;
    return meetsWinRate && meetsPnL && meetsTrades;
  });
}

export function getWalletsByPerformance(): KOLWallet[] {
  return [...KOL_WALLETS].sort((a, b) => {
    const scoreA = (a.winRate || 50) * (a.totalPnL || 1) * (1 + (a.numTrades || 0) / 100);
    const scoreB = (b.winRate || 50) * (b.totalPnL || 1) * (1 + (b.numTrades || 0) / 100);
    return scoreB - scoreA;
  });
}

export function getKOLAddresses(): string[] {
  return KOL_WALLETS.map(kol => kol.address);
}

export function getKOLByAddress(address: string): KOLWallet | undefined {
  return KOL_WALLETS.find(kol => kol.address === address);
}

export function getKOLName(address: string): string {
  const kol = getKOLByAddress(address);
  return kol?.name || address.slice(0, 8) + '...';
}

export function isKOLWallet(address: string): boolean {
  return KOL_WALLETS.some(kol => kol.address === address);
}

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
`;

  // Write to file
  const outputPath = path.join(__dirname, '../src/data/kol-wallets.ts');
  fs.writeFileSync(outputPath, fileContent);

  console.log(`\n✓ Updated ${outputPath}`);
  console.log('\nTop 5 wallets:');
  kolWallets.slice(0, 5).forEach((w, i) => {
    console.log(`  ${i + 1}. ${w.address.slice(0, 8)}... - Win Rate: ${w.winRate?.toFixed(1) || 'N/A'}%, PnL: ${w.totalPnL?.toFixed(2) || 'N/A'} SOL, Trades: ${w.numTrades || 'N/A'}`);
  });

  console.log('\n✓ Done! Rebuild your project with: npm run build');
}

main().catch(console.error);
