import React from 'react';
import { MousePointerClick, GitBranch, UserX, ExternalLink } from 'lucide-react';
import type { DesafioData, TabKey } from '@/types/metrics';
import ComparecimentosCard from './ComparecimentosCard';

const LANDING_PAGES: Partial<Record<TabKey, { url: string; label: string }>> = {
  desafio1: {
    url: 'https://lp.felipemarx.com.br/imersao-desafio-breathwork-aovivo-vsl12-8-6l/',
    label: 'LP Desafio 1',
  },
  desafio2: {
    url: 'https://lp.felipemarx.com.br/imersao-desafio-5d-pago-5d-pago-perpetuo-v4/',
    label: 'LP Desafio 2',
  },
  desafio3: {
    url: 'https://lp.felipemarx.com.br/imersao-desafio-5d-pago-5d-pago-perpetuo-2-2/',
    label: 'LP Desafio 3',
  },
};

interface ResumoGeralProps {
  data: DesafioData;
  activeTab?: TabKey;
  /**
   * Quando true, o card de Comparecimentos (renderizado entre Trafego e Funil)
   * exibe o subtitulo "(Site)" em vez de "(Zoom + Site)". Usado no D5.
   */
  comparecimentosSiteOnly?: boolean;
}

interface MetricItem {
  label: string;
  value: string;
  isNegative?: boolean;
  isHighlight?: boolean;
}

interface MetricGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  headerBg: string;
  metrics: MetricItem[];
  isFunnel?: boolean;
}

