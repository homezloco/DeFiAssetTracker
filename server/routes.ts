import type { Express, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { portfolios, assets, type Portfolio, type Asset } from "@db/schema";

type PortfolioWithAssets = Portfolio & {
  assets: Asset[];
};
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
      console.log("Fetching portfolio data...");
      const portfolioData = await db.query.portfolios.findMany({
        as: "PortfolioWithAssets",
        where: eq(portfolios.userId, req.user!.id),
        with: {
          assets: true
        }
      });

      if (!portfolioData || portfolioData.length === 0) {
        console.log("No portfolio found, creating default...");
        const [newPortfolio] = await db.insert(portfolios)
          .values({ 
            name: "Default Portfolio",
            userId: req.user!.id
          })
          .returning();
        return res.json({ ...newPortfolio, assets: [] });
      }

      console.log(`Found portfolio with ${portfolioData[0].assets.length} assets`);
      res.json(portfolioData[0]);
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

      console.log(`Adding asset: ${assetId} (${blockchain})`);
      
      // Get or create user's portfolio
      let portfolio = await db.query.portfolios.findFirst({
        where: eq(portfolios.userId, req.user!.id)
      });

      if (!portfolio) {
        console.log("Creating new portfolio for user");
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

      console.log(`Asset added successfully: ${asset.id}`);
      res.json(asset);
    } catch (error) {
      console.error("Asset creation error:", error);
      res.status(500).json({ 
        error: "Failed to add asset",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
