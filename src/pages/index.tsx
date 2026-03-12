import { useState, useEffect } from 'react';
import Head from 'next/head';
import { RefreshCw, Calendar, Loader2, Sun, Moon } from 'lucide-react';
import { EventoMetrics } from '@/types/metrics';
import StatCards from '@/components/StatCards';
import ResumoGeral from '@/components/ResumoGeral';
import DailyTable from '@/components/DailyTable';
import ChartSection from '@/components/ChartSection';

export default function Home() {
  const [data, setData] = useState<EventoMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
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
            <h1 className="text-xl md:text-2xl font-bold text-fg flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Evento Presencial - Maio 2026
            </h1>
            <p className="text-xs text-muted-strong mt-1">
              Atualizado: {lastUpdated}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 bg-surface border border-card-border rounded-lg hover:bg-surface-hover transition-colors"
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-surface border border-card-border rounded-lg hover:bg-surface-hover transition-colors text-xs text-muted"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-6">
          <StatCards data={data} />
        </div>

        {/* Resumo Geral */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted mb-3 tracking-wider">
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
          <h2 className="text-sm font-semibold text-muted mb-3 tracking-wider">
            DETALHAMENTO DIARIO
          </h2>
          <DailyTable data={data.dailyData} />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-subtle py-4 border-t border-border">
          Dashboard Evento Presencial &mdash; Dados via Google Sheets
        </footer>
      </div>
    </>
  );
}
