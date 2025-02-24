
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  CompositeChart,
  Legend,
} from "recharts";
import { ChartData, TimeFrame, TechnicalIndicator } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { calculateRSI, calculateSMA, calculateEMA, getIndicatorInterpretation } from "@/lib/technicalIndicators";
import { useState, useMemo } from "react";

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
  const [showIndicators, setShowIndicators] = useState({
    rsi: true,
    sma: true,
    ema: true,
  });

  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    const prices = data.map(d => d.price);
    const rsi = calculateRSI(prices);
    const sma = calculateSMA(prices);
    const ema = calculateEMA(prices);

    return data.map((d, i) => ({
      ...d,
      rsi: rsi[i],
      sma: sma[i],
      ema: ema[i],
    }));
  }, [data]);

  const technicalIndicators: TechnicalIndicator[] = useMemo(() => {
    if (!chartData.length) return [];
    
    const lastIndex = chartData.length - 1;
    return [
      {
        name: 'RSI',
        value: Number(chartData[lastIndex].rsi?.toFixed(2)) || 0,
        interpretation: getIndicatorInterpretation(chartData[lastIndex].rsi || 0),
        description: 'Relative Strength Index measures momentum',
      },
      {
        name: 'SMA',
        value: Number(chartData[lastIndex].sma?.toFixed(2)) || 0,
        interpretation: chartData[lastIndex].price > (chartData[lastIndex].sma || 0) ? 'bullish' : 'bearish',
        description: '20-period Simple Moving Average',
      },
      {
        name: 'EMA',
        value: Number(chartData[lastIndex].ema?.toFixed(2)) || 0,
        interpretation: chartData[lastIndex].price > (chartData[lastIndex].ema || 0) ? 'bullish' : 'bearish',
        description: '20-period Exponential Moving Average',
      },
    ];
  }, [chartData]);

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
    <div className="space-y-4">
      <Card className="glass">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Price Chart</CardTitle>
            <div className="space-x-2">
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
          </div>
          <CardDescription>
            Technical Analysis and Price Movement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <CompositeChart data={chartData}>
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
                  yAxisId="price"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  width={80}
                />
                <YAxis
                  yAxisId="rsi"
                  orientation="right"
                  domain={[0, 100]}
                  hide={!showIndicators.rsi}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass p-3 rounded-lg space-y-2">
                          <p className="text-sm font-medium">
                            {format(new Date(payload[0].payload.timestamp), "PPp")}
                          </p>
                          <p className="text-sm">
                            Price: ${payload[0].value.toLocaleString()}
                          </p>
                          {showIndicators.rsi && (
                            <p className="text-sm">
                              RSI: {payload[1]?.value.toFixed(2)}
                            </p>
                          )}
                          {showIndicators.sma && (
                            <p className="text-sm">
                              SMA: ${payload[2]?.value.toFixed(2)}
                            </p>
                          )}
                          {showIndicators.ema && (
                            <p className="text-sm">
                              EMA: ${payload[3]?.value.toFixed(2)}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorPrice)"
                  name="Price"
                />
                {showIndicators.rsi && (
                  <Line
                    yAxisId="rsi"
                    type="monotone"
                    dataKey="rsi"
                    stroke="#FF8C00"
                    dot={false}
                    name="RSI"
                  />
                )}
                {showIndicators.sma && (
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="sma"
                    stroke="#8884d8"
                    dot={false}
                    name="SMA"
                  />
                )}
                {showIndicators.ema && (
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="ema"
                    stroke="#82ca9d"
                    dot={false}
                    name="EMA"
                  />
                )}
              </CompositeChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-2 mt-4">
            {Object.entries(showIndicators).map(([key, value]) => (
              <Button
                key={key}
                variant={value ? "default" : "outline"}
                onClick={() => setShowIndicators(prev => ({ ...prev, [key]: !value }))}
                size="sm"
              >
                {key.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {technicalIndicators.map((indicator) => (
          <Card key={indicator.name} className="glass">
            <CardHeader>
              <CardTitle className="text-lg">{indicator.name}</CardTitle>
              <CardDescription>{indicator.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-semibold ${
                indicator.interpretation === 'bullish' 
                  ? 'text-green-500' 
                  : indicator.interpretation === 'bearish' 
                    ? 'text-red-500' 
                    : 'text-yellow-500'
              }`}>
                {indicator.value}
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                Signal: {indicator.interpretation}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
