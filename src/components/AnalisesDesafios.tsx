import { Star } from 'lucide-react';

interface AnalisesDesafiosProps {
  lines: string[];
}

function renderLine(line: string, index: number) {
  // Title line (star emoji)
  if (line.startsWith('⭐')) {
    return (
      <div key={index} className="flex items-center gap-2 mb-2">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
        <h2 className="text-base font-heading font-bold text-foreground">
          {line.replace(/⭐\s*/g, '')}
        </h2>
      </div>
    );
  }

  // Section headers (numbered: "1. DIAGNÓSTICO GERAL", etc.)
  if (/^\d+\.\s+[A-ZÁÉÍÓÚÀÃÕÇ\s]+$/.test(line)) {
    return (
      <h3 key={index} className="text-sm font-heading font-bold text-primary mt-6 mb-2 uppercase tracking-wide">
        {line}
      </h3>
    );
  }

  // Subtitle / metadata line
  if (line.startsWith('Análise cruzada') || line.startsWith('Visão Estratégica gerada')) {
    return (
      <p key={index} className="text-xs text-muted-foreground/70 mb-4 italic">
        {line}
      </p>
    );
  }

  // Content paragraphs - may contain \n for internal line breaks
  const paragraphs = line.split('\\n').filter((p) => p.trim().length > 0);

  return (
    <div key={index} className="space-y-3 mb-4">
      {paragraphs.map((para, pi) => {
        const trimmed = para.trim();

        // Sub-headers like "QUEBRA 1 —", "PADRÃO 1 —", numbered items "1. CRIATIVOS..."
        const isSubHeader = /^(QUEBRA|PADRÃO|PADR[AÃ]O)\s+\d+/i.test(trimmed);
        const isNumberedItem = /^\d+\.\s+[A-ZÁÉÍÓÚÀÃÕÇ]/.test(trimmed);

        if (isSubHeader || isNumberedItem) {
          // Split at first colon or dash to get title + body
          const sepIdx = trimmed.indexOf(':');
          if (sepIdx > 0 && sepIdx < 80) {
            const title = trimmed.slice(0, sepIdx + 1);
            const body = trimmed.slice(sepIdx + 1).trim();
            return (
              <div key={pi}>
                <p className="text-sm text-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold">{title}</strong>{' '}
                  {body}
                </p>
              </div>
            );
          }
        }

        return (
          <p key={pi} className="text-sm text-muted-foreground leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function AnalisesDesafios({ lines }: AnalisesDesafiosProps) {
  if (lines.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground font-heading">Nenhuma analise disponivel</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Analises Desafios
          </h3>
        </div>
      </div>
      <div className="p-5 sm:p-6 max-w-4xl">
        {lines.map((line, i) => renderLine(line, i))}
      </div>
    </div>
  );
}
