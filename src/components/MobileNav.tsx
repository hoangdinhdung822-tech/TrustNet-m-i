import React from 'react';
import { Home, Bot, HeartHandshake, Gamepad2, GraduationCap, UserCircle2 } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'feed', label: 'Trang chủ', icon: Home },
    { id: 'factcheck', label: 'Kiểm chứng', icon: Bot },
    { id: 'support', label: 'Tâm lý', icon: HeartHandshake },
    { id: 'scenarios', label: 'Tình huống', icon: Gamepad2 },
    { id: 'profile', label: 'Hồ sơ', icon: UserCircle2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950/95 border-t-2 border-slate-900 dark:border-slate-800 px-2 py-1.5 safe-area-pb shadow-[0_-3px_0_0_#0f172a] dark:shadow-none">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all border-2 ${
                isActive
                  ? 'text-white bg-blue-600 border-slate-900 shadow-hard-sm'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-mint-100 dark:hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
