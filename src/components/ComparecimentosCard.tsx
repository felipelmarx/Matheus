import { Users } from 'lucide-react';
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

export default function ComparecimentosCard({ data, siteOnly = false }: ComparecimentosCardProps) {
  const comparecimentos = data.comparecimentos ?? [0, 0, 0, 0, 0];
  const total = comparecimentos.reduce((acc, v) => acc + v, 0);

  if (total === 0) return null;

  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

  const headerBg = 'from-teal-500/10 to-transparent';
  const accentColor = 'text-teal-400';

  // Constroi a lista de metricas exibidas no padrao card-pair.
  const metrics: { label: string; value: string; isHighlight?: boolean }[] =
    SESSION_LABELS.map((label, i) => ({
      label,
      value: fmtNum(comparecimentos[i]),
    }));

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
        <div className={`px-5 py-3 border-b border-border bg-gradient-to-r ${headerBg}`}>
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${accentColor}`} />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              Comparecimentos por Sessão {siteOnly ? '(Site)' : '(Zoom + Site)'}
            </h3>
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
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
