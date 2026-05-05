# QA Gate — D6 Organico

**Data:** 2026-05-05
**Verdict:** PASS
**Commit:** e14874a (branch `claude/install-aios-core-vrulT`, NOT pushed)
**QA Agent:** Quinn (Guardian)

## Checks

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Build production | PASS | `npm run build` Compiled successfully, 3 static pages generated, no errors. Bundle: `/` 29.9 kB / 110 kB First Load JS |
| 2 | Type-check + lint | PASS | `tsc --noEmit` clean (no output), `next lint` "No ESLint warnings or errors" |
| 3 | API endpoint runtime | PASS | `GET /api/metrics` HTTP 200. `desafio6.vendasOrganico=217` (expected 217), `cpaTotalComOrganico=63` (~R$ 63), `ticketMedioGeral=20` (~R$ 20), `prejuizoGeralComOrganico=-52697` (-R$ 52.697 com sinal preservado), `faturamentoOrganico=0` (esperado: zerado até lançamento fechar) |
| 4 | Geral.total propaga | PASS (simulated) | `data.geral` no payload da API NÃO contém os campos organicos por design — `buildGeralData()` é função client-side em `src/pages/index.tsx:19-105` que compõe o objeto Geral em runtime de render. Simulação verificou: com mode='total', `includesD6=true` → vendasOrganico=217, cpa=63, ticket=20, prejuizo=-52697 (cópia direta de D6) |
| 5 | D1-D5 sem campos | PASS | Verificado no JSON da API: `desafio1.vendasOrganico` até `desafio5.vendasOrganico` = `undefined` (todos os 5). Campos `?` opcionais no type funcionando |
| 6 | Code review estático | PASS | `googleSheets.ts:746-763` — 2 fetches (KH5:KN29 e IM5:IM29) ambos em try/catch com `console.warn` non-blocking. Linha 933-952 — enrichment do D6 também em try/catch. `StatCards.tsx:116-117` — guard `(vendasOrganico ?? 0) > 0 \|\| (faturamentoOrganico ?? 0) > 0` impede render quando fechado/vazio. Cards usam `BRL.format()` para money e `.toLocaleString('pt-BR')` para vendas (217). Prejuízo card lê `prejuizoGeralComOrganico` direto (sinal preservado), ícone TrendingDown+red quando <0 |
| 7 | Cleanup | DONE | Dev server background process será encerrado abaixo |

## Issues encontradas

**Nenhuma blocker.** Observações informativas:

1. **Discrepância na spec do QA**: A spec previa que `geral.vendasOrganico === 217` viria do payload da API. Na arquitetura real, `geral` server-side é construído de `RESUMO - GERAL` (sem campos organicos) e o objeto Geral final é montado client-side por `buildGeralData()` em `src/pages/index.tsx`. A propagação organica foi verificada por simulação determinística — funciona corretamente. Recomendação: validação visual no browser (já planejada pelo Jarvis com Playwright).

2. **`faturamentoOrganico=0` por enquanto**: Conforme spec ("vai preencher quando lançamento fechar"). O guard em `StatCards.tsx:116` usa OR — enquanto `vendasOrganico=217 > 0`, a 3ª grid renderiza. Comportamento correto para o estado atual.

3. **Sinal do prejuízo**: Confirmado que vem negativo da planilha (`-52697`) e o card preserva via `BRL.format()` → "-R$ 52.697,00", com ícone vermelho TrendingDown. Não há somatório de `Math.abs` indevido.

## Recomendação para @devops

**PASS → push autorizado.**

Pré-requisitos satisfeitos:
- Build production limpa
- Type-check e lint zero warnings
- API runtime retornando os 6 valores esperados de D6 com precisão
- Propagação Geral validada (simulação determinística)
- D1-D5 isolados (campos opcionais funcionam)
- Try/catch em todos os 3 pontos de fetch novos (não-bloqueantes — falha de planilha não derruba o dashboard)
- Code review estático limpo (formatação BRL, guard de render, sinal preservado)

Validação visual em browser real (Playwright) recomendada pelo Jarvis pós-merge — fora do escopo deste gate (QA não roda browser; orchestrator faz).

---

## Iteration 2 (final) — 2026-05-05

**Verdict:** PASS
**Commits adicionais (locais, não empurrados):**
- `492f009` — fix: removido prejuízo de Geral, label renomeado, cards condicionais
- `01a30d3` — fix: somar dailies KI para faturamentoOrganico (KI29 vazio na planilha)
- `e1259ca` — refactor: mover cards orgânicos para seção Tráfego (ResumoGeral) + remover 3a CardGrid

