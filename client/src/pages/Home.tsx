import { useQuery } from "@tanstack/react-query";
import { fetchTopAssets } from "@/lib/api";
import AssetCard from "@/components/AssetCard";
import TrendingAssets from "@/components/TrendingAssets";
import NewsFeed from "@/components/NewsFeed";
import { Card } from "@/components/ui/card";
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

      <TrendingAssets />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 order-2 lg:order-1">
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
        </div>
        
        <div className="order-1 lg:order-2">
          <h2 className="text-2xl font-bold mb-4">Latest News</h2>
          <NewsFeed />
        </div>
      </div>
    </div>
  );
}
