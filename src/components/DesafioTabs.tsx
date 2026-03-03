interface DesafioTabsProps {
  activeTab: 'desafio1' | 'desafio2' | 'desafio3';
  onTabChange: (tab: 'desafio1' | 'desafio2' | 'desafio3') => void;
}

const tabs = [
  { key: 'desafio1' as const, label: 'Desafio 1' },
  { key: 'desafio2' as const, label: 'Desafio 2' },
  { key: 'desafio3' as const, label: 'Desafio 3' },
];

export default function DesafioTabs({ activeTab, onTabChange }: DesafioTabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all ${
            activeTab === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
