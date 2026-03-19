import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorKPIsProps {
  outputs: SimuladorOutputs;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function SimuladorKPIs({ outputs }: SimuladorKPIsProps) {
  const saldoPos = outputs.saldoFrontEnd >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Saldo Front-End */}
      <div
        className={`bg-gradient-to-br ${saldoPos ? 'from-emerald-500/15 to-emerald-600/5' : 'from-red-500/15 to-red-600/5'} border ${saldoPos ? 'border-emerald-500/30' : 'border-red-500/30'} rounded-xl p-4 transition-all hover:scale-[1.02]`}
      >
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Saldo Front-End
        </p>
        <p className={`text-lg font-bold font-mono ${saldoPos ? 'text-emerald-400' : 'text-red-400'}`}>
          {BRL.format(outputs.saldoFrontEnd)}
        </p>
      </div>

      {/* Fat. Back-End */}
      <div className="bg-gradient-to-br from-violet-500/15 to-violet-600/5 border border-violet-500/30 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Fat. Back-End
        </p>
        <p className="text-lg font-bold font-mono text-violet-400">
          {BRL.format(outputs.faturamentoBackEnd)}
        </p>
      </div>

      {/* CPA */}
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          CPA
        </p>
        <p className="text-lg font-bold font-mono text-foreground">
          {BRL.format(outputs.cpa)}
        </p>
      </div>

      {/* Custo / Entrevista */}
      <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Custo / Entrevista
        </p>
        <p className="text-lg font-bold font-mono text-foreground">
          {BRL.format(outputs.custoEntrevista)}
        </p>
      </div>

      {/* Custo / Venda Form. */}
      <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Custo / Venda Form.
        </p>
        <p className="text-lg font-bold font-mono text-foreground">
          {BRL.format(outputs.custoVendaFormacao)}
        </p>
      </div>
    </div>
  );
}
