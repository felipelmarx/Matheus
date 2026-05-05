# Discovery / Design — Métricas Orgânicas no Desafio 6

**Status**: Discovery (architect-first), não implementar ainda.
**Branch**: `claude/install-aios-core-vrulT`
**Owner**: Sr. Matheus
**Data**: 2026-05-05

## Sumário executivo

Adicionar 4 métricas orgânicas (Vendas Orgânico, CPA Total c/ orgânico, Ticket Médio Geral, Prejuízo Geral c/ orgânico) na aba **Desafio 6** e refletir agregação na aba **Geral**. Fonte: `'ABR - METRICAS GERAIS'!KH5:KN29`, **row 26 = agregado**, **coluna KI = faturamento orgânico** (confirmado pelo cliente). Demais colunas (KH/KJ/KK/KL/KM/KN) ainda não mapeadas — necessário script de inspeção rápida antes de codar.

A premissa central: **D6 é o único desafio com tracking orgânico** (pop-up novo). D1-D5 contribuem com 0 na consolidação Geral. A solução não pode quebrar nenhuma das 11 outras abas.

---

## 1. Mapeamento de colunas — proposta de extração

### 1.1. Hipótese de layout (a confirmar)

Baseado na confirmação do cliente (KI = FATURAMENTO ORGÂNICO) e no padrão recorrente da planilha (coluna A = DATA, depois métricas), a hipótese mais provável para `KH5:KN29` é:

| Col | Sheet col | Hipótese | Confiança |
|-----|-----------|----------|-----------|
| 0 | KH | DATA (dd/mm/yyyy) ou label | **HIGH** (todo range histórico tem DATA na 1ª col) |
| 1 | KI | FATURAMENTO ORGÂNICO | **CONFIRMADO** pelo cliente |
| 2 | KJ | VENDAS ORGÂNICO (qtd) | MED (par natural com faturamento) |
| 3 | KK | TICKET MÉDIO ORG. ou outro | LOW |
| 4 | KL | ? | LOW |
| 5 | KM | ? | LOW |
| 6 | KN | ? | LOW |

### 1.2. Layout do range (linhas)

| Sheet rows | Significado |
|------------|-------------|
| 5 | Header (label das colunas) |
| 6-25 | Daily breakdown (até 20 dias do D6) |
| 26 | **AGREGADO / RESULTADO** (linha usada pelos cards do D6) |
| 27-29 | Desconhecido (talvez "META", "PROJEÇÃO", "DELTA") |

### 1.3. Como o @dev deve descobrir o que tem em cada coluna

**Antes de implementar**, rodar o script de inspeção criado em `scripts/inspect-d6-organico.js`:

```bash
node scripts/inspect-d6-organico.js
```

Output esperado: dump tabular row-by-row de todo o `KH5:KN29`, destacando row 26. Com isso o @dev valida:
- Se KH é DATA ou label de seção
- O que cada uma das colunas KJ-KN realmente carrega
- Se rows 27-29 são metadata (META / PROJEÇÃO) ou ruído

**Critério de aceite do passo 1**: ter um print do output com row 26 mostrando valores numéricos plausíveis (faturamento em R$ na coluna KI). Só então prosseguir.

### 1.4. Função de extração proposta (pseudocódigo)

```ts
// src/lib/googleSheets.ts (nova função, padrão de extractDesafio6Daily)
function extractDesafio6Organico(rows: string[][]): Desafio6OrganicoData {
  const p = parseSheetNumber;
  // rows é o resultado de KH5:KN29 -> índice 0 = sheet row 5 (header)
  // sheet row 26 = índice 21 (26 - 5)
  const aggregateRow = rows[21] ?? [];

  return {
    // Confirmados
    faturamentoOrganico: p(aggregateRow[1]),      // KI
    // Hipóteses (ajustar após inspeção)
    vendasOrganico:      p(aggregateRow[2]),      // KJ (provável)
    // Daily breakdown opcional (para timeline futura)
    daily: rows.slice(1, 21)                      // sheet rows 6-25
      .filter((r) => /\d{2}\/\d{2}\/\d{4}/.test((r[0] ?? '').trim()))
      .map((r) => ({
        data: r[0],
        faturamentoOrganico: p(r[1]),
        vendasOrganico: p(r[2]),
      })),
  };
}
```

