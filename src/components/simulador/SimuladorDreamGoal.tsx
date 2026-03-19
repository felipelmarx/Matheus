import { Target } from 'lucide-react';
import type { DreamGoalResult } from '@/hooks/useSimulador';

interface SimuladorDreamGoalProps {
  lucroDesejado: number;
  onChangeLucro: (value: number) => void;
  result: DreamGoalResult | null;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const fmtNum = (v: number) => v.toLocaleString('pt-BR');

export default function SimuladorDreamGoal({ lucroDesejado, onChangeLucro, result }: SimuladorDreamGoalProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-violet-500/10 to-transparent flex items-center gap-2">
        <Target className="w-4 h-4 text-violet-400" />
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Dream Goal — Engenharia Reversa
        </h3>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4 mb-5">
          <label className="text-xs text-muted-foreground font-heading whitespace-nowrap">
            Lucro desejado:
          </label>
          <div className="flex-1 relative">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-violet-500/70"
                style={{ width: `${Math.min((lucroDesejado / 500000) * 100, 100)}%` }}
              />
            </div>
            <input
              type="range"
              min={1000}
              max={500000}
              step={1000}
              value={lucroDesejado}
              onChange={(e) => onChangeLucro(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-sm font-mono font-bold text-violet-400 whitespace-nowrap">
            {BRL.format(lucroDesejado)}
          </span>
        </div>

        {result ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 rounded-lg p-3 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
                Vendas necessarias
              </p>
              <p className="text-lg font-mono font-bold text-foreground">{fmtNum(result.vendasNecessarias)}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 rounded-lg p-3 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
                Cliques necessarios
              </p>
              <p className="text-lg font-mono font-bold text-foreground">{fmtNum(result.cliquesNecessarios)}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 rounded-lg p-3 text-center">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
                Investimento necessario
              </p>
              <p className="text-lg font-mono font-bold text-violet-400">{BRL.format(result.investimentoNecessario)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Ajuste os parametros do funil para ter lucro positivo. Assim o Dream Goal calcula o que voce precisa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
