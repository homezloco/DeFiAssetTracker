import { useQuery } from "@tanstack/react-query";
import { fetchTrendingAssets } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TrendingAssets() {
  const { data: trending, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrendingAssets,
    refetchInterval: 300000 // 5 minutes
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[100px]">
          <div className="flex gap-2 flex-wrap">
            {isLoading ? (
              <p className="text-muted-foreground">Loading trending assets...</p>
            ) : trending?.coins?.map((coin: { item: { id: string; symbol: string; price_btc: number } }) => (
              <Badge key={coin.item.id} variant="secondary">
                {coin.item.symbol.toUpperCase()} {coin.item.price_btc.toFixed(8)} BTC
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
