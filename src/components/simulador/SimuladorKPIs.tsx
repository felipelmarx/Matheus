import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorKPIsProps {
  outputs: SimuladorOutputs;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface KPICard {
  label: string;
  value: string;
  sub?: string;
  color: string;
  borderColor: string;
  valueColor?: string;
  size?: 'normal' | 'large';
}

export default function SimuladorKPIs({ outputs }: SimuladorKPIsProps) {
  const lucroPos = outputs.lucro >= 0;
  const roiPos = outputs.roi >= 0;

  const topCards: KPICard[] = [
    {
      label: 'LUCRO',
      value: BRL.format(outputs.lucro),
      size: 'large',
      color: lucroPos ? 'from-emerald-500/15 to-emerald-600/5' : 'from-red-500/15 to-red-600/5',
      borderColor: lucroPos ? 'border-emerald-500/30' : 'border-red-500/30',
      valueColor: lucroPos ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'ROI',
      value: `${outputs.roi.toFixed(1)}%`,
      size: 'large',
      color: roiPos ? 'from-emerald-500/15 to-emerald-600/5' : 'from-red-500/15 to-red-600/5',
      borderColor: roiPos ? 'border-emerald-500/30' : 'border-red-500/30',
      valueColor: roiPos ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'ROAS',
      value: `${outputs.roas.toFixed(2)}x`,
      size: 'large',
      color: outputs.roas >= 1 ? 'from-emerald-500/15 to-emerald-600/5' : 'from-red-500/15 to-red-600/5',
      borderColor: outputs.roas >= 1 ? 'border-emerald-500/30' : 'border-red-500/30',
      valueColor: outputs.roas >= 1 ? 'text-emerald-400' : 'text-red-400',
    },
  ];

  const detailCards: KPICard[] = [
    {
      label: 'RECEITA',
      value: BRL.format(outputs.receitaLiquida),
      color: 'from-primary/10 to-primary/5',
      borderColor: 'border-primary/20',
    },
    {
      label: 'TICKET MEDIO',
      value: BRL.format(outputs.ticketMedio),
      color: 'from-violet-500/10 to-violet-600/5',
      borderColor: 'border-violet-500/20',
    },
    {
      label: 'EPC',
      value: `R$ ${outputs.epc.toFixed(2)}`,
      sub: 'Earnings Per Click',
      color: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-500/20',
    },
    {
      label: 'CPA',
      value: BRL.format(outputs.cpa),
      color: 'from-amber-500/10 to-amber-600/5',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'BREAK-EVEN',
      value: `${outputs.breakevenVendas} vendas`,
      color: 'from-pink-500/10 to-pink-600/5',
      borderColor: 'border-pink-500/20',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Top 3: Lucro, ROI, ROAS */}
      <div className="grid grid-cols-3 gap-3">
        {topCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-4 transition-all hover:scale-[1.02]`}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
              {card.label}
            </p>
            <p className={`text-lg font-bold font-mono ${card.valueColor || 'text-foreground'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {detailCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-3 transition-all hover:scale-[1.02]`}
          >
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
              {card.label}
            </p>
            <p className="text-sm font-bold font-mono text-foreground">
              {card.value}
            </p>
            {card.sub && (
              <p className="text-[8px] text-muted-foreground/60 font-mono mt-0.5">
                {card.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
