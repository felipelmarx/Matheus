import { Trophy, UserCheck, DivideCircle } from 'lucide-react';
import type { DesafioData } from '@/types/metrics';

interface MetasCardProps {
  data: DesafioData;
}

export default function MetasCard({ data }: MetasCardProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

  const tmCac =
    data.custoVendasFormacao > 0
      ? data.ticketMedioFormacao / data.custoVendasFormacao
      : 0;

  const metrics = [
    {
      label: 'Vendas da Formacao',
      value: fmtNum(data.vendasFormacao),
      icon: Trophy,
      iconColor: 'text-emerald-400',
    },
    {
      label: 'CAC da Formacao',
      value: fmt(data.custoVendasFormacao),
      icon: UserCheck,
      iconColor: 'text-orange-400',
    },
    {
      label: 'TM / CAC',
      value: tmCac === 0 ? '--' : tmCac.toFixed(2) + 'x',
      icon: DivideCircle,
      iconColor: 'text-cyan-400',
      isHighlight: tmCac >= 2,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Metas
          </h3>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${m.iconColor}`} />
                <p className="text-xs text-muted-foreground font-heading">{m.label}</p>
              </div>
              <div className="border-b border-dotted border-border/50 flex-1 mb-1 mx-1" />
              <p
                className={`text-sm font-mono font-medium whitespace-nowrap ${
                  m.isHighlight ? 'text-primary font-bold' : 'text-foreground'
                }`}
              >
                {m.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
