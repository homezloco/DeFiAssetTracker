import { setupAuth, ensureAuthenticated } from "./auth";
import { type Express } from "express";
import { db } from "../db";
import { portfolios, assets, wallets } from "@db/schema";
import { eq } from "drizzle-orm";
import { providers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";
import retry from "async-retry";

const TokenBalance = z.object({
  symbol: z.string(),
  balance: z.string()
});

const WalletBalance = z.object({
  address: z.string(),
  chain: z.string(),
  balance: z.string(),
  tokenBalances: z.array(TokenBalance).optional()
});

type WalletBalanceType = z.infer<typeof WalletBalance>;

async function getEthereumBalance(address: string): Promise<WalletBalanceType> {
  return await retry(
    async () => {
      try {
        const provider = new providers.JsonRpcProvider(
          'https://eth-mainnet.g.alchemy.com/v2/demo'
        );
        const balance = await provider.getBalance(address);
        
        return {
          address,
          chain: 'ethereum',
          balance: providers.formatEther(balance),
          tokenBalances: [] // Token balances would be added here
        };
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
        throw new Error(`Failed to fetch ETH balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
    }
  );
}

async function getSolanaBalance(address: string): Promise<WalletBalanceType> {
  return await retry(
    async () => {
      try {
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);
        
        return {
          address,
          chain: 'solana',
          balance: (balance / 1e9).toString(),
          tokenBalances: [] // Token balances would be added here
        };
      } catch (error) {
        console.error('Error fetching SOL balance:', error);
        throw new Error(`Failed to fetch SOL balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
    }
  );
}

async function getWalletBalance(address: string, chain: string): Promise<WalletBalanceType> {
  switch (chain) {
    case 'ethereum':
      return getEthereumBalance(address);
    case 'solana':
      return getSolanaBalance(address);
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

export function registerRoutes(app: Express) {
  // Set up authentication routes
  setupAuth(app);

  // Get portfolio with assets for authenticated user
  app.get("/api/portfolio", ensureAuthenticated, async (req, res) => {
    try {
      const portfolio = await db.query.portfolios.findFirst({
        where: eq(portfolios.userId, req.user!.id),
        with: {
          assets: true,
          wallets: true
        }
      });

      if (!portfolio) {
        // Create default portfolio for new users
        const [newPortfolio] = await db.insert(portfolios)
          .values({ 
            name: "Default Portfolio",
            userId: req.user!.id
          })
          .returning();

        return res.json({ ...newPortfolio, assets: [], wallets: [] });
      }

      // Fetch balances for each wallet with proper error handling
      const walletsWithBalances = await Promise.allSettled(
        portfolio.wallets.map(async (wallet) => {
          try {
            return await getWalletBalance(wallet.address, wallet.chain);
          } catch (error) {
            console.error(`Failed to fetch balance for wallet ${wallet.address}:`, error);
            return {
              ...wallet,
              balance: '0',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      const processedWallets = walletsWithBalances.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        // Return wallet with error state if balance fetch failed
        return {
          address: portfolio.wallets[index].address,
          chain: portfolio.wallets[index].chain,
          balance: '0',
          error: 'Failed to fetch balance'
        };
      });

      res.json({ ...portfolio, wallets: processedWallets });
    } catch (error) {
      console.error("Portfolio fetch error:", error);
      res.status(500).json({ 
        error: "Failed to fetch portfolio",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add asset to portfolio
  app.post("/api/portfolio/assets", ensureAuthenticated, async (req, res) => {
    try {
      const { assetId, amount, blockchain } = req.body;
      
      if (!assetId || !amount || !blockchain) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["assetId", "amount", "blockchain"]
        });
      }
      
      // Get or create user's portfolio
      let portfolio = await db.query.portfolios.findFirst({
        where: eq(portfolios.userId, req.user!.id)
      });

      if (!portfolio) {
        [portfolio] = await db.insert(portfolios)
          .values({ 
            name: "Default Portfolio",
            userId: req.user!.id
          })
          .returning();
      }

      const [asset] = await db.insert(assets)
        .values({
          portfolioId: portfolio.id,
          assetId,
          blockchain,
          amount: amount.toString(),
          purchasePrice: "0",
        })
        .returning();

      res.json(asset);
    } catch (error) {
      console.error("Asset creation error:", error);
      res.status(500).json({ 
        error: "Failed to add asset",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add wallet to portfolio
  app.post("/api/portfolio/wallets", ensureAuthenticated, async (req, res) => {
    try {
      const { address, chain } = req.body;
      
      if (!address || !chain) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["address", "chain"]
        });
      }

      // Get or create user's portfolio
      let portfolio = await db.query.portfolios.findFirst({
        where: eq(portfolios.userId, req.user!.id)
      });

      if (!portfolio) {
        [portfolio] = await db.insert(portfolios)
          .values({ 
            name: "Default Portfolio",
            userId: req.user!.id
          })
          .returning();
      }

      const [wallet] = await db.insert(wallets)
        .values({
          portfolioId: portfolio.id,
          address,
          chain
        })
        .returning();

      // Fetch initial balance
      const walletWithBalance = await getWalletBalance(address, chain);
      res.json({ ...wallet, ...walletWithBalance });
    } catch (error) {
      console.error("Wallet creation error:", error);
      res.status(500).json({ 
        error: "Failed to add wallet",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Refresh wallet balances
  app.post("/api/portfolio/refresh-balances", ensureAuthenticated, async (req, res) => {
    try {
      const portfolio = await db.query.portfolios.findFirst({
        where: eq(portfolios.userId, req.user!.id),
        with: {
          wallets: true
        }
      });

      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      const walletsWithBalances = await Promise.allSettled(
        portfolio.wallets.map(wallet => getWalletBalance(wallet.address, wallet.chain))
      );

      const processedWallets = walletsWithBalances.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return {
          address: portfolio.wallets[index].address,
          chain: portfolio.wallets[index].chain,
          balance: '0',
          error: 'Failed to fetch balance'
        };
      });

      res.json({ wallets: processedWallets });
    } catch (error) {
      console.error("Balance refresh error:", error);
      res.status(500).json({ 
        error: "Failed to refresh balances",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
