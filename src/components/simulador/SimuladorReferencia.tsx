import type { DesafioData } from '@/types/metrics';
import { Trophy, Clock, ArrowRight } from 'lucide-react';

interface ConversionRates {
  label: string;
  taxaAplicacao: number;
  taxaAgendamento: number;
  taxaEntrevista: number;
  taxaVendaFormacao: number;
}

function calcRates(d: DesafioData, label: string): ConversionRates | null {
  if (d.vendas <= 0 || d.aplicacoes <= 0) return null;
  return {
    label,
    taxaAplicacao: (d.aplicacoes / d.vendas) * 100,
    taxaAgendamento: d.aplicacoes > 0 ? (d.agendamentos / d.aplicacoes) * 100 : 0,
    taxaEntrevista: d.agendamentos > 0 ? (d.entrevistas / d.agendamentos) * 100 : 0,
    taxaVendaFormacao: d.entrevistas > 0 ? (d.vendasFormacao / d.entrevistas) * 100 : 0,
  };
}

interface SimuladorReferenciaProps {
  desafios: { key: string; label: string; data: DesafioData }[];
  onApply: (rates: { taxaAplicacao: number; taxaAgendamento: number; taxaEntrevista: number; taxaVendaFormacao: number }) => void;
}

function RateCard({ rates, icon, color, gradientFrom, borderColor, onApply }: {
  rates: ConversionRates;
  icon: React.ReactNode;
  color: string;
  gradientFrom: string;
  borderColor: string;
  onApply: () => void;
}) {
  const items = [
    { label: 'Aplicacao', value: rates.taxaAplicacao },
    { label: 'Agendamento', value: rates.taxaAgendamento },
    { label: 'Entrevista', value: rates.taxaEntrevista },
    { label: 'Venda Formacao', value: rates.taxaVendaFormacao },
  ];

  return (
    <div className={`bg-gradient-to-br ${gradientFrom} border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-heading font-semibold ${color}`}>
              {rates.label}
            </p>
          </div>
        </div>
        <button
          onClick={onApply}
          className={`flex items-center gap-1 text-[10px] font-heading font-medium px-2.5 py-1 rounded-lg ${color} bg-white/5 hover:bg-white/10 border ${borderColor} transition-all hover:scale-105`}
        >
          Aplicar <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-black/10 rounded-lg px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">
              {item.label}
            </p>
            <p className="text-sm font-bold font-mono text-foreground">
              {item.value.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SimuladorReferencia({ desafios, onApply }: SimuladorReferenciaProps) {
  const allRates = desafios
    .map((d) => calcRates(d.data, d.label))
    .filter((r): r is ConversionRates => r !== null);

  if (allRates.length === 0) return null;

  // Best: highest overall conversion (vendas → vendas formação)
  const best = allRates.reduce((a, b) => {
    const scoreA = (a.taxaAplicacao / 100) * (a.taxaAgendamento / 100) * (a.taxaEntrevista / 100) * (a.taxaVendaFormacao / 100);
    const scoreB = (b.taxaAplicacao / 100) * (b.taxaAgendamento / 100) * (b.taxaEntrevista / 100) * (b.taxaVendaFormacao / 100);
    return scoreB > scoreA ? b : a;
  });

  // Latest: last in the array with data
  const latest = allRates[allRates.length - 1];

  const applyRates = (r: ConversionRates) => {
    onApply({
      taxaAplicacao: Math.round(r.taxaAplicacao),
      taxaAgendamento: Math.round(r.taxaAgendamento),
      taxaEntrevista: Math.round(r.taxaEntrevista),
      taxaVendaFormacao: Math.round(r.taxaVendaFormacao),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RateCard
        rates={best}
        icon={<Trophy className="w-4 h-4 text-amber-400" />}
        color="text-amber-400"
        gradientFrom="from-amber-500/10 to-amber-600/5"
        borderColor="border-amber-500/20"
        onApply={() => applyRates(best)}
      />
      {latest && latest.label !== best.label && (
        <RateCard
          rates={latest}
          icon={<Clock className="w-4 h-4 text-blue-400" />}
          color="text-blue-400"
          gradientFrom="from-blue-500/10 to-blue-600/5"
          borderColor="border-blue-500/20"
          onApply={() => applyRates(latest)}
        />
      )}
      {latest && latest.label === best.label && allRates.length > 1 && (
        <RateCard
          rates={allRates[allRates.length - 2]}
          icon={<Clock className="w-4 h-4 text-blue-400" />}
          color="text-blue-400"
          gradientFrom="from-blue-500/10 to-blue-600/5"
          borderColor="border-blue-500/20"
          onApply={() => applyRates(allRates[allRates.length - 2])}
        />
      )}
    </div>
  );
}
