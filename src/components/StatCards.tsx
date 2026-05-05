import { DollarSign, ShoppingCart, TrendingUp, Target, Ticket, Receipt } from 'lucide-react';
import type { DesafioData } from '@/types/metrics';

interface StatCardsProps {
  data: DesafioData;
}

interface CardData {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  accentBg: string;
}

function CardGrid({ cards, cols }: { cards: CardData[]; cols: 3 | 4 | 5 }) {
  const gridClass =
    cols === 5 ? 'grid grid-cols-2 lg:grid-cols-5 gap-3'
    : cols === 4 ? 'grid grid-cols-2 lg:grid-cols-4 gap-3'
    : 'grid grid-cols-1 lg:grid-cols-3 gap-3';
  return (
    <div className={gridClass}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="card-3d p-2 sm:p-3">
            <div className="flex items-center justify-between mb-1.5 gap-1">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-heading leading-tight">
                {card.label}
              </p>
              <div className={`p-1 rounded-md shrink-0 ${card.accentBg} ${card.accentColor}`}>
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-bold font-mono text-foreground break-words leading-tight">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function StatCards({ data }: StatCardsProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const captacaoCards: CardData[] = [
    {
      label: 'INVESTIMENTO LIQUIDO',
      value: BRL.format(data.lucroPrejuizo),
      icon: Receipt,
      accentColor: 'text-red-500',
      accentBg: 'bg-red-500/8',
    },
    {
      label: 'INGRESSOS',
      value: data.ingressosTotais.toLocaleString('pt-BR'),
      icon: Ticket,
      accentColor: 'text-emerald-500',
      accentBg: 'bg-emerald-500/8',
    },
    {
      label: 'CORTESIAS',
      value: (data.cortesias ?? 0).toLocaleString('pt-BR'),
      icon: Ticket,
      accentColor: 'text-amber-500',
      accentBg: 'bg-amber-500/8',
    },
    {
      label: 'TICKET MEDIO INGRESSOS',
      value: BRL.format(data.ticketMedio),
      icon: Target,
      accentColor: 'text-cyan-500',
      accentBg: 'bg-cyan-500/8',
    },
    {
      label: 'FATURAMENTO CAPTACAO',
      value: BRL.format(data.faturamento + (data.faturamentoOrganico ?? 0)),
      icon: TrendingUp,
      accentColor: 'text-teal-500',
      accentBg: 'bg-teal-500/8',
    },
  ];

  const formacaoCards: CardData[] = [
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

  // Metricas organicas (vendas org, CPA total c/ org, ticket geral, prejuizo)
  // foram movidas para a secao "Tráfego" do componente ResumoGeral.tsx.
  return (
    <div className="space-y-3">
      <CardGrid cards={captacaoCards} cols={5} />
      <CardGrid cards={formacaoCards} cols={4} />
    </div>
  );
}
