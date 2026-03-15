import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import type { AllDesafiosData, DesafioKey } from '@/types/metrics';

interface AnaliseComparativaProps {
  selectedKeys: DesafioKey[];
  data: AllDesafiosData;
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-sm font-heading font-semibold text-foreground mt-4 mb-1">
          {renderInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-sm font-heading font-bold text-foreground mt-4 mb-1">
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-base font-heading font-bold text-foreground mt-4 mb-2">
          {renderInline(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="text-sm text-muted-foreground ml-4 list-disc">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(
        <li key={i} className="text-sm text-muted-foreground ml-4 list-decimal">
          {renderInline(content)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="text-foreground font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : parts;
}

export default function AnaliseComparativa({ selectedKeys, data }: AnaliseComparativaProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keysRef = selectedKeys.slice().sort().join(',');

  const fetchAnalysis = useCallback(async () => {
    const keys = keysRef.split(',') as DesafioKey[];
    if (keys.length < 2) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const desafios = keys.map((key) => ({ key, data: data[key] }));

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desafios }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const { analysis: text } = await res.json();
      setAnalysis(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar analise');
    } finally {
      setLoading(false);
    }
  }, [keysRef, data]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (selectedKeys.length < 2) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-border/80">
      <div className="px-5 py-3 border-b border-border bg-gradient-to-r from-purple-500/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-heading font-semibold">
            Analise IA
          </h3>
        </div>
        {!loading && (
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-heading"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerar
          </button>
        )}
      </div>

      <div className="p-5">
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-3 bg-muted rounded w-0" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-4/5" />
            <div className="h-3 bg-muted rounded w-0" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-400 font-heading font-medium mb-1">Erro ao gerar analise</p>
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={fetchAnalysis}
                className="mt-2 text-xs text-primary hover:underline font-heading"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="prose-sm">{renderMarkdown(analysis)}</div>
        )}
      </div>
    </div>
  );
}