### Checks executados

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Build production | PASS | `npm run build` Compiled successfully. 3 static pages, route `/` 29.8 kB / 110 kB First Load JS, sem warnings/errors |
| 2 | Type-check + lint | PASS | `tsc --noEmit` clean. `next lint` "No ESLint warnings or errors" |
| 3 | Runtime API | PASS | `GET /api/metrics` HTTP 200. `d6.vendasOrganico=218`, `d6.faturamento=19004.8`, `d6.faturamentoOrganico=5171` (sum dailies KI), `d6.cpaTotalComOrganico=63`, `d6.ticketMedioGeral=20`, `d6.prejuizoGeralComOrganico=-52671`. `geral.vendasOrganico=undefined` e `geral.prejuizoGeralComOrganico=undefined` server-side (esperado — preenchido client-side por `buildGeralData`). `desafio1..5.vendasOrganico=undefined` (esperado) |
| 4 | Code review estático | PASS | `StatCards.tsx` agora tem 2 grids apenas (captacao=5 cols + formacao=4 cols). FATURAMENTO CAPTACAO usa `data.faturamento + (data.faturamentoOrganico ?? 0)` (linha 77). `TrendingDown` removido dos imports (linha 1: apenas DollarSign, ShoppingCart, TrendingUp, Target, Ticket, Receipt). `ResumoGeral.tsx:139-163` — 4 conditional spreads na seção Tráfego, posicionados após Vendas/CPA/Ticket Médio/Lucro-Prejuízo. `googleSheets.ts:482-506` — `extractDesafio6OrganicoFromKHKN` agora soma dailies KI (loop 0..23 sobre `rows[i]?.[1]`) em vez de ler `aggregate[1]` (KI29 vazio). `index.tsx:19-105` — `buildGeralData` copia 6 campos (vendasOrganico, faturamentoOrganico, cpaTotalComOrganico, ticketMedioGeral, faturamentoTotalGeral, investimentoCaptacaoGeral) e omite `prejuizoGeralComOrganico` por design (linhas 65-66 + 102 com comentário). `metrics.ts:57-61` — 5 campos opcionais ainda definidos em DesafioData |
| 5 | Regressão D1-D5 | PASS | D1: fat=14477.8 / inv=38102.58 / cpa=52.98. D2: fat=28461.4 / inv=81706.76 / cpa=47.95. D3: fat=32331 / inv=100129.5 / cpa=45.23. D4: fat=23028 / inv=87534.14 / cpa=44.83. D5: fat=23858.3 / inv=100597.03 / cpa=56.78. Todos sane, sem NaN, sem zerados. Nenhum campo orgânico vazado em D1-D5 |
| 6 | Cleanup | DONE | Dev server PID 19952 mantido vivo conforme instruído. Sem `git push` |

### Observações sobre os 3 commits adicionais

**`492f009`** — Conditional rendering implementado corretamente: ausência do campo em D1-D5 e em meta1/meta2 não-renderiza o item da grid (verificado em `ResumoGeral.tsx:139-163` via `...(data.X !== undefined ? [...] : [])`). Label "Prejuízo Captação Tráfego c/ Org" descritivo e correto.

**`01a30d3`** — Bug fix sólido. KI29 (cell de agregado) vazio na planilha, somatório dos dailies entrega R$ 5.171 — valor consistente com a janela de 23 dias (rows 1..23). Loop usa `parseSheetNumber` (`p`) que tolera strings vazias.

**`e1259ca`** — Refactor reduz superfície visual: a 3ª CardGrid (orgânica isolada) sumiu, métricas migraram para o agrupamento já familiar de Tráfego no `ResumoGeral`. UX mais coerente. `StatCards` ficou enxuto (2 grids), 3 campos órfãos foram corretamente reposicionados.

### Recomendação ao @devops

**APROVADO para push.** Pré-requisitos satisfeitos:
- Build production limpa
- Type-check e lint zero warnings
- Runtime API retornando os 6 valores esperados de D6 com precisão (vendas=218, fat=19.004,80, fatOrg=5.171, cpa=63, ticket=20, prejuízo=-52.671)
- D1-D5 não regrediram, campos orgânicos isolados em D6
- Conditional rendering correto em meta1/meta2 (sem D6 → sem cards orgânicos)
- `prejuizoGeralComOrganico` corretamente omitido da Geral (apenas D6 mostra)
- Code review estático: imports limpos, sem código morto, comentários explicam decisões

Branch `claude/install-aios-core-vrulT` com 4 commits prontos para push (`e14874a`, `492f009`, `01a30d3`, `e1259ca`).

---
*QA Gate executado por Quinn (Guardian) em modo YOLO. Scope: leitura + execução, sem mutações de código.*
