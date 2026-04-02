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
      accentColor: 'text-blue-500',
      accentBg: 'bg-blue-500/8',
    },
    {
      label: 'VENDAS FORMACAO',
      value: data.vendasFormacao.toLocaleString('pt-BR'),
      icon: ShoppingCart,
      accentColor: 'text-indigo-500',
      accentBg: 'bg-indigo-500/8',
    },
    {
      label: 'FATURAMENTO FORMACAO',
      value: BRL.format(data.faturamentoTotal),
      icon: TrendingUp,
      accentColor: 'text-violet-500',
      accentBg: 'bg-violet-500/8',
    },
    {
      label: 'TICKET MEDIO FORMACAO',
      value: BRL.format(data.ticketMedioFormacao),
      icon: Target,
      accentColor: 'text-amber-500',
      accentBg: 'bg-amber-500/8',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="card-3d p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-heading">
                {card.label}
              </p>
              <div className={`p-1.5 rounded-lg ${card.accentBg} ${card.accentColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-sm font-bold font-mono text-foreground">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
