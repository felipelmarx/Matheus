import { RefreshCw, Calendar } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import type { AllDesafiosData } from '@/types/metrics';

interface DashboardHeaderProps {
  data: AllDesafiosData | null;
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
              Dashboard <span className="text-primary">5D</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-heading">
              Metricas de performance por desafio
            </p>
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
