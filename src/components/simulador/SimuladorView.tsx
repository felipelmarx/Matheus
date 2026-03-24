import type { AllDesafiosData } from '@/types/metrics';
import { useSimulador } from '@/hooks/useSimulador';
import SimuladorInputs from './SimuladorInputs';
import SimuladorKPIs from './SimuladorKPIs';
import SimuladorFunil from './SimuladorFunil';
import SimuladorAlertas from './SimuladorAlertas';
import SimuladorReferencia from './SimuladorReferencia';

interface SimuladorViewProps {
  data?: AllDesafiosData | null;
}

export default function SimuladorView({ data }: SimuladorViewProps) {
  const { inputs, outputs, alerts, updateInput, resetDefaults } = useSimulador();

  const desafios = data ? [
    { key: 'desafio1', label: 'Desafio 1', data: data.desafio1 },
    { key: 'desafio2', label: 'Desafio 2', data: data.desafio2 },
    { key: 'desafio3', label: 'Desafio 3', data: data.desafio3 },
    { key: 'desafio4', label: 'Desafio 4', data: data.desafio4 },
  ] : [];

  const handleApplyRates = (rates: { taxaAplicacao: number; taxaAgendamento: number; taxaEntrevista: number; taxaVendaFormacao: number }) => {
    updateInput('taxaAplicacao', rates.taxaAplicacao);
    updateInput('taxaAgendamento', rates.taxaAgendamento);
    updateInput('taxaEntrevista', rates.taxaEntrevista);
    updateInput('taxaVendaFormacao', rates.taxaVendaFormacao);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Referência: Melhor Desafio + Último Desafio */}
      {desafios.length > 0 && (
        <SimuladorReferencia desafios={desafios} onApply={handleApplyRates} />
      )}

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
          <SimuladorFunil outputs={outputs} />
        </div>
      </div>
    </div>
  );
}
