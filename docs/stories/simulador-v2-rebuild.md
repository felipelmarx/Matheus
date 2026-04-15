# Story: Simulador 2.0 — Rebuild com Modelo Real

**Status:** Ready for Dev
**Priority:** HIGH
**Owner:** Sr. Matheus (Desafio 5D)
**Created:** 2026-04-15

---

## Contexto

O simulador atual em `src/components/simulador/` produz cálculos que **não refletem a realidade operacional** do Desafio 5D. Sr. Matheus forneceu números reais da operação que devem ser o ground truth do novo modelo. O simulador precisa ser reconstruído mantendo a arquitetura modular, mas com fórmulas alinhadas à realidade.

## Problema

1. `custoVendaFormacao` só calcula quando front-end é negativo (bug: zera quando captação é lucrativa).
2. Conversão é modelada em 1 estágio, mas na realidade são 2 (LPV→Checkout, Checkout→Venda).
3. Order Bump/Upsell/Downsell ocupam 3 inputs, mas na operação real só há bump — ticket médio já consolida isso.
4. Não há modelo de "Connect Rate" (cliques que realmente carregam a LP).
5. Um único campo de investimento mistura tráfego com custos operacionais (API de lembretes), impedindo simulação correta.
6. Componentes órfãos (`SimuladorCenarios`, `SimuladorDreamGoal`, `SimuladorAlertas`) não estão montados.

---

## Ground Truth — Números Reais (Desafio 5D atual)

### Investimento
- **Investimento Tráfego (ads):** R$ 78.723
- **API (Lembretes):** R$ 20.277
- **Total Bruto:** R$ 99.000

### Tráfego
- CPC: R$ 2,84 (input do usuário: R$ 2,75)
- Cliques: 27.733
- Connect Rate (LPV/cliques): 64,6%
- View Page: 17.907

### Checkout (2 estágios)
- Taxa LPV → Checkout: 19,0% → 3.403 checkouts iniciados
- Taxa Checkout → Venda: 38,6% → 1.314 vendas
- Preço do Ingresso: R$ 7
- Ticket Médio (com bumps): R$ 18
- Faturamento Captação: R$ 23.652 (~R$ 23.400)
- CPA: R$ 59,91 (~R$ 58) — usa **apenas** investimento tráfego / vendas

### Backend (Qualificação → Formação)
- Aplicações: 168 (12,8% das vendas)
- Agendamentos: 117 (69,6% das aplicações)
- Entrevistas: 65 (55,6% dos agendamentos)
- Vendas Formação: 28 (43,1% das entrevistas)
- Ticket Formação: R$ 6.594
- Faturamento Formação: R$ 184.632

### Resultado Esperado (o simulador DEVE retornar exatamente isso com esses inputs)
- **Investimento Líquido:** R$ 75.600 (99.000 − 23.400)
- **Custo/Venda Formação:** R$ 2.700 (75.600 / 28) ← KPI principal
- **TM Formação / CAC:** 2,44x
- **Faturamento Total:** R$ 208.032
- **Lucro:** R$ 109.032
- **ROI:** 110%
- **ROAS:** 2,10x

---

## Nova Arquitetura

### Inputs (novo shape)

```typescript
interface SimuladorInputs {
  // Investimento (2 campos separados)
  investimentoTrafego: number;  // R$ ads spend
  investimentoApi: number;      // R$ API/Lembretes

  // Tráfego
  cpc: number;                  // custo por clique
  connectRate: number;          // % cliques -> LPV

  // Checkout (2 estágios)
  taxaLPVCheckout: number;      // % LPV -> checkout iniciado
  taxaCheckoutVenda: number;    // % checkout iniciado -> venda

  // Produto
  precoIngresso: number;        // preço do produto entry
  ticketMedio: number;          // ticket médio consolidado (inclui bumps)

  // Backend — Qualificação
  taxaAplicacao: number;        // % vendas -> aplicações
  taxaAgendamento: number;      // % aplicações -> agendamentos
  taxaEntrevista: number;       // % agendamentos -> entrevistas

  // Backend — Formação
  taxaVendaFormacao: number;    // % entrevistas -> vendas formação
  ticketFormacao: number;       // ticket médio formação
}
```

