import { useSimulador } from '@/hooks/useSimulador';
import SimuladorInputs from './SimuladorInputs';
import SimuladorKPIs from './SimuladorKPIs';
import SimuladorFunil from './SimuladorFunil';
import SimuladorAlertas from './SimuladorAlertas';
import SimuladorCenarios from './SimuladorCenarios';
import SimuladorDreamGoal from './SimuladorDreamGoal';

export default function SimuladorView() {
  const { inputs, outputs, alerts, cenarios, dreamGoal, lucroDesejado, setLucroDesejado, updateInput, resetDefaults } = useSimulador();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl px-5 py-3 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-heading font-semibold text-foreground">
              Simulador de Funil
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Configure seu funil e veja os resultados em tempo real
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span>{outputs.cliques.toLocaleString('pt-BR')} cliques</span>
            <span>{outputs.vendas.toLocaleString('pt-BR')} vendas</span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <SimuladorAlertas alerts={alerts} />

      {/* KPIs - Full width */}
      <SimuladorKPIs outputs={outputs} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs - Left */}
        <div className="lg:col-span-4">
          <SimuladorInputs inputs={inputs} onUpdate={updateInput} onReset={resetDefaults} />
        </div>

        {/* Funil + Extras - Right */}
        <div className="lg:col-span-8 space-y-6">
          <SimuladorFunil
            outputs={outputs}
            investimento={inputs.investimento}
            cpc={inputs.cpc}
            taxaConversao={inputs.taxaConversao}
          />
          <SimuladorDreamGoal
            lucroDesejado={lucroDesejado}
            onChangeLucro={setLucroDesejado}
            result={dreamGoal}
          />
          <SimuladorCenarios cenarios={cenarios} />
        </div>
      </div>
    </div>
  );
}
