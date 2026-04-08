# Framework de Criacao de Anuncios em Imagem — Desafio 5D

## Identidade Visual

```
PALETA OFICIAL (extraida da LP Desafio 5D)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verde escuro:     #16a34a  — CTAs, destaques principais
Verde claro:      #22c55e  — Gradientes, acentos
Fundo principal:  #0b0f11  — Background
Fundo cards:      #131a1f  — Elementos secundarios
Texto principal:  #e7eef5  — Headlines, corpo
Texto secundario: #93a1af  — Subtitulos, labels
Borda/divisor:    #22303a  — Separadores
Vermelho alerta:  #ef4444  — Urgencia, escassez

GRADIENTE PADRAO: linear-gradient(180deg, #16a34a → #22c55e)
FONTE: System UI / Segoe UI / Roboto (bold para headlines)
FORMATO: Feed 1080x1080
```

---

## As 5 Etapas

### ETAPA 1 — BRIEFING (antes de abrir o Photoshop)

Responda essas 4 perguntas antes de comecar:

| # | Pergunta | Exemplo |
|---|----------|---------|
| 1 | Qual o OBJETIVO do ad? | Clique para LP / Cadastro / Awareness |
| 2 | Para QUAL perfil do ICP? | Estressado / Ansioso / Curioso sobre respiracao |
| 3 | Qual o ANGULO de ataque? | Dor / Desejo / Prova social / Curiosidade |
| 4 | Qual o HOOK principal? | Frase que para o scroll |

**Regra**: Sem briefing claro = ad generico = dinheiro jogado fora.

---

### ETAPA 2 — COPY (texto do ad)

Montar os 3 blocos de texto ANTES de desenhar:

```
┌─────────────────────────────────────────────────────┐
│  HEADLINE (hook)                                     │
│  Funcao: parar o scroll                              │
│  Regras:                                             │
│  - Max 7 palavras                                    │
│  - Fala da DOR ou do DESEJO, nunca do produto        │
│  - Fonte grande, bold, cor #e7eef5 ou #22c55e        │
│  - Posicao: terco superior da imagem                 │
├─────────────────────────────────────────────────────┤
│  SUB-HEADLINE (contexto)                             │
│  Funcao: dar razao para continuar lendo              │
│  Regras:                                             │
│  - Max 12 palavras                                   │
│  - Complementa o hook com dado ou promessa           │
│  - Fonte menor, cor #93a1af ou #e7eef5               │
│  - Posicao: abaixo do headline                       │
├─────────────────────────────────────────────────────┤
│  CTA (chamada para acao)                             │
│  Funcao: dizer o que fazer                           │
│  Regras:                                             │
│  - Max 4 palavras ("Quero participar", "Saiba mais") │
│  - Botao com fundo verde gradiente (#16a34a→#22c55e) │
│  - Texto do botao: #ffffff, bold                     │
│  - Posicao: terco inferior da imagem                 │
└─────────────────────────────────────────────────────┘
```

**Banco de angulos para Desafio 5D:**

| Angulo | Exemplo de headline |
|--------|-------------------|
| Dor | "Voce respira errado a vida inteira" |
| Desejo | "5 dias para dominar sua respiracao" |
| Curiosidade | "O exercicio que CEOs fazem antes de decidir" |
| Prova social | "12.847 pessoas ja fizeram esse desafio" |
| Urgencia | "Ultimas vagas — comeca segunda" |
| Contraste | "3 minutos por dia. Resultado que terapia nao deu em anos" |

---

### ETAPA 3 — LAYOUT (composicao no Photoshop)

**Estrutura padrao do ad 1080x1080:**

```
┌──────────────────────────────┐
│                              │
│  ▌HEADLINE (hook)            │  ← Terco superior
│  ▌Sub-headline               │
│                              │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│                              │
│     [ELEMENTO VISUAL]        │  ← Centro
│     Foto / Icone / Grafico   │
│                              │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│                              │
│     [ BOTAO CTA ]            │  ← Terco inferior
│     Logo ou badge opcional   │
│                              │
└──────────────────────────────┘
```

**Regras de composicao:**

