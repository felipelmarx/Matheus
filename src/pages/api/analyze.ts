import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import type { DesafioData } from '@/types/metrics';

interface AnalyzeRequest {
  leftKey: string;
  rightKey: string;
  leftData: DesafioData;
  rightData: DesafioData;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

function buildDelta(left: number, right: number): string {
  const diff = right - left;
  if (diff === 0) return 'sem alteracao';
  const sign = diff > 0 ? '+' : '';
  const pct = left !== 0 ? ` (${sign}${((diff / Math.abs(left)) * 100).toFixed(1)}%)` : '';
  return `${sign}${diff}${pct}`;
}

function buildPrompt(leftKey: string, rightKey: string, left: DesafioData, right: DesafioData): string {
  const label = (k: string) => k.replace('desafio', 'Desafio ');

  const sections = [
    {
      title: 'TRAFEGO',
      rows: [
        { label: 'Cliques', l: fmtNum(left.cliques), r: fmtNum(right.cliques), delta: buildDelta(left.cliques, right.cliques) },
        { label: 'View Pages', l: fmtNum(left.viewPages), r: fmtNum(right.viewPages), delta: buildDelta(left.viewPages, right.viewPages) },
        { label: 'Conect Rate', l: fmtPct(left.conectRate), r: fmtPct(right.conectRate), delta: buildDelta(left.conectRate, right.conectRate) },
      ],
    },
    {
      title: 'INVESTIMENTO & RECEITA',
      rows: [
        { label: 'Investimento', l: fmt(left.investimento), r: fmt(right.investimento), delta: buildDelta(left.investimento, right.investimento) },
        { label: 'Vendas', l: fmtNum(left.vendas), r: fmtNum(right.vendas), delta: buildDelta(left.vendas, right.vendas) },
        { label: 'Ingressos Totais', l: fmtNum(left.ingressosTotais), r: fmtNum(right.ingressosTotais), delta: buildDelta(left.ingressosTotais, right.ingressosTotais) },
        { label: 'CPA', l: fmt(left.cpa), r: fmt(right.cpa), delta: buildDelta(left.cpa, right.cpa) },
        { label: 'Ticket Medio', l: fmt(left.ticketMedio), r: fmt(right.ticketMedio), delta: buildDelta(left.ticketMedio, right.ticketMedio) },
        { label: 'Faturamento', l: fmt(left.faturamento), r: fmt(right.faturamento), delta: buildDelta(left.faturamento, right.faturamento) },
        { label: 'Lucro/Prejuizo', l: fmt(left.lucroPrejuizo), r: fmt(right.lucroPrejuizo), delta: buildDelta(left.lucroPrejuizo, right.lucroPrejuizo) },
      ],
    },
    {
      title: 'FUNIL',
      rows: [
        { label: 'Aplicacoes', l: fmtNum(left.aplicacoes), r: fmtNum(right.aplicacoes), delta: buildDelta(left.aplicacoes, right.aplicacoes) },
        { label: 'Custo/Aplicacao', l: fmt(left.custoPorAplicacao), r: fmt(right.custoPorAplicacao), delta: buildDelta(left.custoPorAplicacao, right.custoPorAplicacao) },
        { label: 'Agendamentos', l: fmtNum(left.agendamentos), r: fmtNum(right.agendamentos), delta: buildDelta(left.agendamentos, right.agendamentos) },
        { label: 'Entrevistas', l: fmtNum(left.entrevistas), r: fmtNum(right.entrevistas), delta: buildDelta(left.entrevistas, right.entrevistas) },
        { label: 'Custo/Entrevista', l: fmt(left.custoEntrevista), r: fmt(right.custoEntrevista), delta: buildDelta(left.custoEntrevista, right.custoEntrevista) },
      ],
    },
    {
      title: 'FORMACAO',
      rows: [
        { label: 'Vendas Formacao', l: fmtNum(left.vendasFormacao), r: fmtNum(right.vendasFormacao), delta: buildDelta(left.vendasFormacao, right.vendasFormacao) },
        { label: 'CAC Formacao', l: fmt(left.custoVendasFormacao), r: fmt(right.custoVendasFormacao), delta: buildDelta(left.custoVendasFormacao, right.custoVendasFormacao) },
        { label: 'Faturamento Total', l: fmt(left.faturamentoTotal), r: fmt(right.faturamentoTotal), delta: buildDelta(left.faturamentoTotal, right.faturamentoTotal) },
        { label: 'TM Formacao', l: fmt(left.ticketMedioFormacao), r: fmt(right.ticketMedioFormacao), delta: buildDelta(left.ticketMedioFormacao, right.ticketMedioFormacao) },
      ],
    },
  ];

  let prompt = `Analise comparativa entre ${label(leftKey)} e ${label(rightKey)}:\n\n`;

  for (const section of sections) {
    prompt += `## ${section.title}\n`;
    for (const row of section.rows) {
      prompt += `- ${row.label}: ${label(leftKey)} = ${row.l} | ${label(rightKey)} = ${row.r} | Delta: ${row.delta}\n`;
    }
    prompt += '\n';
  }

  return prompt;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { leftKey, rightKey, leftData, rightData } = req.body as AnalyzeRequest;

  if (!leftKey || !rightKey || !leftData || !rightData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userPrompt = buildPrompt(leftKey, rightKey, leftData, rightData);

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Voce e um analista de marketing e performance digital especializado em lancamentos digitais (desafios/webinarios).
Analise os dados comparativos entre dois desafios e produza um relatorio conciso em portugues brasileiro.

Estruture sua analise em:
1. **Resumo Geral** - Qual desafio performou melhor no geral e por que
2. **Destaques Positivos** - Metricas que melhoraram significativamente
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
