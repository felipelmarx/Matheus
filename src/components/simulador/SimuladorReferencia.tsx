import type { DesafioData } from '@/types/metrics';
import type { SimuladorInputs } from '@/hooks/useSimulador';
import { Trophy, Clock, ArrowRight } from 'lucide-react';

interface ExtractedMetrics {
  label: string;
  // Trafego
  investimento: number;
  cpc: number;
  // Pagina de Vendas
  taxaConversao: number;
  // Produto Principal
  precoProduto: number;
  // Qualificacao
  taxaAplicacao: number;
  taxaAgendamento: number;
  taxaEntrevista: number;
  // Formacao
  taxaVendaFormacao: number;
  ticketFormacao: number;
}

function extractMetrics(d: DesafioData, label: string): ExtractedMetrics | null {
  if (d.cliques <= 0 || d.vendas <= 0) return null;

  return {
    label,
    // Trafego
    investimento: d.investimento,
    cpc: d.cliques > 0 ? d.investimento / d.cliques : 0,
    // Pagina de Vendas
    taxaConversao: d.cliques > 0 ? (d.vendas / d.cliques) * 100 : 0,
    // Produto Principal
    precoProduto: d.ticketMedio > 0 ? d.ticketMedio : 0,
    // Qualificacao
    taxaAplicacao: d.ingressosTotais > 0 ? (d.aplicacoes / d.ingressosTotais) * 100 : 0,
    taxaAgendamento: d.aplicacoes > 0 ? (d.agendamentos / d.aplicacoes) * 100 : 0,
    taxaEntrevista: d.agendamentos > 0 ? (d.entrevistas / d.agendamentos) * 100 : 0,
    // Formacao
    taxaVendaFormacao: d.entrevistas > 0 ? (d.vendasFormacao / d.entrevistas) * 100 : 0,
    ticketFormacao: d.vendasFormacao > 0 ? d.ticketMedioFormacao : 0,
  };
}

function metricsToInputs(m: ExtractedMetrics): Partial<SimuladorInputs> {
  const partial: Partial<SimuladorInputs> = {};

  if (m.investimento > 0) partial.investimento = Math.round(m.investimento);
  if (m.cpc > 0) partial.cpc = Math.round(m.cpc * 100) / 100;
  if (m.taxaConversao > 0) partial.taxaConversao = Math.round(m.taxaConversao * 10) / 10;
  if (m.precoProduto > 0) partial.precoProduto = Math.round(m.precoProduto);
  if (m.taxaAplicacao > 0) partial.taxaAplicacao = Math.round(m.taxaAplicacao);
  if (m.taxaAgendamento > 0) partial.taxaAgendamento = Math.round(m.taxaAgendamento);
  if (m.taxaEntrevista > 0) partial.taxaEntrevista = Math.round(m.taxaEntrevista);
  if (m.taxaVendaFormacao > 0) partial.taxaVendaFormacao = Math.round(m.taxaVendaFormacao);
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
      title: 'Trafego',
      color: 'text-blue-400',
      items: [
        { label: 'Investimento', value: `R$ ${m.investimento.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` },
        { label: 'CPC', value: `R$ ${m.cpc.toFixed(2)}` },
      ],
    },
    {
      title: 'Pag. Vendas',
      color: 'text-cyan-400',
      items: [
        { label: 'Conversao', value: `${m.taxaConversao.toFixed(1)}%` },
      ],
    },
    {
      title: 'Produto',
      color: 'text-emerald-400',
      items: [
        { label: 'Ticket Medio', value: `R$ ${m.precoProduto.toFixed(0)}` },
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
    const scoreA = (a.taxaConversao / 100) * (a.taxaAplicacao / 100) * (a.taxaAgendamento / 100) * (a.taxaEntrevista / 100) * (a.taxaVendaFormacao / 100);
    const scoreB = (b.taxaConversao / 100) * (b.taxaAplicacao / 100) * (b.taxaAgendamento / 100) * (b.taxaEntrevista / 100) * (b.taxaVendaFormacao / 100);
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
