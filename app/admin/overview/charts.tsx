'use client';

import { useTheme } from 'next-themes';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

type ChartsProps = {
  data: {
    salesData: {
      month: string;
      totalSales: number;
    }[];
  };
};
const Charts = ({ data: { salesData } }: ChartsProps) => {
  const { theme } = useTheme();

  const strokeColor = theme === 'light' ? '#888888' : 'white';

  const barFillColor = theme === 'light' ? 'current' : '#FFD100';

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={salesData}>
        <XAxis
          dataKey='month'
          stroke={strokeColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={strokeColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey='totalSales' fill={barFillColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Charts;
