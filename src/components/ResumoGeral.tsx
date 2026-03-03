import type { DesafioData } from '@/types/metrics';

interface ResumoGeralProps {
  data: DesafioData;
}

interface MetricCard {
  label: string;
  value: string;
  isNegative?: boolean;
  isBold?: boolean;
}

interface MetricGroup {
  title: string;
  metrics: MetricCard[];
}

export default function ResumoGeral({ data }: ResumoGeralProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
  const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

  const roas = data.investimento > 0 ? (data.faturamentoTotal / data.investimento) : 0;
  const cliquePorVenda = data.vendas > 0 ? (data.cliques / data.vendas) : 0;
  const viewPagePorVenda = data.vendas > 0 ? (data.viewPages / data.vendas) : 0;

  const groups: MetricGroup[] = [
    {
      title: 'Periodo',
      metrics: [
        { label: 'Captacao', value: data.captacao || '--' },
        { label: 'Ao Vivo', value: data.aoVivo || '--' },
      ],
    },
    {
      title: 'Trafego',
      metrics: [
        { label: 'Cliques', value: fmtNum(data.cliques) },
        { label: 'View Pages', value: fmtNum(data.viewPages) },
        { label: 'Conect Rate', value: fmtPct(data.conectRate) },
      ],
    },
    {
      title: 'Aquisicao',
      metrics: [
        { label: 'Investimento', value: fmt(data.investimento), isBold: true },
        { label: 'Vendas', value: fmtNum(data.vendas) },
        { label: 'CPA', value: fmt(data.cpa) },
        { label: 'Ticket Medio', value: fmt(data.ticketMedio) },
      ],
    },
    {
      title: 'Receita',
      metrics: [
        { label: 'Faturamento (Ingressos + Bumps)', value: fmt(data.faturamento) },
        { label: 'Faturamento Total', value: fmt(data.faturamentoTotal), isBold: true },
        {
          label: 'Lucro / Prejuizo',
          value: data.lucroPrejuizo === 0 ? '--' : BRL.format(data.lucroPrejuizo),
          isNegative: data.lucroPrejuizo < 0,
        },
        { label: 'ROAS', value: roas === 0 ? '--' : roas.toFixed(2) + 'x', isBold: true },
      ],
    },
    {
      title: 'Funil',
      metrics: [
        { label: 'Aplicacoes', value: fmtNum(data.aplicacoes) },
        { label: 'Custo / Aplicacao', value: fmt(data.custoPorAplicacao) },
        { label: 'Agendamentos', value: fmtNum(data.agendamentos) },
        { label: 'Entrevistas', value: fmtNum(data.entrevistas) },
        { label: 'Custo / Entrevista', value: fmt(data.custoEntrevista) },
      ],
    },
    {
      title: 'Formacao',
      metrics: [
        { label: 'Vendas Formacao', value: fmtNum(data.vendasFormacao) },
        { label: 'Custo / Venda Formacao', value: fmt(data.custoVendasFormacao) },
        { label: 'Clique / Venda', value: cliquePorVenda === 0 ? '--' : cliquePorVenda.toFixed(1) },
        { label: 'View Page / Venda', value: viewPagePorVenda === 0 ? '--' : viewPagePorVenda.toFixed(1) },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-heading">
        RESUMO GERAL
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.title} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading">
                {group.title}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {group.metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-xs text-muted-foreground font-heading mb-1">{m.label}</p>
                  <p
                    className={`text-sm font-mono font-medium ${
                      m.isNegative
                        ? 'text-destructive'
                        : m.isBold
                          ? 'text-primary font-bold text-base'
                          : 'text-foreground'
                    }`}
                  >
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
