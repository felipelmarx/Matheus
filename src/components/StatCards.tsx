import { DollarSign, ShoppingCart, Ticket, Target } from 'lucide-react';
import type { DesafioData } from '@/types/metrics';

interface StatCardsProps {
  data: DesafioData;
}

export default function StatCards({ data }: StatCardsProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const cards = [
    { label: 'INVESTIMENTO', value: BRL.format(data.investimento), icon: DollarSign },
    { label: 'VENDAS', value: data.vendas.toLocaleString('pt-BR'), icon: ShoppingCart },
    { label: 'FATURAMENTO TOTAL', value: BRL.format(data.faturamentoTotal), icon: Ticket },
    { label: 'CPA', value: BRL.format(data.cpa), icon: Target },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-xl p-5"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-heading mb-3">
            {card.label}
          </p>
          <p className="text-xl font-bold font-mono text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