### DEFAULTS (seed com números reais)

```typescript
const DEFAULTS: SimuladorInputs = {
  investimentoTrafego: 78723,
  investimentoApi: 20277,
  cpc: 2.84,
  connectRate: 64.6,
  taxaLPVCheckout: 19.0,
  taxaCheckoutVenda: 38.6,
  precoIngresso: 7,
  ticketMedio: 18,
  taxaAplicacao: 12.8,
  taxaAgendamento: 69.6,
  taxaEntrevista: 55.6,
  taxaVendaFormacao: 43.1,
  ticketFormacao: 6594,
};
```

### Outputs (novo shape)

```typescript
interface SimuladorOutputs {
  // Investimento
  investimentoBruto: number;
  investimentoLiquido: number;

  // Tráfego
  cliques: number;
  viewPage: number;

  // Checkout
  checkouts: number;
  vendas: number;
  faturamentoCaptacao: number;

  // Backend
  aplicacoes: number;
  agendamentos: number;
  entrevistas: number;
  vendasFormacao: number;
  faturamentoFormacao: number;

  // KPIs
  cpa: number;                    // investimentoTrafego / vendas
  custoVendaFormacao: number;     // investimentoLiquido / vendasFormacao
  tmCac: number;                  // ticketFormacao / custoVendaFormacao
  faturamentoTotal: number;
  lucro: number;
  roi: number;                    // (lucro / investimentoBruto) * 100
  roas: number;                   // faturamentoTotal / investimentoBruto
  breakevenVendas: number;
  epc: number;                    // faturamentoTotal / cliques
}
```

### Fórmulas

```
// Investimento
investimentoBruto     = investimentoTrafego + investimentoApi

// Tráfego
cliques               = investimentoTrafego / cpc
viewPage              = cliques * (connectRate / 100)

// Checkout (2 estágios)
checkouts             = viewPage * (taxaLPVCheckout / 100)
vendas                = checkouts * (taxaCheckoutVenda / 100)
faturamentoCaptacao   = vendas * ticketMedio

// Backend
aplicacoes            = vendas * (taxaAplicacao / 100)
agendamentos          = aplicacoes * (taxaAgendamento / 100)
entrevistas           = agendamentos * (taxaEntrevista / 100)
vendasFormacao        = entrevistas * (taxaVendaFormacao / 100)
faturamentoFormacao   = vendasFormacao * ticketFormacao

// Resultado
investimentoLiquido   = investimentoBruto - faturamentoCaptacao
cpa                   = investimentoTrafego / vendas
custoVendaFormacao    = investimentoLiquido / vendasFormacao  // SEMPRE calcula (nao condicional)
tmCac                 = ticketFormacao / custoVendaFormacao
faturamentoTotal      = faturamentoCaptacao + faturamentoFormacao
lucro                 = faturamentoTotal - investimentoBruto
roi                   = (lucro / investimentoBruto) * 100
roas                  = faturamentoTotal / investimentoBruto
breakevenVendas       = ceil(investimentoBruto / (faturamentoTotal / vendas))
epc                   = faturamentoTotal / cliques
```

**Nota de arredondamento:** Usar `Math.round` em contagens (vendas, aplicações, etc.) e preservar decimais em valores monetários. Guardar contra divisão por zero em todos os KPIs.

---

## Acceptance Criteria

