import { Users, Instagram, Youtube, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import type { OrganicoFontes } from '@/types/metrics';

interface OrganicoProps {
  data: OrganicoFontes;
}

const fmtNum = (n: number) => n.toLocaleString('pt-BR');

export default function Organico({ data }: OrganicoProps) {
  const { soma, rows } = data;

  // Totais agregados por categoria
  const ssTotal = soma.edson + soma.ellid + soma.geovana;
  const igTotal = soma.stories + soma.directAutomacao + soma.feed + soma.bio + soma.pulmonautas;
  const ytTotal = soma.youtube;
  const extraTotal = soma.extra;
  const totalGeral = ssTotal + igTotal + ytTotal + extraTotal;

  // Ranking de fontes individuais
  const fonteEntries: { label: string; value: number }[] = [
    { label: 'Edson (SS)', value: soma.edson },
    { label: 'Ellid (SS)', value: soma.ellid },
    { label: 'Geovana (SS)', value: soma.geovana },
    { label: 'Stories', value: soma.stories },
    { label: 'Direct - Automação', value: soma.directAutomacao },
    { label: 'Feed', value: soma.feed },
    { label: 'Bio', value: soma.bio },
    { label: 'Pulmonautas', value: soma.pulmonautas },
    { label: 'YouTube', value: soma.youtube },
    { label: 'Extra', value: soma.extra },
  ];
  const top3 = [...fonteEntries].filter((f) => f.value > 0).sort((a, b) => b.value - a.value).slice(0, 3);
  const maxFonte = Math.max(1, ...fonteEntries.map((f) => f.value));

  const categoryCards = [
    { label: 'SS', sub: 'Edson · Ellid · Geovana', value: ssTotal, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/8' },
    { label: 'INSTAGRAM', sub: 'Stories · Direct · Feed · Bio · Pulm', value: igTotal, icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/8' },
    { label: 'YOUTUBE', sub: 'Canal orgânico', value: ytTotal, icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/8' },
    { label: 'EXTRA', sub: 'Outras fontes', value: extraTotal, icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/8' },
  ];

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Resumo Orgânico</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Captação diária por fonte — Comercial e Mídias
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {rows.length} dias acompanhados
        </div>
      </div>

      {/* Cards de total por categoria */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categoryCards.map((c) => {
          const Icon = c.icon;
          const pct = totalGeral > 0 ? Math.round((c.value / totalGeral) * 100) : 0;
          return (
            <div key={c.label} className="card-3d p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading leading-tight">
                    {c.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{c.sub}</p>
                </div>
                <div className={`p-1.5 rounded-md shrink-0 ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-mono text-foreground tabular-nums">{fmtNum(c.value)}</p>
                <p className="text-xs text-muted-foreground font-mono">· {pct}%</p>
              </div>
              <p className="text-[10px] text-muted-foreground/70 mt-1">capturas no período</p>
            </div>
          );
        })}
      </div>

      {/* Top 3 fontes */}
      {top3.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-heading font-semibold uppercase tracking-wider text-muted-foreground">
              Top fontes do período
            </h3>
          </div>
          <div className="space-y-3">
            {top3.map((f, idx) => {
              const pct = (f.value / maxFonte) * 100;
              return (
                <div key={f.label} className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold font-mono ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{f.label}</span>
                      <span className="text-sm font-bold font-mono tabular-nums text-foreground ml-2">{fmtNum(f.value)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${idx === 0 ? 'bg-primary' : 'bg-primary/50'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
