import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { RefreshCw } from "lucide-react";
import Layout from "@/components/Layout";
import EventSelector from "@/components/EventSelector";
import HeroKPIs from "@/components/HeroKPIs";
import FunnelChart from "@/components/FunnelChart";
import BreakdownCharts from "@/components/BreakdownCharts";
import DailyTable from "@/components/DailyTable";
import TabNav from "@/components/TabNav";
import ComercialTab from "@/components/ComercialTab";
import { getEnabledEvents, getDefaultEvent } from "@/config/events";
import { SingleEventResponse } from "@/types/metrics";

type TabId = "dashboard" | "comercial";

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "comercial", label: "Comercial" },
];

export default function Home() {
  const events = getEnabledEvents();
  const defaultEvent = getDefaultEvent();

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [selectedId, setSelectedId] = useState<string>(defaultEvent?.id ?? "");
  const [data, setData] = useState<SingleEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (eventId: string, force = false) => {
      if (!eventId) return;
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const params = new URLSearchParams({ event: eventId });
        if (force) params.set("refresh", "true");
        const res = await fetch(`/api/metrics?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Falha ao carregar métricas (HTTP ${res.status})`);
        }
        const json: SingleEventResponse = await res.json();
        setData(json);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        if (!force) setData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

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
        <TabNav
          tabs={TABS}
          active={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />

        {activeTab === "dashboard" && (
          <div
            id="panel-dashboard"
            role="tabpanel"
            aria-labelledby="tab-dashboard"
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <EventSelector
                events={events}
                selectedId={selectedId}
                onChange={setSelectedId}
              />
              <button
                type="button"
                onClick={() => fetchData(selectedId, true)}
                disabled={loading || refreshing || !selectedId}
                aria-label="Atualizar dados da planilha"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-brand-primary shadow-sm transition-colors hover:bg-brand-light hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
              >
                <RefreshCw
                  className={[
                    "h-4 w-4",
                    refreshing ? "animate-spin" : "",
                  ].join(" ")}
                  aria-hidden="true"
                />
                {refreshing ? "Atualizando..." : "Atualizar"}
              </button>
            </div>

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
          </div>
        )}

        {activeTab === "comercial" && (
          <div
            id="panel-comercial"
            role="tabpanel"
            aria-labelledby="tab-comercial"
          >
            <ComercialTab />
          </div>
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
