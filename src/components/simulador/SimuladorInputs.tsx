import { RotateCcw } from 'lucide-react';
import type { SimuladorInputs as InputsType } from '@/hooks/useSimulador';

interface SimuladorInputsProps {
  inputs: InputsType;
  onUpdate: <K extends keyof InputsType>(key: K, value: InputsType[K]) => void;
  onReset: () => void;
}

interface FieldConfig {
  key: keyof InputsType;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  isPercentage?: boolean;
}

const sections: { title: string; fields: FieldConfig[] }[] = [
  {
    title: 'Investimento & Trafego',
    fields: [
      { key: 'investimento', label: 'Investimento', min: 100, max: 50000, step: 100, unit: 'R$' },
      { key: 'cpc', label: 'CPC', min: 0.1, max: 10, step: 0.1, unit: 'R$' },
      { key: 'taxaConexao', label: 'Taxa de Conexao', min: 0, max: 100, step: 1, unit: '%', isPercentage: true },
    ],
  },
  {
    title: 'Conversao Front-End',
    fields: [
      { key: 'taxaConversaoIngresso', label: 'Taxa Conv. Ingresso', min: 0, max: 20, step: 0.5, unit: '%', isPercentage: true },
      { key: 'ticketIngresso', label: 'Ticket Ingresso', min: 0, max: 97, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Qualificacao',
    fields: [
      { key: 'taxaAplicacao', label: 'Taxa Aplicacao', min: 0, max: 100, step: 1, unit: '%', isPercentage: true },
      { key: 'taxaAgendamento', label: 'Taxa Agendamento', min: 0, max: 100, step: 1, unit: '%', isPercentage: true },
      { key: 'taxaEntrevista', label: 'Taxa Entrevista', min: 0, max: 100, step: 1, unit: '%', isPercentage: true },
    ],
  },
  {
    title: 'Back-End (Formacao)',
    fields: [
      { key: 'taxaVendaFormacao', label: 'Taxa Venda Formacao', min: 0, max: 100, step: 1, unit: '%', isPercentage: true },
      { key: 'ticketFormacao', label: 'Ticket Formacao', min: 500, max: 30000, step: 500, unit: 'R$' },
      { key: 'variacao', label: 'Variacao Cenarios', min: 5, max: 50, step: 5, unit: '%', isPercentage: true },
    ],
  },
];

function formatValue(value: number, unit: string): string {
  if (unit === 'R$') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return `${value}%`;
}

export default function SimuladorInputs({ inputs, onUpdate, onReset }: SimuladorInputsProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Parametros
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Resetar
        </button>
      </div>

      <div className="p-4 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-heading font-semibold mb-3">
              {section.title}
            </p>
            <div className="space-y-4">
              {section.fields.map((field) => {
                const value = inputs[field.key];
                const pct = ((value - field.min) / (field.max - field.min)) * 100;
                return (
                  <div key={field.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-muted-foreground font-heading">
                        {field.label}
                      </label>
                      <span className="text-xs font-mono font-bold text-foreground">
                        {formatValue(value, field.unit)}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={value}
                        onChange={(e) => onUpdate(field.key, parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
