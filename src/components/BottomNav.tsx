'use client';
import { Home, PlusSquare, BarChart2, Settings, List } from 'lucide-react';

export type TabType = 'home' | 'add' | 'list' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: <Home strokeWidth={1.2} size={22} />, label: 'HOME' },
    { id: 'add', icon: <PlusSquare strokeWidth={1.2} size={22} />, label: 'NEW' },
    { id: 'list', icon: <List strokeWidth={1.2} size={22} />, label: 'LIST' },
    { id: 'analytics', icon: <BarChart2 strokeWidth={1.2} size={22} />, label: 'DATA' },
    { id: 'settings', icon: <Settings strokeWidth={1.2} size={22} />, label: 'MENU' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)]/80 backdrop-blur-xl border-t border-[var(--color-border)] shadow-[var(--shadow-card)] z-40 safe-area-pb">
      <div className="max-w-3xl mx-auto flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as TabType)}
              className="flex flex-col items-center justify-center flex-1 py-4 tap-highlight-transparent"
            >
              <span className={`transition-transform duration-300 ease-out ${isActive ? 'scale-110 text-[var(--color-brand)]' : 'scale-100 text-[var(--color-text-muted)]'}`}>
                {tab.icon}
              </span>
              <span className={`text-[9px] mt-1.5 font-medium tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
