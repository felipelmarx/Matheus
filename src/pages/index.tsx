import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import EventSelector from "@/components/EventSelector";
import HeroKPIs from "@/components/HeroKPIs";
import FunnelChart from "@/components/FunnelChart";
import BreakdownCharts from "@/components/BreakdownCharts";
import DailyTable from "@/components/DailyTable";
import { getEnabledEvents, getDefaultEvent } from "@/config/events";
import { SingleEventResponse } from "@/types/metrics";

export default function Home() {
  const events = getEnabledEvents();
  const defaultEvent = getDefaultEvent();

  const [selectedId, setSelectedId] = useState<string>(defaultEvent?.id ?? "");
  const [data, setData] = useState<SingleEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/metrics?event=${encodeURIComponent(eventId)}`
      );
      if (!res.ok) {
        throw new Error(`Falha ao carregar métricas (HTTP ${res.status})`);
      }
      const json: SingleEventResponse = await res.json();
      setData(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedId);
  }, [selectedId, fetchData]);

  const lastUpdated = data?.event.metrics.lastUpdated
    ? new Date(data.event.metrics.lastUpdated).toLocaleString("pt-BR")
    : undefined;

  return (
    <>
      <Head>
        <title>iBreathwork — Dashboard Evento Presencial</title>
        <meta
          name="description"
          content="Dashboard de métricas do evento presencial iBreathwork"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout lastUpdated={lastUpdated}>
        <EventSelector
          events={events}
          selectedId={selectedId}
          onChange={setSelectedId}
        />

        {loading && <LoadingSkeleton />}

        {error && !loading && (
          <ErrorBlock
            message={error}
            onRetry={() => fetchData(selectedId)}
          />
        )}

        {!loading && !error && data && (
          <>
            <HeroKPIs metrics={data.event.metrics} />
            <FunnelChart metrics={data.event.metrics} />
            <BreakdownCharts metrics={data.event.metrics} />
            <DailyTable dailyData={data.event.metrics.dailyData} />
          </>
        )}
      </Layout>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-brand-gray-med/20 bg-brand-light"
          />
        ))}
      </div>
      <div className="h-80 rounded-xl border border-brand-gray-med/20 bg-brand-light" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-xl border border-brand-gray-med/20 bg-brand-light" />
        <div className="h-72 rounded-xl border border-brand-gray-med/20 bg-brand-light" />
        <div className="h-72 rounded-xl border border-brand-gray-med/20 bg-brand-light" />
      </div>
      <div className="h-96 rounded-xl border border-brand-gray-med/20 bg-brand-light" />
    </div>
  );
}

function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-brand-error/30 bg-white p-8 text-center shadow-sm">
      <h3 className="mb-2 text-lg font-bold text-brand-error">
        Não foi possível carregar os dados
      </h3>
      <p className="mb-6 text-sm text-brand-gray-dark">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-brand-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
      >
        Tentar novamente
      </button>
    </div>
  );
}
