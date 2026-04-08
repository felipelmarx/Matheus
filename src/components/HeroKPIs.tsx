import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  PiggyBank,
  Target,
  Receipt,
  LucideIcon,
} from "lucide-react";
import { EventoMetrics } from "@/types/metrics";
import { formatBRL, formatInt, formatROAS } from "@/lib/format";

interface HeroKPIsProps {
  metrics: EventoMetrics;
}

interface KPICardProps {
  label: string;
  value: string;
  Icon: LucideIcon;
  tone?: "default" | "success" | "error";
}

function KPICard({ label, value, Icon, tone = "default" }: KPICardProps) {
  const toneClass =
    tone === "success"
      ? "text-brand-success"
      : tone === "error"
      ? "text-brand-error"
      : "text-brand-text";

  return (
    <div className="relative rounded-xl border border-brand-gray-med/30 bg-white p-6 shadow-sm transition-all hover:border-brand-primary/40 hover:shadow-md">
      <div className="absolute right-4 top-4 rounded-lg bg-brand-light p-2">
        <Icon className="h-5 w-5 text-brand-primary" strokeWidth={2} />
      </div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-gray-dark">
        {label}
      </div>
      <div className={`text-3xl font-bold tracking-tight ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

export default function HeroKPIs({ metrics }: HeroKPIsProps) {
  const lucroTone =
    metrics.totalLucro > 0
      ? "success"
      : metrics.totalLucro < 0
      ? "error"
      : "default";

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-brand-text">Visão Geral</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard
          label="Investimento Total"
          value={formatBRL(metrics.totalInvestimento)}
          Icon={TrendingUp}
        />
        <KPICard
          label="Vendas Totais"
          value={formatInt(metrics.totalVendas)}
          Icon={ShoppingCart}
        />
        <KPICard
          label="Faturamento Total"
          value={formatBRL(metrics.totalFaturamento)}
          Icon={DollarSign}
        />
        <KPICard
          label="Lucro Total"
          value={formatBRL(metrics.totalLucro)}
          Icon={PiggyBank}
          tone={lucroTone}
        />
        <KPICard
          label="ROAS Geral"
          value={formatROAS(metrics.roasGeral)}
          Icon={Target}
        />
        <KPICard
          label="Ticket Médio"
          value={formatBRL(metrics.ticketMedioGeral)}
          Icon={Receipt}
        />
      </div>
    </section>
  );
}
