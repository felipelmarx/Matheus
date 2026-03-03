import { BarChart3 } from 'lucide-react';

export default function MelhorPagina() {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-heading">
          MELHOR PAGINA
        </h2>
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-heading mb-2">Link da pagina</p>
            <span className="text-primary text-sm font-mono italic opacity-50">
              Nenhuma pagina registrada
            </span>
            <p className="text-foreground font-heading mt-3 text-sm">
              &ldquo;--&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-4 py-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground font-heading">Conversao Checkout</p>
              <p className="text-sm font-mono font-bold text-foreground">--%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
