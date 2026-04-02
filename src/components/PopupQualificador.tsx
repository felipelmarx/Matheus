import { FlaskConical, CalendarDays, DollarSign, ShoppingCart, Target, Percent, Users, TrendingUp, Tag } from 'lucide-react';
import type { PopupQualificadorDay, PopupQualificadorSide } from '@/types/metrics';

interface PopupQualificadorProps {
  days: PopupQualificadorDay[];
}

export default function PopupQualificador({ days }: PopupQualificadorProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const BRL2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (v: number) => v === 0 ? '--' : `${v.toFixed(2).replace('.', ',')}%`;
  const fmt = (v: number) => v === 0 ? '--' : BRL.format(v);
  const fmt2 = (v: number) => v === 0 ? '--' : BRL2.format(v);
  const fmtNum = (v: number) => v === 0 ? '--' : v.toLocaleString('pt-BR');

  if (days.length === 0) return null;

  const metrics: { key: keyof PopupQualificadorSide; label: string; format: (v: number) => string; icon: typeof DollarSign; color: string; lowerIsBetter?: boolean }[] = [
    { key: 'investimento', label: 'Investimento', format: fmt, icon: DollarSign, color: 'text-blue-400' },
    { key: 'custoEstimado', label: 'Custo Estimado', format: fmt2, icon: Target, color: 'text-orange-400', lowerIsBetter: true },
    { key: 'checkouts', label: 'Checkouts', format: fmtNum, icon: ShoppingCart, color: 'text-indigo-400' },
    { key: 'conversaoCheckout', label: 'Conv. Checkout', format: fmtPct, icon: Percent, color: 'text-cyan-400' },
    { key: 'proporcao', label: 'Proporcao', format: fmtPct, icon: Percent, color: 'text-violet-400' },
    { key: 'vendas', label: 'Vendas', format: fmtNum, icon: Users, color: 'text-indigo-400' },
    { key: 'cpaReal', label: 'CPA Real', format: fmt2, icon: Target, color: 'text-orange-400', lowerIsBetter: true },
    { key: 'faturamento', label: 'Faturamento', format: fmt, icon: TrendingUp, color: 'text-cyan-400' },
    { key: 'ticketMedio', label: 'Ticket Medio', format: fmt2, icon: Tag, color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Pop-up Qualificador (Teste)
        </h2>
        <span className="text-xs text-muted-foreground/60 font-mono">
          ({days.length} {days.length === 1 ? 'dia' : 'dias'})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {days.map((day, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-heading font-semibold text-foreground">{day.data}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                  Checkouts totais: {day.checkoutTotais}
                </span>
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 mb-2 pb-2 border-b border-border/50">
                <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Metrica</span>
                <span className="text-[10px] text-indigo-400 font-heading font-semibold text-right w-[5.5rem]">Qualif.</span>
                <span className="text-[10px] text-orange-400 font-heading font-semibold text-right w-[5.5rem]">Desqualif.</span>
              </div>

              {metrics.map((m) => {
                const qVal = day.qualificador[m.key];
                const dVal = day.desqualificado[m.key];
                const Icon = m.icon;

                // Highlight the better value
                let qBetter = false;
                let dBetter = false;
                if (qVal !== 0 && dVal !== 0 && qVal !== dVal) {
                  if (m.lowerIsBetter) {
                    qBetter = qVal < dVal;
                    dBetter = dVal < qVal;
                  } else {
                    qBetter = qVal > dVal;
                    dBetter = dVal > qVal;
                  }
                }

                return (
                  <div key={m.key} className="grid grid-cols-[1fr_auto_auto] gap-x-3 py-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <Icon className={`w-3 h-3 shrink-0 ${m.color}`} />
                      <span className="text-[11px] text-muted-foreground font-heading truncate">{m.label}</span>
                    </div>
                    <span className={`text-[11px] font-mono font-medium text-right w-[5.5rem] ${qBetter ? 'text-indigo-400 font-bold' : 'text-foreground'}`}>
                      {m.format(qVal)}
                    </span>
                    <span className={`text-[11px] font-mono font-medium text-right w-[5.5rem] ${dBetter ? 'text-indigo-400 font-bold' : 'text-foreground'}`}>
                      {m.format(dVal)}
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
