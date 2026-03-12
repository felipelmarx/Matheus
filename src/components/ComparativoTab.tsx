import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { EventoMetrics, MultiEventResponse, EventData } from '@/types/metrics';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface KpiDef {
  label: string;
  key: keyof EventoMetrics;
  format: (v: number) => string;
  positiveIsGood?: boolean;
}

const KPI_DEFINITIONS: KpiDef[] = [
  { label: 'Faturamento', key: 'totalFaturamento', format: (v) => BRL.format(v), positiveIsGood: true },
  { label: 'Lucro / Prejuízo', key: 'totalLucroPrejuizo', format: (v) => BRL.format(v), positiveIsGood: true },
  { label: 'Investimento', key: 'totalInvestimento', format: (v) => BRL.format(v) },
  { label: 'Inscritos', key: 'totalInscritos', format: (v) => v.toLocaleString('pt-BR'), positiveIsGood: true },
  { label: 'Total Vendas', key: 'totalVendas', format: (v) => v.toLocaleString('pt-BR'), positiveIsGood: true },
  { label: 'Vendas Ads', key: 'totalVendasAds', format: (v) => v.toLocaleString('pt-BR') },
  { label: 'Vendas Orgânicas', key: 'totalVendasOrganicas', format: (v) => v.toLocaleString('pt-BR') },
  { label: 'CPA Médio', key: 'cpaMedio', format: (v) => BRL.format(v), positiveIsGood: false },
  { label: 'Ticket Médio', key: 'ticketMedio', format: (v) => BRL.format(v), positiveIsGood: true },
  { label: 'ROI', key: 'roi', format: (v) => `${v.toFixed(1)}%`, positiveIsGood: true },
];

export default function ComparativoTab() {
  const [data, setData] = useState<EventData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/metrics?event=all');
        if (!res.ok) throw new Error('Falha ao carregar dados comparativos');
        const json: MultiEventResponse = await res.json();
        setData(json.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-8 text-center">
        <p className="text-red-400 text-sm">{error || 'Erro ao carregar'}</p>
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-12 text-center">
        <p className="text-muted text-sm">
          O comparativo estará disponível quando houver dados de mais de um evento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-fg">
          Comparativo de Eventos
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-muted font-medium">KPI</th>
              {data.map((ev) => (
                <th key={ev.eventId} className="text-right px-4 py-3 text-muted font-medium">
                  {ev.eventLabel}
                </th>
              ))}
              {data.length === 2 && (
                <th className="text-right px-4 py-3 text-muted font-medium">Variação</th>
              )}
            </tr>
          </thead>
          <tbody>
            {KPI_DEFINITIONS.map((kpi) => {
              const values = data.map((ev) => ev.metrics[kpi.key] as number);
              const showVariation = data.length === 2 && values[0] !== 0;
              const variation = showVariation
                ? ((values[1] - values[0]) / Math.abs(values[0])) * 100
                : null;

              return (
                <tr
                  key={kpi.key}
                  className="border-b border-border/50 hover:bg-row-hover transition-colors"
                >
                  <td className="px-4 py-2.5 text-muted">{kpi.label}</td>
                  {values.map((val, i) => (
                    <td
                      key={data[i].eventId}
                      className="text-right px-4 py-2.5 text-fg font-mono"
                    >
                      {kpi.format(val)}
                    </td>
                  ))}
                  {data.length === 2 && (
                    <td className="text-right px-4 py-2.5 font-mono">
                      {variation !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            variation > 0
                              ? kpi.positiveIsGood !== false
                                ? 'text-emerald-500'
                                : 'text-red-500'
                              : variation < 0
                              ? kpi.positiveIsGood !== false
                                ? 'text-red-500'
                                : 'text-emerald-500'
                              : 'text-muted'
                          }`}
                        >
                          {variation > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : variation < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          {variation > 0 ? '+' : ''}
                          {variation.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
