import { GitBranch, ChevronDown } from 'lucide-react';
import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorFunilProps {
  outputs: SimuladorOutputs;
}

interface FunnelStage {
  label: string;
  value: number;
  width: string;
  color: string;
}

const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

const conversionRate = (from: number, to: number) => {
  if (from === 0) return '--';
  return ((to / from) * 100).toFixed(2) + '%';
};

export default function SimuladorFunil({ outputs }: SimuladorFunilProps) {
  const stages: FunnelStage[] = [
    { label: 'Cliques', value: outputs.cliques, width: '100%', color: 'bg-blue-500' },
    { label: 'View Page', value: outputs.viewPage, width: '88%', color: 'bg-cyan-500' },
    { label: 'Checkouts', value: outputs.checkouts, width: '72%', color: 'bg-emerald-500' },
    { label: 'Inscritos Totais', value: outputs.inscritosTotais, width: '58%', color: 'bg-amber-500' },
    { label: 'Aplicacoes', value: outputs.aplicacoes, width: '44%', color: 'bg-pink-500' },
    { label: 'Agendamentos', value: outputs.agendamentos, width: '34%', color: 'bg-pink-500/85' },
    { label: 'Entrevistas', value: outputs.entrevistas, width: '26%', color: 'bg-pink-500/70' },
    { label: 'Vendas Formacao', value: outputs.vendasFormacao, width: '18%', color: 'bg-violet-500' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Funil de Conversao
          </h3>
        </div>
      </div>

      <div className="p-5 flex flex-col items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage.label} className="w-full flex flex-col items-center">
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
