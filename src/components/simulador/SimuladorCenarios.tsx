import { TrendingDown, Minus, TrendingUp } from 'lucide-react';
import type { CenarioResult } from '@/hooks/useSimulador';

interface SimuladorCenariosProps {
  cenarios: CenarioResult[];
  variacao: number;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const cenarioStyles = [
  {
    border: 'border-red-500/30',
    bg: 'bg-gradient-to-b from-red-500/5 to-transparent',
    header: 'bg-red-500/10',
    headerText: 'text-red-400',
    icon: TrendingDown,
  },
  {
    border: 'border-primary/40',
    bg: 'bg-gradient-to-b from-primary/5 to-transparent',
    header: 'bg-primary/10',
    headerText: 'text-primary',
    icon: Minus,
  },
  {
    border: 'border-blue-500/30',
    bg: 'bg-gradient-to-b from-blue-500/5 to-transparent',
    header: 'bg-blue-500/10',
    headerText: 'text-blue-400',
    icon: TrendingUp,
  },
];

interface MetricRow {
  label: string;
  getValue: (c: CenarioResult) => string;
}

const metrics: MetricRow[] = [
  { label: 'Ingressos', getValue: (c) => c.outputs.ingressos.toLocaleString('pt-BR') },
  { label: 'Entrevistas', getValue: (c) => c.outputs.entrevistas.toLocaleString('pt-BR') },
  { label: 'Vendas Form.', getValue: (c) => c.outputs.vendasFormacao.toLocaleString('pt-BR') },
  { label: 'Faturamento', getValue: (c) => BRL.format(c.outputs.faturamentoTotal) },
  { label: 'Lucro', getValue: (c) => BRL.format(c.outputs.lucro) },
  { label: 'ROI', getValue: (c) => `${c.outputs.roi.toFixed(1)}%` },
  { label: 'ROAS', getValue: (c) => `${c.outputs.roas.toFixed(2)}x` },
];

export default function SimuladorCenarios({ cenarios, variacao }: SimuladorCenariosProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Comparacao de Cenarios ({variacao}% variacao)
        </h3>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border">
        {cenarios.map((cenario, idx) => {
          const style = cenarioStyles[idx];
          const Icon = style.icon;
          const isPositive = cenario.outputs.lucro >= 0;

          return (
            <div key={cenario.label} className={`${style.bg}`}>
              <div className={`px-3 py-2.5 ${style.header} flex items-center justify-center gap-1.5`}>
                <Icon className={`w-3.5 h-3.5 ${style.headerText}`} />
                <span className={`text-xs font-heading font-semibold ${style.headerText}`}>
                  {cenario.label}
                </span>
              </div>
              <div className="p-3 space-y-2.5">
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-heading">
                      {metric.label}
                    </p>
                    <p className={`text-xs font-mono font-bold ${
                      metric.label === 'Lucro'
                        ? isPositive ? 'text-emerald-400' : 'text-red-400'
                        : 'text-foreground'
                    }`}>
                      {metric.getValue(cenario)}
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
