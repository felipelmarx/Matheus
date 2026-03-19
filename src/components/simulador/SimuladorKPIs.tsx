import { TrendingUp, TrendingDown, DollarSign, Target, Users, Award } from 'lucide-react';
import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorKPIsProps {
  outputs: SimuladorOutputs;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SimuladorKPIs({ outputs }: SimuladorKPIsProps) {
  const isPositive = outputs.lucro >= 0;

  const cards = [
    {
      label: 'ROI',
      value: `${outputs.roi.toFixed(1)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      iconColor: isPositive ? 'text-emerald-400' : 'text-red-400',
      borderColor: isPositive ? 'border-emerald-500/20' : 'border-red-500/20',
    },
    {
      label: 'ROAS',
      value: `${outputs.roas.toFixed(2)}x`,
      icon: Target,
      color: outputs.roas >= 1 ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      iconColor: outputs.roas >= 1 ? 'text-emerald-400' : 'text-red-400',
      borderColor: outputs.roas >= 1 ? 'border-emerald-500/20' : 'border-red-500/20',
    },
    {
      label: 'LUCRO PROJETADO',
      value: BRL.format(outputs.lucro),
      icon: DollarSign,
      color: isPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      iconColor: isPositive ? 'text-emerald-400' : 'text-red-400',
      borderColor: isPositive ? 'border-emerald-500/20' : 'border-red-500/20',
    },
    {
      label: 'CPA INGRESSO',
      value: BRL.format(outputs.cpa),
      icon: DollarSign,
      color: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'CUSTO / ENTREVISTA',
      value: BRL.format(outputs.custoEntrevista),
      icon: Users,
      color: 'from-violet-500/10 to-violet-600/5',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
    },
    {
      label: 'CUSTO / VENDA FORM.',
      value: BRL.format(outputs.custoVendaFormacao),
      icon: Award,
      color: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-4 transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading">
                {card.label}
              </p>
              <div className={`p-1 rounded-lg bg-card/50 ${card.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-sm font-bold font-mono text-foreground">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
