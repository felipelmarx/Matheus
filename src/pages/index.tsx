import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { AllDesafiosData, DesafioData, TabKey, GeralMode } from '@/types/metrics';
import DashboardHeader from '@/components/DashboardHeader';
import DesafioTabs from '@/components/DesafioTabs';
import StatCards from '@/components/StatCards';
import ResumoGeral from '@/components/ResumoGeral';
import FunilVisual from '@/components/FunilVisual';
import ComparecimentosCard from '@/components/ComparecimentosCard';
import DetalhamentoDia from '@/components/DetalhamentoDia';
import PopupQualificador from '@/components/PopupQualificador';
import MetasCard from '@/components/MetasCard';
import CompararView from '@/components/CompararView';
import DesafioInfo from '@/components/DesafioInfo';
import GuiaDesafio from '@/components/GuiaDesafio';
import AnalisesDesafios from '@/components/AnalisesDesafios';
import SimuladorView from '@/components/simulador/SimuladorView';
import { RefreshCw, AlertTriangle } from 'lucide-react';

function buildGeralData(data: AllDesafiosData, mode: GeralMode): DesafioData {
  const desafios: DesafioData[] = mode === 'meta1'
    ? [data.desafio1, data.desafio2]
    : mode === 'meta2'
      ? [data.desafio3, data.desafio4]
      : [data.desafio1, data.desafio2, data.desafio3, data.desafio4, data.desafio5];

  const sum = (fn: (d: DesafioData) => number) => desafios.reduce((acc, d) => acc + fn(d), 0);

  const inv = sum(d => d.investimento);
  const fat = sum(d => d.faturamento);
  const vendasForm = sum(d => d.vendasFormacao);
  const fatTotal = sum(d => d.faturamentoTotal);
  const vendas = sum(d => d.vendas);
  const aplicacoes = sum(d => d.aplicacoes);
  const agendamentos = sum(d => d.agendamentos);
  const entrevistas = sum(d => d.entrevistas);
  const cliques = sum(d => d.cliques);
  const viewPages = sum(d => d.viewPages);
  const ingressosTotais = sum(d => d.ingressosTotais);
  const cortesias = sum(d => d.cortesias ?? 0);
  const cancelamentos = sum(d => d.cancelamentos);
  const noShow = sum(d => d.noShow);
  const tmFormacao = vendasForm > 0 ? fatTotal / vendasForm : 0;

  // Soma comparecimentos por sessao (5 sessoes) para o agregado Geral
  const comparecimentos: number[] = [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) {
    comparecimentos[i] = desafios.reduce((acc, d) => acc + (d.comparecimentos?.[i] ?? 0), 0);
  }

  // Agrega checkouts somente se pelo menos um desafio tiver o dado; caso contrario, null
  const hasAnyCheckouts = desafios.some(d => typeof d.checkouts === 'number' && d.checkouts > 0);
  const checkouts: number | null = hasAnyCheckouts
    ? desafios.reduce((acc, d) => acc + (typeof d.checkouts === 'number' ? d.checkouts : 0), 0)
    : null;

  return {
    captacao: '',
    aoVivo: '',
    cliques,
    viewPages,
    conectRate: cliques > 0 ? Math.round((viewPages / cliques) * 100) : 0,
    checkouts,
    investimento: inv,
    investimentoCaptacao: sum(d => d.investimentoCaptacao),
    vendas,
    cortesias,
    ingressosTotais,
    cpa: vendas > 0 ? Math.round(inv / vendas) : 0,
    ticketMedio: vendas > 0 ? Math.round(fat / vendas) : 0,
    faturamento: fat,
    lucroPrejuizo: fat - inv,
    aplicacoes,
    custoPorAplicacao: aplicacoes > 0 ? inv / aplicacoes : 0,
    agendamentos,
    entrevistas,
    custoEntrevista: entrevistas > 0 ? inv / entrevistas : 0,
    vendasFormacao: vendasForm,
    custoVendasFormacao: vendasForm > 0 ? inv / vendasForm : 0,
    faturamentoTotal: fatTotal,
    ticketMedioFormacao: Math.round(tmFormacao),
    cancelamentos,
    noShow,
    comparecimentos,
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<AllDesafiosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('geral');

  const fetchData = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = force ? '/api/metrics?refresh=true' : '/api/metrics';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao carregar dados');
      const newData: AllDesafiosData = await res.json();
      setData(newData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeData = useMemo(() => {
    if (!data) return null;
    if (activeTab === 'comparar' || activeTab === 'analises' || activeTab === 'simulador' || activeTab === 'guia' || activeTab === 'analiseAplicacoes' || activeTab === 'analiseCruzada') return null;
    if (activeTab === 'geral') return buildGeralData(data, 'total');
    return data[activeTab];
  }, [data, activeTab]);

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 max-w-md">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <h2 className="text-foreground font-semibold mb-2 text-center font-heading">
            Erro ao carregar dados
          </h2>
          <p className="text-muted-foreground text-sm mb-4 text-center">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="w-full bg-destructive text-destructive-foreground font-medium py-2 px-4 rounded-lg transition hover:opacity-90 font-heading"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        data={data}
        loading={loading}
        lastRefresh={lastRefresh}
        onRefresh={() => fetchData(true)}
      />

      <main className="px-4 lg:px-16 py-8 space-y-6">
        {loading && !data ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-heading">Carregando dados...</p>
            </div>
          </div>
        ) : data ? (
          <>
            <DesafioTabs activeTab={activeTab} onTabChange={setActiveTab} data={data} />
            {activeTab === 'guia' ? (
              <GuiaDesafio />
            ) : activeTab === 'simulador' ? (
              <SimuladorView data={data} />
            ) : activeTab === 'analises' ? (
              <AnalisesDesafios
                visaoEstrategica={data.visaoEstrategica}
                resumoTecnico={data.resumoTecnico}
                analiseAplicacoes={data.analiseAplicacoes}
                analiseCruzada={data.analiseCruzada}
                topAds={data.topAds}
                topAdsDesafio4={data.topAdsDesafio4}
              />
            ) : activeTab === 'comparar' ? (
              <CompararView data={data} />
            ) : activeData ? (
              <>
                {(activeTab === 'desafio1' || activeTab === 'desafio2' || activeTab === 'desafio3' || activeTab === 'desafio4' || activeTab === 'desafio5') && (
                  <DesafioInfo desafioKey={activeTab} />
                )}
                <StatCards data={activeData} />
                <MetasCard data={activeData} />
                <ResumoGeral
                  data={activeData}
                  activeTab={activeTab}
                  comparecimentosSiteOnly={activeTab === 'desafio5'}
                />
                <FunilVisual data={activeData} />
                <ComparecimentosCard data={activeData} siteOnly={activeTab === 'desafio5'} />
                {activeTab === 'desafio3' && data.desafio3Daily.length > 0 && (
                  <DetalhamentoDia daily={data.desafio3Daily} />
                )}
                {activeTab === 'desafio4' && data.desafio4Daily.length > 0 && (
                  <DetalhamentoDia daily={data.desafio4Daily} />
                )}
                {activeTab === 'desafio5' && data.desafio5Daily.length > 0 && (
                  <DetalhamentoDia daily={data.desafio5Daily} />
                )}
                {activeTab === 'desafio5' && (data.popupQualificador.length > 0 || data.popupConsolidado) && (
                  <PopupQualificador days={data.popupQualificador} consolidado={data.popupConsolidado} />
                )}
              </>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