- [ ] AC1: Hook `useSimulador.ts` reescrito com novos `SimuladorInputs`, `SimuladorOutputs`, `DEFAULTS` e função `computeOutputs` conforme fórmulas acima.
- [ ] AC2: `SimuladorInputs.tsx` exibe 2 campos de investimento (Tráfego, API), sliders de connectRate, taxaLPVCheckout, taxaCheckoutVenda. Remover campos de upsell, downsell, custoProduto, taxaReembolso, taxaBump, precoBump.
- [ ] AC3: `SimuladorFunil.tsx` mostra o funil completo: Cliques → View Page → Checkouts → Vendas → Aplicações → Agendamentos → Entrevistas → Vendas Formação, com taxas entre cada etapa.
- [ ] AC4: `SimuladorKPIs.tsx` exibe: Investimento Bruto, Investimento Líquido, CPA, **Custo/Venda Formação (KPI principal)**, TM Formação, TM/CAC, Faturamento Total, Lucro, ROI, ROAS.
- [ ] AC5: `SimuladorView.tsx` monta também `SimuladorAlertas` (atualmente órfão) abaixo dos KPIs.
- [ ] AC6: `SimuladorReferencia.tsx` — botão "Aplicar" mapeia métricas dos Desafios históricos para o novo shape de inputs (adaptar conversão).
- [ ] AC7: Teste de calibração: ao resetar para DEFAULTS, o simulador DEVE retornar (tolerância ±1%):
  - Custo/Venda Formação: R$ 2.700
  - TM/CAC: 2,44x
  - Faturamento Total: ~R$ 208.000
  - Lucro: ~R$ 109.000
  - ROI: ~110%
  - ROAS: ~2,10x
- [ ] AC8: Componentes órfãos `SimuladorCenarios` e `SimuladorDreamGoal` — adaptar ao novo shape e deixar disponíveis (não mount ainda, mas funcional). Deletar `SimuladorBreakeven.tsx`.
- [ ] AC9: `localStorage` chave `simulador-inputs` — garantir migração graceful (se tiver inputs antigos, resetar para DEFAULTS).
- [ ] AC10: `npm run typecheck` e `npm run lint` passam sem erros.

---

## Arquivos a Modificar

| Arquivo | Ação | Prioridade |
|---------|------|-----------|
| `src/hooks/useSimulador.ts` | **Reescrever completamente** | P0 |
| `src/components/simulador/SimuladorInputs.tsx` | Reescrever (novo shape) | P0 |
| `src/components/simulador/SimuladorKPIs.tsx` | Ajustar KPIs exibidos | P0 |
| `src/components/simulador/SimuladorFunil.tsx` | Adicionar etapas LPV e Checkout | P0 |
| `src/components/simulador/SimuladorView.tsx` | Mount SimuladorAlertas | P1 |
| `src/components/simulador/SimuladorReferencia.tsx` | Adaptar mapeamento do "Aplicar" | P1 |
| `src/components/simulador/SimuladorAlertas.tsx` | Ajustar alertas ao novo modelo | P1 |
| `src/components/simulador/SimuladorCenarios.tsx` | Adaptar ao novo shape (deixar funcional) | P2 |
| `src/components/simulador/SimuladorDreamGoal.tsx` | Adaptar ao novo shape (deixar funcional) | P2 |
| `src/components/simulador/SimuladorBreakeven.tsx` | **Deletar** | P2 |

---

## Notas de Implementação

1. **Preservar estilos visuais** — não mudar a UI/UX, apenas a lógica e os campos.
2. **Preservar storage** — key `simulador-inputs` mas com migração: se o shape detectado é antigo, limpar e usar DEFAULTS.
3. **Guards contra divisão por zero** em todos os KPIs (já existia, manter).
4. **Formatação** — usar `toLocaleString('pt-BR', ...)` para moeda e percentuais.
5. **TypeScript estrito** — tipos completos, sem `any`.
6. **Teste manual** — rodar `npm run dev` e validar os 10 ACs. Anexar screenshot ou print dos KPIs finais com valores defaultados.

---

## Validação Final (Teste de Sanidade)

Com DEFAULTS seeded, o Sr. Matheus deve ver na tela:

