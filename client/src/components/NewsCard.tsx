import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  news: {
    title: string;
    description: string;
    url: string;
    source: string;
    categories: string[];
    publishedAt: string;
  };
}

export default function NewsCard({ news }: NewsCardProps) {
  const formattedDate = new Date(news.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
          <a 
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {news.categories.map((category, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs">
            {news.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{news.description}</p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </CardContent>
    </Card>
  );
}
