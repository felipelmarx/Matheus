import { useState, useEffect } from 'react';
import Head from 'next/head';
import { RefreshCw, Calendar, Loader2 } from 'lucide-react';
import { EventoMetrics } from '@/types/metrics';
import StatCards from '@/components/StatCards';
import ResumoGeral from '@/components/ResumoGeral';
import DailyTable from '@/components/DailyTable';
import ChartSection from '@/components/ChartSection';

export default function Home() {
  const [data, setData] = useState<EventoMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/metrics');
      if (!res.ok) throw new Error('Falha ao carregar dados');
      const metrics: EventoMetrics = await res.json();
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Erro ao carregar'}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const lastUpdated = new Date(data.lastUpdated).toLocaleString('pt-BR');

  return (
    <>
      <Head>
        <title>Evento Presencial - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Evento Presencial - Maio 2026
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Atualizado: {lastUpdated}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-xs text-slate-300"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* KPI Cards */}
        <div className="mb-6">
          <StatCards data={data} />
        </div>

        {/* Resumo Geral */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 tracking-wider">
            RESUMO GERAL
          </h2>
          <ResumoGeral data={data} />
        </div>

        {/* Chart */}
        <div className="mb-6">
          <ChartSection data={data.dailyData} />
        </div>

        {/* Daily Table */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 tracking-wider">
            DETALHAMENTO DIARIO
          </h2>
          <DailyTable data={data.dailyData} />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600 py-4 border-t border-slate-800">
          Dashboard Evento Presencial &mdash; Dados via Google Sheets
        </footer>
      </div>
    </>
  );
}