```
Investimento Bruto:       R$ 99.000
Investimento Líquido:     R$ 75.600
Faturamento Captação:     R$ 23.652  (~R$ 23.400)
Faturamento Formação:     R$ 184.632
Faturamento Total:        R$ 208.284
Lucro:                    R$ 109.284
CPA:                      R$ 59,91
Custo/Venda Formação:     R$ 2.700  ← KPI PRINCIPAL
TM/CAC:                   2,44x
ROI:                      110,4%
ROAS:                     2,10x
```

Se bater, simulador está calibrado. Se não bater, revisar fórmulas.

---

---

## Amendment v2 — 2026-04-15

### A1. Simulador — Slider Ticket Médio
- Mudar `step` do slider de `ticketMedio` em `SimuladorInputs.tsx` de **500 para 50** (variação de R$ 50 em R$ 50).
- Validar que o min/max do slider acompanha razoavelmente (ex: min 10, max 200).

### A2. Dashboard Principal — 3 Novas Métricas

Adicionar 3 KPIs **visíveis em cada card de Desafio** (1, 2, 3, 4, 5) na Dashboard 5D:

1. **Custo por Click (Facebook)** — CPC = `investimento / cliques`
2. **Conversão Página → Checkout** — % = `(checkouts / viewPages) × 100`
3. **Conversão Checkout → Venda Ingresso** — % = `(vendas / checkouts) × 100`

**Requisitos:**
- Localizar onde os cards/tabs dos Desafios renderizam (`DesafioTabs.tsx`, `DesafioView.tsx` ou similar)
- Ler `src/types/metrics.ts` e verificar se `DesafioData` já tem os campos `viewPages` e `checkouts`. Se não tiver, **ADICIONAR** ao type e ao fetch do Google Sheets
- Se Google Sheets ainda não contém essas colunas, criar os campos no type como `number | null` e renderizar "—" quando ausente (não quebrar dashboard existente)
- Formatação: CPC em `R$ 0,00`; conversões em `0,0%`
- Estilo visual: seguir o padrão dos outros KPIs do card (mesma tipografia, cores, layout)

### AC adicionais
- [ ] AC11: Slider de `ticketMedio` com step=50
- [ ] AC12: 3 novas métricas visíveis em cada Desafio da Dashboard principal
- [ ] AC13: Se campos `viewPages`/`checkouts` não existem, adicionar ao type e fallback graceful ("—")
- [ ] AC14: `npm run type-check` e `npm run lint` passam

---

---

## Amendment v3 — 2026-04-15 — Modelo de Cortesias

### Contexto
Cada comprador de ingresso pago pode convidar outra pessoa (cortesia). O investimento em API passa a ser **derivado** do total de inscritos (pagos + cortesias), não mais input fixo.

### Regra de Negócio
```
leadsPagos         = vendas (output existente do frontend)
leadsCortesia      = leadsPagos × taxaCortesia   // default 25% = 0.25
inscritosTotais    = leadsPagos + leadsCortesia
investimentoApi    = inscritosTotais × custoPorLead   // default R$ 9
```

### Validação com exemplo do Sr. Matheus
- 2.609 leads pagos × 0,25 = 652 cortesias
- 2.609 + 652 = 3.261 inscritos totais
- 3.261 × R$ 9 = R$ 29.349 investimento API

### Mudanças de Arquitetura

**Inputs:**
- REMOVER: `investimentoApi` (não é mais input, é calculado)
- ADICIONAR: `taxaCortesia: number` — default `25` (percentual)
- ADICIONAR: `custoPorLead: number` — default `9` (R$ por lead)

**Outputs:**
- ADICIONAR: `leadsCortesia: number`
- ADICIONAR: `inscritosTotais: number`
- MANTER: `investimentoApi: number` (agora derivado, não vem de input)

**Fórmulas no `computeOutputs`:**
```
leadsCortesia     = vendas * (taxaCortesia / 100)
inscritosTotais   = vendas + leadsCortesia
investimentoApi   = inscritosTotais * custoPorLead
investimentoBruto = investimentoTrafego + investimentoApi  // continua igual
```

