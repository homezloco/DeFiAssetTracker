import { Line, LineChart, ResponsiveContainer, YAxis, Tooltip, Area } from "recharts";
import { Card } from "@/components/ui/card";

interface PriceChartProps {
  data: number[];
  isPositive?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-2 bg-background/95 backdrop-blur-sm border shadow-lg">
        <p className="text-sm font-medium">${payload[0].value.toFixed(2)}</p>
      </Card>
    );
  }
  return null;
};

export default function PriceChart({ data, isPositive = true }: PriceChartProps) {
  // Handle undefined or empty data
  if (!data || data.length === 0) {
    return <div className="w-full h-full bg-muted rounded-md animate-pulse" />;
  }

  const chartData = data.map((value, index) => ({
    value,
    index
  }));

  const strokeColor = isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const gradientColor = isPositive ? "rgb(34,197,94)" : "rgb(239,68,68)";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColor} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
          fillOpacity={1}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
          animationDuration={750}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
