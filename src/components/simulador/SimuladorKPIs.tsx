import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorKPIsProps {
  outputs: SimuladorOutputs;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface KPICard {
  label: string;
  value: string;
  sub?: string;
  color: string;
  borderColor: string;
  valueColor?: string;
}

export default function SimuladorKPIs({ outputs }: SimuladorKPIsProps) {
  const isPositive = outputs.lucro >= 0;
  const roasPositive = outputs.roas >= 1;
  const saldoPositive = outputs.saldoFrontEnd >= 0;

  const cards: KPICard[] = [
    {
      label: 'ROI',
      value: `${outputs.roi.toFixed(1)}%`,
      color: isPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      borderColor: isPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      valueColor: isPositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'ROAS',
      value: `${outputs.roas.toFixed(2)}x`,
      color: roasPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      borderColor: roasPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      valueColor: roasPositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'LUCRO PROJETADO',
      value: BRL.format(outputs.lucro),
      color: isPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      borderColor: isPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      valueColor: isPositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'FAT. TOTAL',
      value: BRL.format(outputs.faturamentoTotal),
      color: 'from-primary/10 to-primary/5',
      borderColor: 'border-primary/20',
    },
    {
      label: 'SALDO FRONT-END',
      value: BRL.format(outputs.saldoFrontEnd),
      sub: saldoPositive ? 'Front-end ja cobre o investimento' : 'Deficit recuperado pelo back-end',
      color: saldoPositive ? 'from-emerald-500/10 to-emerald-600/5' : 'from-red-500/10 to-red-600/5',
      borderColor: saldoPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      valueColor: saldoPositive ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'TICKET MEDIO FRONT',
      value: BRL.format(outputs.ticketMedioFrontEnd),
      color: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-500/20',
    },
    {
      label: 'FAT. FRONT-END',
      value: BRL.format(outputs.faturamentoFrontEnd),
      sub: `Ingresso ${BRL.format(outputs.receitaIngresso)} + Bump ${BRL.format(outputs.receitaBump)} + Upsell ${BRL.format(outputs.receitaUpsell)}`,
      color: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'FAT. BACK-END',
      value: BRL.format(outputs.faturamentoBackEnd),
      color: 'from-violet-500/10 to-violet-600/5',
      borderColor: 'border-violet-500/20',
    },
    {
      label: 'CPA INGRESSO',
      value: BRL.format(outputs.cpa),
      color: 'from-amber-500/10 to-amber-600/5',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'CUSTO / ENTREVISTA',
      value: BRL.format(outputs.custoEntrevista),
      color: 'from-pink-500/10 to-pink-600/5',
      borderColor: 'border-pink-500/20',
    },
    {
      label: 'CUSTO / VENDA FORM.',
      value: BRL.format(outputs.custoVendaFormacao),
      color: 'from-orange-500/10 to-orange-600/5',
      borderColor: 'border-orange-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl p-4 transition-all hover:scale-[1.02]`}
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-heading mb-2">
            {card.label}
          </p>
          <p className={`text-sm font-bold font-mono ${card.valueColor || 'text-foreground'}`}>
            {card.value}
          </p>
          {card.sub && (
            <p className="text-[9px] text-muted-foreground/60 font-mono mt-1 leading-tight">
              {card.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
