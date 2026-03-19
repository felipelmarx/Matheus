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
    title: 'Trafego',
    fields: [
      { key: 'investimento', label: 'Investimento', min: 100, max: 500000, step: 100, unit: 'R$' },
      { key: 'cpc', label: 'CPC', min: 0.1, max: 50, step: 0.1, unit: 'R$' },
    ],
  },
  {
    title: 'Conversao',
    fields: [
      { key: 'taxaConversao', label: 'Conv. Pagina', min: 0.1, max: 30, step: 0.1, unit: '%' },
    ],
  },
  {
    title: 'Produto Principal',
    fields: [
      { key: 'precoProduto', label: 'Preco', min: 1, max: 10000, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Order Bump',
    fields: [
      { key: 'taxaBump', label: 'Conv. Bump', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'precoBump', label: 'Preco Bump', min: 0, max: 5000, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Upsell',
    fields: [
      { key: 'taxaUpsell', label: 'Conv. Upsell', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'precoUpsell', label: 'Preco Upsell', min: 0, max: 10000, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Downsell',
    fields: [
      { key: 'taxaDownsell', label: 'Conv. Downsell', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'precoDownsell', label: 'Preco Downsell', min: 0, max: 5000, step: 1, unit: 'R$' },
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
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
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
                            let v = parseFloat(e.target.value);
                            if (!isNaN(v)) {
                              v = Math.max(field.min, Math.min(field.max, v));
                              onUpdate(field.key, v);
                            }
                          }}
                          className="w-20 text-right text-xs font-mono font-bold text-foreground bg-muted/50 border border-border rounded px-1.5 py-0.5 focus:outline-none focus:border-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {field.unit === '%' && (
                          <span className="text-[10px] text-muted-foreground/60">%</span>
                        )}
                      </div>
                    </div>
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
