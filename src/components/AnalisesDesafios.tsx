import { useState } from 'react';
import {
  Star,
  BarChart3,
  MousePointerClick,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Monitor,
  Heart,
  UserCheck,
  Trophy,
  ChevronDown,
  ClipboardList,
  Shuffle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ResumoTecnicoMetric, AnaliseCompradorSection } from '@/types/metrics';
import AnaliseGeneric from './AnaliseGeneric';

interface AnalisesDesafiosProps {
  visaoEstrategica: string[];
  resumoTecnico: { metrics: ResumoTecnicoMetric[]; analysis: string[] };
  analiseAplicacoes?: AnaliseCompradorSection[];
  analiseCruzada?: AnaliseCompradorSection[];
}

type SubTab = 'visao' | 'tecnico' | 'aplicacoes' | 'cruzada';

/* ─── Metric Group Definitions ─── */

interface MetricGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;        // tailwind gradient from color
  iconColor: string;     // icon text color
  borderColor: string;
  pattern: RegExp;
}

const METRIC_GROUPS: MetricGroup[] = [
  {
    id: 'trafego',
    label: 'Trafego',
    icon: MousePointerClick,
    color: 'from-cyan-500/10 to-cyan-600/5',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20',
    pattern: /cliques|custo por clique|cpc|view pages?|custo por view|conect rate/i,
  },
  {
    id: 'investimento',
    label: 'Investimento',
    icon: DollarSign,
    color: 'from-blue-500/10 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    pattern: /investimento (bruto|ads|api)/i,
  },
  {
    id: 'checkout',
    label: 'Checkout & Vendas',
    icon: ShoppingCart,
    color: 'from-violet-500/10 to-violet-600/5',
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    pattern: /checkout|carrinho|vendas ingresso|cortesia|ingressos totais/i,
  },
  {
    id: 'bumps',
    label: 'Bumps & Upsell',
    icon: TrendingUp,
    color: 'from-orange-500/10 to-orange-600/5',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
    pattern: /bump|upsell/i,
  },
  {
    id: 'engajamento',
    label: 'Engajamento',
    icon: Users,
    color: 'from-amber-500/10 to-amber-600/5',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    pattern: /pesquisa|lead scoring|entrou no grupo/i,
  },
  {
    id: 'sessoes',
    label: 'Sessoes ao Vivo',
    icon: Monitor,
    color: 'from-indigo-500/10 to-indigo-600/5',
    iconColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/20',
    pattern: /sess[aã]o|assistiu|participou/i,
  },
  {
    id: 'protocolos',
    label: 'Protocolos',
    icon: Heart,
    color: 'from-teal-500/10 to-teal-600/5',
    iconColor: 'text-teal-400',
    borderColor: 'border-teal-500/20',
    pattern: /protocolo|pagou.*R\$|pegou/i,
  },
  {
    id: 'aplicacoes',
    label: 'Aplicacoes',
    icon: UserCheck,
    color: 'from-purple-500/10 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    pattern: /^aplica[cç][oõ]es|mql|potencial|desqualificad/i,
  },
  {
    id: 'comercial',
    label: 'Comercial & Faturamento',
    icon: Trophy,
    color: 'from-indigo-500/10 to-indigo-600/5',
    iconColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/20',
    pattern: /^agendamento|^entrevista|vendas da forma|^cac$|ticket m[eé]dio forma|convers[aã]o|faturamento total|tm\/cac/i,
  },
];

const DEFAULT_OPEN = new Set(['trafego', 'investimento', 'checkout', 'aplicacoes', 'comercial']);

/* ─── KPI Definitions ─── */

interface KPIDef {
  label: string;
  pattern: RegExp;
  color: string;
  iconColor: string;
  borderColor: string;
}

