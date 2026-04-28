import { useState, useMemo } from 'react';
import { MousePointerClick, DollarSign, GitBranch, GraduationCap, UserX, AlertTriangle } from 'lucide-react';
import type { AllDesafiosData, DesafioData, DesafioKey } from '@/types/metrics';

interface CompararViewProps {
  data: AllDesafiosData;
}

interface MetricRow {
  label: string;
  key?: keyof DesafioData;
  compute?: (d: DesafioData) => number;
  format: 'brl' | 'num' | 'pct';
  invertColor?: boolean;
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
      { label: 'Conv. Ingressos → Aplicacoes', compute: (d) => d.ingressosTotais > 0 ? parseFloat(((d.aplicacoes / d.ingressosTotais) * 100).toFixed(2)) : 0, format: 'pct' },
      { label: 'Custo / Aplicacao', key: 'custoPorAplicacao', format: 'brl', invertColor: true },
      { label: 'Agendamentos', key: 'agendamentos', format: 'num' },
      { label: 'Conv. Aplicacoes → Agendamentos', compute: (d) => d.aplicacoes > 0 ? parseFloat(((d.agendamentos / d.aplicacoes) * 100).toFixed(2)) : 0, format: 'pct' },
      { label: 'Entrevistas', key: 'entrevistas', format: 'num' },
      { label: 'Conv. Agendamentos → Entrevistas', compute: (d) => d.agendamentos > 0 ? parseFloat(((d.entrevistas / d.agendamentos) * 100).toFixed(2)) : 0, format: 'pct' },
      { label: 'Custo / Entrevista', key: 'custoEntrevista', format: 'brl', invertColor: true },
      { label: 'Conv. Entrevistas → Vendas', compute: (d) => d.entrevistas > 0 ? parseFloat(((d.vendasFormacao / d.entrevistas) * 100).toFixed(2)) : 0, format: 'pct' },
      { label: 'Vendas Formacao', key: 'vendasFormacao', format: 'num' },
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
  {
    title: 'Cancelamentos & No-show',
    icon: UserX,
    accentColor: 'text-red-400',
    headerBg: 'from-red-500/10 to-transparent',
    rows: [
      { label: 'Cancelamentos', key: 'cancelamentos', format: 'num', invertColor: true },
      { label: 'No-show', key: 'noShow', format: 'num', invertColor: true },
    ],
  },
];

const desafioOptions: { key: DesafioKey; label: string; num: string }[] = [
  { key: 'desafio1', label: 'Desafio 1', num: '01' },
  { key: 'desafio2', label: 'Desafio 2', num: '02' },
  { key: 'desafio3', label: 'Desafio 3', num: '03' },
  { key: 'desafio4', label: 'Desafio 4', num: '04' },
  { key: 'desafio5', label: 'Desafio 5', num: '05' },
  { key: 'desafio6', label: 'Desafio 6', num: '06' },
];

function getTrendInfo(
  current: number,
  previous: number | null,
  invertColor?: boolean
): { arrow: string; pct: string; colorClass: string } | null {
  if (previous === null || previous === 0 || current === 0) return null;
  const pctChange = ((current - previous) / Math.abs(previous)) * 100;
  if (pctChange === 0) return null;

  const isIncrease = pctChange > 0;
  const arrow = isIncrease ? '↑' : '↓';
  const pct = `${Math.abs(pctChange).toFixed(1)}%`;

  // Determine if the change is "good"
  const isGood = invertColor ? !isIncrease : isIncrease;
  const colorClass = isGood ? 'text-green-500' : 'text-red-500';

  return { arrow, pct, colorClass };
}

function getValueColor(
  value: number,
  allValues: number[],
  invertColor?: boolean
): string {
  const nonZero = allValues.filter((v) => v !== 0);
  if (nonZero.length < 2 || value === 0) return 'text-foreground';

  const best = invertColor ? Math.min(...nonZero) : Math.max(...nonZero);
  const worst = invertColor ? Math.max(...nonZero) : Math.min(...nonZero);

  if (value === best) return 'text-indigo-400';
  if (value === worst && nonZero.length > 1) return 'text-red-400';
  return 'text-foreground';
}

