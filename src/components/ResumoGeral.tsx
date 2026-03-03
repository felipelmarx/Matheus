import type { DashboardData } from '@/types/metrics';

interface ResumoGeralProps {
  data: DashboardData;
}

interface MetricRow {
  label: string;
  value: string;
  isNegative?: boolean;
}

export default function ResumoGeral({ data }: ResumoGeralProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
  const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

  const roas = data.investimento > 0 ? (data.faturamento / data.investimento) : 0;
  const cliquePorVenda = data.vendas > 0 ? (data.cliques / data.vendas) : 0;
  const viewPagePorVenda = data.vendas > 0 ? (data.viewPages / data.vendas) : 0;

  const metrics: MetricRow[] = [
    { label: 'Periodo', value: data.periodo || '--' },
    { label: 'Investimento', value: fmt(data.investimento) },
    { label: 'Vendas', value: fmtNum(data.vendas) },
    { label: 'Ingressos Cortesias', value: '--' },
    { label: 'Ingressos TOTAIS', value: fmt(data.faturamento) },
    { label: 'Leads no Grupo', value: '--' },
    { label: 'Conversao de Entrada', value: fmtPct(data.conectRate) },
    { label: 'CPA', value: fmt(data.cpa) },
    { label: 'Ticket Medio', value: fmt(data.ticketMedio) },
    { label: 'Faturamento', value: fmt(data.faturamento) },
    {
      label: 'Lucro / Prejuizo',
      value: data.lucroPrejuizo === 0 ? '--' : BRL.format(data.lucroPrejuizo),
      isNegative: data.lucroPrejuizo < 0,
    },
    { label: 'ROAS', value: roas === 0 ? '--' : roas.toFixed(2) + 'x' },
    { label: 'Clique / Venda', value: cliquePorVenda === 0 ? '--' : cliquePorVenda.toFixed(1) },
    { label: 'View Page / Venda', value: viewPagePorVenda === 0 ? '--' : viewPagePorVenda.toFixed(1) },
    { label: 'Checkout / Venda', value: '--' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-heading">
          RESUMO GERAL
        </h2>
      </div>
      <div className="divide-y divide-border">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between px-6 py-3">
            <span className="text-sm text-foreground font-heading">{m.label}</span>
            <span
              className={`text-sm font-mono font-medium ${
                m.isNegative ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