export default function ResumoGeral({ data, activeTab, comparecimentosSiteOnly = false }: ResumoGeralProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmt = (v: number) => (v === 0 ? '--' : BRL.format(v));
  const fmtNum = (v: number) => (v === 0 ? '--' : v.toLocaleString('pt-BR'));
  const fmtPct = (v: number) => (v === 0 ? '--' : `${v}%`);

  const roas = data.investimento > 0 ? (data.faturamento / data.investimento) : 0;

  // Metricas de trafego adicionais (CPC FB, conversoes de checkout)
  // CPC usa investimentoCaptacao (trafego puro) — fallback para investimento se nao houver
  const investTrafego = data.investimentoCaptacao > 0 ? data.investimentoCaptacao : data.investimento;
  const cpcFacebook = data.cliques > 0 ? investTrafego / data.cliques : 0;
  const hasCheckouts = typeof data.checkouts === 'number' && data.checkouts > 0;
  const convPageCheckout = hasCheckouts && data.viewPages > 0
    ? ((data.checkouts as number) / data.viewPages) * 100
    : 0;
  const convCheckoutVenda = hasCheckouts && (data.checkouts as number) > 0 && data.vendas > 0
    ? (data.vendas / (data.checkouts as number)) * 100
    : 0;

  // Funnel conversion rates
  const convIngressosAplic = data.ingressosTotais > 0 ? (data.aplicacoes / data.ingressosTotais) * 100 : 0;
  const convAplicAgend = data.aplicacoes > 0 ? (data.agendamentos / data.aplicacoes) * 100 : 0;
  const convAgendEntrev = data.agendamentos > 0 ? (data.entrevistas / data.agendamentos) * 100 : 0;
  const convEntrevVendas = data.entrevistas > 0 ? (data.vendasFormacao / data.entrevistas) * 100 : 0;

  // Funnel steps: pairs of cards + conversion rows in between
  type FunnelStep = { type: 'cards'; left: MetricItem; right: MetricItem } | { type: 'conv'; label: string; value: string; isHighlight?: boolean };
  const funnelSteps: FunnelStep[] = [
    { type: 'cards' as const, left: { label: 'Ingressos Totais', value: fmtNum(data.ingressosTotais) }, right: { label: 'Aplicações', value: fmtNum(data.aplicacoes) } },
    { type: 'conv' as const, label: 'Conv. Ingressos → Aplicações', value: fmtPct(parseFloat(convIngressosAplic.toFixed(2))), isHighlight: convIngressosAplic > 0 },
    { type: 'cards' as const, left: { label: 'Custo / Aplicação', value: fmt(data.custoPorAplicacao) }, right: { label: 'Agendamentos', value: fmtNum(data.agendamentos) } },
    { type: 'conv' as const, label: 'Conv. Aplicações → Agendamentos', value: fmtPct(parseFloat(convAplicAgend.toFixed(2))), isHighlight: convAplicAgend > 0 },
    { type: 'cards' as const, left: { label: 'Entrevistas', value: fmtNum(data.entrevistas) }, right: { label: 'Custo / Entrevista', value: fmt(data.custoEntrevista) } },
    { type: 'conv' as const, label: 'Conv. Agendamentos → Entrevistas', value: fmtPct(parseFloat(convAgendEntrev.toFixed(2))), isHighlight: convAgendEntrev > 0 },
    { type: 'conv' as const, label: 'Conv. Entrevistas → Vendas', value: fmtPct(parseFloat(convEntrevVendas.toFixed(2))), isHighlight: convEntrevVendas > 0 },
  ];

  const groups: MetricGroup[] = [
    {
      title: 'Tráfego',
      icon: MousePointerClick,
      accentColor: 'text-cyan-400',
      headerBg: 'from-cyan-500/10 to-transparent',
      metrics: [
        { label: 'Cliques', value: fmtNum(data.cliques) },
        { label: 'Custo por Click (FB)', value: cpcFacebook === 0 ? '--' : fmt(cpcFacebook) },
        { label: 'View Pages', value: fmtNum(data.viewPages) },
        { label: 'Conect Rate', value: fmtPct(data.conectRate), isHighlight: data.conectRate >= 70 },
        { label: 'Conv. Página → Checkout', value: convPageCheckout === 0 ? '--' : `${convPageCheckout.toFixed(1)}%` },
        { label: 'Conv. Checkout → Venda', value: convCheckoutVenda === 0 ? '--' : `${convCheckoutVenda.toFixed(1)}%`, isHighlight: convCheckoutVenda >= 30 },
        { label: 'Investimento', value: fmt(data.investimento), isHighlight: true },
        { label: 'Vendas', value: fmtNum(data.vendas) },
        { label: 'Ingressos Totais (vendas + cortesia)', value: fmtNum(data.ingressosTotais) },
        { label: 'CPA', value: fmt(data.cpa) },
        { label: 'Ticket Médio', value: fmt(data.ticketMedio) },
        { label: 'Fat. Ingressos + Bumps', value: fmt(data.faturamento) },
        {
          label: 'Lucro / Prejuízo',
          value: data.lucroPrejuizo === 0 ? '--' : BRL.format(data.lucroPrejuizo),
          isNegative: data.lucroPrejuizo < 0,
        },
        { label: 'ROAS', value: roas === 0 ? '--' : roas.toFixed(2) + 'x', isHighlight: roas >= 2 },
      ],
    },
    {
      title: 'Funil',
      icon: GitBranch,
      accentColor: 'text-violet-400',
      headerBg: 'from-violet-500/10 to-transparent',
      metrics: [
        // 1. Metricas absolutas do funil (Ingressos Totais omitido — ja exibido em Trafego)
        { label: 'Aplicações', value: fmtNum(data.aplicacoes) },
        { label: 'Agendamentos', value: fmtNum(data.agendamentos) },
        { label: 'Entrevistas', value: fmtNum(data.entrevistas) },
        // 2. Custos por etapa
        { label: 'Custo / Aplicação', value: fmt(data.custoPorAplicacao) },
        { label: 'Custo / Entrevista', value: fmt(data.custoEntrevista) },
        // 3. Conversoes entre etapas
        { label: 'Conv. Ingressos → Aplicações', value: fmtPct(parseFloat(convIngressosAplic.toFixed(2))), isHighlight: convIngressosAplic > 0 },
        { label: 'Conv. Aplicações → Agendamentos', value: fmtPct(parseFloat(convAplicAgend.toFixed(2))), isHighlight: convAplicAgend > 0 },
        { label: 'Conv. Agendamentos → Entrevistas', value: fmtPct(parseFloat(convAgendEntrev.toFixed(2))), isHighlight: convAgendEntrev > 0 },
        { label: 'Conv. Entrevistas → Vendas', value: fmtPct(parseFloat(convEntrevVendas.toFixed(2))), isHighlight: convEntrevVendas > 0 },
        // 4. Resultado final
        { label: 'Vendas Formação', value: fmtNum(data.vendasFormacao), isHighlight: data.vendasFormacao > 0 },
      ],
    },
  ];

  // Only show cancelamentos group if there's data
  if (data.cancelamentos > 0 || data.noShow > 0) {
    groups.push({
      title: 'Cancelamentos & No-show',
      icon: UserX,
      accentColor: 'text-red-400',
      headerBg: 'from-red-500/10 to-transparent',
      metrics: [
        { label: 'Cancelamentos', value: fmtNum(data.cancelamentos), isNegative: data.cancelamentos > 0 },
        { label: 'No-show', value: fmtNum(data.noShow), isNegative: data.noShow > 0 },
      ],
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <React.Fragment key={group.title}>
          <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
            <div className={`px-5 py-3 border-b border-border bg-gradient-to-r ${group.headerBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${group.accentColor}`} />
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
                    {group.title}
                  </h3>
                </div>
                {group.title === 'Tráfego' && activeTab && LANDING_PAGES[activeTab] && (
                  <a
                    href={LANDING_PAGES[activeTab]!.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-heading font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {LANDING_PAGES[activeTab]!.label}
                  </a>
                )}
              </div>
            </div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {group.metrics.map((m) => (
                <div key={m.label} className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className={`rounded-lg border border-border/20 p-2 sm:p-4 flex items-center justify-center bg-gradient-to-br ${group.headerBg}`}>
                    <p className="text-[11px] sm:text-sm font-heading font-bold text-center text-muted-foreground leading-tight">{m.label}</p>
                  </div>
                  <div className={`rounded-lg border border-border/20 p-2 sm:p-4 flex items-center justify-center bg-gradient-to-br ${group.headerBg}`}>
                    <p
                      className={`text-xs sm:text-base md:text-xl font-mono font-bold text-center leading-tight break-words ${
                        m.isNegative
                          ? 'text-destructive'
                          : m.isHighlight
                            ? 'text-primary'
                            : 'text-foreground'
                      }`}
                    >
                      {m.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Comparecimentos aparece entre Trafego e Funil */}
          {group.title === 'Tráfego' && (
            <ComparecimentosCard data={data} siteOnly={comparecimentosSiteOnly} />
          )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