**Importante**: range com hífen e espaço `'ABR - METRICAS GERAIS'` exige single-quotes no Sheets API — já é o padrão usado em todas as outras chamadas do arquivo (linhas 680, 688, 697, 708, 717, 729, 731). Mantém consistência.

---

## 2. Design de tipos — RECOMENDAÇÃO: estender `DesafioData` com campos opcionais

### 2.1. Decisão

**Estender `DesafioData`** com 2 campos opcionais (`vendasOrganico?: number`, `faturamentoOrganico?: number`), em vez de criar tipo paralelo.

### 2.2. Justificativa (trade-off A vs B)

| Critério | A: Campos opcionais em `DesafioData` | B: Tipo paralelo `DesafioOrganico` |
|----------|--------------------------------------|------------------------------------|
| Retro-compat D1-D5 | OK (campos undefined caem em fallback `?? 0`) | OK |
| Consolidação Geral | TRIVIAL: `sum(d => d.vendasOrganico ?? 0)` no `buildGeralData` existente | Requer 2º loop ou merge manual |
| Renderização condicional | StatCards lê `data.vendasOrganico ?? 0`; cards orgânicos só mostram se valor > 0 | Componente precisa receber 2 props (`data` + `organico`) |
| Calculations derivados (CPA c/ org, ticket geral) | Computados em ponto único, leitura natural | Requer cruzar 2 objetos |
| Risco de regressão | BAIXO (campos novos, opcionais) | MED (acopla novo tipo na chain de props) |
| Custo de migração | ~5 linhas no type, ~10 no extractor | ~50 linhas (novo tipo + chain) |

**Vencedor**: A. O campo opcional preserva a interface existente (D1-D5 não precisam saber que orgânico existe), e a consolidação Geral fica trivial usando o helper `sum()` que já existe em `index.tsx:26`.

### 2.3. Mudanças propostas em `src/types/metrics.ts`

```ts
export interface DesafioData {
  // ... campos existentes inalterados ...

  // Orgânico (apenas D6 popula; D1-D5 ficam undefined/0)
  vendasOrganico?: number;
  faturamentoOrganico?: number;
}
```

**Não criar** novo tipo `DesafioOrganico` — campos opcionais são suficientes e simétricos com o pattern já adotado para `checkouts: number | null` (linha 21).

---

## 3. Design de cálculos derivados — RECOMENDAÇÃO: server-side em `metricsCalculator.ts`

### 3.1. Métricas derivadas

| Métrica | Fórmula | Exibida em |
|---------|---------|------------|
| `vendasTotalGeral` | `vendas + (vendasOrganico ?? 0)` | D6, Geral |
| `cpaTotalComOrganico` | `vendas + vendasOrg > 0 ? investimento / (vendas + vendasOrg) : 0` | D6, Geral |
| `faturamentoGeralComOrganico` | `faturamento + (faturamentoOrganico ?? 0)` | D6, Geral |
| `ticketMedioGeral` | `vendasTotal > 0 ? faturamentoGeral / vendasTotal : 0` | D6, Geral |
| `prejuizoGeralComOrganico` | `faturamentoGeral - investimento` | D6, Geral |

### 3.2. Decisão: onde calcular?

**Server-side**, num helper exportado por `src/lib/metricsCalculator.ts` chamado `computeOrganicoDerivatives(data: DesafioData)`. Não persistir no payload — calcular sob demanda no componente que precisa (StatCards do D6 e do Geral).

### 3.3. Justificativa

| Opção | Prós | Contras |
|-------|------|---------|
| **A. Em `metricsCalculator.ts` (server, helper sob demanda)** ✅ | Reutilizável; testável isoladamente; lógica fora do JSX | Componente importa helper |
| B. Persistir no payload (campos `cpaTotal` etc.) | Cliente recebe pronto | Inflate `DesafioData` com 5 campos derivados; payload cresce; semantic confusion entre "lido da planilha" vs "calculado" |
| C. Dentro do componente | Zero overhead de import | Lógica espalhada; difícil testar |

