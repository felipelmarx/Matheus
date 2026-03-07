import { MousePointerClick, GitBranch } from 'lucide-react';
import type { DesafioData } from '@/types/metrics';

interface ResumoGeralProps {
  data: DesafioData;
}

interface MetricItem {
  label: string;
  value: string;
  isNegative?: boolean;
  isHighlight?: boolean;
}

interface MetricGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  headerBg: string;
  metrics: MetricItem[];
}

export default function ResumoGeral({ data }: ResumoGeralProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
  const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

  const roas = data.investimento > 0 ? (data.faturamento / data.investimento) : 0;

  const groups: MetricGroup[] = [
    {
      title: 'Trafego',
      icon: MousePointerClick,
      accentColor: 'text-cyan-400',
      headerBg: 'from-cyan-500/10 to-transparent',
      metrics: [
        { label: 'Cliques', value: fmtNum(data.cliques) },
        { label: 'View Pages', value: fmtNum(data.viewPages) },
        { label: 'Conect Rate', value: fmtPct(data.conectRate), isHighlight: data.conectRate >= 70 },
        { label: 'Investimento', value: fmt(data.investimento), isHighlight: true },
        { label: 'Vendas', value: fmtNum(data.vendas) },
        { label: 'Ingressos Totais (vendas + cortesia)', value: fmtNum(data.ingressosTotais) },
        { label: 'CPA', value: fmt(data.cpa) },
        { label: 'Ticket Medio', value: fmt(data.ticketMedio) },
        { label: 'Fat. Ingressos + Bumps', value: fmt(data.faturamento) },
        {
          label: 'Lucro / Prejuizo',
          value: data.lucroPrejuizo === 0 ? '--' : BRL.format(data.lucroPrejuizo),
          isNegative: data.lucroPrejuizo < 0,
        },
        { label: 'ROAS', value: roas === 0 ? '--' : roas.toFixed(2) + 'x', isHighlight: roas >= 2 },
      ],
    },
    {
      title: 'Funil',
      icon: GitBranch,
      accentColor: 'text-violet-400',
      headerBg: 'from-violet-500/10 to-transparent',
      metrics: [
        { label: 'Aplicacoes', value: fmtNum(data.aplicacoes) },
        { label: 'Custo / Aplicacao', value: fmt(data.custoPorAplicacao) },
        { label: 'Agendamentos', value: fmtNum(data.agendamentos) },
        { label: 'Entrevistas', value: fmtNum(data.entrevistas) },
        { label: 'Custo / Entrevista', value: fmt(data.custoEntrevista) },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
            <div className={`px-5 py-3 border-b border-border bg-gradient-to-r ${group.headerBg}`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${group.accentColor}`} />
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
                  {group.title}
                </h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {group.metrics.map((m) => (
                <div key={m.label} className="flex items-baseline justify-between gap-2">
                  <p className="text-xs text-muted-foreground font-heading shrink-0">{m.label}</p>
                  <div className="border-b border-dotted border-border/50 flex-1 mb-1 mx-1" />
                  <p
                    className={`text-sm font-mono font-medium whitespace-nowrap ${
                      m.isNegative
                        ? 'text-destructive'
                        : m.isHighlight
                          ? 'text-primary font-bold'
                          : 'text-foreground'
                    }`}
                  >
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
