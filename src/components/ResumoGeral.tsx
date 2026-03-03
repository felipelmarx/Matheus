import type { DesafioData } from '@/types/metrics';

interface ResumoGeralProps {
  data: DesafioData;
}

interface MetricRow {
  label: string;
  value: string;
  isNegative?: boolean;
  isBold?: boolean;
}

export default function ResumoGeral({ data }: ResumoGeralProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
  const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

  const roas = data.investimento > 0 ? (data.faturamentoTotal / data.investimento) : 0;
  const cliquePorVenda = data.vendas > 0 ? (data.cliques / data.vendas) : 0;
  const viewPagePorVenda = data.vendas > 0 ? (data.viewPages / data.vendas) : 0;

  const metrics: MetricRow[] = [
    { label: 'Captacao', value: data.captacao || '--' },
    { label: 'Ao Vivo', value: data.aoVivo || '--' },
    { label: 'Cliques', value: fmtNum(data.cliques) },
    { label: 'View Pages', value: fmtNum(data.viewPages) },
    { label: 'Conect Rate', value: fmtPct(data.conectRate) },
    { label: 'Investimento', value: fmt(data.investimento), isBold: true },
    { label: 'Vendas', value: fmtNum(data.vendas) },
    { label: 'CPA', value: fmt(data.cpa) },
    { label: 'Ticket Medio', value: fmt(data.ticketMedio) },
    { label: 'Faturamento (Ingressos + Bumps)', value: fmt(data.faturamento) },
    {
      label: 'Lucro / Prejuizo',
      value: data.lucroPrejuizo === 0 ? '--' : BRL.format(data.lucroPrejuizo),
      isNegative: data.lucroPrejuizo < 0,
    },
    { label: 'Aplicacoes', value: fmtNum(data.aplicacoes) },
    { label: 'Custo por Aplicacao', value: fmt(data.custoPorAplicacao) },
    { label: 'Agendamentos', value: fmtNum(data.agendamentos) },
    { label: 'Entrevistas', value: fmtNum(data.entrevistas) },
    { label: 'Custo por Entrevista', value: fmt(data.custoEntrevista) },
    { label: 'Vendas da Formacao', value: fmtNum(data.vendasFormacao) },
    { label: 'Custo por Venda Formacao', value: fmt(data.custoVendasFormacao) },
    { label: 'Faturamento Total', value: fmt(data.faturamentoTotal), isBold: true },
    { label: 'ROAS', value: roas === 0 ? '--' : roas.toFixed(2) + 'x', isBold: true },
    { label: 'Clique / Venda', value: cliquePorVenda === 0 ? '--' : cliquePorVenda.toFixed(1) },
    { label: 'View Page / Venda', value: viewPagePorVenda === 0 ? '--' : viewPagePorVenda.toFixed(1) },
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
            <span className={`text-sm font-heading ${m.isBold ? 'font-semibold text-foreground' : 'text-foreground'}`}>
              {m.label}
            </span>
            <span
              className={`text-sm font-mono font-medium ${
                m.isNegative ? 'text-destructive' : m.isBold ? 'text-primary font-bold' : 'text-foreground'
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
