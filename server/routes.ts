import type { Express } from "express";
import { db } from "../db";
import { portfolios, assets } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Get portfolio with assets
  app.get("/api/portfolio", async (req, res) => {
    try {
      const portfolioData = await db.query.portfolios.findMany({
        with: {
          assets: true
        }
      });
      res.json(portfolioData[0] || { assets: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Add asset to portfolio
  app.post("/api/portfolio/assets", async (req, res) => {
    try {
      const { assetId, amount, blockchain } = req.body;
      
      // Get or create default portfolio
      let portfolio = await db.query.portfolios.findFirst();
      if (!portfolio) {
        [portfolio] = await db.insert(portfolios)
          .values({ name: "Default Portfolio" })
          .returning();
      }

      const [asset] = await db.insert(assets)
        .values({
          portfolioId: portfolio.id,
          assetId,
          blockchain,
          amount: amount.toString(), // Convert to string for decimal type
          purchasePrice: "0", // Would normally fetch current price
        })
        .returning();

      res.json(asset);
    } catch (error) {
      res.status(500).json({ error: "Failed to add asset" });
    }
  });
}
