import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

interface PriceChartProps {
  data: number[];
}

export default function PriceChart({ data }: PriceChartProps) {
  // Handle undefined or empty data
  if (!data || data.length === 0) {
    return <div className="w-full h-full bg-muted" />;
  }

  const chartData = data.map((value, index) => ({
    value,
    index
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <YAxis hide domain={['auto', 'auto']} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