| Regra | Detalhe |
|-------|---------|
| Hierarquia | Headline > Visual > CTA (olho segue essa ordem) |
| Respiro | Minimo 80px de margem nas bordas |
| Contraste | Texto claro (#e7eef5) sobre fundo dark (#0b0f11) |
| Foco | 1 elemento visual central, nunca 3+ elementos competindo |
| Legibilidade | Se nao da pra ler no celular em 3 segundos, simplificar |

**Tipos de elemento visual central:**

| Tipo | Quando usar |
|------|------------|
| Foto do Felipe Marx | Prova de autoridade, conexao pessoal |
| Pessoa respirando | Associacao direta com o produto |
| Icone/grafico abstrato | Conceito (stress, energia, foco) |
| Numero grande | Prova social ("12.847+"), dado impactante |
| Sem visual (so texto) | Quando o hook e forte o suficiente sozinho |

---

### ETAPA 4 — CORES (aplicacao no Photoshop)

**Mapa de aplicacao:**

```
┌──────────────────────────────┐
│  Fundo: #0b0f11 (solido)     │
│  ou gradiente sutil para     │
│  #131a1f nas bordas          │
│                              │
│  Headline: #e7eef5 (branco)  │
│  OU #22c55e (verde) se for   │
│  palavra-chave de destaque   │
│                              │
│  Sub: #93a1af (cinza claro)  │
│                              │
│  Botao CTA:                  │
│  ┌────────────────────┐      │
│  │ bg: #16a34a→#22c55e│      │
│  │ texto: #ffffff     │      │
│  │ radius: 14px       │      │
│  │ shadow: 0 8px 24px │      │
│  │ rgba(0,0,0,0.35)   │      │
│  └────────────────────┘      │
│                              │
│  Destaque urgencia: #ef4444  │
│  (usar com moderacao)        │
│                              │
│  Linha/borda: #22303a        │
│  (separadores sutis)         │
└──────────────────────────────┘
```

**Regras de cor:**

| Regra | Motivo |
|-------|--------|
| Verde so em CTA e destaques | Se tudo for verde, nada destaca |
| Vermelho so para urgencia | "Ultimas vagas", "Encerra hoje" |
| Fundo SEMPRE dark | Identidade da marca, contraste alto |
| Max 3 cores por ad | Dark + branco + verde. Simples |
| Palavra-chave em verde | Destacar 1-2 palavras no headline |

---

### ETAPA 5 — VARIACOES PARA TESTE

Para cada rodada de teste, criar minimo 3 variacoes:

```
VARIACAO A — Trocar HOOK (mesmo layout)
VARIACAO B — Trocar ANGULO (dor → desejo)
VARIACAO C — Trocar ELEMENTO VISUAL (foto → texto puro)
```

**Matriz de teste:**

| Variavel | O que muda | O que NAO muda |
|----------|-----------|---------------|
| Hook | Headline diferente | Layout, cores, CTA |
| Angulo | Dor vs Desejo vs Curiosidade | Layout, cores |
| Visual | Foto vs Icone vs Texto puro | Copy, cores |
| CTA | Texto do botao | Layout, copy, cores |

**Regra de ouro**: testar 1 variavel por vez. Se mudar tudo, nao sabe o que funcionou.

---

## Checklist Final (antes de subir)

```
[ ] Briefing preenchido (objetivo, ICP, angulo, hook)
[ ] Headline com max 7 palavras, legivel no celular
[ ] Sub-headline complementa sem repetir
[ ] CTA com botao verde, texto claro
[ ] Fundo dark, max 3 cores no ad
[ ] Elemento visual centralizado com respiro
[ ] Margens minimo 80px
[ ] Testou legibilidade: zoom 50% no Photoshop (simula celular)
[ ] Nomeacao do arquivo: D5D_[angulo]_[variacao]_[data]
[ ] Minimo 3 variacoes por rodada de teste
```

---

## Nomeacao de Arquivos

```
Padrao: D5D_[angulo]_[variacao]_[data].psd

Exemplos:
D5D_dor_hookA_20mar.psd
D5D_desejo_hookB_20mar.psd
D5D_curiosidade_textopuro_20mar.psd
```

---

*Framework criado por J.A.R.V.I.S. — 20/03/2026*
*Paleta extraida de: lp.felipemarx.com.br/imersao-desafio-breathwork*
