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
}

export default function SimuladorKPIs({ outputs }: SimuladorKPIsProps) {
  const lucroPositive = outputs.lucro >= 0;
  const roiPositive = outputs.roi >= 0;
  const roasPositive = outputs.roas >= 1;

  const cards: KPICard[] = [
    {
      label: 'CLIQUES',
      value: outputs.cliques.toLocaleString('pt-BR'),
      color: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'VENDAS',
      value: outputs.vendas.toLocaleString('pt-BR'),
      sub: `Break-even: ${outputs.breakevenVendas} vendas`,
      color: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-500/20',
    },
    {
      label: 'RECEITA TOTAL',
      value: BRL.format(outputs.receitaTotal),
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
      label: 'LUCRO',
      value: BRL.format(outputs.lucro),
      color: lucroPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      borderColor: lucroPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      valueColor: lucroPositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'ROI',
      value: `${outputs.roi.toFixed(1)}%`,
      color: roiPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      borderColor: roiPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      valueColor: roiPositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'ROAS',
      value: `${outputs.roas.toFixed(2)}x`,
      color: roasPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      borderColor: roasPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      valueColor: roasPositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'CPA',
      value: BRL.format(outputs.cpa),
      color: 'from-amber-500/10 to-amber-600/5',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-4 transition-all hover:scale-[1.02]`}
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading mb-2">
            {card.label}
          </p>
          <p className={`text-sm font-bold font-mono ${card.valueColor || 'text-foreground'}`}>
            {card.value}
          </p>
          {card.sub && (
            <p className="text-[9px] text-muted-foreground/60 font-mono mt-1 leading-tight">
              {card.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
