import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { EventoMetrics } from "@/types/metrics";
import { formatBRL, formatInt, formatROAS } from "@/lib/format";

interface BreakdownChartsProps {
  metrics: EventoMetrics;
}

const BRAND_PRIMARY = "#2D5A3D";
const BRAND_SECONDARY = "#4A7C59";
const BRAND_LIGHT = "#E8F5E9";
const BRAND_GRAY_MED = "#9E9E9E";

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #9E9E9E",
  borderRadius: 8,
  fontSize: 12,
  color: "#1A1A1A",
};

export default function BreakdownCharts({ metrics }: BreakdownChartsProps) {
  const vendasData = [
    { name: "Ads", value: metrics.vendasAds },
    { name: "Orgânico", value: metrics.vendasOrganico },
    { name: "SMART → Presencial", value: metrics.vendasSmartPresencial },
  ].filter((d) => d.value > 0);

  const vendasColors = [BRAND_PRIMARY, BRAND_SECONDARY, BRAND_LIGHT];

  const faturamentoData = [
    { name: "Ads", value: metrics.faturamentoAds },
    { name: "Orgânico", value: metrics.faturamentoOrganico },
    { name: "SMART", value: metrics.faturamentoSmart },
    { name: "Ingressos", value: metrics.faturamentoIngressos },
  ];

  const roasData = [
    { name: "ROAS Ads", value: Number(metrics.roasAds.toFixed(2)) },
    { name: "ROAS Geral", value: Number(metrics.roasGeral.toFixed(2)) },
  ];

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-brand-text">
        Distribuição de Performance
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Vendas por canal - Pie */}
        <div className="rounded-xl border border-brand-gray-med/30 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-brand-gray-dark">
            Vendas por Canal
          </h3>
          {vendasData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-brand-gray-med">
              Sem vendas registradas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={vendasData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  label={({ name, value }) => `${name}: ${formatInt(value as number)}`}
                >
                  {vendasData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={vendasColors[idx % vendasColors.length]}
                      stroke={
                        vendasColors[idx % vendasColors.length] === BRAND_LIGHT
                          ? BRAND_PRIMARY
                          : "#FFFFFF"
                      }
                      strokeWidth={vendasColors[idx % vendasColors.length] === BRAND_LIGHT ? 1.5 : 2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [formatInt(Number(value) || 0), "Vendas"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Faturamento por fonte - Bar */}
        <div className="rounded-xl border border-brand-gray-med/30 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-brand-gray-dark">
            Faturamento por Fonte
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={faturamentoData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: BRAND_GRAY_MED }}
                axisLine={{ stroke: BRAND_GRAY_MED }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: BRAND_GRAY_MED }}
                axisLine={{ stroke: BRAND_GRAY_MED }}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatBRL(Number(value) || 0), "Faturamento"]}
                cursor={{ fill: BRAND_LIGHT }}
              />
              <Bar dataKey="value" fill={BRAND_PRIMARY} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS comparison - Bar */}
        <div className="rounded-xl border border-brand-gray-med/30 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-brand-gray-dark">
            Comparativo de ROAS
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={roasData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: BRAND_GRAY_MED }}
                axisLine={{ stroke: BRAND_GRAY_MED }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: BRAND_GRAY_MED }}
                axisLine={{ stroke: BRAND_GRAY_MED }}
                tickLine={false}
                tickFormatter={(v) => `${v}x`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatROAS(Number(value) || 0), "ROAS"]}
                cursor={{ fill: BRAND_LIGHT }}
              />
              <Bar dataKey="value" fill={BRAND_SECONDARY} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
