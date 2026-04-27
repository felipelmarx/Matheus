import type { DesafioData } from '@/types/metrics';
import type { SimuladorInputs } from '@/hooks/useSimulador';

interface ExtractedMetrics {
  label: string;
  // Investimento
  investimentoTrafego: number;   // apenas ads (total - API)
  // Trafego
  cpc: number;                   // investimentoTrafego / cliques
  // Conversao direta do funil de captacao
  taxaCliqueVenda: number;       // vendas / cliques * 100
  // Checkout 2 estagios — diagnostico avancado
  taxaLPVCheckout: number;       // checkouts / viewPages
  taxaCheckoutVenda: number;     // vendas / checkouts
  taxaLPVVenda: number;          // display only (combinado)
  // Produto
  ticketMedio: number;
  // Cortesias
  taxaCortesia: number;          // (ingressosTotais - vendas) / vendas
  custoPorLead: number;          // default 9
  // Qualificacao (agora baseado em inscritosTotais)
  taxaAplicacao: number;         // aplicacoes / ingressosTotais
  taxaAgendamento: number;
  taxaEntrevista: number;
  // Formacao
  taxaVendaFormacao: number;
  ticketFormacao: number;
}

const DEFAULT_CUSTO_POR_LEAD = 9;

function extractMetrics(d: DesafioData, label: string): ExtractedMetrics | null {
  if (d.cliques <= 0 || d.vendas <= 0) return null;

  const inscritosTotais = d.ingressosTotais > 0 ? d.ingressosTotais : d.vendas;

  // Derivar investimentoTrafego com precisao: se CPA existe, usar CPA * vendas (exato);
  // senao fallback: descontar API estimate do investimento total.
  const investimentoTrafego = d.cpa > 0
    ? d.cpa * d.vendas
    : Math.max(0, d.investimento - inscritosTotais * DEFAULT_CUSTO_POR_LEAD);

  const cpc = d.cliques > 0 ? investimentoTrafego / d.cliques : 0;

  // Conversao direta Clique -> Venda (taxa global de captacao).
  const taxaCliqueVenda = d.cliques > 0 ? (d.vendas / d.cliques) * 100 : 0;

  // Checkout 2 estagios — usa `checkouts` se disponivel, senao heuristica
  const hasCheckouts = d.checkouts !== null && d.checkouts > 0;
  const taxaLPVCheckout = hasCheckouts && d.viewPages > 0
    ? ((d.checkouts as number) / d.viewPages) * 100
    : 0;
  const taxaCheckoutVenda = hasCheckouts
    ? (d.vendas / (d.checkouts as number)) * 100
    : 0;
  const taxaLPVVenda = d.viewPages > 0 ? (d.vendas / d.viewPages) * 100 : 0;

  // Cortesia
  const taxaCortesia = d.vendas > 0 && inscritosTotais > d.vendas
    ? ((inscritosTotais - d.vendas) / d.vendas) * 100
    : 0;

  return {
    label,
    investimentoTrafego,
    cpc,
    taxaCliqueVenda,
    taxaLPVCheckout,
    taxaCheckoutVenda,
    taxaLPVVenda,
    ticketMedio: d.ticketMedio > 0 ? d.ticketMedio : 0,
    taxaCortesia,
    custoPorLead: DEFAULT_CUSTO_POR_LEAD,
    // Aplicacao agora baseada em inscritosTotais (modelo v3)
    taxaAplicacao: inscritosTotais > 0 ? (d.aplicacoes / inscritosTotais) * 100 : 0,
    taxaAgendamento: d.aplicacoes > 0 ? (d.agendamentos / d.aplicacoes) * 100 : 0,
    taxaEntrevista: d.agendamentos > 0 ? (d.entrevistas / d.agendamentos) * 100 : 0,
    taxaVendaFormacao: d.entrevistas > 0 ? (d.vendasFormacao / d.entrevistas) * 100 : 0,
    ticketFormacao: d.vendasFormacao > 0 ? d.ticketMedioFormacao : 0,
  };
}

/**
 * Mapeia métricas extraídas do Desafio histórico para o shape de inputs.
 * Prefere valores reais (checkouts, cortesias) quando disponíveis.
 */
