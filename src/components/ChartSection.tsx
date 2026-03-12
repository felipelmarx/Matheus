import { DailyData } from '@/types/metrics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartSectionProps {
  data: DailyData[];
}

export default function ChartSection({ data }: ChartSectionProps) {
  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    date: d.date.slice(0, 5),
    Investimento: d.investimento,
    Faturamento: d.faturamento,
    Lucro: d.lucroPrejuizo,
  }));

  const isLight =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'light';

  const gridColor = isLight ? '#e2e8f0' : '#1e293b';
  const axisColor = isLight ? '#94a3b8' : '#64748b';
  const tooltipBg = isLight ? '#ffffff' : '#1e293b';
  const tooltipBorder = isLight ? '#e2e8f0' : '#334155';
  const tooltipLabel = isLight ? '#0f172a' : '#e2e8f0';

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-fg">
          Investimento vs Faturamento
        </h3>
      </div>
      <div className="p-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              stroke={axisColor}
              fontSize={11}
              tickLine={false}
            />
            <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: tooltipLabel }}
              formatter={(value) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value))
              }
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: axisColor }}
            />
            <Bar
              dataKey="Investimento"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Faturamento"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
