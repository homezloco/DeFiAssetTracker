import { useQuery } from "@tanstack/react-query";
import { fetchTopAssets } from "@/lib/api";
import AssetCard from "@/components/AssetCard";
import TrendingAssets from "@/components/TrendingAssets";
import NewsFeed from "@/components/NewsFeed";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Asset } from "@/types/asset";

export default function Home() {
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["top-assets"],
    queryFn: fetchTopAssets,
    refetchInterval: 60000 // Refetch every minute
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">DeFi Market Overview</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trending Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendingAssets />
        </CardContent>
      </Card>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="news">News Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-[200px] animate-pulse" />
              ))
            ) : (
              assets?.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="news">
          <NewsFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
