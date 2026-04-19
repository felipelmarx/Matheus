import { Megaphone, ExternalLink, Film, ImageIcon } from 'lucide-react';
import type { AdMetric } from '@/types/metrics';

interface ListaAnunciosProps {
  ads: AdMetric[];
}

const AD_LINKS: { pattern: string; link: string; type: 'video' | 'image' }[] = [
  { pattern: 'edu- ayhuasca 2', link: 'https://drive.google.com/file/d/1xeXUaFi8t5EKw585mwckqoOe5aQ1xmIr/view', type: 'video' },
  { pattern: 'AD 2 ( Gabriel Editor )', link: 'https://drive.google.com/file/d/1knVIvx0gQC7gZPqfAtET0jSd3cHrAhWL/view', type: 'video' },
  { pattern: 'AD 1 LOTE 1', link: 'https://drive.google.com/file/d/196eAVEot-gcmIPQHHb0H-ZbeThYnZu9X/view', type: 'video' },
  { pattern: 'SISTEMA NERVOSO', link: 'https://drive.google.com/file/d/1wCc3xjfigDL05VOmUIrT2yulTdwhZ-FW/view', type: 'video' },
  { pattern: 'DESAFIO CERTO', link: 'https://drive.google.com/file/d/1cKQ2e_CVGclTqXMGjTYwf38WyMuJzVjU/view', type: 'image' },
  { pattern: 'AD 1 ( Gabriel Editor )', link: 'https://drive.google.com/file/d/13PnThFv8IrMaSToc4Yq7uQRMCPuw-wPA/view', type: 'video' },
  { pattern: 'Felipe Marx AD4', link: 'https://drive.google.com/file/d/1_dZk3jO-N9opesTrPfutZN0fKOe4zkrE/view', type: 'video' },
  { pattern: 'FELIPE MARX - AD 4', link: 'https://drive.google.com/file/d/1_dZk3jO-N9opesTrPfutZN0fKOe4zkrE/view', type: 'video' },
  { pattern: 'Daniela AM', link: 'https://drive.google.com/file/d/1qKmggQ9n0oK3GtUCZXmRY5P8SxUoQvBb/view', type: 'video' },
  { pattern: '[EDU] Luciano Hulk', link: 'https://drive.google.com/file/d/1989tkozLpv2dfV_5Q_c2Jj03qbIBfnWW/view', type: 'video' },
  { pattern: '[EDU] hook 3 cta 1', link: 'https://drive.google.com/file/d/19kwXNw2SvojAClMVzAmgV_Lwy_dHsVZs/view', type: 'video' },
  { pattern: 'EDU REELS 4 AYAHUASCA', link: 'https://drive.google.com/file/d/1N2uoWPLxr1n01ZJ_CNheEiDQ6Ad3JP0I/view', type: 'video' },
  { pattern: 'AD 1 LOTE 6 COLOMBIA', link: 'https://drive.google.com/file/d/10nuEa388a5EzfX8cRFcYEmRubBv9H6u-/view', type: 'video' },
  { pattern: 'AD 12 LOTE 8', link: 'https://drive.google.com/file/d/186szavOZqJNyArttPkpy9j4eTi_9tdLS/view', type: 'video' },
];


function findAdLink(adName: string) {
  const lower = adName.toLowerCase();
  return AD_LINKS.find((entry) => lower.includes(entry.pattern.toLowerCase())) ?? null;
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
        {ads.map((ad) => {
          const adLink = findAdLink(ad.name);
          return (
            <div key={ad.rank} className="px-5 py-4 hover:bg-muted/30 transition-colors">
              {/* Rank + Type icon + Name + Link button */}
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
                {adLink && (
                  adLink.type === 'video'
                    ? <Film className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    : <ImageIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-heading font-medium text-foreground truncate flex-1">
                  {ad.name}
                </span>
                {adLink && (
                  <a
                    href={adLink.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 text-xs font-heading text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 rounded-md px-2.5 py-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver criativo
                  </a>
                )}
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
          );
        })}
      </div>
    </div>
  );
}
