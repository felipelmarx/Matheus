import { Film, ImageIcon, ExternalLink, Megaphone } from 'lucide-react';

interface Anuncio {
  rank: number;
  nome: string;
  arquivo: string;
  tipo: 'video' | 'imagem';
  vendas: number;
  cpa: number;
  link: string;
}

export default function ListaAnuncios() {
  // Placeholder — no data yet
  const anuncios: Anuncio[] = [];

  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-heading">
          LISTA DE ANUNCIOS
        </h2>
        <p className="text-xs text-muted-foreground font-heading mt-1">
          Ranking de performance dos criativos
        </p>
      </div>

      {anuncios.length === 0 ? (
        <div className="p-12 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-heading">
            Nenhum anuncio registrado ainda
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1 font-heading">
            Os dados de anuncios serao exibidos aqui quando disponiveis
          </p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {anuncios.map((ad) => (
            <a
              key={ad.rank}
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-border bg-card hover:border-primary/40 transition-colors p-4"
            >
              {/* Top line: rank + type + name + external link */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-mono font-bold ${
                    ad.rank <= 3
                      ? 'bg-primary/15 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {ad.rank}
                </span>
                {ad.tipo === 'video' ? (
                  <Film className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className="text-sm font-heading font-medium text-foreground flex-1">
                  {ad.nome}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              {/* File name */}
              <p className="text-[11px] text-muted-foreground pl-10 mt-1">
                {ad.arquivo}
              </p>

              {/* Metrics line */}
              <div className="flex items-center gap-4 pl-10 mt-2">
                <span className="text-sm">
                  <span className="font-mono font-bold text-primary">{ad.vendas}</span>
                  <span className="text-muted-foreground ml-1">vendas</span>
                </span>
                <span className="text-sm">
                  <span className="text-muted-foreground">CPA </span>
                  <span className="font-mono text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.cpa)}
                  </span>
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
