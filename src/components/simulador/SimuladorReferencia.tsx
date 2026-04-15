import type { DesafioData } from '@/types/metrics';
import type { SimuladorInputs } from '@/hooks/useSimulador';
import { Trophy, Clock, ArrowRight } from 'lucide-react';

interface ExtractedMetrics {
  label: string;
  // Investimento
  investimentoTrafego: number;   // apenas ads (total - API)
  // Trafego
  cpc: number;                   // investimentoTrafego / cliques
  connectRate: number;
  // Checkout 2 estagios
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

  const connectRate =
    d.conectRate > 0
      ? d.conectRate
      : d.cliques > 0 && d.viewPages > 0
        ? (d.viewPages / d.cliques) * 100
        : 0;

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
    connectRate,
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
  if (m.connectRate > 0) partial.connectRate = Math.round(m.connectRate * 10) / 10;

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

interface SimuladorReferenciaProps {
  desafios: { key: string; label: string; data: DesafioData }[];
  onApply: (metrics: Partial<SimuladorInputs>) => void;
}

interface MetricDisplayItem {
  label: string;
  value: string;
}

function formatSections(m: ExtractedMetrics): { title: string; color: string; items: MetricDisplayItem[] }[] {
  return [
    {
      title: 'Investimento',
      color: 'text-blue-400',
      items: [
        { label: 'Trafego', value: `R$ ${m.investimentoTrafego.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` },
        { label: 'CPC', value: `R$ ${m.cpc.toFixed(2)}` },
      ],
    },
    {
      title: 'Trafego',
      color: 'text-cyan-400',
      items: [
        { label: 'Connect', value: `${m.connectRate.toFixed(1)}%` },
        { label: 'LPV -> Venda', value: `${m.taxaLPVVenda.toFixed(2)}%` },
      ],
    },
    {
      title: 'Produto',
      color: 'text-emerald-400',
      items: [
        { label: 'Ticket Medio', value: `R$ ${m.ticketMedio.toFixed(0)}` },
      ],
    },
    {
      title: 'Qualificacao',
      color: 'text-pink-400',
      items: [
        { label: 'Aplicacao', value: `${m.taxaAplicacao.toFixed(1)}%` },
        { label: 'Agendamento', value: `${m.taxaAgendamento.toFixed(1)}%` },
        { label: 'Entrevista', value: `${m.taxaEntrevista.toFixed(1)}%` },
      ],
    },
    {
      title: 'Formacao',
      color: 'text-violet-400',
      items: [
        { label: 'Taxa Venda', value: `${m.taxaVendaFormacao.toFixed(1)}%` },
        { label: 'Ticket', value: m.ticketFormacao > 0 ? `R$ ${m.ticketFormacao.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : '—' },
      ],
    },
  ];
}

function MetricCard({ metrics, icon, color, gradientFrom, borderColor, onApply }: {
  metrics: ExtractedMetrics;
  icon: React.ReactNode;
  color: string;
  gradientFrom: string;
  borderColor: string;
  onApply: () => void;
}) {
  const sections = formatSections(metrics);

  return (
    <div className={`bg-gradient-to-br ${gradientFrom} border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className={`text-[10px] uppercase tracking-wider font-heading font-semibold ${color}`}>
            {metrics.label}
          </p>
        </div>
        <button
          onClick={onApply}
          className={`flex items-center gap-1 text-[10px] font-heading font-medium px-2.5 py-1 rounded-lg ${color} bg-white/5 hover:bg-white/10 border ${borderColor} transition-all hover:scale-105`}
        >
          Aplicar Tudo <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className={`text-[8px] uppercase tracking-widest font-heading font-semibold ${section.color} mb-1`}>
              {section.title}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {section.items.map((item) => (
                <div key={item.label} className="bg-black/10 rounded-lg px-2.5 py-1.5">
                  <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-heading">
                    {item.label}
                  </p>
                  <p className="text-[11px] font-bold font-mono text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SimuladorReferencia({ desafios, onApply }: SimuladorReferenciaProps) {
  const allMetrics = desafios
    .map((d) => extractMetrics(d.data, d.label))
    .filter((m): m is ExtractedMetrics => m !== null);

  if (allMetrics.length === 0) return null;

  // Best: highest overall funnel conversion (clicks → formation sales)
  const best = allMetrics.reduce((a, b) => {
    const scoreA = (a.connectRate / 100) * (a.taxaLPVVenda / 100) * (a.taxaAplicacao / 100) * (a.taxaAgendamento / 100) * (a.taxaEntrevista / 100) * (a.taxaVendaFormacao / 100);
    const scoreB = (b.connectRate / 100) * (b.taxaLPVVenda / 100) * (b.taxaAplicacao / 100) * (b.taxaAgendamento / 100) * (b.taxaEntrevista / 100) * (b.taxaVendaFormacao / 100);
    return scoreB > scoreA ? b : a;
  });

  // Latest: last in the array with data
  const latest = allMetrics[allMetrics.length - 1];

  const apply = (m: ExtractedMetrics) => onApply(metricsToInputs(m));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricCard
        metrics={best}
        icon={<Trophy className="w-4 h-4 text-amber-400" />}
        color="text-amber-400"
        gradientFrom="from-amber-500/10 to-amber-600/5"
        borderColor="border-amber-500/20"
        onApply={() => apply(best)}
      />
      {latest && latest.label !== best.label && (
        <MetricCard
          metrics={latest}
          icon={<Clock className="w-4 h-4 text-blue-400" />}
          color="text-blue-400"
          gradientFrom="from-blue-500/10 to-blue-600/5"
          borderColor="border-blue-500/20"
          onApply={() => apply(latest)}
        />
      )}
      {latest && latest.label === best.label && allMetrics.length > 1 && (
        <MetricCard
          metrics={allMetrics[allMetrics.length - 2]}
          icon={<Clock className="w-4 h-4 text-blue-400" />}
          color="text-blue-400"
          gradientFrom="from-blue-500/10 to-blue-600/5"
          borderColor="border-blue-500/20"
          onApply={() => apply(allMetrics[allMetrics.length - 2])}
        />
      )}
    </div>
  );
}
