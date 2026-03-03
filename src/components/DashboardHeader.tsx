import { RefreshCw, Calendar } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import type { DashboardData } from '@/types/metrics';

interface DashboardHeaderProps {
  data: DashboardData | null;
  loading: boolean;
  lastRefresh: Date | null;
  onRefresh: () => void;
}

export default function DashboardHeader({ data, loading, lastRefresh, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="px-4 lg:px-16 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
              Melhores Ads &amp; Paginas <span className="text-primary">5D</span>
            </h1>
            {data && (
              <p className="text-muted-foreground mt-1 text-sm font-heading">
                Ranking de performance dos criativos
                {data.desafioAtual ? ` \u00B7 ${data.desafioAtual}` : ''}
                {data.periodo ? ` \u00B7 ${data.periodo}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-heading text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
        {lastRefresh && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Calendar className="w-4 h-4" />
            <span>Ultima atualizacao: {lastRefresh.toLocaleString('pt-BR')}</span>
            {data?.fromCache && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full ml-2 font-mono">
                cache
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
