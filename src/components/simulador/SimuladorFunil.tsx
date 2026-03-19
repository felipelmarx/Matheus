import { MousePointerClick, FileText, ShoppingCart, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorFunilProps {
  outputs: SimuladorOutputs;
  investimento: number;
  cpc: number;
  taxaConversao: number;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const fmtNum = (v: number) => v.toLocaleString('pt-BR');

interface StageProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  count: number;
  countLabel: string;
  receita?: number;
  color: string;
  borderColor: string;
}

function Stage({ icon, label, sublabel, count, countLabel, receita, color, borderColor }: StageProps) {
  return (
    <div className={`border ${borderColor} rounded-lg p-3 bg-gradient-to-r ${color} to-transparent w-full`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${borderColor} border bg-card/50`}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-heading font-semibold text-foreground">{label}</p>
            {sublabel && <p className="text-[9px] text-muted-foreground font-mono">{sublabel}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-bold text-foreground">{fmtNum(count)}</p>
          <p className="text-[9px] text-muted-foreground">{countLabel}</p>
        </div>
      </div>
      {receita !== undefined && receita > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Receita</span>
          <span className="text-xs font-mono font-bold text-emerald-400">{BRL.format(receita)}</span>
        </div>
      )}
    </div>
  );
}

function Connector({ rate, label }: { rate: string; label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-3 bg-border" />
      <div className="flex items-center gap-1.5 py-0.5">
        <span className="text-[10px] font-mono font-semibold text-primary">{rate}</span>
        {label && <span className="text-[9px] text-muted-foreground">({label})</span>}
      </div>
      <div className="w-px h-3 bg-border" />
    </div>
  );
}

export default function SimuladorFunil({ outputs, investimento, cpc, taxaConversao }: SimuladorFunilProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Fluxo do Funil
        </h3>
      </div>

      <div className="p-5 flex flex-col items-center">
        {/* Tráfego */}
        <Stage
          icon={<MousePointerClick className="w-3.5 h-3.5 text-blue-400" />}
          label="Trafego"
          sublabel={`Invest: ${BRL.format(investimento)} | CPC: R$ ${cpc.toFixed(2)}`}
          count={outputs.cliques}
          countLabel="cliques"
          color="from-blue-500/10"
          borderColor="border-blue-500/20"
        />

        <Connector rate={`${taxaConversao}%`} label="conversao" />

        {/* Página → Vendas */}
        <Stage
          icon={<FileText className="w-3.5 h-3.5 text-cyan-400" />}
          label="Pagina de Vendas"
          sublabel={`${fmtNum(outputs.cliques)} visitantes`}
          count={outputs.vendas}
          countLabel="vendas"
          receita={outputs.receitaProduto}
          color="from-cyan-500/10"
          borderColor="border-cyan-500/20"
        />

        {outputs.vendasBump > 0 && (
          <>
            <Connector rate={`${outputs.vendas > 0 ? ((outputs.vendasBump / outputs.vendas) * 100).toFixed(0) : 0}%`} label="bump" />

            {/* Order Bump */}
            <Stage
              icon={<Plus className="w-3.5 h-3.5 text-amber-400" />}
              label="Order Bump"
              count={outputs.vendasBump}
              countLabel="aceitaram"
              receita={outputs.receitaBump}
              color="from-amber-500/10"
              borderColor="border-amber-500/20"
            />
          </>
        )}

        {/* Split: Upsell / Downsell */}
        {(outputs.vendasUpsell > 0 || outputs.vendasDownsell > 0) && (
          <>
            <div className="flex flex-col items-center py-1">
              <div className="w-px h-4 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              {/* Upsell */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-2">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-mono font-semibold text-emerald-400">
                    {outputs.vendas > 0 ? ((outputs.vendasUpsell / outputs.vendas) * 100).toFixed(0) : 0}% aceitam
                  </span>
                </div>
                <Stage
                  icon={<ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
                  label="Upsell"
                  count={outputs.vendasUpsell}
                  countLabel="vendas"
                  receita={outputs.receitaUpsell}
                  color="from-emerald-500/10"
                  borderColor="border-emerald-500/20"
                />
              </div>

              {/* Downsell */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-2">
                  <ArrowDownRight className="w-3 h-3 text-orange-400" />
                  <span className="text-[10px] font-mono font-semibold text-orange-400">
                    {outputs.recusaramUpsell > 0 ? ((outputs.vendasDownsell / outputs.recusaramUpsell) * 100).toFixed(0) : 0}% dos que recusaram
                  </span>
                </div>
                <Stage
                  icon={<ArrowDownRight className="w-3.5 h-3.5 text-orange-400" />}
                  label="Downsell"
                  sublabel={`${fmtNum(outputs.recusaramUpsell)} recusaram upsell`}
                  count={outputs.vendasDownsell}
                  countLabel="vendas"
                  receita={outputs.receitaDownsell}
                  color="from-orange-500/10"
                  borderColor="border-orange-500/20"
                />
              </div>
            </div>
          </>
        )}

        {/* Receita Total */}
        <div className="flex flex-col items-center py-2">
          <div className="w-px h-4 bg-border" />
        </div>
        <div className="w-full border border-primary/30 rounded-lg p-3 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Receita Bruta</p>
              <p className="text-sm font-mono font-bold text-foreground">{BRL.format(outputs.receitaBruta)}</p>
            </div>
            {(outputs.reembolsos > 0 || outputs.custosProduto > 0) && (
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Deducoes</p>
                <p className="text-[11px] font-mono text-red-400">
                  {outputs.reembolsos > 0 && `Reemb: -${BRL.format(outputs.reembolsos)}`}
                  {outputs.reembolsos > 0 && outputs.custosProduto > 0 && ' | '}
                  {outputs.custosProduto > 0 && `Custo: -${BRL.format(outputs.custosProduto)}`}
                </p>
              </div>
            )}
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Lucro</p>
              <p className={`text-sm font-mono font-bold ${outputs.lucro >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {BRL.format(outputs.lucro)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
