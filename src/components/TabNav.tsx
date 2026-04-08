interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <nav
      className="mb-6 border-b border-brand-gray-med/30"
      role="tablist"
      aria-label="Seções do dashboard"
    >
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={[
                "relative px-5 py-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
                isActive
                  ? "text-brand-primary"
                  : "text-brand-gray-dark hover:text-brand-primary",
              ].join(" ")}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
