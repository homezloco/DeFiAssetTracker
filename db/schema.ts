import { pgTable, text, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const portfolios = pgTable("portfolios", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const assets = pgTable("assets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id),
  assetId: text("asset_id").notNull(), // CoinGecko asset ID
  amount: decimal("amount").notNull(),
  purchasePrice: decimal("purchase_price").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull()
});

export const insertPortfolioSchema = createInsertSchema(portfolios);
export const selectPortfolioSchema = createSelectSchema(portfolios);
export const insertAssetSchema = createInsertSchema(assets);
export const selectAssetSchema = createSelectSchema(assets);

export type Portfolio = z.infer<typeof selectPortfolioSchema>;
export type Asset = z.infer<typeof selectAssetSchema>;
