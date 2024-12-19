import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PriceChart from "./PriceChart";
import PriceIndicator from "./PriceIndicator";
import { useState, useEffect } from "react";

interface AssetCardProps {
  asset: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    volume_24h: number;
    sparkline: number[];
    blockchain: string;
  };
}

const blockchainColors = {
  ethereum: "bg-purple-500/10 text-purple-500",
  solana: "bg-green-500/10 text-green-500",
  avalanche: "bg-red-500/10 text-red-500",
  bsc: "bg-yellow-500/10 text-yellow-500"
};

export default function AssetCard({ asset }: AssetCardProps) {
  const [prevPrice, setPrevPrice] = useState(asset.current_price);
  const [priceChangeAnimation, setPriceChangeAnimation] = useState<'increase' | 'decrease' | null>(null);

  useEffect(() => {
    if (asset.current_price !== prevPrice) {
      setPriceChangeAnimation(asset.current_price > prevPrice ? 'increase' : 'decrease');
      setPrevPrice(asset.current_price);

      const timer = setTimeout(() => {
        setPriceChangeAnimation(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [asset.current_price, prevPrice]);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{asset.name}</h3>
            <Badge variant="outline" className={blockchainColors[asset.blockchain as keyof typeof blockchainColors]}>
              {asset.blockchain.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground uppercase">{asset.symbol}</p>
        </div>
        <PriceIndicator value={asset.price_change_percentage_24h} />
      </div>

      <div className="mb-4">
        <p className={`text-2xl font-bold transition-colors duration-300 ${
          priceChangeAnimation === 'increase' ? 'text-green-500' :
          priceChangeAnimation === 'decrease' ? 'text-red-500' :
          ''
        }`}>
          ${asset.current_price.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Vol: ${asset.volume_24h ? new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2
          }).format(asset.volume_24h) : 'N/A'}
        </p>
      </div>

      <div className="h-[100px]">
        <PriceChart data={asset.sparkline || []} />
      </div>
    </Card>
  );
}
