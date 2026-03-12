import { EVENTS } from '@/config/events';
import { BarChart3 } from 'lucide-react';

export type TabId = string | 'comparativo';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    ...EVENTS.map((e) => ({
      id: e.id as TabId,
      label: e.label,
      enabled: e.enabled,
    })),
    {
      id: 'comparativo' as TabId,
      label: 'Comparativo',
      enabled: true,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Eventos"
      className="flex items-center gap-1 bg-surface border border-card-border rounded-lg p-1 mb-6 overflow-x-auto"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium
              transition-all whitespace-nowrap
              ${isActive
                ? 'bg-card text-fg shadow-sm border border-card-border'
                : 'text-muted hover:text-fg hover:bg-surface-hover'
              }
            `}
          >
            {tab.id === 'comparativo' && (
              <BarChart3 className="w-3.5 h-3.5" />
            )}
            {tab.label}
            {!tab.enabled && (
              <span className="text-[10px] bg-surface-hover text-muted px-1.5 py-0.5 rounded-full ml-1">
                em breve
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
