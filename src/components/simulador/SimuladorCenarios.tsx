import { TrendingDown, Minus, TrendingUp } from 'lucide-react';
import type { CenarioResult } from '@/hooks/useSimulador';

interface SimuladorCenariosProps {
  cenarios: CenarioResult[];
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const styles = [
  { bg: 'from-red-500/5', header: 'bg-red-500/10', text: 'text-red-400', icon: TrendingDown },
  { bg: 'from-primary/5', header: 'bg-primary/10', text: 'text-primary', icon: Minus },
  { bg: 'from-indigo-500/5', header: 'bg-indigo-500/10', text: 'text-indigo-400', icon: TrendingUp },
];

interface Row {
  label: string;
  get: (c: CenarioResult) => string;
  color?: (c: CenarioResult) => string;
}

const rows: Row[] = [
  { label: 'Cliques', get: (c) => c.outputs.cliques.toLocaleString('pt-BR') },
  { label: 'Vendas', get: (c) => c.outputs.vendas.toLocaleString('pt-BR') },
  { label: 'Receita', get: (c) => BRL.format(c.outputs.faturamentoTotal) },
  { label: 'CPA', get: (c) => BRL.format(c.outputs.cpa) },
  { label: 'EPC', get: (c) => `R$ ${c.outputs.epc.toFixed(2)}` },
  { label: 'Lucro', get: (c) => BRL.format(c.outputs.lucro), color: (c) => c.outputs.lucro >= 0 ? 'text-indigo-400' : 'text-red-400' },
  { label: 'ROI', get: (c) => `${c.outputs.roi.toFixed(1)}%`, color: (c) => c.outputs.roi >= 0 ? 'text-indigo-400' : 'text-red-400' },
  { label: 'ROAS', get: (c) => `${c.outputs.roas.toFixed(2)}x`, color: (c) => c.outputs.roas >= 1 ? 'text-indigo-400' : 'text-red-400' },
];

export default function SimuladorCenarios({ cenarios }: SimuladorCenariosProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Cenarios (±20% conversao e CPC)
        </h3>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border">
        {cenarios.map((c, i) => {
          const s = styles[i];
          const Icon = s.icon;
          return (
            <div key={c.label} className={`bg-gradient-to-b ${s.bg} to-transparent`}>
              <div className={`px-3 py-2 ${s.header} flex items-center justify-center gap-1.5`}>
                <Icon className={`w-3.5 h-3.5 ${s.text}`} />
                <span className={`text-xs font-heading font-semibold ${s.text}`}>{c.label}</span>
              </div>
              <div className="p-3 space-y-2">
                {rows.map((row) => (
                  <div key={row.label}>
                    <p className="text-[8px] uppercase tracking-wider text-muted-foreground/50 font-heading">{row.label}</p>
                    <p className={`text-[11px] font-mono font-bold ${row.color ? row.color(c) : 'text-foreground'}`}>
                      {row.get(c)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
