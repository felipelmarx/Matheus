import { DollarSign, ShoppingCart, TrendingUp, Target } from 'lucide-react';
import type { DesafioData } from '@/types/metrics';

interface StatCardsProps {
  data: DesafioData;
}

export default function StatCards({ data }: StatCardsProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const cards = [
    {
      label: 'INVESTIMENTO',
      value: BRL.format(data.investimento),
      icon: DollarSign,
      color: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'VENDAS FORMACAO',
      value: data.vendasFormacao.toLocaleString('pt-BR'),
      icon: ShoppingCart,
      color: 'from-emerald-500/10 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'FATURAMENTO FORMACAO',
      value: BRL.format(data.faturamentoTotal),
      icon: TrendingUp,
      color: 'from-violet-500/10 to-violet-600/5',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/20',
    },
    {
      label: 'TICKET MEDIO FORMACAO',
      value: BRL.format(data.ticketMedioFormacao),
      icon: Target,
      color: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-5 transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-heading">
                {card.label}
              </p>
              <div className={`p-1.5 rounded-lg bg-card/50 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
