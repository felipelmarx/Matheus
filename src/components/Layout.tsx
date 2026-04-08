import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  lastUpdated?: string;
}

export default function Layout({ children, lastUpdated }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-text">
      <header className="border-b border-brand-gray-med/30 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>
              🫁
            </span>
            <div>
              <div className="text-lg font-bold tracking-tight text-brand-primary">
                iBreathwork
              </div>
              <div className="text-xs font-medium text-brand-gray-dark">
                Instituto de Neurociência da Respiração
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-brand-text">
              Dashboard Evento Presencial
            </div>
            {lastUpdated && (
              <div className="text-xs text-brand-gray-med">
                Atualizado: {lastUpdated}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

      <footer className="mt-16 border-t border-brand-gray-med/30 bg-brand-gray-bg">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center">
          <p className="text-xs font-medium text-brand-gray-med">
            Científico · Acolhedor · Premium · Sem misticismo
          </p>
          <p className="mt-1 text-xs text-brand-gray-med/70">
            © iBreathwork — Instituto de Neurociência da Respiração
          </p>
        </div>
      </footer>
    </div>
  );
}
