import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorKPIsProps {
  outputs: SimuladorOutputs;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function SimuladorKPIs({ outputs }: SimuladorKPIsProps) {
  const prejuizoPos = outputs.saldoFrontEnd >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Prejuízo Captação */}
      <div
        className={`bg-gradient-to-br ${prejuizoPos ? 'from-emerald-500/15 to-emerald-600/5' : 'from-red-500/15 to-red-600/5'} border ${prejuizoPos ? 'border-emerald-500/30' : 'border-red-500/30'} rounded-xl p-4 transition-all hover:scale-[1.02]`}
      >
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Prejuizo Captacao
        </p>
        <p className={`text-lg font-bold font-mono ${prejuizoPos ? 'text-emerald-400' : 'text-red-400'}`}>
          {BRL.format(outputs.saldoFrontEnd)}
        </p>
      </div>

      {/* Faturamento Formação */}
      <div className="bg-gradient-to-br from-violet-500/15 to-violet-600/5 border border-violet-500/30 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Faturamento Formacao
        </p>
        <p className="text-lg font-bold font-mono text-violet-400">
          {BRL.format(outputs.faturamentoBackEnd)}
        </p>
      </div>

      {/* CPA do Tráfego */}
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          CPA do Trafego
        </p>
        <p className="text-lg font-bold font-mono text-foreground">
          {BRL.format(outputs.cpa)}
        </p>
      </div>

      {/* Custo / Aplicação */}
      <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Custo / Aplicacao
        </p>
        <p className="text-lg font-bold font-mono text-foreground">
          {BRL.format(outputs.custoAplicacao)}
        </p>
      </div>

      {/* Custo / Agendamento */}
      <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          Custo / Agendamento
        </p>
        <p className="text-lg font-bold font-mono text-foreground">
          {BRL.format(outputs.custoAgendamento)}
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

      {/* Ticket Médio Formação */}
      <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-xl p-4 transition-all hover:scale-[1.02]">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          TM Formacao
        </p>
        <p className="text-lg font-bold font-mono text-foreground">
          {BRL.format(outputs.ticketMedioFormacao)}
        </p>
      </div>

      {/* TM/CAC */}
      <div className={`bg-gradient-to-br ${outputs.tmCac >= 1 ? 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' : 'from-red-500/10 to-red-600/5 border-red-500/20'} border rounded-xl p-4 transition-all hover:scale-[1.02]`}>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading mb-1">
          TM / CAC
        </p>
        <p className={`text-lg font-bold font-mono ${outputs.tmCac >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
          {outputs.tmCac.toFixed(2)}x
        </p>
      </div>
    </div>
  );
}
