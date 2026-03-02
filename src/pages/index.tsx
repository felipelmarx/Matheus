import React, { useEffect, useState, useCallback } from 'react';
import type { DashboardData, MetricCard as MetricCardType } from '@/types/metrics';
import MetricCard from '@/components/MetricCard';
import { RefreshCw, Calendar, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = force ? '/api/metrics?refresh=true' : '/api/metrics';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Falha ao carregar dados');
      const newData: DashboardData = await res.json();
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

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const metricsCards: MetricCardType[] = data
    ? [
        { id: 'investimento', label: 'Investimento', value: BRL.format(data.investimento) },
        { id: 'faturamento', label: 'Faturamento', value: BRL.format(data.faturamento) },
        { id: 'vendas', label: 'Vendas', value: data.vendas.toLocaleString('pt-BR') },
        { id: 'cpa', label: 'CPA', value: BRL.format(data.cpa) },
        { id: 'ticket', label: 'Ticket Medio', value: BRL.format(data.ticketMedio) },
      ]
    : [];

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-red-800 font-semibold mb-2 text-center">Erro ao carregar dados</h2>
          <p className="text-red-700 text-sm mb-4 text-center">{error}</p>
          <button
            onClick={() => fetchData(true)}
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
              {data && (
                <p className="text-gray-600 mt-1">
                  {data.desafioAtual}{data.periodo ? ` \u2014 ${data.periodo}` : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchData(true)}
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
              <span>Ultima atualizacao: {lastRefresh.toLocaleString('pt-BR')}</span>
              {data?.fromCache && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-2">cache</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !data ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {metricsCards.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
