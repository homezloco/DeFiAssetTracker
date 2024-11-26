import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PriceChart from "./PriceChart";

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
  const priceChangeColor = asset.price_change_percentage_24h >= 0 
    ? "text-green-500"
    : "text-red-500";

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
        <Badge variant={asset.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
          {asset.price_change_percentage_24h.toFixed(2)}%
        </Badge>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold">${asset.current_price.toLocaleString()}</p>
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
