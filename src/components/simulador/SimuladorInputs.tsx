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
  hint?: string;
}

const sections: { title: string; fields: FieldConfig[] }[] = [
  {
    title: 'Investimento & Trafego',
    fields: [
      { key: 'investimento', label: 'Investimento', min: 100, max: 1000000, step: 500, unit: 'R$' },
      { key: 'cpc', label: 'CPC', min: 0.1, max: 20, step: 0.1, unit: 'R$' },
      { key: 'conectRate', label: 'Connect Rate', min: 0, max: 100, step: 1, unit: '%' },
    ],
  },
  {
    title: 'Checkout',
    fields: [
      { key: 'taxaCheckout', label: 'Conv. Checkout', min: 0, max: 100, step: 0.5, unit: '%' },
      { key: 'ticketIngresso', label: 'Ticket Ingresso', min: 0, max: 997, step: 1, unit: 'R$' },
      { key: 'ingressosManuais', label: 'Ingressos (manual)', min: 0, max: 100000, step: 1, unit: 'un', hint: '0 = calcula pelo trafego' },
    ],
  },
  {
    title: 'Bump (Order Bump)',
    fields: [
      { key: 'taxaBump', label: 'Conv. Bump', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'ticketBump', label: 'Ticket Bump', min: 0, max: 2000, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Upsell',
    fields: [
      { key: 'taxaUpsell', label: 'Conv. Upsell', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'ticketUpsell', label: 'Ticket Upsell', min: 0, max: 5000, step: 1, unit: 'R$' },
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
      { key: 'ticketFormacao', label: 'Ticket Formacao', min: 0, max: 100000, step: 500, unit: 'R$' },
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
                const pct = field.max > field.min
                  ? ((value - field.min) / (field.max - field.min)) * 100
                  : 0;
                const isOverrideActive = field.key === 'ingressosManuais' && value > 0;
                const overrideMode = inputs.ingressosManuais > 0;
                const isDimmed = overrideMode && ['cpc', 'conectRate', 'taxaCheckout'].includes(field.key as string);
                return (
                  <div key={field.key} className={isDimmed ? 'opacity-40 pointer-events-none' : ''}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs text-muted-foreground font-heading">
                          {field.label}
                        </label>
                        {isOverrideActive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-heading font-semibold">
                            ATIVO
                          </span>
                        )}
                      </div>
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
                            let v = parseFloat(e.target.value);
                            if (!isNaN(v)) {
                              v = Math.max(field.min, Math.min(field.max, v));
                              if (field.key === 'ingressosManuais') v = Math.round(v);
                              onUpdate(field.key, v);
                            }
                          }}
                          className={`w-20 text-right text-xs font-mono font-bold text-foreground bg-muted/50 border rounded px-1.5 py-0.5 focus:outline-none focus:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            isOverrideActive ? 'border-primary/40' : 'border-border'
                          }`}
                        />
                        {field.unit === '%' && (
                          <span className="text-[10px] text-muted-foreground/60">%</span>
                        )}
                        {field.unit === 'un' && (
                          <span className="text-[10px] text-muted-foreground/60">un</span>
                        )}
                      </div>
                    </div>
                    {field.hint && (
                      <p className="text-[9px] text-muted-foreground/40 mb-1">{field.hint}</p>
                    )}
                    <div className="relative">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-primary"
                          style={{ width: `${Math.min(pct, 100)}%` }}
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