**Vencedor**: A — helper puro, fácil de testar, sem inflar tipos. Mantém `DesafioData` como "espelho da planilha + 2 campos orgânicos brutos", e tudo derivado fica fora do tipo.

### 3.4. ATENÇÃO ao campo `lucroPrejuizo` (semântica DUAL detectada)

**Achado crítico durante o discovery**:

- Em `extractDesafioData` (`googleSheets.ts:73`): `lucroPrejuizo` carrega o valor da linha **"Investimento Líquido"** da planilha (positivo). É um custo, não um lucro.
- Em `buildGeralData` (`index.tsx:71`): `lucroPrejuizo: fat - inv` — aqui é prejuízo real (negativo se investimento > faturamento).
- Em `StatCards.tsx:48`: o card "INVESTIMENTO LIQUIDO" mostra `data.lucroPrejuizo` — só funciona porque na planilha o valor é positivo (investimento líquido).

**Implicação para esta story**: NÃO mexer em `lucroPrejuizo`. Adicionar um NOVO campo derivado `prejuizoGeralComOrganico` calculado como `(faturamento + faturamentoOrganico) - investimento`. Documentar a divergência para futura limpeza (story separada).

---

## 4. Impacto na consolidação "Geral" — `buildGeralData`

### 4.1. Mudanças mínimas em `src/pages/index.tsx`

Adicionar 2 linhas no `buildGeralData` (~linha 26-32):

```ts
const vendasOrganico = sum(d => d.vendasOrganico ?? 0);
const faturamentoOrganico = sum(d => d.faturamentoOrganico ?? 0);
```

E incluir no return:

```ts
return {
  // ... existing ...
  vendasOrganico,
  faturamentoOrganico,
};
```

### 4.2. Por que server-side OU client-side aqui?

`buildGeralData` está hoje no **client** (`index.tsx`), e é onde toda a consolidação "Geral" acontece (somando D1..D6). É a fronteira natural — manter ali. **Não** criar consolidação server-side em `googleSheets.ts:849` (a `geralData` ali vem direto da aba `RESUMO - GERAL!C:D`, que é uma fonte de verdade própria — não soma de D1-D6).

⚠️ **Edge case**: hoje `data.geral` vem da aba `RESUMO - GERAL` (col C/D = "TOTAL"), enquanto `buildGeralData(mode='total')` recalcula somando D1..D6 no cliente. Os dois coexistem (provavelmente para meta1/meta2). Como o cliente quer ver orgânico no Geral, e a fonte `RESUMO - GERAL` provavelmente NÃO tem coluna de orgânico ainda, a fonte da verdade do orgânico no Geral DEVE ser `buildGeralData` (client-side, somando dos desafios). Validar com o cliente se a divergência entre `data.geral` e `buildGeralData(...)` é intencional.

---

## 5. Impacto em `StatCards.tsx`

### 5.1. Decisão: nova `CardGrid` "ORGÂNICO" condicional

Adicionar uma 3ª `CardGrid` exibida **só quando `(data.vendasOrganico ?? 0) > 0 || (data.faturamentoOrganico ?? 0) > 0`**. Isso garante:
- D1-D5: nada muda (campos undefined → grid não renderiza)
- D6: 4 cards orgânicos aparecem
- Geral: 4 cards orgânicos aparecem (porque a soma de D6 ≠ 0)

### 5.2. Layout proposto (4 cards, grid de 4 colunas)

```
[CardGrid captacao - 5 cols]    (existente, inalterado)
[CardGrid formacao  - 4 cols]   (existente, inalterado)
[CardGrid organico  - 4 cols]   <== NOVA, condicional
```

Cards orgânicos:

