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
    date: d.date.slice(0, 5), // DD/MM
    Investimento: d.investimento,
    Faturamento: d.faturamento,
    Lucro: d.lucroPrejuizo,
  }));

  return (
    <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white">
          Investimento vs Faturamento
        </h3>
      </div>
      <div className="p-4" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(value))
              }
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
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
