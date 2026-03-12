import { EventoMetrics } from '@/types/metrics';
import {
  ShoppingCart,
  Target,
  Receipt,
} from 'lucide-react';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface ResumoGeralProps {
  data: EventoMetrics;
}

interface MetricRow {
  label: string;
  value: string;
  highlight?: boolean;
  destructive?: boolean;
}

interface MetricGroup {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  metrics: MetricRow[];
}

export default function ResumoGeral({ data }: ResumoGeralProps) {
  const groups: MetricGroup[] = [
    {
      title: 'Vendas',
      icon: ShoppingCart,
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-500/20',
      metrics: [
        {
          label: 'Total de Vendas',
          value: data.totalVendas.toLocaleString('pt-BR'),
          highlight: true,
        },
        {
          label: 'Vendas via Ads',
          value: data.totalVendasAds.toLocaleString('pt-BR'),
        },
        {
          label: 'Vendas Organicas',
          value: data.totalVendasOrganicas.toLocaleString('pt-BR'),
        },
        {
          label: 'Ingressos Cortesia',
          value: data.totalIngressosCortesias.toLocaleString('pt-BR'),
        },
      ],
    },
    {
      title: 'Performance',
      icon: Target,
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/20',
      metrics: [
        {
          label: 'CPA Medio',
          value: BRL.format(data.cpaMedio),
          highlight: true,
        },
        {
          label: 'Ticket Medio',
          value: BRL.format(data.ticketMedio),
        },
        {
          label: 'ROI',
          value: `${data.roi.toFixed(1)}%`,
          highlight: true,
          destructive: data.roi < 0,
        },
      ],
    },
    {
      title: 'Financeiro',
      icon: Receipt,
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/20',
      metrics: [
        {
          label: 'Faturamento Total',
          value: BRL.format(data.totalFaturamento),
          highlight: true,
        },
        {
          label: 'Investimento Total',
          value: BRL.format(data.totalInvestimento),
        },
        {
          label: 'Lucro / Prejuizo',
          value: BRL.format(data.totalLucroPrejuizo),
          highlight: true,
          destructive: data.totalLucroPrejuizo < 0,
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <div
            key={group.title}
            className={`bg-card border ${group.borderColor} rounded-xl overflow-hidden`}
          >
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
              <Icon className={`w-4 h-4 ${group.iconColor}`} />
              <h3 className="text-sm font-semibold text-fg">
                {group.title}
              </h3>
            </div>
            <div className="px-5 py-3 space-y-2">
              {group.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between py-1 border-b border-dotted border-border last:border-0"
                >
                  <span className="text-xs text-muted">
                    {metric.label}
                  </span>
                  <span
                    className={`text-sm font-mono ${
                      metric.destructive
                        ? 'text-red-500 font-bold'
                        : metric.highlight
                        ? 'text-fg font-bold'
                        : 'text-muted'
                    }`}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