| # | Label | Valor | Cor sugerida |
|---|-------|-------|--------------|
| 1 | VENDAS ORGANICO | `data.vendasOrganico ?? 0` (number) | green-500 (positivo, "free") |
| 2 | FATURAMENTO ORGANICO | `BRL.format(data.faturamentoOrganico ?? 0)` | emerald-500 |
| 3 | CPA TOTAL (C/ ORG.) | `BRL.format(cpaTotalComOrg)` | cyan-500 |
| 4 | TICKET MEDIO GERAL | `BRL.format(ticketMedioGeral)` | purple-500 |

### 5.3. Onde mostrar "Prejuízo Geral c/ orgânico"?

O 4º item da lista do cliente ("Prejuízo Geral incluindo orgânico") **não cabe naturalmente** nos 4 cards acima (que cobrem 3 das 4 métricas pedidas). Opções:
- (a) **Substituir** "TICKET MEDIO GERAL" por "PREJUIZO GERAL C/ ORG." — mas perde ticket
- (b) **5 cards** na grid de orgânico (igual aos 5 da captacao)
- (c) **Atualizar** o card existente "INVESTIMENTO LIQUIDO" no `captacaoCards` para refletir o cálculo c/ orgânico **só quando `faturamentoOrganico > 0`**

**Recomendação**: opção (b) — 5 cards na grid orgânico:

| # | Label | Valor |
|---|-------|-------|
| 1 | VENDAS ORGANICO | qtd |
| 2 | FATURAMENTO ORGANICO | R$ |
| 3 | CPA TOTAL C/ ORG. | R$ |
| 4 | TICKET MEDIO GERAL | R$ |
| 5 | LUCRO/PREJUIZO C/ ORG. | R$ (verde se positivo, vermelho se negativo) |

Mantém os cards existentes intactos (D1-D5 não quebram) e agrupa os derivados num bloco coeso.

### 5.4. Anti-quebra das outras abas

A grid orgânico só renderiza se houver dados (`vendasOrganico > 0 || faturamentoOrganico > 0`). D1-D5 nunca terão esses campos populados → grid não aparece → layout idêntico ao atual. **Risco de regressão visual: zero.**

---

## 6. Riscos & edge cases

| # | Risco | Mitigação |
|---|-------|-----------|
| R1 | Row 26 vazia (D6 ainda em captação, sem orgânico fechado) | `parseSheetNumber('')` já retorna 0; cards condicionais não renderizam → comportamento esperado |
| R2 | `vendasOrganico = 0` causa divisão por zero em CPA total | Guard `vendas + vendasOrg > 0 ? inv / (vendas + vendasOrg) : 0` (mesmo padrão de `buildGeralData:68`) |
| R3 | Coluna real de vendas_org não está em KH:KN | Script de inspeção (passo 1) é PRÉ-REQUISITO. Se nenhuma coluna do range tiver "vendas qtd", abrir story de extensão com cliente para ampliar range |
| R4 | Cache TTL 12h atrasa reflexo de novos lançamentos orgânicos | Cliente já tem botão "Atualizar" em `index.tsx:150` que força `refresh=true`. Documentar no AC |
| R5 | `RESUMO - GERAL` (col C/D = TOTAL) não tem orgânico → divergência entre `data.geral` e `buildGeralData('total')` | Já existe; aba "Geral" usa `buildGeralData(data, 'total')` (linha 120), portanto orgânico aparece. `data.geral` continua sem orgânico (consistente com a fonte) |
| R6 | Range usa `'ABR - METRICAS GERAIS'` (com hífen e espaços) — single quotes obrigatórias | Padrão já adotado em 6 outras chamadas no arquivo. Não inventar |
| R7 | Header da row 5 (índice 0) não bate com hipótese | Inspeção (passo 1) detecta. Ajustar índices antes de mergear |
| R8 | Cliente alterar ordem de colunas no Sheets | Padrão no projeto: extração por **posição**, não por header. Se cliente mover, breakage silencioso. Mitigar com console.log debug (`console.log(\`[sheets] d6-organico: fat=${...} vendas=${...}\`)`) — padrão dos outros extractors |

---

## 7. Lista exata de arquivos a modificar

Em ordem de execução (para o @dev seguir cegamente após inspeção):

