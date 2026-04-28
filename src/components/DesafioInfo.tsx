import { useState } from 'react';
import { Users, Tag, ExternalLink, Megaphone, ChevronDown, ChevronUp } from 'lucide-react';

type DesafioKey = 'desafio1' | 'desafio2' | 'desafio3' | 'desafio4' | 'desafio5' | 'desafio6';

interface DesafioConfig {
  publico: string;
  oferta: string;
  hasUpsell: boolean;
  pagina: string;
  anuncios: string[];
}

const DESAFIO_DATA: Record<DesafioKey, DesafioConfig> = {
  desafio1: {
    publico: 'ADVTG',
    oferta: 'Protocolos 7 dias gratis (Hotmart) | Com UPSELL DE R$ 97',
    hasUpsell: true,
    pagina: 'https://lp.felipemarx.com.br/imersao-desafio-breathwork-aovivo-vsl12-8-6l/',
    anuncios: [
      '[Gabriel]Reels 1',
      'EDU REELS 4 AYAHUASCA',
      'AD 1 LOTE 1',
      'FELIPE MARX - AD 4 - LOTE 1',
      '[EDU] Luciano Hulk AD4+ VALOR 5',
    ],
  },
  desafio2: {
    publico: 'INTERESSE TERA CARGOS e ADVTG',
    oferta: 'Protocolos 7 dias gratis (Hotmart) | Com UPSELL DE R$ 97',
    hasUpsell: true,
    pagina: 'https://lp.felipemarx.com.br/imersao-desafio-5d-pago-5d-pago-perpetuo-v4/',
    anuncios: [
      'AD 2 (Gabriel Editor) VIDEO BEBE',
      'edu- ayahuasca 2',
      '[EDU] Luciano Hulk AD4+ VALOR 5',
      'AD 1 (Gabriel Editor)',
      'Ads Desafio 5D Perpetuo 23.02.26 - SISTEMA NERVOSO [Editado Anderson]',
    ],
  },
  desafio3: {
    publico: 'PSICOLOGOS - INTERESSE TERA CARGOS',
    oferta: 'Protocolos 7 dias gratis (DASH) | Com UPSELL DE R$ 97',
    hasUpsell: true,
    pagina: 'https://lp.felipemarx.com.br/imersao-desafio-5d-pago-5d-pago-perpetuo-2-2/',
    anuncios: [
      'DESAFIO CERTO',
      'AD 2 (Gabriel Editor) VIDEO BEBE',
      'AD 1 LOTE 1',
      'FELIPE MARX - AD 4 - LOTE 1',
      'AD 1 LOTE 6 COLOMBIA',
      '[EDU] hook 3 cta 1',
      'edu- ayahuasca 2',
    ],
  },
  desafio4: {
    publico: 'ADVTG - INTERESSE TERA E MED',
    oferta: 'Protocolos 7 dias gratis (DASH) | Rodando SEM UPSELL de R$ 97',
    hasUpsell: false,
    pagina: 'https://lp.felipemarx.com.br/imersao-desafio-breathwork-aovivo-vsl12-8-6l/',
    anuncios: [
      'DESAFIO CERTO',
      'AD 2 (Gabriel Editor) VIDEO BEBE',
      'AD 1 LOTE 1',
      'FELIPE MARX - AD 4 - LOTE 1',
      'AD 1 LOTE 6 COLOMBIA',
      '[EDU] hook 3 cta 1',
      'edu- ayahuasca 2',
      '1 Daniela AM',
      'EDU REELS 4 AYAHUASCA',
    ],
  },
  desafio5: {
    publico: 'A definir',
    oferta: 'A definir',
    hasUpsell: false,
    pagina: 'https://desafio-5d-lp.vercel.app/',
    anuncios: [],
  },
  desafio6: {
    publico: 'A definir',
    oferta: 'A definir',
    hasUpsell: false,
    pagina: '',
    anuncios: [],
  },
};

interface DesafioInfoProps {
  desafioKey: DesafioKey;
}

export default function DesafioInfo({ desafioKey }: DesafioInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = DESAFIO_DATA[desafioKey];

  if (!config) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
      >
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
          Configuracao do Desafio
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-border">
          {/* Publico */}
          <div className="flex items-center gap-2 pt-3">
            <Users className="w-3.5 h-3.5 shrink-0 text-blue-400" />
            <span className="text-xs text-muted-foreground font-heading whitespace-nowrap">
              Publico
            </span>
            <div className="border-b border-dotted border-border/50 flex-1 mb-1 mx-1" />
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary whitespace-nowrap">
              {config.publico}
            </span>
          </div>

          {/* Oferta */}
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 shrink-0 text-violet-400" />
            <span className="text-xs text-muted-foreground font-heading whitespace-nowrap">
              Oferta
            </span>
            <div className="border-b border-dotted border-border/50 flex-1 mb-1 mx-1" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-mono text-foreground truncate">
                {config.oferta.split('|')[0].trim()}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono font-semibold whitespace-nowrap ${
                  config.hasUpsell
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {config.hasUpsell ? 'UPSELL R$ 97' : 'SEM UPSELL'}
              </span>
            </div>
          </div>

          {/* Pagina */}
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span className="text-xs text-muted-foreground font-heading whitespace-nowrap">
              Pagina
            </span>
            <div className="border-b border-dotted border-border/50 flex-1 mb-1 mx-1" />
            <a
              href={config.pagina}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-primary hover:underline truncate max-w-[280px]"
            >
              {config.pagina.replace('https://lp.felipemarx.com.br/', '.../')}
            </a>
          </div>

          {/* Anuncios */}
          <div className="flex items-start gap-2">
            <Megaphone className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
            <span className="text-xs text-muted-foreground font-heading whitespace-nowrap mt-0.5">
              Anuncios
            </span>
            <div className="flex flex-wrap gap-1.5 ml-1">
              {config.anuncios.map((ad) => (
                <span
                  key={ad}
                  className="bg-muted rounded-lg px-2 py-1 text-[10px] font-mono text-muted-foreground leading-tight"
                >
                  {ad}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
