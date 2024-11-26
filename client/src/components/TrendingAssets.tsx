import { useQuery } from "@tanstack/react-query";
import { fetchTrendingAssets } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "./ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingCoin {
  item: {
    id: string;
    symbol: string;
    name: string;
    price_btc: number;
    market_cap_rank: number;
  }
}

function TrendingAssetsList() {
  const { data: trending, isLoading, error } = useQuery<{ coins: TrendingCoin[] }>({
    queryKey: ["trending"],
    queryFn: fetchTrendingAssets,
    refetchInterval: 300000 // 5 minutes
  });

  if (error) {
    throw error; // ErrorBoundary will catch this
  }

  return (
    <ScrollArea className="h-[100px]">
      <div className="flex gap-2 flex-wrap">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))
        ) : trending?.coins?.length ? (
          trending.coins.map((coin) => (
            <Badge key={coin.item.id} variant="secondary" className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">#{coin.item.market_cap_rank}</span>
              <span>{coin.item.symbol.toUpperCase()}</span>
              <span>{Number(coin.item.price_btc).toFixed(8)} BTC</span>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No trending assets available</p>
        )}
      </div>
    </ScrollArea>
  );
}

export default function TrendingAssets() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorBoundary>
          <TrendingAssetsList />
        </ErrorBoundary>
      </CardContent>
    </Card>
  );
}
