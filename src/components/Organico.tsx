import type { OrganicoFontes, OrganicoSourceRow } from '@/types/metrics';

interface OrganicoProps {
  data: OrganicoFontes;
}

const fmt = (n: number) => (n === 0 ? '' : n.toLocaleString('pt-BR'));

const cellsForRow = (r: OrganicoSourceRow): { value: number; key: string }[] => [
  { key: 'edson', value: r.edson },
  { key: 'ellid', value: r.ellid },
  { key: 'geovana', value: r.geovana },
  { key: 'stories', value: r.stories },
  { key: 'directAutomacao', value: r.directAutomacao },
  { key: 'feed', value: r.feed },
  { key: 'bio', value: r.bio },
  { key: 'pulmonautas', value: r.pulmonautas },
  { key: 'youtube', value: r.youtube },
  { key: 'extra', value: r.extra },
];

export default function Organico({ data }: OrganicoProps) {
  const { soma, rows } = data;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-heading font-semibold text-foreground">Resumo Orgânico</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Comercial e Mídias — replica fiel da aba <code className="text-xs bg-muted px-1.5 py-0.5 rounded">ABR - METRICAS GERAIS</code> (KV3:LF30)
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* Cabeçalho do bloco */}
          <thead>
            <tr className="bg-foreground text-background">
              <th colSpan={11} className="px-4 py-3 text-center font-heading font-bold tracking-wide">
                RESUMO ORGÂNICO (Comercial e Mídias)
              </th>
            </tr>
            {/* Grupos: SS / INSTAGRAM / YOUTUBE / EXTRA */}
            <tr className="bg-foreground/90 text-background text-xs">
              <th className="px-3 py-2 border border-border/30"></th>
              <th colSpan={3} className="px-3 py-2 text-center font-heading border border-border/30">SS</th>
              <th colSpan={5} className="px-3 py-2 text-center font-heading border border-border/30">INSTAGRAM</th>
              <th rowSpan={2} className="px-3 py-2 text-center font-heading border border-border/30 align-middle">YOUTUBE</th>
              <th rowSpan={2} className="px-3 py-2 text-center font-heading border border-border/30 align-middle">EXTRA</th>
            </tr>
            {/* Sub-cabeçalho com nome de cada fonte */}
            <tr className="bg-foreground/80 text-background text-xs">
              <th className="px-3 py-2 text-left font-heading border border-border/30">FONTES</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Edson</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Ellid</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Geovana</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Stories</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Direct - Automação</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Feed</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Bio</th>
              <th className="px-3 py-2 text-center font-heading border border-border/30">Pulmonautas</th>
            </tr>
          </thead>
          <tbody>
            {/* Linha SOMA */}
            <tr className="bg-muted/40 font-semibold">
              <td className="px-3 py-3 text-left border border-border/40">SOMA</td>
              {cellsForRow(soma).map((c) => (
                <td key={c.key} className="px-3 py-3 text-center tabular-nums border border-border/40">
                  {fmt(c.value)}
                </td>
              ))}
            </tr>
            {/* Linhas por data */}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                  Sem dados disponíveis na planilha.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.data} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-left font-medium border border-border/30">{r.data}</td>
                  {cellsForRow(r).map((c) => (
                    <td key={c.key} className="px-3 py-2 text-center tabular-nums border border-border/30">
                      {fmt(c.value)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
