import type { SimuladorInputs as InputsType, SimuladorMode } from '@/hooks/useSimulador';
import { RotateCcw } from 'lucide-react';

interface SimuladorInputsProps {
  inputs: InputsType;
  onUpdate: <K extends keyof InputsType>(key: K, value: InputsType[K]) => void;
  onReset: () => void;
}

interface FieldConfig {
  key: Exclude<keyof InputsType, 'mode'>;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  decimal?: number;
}

// Seções do modo SIMPLES — 5 campos essenciais. Os campos ocultos usam os
// valores atuais (defaults ou vindos do botao "Aplicar Dx").
const simplesSections: { title: string; color: string; fields: FieldConfig[] }[] = [
  {
    title: 'Investimento',
    color: 'text-blue-400',
    fields: [
      { key: 'investimentoTrafego', label: 'Investimento Trafego (Ads)', min: 0, max: 500000, step: 100, unit: 'R$' },
    ],
  },
  {
    title: 'Trafego & Produto',
    color: 'text-cyan-400',
    fields: [
      { key: 'cpc', label: 'Custo por Clique (FB)', min: 0.1, max: 50, step: 0.01, unit: 'R$', decimal: 2 },
      { key: 'ticketMedio', label: 'Ticket Medio (com bumps)', min: 1, max: 200, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Cortesias & Formacao',
    color: 'text-violet-400',
    fields: [
      { key: 'taxaCortesia', label: 'Taxa de Cortesia (% sobre vendas)', min: 0, max: 100, step: 0.5, unit: '%', decimal: 1 },
      { key: 'ticketFormacao', label: 'Ticket Formacao', min: 0, max: 50000, step: 100, unit: 'R$' },
    ],
  },
];

// Seções do modo AVANÇADO — UI completa
const avancadoSections: { title: string; color: string; fields: FieldConfig[] }[] = [
  {
    title: 'Investimento',
    color: 'text-blue-400',
    fields: [
      { key: 'investimentoTrafego', label: 'Investimento Trafego (Ads)', min: 0, max: 500000, step: 100, unit: 'R$' },
    ],
  },
  {
    title: 'Cortesias',
    color: 'text-amber-400',
    fields: [
      { key: 'taxaCortesia', label: 'Taxa de Cortesia (% sobre vendas)', min: 0, max: 100, step: 0.5, unit: '%', decimal: 1 },
      { key: 'custoPorLead', label: 'Custo por Lead (API Lembretes)', min: 0, max: 50, step: 0.5, unit: 'R$', decimal: 2 },
      { key: 'investimentoApiExtra', label: 'API Extra (fixo, nao afeta ingressos)', min: 0, max: 100000, step: 100, unit: 'R$' },
    ],
  },
  {
    title: 'Trafego',
    color: 'text-cyan-400',
    fields: [
      { key: 'cpc', label: 'Custo por Clique', min: 0.1, max: 50, step: 0.01, unit: 'R$', decimal: 2 },
      { key: 'connectRate', label: 'Connect Rate (Cliques -> LPV)', min: 0, max: 100, step: 0.1, unit: '%', decimal: 1 },
    ],
  },
  {
    title: 'Checkout (2 estagios)',
    color: 'text-emerald-400',
    fields: [
      { key: 'taxaLPVCheckout', label: 'LPV -> Checkout', min: 0, max: 100, step: 0.1, unit: '%', decimal: 1 },
      { key: 'taxaCheckoutVenda', label: 'Checkout -> Venda', min: 0, max: 100, step: 0.1, unit: '%', decimal: 1 },
    ],
  },
  {
    title: 'Produto',
    color: 'text-primary',
    fields: [
      { key: 'precoIngresso', label: 'Preco do Ingresso', min: 1, max: 1000, step: 1, unit: 'R$' },
      { key: 'ticketMedio', label: 'Ticket Medio (com bumps)', min: 1, max: 200, step: 1, unit: 'R$' },
    ],
  },
  {
    title: 'Qualificacao',
    color: 'text-pink-400',
    fields: [
      { key: 'taxaAplicacao', label: 'Inscritos -> Aplicacao', min: 0, max: 100, step: 0.1, unit: '%', decimal: 1 },
      { key: 'taxaAgendamento', label: 'Aplicacao -> Agendamento', min: 0, max: 100, step: 0.1, unit: '%', decimal: 1 },
      { key: 'taxaEntrevista', label: 'Agendamento -> Entrevista', min: 0, max: 100, step: 0.1, unit: '%', decimal: 1 },
    ],
  },
  {
    title: 'Formacao (High-Ticket)',
    color: 'text-violet-400',
    fields: [
      { key: 'taxaVendaFormacao', label: 'Entrevista -> Venda Formacao', min: 0, max: 100, step: 0.1, unit: '%', decimal: 1 },
      { key: 'ticketFormacao', label: 'Ticket Formacao', min: 0, max: 50000, step: 100, unit: 'R$' },
    ],
  },
];

function formatDisplay(value: number, unit: string, decimal?: number): string {
  if (unit === 'R$') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: decimal ?? 0, maximumFractionDigits: decimal ?? 0 })}`;
  if (unit === '%') return `${value.toFixed(decimal ?? 0)}%`;
  return value.toString();
}

export default function SimuladorInputs({ inputs, onUpdate, onReset }: SimuladorInputsProps) {
  const isSimples = inputs.mode === 'simples';
  const sections = isSimples ? simplesSections : avancadoSections;

  const setMode = (mode: SimuladorMode) => onUpdate('mode', mode);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Configuracao do Funil
        </h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          <RotateCcw className="w-3 h-3" />
          Resetar
        </button>
      </div>

      {/* Toggle Modo Simples / Avancado */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setMode('simples')}
            className={`flex-1 text-[11px] font-heading font-semibold py-1.5 rounded-md transition-all ${
              isSimples
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Simples
          </button>
          <button
            type="button"
            onClick={() => setMode('avancado')}
            className={`flex-1 text-[11px] font-heading font-semibold py-1.5 rounded-md transition-all ${
              !isSimples
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Avancado
          </button>
        </div>
        {isSimples && (
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            5 metricas essenciais. Clique em &quot;Aplicar Dx&quot; acima para carregar as taxas do desafio.
          </p>
        )}
      </div>

      <div className="p-4 space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className={`text-[10px] uppercase tracking-wider font-heading font-semibold ${section.color}`}>
              {section.title}
            </p>
            {section.fields.map((field) => {
              const value = inputs[field.key];
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
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={value}
                      onChange={(e) => onUpdate(field.key, parseFloat(e.target.value))}
                      className="sim-slider w-full"
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
