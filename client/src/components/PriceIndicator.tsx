import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceIndicatorProps {
  value: number;
  className?: string;
}

export default function PriceIndicator({ value, className }: PriceIndicatorProps) {
  const isPositive = value >= 0;
  const absValue = Math.abs(value);
  
  return (
    <div
      className={cn(
        "flex items-center gap-1 transition-colors duration-200",
        isPositive ? "text-green-500" : "text-red-500",
        className
      )}
    >
      <div className="relative w-4 h-4">
        {isPositive ? (
          <ArrowUp className="w-4 h-4 animate-bounce" />
        ) : (
          <ArrowDown className="w-4 h-4 animate-bounce" />
        )}
      </div>
      <span className="font-medium">{absValue.toFixed(2)}%</span>
    </div>
  );
}
