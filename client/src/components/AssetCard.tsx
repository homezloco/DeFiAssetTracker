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
  };
}

export default function AssetCard({ asset }: AssetCardProps) {
  const priceChangeColor = asset.price_change_percentage_24h >= 0 
    ? "text-green-500"
    : "text-red-500";

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{asset.name}</h3>
          <p className="text-muted-foreground uppercase">{asset.symbol}</p>
        </div>
        <Badge variant={asset.price_change_percentage_24h >= 0 ? "default" : "destructive"}>
          {asset.price_change_percentage_24h.toFixed(2)}%
        </Badge>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold">${asset.current_price.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">
          Vol: ${(asset.volume_24h / 1000000).toFixed(2)}M
        </p>
      </div>

      <div className="h-[100px]">
        <PriceChart data={asset.sparkline || []} />
      </div>
    </Card>
  );
}
