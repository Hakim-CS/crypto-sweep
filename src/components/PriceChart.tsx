
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartData, TimeFrame } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface PriceChartProps {
  data: ChartData[];
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

export default function PriceChart({
  data,
  timeFrame,
  onTimeFrameChange,
}: PriceChartProps) {
  const timeFrames: TimeFrame[] = ["24h", "7d", "30d"];

  const formatXAxis = (timestamp: number) => {
    switch (timeFrame) {
      case "24h":
        return format(new Date(timestamp), "HH:mm");
      case "7d":
        return format(new Date(timestamp), "MMM dd");
      case "30d":
        return format(new Date(timestamp), "MMM dd");
      default:
        return "";
    }
  };

  return (
    <div className="w-full h-[400px] glass rounded-lg p-4">
      <div className="flex justify-end space-x-2 mb-4">
        {timeFrames.map((tf) => (
          <Button
            key={tf}
            variant={timeFrame === tf ? "default" : "outline"}
            onClick={() => onTimeFrameChange(tf)}
            size="sm"
          >
            {tf}
          </Button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            minTickGap={30}
            tickMargin={10}
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glass p-2 rounded">
                    <p className="text-sm">
                      {format(new Date(payload[0].payload.timestamp), "PPp")}
                    </p>
                    <p className="text-sm font-semibold">
                      ${payload[0].value.toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
