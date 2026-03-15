import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import type { DesafioData } from '@/types/metrics';

interface DesafioEntry {
  key: string;
  data: DesafioData;
}

// Support both new format (desafios array) and legacy (leftKey/rightKey)
interface AnalyzeRequestNew {
  desafios: DesafioEntry[];
}

interface AnalyzeRequestLegacy {
  leftKey: string;
  rightKey: string;
  leftData: DesafioData;
  rightData: DesafioData;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

const label = (k: string) => k.replace('desafio', 'Desafio ');

interface MetricDef {
  label: string;
  key: keyof DesafioData;
  format: (v: number) => string;
}

const metricSections: { title: string; metrics: MetricDef[] }[] = [
  {
    title: 'TRAFEGO',
    metrics: [
      { label: 'Cliques', key: 'cliques', format: fmtNum },
      { label: 'View Pages', key: 'viewPages', format: fmtNum },
      { label: 'Conect Rate', key: 'conectRate', format: fmtPct },
    ],
  },
  {
    title: 'INVESTIMENTO & RECEITA',
    metrics: [
      { label: 'Investimento', key: 'investimento', format: fmt },
      { label: 'Vendas', key: 'vendas', format: fmtNum },
      { label: 'Ingressos Totais', key: 'ingressosTotais', format: fmtNum },
      { label: 'CPA', key: 'cpa', format: fmt },
      { label: 'Ticket Medio', key: 'ticketMedio', format: fmt },
      { label: 'Faturamento', key: 'faturamento', format: fmt },
      { label: 'Lucro/Prejuizo', key: 'lucroPrejuizo', format: fmt },
    ],
  },
  {
    title: 'FUNIL',
    metrics: [
      { label: 'Aplicacoes', key: 'aplicacoes', format: fmtNum },
      { label: 'Custo/Aplicacao', key: 'custoPorAplicacao', format: fmt },
      { label: 'Agendamentos', key: 'agendamentos', format: fmtNum },
      { label: 'Entrevistas', key: 'entrevistas', format: fmtNum },
      { label: 'Custo/Entrevista', key: 'custoEntrevista', format: fmt },
    ],
  },
  {
    title: 'FORMACAO',
    metrics: [
      { label: 'Vendas Formacao', key: 'vendasFormacao', format: fmtNum },
      { label: 'CAC Formacao', key: 'custoVendasFormacao', format: fmt },
      { label: 'Faturamento Total', key: 'faturamentoTotal', format: fmt },
      { label: 'TM Formacao', key: 'ticketMedioFormacao', format: fmt },
    ],
  },
];

function buildPrompt(desafios: DesafioEntry[]): string {
  const names = desafios.map((d) => label(d.key)).join(', ');
  let prompt = `Analise comparativa entre ${names}:\n\n`;

  for (const section of metricSections) {
    prompt += `## ${section.title}\n`;
    for (const metric of section.metrics) {
      const values = desafios
        .map((d) => `${label(d.key)} = ${metric.format(d.data[metric.key] as number)}`)
        .join(' | ');
      prompt += `- ${metric.label}: ${values}\n`;
    }
    prompt += '\n';
  }

  return prompt;
}

function normalizeBody(body: AnalyzeRequestNew | AnalyzeRequestLegacy): DesafioEntry[] {
  if ('desafios' in body && Array.isArray(body.desafios)) {
    return body.desafios;
  }
  const legacy = body as AnalyzeRequestLegacy;
  if (legacy.leftKey && legacy.rightKey && legacy.leftData && legacy.rightData) {
    return [
      { key: legacy.leftKey, data: legacy.leftData },
      { key: legacy.rightKey, data: legacy.rightData },
    ];
  }
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const desafios = normalizeBody(req.body);

  if (desafios.length < 2) {
    return res.status(400).json({ error: 'At least 2 desafios required for comparison' });
  }

  const userPrompt = buildPrompt(desafios);
  const count = desafios.length;
  const desafioNames = desafios.map((d) => label(d.key)).join(' e ');

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Voce e um analista de marketing e performance digital especializado em lancamentos digitais (desafios/webinarios).
Analise os dados comparativos entre ${count} desafios (${desafioNames}) e produza um relatorio conciso em portugues brasileiro.

Estruture sua analise em:
1. **Resumo Geral** - Qual desafio performou melhor no geral e por que
2. **Destaques Positivos** - Metricas que melhoraram significativamente entre os desafios
3. **Pontos de Atencao** - Metricas que pioraram ou precisam de acao
4. **Recomendacoes** - 2-3 sugestoes praticas baseadas nos dados

Use formatacao markdown. Seja direto e objetivo. Nao repita os numeros brutos — foque na interpretacao e nos insights acionaveis.
Para metricas de custo (CPA, Custo/Aplicacao, Custo/Entrevista, CAC), valores menores sao melhores.
Para metricas de receita/volume (Faturamento, Vendas, Cliques), valores maiores sao melhores.`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const analysis = textBlock ? textBlock.text : '';

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: `Failed to generate analysis: ${errorMessage}` });
  }
}
