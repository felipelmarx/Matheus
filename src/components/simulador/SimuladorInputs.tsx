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
}

const sections: { title: string; fields: FieldConfig[] }[] = [
  {
    title: 'Investimento & Trafego',
    fields: [
      { key: 'investimento', label: 'Investimento', min: 100, max: 50000, step: 100, unit: 'R$' },
      { key: 'cpc', label: 'CPC', min: 0.1, max: 10, step: 0.1, unit: 'R$' },
      { key: 'conectRate', label: 'Connect Rate', min: 0, max: 100, step: 1, unit: '%' },
    ],
  },
  {
    title: 'Checkout',
    fields: [
      { key: 'taxaCheckout', label: 'Conv. Checkout', min: 0, max: 30, step: 0.5, unit: '%' },
      { key: 'ticketIngresso', label: 'Ticket Ingresso', min: 0, max: 197, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Bump (Order Bump)',
    fields: [
      { key: 'taxaBump', label: 'Conv. Bump', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'ticketBump', label: 'Ticket Bump', min: 0, max: 497, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Upsell',
    fields: [
      { key: 'taxaUpsell', label: 'Conv. Upsell', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'ticketUpsell', label: 'Ticket Upsell', min: 0, max: 997, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Qualificacao',
    fields: [
      { key: 'taxaAplicacao', label: 'Taxa Aplicacao', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'taxaAgendamento', label: 'Taxa Agendamento', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'taxaEntrevista', label: 'Taxa Entrevista', min: 0, max: 100, step: 1, unit: '%' },
    ],
  },
  {
    title: 'Back-End (Formacao)',
    fields: [
      { key: 'taxaVendaFormacao', label: 'Taxa Venda', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'ticketFormacao', label: 'Ticket Formacao', min: 500, max: 30000, step: 500, unit: 'R$' },
    ],
  },
  {
    title: 'Cenarios',
    fields: [
      { key: 'variacao', label: 'Variacao', min: 5, max: 50, step: 5, unit: '%' },
    ],
  },
];

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
                      <div className="flex items-center gap-1">
                        {field.unit === 'R$' && (
                          <span className="text-[10px] text-muted-foreground/60">R$</span>
                        )}
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={value}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) onUpdate(field.key, Math.min(field.max, Math.max(field.min, v)));
                          }}
                          className="w-16 text-right text-xs font-mono font-bold text-foreground bg-muted/50 border border-border rounded px-1.5 py-0.5 focus:outline-none focus:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {field.unit === '%' && (
                          <span className="text-[10px] text-muted-foreground/60">%</span>
                        )}
                      </div>
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
