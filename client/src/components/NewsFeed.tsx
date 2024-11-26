import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "@/lib/api";
import { Card } from "@/components/ui/card";
import NewsCard from "./NewsCard";
import { ErrorBoundary } from "./ErrorBoundary";

function NewsList() {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ["crypto-news"],
    queryFn: fetchNews,
    refetchInterval: 300000 // 5 minutes
  });

  if (error) {
    throw error;
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
      ) : news?.map((item) => (
        <NewsCard key={item.url} news={item} />
      ))}
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
