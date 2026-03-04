import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { AllDesafiosData, DesafioData, TabKey } from '@/types/metrics';
import DashboardHeader from '@/components/DashboardHeader';
import DesafioTabs from '@/components/DesafioTabs';
import StatCards from '@/components/StatCards';
import ResumoGeral from '@/components/ResumoGeral';
import { RefreshCw, AlertTriangle } from 'lucide-react';

function consolidateDesafios(data: AllDesafiosData): DesafioData {
  const desafios = [data.desafio1, data.desafio2, data.desafio3];

  const sum = (key: keyof DesafioData) =>
    desafios.reduce((acc, d) => acc + (typeof d[key] === 'number' ? (d[key] as number) : 0), 0);

  const totalInvestimento = sum('investimento');
  const totalVendas = sum('vendas');
  const totalVendasFormacao = sum('vendasFormacao');
  const totalFaturamentoTotal = sum('faturamentoTotal');

  return {
    captacao: '',
    aoVivo: '',

    cliques: sum('cliques'),
    viewPages: sum('viewPages'),
    conectRate: totalVendas > 0 ? Math.round(sum('conectRate') / desafios.filter(d => d.conectRate > 0).length) : 0,

    investimento: totalInvestimento,
    vendas: totalVendas,
    cpa: totalVendas > 0 ? Math.round(totalInvestimento / totalVendas) : 0,
    ticketMedio: totalVendasFormacao > 0 ? Math.round(totalFaturamentoTotal / totalVendasFormacao) : 0,
    faturamento: sum('faturamento'),
    lucroPrejuizo: sum('lucroPrejuizo'),

    aplicacoes: sum('aplicacoes'),
    custoPorAplicacao: sum('aplicacoes') > 0 ? totalInvestimento / sum('aplicacoes') : 0,

    agendamentos: sum('agendamentos'),
    entrevistas: sum('entrevistas'),
    custoEntrevista: sum('entrevistas') > 0 ? totalInvestimento / sum('entrevistas') : 0,

    vendasFormacao: totalVendasFormacao,
    custoVendasFormacao: totalVendasFormacao > 0 ? totalInvestimento / totalVendasFormacao : 0,
    faturamentoTotal: totalFaturamentoTotal,
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
    if (activeTab === 'geral') return consolidateDesafios(data);
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
            <ResumoGeral data={activeData} />
          </>
        ) : null}
      </main>
    </div>
  );
}
