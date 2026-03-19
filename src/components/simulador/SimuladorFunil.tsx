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

export default function SimuladorFunil({ outputs }: SimuladorFunilProps) {
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

  const stages: FunnelStage[] = [
    { label: 'Cliques', value: outputs.cliques, width: '100%', color: 'bg-primary' },
    { label: 'View Pages', value: outputs.viewPages, width: '85%', color: 'bg-primary/90' },
    { label: 'Ingressos', value: outputs.ingressos, width: '65%', color: 'bg-primary/80' },
    { label: 'Aplicacoes', value: outputs.aplicacoes, width: '50%', color: 'bg-primary/70' },
    { label: 'Agendamentos', value: outputs.agendamentos, width: '38%', color: 'bg-primary/60' },
    { label: 'Entrevistas', value: outputs.entrevistas, width: '28%', color: 'bg-primary/50' },
    { label: 'Vendas Formacao', value: outputs.vendasFormacao, width: '18%', color: 'bg-emerald-500' },
  ];

  const conversionRate = (from: number, to: number) => {
    if (from === 0) return '--';
    return ((to / from) * 100).toFixed(1) + '%';
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Funil Projetado
          </h3>
        </div>
      </div>

      <div className="p-5 flex flex-col items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage.label} className="w-full flex flex-col items-center">
            <div
              className={`${stage.color} rounded-lg py-2.5 px-4 flex items-center justify-between text-white transition-all`}
              style={{ width: stage.width, minWidth: '160px' }}
            >
              <span className="text-xs font-heading font-medium truncate">
                {stage.label}
              </span>
              <span className="text-sm font-mono font-bold ml-2 whitespace-nowrap">
                {fmtNum(stage.value)}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className="flex items-center gap-1.5 py-0.5 text-muted-foreground">
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-medium">
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
