import { Megaphone } from 'lucide-react';
import type { AdMetric } from '@/types/metrics';

interface ListaAnunciosProps {
  ads: AdMetric[];
}

export default function ListaAnuncios({ ads }: ListaAnunciosProps) {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  if (ads.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-orange-500/10 to-transparent">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
              Top Anúncios
            </h3>
          </div>
        </div>
        <div className="p-12 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-heading">
            Nenhum anúncio registrado ainda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-orange-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Top Anúncios
          </h3>
        </div>
      </div>

      <div className="divide-y divide-border">
        {ads.map((ad) => (
          <div key={ad.rank} className="px-5 py-4 hover:bg-muted/30 transition-colors">
            {/* Rank + Name */}
            <div className="flex items-center gap-3">
              <span
                className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-mono font-bold shrink-0 ${
                  ad.rank <= 3
                    ? 'bg-primary/15 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {ad.rank}
              </span>
              <span className="text-sm font-heading font-medium text-foreground truncate">
                {ad.name}
              </span>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-5 pl-10 mt-2 flex-wrap">
              <span className="text-sm">
                <span className="font-mono font-bold text-primary">{ad.totalPurchases}</span>
                <span className="text-muted-foreground ml-1">vendas</span>
              </span>
              <span className="text-sm">
                <span className="text-muted-foreground">Investido </span>
                <span className="font-mono text-foreground">{BRL.format(ad.totalSpent)}</span>
              </span>
              <span className="text-sm">
                <span className="text-muted-foreground">CPA </span>
                <span className={`font-mono ${ad.cpa > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {ad.cpa > 0 ? BRL.format(ad.cpa) : '--'}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
