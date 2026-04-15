import type { SimuladorOutputs } from '@/hooks/useSimulador';

interface SimuladorKPIsProps {
  outputs: SimuladorOutputs;
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

interface CardProps {
  label: string;
  value: string;
  valueColor?: string;
  gradient?: string;
  border?: string;
  sublabel?: string;
  badge?: string;
}

function Card({ label, value, valueColor = 'text-foreground', gradient = 'from-card to-card/80', border = 'border-border', sublabel, badge }: CardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border ${border} rounded-xl p-4 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-heading">
          {label}
        </p>
        {badge && (
          <span
            className="text-[8px] uppercase tracking-wider font-heading font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded px-1.5 py-0.5"
            title="Calculado automaticamente"
          >
            {badge}
          </span>
        )}
      </div>
      <p className={`text-lg font-bold font-mono ${valueColor}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[9px] font-mono text-muted-foreground mt-1">
          {sublabel}
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-${color}/30`} />
      <p className={`text-[10px] uppercase tracking-widest font-heading font-bold ${color === 'blue-500' ? 'text-blue-400' : color === 'amber-500' ? 'text-amber-400' : 'text-emerald-400'}`}>
        {title}
      </p>
      <div className={`h-px flex-1 bg-gradient-to-l from-transparent to-${color}/30`} />
    </div>
  );
}

export default function SimuladorKPIs({ outputs }: SimuladorKPIsProps) {
  const liquidoPositivo = outputs.investimentoLiquido <= 0;
  const tmCacHealthy = outputs.tmCac >= 1;
  const roiPositivo = outputs.roi >= 0;
  const roasPositivo = outputs.roas >= 1;
  const lucroPositivo = outputs.lucro >= 0;

  return (
    <div className="space-y-4">
      {/* ─── KPI HERO ─── */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40 rounded-xl p-5 transition-all hover:scale-[1.01]">
        <p className="text-[10px] uppercase tracking-widest text-primary font-heading font-bold mb-1">
          KPI Principal — Custo / Venda Formacao
        </p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <p className="text-3xl font-bold font-mono text-foreground">
            {BRL.format(outputs.custoVendaFormacao)}
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            Investimento Liquido / Vendas Formacao ({outputs.vendasFormacao})
          </p>
        </div>
      </div>

      {/* ─── INVESTIMENTO ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/30" />
          <p className="text-[10px] uppercase tracking-widest font-heading font-bold text-blue-400">
            Investimento
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/30" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card
            label="Trafego (Ads)"
            value={BRL.format(outputs.investimentoTrafego)}
            valueColor="text-blue-400"
            gradient="from-blue-500/15 to-blue-600/5"
            border="border-blue-500/30"
          />
          <Card
            label="API (Lembretes)"
            value={BRL.format(outputs.investimentoApi)}
            valueColor="text-blue-300"
            gradient="from-blue-500/10 to-blue-600/5"
            border="border-blue-500/20"
            badge="auto"
          />
          <Card
            label="Bruto"
            value={BRL.format(outputs.investimentoBruto)}
            valueColor="text-blue-400"
            gradient="from-blue-500/15 to-blue-600/5"
            border="border-blue-500/30"
          />
          <Card
            label="Liquido"
            value={BRL.format(outputs.investimentoLiquido)}
            valueColor={liquidoPositivo ? 'text-emerald-400' : 'text-amber-400'}
            gradient={liquidoPositivo ? 'from-emerald-500/15 to-emerald-600/5' : 'from-amber-500/15 to-amber-600/5'}
            border={liquidoPositivo ? 'border-emerald-500/30' : 'border-amber-500/30'}
          />
        </div>
      </div>

      {/* ─── VOLUME & CUSTO ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/30" />
          <p className="text-[10px] uppercase tracking-widest font-heading font-bold text-amber-400">
            Volume &amp; Custo
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/30" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card
            label="Inscritos Totais"
            value={outputs.inscritosTotais.toLocaleString('pt-BR')}
            valueColor="text-amber-300"
            gradient="from-amber-500/10 to-amber-600/5"
            border="border-amber-500/20"
            sublabel={`${outputs.vendas.toLocaleString('pt-BR')} pagos + ${outputs.leadsCortesia.toLocaleString('pt-BR')} cortesia`}
          />
          <Card
            label="Vendas Formacao"
            value={outputs.vendasFormacao.toLocaleString('pt-BR')}
            valueColor="text-violet-400"
            gradient="from-violet-500/10 to-violet-600/5"
            border="border-violet-500/20"
          />
          <Card
            label="CPA (Trafego / Vendas)"
            value={BRL.format(outputs.cpa)}
            valueColor="text-cyan-300"
            gradient="from-cyan-500/10 to-cyan-600/5"
            border="border-cyan-500/20"
          />
          <Card
            label="TM Formacao"
            value={BRL.format(outputs.vendasFormacao > 0 ? outputs.faturamentoFormacao / outputs.vendasFormacao : 0)}
            valueColor="text-violet-300"
            gradient="from-violet-500/10 to-violet-600/5"
            border="border-violet-500/20"
          />
        </div>
      </div>

      {/* ─── RESULTADO ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/30" />
          <p className="text-[10px] uppercase tracking-widest font-heading font-bold text-emerald-400">
            Resultado
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/30" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card
            label="Faturamento Total"
            value={BRL.format(outputs.faturamentoTotal)}
            valueColor="text-emerald-400"
            gradient="from-emerald-500/10 to-emerald-600/5"
            border="border-emerald-500/20"
          />
          <Card
            label="Lucro"
            value={BRL.format(outputs.lucro)}
            valueColor={lucroPositivo ? 'text-emerald-400' : 'text-red-400'}
            gradient={lucroPositivo ? 'from-emerald-500/15 to-emerald-600/5' : 'from-red-500/15 to-red-600/5'}
            border={lucroPositivo ? 'border-emerald-500/30' : 'border-red-500/30'}
          />
          <Card
            label="ROI"
            value={`${outputs.roi.toFixed(1)}%`}
            valueColor={roiPositivo ? 'text-indigo-400' : 'text-red-400'}
            gradient={roiPositivo ? 'from-indigo-500/10 to-indigo-600/5' : 'from-red-500/10 to-red-600/5'}
            border={roiPositivo ? 'border-indigo-500/20' : 'border-red-500/20'}
          />
          <Card
            label="ROAS"
            value={`${outputs.roas.toFixed(2)}x`}
            valueColor={roasPositivo ? 'text-indigo-400' : 'text-red-400'}
            gradient={roasPositivo ? 'from-indigo-500/10 to-indigo-600/5' : 'from-red-500/10 to-red-600/5'}
            border={roasPositivo ? 'border-indigo-500/20' : 'border-red-500/20'}
          />
          <Card
            label="TM / CAC"
            value={`${outputs.tmCac.toFixed(2)}x`}
            valueColor={tmCacHealthy ? 'text-indigo-400' : 'text-red-400'}
            gradient={tmCacHealthy ? 'from-indigo-500/10 to-indigo-600/5' : 'from-red-500/10 to-red-600/5'}
            border={tmCacHealthy ? 'border-indigo-500/20' : 'border-red-500/20'}
          />
        </div>
      </div>
    </div>
  );
}
