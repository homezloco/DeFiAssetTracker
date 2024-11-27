import { setupAuth, ensureAuthenticated } from "./auth";
import { type Express, Request, Response } from "express";
import { db } from "../db";
import { portfolios, assets, wallets, type Portfolio, type Asset, type Wallet } from "@db/schema";
import { eq } from "drizzle-orm";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
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

type TokenBalanceType = z.infer<typeof TokenBalance>;
type WalletBalanceType = z.infer<typeof WalletBalance>;

async function getEthereumBalance(address: string): Promise<WalletBalanceType> {
  return await retry(
    async () => {
      try {
        const provider = ethers.getDefaultProvider('mainnet', {
          alchemy: 'demo'
        });
        const balance = await provider.getBalance(address);
        
        // Get ERC20 token balances for common tokens
        const tokenContracts = [
          { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' }, // USDT
          { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' }, // USDC
          { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI' }  // DAI
        ];

        const tokenBalances = await Promise.allSettled(
          tokenContracts.map(async (token) => {
            const contract = new ethers.Contract(
              token.address,
              ['function balanceOf(address) view returns (uint256)'],
              provider
            );
            const tokenBalance = await contract.balanceOf(address);
            return {
              symbol: token.symbol,
              balance: ethers.formatUnits(tokenBalance, 'ether')
            };
          })
        );

        const validTokenBalances = tokenBalances
          .filter((result): result is PromiseFulfilledResult<TokenBalanceType> => 
            result.status === 'fulfilled' && Number(result.value.balance) > 0
          )
          .map(result => result.value);

        return {
          address,
          chain: 'ethereum',
          balance: ethers.formatUnits(balance, 'ether'),
          tokenBalances: validTokenBalances
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
        
        // Get token accounts
        const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID
        });

        const tokenBalances = await Promise.allSettled(
          tokenAccounts.value.map(async (tokenAccount) => {
            try {
              const accountInfo = await connection.getParsedAccountInfo(tokenAccount.pubkey);
              const parsedData = (accountInfo.value?.data as any)?.parsed;
              if (parsedData?.info?.tokenAmount?.uiAmount > 0) {
                return {
                  symbol: parsedData.info.mint,
                  balance: parsedData.info.tokenAmount.uiAmount.toString()
                };
              }
              return null;
            } catch (error) {
              console.error('Error fetching token info:', error);
              return null;
            }
          })
        );

        const validTokenBalances = tokenBalances
          .filter((result): result is PromiseFulfilledResult<TokenBalanceType | null> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value!);

        return {
          address,
          chain: 'solana',
          balance: (balance / 1e9).toString(),
          tokenBalances: validTokenBalances
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
  app.get("/api/portfolio", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const portfolio = await db.query.portfolios.findFirst({
        where: eq(portfolios.userId, (req.user as any).id),
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
            userId: (req.user as any).id
          })
          .returning();

        return res.json({ ...newPortfolio, assets: [], wallets: [] });
      }

      // Fetch balances for each wallet with proper error handling
      const walletsWithBalances = await Promise.allSettled(
        (portfolio.wallets || []).map(async (wallet: Wallet) => {
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
  app.post("/api/portfolio/assets", ensureAuthenticated, async (req: Request, res: Response) => {
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
        where: eq(portfolios.userId, (req.user as any).id)
      });

      if (!portfolio) {
        [portfolio] = await db.insert(portfolios)
          .values({ 
            name: "Default Portfolio",
            userId: (req.user as any).id
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
  app.post("/api/portfolio/wallets", ensureAuthenticated, async (req: Request, res: Response) => {
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
        where: eq(portfolios.userId, (req.user as any).id)
      });

      if (!portfolio) {
        [portfolio] = await db.insert(portfolios)
          .values({ 
            name: "Default Portfolio",
            userId: (req.user as any).id
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
  app.post("/api/portfolio/refresh-balances", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const portfolio = await db.query.portfolios.findFirst({
        where: eq(portfolios.userId, (req.user as any).id),
        with: {
          wallets: true,
          assets: true
        }
      });

      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      const walletsWithBalances = await Promise.allSettled(
        (portfolio.wallets || []).map((wallet: Wallet) => getWalletBalance(wallet.address, wallet.chain))
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