### UI
- `SimuladorInputs.tsx`: remover campo de `investimentoApi`. Adicionar seção ou campos para `taxaCortesia` (slider %) e `custoPorLead` (slider R$).
- `SimuladorKPIs.tsx`: exibir `Inscritos Totais` e `Leads Cortesia` como KPIs informativos, e `Investimento API` (derivado) destacado como auto-calculado.
- Mostrar no UI que `investimentoApi` é calculado automaticamente (ex: badge "auto" ou tooltip).

### AC adicionais
- [ ] AC15: `useSimulador.ts` — `taxaCortesia` e `custoPorLead` como inputs; `leadsCortesia`, `inscritosTotais` e `investimentoApi` como outputs derivados; `investimentoBruto` reflete o API calculado.
- [ ] AC16: `SimuladorInputs.tsx` remove campo `investimentoApi`, adiciona `taxaCortesia` (0-100%, step 0.5) e `custoPorLead` (R$ 0-50, step 0.5).
- [ ] AC17: `SimuladorKPIs.tsx` exibe `Inscritos Totais` e `Investimento API` (com indicação visual de "auto-calculado").
- [ ] AC18: Migração localStorage — se detectar shape antigo (com `investimentoApi` direto), resetar para DEFAULTS.
- [ ] AC19: Validação: DEFAULTS (vendas ≈ 1.314) devem produzir `investimentoApi ≈ R$ 14.782` (1.314 × 1,25 × 9).
- [ ] AC20: `type-check` e `lint` passam.

---

## File List (preenchido pelo @dev após implementação)

- [x] src/hooks/useSimulador.ts
- [x] src/components/simulador/SimuladorInputs.tsx
- [x] src/components/simulador/SimuladorKPIs.tsx
- [x] src/components/simulador/SimuladorFunil.tsx
- [x] src/components/simulador/SimuladorView.tsx
- [x] src/components/simulador/SimuladorReferencia.tsx
- [x] src/components/simulador/SimuladorAlertas.tsx (no structural change — rendering stayed, alerts from hook updated)
- [x] src/components/simulador/SimuladorCenarios.tsx
- [x] src/components/simulador/SimuladorDreamGoal.tsx
- [x] src/components/simulador/SimuladorBreakeven.tsx (DELETADO)

### Amendment v2 (2026-04-15)
- [x] src/components/simulador/SimuladorInputs.tsx (ticketMedio: step 1→50, min 1→10, max 1000→200)
- [x] src/types/metrics.ts (add `checkouts: number | null` to DesafioData)
- [x] src/lib/googleSheets.ts (graceful extraction of `checkouts` from sheet + default `null`)
- [x] src/pages/index.tsx (aggregate checkouts in `buildGeralData` — null se nenhum Desafio tiver dado)
- [x] src/components/StatCards.tsx (3 novos KPIs por Desafio: CPC FB, Conv. Página→Checkout, Conv. Checkout→Venda)

### Amendment v3 (2026-04-15) — Modelo de Cortesias
- [x] src/hooks/useSimulador.ts — `investimentoApi` removido de `SimuladorInputs`; `taxaCortesia` (25%) e `custoPorLead` (R$ 9) adicionados. `leadsCortesia`, `inscritosTotais` e `investimentoApi` agora são outputs derivados. Migração localStorage rigorosa (v3 requer `taxaCortesia` + `custoPorLead`; shape pré-v3 reseta para DEFAULTS).
- [x] src/components/simulador/SimuladorInputs.tsx — campo `investimentoApi` removido; nova seção "Cortesias" com sliders `taxaCortesia` (0-100%, step 0.5) e `custoPorLead` (R$ 0-50, step 0.5).
- [x] src/components/simulador/SimuladorKPIs.tsx — adicionado KPI "Inscritos Totais" (com breakdown pagos+cortesia) e "Investimento API" com badge visual "auto" indicando cálculo automático.
