import { EventoMetrics } from '@/types/metrics';
import {
  DollarSign,
  TrendingUp,
  Users,
  Megaphone,
} from 'lucide-react';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface StatCardsProps {
  data: EventoMetrics;
}

export default function StatCards({ data }: StatCardsProps) {
  const cards = [
    {
      label: 'FATURAMENTO',
      value: BRL.format(data.totalFaturamento),
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'LUCRO / PREJUIZO',
      value: BRL.format(data.totalLucroPrejuizo),
      icon: TrendingUp,
      gradient:
        data.totalLucroPrejuizo >= 0
          ? 'from-blue-500/10 to-blue-600/5'
          : 'from-red-500/10 to-red-600/5',
      iconColor:
        data.totalLucroPrejuizo >= 0 ? 'text-blue-500' : 'text-red-500',
      borderColor:
        data.totalLucroPrejuizo >= 0
          ? 'border-blue-500/20'
          : 'border-red-500/20',
    },
    {
      label: 'INVESTIMENTO',
      value: BRL.format(data.totalInvestimento),
      icon: Megaphone,
      gradient: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'INSCRITOS',
      value: data.totalInscritos.toLocaleString('pt-BR'),
      icon: Users,
      gradient: 'from-violet-500/10 to-violet-600/5',
      iconColor: 'text-violet-500',
      borderColor: 'border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.gradient} bg-card border ${card.borderColor} rounded-xl p-5 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${card.iconColor}`} />
              <span className="text-xs font-medium text-muted tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="text-sm font-bold font-mono text-fg">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