1. **`scripts/inspect-d6-organico.js`** (já criado) → rodar primeiro, validar layout
2. **`src/types/metrics.ts:10-55`** (`DesafioData`) → adicionar 2 campos opcionais:
   - `vendasOrganico?: number;`
   - `faturamentoOrganico?: number;`
3. **`src/lib/googleSheets.ts`** (~linha 475, após `extractDesafio6Daily`) → adicionar função `extractDesafio6Organico(rows)`
4. **`src/lib/googleSheets.ts:706-712`** (bloco de fetch do D6 daily) → adicionar fetch paralelo do range `KH5:KN29` (mesmo pattern não-bloqueante)
5. **`src/lib/googleSheets.ts:877-881`** (loop `DESAFIO_COLS`) → após o loop, fazer merge dos campos orgânicos em `data.desafio6`:
   ```ts
   const d6Org = extractDesafio6Organico(d6OrganicoRows);
   data.desafio6.vendasOrganico = d6Org.vendasOrganico;
   data.desafio6.faturamentoOrganico = d6Org.faturamentoOrganico;
   ```
6. **`src/lib/googleSheets.ts:120-132`** (`getDefaultDesafio`) → não precisa alterar (campos opcionais ficam undefined; OK)
7. **`src/lib/metricsCalculator.ts`** (final do arquivo) → adicionar export `computeOrganicoDerivatives(data: DesafioData)`:
   ```ts
   export function computeOrganicoDerivatives(d: DesafioData) {
     const vOrg = d.vendasOrganico ?? 0;
     const fOrg = d.faturamentoOrganico ?? 0;
     const vendasTotal = d.vendas + vOrg;
     const fatGeral = d.faturamento + fOrg;
     return {
       vendasOrganico: vOrg,
       faturamentoOrganico: fOrg,
       vendasTotal,
       faturamentoGeral: fatGeral,
       cpaTotalComOrganico: vendasTotal > 0 ? d.investimento / vendasTotal : 0,
       ticketMedioGeral: vendasTotal > 0 ? fatGeral / vendasTotal : 0,
       prejuizoGeralComOrganico: fatGeral - d.investimento,
     };
   }
   ```
8. **`src/pages/index.tsx:26-32`** (`buildGeralData`) → adicionar 2 linhas de soma e incluir no return
9. **`src/components/StatCards.tsx`** → adicionar `import { computeOrganicoDerivatives }`, montar 5º `organicoCards: CardData[]` condicionalmente, e renderizar `<CardGrid cards={organicoCards} cols={5} />` quando `(data.vendasOrganico ?? 0) > 0 || (data.faturamentoOrganico ?? 0) > 0`

**Total**: 4 arquivos modificados + 1 script novo. Diff esperado: ~80 linhas adicionadas, 0 removidas.

---

## 8. Critérios de aceite (input para @sm criar story)

**Funcionais**:

1. **AC-1**: Ao abrir a aba "Desafio 6", uma nova grid de 5 cards orgânicos aparece após os cards de Captação e Formação, exibindo: Vendas Orgânico, Faturamento Orgânico, CPA Total c/ Orgânico, Ticket Médio Geral, Lucro/Prejuízo c/ Orgânico.
2. **AC-2**: Ao abrir as abas "Desafio 1" a "Desafio 5", a grid orgânica **não aparece** (campos undefined → grid condicionalmente oculta). Layout dos cards existentes idêntico ao atual.
3. **AC-3**: Ao abrir a aba "Geral", a grid orgânica aparece com valores agregados (= valores do D6, pois D1-D5 contribuem com 0).
4. **AC-4**: O valor de "FATURAMENTO ORGÂNICO" lido da row 26 da coluna KI bate exatamente com o valor mostrado na planilha (validar com print).
5. **AC-5**: `CPA Total c/ Orgânico = investimento / (vendas + vendasOrganico)`. Quando ambas vendas zerarem, exibe `R$ 0,00` (sem NaN/Infinity).
6. **AC-6**: `Ticket Médio Geral = (faturamento + faturamentoOrganico) / (vendas + vendasOrganico)`. Mesma proteção antidivisão por zero.
7. **AC-7**: `Prejuízo c/ Orgânico = (faturamento + faturamentoOrganico) - investimento`. Card destaca em verde se positivo (lucro), vermelho se negativo (prejuízo).

