import type { DesafioData, DesafioKey, TabKey } from '@/types/metrics';

interface DesafioTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  data: {
    desafio1: DesafioData;
    desafio2: DesafioData;
    desafio3: DesafioData;
    desafio4: DesafioData;
  };
}

const tabs: { key: TabKey; label: string; num: string }[] = [
  { key: 'geral', label: '\u2211 Geral', num: '\u2211' },
  { key: 'desafio1', label: 'Desafio 1', num: '01' },
  { key: 'desafio2', label: 'Desafio 2', num: '02' },
  { key: 'desafio3', label: 'Desafio 3', num: '03' },
  { key: 'desafio4', label: 'Desafio 4', num: '04' },
  { key: 'comparar', label: 'Comparar', num: '⇄' },
];

export default function DesafioTabs({ activeTab, onTabChange, data }: DesafioTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const isDesafio = tab.key !== 'geral' && tab.key !== 'comparar';
        const desafioData = isDesafio ? data[tab.key as DesafioKey] : null;
        const hasData = !isDesafio || (desafioData !== null && (desafioData.investimento > 0 || desafioData.vendas > 0));
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-heading font-medium transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            <span className={`text-lg font-bold font-mono ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/50'}`}>
              {tab.num}
            </span>
            <div className="text-left">
              <span className="block">{tab.label}</span>
              {desafioData?.captacao && (
                <span className={`block text-xs ${isActive ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                  {desafioData.captacao.replace(/CAPTAÇÃO\s*-\s*/i, '')}
                </span>
              )}
            </div>
            {!hasData && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                Em breve
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
