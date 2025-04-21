
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PortfolioAsset, CryptoData } from "@/lib/types";

interface PortfolioChartProps {
  assets: PortfolioAsset[];
  cryptoList: CryptoData[];
}

export default function PortfolioChart({ assets, cryptoList }: PortfolioChartProps) {
  // Generate chart data
  const chartData = assets
    .map(asset => {
      const crypto = cryptoList.find(c => c.id === asset.cryptoId);
      if (!crypto) return null;
      
      const value = crypto.current_price * asset.amount;
      return {
        name: crypto.symbol.toUpperCase(),
        value,
        image: crypto.image,
      };
    })
    .filter(Boolean);

  // Generate colors based on the number of assets
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
    '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 rounded-lg border shadow">
          <div className="flex items-center space-x-2">
            <img src={payload[0].payload.image} alt={payload[0].name} className="w-5 h-5" />
            <p className="font-medium">{payload[0].name}</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm">
            {((payload[0].value / chartData.reduce((sum: number, item: any) => sum + item.value, 0)) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    // Only show label if segment is large enough
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {chartData[index].name}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
