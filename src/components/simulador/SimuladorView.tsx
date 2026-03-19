import { useSimulador } from '@/hooks/useSimulador';
import SimuladorInputs from './SimuladorInputs';
import SimuladorKPIs from './SimuladorKPIs';
import SimuladorFunil from './SimuladorFunil';
import SimuladorAlertas from './SimuladorAlertas';
import SimuladorCenarios from './SimuladorCenarios';

export default function SimuladorView() {
  const { inputs, outputs, alerts, cenarios, updateInput, resetDefaults } = useSimulador();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-card border border-border rounded-xl px-5 py-3 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-heading font-semibold text-foreground">
            Simulador de Funil
          </h2>
          <span className="text-xs text-muted-foreground">
            Projete resultados antes de investir
          </span>
        </div>
      </div>

      {/* Alertas */}
      <SimuladorAlertas alerts={alerts} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs - Left Panel */}
        <div className="lg:col-span-4">
          <SimuladorInputs
            inputs={inputs}
            onUpdate={updateInput}
            onReset={resetDefaults}
          />
        </div>

        {/* Results - Right Panel */}
        <div className="lg:col-span-8 space-y-6">
          <SimuladorKPIs outputs={outputs} />
          <SimuladorFunil outputs={outputs} />
          <SimuladorCenarios cenarios={cenarios} />
        </div>
      </div>
    </div>
  );
}
