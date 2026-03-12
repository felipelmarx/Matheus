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
      <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-8 text-center">
        <p className="text-slate-400 text-sm">
          Nenhum dado diario registrado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-white">
          Detalhamento Diario
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-2 text-slate-400 font-medium">
                Data
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Invest.
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Inscritos
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Vendas Ads
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Organicas
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Cortesias
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                CPA
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Ticket
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Fatur.
              </th>
              <th className="text-right px-4 py-2 text-slate-400 font-medium">
                Lucro
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.date}
                className={`border-b border-slate-800/50 ${
                  i % 2 === 0 ? 'bg-slate-900/30' : ''
                } hover:bg-slate-800/30 transition-colors`}
              >
                <td className="px-4 py-2 text-slate-300 font-mono">
                  {row.date}
                </td>
                <td className="text-right px-4 py-2 text-slate-300 font-mono">
                  {BRL.format(row.investimento)}
                </td>
                <td className="text-right px-4 py-2 text-slate-300 font-mono">
                  {row.inscritosTotal}
                </td>
                <td className="text-right px-4 py-2 text-slate-300 font-mono">
                  {row.vendasAds}
                </td>
                <td className="text-right px-4 py-2 text-slate-300 font-mono">
                  {row.vendasOrganicas}
                </td>
                <td className="text-right px-4 py-2 text-slate-300 font-mono">
                  {row.ingressosCortesias}
                </td>
                <td className="text-right px-4 py-2 text-slate-300 font-mono">
                  {BRL.format(row.cpa)}
                </td>
                <td className="text-right px-4 py-2 text-slate-300 font-mono">
                  {BRL.format(row.ticketMedio)}
                </td>
                <td className="text-right px-4 py-2 text-emerald-400 font-mono font-bold">
                  {BRL.format(row.faturamento)}
                </td>
                <td
                  className={`text-right px-4 py-2 font-mono font-bold ${
                    row.lucroPrejuizo >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
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
