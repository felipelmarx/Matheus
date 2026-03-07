import { GitBranch, ChevronDown } from 'lucide-react';
import type { DesafioData } from '@/types/metrics';

interface FunilVisualProps {
  data: DesafioData;
}

interface FunnelStage {
  label: string;
  value: number;
  width: string;
  color: string;
}

export default function FunilVisual({ data }: FunilVisualProps) {
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

  const stages: FunnelStage[] = [
    { label: 'Ingressos Totais', value: data.ingressosTotais, width: '100%', color: 'bg-violet-500' },
    { label: 'Aplicações', value: data.aplicacoes, width: '78%', color: 'bg-violet-500/85' },
    { label: 'Agendamentos', value: data.agendamentos, width: '58%', color: 'bg-violet-500/70' },
    { label: 'Entrevistas', value: data.entrevistas, width: '42%', color: 'bg-violet-500/55' },
    { label: 'Vendas Formação', value: data.vendasFormacao, width: '28%', color: 'bg-emerald-500' },
  ];

  const conversionRate = (from: number, to: number) => {
    if (from === 0) return '--';
    return ((to / from) * 100).toFixed(2) + '%';
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Funil de Conversão
          </h3>
        </div>
      </div>

      <div className="p-5 flex flex-col items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage.label} className="w-full flex flex-col items-center">
            {/* Funnel bar */}
            <div
              className={`${stage.color} rounded-lg py-3 px-4 flex items-center justify-between text-white transition-all`}
              style={{ width: stage.width, minWidth: '180px' }}
            >
              <span className="text-xs sm:text-sm font-heading font-medium truncate">
                {stage.label}
              </span>
              <span className="text-sm sm:text-base font-mono font-bold ml-2 whitespace-nowrap">
                {fmtNum(stage.value)}
              </span>
            </div>

            {/* Conversion arrow between stages */}
            {i < stages.length - 1 && (
              <div className="flex items-center gap-1.5 py-1 text-muted-foreground">
                <ChevronDown className="w-4 h-4" />
                <span className="text-xs font-mono font-medium">
                  {conversionRate(stages[i].value, stages[i + 1].value)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