const KPI_DEFS: KPIDef[] = [
  { label: 'Investimento Bruto', pattern: /investimento bruto/i, color: 'from-blue-500/10 to-blue-600/5', iconColor: 'text-blue-400', borderColor: 'border-blue-500/20' },
  { label: 'Vendas Ingressos', pattern: /^vendas ingressos$/i, color: 'from-violet-500/10 to-violet-600/5', iconColor: 'text-violet-400', borderColor: 'border-violet-500/20' },
  { label: 'CPA', pattern: /^cpa \(custo/i, color: 'from-red-500/10 to-red-600/5', iconColor: 'text-red-400', borderColor: 'border-red-500/20' },
  { label: 'Faturamento Total', pattern: /^faturamento total$/i, color: 'from-indigo-500/10 to-indigo-600/5', iconColor: 'text-indigo-400', borderColor: 'border-indigo-500/20' },
  { label: 'Vendas Formacao', pattern: /^vendas da forma/i, color: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-400', borderColor: 'border-amber-500/20' },
  { label: 'Inv. Liquido', pattern: /investimento l[ií]quido/i, color: 'from-red-500/10 to-red-600/5', iconColor: 'text-red-400', borderColor: 'border-red-500/20' },
];

/* ─── Helpers ─── */

function renderLine(line: string, index: number) {
  if (line.startsWith('\u2B50')) {
    return (
      <div key={index} className="flex items-center gap-2 mb-2">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
        <h2 className="text-base font-heading font-bold text-foreground">
          {line.replace(/\u2B50\s*/g, '')}
        </h2>
      </div>
    );
  }

  if (/^\d+\.\s+[A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00C0\u00C3\u00D5\u00C7\s]+$/.test(line)) {
    return (
      <h3 key={index} className="text-sm font-heading font-bold text-primary mt-6 mb-2 uppercase tracking-wide">
        {line}
      </h3>
    );
  }

  if (line.startsWith('An\u00e1lise cruzada') || line.startsWith('Vis\u00e3o Estrat\u00e9gica gerada')) {
    return (
      <p key={index} className="text-xs text-muted-foreground/70 mb-4 italic">
        {line}
      </p>
    );
  }

  const paragraphs = line.split('\\n').filter((p) => p.trim().length > 0);

  return (
    <div key={index} className="space-y-3 mb-4">
      {paragraphs.map((para, pi) => {
        const trimmed = para.trim();

        const isSubHeader = /^(QUEBRA|PADR\u00c3O|PADR[A\u00c3]O)\s+\d+/i.test(trimmed);
        const isNumberedItem = /^\d+\.\s+[A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00C0\u00C3\u00D5\u00C7]/.test(trimmed);

        if (isSubHeader || isNumberedItem) {
          const sepIdx = trimmed.indexOf(':');
          if (sepIdx > 0 && sepIdx < 80) {
            const title = trimmed.slice(0, sepIdx + 1);
            const body = trimmed.slice(sepIdx + 1).trim();
            return (
              <div key={pi}>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold">{title}</strong>{' '}
                  {body}
                </p>
              </div>
            );
          }
        }

        return (
          <p key={pi} className="text-sm text-muted-foreground leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

function isSectionHeader(m: ResumoTecnicoMetric): boolean {
  const hasValues = m.desafio1 || m.desafio2 || m.desafio3;
  const isUpper = m.label === m.label.toUpperCase() && m.label.length > 2;
  return isUpper && !hasValues;
}

function comparisonColor(text: string): string {
  const lower = text.toLowerCase();
  if (/melhor|cresci|aument|reduziu.*custo|eficien|positiv/i.test(lower)) return 'text-indigo-400';
  if (/pior|ca[ií]u|aument.*custo|negativ|queda/i.test(lower)) return 'text-red-400';
  return 'text-muted-foreground';
}

/* ─── Categorize Metrics into Groups ─── */

interface CategorizedGroup {
  group: MetricGroup;
  metrics: ResumoTecnicoMetric[];
}

function categorizeMetrics(metrics: ResumoTecnicoMetric[]): CategorizedGroup[] {
  const dataMetrics = metrics.filter((m) => !isSectionHeader(m));
  const assigned = new Set<number>();
  const result: CategorizedGroup[] = [];

  for (const group of METRIC_GROUPS) {
    const matched: ResumoTecnicoMetric[] = [];
    dataMetrics.forEach((m, idx) => {
      if (!assigned.has(idx) && group.pattern.test(m.label)) {
        matched.push(m);
        assigned.add(idx);
      }
    });
    if (matched.length > 0) {
      result.push({ group, metrics: matched });
    }
  }

  // Fallback: unmatched metrics go to "Outros"
  const unmatched = dataMetrics.filter((_, idx) => !assigned.has(idx));
  if (unmatched.length > 0) {
    result.push({
      group: {
        id: 'outros',
        label: 'Outros',
        icon: BarChart3,
        color: 'from-gray-500/10 to-gray-600/5',
        iconColor: 'text-gray-400',
        borderColor: 'border-gray-500/20',
        pattern: /.*/,
      },
      metrics: unmatched,
    });
  }

  return result;
}

/* ─── KPI Summary Strip ─── */

function KPISummary({ metrics }: { metrics: ResumoTecnicoMetric[] }) {
  const dataMetrics = metrics.filter((m) => !isSectionHeader(m));

  const kpis = KPI_DEFS.map((def) => {
    const found = dataMetrics.find((m) => def.pattern.test(m.label));
    // Pick the most recent desafio value available
    const value = found ? (found.desafio3 || found.desafio2 || found.desafio1 || '—') : '—';
    return { ...def, value, found: !!found };
  }).filter((k) => k.found);

  if (kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`bg-gradient-to-br ${kpi.color} border ${kpi.borderColor} rounded-xl p-4 transition-all hover:scale-[1.02]`}
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading mb-1 truncate">
            {kpi.label}
          </p>
          <p className="text-sm font-bold font-mono text-foreground truncate">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Metrics Table (unchanged, receives subset) ─── */

function MetricsTable({ metrics }: { metrics: ResumoTecnicoMetric[] }) {
  if (metrics.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-4">Nenhuma metrica disponivel</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              Metrica
            </th>
            <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              D1
            </th>
            <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              D2
            </th>
            <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              Comparacao IA
            </th>
            <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              D3
            </th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => (
            <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="py-1.5 px-3 text-foreground font-medium">{m.label}</td>
              <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{m.desafio1 || '—'}</td>
              <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{m.desafio2 || '—'}</td>
              <td className={`py-1.5 px-3 text-xs leading-snug max-w-[200px] ${comparisonColor(m.comparacaoIA)}`}>
                {m.comparacaoIA || '—'}
              </td>
              <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{m.desafio3 || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Collapsible Metric Group ─── */

function CollapsibleMetricGroup({
  group,
  metrics,
  isOpen,
  onToggle,
}: {
  group: MetricGroup;
  metrics: ResumoTecnicoMetric[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = group.icon;

  return (
    <div className={`border ${group.borderColor} rounded-xl overflow-hidden transition-all`}>
      {/* Clickable header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r ${group.color} hover:brightness-110 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-card/50 ${group.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-heading font-semibold text-foreground uppercase tracking-wide">
            {group.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            ({metrics.length} {metrics.length === 1 ? 'metrica' : 'metricas'})
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t border-border/30">
          <MetricsTable metrics={metrics} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function AnalisesDesafios({ visaoEstrategica, resumoTecnico, analiseAplicacoes, analiseCruzada }: AnalisesDesafiosProps) {
  const [subTab, setSubTab] = useState<SubTab>('visao');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(DEFAULT_OPEN));

  const hasVisao = visaoEstrategica.length > 0;
  const hasTecnico = resumoTecnico.metrics.length > 0 || resumoTecnico.analysis.length > 0;

  if (!hasVisao && !hasTecnico) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground font-heading">Nenhuma analise disponivel</p>
      </div>
    );
  }

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const categorized = categorizeMetrics(resumoTecnico.metrics);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Sub-tab selector */}
      <div className="px-5 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubTab('visao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              subTab === 'visao'
                ? 'bg-amber-500/15 text-amber-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Visao Estrategica
          </button>
          <button
            onClick={() => setSubTab('tecnico')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              subTab === 'tecnico'
                ? 'bg-blue-500/15 text-blue-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Relatorio Tecnico
          </button>
          <button
            onClick={() => setSubTab('aplicacoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              subTab === 'aplicacoes'
                ? 'bg-sky-500/15 text-sky-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Aplicacoes
          </button>
          <button
            onClick={() => setSubTab('cruzada')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              subTab === 'cruzada'
                ? 'bg-fuchsia-500/15 text-fuchsia-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            Cruzada
          </button>
        </div>
      </div>

      {subTab === 'aplicacoes' && (
        <AnaliseGeneric
          sections={analiseAplicacoes ?? []}
          title="Analise de Aplicacoes por Desafio"
          headerIcon={ClipboardList}
          headerGradient="from-sky-500/10 to-teal-500/10"
        />
      )}

      {subTab === 'cruzada' && (
        <AnaliseGeneric
          sections={analiseCruzada ?? []}
          title="Analise Cruzada — Compradores x Aplicacoes"
          headerIcon={Shuffle}
          headerGradient="from-fuchsia-500/10 to-indigo-500/10"
        />
      )}

      {/* Visao Estrategica */}
      {subTab === 'visao' && (
        <>
          <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-amber-500/10 to-transparent">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
                Analises Desafios
              </h3>
            </div>
          </div>
          <div className="p-5 sm:p-6 max-w-4xl">
            {hasVisao ? (
              visaoEstrategica.map((line, i) => renderLine(line, i))
            ) : (
              <p className="text-muted-foreground text-sm">Nenhuma visao estrategica disponivel</p>
            )}
          </div>
        </>
      )}

      {/* Relatorio Tecnico */}
      {subTab === 'tecnico' && (
        <>
          {/* Header */}
          <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-blue-500/10 to-transparent">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
                Metricas Comparativas — D1 vs D2 vs D3
              </h3>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* KPI Summary Strip */}
            <KPISummary metrics={resumoTecnico.metrics} />

            {/* Collapsible Metric Groups */}
            <div className="space-y-3">
              {categorized.map(({ group, metrics }) => (
                <CollapsibleMetricGroup
                  key={group.id}
                  group={group}
                  metrics={metrics}
                  isOpen={openGroups.has(group.id)}
                  onToggle={() => toggleGroup(group.id)}
                />
              ))}
            </div>
          </div>

          {/* Analysis block */}
          {resumoTecnico.analysis.length > 0 && (
            <>
              <div className="px-5 py-3 border-b border-t border-border bg-gradient-to-r from-amber-500/10 to-transparent">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
                    Analise IA — Relatorio Joao
                  </h3>
                </div>
              </div>
              <div className="p-5 sm:p-6 max-w-4xl">
                {resumoTecnico.analysis.map((line, i) => renderLine(line, i))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
