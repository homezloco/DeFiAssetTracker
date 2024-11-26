import type { Express } from "express";
import { db } from "../db";
import { portfolios, assets } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Initialize database tables
  const initializeTables = async () => {
    try {
      // Create default portfolio if it doesn't exist
      const existingPortfolio = await db.query.portfolios.findFirst();
      if (!existingPortfolio) {
        console.log("Creating default portfolio...");
        await db.insert(portfolios).values({ name: "Default Portfolio" });
      }
      return true;
    } catch (error) {
      console.error("Failed to initialize tables:", error);
      return false;
    }
  };

  // Initialize tables when routes are registered
  initializeTables();

  // Get portfolio with assets
  app.get("/api/portfolio", async (req, res) => {
    try {
      console.log("Fetching portfolio data...");
      const portfolioData = await db.query.portfolios.findMany({
        with: {
          assets: true
        }
      }) as Array<{
        id: number;
        name: string;
        createdAt: Date;
        assets: Array<{
          id: number;
          portfolioId: number;
          assetId: string;
          blockchain: string;
          amount: string;
          purchasePrice: string;
          purchaseDate: Date;
        }>;
      }>;

      if (!portfolioData || portfolioData.length === 0) {
        console.log("No portfolio found, creating default...");
        const [newPortfolio] = await db.insert(portfolios)
          .values({ name: "Default Portfolio" })
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
  app.post("/api/portfolio/assets", async (req, res) => {
    try {
      const { assetId, amount, blockchain } = req.body;
      
      if (!assetId || !amount || !blockchain) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["assetId", "amount", "blockchain"]
        });
      }

      console.log(`Adding asset: ${assetId} (${blockchain})`);
      
      // Get or create default portfolio
      let portfolio = await db.query.portfolios.findFirst();
      if (!portfolio) {
        console.log("Creating new portfolio for asset");
        [portfolio] = await db.insert(portfolios)
          .values({ name: "Default Portfolio" })
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
