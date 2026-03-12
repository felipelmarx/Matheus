import { DailyData } from '@/types/metrics';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface DailyTableProps {
  data: DailyData[];
}

export default function DailyTable({ data }: DailyTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-xl p-8 text-center">
        <p className="text-muted text-sm">
          Nenhum dado diario registrado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-fg">
          Detalhamento Diario
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-muted font-medium">
                Data
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Invest.
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Inscritos
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Vendas Ads
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Organicas
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Cortesias
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                CPA
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Ticket
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Fatur.
              </th>
              <th className="text-right px-4 py-2 text-muted font-medium">
                Lucro
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.date}
                className={`border-b border-border/50 ${
                  i % 2 === 0 ? 'bg-[var(--stripe)]' : ''
                } hover:bg-[var(--row-hover)] transition-colors`}
              >
                <td className="px-4 py-2 text-fg font-mono">
                  {row.date}
                </td>
                <td className="text-right px-4 py-2 text-fg font-mono">
                  {BRL.format(row.investimento)}
                </td>
                <td className="text-right px-4 py-2 text-fg font-mono">
                  {row.inscritosTotal}
                </td>
                <td className="text-right px-4 py-2 text-fg font-mono">
                  {row.vendasAds}
                </td>
                <td className="text-right px-4 py-2 text-fg font-mono">
                  {row.vendasOrganicas}
                </td>
                <td className="text-right px-4 py-2 text-fg font-mono">
                  {row.ingressosCortesias}
                </td>
                <td className="text-right px-4 py-2 text-fg font-mono">
                  {BRL.format(row.cpa)}
                </td>
                <td className="text-right px-4 py-2 text-fg font-mono">
                  {BRL.format(row.ticketMedio)}
                </td>
                <td className="text-right px-4 py-2 text-emerald-500 font-mono font-bold">
                  {BRL.format(row.faturamento)}
                </td>
                <td
                  className={`text-right px-4 py-2 font-mono font-bold ${
                    row.lucroPrejuizo >= 0
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}
                >
                  {BRL.format(row.lucroPrejuizo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
