import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "@/lib/api";
import { Card } from "@/components/ui/card";
import NewsCard from "./NewsCard";
import { ErrorBoundary } from "./ErrorBoundary";

function NewsList() {
  const { data: news, isLoading, error, refetch } = useQuery({
    queryKey: ["crypto-news"],
    queryFn: fetchNews,
    refetchInterval: 300000 // 5 minutes
  });

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-destructive">Unable to load news feed at this time.</p>
          <button 
            onClick={() => refetch()} 
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!isLoading && (!news || news.length === 0)) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">No news available at the moment.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </Card>
        ))
      ) : news?.length ? (
        news.map((item: any) => (
          <NewsCard key={item.url} news={item} />
        ))
      ) : (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">No news available at the moment.</p>
        </Card>
      )}
    </div>
  );
}

export default function NewsFeed() {
  return (
    <ErrorBoundary>
      <NewsList />
    </ErrorBoundary>
  );
}
