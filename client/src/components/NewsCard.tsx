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
          {news.url !== '#' && (
            <a 
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {news.categories.map((category, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className={`text-xs ${
                category.toLowerCase() === 'update' ? 'bg-blue-500/10 text-blue-500' :
                category.toLowerCase() === 'milestone' ? 'bg-green-500/10 text-green-500' :
                category.toLowerCase() === 'partnership' ? 'bg-purple-500/10 text-purple-500' :
                'bg-gray-500/10 text-gray-500'
              }`}
            >
              {category}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs">
            {news.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{news.description}</p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </CardContent>
    </Card>
  );
}
