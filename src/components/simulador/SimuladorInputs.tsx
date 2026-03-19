import type { SimuladorInputs as InputsType } from '@/hooks/useSimulador';
import { RotateCcw } from 'lucide-react';

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
  decimal?: number;
}

const sections: { title: string; color: string; fields: FieldConfig[] }[] = [
  {
    title: 'Trafego',
    color: 'text-blue-400',
    fields: [
      { key: 'investimento', label: 'Investimento', min: 100, max: 500000, step: 100, unit: 'R$' },
      { key: 'cpc', label: 'Custo por Clique', min: 0.1, max: 50, step: 0.1, unit: 'R$', decimal: 2 },
    ],
  },
  {
    title: 'Pagina de Vendas',
    color: 'text-cyan-400',
    fields: [
      { key: 'taxaConversao', label: 'Taxa de Conversao', min: 0.1, max: 30, step: 0.1, unit: '%', decimal: 1 },
    ],
  },
  {
    title: 'Produto Principal',
    color: 'text-primary',
    fields: [
      { key: 'precoProduto', label: 'Preco', min: 1, max: 10000, step: 1, unit: 'R$' },
      { key: 'custoProduto', label: 'Custo do Produto', min: 0, max: 5000, step: 1, unit: 'R$' },
      { key: 'taxaReembolso', label: 'Taxa de Reembolso', min: 0, max: 50, step: 1, unit: '%' },
    ],
  },
  {
    title: 'Order Bump',
    color: 'text-amber-400',
    fields: [
      { key: 'precoBump', label: 'Preco', min: 0, max: 5000, step: 1, unit: 'R$' },
      { key: 'taxaBump', label: 'Taxa de Aceitacao', min: 0, max: 100, step: 1, unit: '%' },
    ],
  },
  {
    title: 'Upsell',
    color: 'text-emerald-400',
    fields: [
      { key: 'precoUpsell', label: 'Preco', min: 0, max: 10000, step: 1, unit: 'R$' },
      { key: 'taxaUpsell', label: 'Taxa de Aceitacao', min: 0, max: 100, step: 1, unit: '%' },
    ],
  },
  {
    title: 'Downsell',
    color: 'text-orange-400',
    fields: [
      { key: 'precoDownsell', label: 'Preco', min: 0, max: 5000, step: 1, unit: 'R$' },
      { key: 'taxaDownsell', label: 'Taxa de Aceitacao', min: 0, max: 100, step: 1, unit: '%' },
    ],
  },
];

function formatDisplay(value: number, unit: string, decimal?: number): string {
  if (unit === 'R$') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: decimal ?? 0, maximumFractionDigits: decimal ?? 0 })}`;
  if (unit === '%') return `${value.toFixed(decimal ?? 0)}%`;
  return value.toString();
}

export default function SimuladorInputs({ inputs, onUpdate, onReset }: SimuladorInputsProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Configuracao do Funil
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Resetar
        </button>
      </div>

      <div className="p-4 space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className={`text-[10px] uppercase tracking-wider font-heading font-semibold ${section.color}`}>
              {section.title}
            </p>
            {section.fields.map((field) => {
              const value = inputs[field.key];
              const pct = field.max > field.min ? ((value - field.min) / (field.max - field.min)) * 100 : 0;
              return (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-muted-foreground font-heading">
                      {field.label}
                    </label>
                    <span className="text-[11px] font-mono font-bold text-foreground">
                      {formatDisplay(value, field.unit, field.decimal)}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-primary/70"
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
        ))}
      </div>
    </div>
  );
}
