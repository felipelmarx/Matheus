import type { DesafioData } from '@/types/metrics';

interface DesafioTabsProps {
  activeTab: 'desafio1' | 'desafio2' | 'desafio3';
  onTabChange: (tab: 'desafio1' | 'desafio2' | 'desafio3') => void;
  data: {
    desafio1: DesafioData;
    desafio2: DesafioData;
    desafio3: DesafioData;
  };
}

const tabs = [
  { key: 'desafio1' as const, label: 'Desafio 1', num: '01' },
  { key: 'desafio2' as const, label: 'Desafio 2', num: '02' },
  { key: 'desafio3' as const, label: 'Desafio 3', num: '03' },
];

export default function DesafioTabs({ activeTab, onTabChange, data }: DesafioTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const desafioData = data[tab.key];
        const hasData = desafioData.investimento > 0 || desafioData.vendas > 0;
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
              {desafioData.captacao && (
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
