import { useEffect, useState } from 'react';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
import type { DesafioData } from '@/types/metrics';

interface ComparecimentosCardProps {
  data: DesafioData;
  /**
   * Quando true, indica que a edicao transmitiu apenas pelo site (sem Zoom).
   * Usado no D5 — nao houve transmissao via Zoom.
   */
  siteOnly?: boolean;
}

const SESSION_LABELS = [
  'Sessão 01 — Neurociência do Breathwork',
  'Sessão 02 — Breathwork para Êxtase',
  'Sessão 03 — Traumas e Reprogramação',
  'Sessão 04 — Práticas Terapêuticas',
  'Sessão 05 — Breathwork Profissional',
];

const COLLAPSE_STORAGE_KEY = 'desafio-collapsed-sections';
const SECTION_TITLE = 'Comparecimentos por Sessão';
const SECTION_ID = 'comparecimentos-por-sessao';

export default function ComparecimentosCard({ data, siteOnly = false }: ComparecimentosCardProps) {
  const comparecimentos = data.comparecimentos ?? [0, 0, 0, 0, 0];
  const total = comparecimentos.reduce((acc, v) => acc + v, 0);

  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Hidrata do localStorage na montagem
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setCollapsed(Boolean((parsed as Record<string, boolean>)[SECTION_TITLE]));
        }
      }
    } catch {
      // mantém default expandido
    }
  }, []);

  // Persiste mudanças mesclando com as outras seções
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : {};
      const next = { ...(current && typeof current === 'object' ? current : {}), [SECTION_TITLE]: collapsed };
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // silencia quota/storage errors
    }
  }, [collapsed]);

  if (total === 0) return null;

  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

  const headerBg = 'from-teal-500/10 to-transparent';
  const accentColor = 'text-teal-400';

  const metrics: { label: string; value: string; isHighlight?: boolean }[] =
    SESSION_LABELS.map((label, i) => ({
      label,
      value: fmtNum(comparecimentos[i]),
    }));

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls={SECTION_ID}
          className={`w-full px-5 py-3 border-b border-border bg-gradient-to-r ${headerBg} flex items-center justify-between hover:bg-muted/50 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${accentColor}`} />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              Comparecimentos por Sessão {siteOnly ? '(Site)' : '(Zoom + Site)'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {collapsed && (
              <span className="text-[10px] font-mono text-muted-foreground">
                5 sessões
              </span>
            )}
            {collapsed
              ? <ChevronRight className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>
        <div
          id={SECTION_ID}
          role="region"
          aria-label={SECTION_TITLE}
          hidden={collapsed}
          className="p-3 sm:p-4 space-y-2 sm:space-y-3 transition-all duration-200 motion-reduce:transition-none"
        >
          {metrics.map((m) => (
            <div key={m.label} className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className={`rounded-lg border border-border/20 p-2 sm:p-4 flex items-center justify-center bg-gradient-to-br ${headerBg}`}>
                <p className="text-[11px] sm:text-sm font-heading font-bold text-center text-muted-foreground leading-tight">{m.label}</p>
              </div>
              <div className={`rounded-lg border border-border/20 p-2 sm:p-4 flex items-center justify-center bg-gradient-to-br ${headerBg}`}>
                <p
                  className={`text-xs sm:text-base md:text-xl font-mono font-bold text-center leading-tight break-words ${
                    m.isHighlight ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {m.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