function metricsToInputs(m: ExtractedMetrics): Partial<SimuladorInputs> {
  const partial: Partial<SimuladorInputs> = {};

  if (m.investimentoTrafego > 0) partial.investimentoTrafego = Math.round(m.investimentoTrafego);
  if (m.cpc > 0) partial.cpc = Math.round(m.cpc * 100) / 100;
  // Taxa direta clique -> venda. Tipicamente <10%, mantemos 2 casas decimais.
  if (m.taxaCliqueVenda > 0) {
    partial.taxaCliqueVenda = Math.max(0, Math.min(100, Math.round(m.taxaCliqueVenda * 100) / 100));
  }

  // Checkout 2 estagios — usa valores reais se extractMetrics conseguiu calcular
  if (m.taxaLPVCheckout > 0 && m.taxaCheckoutVenda > 0) {
    partial.taxaLPVCheckout = Math.max(0.1, Math.min(100, Math.round(m.taxaLPVCheckout * 10) / 10));
    partial.taxaCheckoutVenda = Math.max(0.1, Math.min(100, Math.round(m.taxaCheckoutVenda * 10) / 10));
  } else if (m.taxaLPVVenda > 0) {
    // Fallback heuristica: assume 38.6% (D5 ground truth) e deriva taxaLPVCheckout
    const taxaCheckoutVenda = 38.6;
    const taxaLPVCheckout = (m.taxaLPVVenda / taxaCheckoutVenda) * 100;
    partial.taxaCheckoutVenda = taxaCheckoutVenda;
    partial.taxaLPVCheckout = Math.max(0.1, Math.min(100, Math.round(taxaLPVCheckout * 10) / 10));
  }

  if (m.ticketMedio > 0) partial.ticketMedio = Math.round(m.ticketMedio);

  // Cortesias (modelo v3)
  if (m.taxaCortesia > 0) partial.taxaCortesia = Math.round(m.taxaCortesia * 10) / 10;
  if (m.custoPorLead > 0) partial.custoPorLead = m.custoPorLead;

  if (m.taxaAplicacao > 0) partial.taxaAplicacao = Math.round(m.taxaAplicacao * 10) / 10;
  if (m.taxaAgendamento > 0) partial.taxaAgendamento = Math.round(m.taxaAgendamento * 10) / 10;
  if (m.taxaEntrevista > 0) partial.taxaEntrevista = Math.round(m.taxaEntrevista * 10) / 10;
  if (m.taxaVendaFormacao > 0) partial.taxaVendaFormacao = Math.round(m.taxaVendaFormacao * 10) / 10;
  if (m.ticketFormacao > 0) partial.ticketFormacao = Math.round(m.ticketFormacao);

  return partial;
}

interface DesafioEntry {
  key: string;
  label: string;
  data: DesafioData;
}

interface SimuladorReferenciaProps {
  desafios: DesafioEntry[];
  onApply: (metrics: Partial<SimuladorInputs>) => void;
}

/**
 * Extrai o numero do Desafio a partir do label ("Desafio 3" -> "3").
 * Fallback: retorna o label inteiro.
 */
function shortDesafioLabel(label: string): string {
  const match = label.match(/(\d+)/);
  return match ? `D${match[1]}` : label;
}

/**
 * Limpa o texto de captacao. Input esperado: "CAPTAÇÃO - 24/01 - 02/02".
 * Output: "24/01 - 02/02". Caso nao bata o padrao, retorna o input como-esta.
 */
function trimCaptacao(captacao: string): string {
  if (!captacao) return '';
  const trimmed = captacao.trim();
  // Remove prefixo "CAPTAÇÃO -" ou "CAPTACAO -" (case-insensitive)
  const stripped = trimmed.replace(/^\s*CAPTA[ÇC]?[AÃ]?O\s*[-–—]\s*/i, '').trim();
  return stripped || trimmed;
}

export default function SimuladorReferencia({ desafios, onApply }: SimuladorReferenciaProps) {
  const entries = desafios
    .map((d) => {
      const metrics = extractMetrics(d.data, d.label);
      if (!metrics) return null;
      return {
        key: d.key,
        label: d.label,
        periodo: trimCaptacao(d.data.captacao),
        metrics,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  if (entries.length === 0) return null;

  const apply = (m: ExtractedMetrics) => onApply(metricsToInputs(m));

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map((entry) => (
        <button
          key={entry.key}
          type="button"
          onClick={() => apply(entry.metrics)}
          className="flex flex-col items-start px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-border/80 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Aplicar métricas do ${entry.label}${entry.periodo ? ` (${entry.periodo})` : ''}`}
        >
          <span className="text-xs font-heading font-semibold text-foreground">
            {shortDesafioLabel(entry.label)} — Aplicar
          </span>
          {entry.periodo && (
            <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {entry.periodo}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
