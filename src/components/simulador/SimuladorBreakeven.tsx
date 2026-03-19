import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Crosshair } from 'lucide-react';
import type { BreakevenPoint } from '@/hooks/useSimulador';

interface SimuladorBreakevenProps {
  data: BreakevenPoint[];
  isOverride?: boolean;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function findBreakeven(data: BreakevenPoint[]): number | null {
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    if (prev.lucro <= 0 && curr.lucro > 0) {
      const ratio = Math.abs(prev.lucro) / (Math.abs(prev.lucro) + curr.lucro);
      return prev.investimento + ratio * (curr.investimento - prev.investimento);
    }
  }
  return null;
}

export default function SimuladorBreakeven({ data, isOverride }: SimuladorBreakevenProps) {
  const breakeven = findBreakeven(data);
  const allNegative = data.every(d => d.lucro < 0);
  const allPositive = data.every(d => d.lucro >= 0);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-primary" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Break-Even
          </h3>
        </div>
        {breakeven !== null && (
          <span className="text-xs font-mono font-bold text-primary">
            {BRL.format(breakeven)} investimento
          </span>
        )}
        {allNegative && (
          <span className="text-xs font-mono font-bold text-red-400">
            Sem break-even no range
          </span>
        )}
        {allPositive && (
          <span className="text-xs font-mono font-bold text-emerald-400">
            Sempre lucrativo
          </span>
        )}
      </div>

      <div className="p-4">
        {isOverride && (
          <p className="text-[9px] text-muted-foreground/50 font-mono text-center mb-2">
            Volume fixo de ingressos — curva mostra limite de investimento lucrativo
          </p>
        )}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="lucroPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
            <XAxis
              dataKey="investimento"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              stroke="hsl(215, 15%, 40%)"
              fontSize={10}
              fontFamily="monospace"
            />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              stroke="hsl(215, 15%, 40%)"
              fontSize={10}
              fontFamily="monospace"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 10%)',
                border: '1px solid hsl(220, 14%, 20%)',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              formatter={(value: number | string, name: string) => [
                BRL.format(Number(value)),
                name === 'lucro' ? 'Lucro' : 'Faturamento',
              ]}
              labelFormatter={(label: string) => `Investimento: ${BRL.format(Number(label))}`}
            />
            <ReferenceLine y={0} stroke="hsl(215, 15%, 40%)" strokeDasharray="4 4" />
            {breakeven !== null && (
              <ReferenceLine
                x={breakeven}
                stroke="hsl(145, 60%, 45%)"
                strokeDasharray="4 4"
                label={{
                  value: 'Break-even',
                  position: 'top',
                  fill: 'hsl(145, 60%, 45%)',
                  fontSize: 10,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="lucro"
              stroke="hsl(145, 60%, 45%)"
              fill="url(#lucroPositive)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
