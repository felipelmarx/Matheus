import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorFunilProps {
  outputs: SimuladorOutputs;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface FunnelStage {
  label: string;
  qtd: number;
  receita: number;
  width: string;
  color: string;
}

export default function SimuladorFunil({ outputs }: SimuladorFunilProps) {
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));

  const stages: FunnelStage[] = [
    {
      label: 'Cliques',
      qtd: outputs.cliques,
      receita: 0,
      width: '100%',
      color: 'bg-primary',
    },
    {
      label: 'Vendas (Produto)',
      qtd: outputs.vendas,
      receita: outputs.receitaProduto,
      width: '72%',
      color: 'bg-primary/90',
    },
    {
      label: 'Order Bump',
      qtd: outputs.vendasBump,
      receita: outputs.receitaBump,
      width: '52%',
      color: 'bg-primary/80',
    },
    {
      label: 'Upsell',
      qtd: outputs.vendasUpsell,
      receita: outputs.receitaUpsell,
      width: '36%',
      color: 'bg-emerald-500/90',
    },
    {
      label: 'Downsell',
      qtd: outputs.vendasDownsell,
      receita: outputs.receitaDownsell,
      width: '24%',
      color: 'bg-emerald-500',
    },
  ];

  const conversionRate = (from: number, to: number) => {
    if (from === 0) return '--';
    return ((to / from) * 100).toFixed(1) + '%';
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Funil de Vendas
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            Receita Total: {BRL.format(outputs.receitaTotal)}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage.label} className="w-full flex flex-col items-center">
            <div
              className={`${stage.color} rounded-lg py-2.5 px-4 flex items-center justify-between text-white transition-all`}
              style={{ width: stage.width, minWidth: '180px' }}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-heading font-medium truncate">
                  {stage.label}
                </span>
                {stage.receita > 0 && (
                  <span className="text-[9px] opacity-70 font-mono">
                    {BRL.format(stage.receita)}
                  </span>
                )}
              </div>
              <span className="text-sm font-mono font-bold ml-2 whitespace-nowrap">
                {fmtNum(stage.qtd)}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className="flex items-center gap-1.5 py-0.5 text-muted-foreground">
                <span className="text-xs">&#9660;</span>
                <span className="text-[10px] font-mono font-medium">
                  {conversionRate(stages[i].qtd, stages[i + 1].qtd)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
