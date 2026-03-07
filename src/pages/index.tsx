import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { AllDesafiosData, DesafioData, TabKey } from '@/types/metrics';
import DashboardHeader from '@/components/DashboardHeader';
import DesafioTabs from '@/components/DesafioTabs';
import StatCards from '@/components/StatCards';
import ResumoGeral from '@/components/ResumoGeral';
import FunilVisual from '@/components/FunilVisual';
import DetalhamentoDia from '@/components/DetalhamentoDia';
import MetasCard from '@/components/MetasCard';
import { RefreshCw, AlertTriangle } from 'lucide-react';

function buildGeralData(data: AllDesafiosData): DesafioData {
  const d1 = data.desafio1;
  const d2 = data.desafio2;

  // Sum Desafio 1 + 2 only (exclude Desafio 3)
  const inv = d1.investimento + d2.investimento;
  const fat = d1.faturamento + d2.faturamento;
  const vendasForm = d1.vendasFormacao + d2.vendasFormacao;
  const fatTotal = d1.faturamentoTotal + d2.faturamentoTotal;
  const vendas = d1.vendas + d2.vendas;
  const aplicacoes = d1.aplicacoes + d2.aplicacoes;
  const agendamentos = d1.agendamentos + d2.agendamentos;
  const entrevistas = d1.entrevistas + d2.entrevistas;

  const lucroPrejuizo = d1.lucroPrejuizo + d2.lucroPrejuizo;
  const cac = vendasForm > 0 ? lucroPrejuizo / vendasForm : 0;
  const tmFormacao = vendasForm > 0 ? fatTotal / vendasForm : 0;

  return {
    ...data.geral,
    investimento: inv,
    faturamento: fat,
    vendas,
    aplicacoes,
    agendamentos,
    entrevistas,
    vendasFormacao: vendasForm,
    faturamentoTotal: fatTotal,
    ticketMedioFormacao: Math.round(tmFormacao),
    custoVendasFormacao: cac,
    cpa: vendas > 0 ? Math.round(inv / vendas) : 0,
    ticketMedio: vendas > 0 ? Math.round(fat / vendas) : 0,
    custoPorAplicacao: aplicacoes > 0 ? inv / aplicacoes : 0,
    custoEntrevista: entrevistas > 0 ? inv / entrevistas : 0,
    lucroPrejuizo: fat - inv,
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
    const interval = setInterval(() => fetchData(), 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeData = useMemo(() => {
    if (!data) return null;
    if (activeTab === 'geral') return buildGeralData(data);
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
        ) : data && activeData ? (
          <>
            <DesafioTabs activeTab={activeTab} onTabChange={setActiveTab} data={data} />
            <StatCards data={activeData} />
            <MetasCard data={activeData} />
            <ResumoGeral data={activeData} />
            <FunilVisual data={activeData} />
            {activeTab === 'desafio3' && data.desafio3Daily.length > 0 && (
              <DetalhamentoDia daily={data.desafio3Daily} />
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
