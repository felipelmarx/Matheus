import { DollarSign, ShoppingCart, TrendingUp, Target, Ticket, Receipt, MousePointerClick, Percent, ShoppingBag } from 'lucide-react';
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

function CardGrid({ cards }: { cards: CardData[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="card-3d p-3 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-1">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-heading leading-tight">
                {card.label}
              </p>
              <div className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${card.accentBg} ${card.accentColor}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
  const DASH = '\u2014'; // em-dash for missing data

  // CPC Facebook: investimento / cliques
  const cpcFacebook = data.cliques > 0 ? data.investimento / data.cliques : 0;
  const cpcValue = cpcFacebook > 0
    ? BRL.format(cpcFacebook)
    : DASH;

  // Conversão Página -> Checkout: (checkouts / viewPages) * 100
  const hasCheckouts = typeof data.checkouts === 'number' && data.checkouts > 0;
  const convPageCheckout = hasCheckouts && data.viewPages > 0
    ? (((data.checkouts as number) / data.viewPages) * 100)
    : null;
  const convPageCheckoutValue = convPageCheckout !== null
    ? `${convPageCheckout.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
    : DASH;

  // Conversão Checkout -> Venda: (vendas / checkouts) * 100
  const convCheckoutVenda = hasCheckouts && (data.checkouts as number) > 0 && data.vendas > 0
    ? ((data.vendas / (data.checkouts as number)) * 100)
    : null;
  const convCheckoutVendaValue = convCheckoutVenda !== null
    ? `${convCheckoutVenda.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
    : DASH;

  const funnelCards: CardData[] = [
    {
      label: 'CUSTO POR CLICK (FB)',
      value: cpcValue,
      icon: MousePointerClick,
      accentColor: 'text-sky-500',
      accentBg: 'bg-sky-500/8',
    },
    {
      label: 'CONV. PAGINA -> CHECKOUT',
      value: convPageCheckoutValue,
      icon: Percent,
      accentColor: 'text-fuchsia-500',
      accentBg: 'bg-fuchsia-500/8',
    },
    {
      label: 'CONV. CHECKOUT -> VENDA',
      value: convCheckoutVendaValue,
      icon: ShoppingBag,
      accentColor: 'text-rose-500',
      accentBg: 'bg-rose-500/8',
    },
  ];

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
      value: BRL.format(data.faturamento),
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

  return (
    <div className="space-y-4">
      <CardGrid cards={captacaoCards} />
      <CardGrid cards={formacaoCards} />
      <CardGrid cards={funnelCards} />
    </div>
  );
}