export default function CompararView({ data }: CompararViewProps) {
  const [selectedKeys, setSelectedKeys] = useState<DesafioKey[]>(['desafio1', 'desafio2']);

  const tooFew = selectedKeys.length < 2;

  const selectedData = useMemo(
    () => selectedKeys.map((k) => ({ key: k, data: data[k] })),
    [selectedKeys, data]
  );

  function toggleKey(key: DesafioKey) {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  }

  const colCount = selectedKeys.length;
  const gridStyle = {
    gridTemplateColumns: `1fr ${Array(colCount).fill('minmax(0,1fr)').join(' ')}`,
  };

  return (
    <div className="space-y-6">
      {/* Selector Bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs text-muted-foreground font-heading text-center mb-3">
          Selecione os desafios para comparar
        </p>
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {desafioOptions.map((opt) => {
            const isSelected = selectedKeys.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => toggleKey(opt.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-heading font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <span className={`text-base font-bold font-mono ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground/50'}`}>
                  {opt.num}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>

        {tooFew && (
          <div className="flex items-center gap-2 justify-center mt-3 text-amber-400 text-xs font-heading">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Selecione pelo menos 2 desafios para comparar</span>
          </div>
        )}
      </div>

      {/* Comparison Tables */}
      {!tooFew && (
        <>
          <div className="grid grid-cols-1 gap-4">
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

                  {/* Column headers - desktop */}
                  <div className="hidden sm:block px-5 pt-3 pb-2 border-b border-border/50">
                    <div style={gridStyle} className="grid gap-2 text-xs text-muted-foreground/70 font-heading">
                      <span />
                      {selectedData.map((s) => (
                        <span key={s.key} className="text-right">
                          {desafioOptions.find((o) => o.key === s.key)?.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3">
                    {section.rows.map((row, rowIdx) => {
                      const values = selectedData.map((s) => row.compute ? row.compute(s.data) : s.data[row.key!] as number);

                      return (
                        <div key={row.key ?? `computed-${rowIdx}`}>
                          {/* Desktop layout */}
                          <div style={gridStyle} className="hidden sm:grid gap-2 items-baseline border-b border-border/30 pb-3">
                            <p className="text-base text-muted-foreground font-heading font-bold truncate">{row.label}</p>
                            {selectedData.map((s, i) => {
                              const v = values[i];
                              const prev = i > 0 ? values[i - 1] : null;
                              const trend = getTrendInfo(v, prev, row.invertColor);
                              return (
                                <div key={s.key} className="text-right">
                                  <p className="text-lg font-mono font-medium whitespace-nowrap overflow-hidden text-ellipsis text-foreground">
                                    {formatValue(v, row.format)}
                                  </p>
                                  {trend && (
                                    <p className={`text-xs font-mono ${trend.colorClass}`}>
                                      {trend.arrow} {trend.pct}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {/* Mobile layout - stacked */}
                          <div className="sm:hidden space-y-1">
                            <p className="text-xs text-muted-foreground font-heading font-bold">{row.label}</p>
                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                              {selectedData.map((s, i) => {
                                const v = values[i];
                                const prev = i > 0 ? values[i - 1] : null;
                                const trend = getTrendInfo(v, prev, row.invertColor);
                                return (
                                  <div key={s.key}>
                                    <p className="text-[10px] text-muted-foreground/60 font-heading">
                                      {desafioOptions.find((o) => o.key === s.key)?.label}
                                    </p>
                                    <p className="text-xs font-mono font-medium text-foreground">
                                      {formatValue(v, row.format)}
                                    </p>
                                    {trend && (
                                      <p className={`text-[10px] font-mono ${trend.colorClass}`}>
                                        {trend.arrow} {trend.pct}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </>
      )}
    </div>
  );
}
