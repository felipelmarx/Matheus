# Dashboard Desafio 5D

Dashboard de métricas para o projeto Desafio 5D com integração ao Google Sheets.

## Funcionalidades

- 📊 **Métricas Principais**: Valor investido, Número de vendas, CPA
- 🏆 **Melhores Anúncios**: Top 5 anúncios com performance
- 📄 **Melhores Páginas**: Top 5 páginas com conversão
- 📈 **Gráficos de Progresso**: Visualização em barras dos performers
- 🔄 **Atualização Automática**: Sincronização com Google Sheets a cada 5 minutos
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Ícones**: Lucide React
- **Google Sheets**: google-spreadsheet library
- **Autenticação**: JWT via Google Service Account

## Estrutura do Projeto

```
src/
├── components/
│   ├── MetricCard.tsx          # Card para métricas principais
│   └── PerformerCard.tsx       # Card para anúncios e páginas
├── lib/
│   └── googleSheets.ts         # Integração com Google Sheets
├── pages/
│   ├── index.tsx               # Dashboard principal
│   ├── _app.tsx                # Wrapper da aplicação
│   └── api/
│       └── metrics.ts          # API para buscar métricas
├── styles/
│   └── globals.css             # Estilos globais
└── types/
    └── metrics.ts              # Type definitions
```

## Setup

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Configurar Google Sheets

1. Crie um Service Account no Google Cloud Console:
   - Vá para [Google Cloud Console](https://console.cloud.google.com)
   - Crie um novo projeto
   - Ative a Google Sheets API
   - Crie uma Service Account
   - Baixe a chave JSON

2. Crie uma planilha no Google Sheets com as abas:
   - **Metrics**: Colunas: `Invested Value`, `Sales Count`, `CPA`
   - **Best Ads**: Colunas: `Ad Name`, `Value`, `Percentage`
   - **Best Pages**: Colunas: `Page Name`, `Value`, `Percentage`

3. Compartilhe a planilha com o email do Service Account

### 3. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preenchimento:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=seu_id_planilha_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=seu_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=sua_chave_privada_aqui
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Nota**: A `PRIVATE_KEY` deve ter as quebras de linha escapadas como `\n` na variável de ambiente.

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar em http://localhost:3000
```

## Build para Produção

```bash
# Build
npm run build

# Iniciar servidor de produção
npm start
```

## Estrutura de Dados do Google Sheets

### Aba "Metrics"

| Invested Value | Sales Count | CPA    |
|----------------|-------------|--------|
| 15250.50       | 342         | 44.55  |

### Aba "Best Ads"

| Ad Name                  | Value | Percentage |
|--------------------------|-------|------------|
| Campaign A - Facebook    | 5200  | 28.5       |
| Campaign B - Google      | 4800  | 26.3       |
| Campaign C - Instagram   | 3450  | 18.9       |
| Campaign D - TikTok      | 2100  | 11.5       |
| Campaign E - LinkedIn    | 1800  | 9.8        |

### Aba "Best Pages"

| Page Name          | Value | Percentage |
|--------------------|-------|------------|
| Home Page          | 8500  | 35.2       |
| Product Page       | 6200  | 25.6       |
| Pricing Page       | 4100  | 16.9       |
| Blog Landing       | 3200  | 13.2       |
| Thank You Page     | 2400  | 9.9        |

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa linter
- `npm run type-check` - Verifica tipos TypeScript

## Recursos Futuros

- [ ] Gráficos com Recharts
- [ ] Filtros por período (dia, semana, mês, ano)
- [ ] Comparação com períodos anteriores
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Alertas e notificações
- [ ] Integração com webhooks para dados em tempo real
- [ ] Dashboard customizável
- [ ] Múltiplos usuários e permissões

## Troubleshooting

### Google Sheets não carrega dados

1. Verifique se o Service Account email tem acesso à planilha
2. Confirme que as abas têm os nomes exatos: "Metrics", "Best Ads", "Best Pages"
3. Verifique se as credenciais estão corretas em `.env.local`
4. Veja console para mensagens de erro

### Erro 403 ao acessar Google Sheets

- Compartilhe a planilha explicitamente com o email do Service Account
- Verifique permissões da Service Account na Google Cloud

## Licença

MIT

## Autor

Desenvolvido com ❤️ para o Desafio 5D
