import { CalendarDays, DollarSign, ShoppingCart, Target, Tag, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import type { DailyMetric } from '@/types/metrics';

interface DetalhamentoDiaProps {
  daily: DailyMetric[];
}

export default function DetalhamentoDia({ daily }: DetalhamentoDiaProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

  if (daily.length === 0) return null;

  const metrics = [
    { key: 'investimento' as const, label: 'Investimento', icon: DollarSign, iconColor: 'text-blue-400', format: fmt },
    { key: 'vendas' as const, label: 'Vendas', icon: ShoppingCart, iconColor: 'text-emerald-400', format: fmtNum },
    { key: 'cpa' as const, label: 'CPA', icon: Target, iconColor: 'text-orange-400', format: fmt },
    { key: 'ticketMedio' as const, label: 'Ticket Médio', icon: Tag, iconColor: 'text-amber-400', format: fmt },
    { key: 'faturamento' as const, label: 'Faturamento', icon: TrendingUp, iconColor: 'text-cyan-400', format: fmt },
    { key: 'lucroPrejuizo' as const, label: 'Lucro / Prejuízo', icon: TrendingDown, iconColor: 'text-violet-400', format: fmt, isProfit: true },
    { key: 'cortesia' as const, label: 'Cortesia', icon: Gift, iconColor: 'text-pink-400', format: fmtNum },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Detalhamento por Dia
        </h2>
        <span className="text-xs text-muted-foreground/60 font-mono">
          ({daily.length} dias)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {daily.map((day, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-heading font-semibold text-foreground">
                  {day.data}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {metrics.map((m) => {
                const Icon = m.icon;
                const value = day[m.key];
                const isNegative = m.isProfit && value < 0;
                const isPositive = m.isProfit && value > 0;

                return (
                  <div key={m.key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Icon className={`w-3 h-3 ${m.iconColor}`} />
                      <span className="text-xs text-muted-foreground font-heading">
                        {m.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-medium whitespace-nowrap ${
                        isNegative
                          ? 'text-destructive'
                          : isPositive
                            ? 'text-primary font-bold'
                            : 'text-foreground'
                      }`}
                    >
                      {m.format(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
