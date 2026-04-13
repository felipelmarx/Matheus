import { FlaskConical, CalendarDays, DollarSign, ShoppingCart, Target, Percent, Users, TrendingUp, Tag, BarChart3, Trophy } from 'lucide-react';
import type { PopupQualificadorDay, PopupQualificadorSide } from '@/types/metrics';

interface PopupQualificadorProps {
  days: PopupQualificadorDay[];
  consolidado?: {
    qualificador: PopupQualificadorSide;
    desqualificado: PopupQualificadorSide;
    investimentoTotal: number;
  } | null;
}

export default function PopupQualificador({ days, consolidado }: PopupQualificadorProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const BRL2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (v: number) => v === 0 ? '--' : `${v.toFixed(2).replace('.', ',')}%`;
  const fmt = (v: number) => v === 0 ? '--' : BRL.format(v);
  const fmt2 = (v: number) => v === 0 ? '--' : BRL2.format(v);
  const fmtNum = (v: number) => v === 0 ? '--' : v.toLocaleString('pt-BR');

  if (days.length === 0 && !consolidado) return null;

  const totalQ = consolidado?.qualificador;
  const totalD = consolidado?.desqualificado;
  const investimentoTotal = consolidado?.investimentoTotal ?? 0;

  const hasSummary = totalQ && totalD;

  const summaryMetrics = hasSummary ? [
    { label: 'Investimento', qVal: fmt(totalQ.investimento), dVal: fmt(totalD.investimento), qRaw: totalQ.investimento, dRaw: totalD.investimento, icon: DollarSign, color: 'text-blue-400' },
    { label: 'Vendas', qVal: fmtNum(totalQ.vendas), dVal: fmtNum(totalD.vendas), qRaw: totalQ.vendas, dRaw: totalD.vendas, icon: ShoppingCart, color: 'text-indigo-400' },
    { label: 'Faturamento', qVal: fmt(totalQ.faturamento), dVal: fmt(totalD.faturamento), qRaw: totalQ.faturamento, dRaw: totalD.faturamento, icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'CPA', qVal: fmt2(totalQ.cpaReal), dVal: fmt2(totalD.cpaReal), qRaw: totalQ.cpaReal, dRaw: totalD.cpaReal, lowerIsBetter: true, icon: Target, color: 'text-orange-400' },
    { label: 'Ticket Medio', qVal: fmt2(totalQ.ticketMedio), dVal: fmt2(totalD.ticketMedio), qRaw: totalQ.ticketMedio, dRaw: totalD.ticketMedio, icon: Tag, color: 'text-amber-400' },
    { label: 'Checkouts', qVal: fmtNum(totalQ.checkouts), dVal: fmtNum(totalD.checkouts), qRaw: totalQ.checkouts, dRaw: totalD.checkouts, icon: Users, color: 'text-violet-400' },
    { label: 'Conv. Checkout', qVal: fmtPct(totalQ.conversaoCheckout), dVal: fmtPct(totalD.conversaoCheckout), qRaw: totalQ.conversaoCheckout, dRaw: totalD.conversaoCheckout, icon: Percent, color: 'text-emerald-400' },
    { label: 'Proporcao', qVal: fmtPct(totalQ.proporcao), dVal: fmtPct(totalD.proporcao), qRaw: totalQ.proporcao, dRaw: totalD.proporcao, icon: Percent, color: 'text-pink-400' },
  ] : [];

  const metrics: { key: keyof PopupQualificadorSide; label: string; format: (v: number) => string; icon: typeof DollarSign; color: string; lowerIsBetter?: boolean }[] = [
    { key: 'investimento', label: 'Investimento', format: fmt, icon: DollarSign, color: 'text-blue-400' },
    { key: 'checkouts', label: 'Checkouts', format: fmtNum, icon: ShoppingCart, color: 'text-indigo-400' },
    { key: 'conversaoCheckout', label: 'Conv. Checkout', format: fmtPct, icon: Percent, color: 'text-cyan-400' },
    { key: 'proporcao', label: 'Proporcao', format: fmtPct, icon: Percent, color: 'text-violet-400' },
    { key: 'vendas', label: 'Vendas', format: fmtNum, icon: Users, color: 'text-indigo-400' },
    { key: 'cpaReal', label: 'CPA Real', format: fmt2, icon: Target, color: 'text-orange-400', lowerIsBetter: true },
    { key: 'faturamento', label: 'Faturamento', format: fmt, icon: TrendingUp, color: 'text-cyan-400' },
    { key: 'ticketMedio', label: 'Ticket Medio', format: fmt2, icon: Tag, color: 'text-amber-400' },
  ];

  // Determine winner from consolidated data
  let qWins = 0;
  let dWins = 0;
  summaryMetrics.forEach(m => {
    if (m.qRaw === 0 || m.dRaw === 0 || m.qRaw === m.dRaw) return;
    if (m.lowerIsBetter) {
      m.qRaw < m.dRaw ? qWins++ : dWins++;
    } else {
      m.qRaw > m.dRaw ? qWins++ : dWins++;
    }
  });
  const winner = qWins > dWins ? 'Qualificador' : dWins > qWins ? 'Desqualificado' : 'Empate';
  const winnerColor = winner === 'Qualificador' ? 'text-indigo-400' : winner === 'Desqualificado' ? 'text-orange-400' : 'text-muted-foreground';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Pop-up Qualificador (Teste)
        </h2>
        <span className="text-xs text-muted-foreground/60 font-mono">
          ({days.length} {days.length === 1 ? 'dia' : 'dias'})
        </span>
      </div>

      {/* Summary Card — from row 29 consolidated data */}
      {hasSummary && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/15 via-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-heading font-semibold text-foreground">Resultado Consolidado do Teste</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                  Invest. total: {BRL.format(investimentoTotal)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Trophy className={`w-3.5 h-3.5 ${winnerColor}`} />
                  <span className={`text-[11px] font-heading font-bold ${winnerColor}`}>{winner}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">({qWins}x{dWins})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 mb-3 pb-2 border-b border-border/50">
              <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Metrica</span>
              <span className="text-[10px] text-indigo-400 font-heading font-semibold text-right w-24">Qualificador</span>
              <span className="text-[10px] text-orange-400 font-heading font-semibold text-right w-24">Desqualificado</span>
            </div>

            {summaryMetrics.map((m) => {
              const Icon = m.icon;
              let qBetter = false;
              let dBetter = false;
              if (m.qRaw !== 0 && m.dRaw !== 0 && m.qRaw !== m.dRaw) {
                if (m.lowerIsBetter) {
                  qBetter = m.qRaw < m.dRaw;
                  dBetter = m.dRaw < m.qRaw;
                } else {
                  qBetter = m.qRaw > m.dRaw;
                  dBetter = m.dRaw > m.qRaw;
                }
              }

              return (
                <div key={m.label} className="grid grid-cols-[1fr_auto_auto] gap-x-6 py-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${m.color}`} />
                    <span className="text-xs text-muted-foreground font-heading">{m.label}</span>
                  </div>
                  <span className={`text-xs font-mono font-medium text-right w-24 ${qBetter ? 'text-indigo-400 font-bold' : 'text-foreground'}`}>
                    {m.qVal}
                  </span>
                  <span className={`text-xs font-mono font-medium text-right w-24 ${dBetter ? 'text-orange-400 font-bold' : 'text-foreground'}`}>
                    {m.dVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      {days.length > 0 && (
        <>
          <div className="flex items-center gap-2 px-1 pt-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              Detalhamento por Dia
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {days.map((day, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-heading font-semibold text-foreground">{day.data}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      Invest. total: {BRL.format(day.investimentoTotal)}
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 mb-2 pb-2 border-b border-border/50">
                    <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Metrica</span>
                    <span className="text-[10px] text-indigo-400 font-heading font-semibold text-right w-[5.5rem]">Qualif.</span>
                    <span className="text-[10px] text-orange-400 font-heading font-semibold text-right w-[5.5rem]">Desqualif.</span>
                  </div>

                  {metrics.map((m) => {
                    const qVal = day.qualificador[m.key];
                    const dVal = day.desqualificado[m.key];
                    const Icon = m.icon;

                    let qBetter = false;
                    let dBetter = false;
                    if (qVal !== 0 && dVal !== 0 && qVal !== dVal) {
                      if (m.lowerIsBetter) {
                        qBetter = qVal < dVal;
                        dBetter = dVal < qVal;
                      } else {
                        qBetter = qVal > dVal;
                        dBetter = dVal > qVal;
                      }
                    }

                    return (
                      <div key={m.key} className="grid grid-cols-[1fr_auto_auto] gap-x-3 py-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <Icon className={`w-3 h-3 shrink-0 ${m.color}`} />
                          <span className="text-[11px] text-muted-foreground font-heading truncate">{m.label}</span>
                        </div>
                        <span className={`text-[11px] font-mono font-medium text-right w-[5.5rem] ${qBetter ? 'text-indigo-400 font-bold' : 'text-foreground'}`}>
                          {m.format(qVal)}
                        </span>
                        <span className={`text-[11px] font-mono font-medium text-right w-[5.5rem] ${dBetter ? 'text-indigo-400 font-bold' : 'text-foreground'}`}>
                          {m.format(dVal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
