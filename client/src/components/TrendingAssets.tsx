import { useQuery } from "@tanstack/react-query";
import { fetchTrendingAssets } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "./ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  score: number;
  price_btc: number;
}

interface TrendingItem {
  item: TrendingCoin & {
    price_usd: number;
    price_change_24h: number;
  };
}

interface TrendingResponse {
  coins: TrendingItem[];
}

function TrendingAssetsList() {
  const { data: trendingData, isLoading, error } = useQuery<TrendingResponse>({
    queryKey: ["trending"],
    queryFn: fetchTrendingAssets,
    refetchInterval: 300000,
    retry: 3
  });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Unable to load trending assets
      </p>
    );
  }

  return (
    <ScrollArea className="h-[100px]">
      <div className="flex gap-2 flex-wrap">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))
        ) : trendingData?.coins?.length ? (
          trendingData.coins.map(({ item }) => (
            <Badge 
              key={item.id} 
              variant="secondary" 
              className={`flex items-center gap-1 ${
                item.price_change_24h > 0 ? 'bg-green-500/10 text-green-500' :
                item.price_change_24h < 0 ? 'bg-red-500/10 text-red-500' :
                ''
              }`}
            >
              <span className="text-xs text-muted-foreground">
                #{item.market_cap_rank}
              </span>
              <span>{item.symbol.toUpperCase()}</span>
              <span>${(item.price_usd || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              })}</span>
              <span className="text-xs">
                {(item.price_change_24h || 0).toFixed(1)}%
              </span>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No trending assets available
          </p>
        )}
      </div>
    </ScrollArea>
  );
}

export default function TrendingAssets() {
  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Trending Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendingAssetsList />
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
