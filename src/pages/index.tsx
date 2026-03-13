import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { RefreshCw, Calendar, Loader2, Sun, Moon } from 'lucide-react';
import { EventoMetrics } from '@/types/metrics';
import { EVENTS, getEventById } from '@/config/events';
import StatCards from '@/components/StatCards';
import ResumoGeral from '@/components/ResumoGeral';
import DailyTable from '@/components/DailyTable';
import ChartSection from '@/components/ChartSection';
import TabNavigation, { TabId } from '@/components/TabNavigation';
import EventPlaceholder from '@/components/EventPlaceholder';
import ComparativoTab from '@/components/ComparativoTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>(EVENTS[0].id);
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

  const fetchData = useCallback(async (eventId: string, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ event: eventId });
      if (forceRefresh) params.set('refresh', 'true');
      const res = await fetch(`/api/metrics?${params}`);
      if (!res.ok) throw new Error('Falha ao carregar dados');
      const json = await res.json();
      if (json.placeholder) {
        setData(null);
      } else {
        setData(json as EventoMetrics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'comparativo') {
      const cfg = getEventById(activeTab);
      if (cfg?.enabled) {
        fetchData(activeTab);
      } else {
        setLoading(false);
        setData(null);
      }
    }
  }, [activeTab, fetchData]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab !== 'comparativo') {
      setData(null);
      setError(null);
    }
  };

  const currentEvent = getEventById(activeTab);
  const headerLabel = currentEvent?.dateLabel || currentEvent?.label || '';

  const renderContent = () => {
    if (activeTab === 'comparativo') {
      return <ComparativoTab />;
    }

    if (currentEvent && !currentEvent.enabled) {
      return <EventPlaceholder label={currentEvent.label} />;
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error || 'Erro ao carregar'}</p>
          <button
            onClick={() => fetchData(activeTab, true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6">
          <StatCards data={data} />
        </div>
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted mb-3 tracking-wider">
            RESUMO GERAL
          </h2>
          <ResumoGeral data={data} />
        </div>
        <div className="mb-6">
          <ChartSection data={data.dailyData} />
        </div>
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted mb-3 tracking-wider">
            DETALHAMENTO DIÁRIO
          </h2>
          <DailyTable data={data.dailyData} />
        </div>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Evento Presencial - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-fg flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Evento Presencial
              {activeTab !== 'comparativo' && headerLabel ? ` - ${headerLabel}` : ''}
            </h1>
            {data?.lastUpdated && activeTab !== 'comparativo' && (
              <p className="text-xs text-muted-strong mt-1">
                Atualizado: {new Date(data.lastUpdated).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 bg-surface border border-card-border rounded-lg hover:bg-surface-hover transition-colors"
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            {activeTab !== 'comparativo' && currentEvent?.enabled && (
              <button
                onClick={() => fetchData(activeTab, true)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-surface border border-card-border rounded-lg hover:bg-surface-hover transition-colors text-xs text-muted"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Content */}
        <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-subtle py-4 border-t border-border mt-8">
          Dashboard Evento Presencial &mdash; Dados via Google Sheets
        </footer>
      </div>
    </>
  );
}
