import { DailyData } from "@/types/metrics";
import {
  formatBRL,
  formatInt,
  formatROAS,
  formatDateBR,
} from "@/lib/format";

interface DailyTableProps {
  dailyData: DailyData[];
}

export default function DailyTable({ dailyData }: DailyTableProps) {
  const rows = dailyData.filter(
    (d) =>
      d.investimentoTotal > 0 ||
      d.vendasTotal > 0 ||
      d.faturamentoTotal > 0 ||
      d.confirmados > 0
  );

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-brand-text">
        Desempenho Diário
      </h2>
      <div className="overflow-hidden rounded-xl border border-brand-gray-med/30 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-brand-primary text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Data</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Investimento
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Confirmados
                </th>
                <th className="px-4 py-3 text-right font-semibold">Vendas</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Faturamento
                </th>
                <th className="px-4 py-3 text-right font-semibold">Lucro</th>
                <th className="px-4 py-3 text-right font-semibold">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-brand-gray-med"
                  >
                    Nenhum dia com atividade registrada.
                  </td>
                </tr>
              ) : (
                rows.map((d, i) => {
                  const lucroColor =
                    d.lucroTotal > 0
                      ? "text-brand-success"
                      : d.lucroTotal < 0
                      ? "text-brand-error"
                      : "text-brand-text";
                  const roasColor =
                    d.roasGeral >= 1
                      ? "text-brand-success"
                      : "text-brand-error";
                  const zebra = i % 2 === 0 ? "bg-white" : "bg-brand-gray-bg";
                  return (
                    <tr
                      key={d.date + i}
                      className={`${zebra} border-t border-brand-gray-med/20 transition-colors hover:bg-brand-light`}
                    >
                      <td className="px-4 py-3 font-medium text-brand-text">
                        {formatDateBR(d.date)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-brand-text">
                        {formatBRL(d.investimentoTotal)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-brand-text">
                        {formatInt(d.confirmados)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-brand-text">
                        {formatInt(d.vendasTotal)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-brand-text">
                        {formatBRL(d.faturamentoTotal)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right tabular-nums font-semibold ${lucroColor}`}
                      >
                        {formatBRL(d.lucroTotal)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right tabular-nums font-semibold ${roasColor}`}
                      >
                        {formatROAS(d.roasGeral)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
