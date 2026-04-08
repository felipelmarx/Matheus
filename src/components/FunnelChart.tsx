import { EventoMetrics } from "@/types/metrics";
import { formatInt, formatPct } from "@/lib/format";

interface FunnelChartProps {
  metrics: EventoMetrics;
}

interface Stage {
  label: string;
  value: number;
  conversionLabel?: string;
}

export default function FunnelChart({ metrics }: FunnelChartProps) {
  const stages: Stage[] = [
    {
      label: "Impressões",
      value: metrics.totalImpressoes,
    },
    {
      label: "Cliques",
      value: metrics.totalCliques,
      conversionLabel:
        metrics.totalImpressoes > 0
          ? `CTR ${formatPct((metrics.totalCliques / metrics.totalImpressoes) * 100)}`
          : undefined,
    },
    {
      label: "Views Página",
      value: metrics.totalViews,
      conversionLabel:
        metrics.totalCliques > 0
          ? `${formatPct((metrics.totalViews / metrics.totalCliques) * 100)} dos cliques`
          : undefined,
    },
    {
      label: "Checkouts",
      value: metrics.totalCheckouts,
      conversionLabel:
        metrics.totalViews > 0
          ? `${formatPct((metrics.totalCheckouts / metrics.totalViews) * 100)} das views`
          : undefined,
    },
    {
      label: "Vendas",
      value: metrics.totalVendas,
      conversionLabel:
        metrics.totalCheckouts > 0
          ? `${formatPct((metrics.totalVendas / metrics.totalCheckouts) * 100)} dos checkouts`
          : undefined,
    },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  // Opacity gradient from light to primary
  const opacities = [0.45, 0.6, 0.72, 0.86, 1];

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-brand-text">
        Funil de Conversão
      </h2>
      <div className="rounded-xl border border-brand-gray-med/30 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const widthPct = Math.max((stage.value / maxValue) * 100, 8);
            return (
              <div key={stage.label} className="group">
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-brand-text">
                    {stage.label}
                  </span>
                  {stage.conversionLabel && (
                    <span className="text-xs font-medium text-brand-gray-med">
                      {stage.conversionLabel}
                    </span>
                  )}
                </div>
                <div className="relative h-12 w-full rounded-lg bg-brand-gray-bg">
                  <div
                    className="flex h-full items-center justify-end rounded-lg px-4 transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: "#2D5A3D",
                      opacity: opacities[i],
                    }}
                  >
                    <span className="text-sm font-bold text-white">
                      {formatInt(stage.value)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
