export interface Asset {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  sparkline: number[];
  blockchain: string;
}

export interface PortfolioAsset {
  id: number;
  portfolioId: number;
  assetId: string;
  blockchain: string;
  amount: string;
  purchasePrice: string;
  purchaseDate: Date;
}

export interface WalletBalance {
  address: string;
  chain: string;
  balance: string;
  tokenBalances?: {
    symbol: string;
    balance: string;
  }[];
}

export interface Portfolio {
  id: number;
  name: string;
  createdAt: Date;
  assets: PortfolioAsset[];
  wallets: WalletBalance[];
}
