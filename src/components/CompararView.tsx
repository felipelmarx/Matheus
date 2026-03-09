import { useState } from 'react';
import { ArrowLeftRight, MousePointerClick, DollarSign, GitBranch, GraduationCap, AlertTriangle } from 'lucide-react';
import type { AllDesafiosData, DesafioData, DesafioKey } from '@/types/metrics';

interface CompararViewProps {
  data: AllDesafiosData;
}

interface MetricRow {
  label: string;
  key: keyof DesafioData;
  format: 'brl' | 'num' | 'pct';
  invertColor?: boolean; // true for cost metrics where lower = better
}

interface MetricSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  headerBg: string;
  rows: MetricRow[];
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

function formatValue(v: number, format: 'brl' | 'num' | 'pct'): string {
  if (format === 'brl') return fmt(v);
  if (format === 'pct') return fmtPct(v);
  return fmtNum(v);
}

const sections: MetricSection[] = [
  {
    title: 'Trafego',
    icon: MousePointerClick,
    accentColor: 'text-cyan-400',
    headerBg: 'from-cyan-500/10 to-transparent',
    rows: [
      { label: 'Cliques', key: 'cliques', format: 'num' },
      { label: 'View Pages', key: 'viewPages', format: 'num' },
      { label: 'Conect Rate', key: 'conectRate', format: 'pct' },
    ],
  },
  {
    title: 'Investimento & Receita',
    icon: DollarSign,
    accentColor: 'text-blue-400',
    headerBg: 'from-blue-500/10 to-transparent',
    rows: [
      { label: 'Investimento', key: 'investimento', format: 'brl', invertColor: true },
      { label: 'Vendas', key: 'vendas', format: 'num' },
      { label: 'Ingressos Totais', key: 'ingressosTotais', format: 'num' },
      { label: 'CPA', key: 'cpa', format: 'brl', invertColor: true },
      { label: 'Ticket Medio', key: 'ticketMedio', format: 'brl' },
      { label: 'Faturamento', key: 'faturamento', format: 'brl' },
      { label: 'Lucro / Prejuizo', key: 'lucroPrejuizo', format: 'brl' },
    ],
  },
  {
    title: 'Funil',
    icon: GitBranch,
    accentColor: 'text-violet-400',
    headerBg: 'from-violet-500/10 to-transparent',
    rows: [
      { label: 'Aplicacoes', key: 'aplicacoes', format: 'num' },
      { label: 'Custo / Aplicacao', key: 'custoPorAplicacao', format: 'brl', invertColor: true },
      { label: 'Agendamentos', key: 'agendamentos', format: 'num' },
      { label: 'Entrevistas', key: 'entrevistas', format: 'num' },
      { label: 'Custo / Entrevista', key: 'custoEntrevista', format: 'brl', invertColor: true },
    ],
  },
  {
    title: 'Formacao',
    icon: GraduationCap,
    accentColor: 'text-amber-400',
    headerBg: 'from-amber-500/10 to-transparent',
    rows: [
      { label: 'Vendas Formacao', key: 'vendasFormacao', format: 'num' },
      { label: 'CAC Formacao', key: 'custoVendasFormacao', format: 'brl', invertColor: true },
      { label: 'Faturamento Total', key: 'faturamentoTotal', format: 'brl' },
      { label: 'TM Formacao', key: 'ticketMedioFormacao', format: 'brl' },
    ],
  },
];

const desafioOptions: { key: DesafioKey; label: string }[] = [
  { key: 'desafio1', label: 'Desafio 1' },
  { key: 'desafio2', label: 'Desafio 2' },
  { key: 'desafio3', label: 'Desafio 3' },
];

export default function CompararView({ data }: CompararViewProps) {
  const [leftKey, setLeftKey] = useState<DesafioKey>('desafio1');
  const [rightKey, setRightKey] = useState<DesafioKey>('desafio2');

  const isSame = leftKey === rightKey;
  const leftData = data[leftKey];
  const rightData = data[rightKey];

  function swap() {
    setLeftKey(rightKey);
    setRightKey(leftKey);
  }

  function renderDelta(leftVal: number, rightVal: number, format: 'brl' | 'num' | 'pct', invertColor?: boolean) {
    const diff = rightVal - leftVal;
    if (diff === 0) return <span className="text-muted-foreground text-xs font-mono">--</span>;

    const absDiff = Math.abs(diff);
    const pctChange = leftVal !== 0 ? (diff / Math.abs(leftVal)) * 100 : 0;

    const isPositiveDiff = diff > 0;
    // For cost metrics, positive diff (higher cost) = bad (red), negative diff (lower cost) = good (green)
    // For other metrics, positive diff = good (green), negative diff = bad (red)
    const isGood = invertColor ? !isPositiveDiff : isPositiveDiff;
    const arrow = isPositiveDiff ? '▲' : '▼';
    const colorClass = isGood ? 'text-emerald-400' : 'text-red-400';

    const formattedDiff = formatValue(absDiff, format);
    const formattedPct = leftVal !== 0 ? `${Math.abs(pctChange).toFixed(1)}%` : '';

    return (
      <span className={`text-xs font-mono ${colorClass}`}>
        {arrow} {formattedDiff}{formattedPct ? ` (${formattedPct})` : ''}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <select
            value={leftKey}
            onChange={(e) => setLeftKey(e.target.value as DesafioKey)}
            className="bg-background border border-border rounded-lg px-4 py-2 text-sm font-heading text-foreground focus:outline-none focus:border-primary/60"
          >
            {desafioOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={swap}
            className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            title="Trocar"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <select
            value={rightKey}
            onChange={(e) => setRightKey(e.target.value as DesafioKey)}
            className="bg-background border border-border rounded-lg px-4 py-2 text-sm font-heading text-foreground focus:outline-none focus:border-primary/60"
          >
            {desafioOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>

        {isSame && (
          <div className="flex items-center gap-2 justify-center mt-3 text-amber-400 text-xs font-heading">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Selecione desafios diferentes para comparar</span>
          </div>
        )}
      </div>

      {/* Comparison Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
              <div className={`px-5 py-3 border-b border-border bg-gradient-to-r ${section.headerBg}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${section.accentColor}`} />
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
                    {section.title}
                  </h3>
                </div>
              </div>

              {/* Column headers */}
              <div className="px-5 pt-3 pb-2 border-b border-border/50">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs text-muted-foreground/70 font-heading">
                  <span />
                  <span className="text-right w-24">{desafioOptions.find((o) => o.key === leftKey)?.label}</span>
                  <span className="text-right w-24">{desafioOptions.find((o) => o.key === rightKey)?.label}</span>
                  <span className="text-right w-32">Delta</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {section.rows.map((row) => {
                  const lv = leftData[row.key] as number;
                  const rv = rightData[row.key] as number;
                  return (
                    <div key={row.key} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-baseline">
                      <p className="text-xs text-muted-foreground font-heading truncate">{row.label}</p>
                      <p className="text-sm font-mono font-medium text-foreground text-right w-24 whitespace-nowrap">
                        {formatValue(lv, row.format)}
                      </p>
                      <p className="text-sm font-mono font-medium text-foreground text-right w-24 whitespace-nowrap">
                        {formatValue(rv, row.format)}
                      </p>
                      <div className="text-right w-32 whitespace-nowrap">
                        {renderDelta(lv, rv, row.format, row.invertColor)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