**Não-funcionais / técnicos**:

8. **AC-8**: Falha no fetch de `KH5:KN29` é não-bloqueante (warn no console, demais dados do dashboard carregam normalmente). Padrão idêntico a `desafio6Daily` fetch.
9. **AC-9**: Cliente roda `node scripts/inspect-d6-organico.js` e o output mostra row 26 com valores numéricos plausíveis ANTES da implementação ser mergeada.
10. **AC-10**: Console mostra log `[sheets] desafio6 organico: fat=X vendas=Y` para auditoria.

**Quality gates**:

11. **AC-11**: `npm run type-check` passa sem novos erros.
12. **AC-12**: `npm run build` passa sem novos warnings de tipo.
13. **AC-13**: Nenhuma regressão visual nas abas D1-D5, Comparar, Análises, Simulador, Guia, Orgânico (este último é a aba existente de fontes, NÃO confundir).

---

## Anexo A — Distinção crítica: 2 conceitos diferentes de "orgânico"

| Conceito | Tipo | Range | Granularidade | Aba que usa |
|----------|------|-------|---------------|-------------|
| **Orgânico por fonte** (existente) | `OrganicoFontes` | `KV3:LF30` | Por fonte (Edson, Stories, Bio, etc) — soma de **vendas geradas organicamente** ao longo do tempo total | Aba "Orgânico" |
| **Orgânico do D6** (NOVO, esta story) | 2 campos opcionais em `DesafioData` | `KH5:KN29` | Por desafio (apenas D6 atualmente) — agregado de vendas + faturamento orgânico do período do desafio 6 | Abas "Desafio 6" e "Geral" |

São fontes e propósitos distintos. **Não fundir.** O `OrganicoFontes` existente continua intocado.

---

## Anexo B — Pseudocódigo completo do extractor

```ts
// src/lib/googleSheets.ts (após linha 475)

// Extract D6 organico aggregate from 'ABR - METRICAS GERAIS'!KH5:KN29
// Row 26 (sheet) = aggregate row used by D6 cards.
// rows[0] = header (sheet row 5); rows[21] = aggregate (sheet row 26).
// Confirmed: col KI (idx 1) = faturamento organico.
// Hypothesized: col KJ (idx 2) = vendas organico (validate via inspect script).
function extractDesafio6Organico(rows: string[][]): {
  vendasOrganico: number;
  faturamentoOrganico: number;
} {
  const p = parseSheetNumber;
  const aggregate = rows[21] ?? [];
  return {
    faturamentoOrganico: p(aggregate[1]),  // KI (confirmed)
    vendasOrganico:      p(aggregate[2]),  // KJ (hypothesis - confirm via inspection)
  };
}
```

---

## Decisões pendentes para o cliente / @sm

1. **AUTO-DECISION**: 5 cards (não 4) na grid orgânica — para acomodar todas as métricas pedidas sem sacrificar nenhuma. Razão: cliente listou 4 métricas, mas "Ticket Médio Geral" + "Prejuízo Geral c/ orgânico" são distintos e ambos úteis.
2. **AUTO-DECISION**: campos opcionais (`?`) em `DesafioData` em vez de tipo paralelo. Razão: zero impacto em D1-D5, soma trivial em `buildGeralData`.
3. **AUTO-DECISION**: cálculos derivados via helper sob demanda em `metricsCalculator.ts`, não persistidos no payload. Razão: `DesafioData` espelha a planilha; derivados ficam fora do tipo.
4. **PENDENTE**: confirmar com cliente se as colunas KJ-KN além de KI carregam dados úteis ou se o range deveria ser apenas `KH5:KI29`. Solução: rodar script de inspeção e perguntar.
5. **PENDENTE — DEBT**: semântica dual de `lucroPrejuizo` (extractor = "investimento líquido" positivo; consolidação = lucro real). Não bloqueia esta story, mas merece story separada de cleanup.
