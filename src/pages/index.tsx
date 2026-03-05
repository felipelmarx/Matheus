import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { AllDesafiosData, DesafioData, TabKey } from '@/types/metrics';
import DashboardHeader from '@/components/DashboardHeader';
import DesafioTabs from '@/components/DesafioTabs';
import StatCards from '@/components/StatCards';
import ResumoGeral from '@/components/ResumoGeral';
import DetalhamentoDia from '@/components/DetalhamentoDia';
import MetasCard from '@/components/MetasCard';
import { RefreshCw, AlertTriangle } from 'lucide-react';

function buildGeralData(data: AllDesafiosData): DesafioData {
  // Use data from RESUMO - GERAL sheet, but exclude Desafio 3 investimento
  const geral = { ...data.geral };
  const inv = data.desafio1.investimento + data.desafio2.investimento;
  geral.investimento = inv;

  // Recalculate metrics that depend on investimento
  geral.cpa = geral.vendas > 0 ? Math.round(inv / geral.vendas) : 0;
  geral.custoPorAplicacao = geral.aplicacoes > 0 ? inv / geral.aplicacoes : 0;
  geral.custoEntrevista = geral.entrevistas > 0 ? inv / geral.entrevistas : 0;
  geral.custoVendasFormacao = geral.vendasFormacao > 0 ? inv / geral.vendasFormacao : 0;
  geral.lucroPrejuizo = geral.faturamento - inv;

  return geral;
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
            {activeTab === 'desafio3' && data.desafio3Daily.length > 0 && (
              <DetalhamentoDia daily={data.desafio3Daily} />
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
