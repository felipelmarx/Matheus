import React, { useEffect, useState } from 'react';
import { DashboardData, MetricCard as MetricCardType } from '@/types/metrics';
import MetricCard from '@/components/MetricCard';
import PerformerCard from '@/components/PerformerCard';
import { RefreshCw, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/metrics');

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const newData = await response.json();
      setData(newData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const metricsCards: MetricCardType[] = data
    ? [
        {
          id: 'invested',
          label: 'Valor Investido',
          value: data.investedValue,
          unit: 'R$',
          change: 12,
          changeType: 'increase',
        },
        {
          id: 'sales',
          label: 'Número de Vendas',
          value: data.salesCount,
          change: 8,
          changeType: 'increase',
        },
        {
          id: 'cpa',
          label: 'CPA (Custo por Aquisição)',
          value: data.cpa.toFixed(2),
          unit: 'R$',
          change: 3,
          changeType: 'decrease',
        },
      ]
    : [];

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Erro ao carregar dados</h2>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Desafio 5D</h1>
              <p className="text-gray-600 mt-1">Dashboard de Métricas</p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {lastRefresh && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
              <Calendar className="w-4 h-4" />
              <span>Última atualização: {lastRefresh.toLocaleString('pt-BR')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !data ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics Section */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Principais Métricas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metricsCards.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            </section>

            {/* Best Performers Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Best Ads */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Melhores Anúncios</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data?.bestAds.map((ad) => (
                    <PerformerCard key={ad.id} performer={ad} type="ad" />
                  ))}
                </div>
              </section>

              {/* Best Pages */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Melhores Páginas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data?.bestPages.map((page) => (
                    <PerformerCard key={page.id} performer={page} type="page" />
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
