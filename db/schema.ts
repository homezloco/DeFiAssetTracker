import { pgTable, text, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const portfolios = pgTable("portfolios", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const assets = pgTable("assets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id),
  assetId: text("asset_id").notNull(), // CoinGecko asset ID
  blockchain: text("blockchain").notNull().default('ethereum'),
  amount: decimal("amount").notNull(),
  purchasePrice: decimal("purchase_price").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users, {
  password: z.string().min(6)
});
export const selectUserSchema = createSelectSchema(users);
export const insertPortfolioSchema = createInsertSchema(portfolios);
export const selectPortfolioSchema = createSelectSchema(portfolios);
export const insertAssetSchema = createInsertSchema(assets);
export const selectAssetSchema = createSelectSchema(assets);

export type User = z.infer<typeof selectUserSchema>;
export type Portfolio = z.infer<typeof selectPortfolioSchema>;
export type Asset = z.infer<typeof selectAssetSchema>;
