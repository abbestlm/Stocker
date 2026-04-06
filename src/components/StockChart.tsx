import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface StockChartProps {
  data: Array<{ date: string; price: number }>;
  isPositive: boolean;
}

export function StockChart({ data, isPositive }: StockChartProps) {
  const color = isPositive ? '#10b981' : '#ef4444'; // Emerald-500 or Red-500

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            fontSize={12}
            tickFormatter={(str) => {
              try {
                return format(parseISO(str), 'MMM d');
              } catch {
                return str;
              }
            }}
            minTickGap={30}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            itemStyle={{ color: '#f3f4f6' }}
            labelFormatter={(label) => {
              try {
                return format(parseISO(label), 'MMMM d, yyyy');
              } catch {
                return label;
              }
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrice)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
