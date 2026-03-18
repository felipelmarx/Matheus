import { useState } from 'react';
import { Star, BarChart3 } from 'lucide-react';
import type { ResumoTecnicoMetric } from '@/types/metrics';

interface AnalisesDesafiosProps {
  visaoEstrategica: string[];
  resumoTecnico: { metrics: ResumoTecnicoMetric[]; analysis: string[] };
}

type SubTab = 'visao' | 'tecnico';

function renderLine(line: string, index: number) {
  // Title line (star emoji)
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

  // Section headers (numbered: "1. DIAGN\u00d3STICO GERAL", etc.)
  if (/^\d+\.\s+[A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00C0\u00C3\u00D5\u00C7\s]+$/.test(line)) {
    return (
      <h3 key={index} className="text-sm font-heading font-bold text-primary mt-6 mb-2 uppercase tracking-wide">
        {line}
      </h3>
    );
  }

  // Subtitle / metadata line
  if (line.startsWith('An\u00e1lise cruzada') || line.startsWith('Vis\u00e3o Estrat\u00e9gica gerada')) {
    return (
      <p key={index} className="text-xs text-muted-foreground/70 mb-4 italic">
        {line}
      </p>
    );
  }

  // Content paragraphs - may contain \n for internal line breaks
  const paragraphs = line.split('\\n').filter((p) => p.trim().length > 0);

  return (
    <div key={index} className="space-y-3 mb-4">
      {paragraphs.map((para, pi) => {
        const trimmed = para.trim();

        // Sub-headers like "QUEBRA 1 \u2014", "PADR\u00c3O 1 \u2014", numbered items "1. CRIATIVOS..."
        const isSubHeader = /^(QUEBRA|PADR\u00c3O|PADR[A\u00c3]O)\s+\d+/i.test(trimmed);
        const isNumberedItem = /^\d+\.\s+[A-Z\u00C1\u00C9\u00CD\u00D3\u00DA\u00C0\u00C3\u00D5\u00C7]/.test(trimmed);

        if (isSubHeader || isNumberedItem) {
          // Split at first colon or dash to get title + body
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

// Detect if a metric row is a section header (all-caps, no numeric values)
function isSectionHeader(m: ResumoTecnicoMetric): boolean {
  const hasValues = m.desafio1 || m.desafio2 || m.desafio3;
  const isUpper = m.label === m.label.toUpperCase() && m.label.length > 2;
  return isUpper && !hasValues;
}

// Color for comparison text
function comparisonColor(text: string): string {
  const lower = text.toLowerCase();
  if (/melhor|cresci|aument|reduziu.*custo|eficien|positiv/i.test(lower)) return 'text-emerald-400';
  if (/pior|ca[ií]u|aument.*custo|negativ|queda/i.test(lower)) return 'text-red-400';
  return 'text-muted-foreground';
}

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
          {metrics.map((m, i) => {
            if (isSectionHeader(m)) {
              return (
                <tr key={i} className="border-t border-border/50">
                  <td
                    colSpan={5}
                    className="py-2 px-3 text-xs font-heading font-bold text-primary uppercase tracking-wide bg-primary/5"
                  >
                    {m.label}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td className="py-1.5 px-3 text-foreground font-medium">{m.label}</td>
                <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{m.desafio1 || '—'}</td>
                <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{m.desafio2 || '—'}</td>
                <td className={`py-1.5 px-3 text-xs leading-snug max-w-[200px] ${comparisonColor(m.comparacaoIA)}`}>
                  {m.comparacaoIA || '—'}
                </td>
                <td className="py-1.5 px-3 text-right font-mono text-muted-foreground">{m.desafio3 || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalisesDesafios({ visaoEstrategica, resumoTecnico }: AnalisesDesafiosProps) {
  const [subTab, setSubTab] = useState<SubTab>('visao');

  const hasVisao = visaoEstrategica.length > 0;
  const hasTecnico = resumoTecnico.metrics.length > 0 || resumoTecnico.analysis.length > 0;

  if (!hasVisao && !hasTecnico) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground font-heading">Nenhuma analise disponivel</p>
      </div>
    );
  }

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
        </div>
      </div>

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
          {/* Metrics block */}
          <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-blue-500/10 to-transparent">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
                Metricas Comparativas — D1 vs D2 vs D3
              </h3>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <MetricsTable metrics={resumoTecnico.metrics} />
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
