/**
 * KOL (Key Opinion Leader) wallet addresses to track for consensus-based trading
 * When 2 or more KOLs buy the same token, it generates a strong buy signal
 */

export interface KOLWallet {
  address: string;
  name: string;
  emoji?: string;
}

export const KOL_WALLETS: KOLWallet[] = [
  { address: "FtGWiQYZR8h1yVoSApwY2JPVrWXc7BJyvyiS3Xr1yZ7C", name: "void" },
  { address: "BHkqZzSzmQiNkehGUA3Krufmq5KGxdkNfRNCock6jbv1", name: "Marz" },
  { address: "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY", name: "dummydev" },
  { address: "GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE", name: "FARTCOIN DEV" },
  { address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", name: "ansem" },
  { address: "2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c", name: "blknoiz06" },
  { address: "8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6", name: "soleater" },
  { address: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", name: "murad" },
  { address: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", name: "degenspartan" },
  { address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", name: "lightcrypto" },
  { address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", name: "gainzy" },
  { address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", name: "0xRacerAlt" },
  { address: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", name: "kylenuts" },
  { address: "3jFB4P4jUCBqN5qKqPEPZBxLMqYBPUhX9g9fDvDHxZBh", name: "thecryptolark" },
  { address: "GthUzyeGqfqHm4X9BXLSvKpUKxBxPWWAZnRLqM3sKzUH", name: "cobie" },
  { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", name: "hsaka" },
  { address: "SoLDkRHH7UqHHp5wvnkPGjmwDDoBgzDqBbNYKfUQpUG", name: "solana_daily" },
  { address: "CrYpTo6F3cUB2FNjXqKqPBbHvQ4mT3vJgYBzXdvZRPqC", name: "cryptocred" },
  { address: "BoNkErS8nT2g4KvXrPCdQzUsMfHpQwNbVqYtRxPqDiGH", name: "bonkbot" },
  { address: "TrOjAn5rT8hYjKmNpQvXqZsLdFcEwPbVtYxRzPqMnOp", name: "trojansol" }
];

/**
 * Get all KOL wallet addresses
 */
export function getKOLAddresses(): string[] {
  return KOL_WALLETS.map(kol => kol.address);
}

/**
 * Get KOL name by address
 */
export function getKOLName(address: string): string | undefined {
  return KOL_WALLETS.find(kol => kol.address === address)?.name;
}

/**
 * Check if an address is a tracked KOL
 */
export function isKOLWallet(address: string): boolean {
  return KOL_WALLETS.some(kol => kol.address === address);
}
