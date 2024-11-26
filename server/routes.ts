import type { Express, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { portfolios, assets, wallets, type Portfolio, type Asset, type Wallet } from "@db/schema";
import { providers } from 'ethers';
import { eq, and } from "drizzle-orm";
import { setupAuth } from "./auth";

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
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

      res.json(portfolio);
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

      res.json(wallet);
    } catch (error) {
      console.error("Wallet creation error:", error);
      res.status(500).json({ 
        error: "Failed to add wallet",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
