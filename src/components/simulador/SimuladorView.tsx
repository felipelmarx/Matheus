import { useSimulador } from '@/hooks/useSimulador';
import SimuladorInputs from './SimuladorInputs';
import SimuladorKPIs from './SimuladorKPIs';
import SimuladorFunil from './SimuladorFunil';
import SimuladorAlertas from './SimuladorAlertas';

export default function SimuladorView() {
  const { inputs, outputs, alerts, updateInput, resetDefaults } = useSimulador();

  return (
    <div className="space-y-6 animate-fade-in">
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

        {/* Funil - Right */}
        <div className="lg:col-span-8">
          <SimuladorFunil
            outputs={outputs}
            investimento={inputs.investimento}
            cpc={inputs.cpc}
            taxaConversao={inputs.taxaConversao}
          />
        </div>
      </div>
    </div>
  );
}
