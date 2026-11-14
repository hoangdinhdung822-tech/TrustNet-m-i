import React from 'react';
import { 
  Home, 
  Search, 
  Bot, 
  GraduationCap, 
  Gamepad2, 
  UserCircle2, 
  ShieldAlert,
  School,
  Flame,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

import { DatabaseService } from '../services/dbMock';
import { User } from '../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode?: boolean;
  user?: User;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, user }) => {
  const navItems = [
    { id: 'feed', label: 'Trang chủ', icon: Home, badge: 'Feed' },
    { id: 'school', label: 'Giới thiệu trường', icon: School, badge: 'THPT Số 1' },
    { id: 'search', label: 'Tìm kiếm', icon: Search },
    { id: 'factcheck', label: 'AI Kiểm chứng', icon: Bot, highlight: true },
    { id: 'academy', label: 'Học an toàn số', icon: GraduationCap, badge: 'Mỗi tuần' },
    { id: 'scenarios', label: 'Tình huống mô phỏng', icon: Gamepad2, badge: 'Hot' },
    { id: 'support', label: 'Tư vấn tâm lý', icon: HeartHandshake, badge: 'AI Care', highlight: true },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserCircle2 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 py-6 px-4 space-y-4">
      
      {/* Navigation List */}
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all group border-2 ${
                isActive
                  ? 'bg-blue-600 text-white border-slate-900 shadow-hard'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-transparent hover:bg-mint-100 dark:hover:bg-slate-900/80 border-transparent hover:border-slate-900 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.highlight ? 'text-blue-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border ${
                  isActive 
                    ? 'bg-white/20 text-white border-white/30' 
                    : item.badge === 'Hot'
                    ? 'bg-orange-100 text-orange-600 border-orange-400 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
                    : item.badge === 'Mỗi tuần'
                    ? 'bg-purple-100 text-purple-600 border-purple-400 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'
                    : item.badge === 'AI Care'
                    ? 'bg-cyan-100 text-cyan-700 border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30'
                    : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin Dashboard Nav Item */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all group border-2 ${
              activeTab === 'admin'
                ? 'bg-rose-600 text-white border-slate-900 shadow-hard'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 bg-rose-50 dark:bg-transparent hover:bg-rose-100 dark:hover:bg-rose-950/20 border-rose-200 dark:border-transparent hover:border-rose-400 dark:hover:border-rose-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className={`w-5 h-5 ${activeTab === 'admin' ? 'text-white' : 'text-rose-500'}`} />
              <span>Admin & Kiểm duyệt</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-black border border-rose-400 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30">
              Admin
            </span>
          </button>
        )}
      </nav>

      {/* Safety Daily Motivation Card — neo-brutalism style */}
      <div className="neo-card p-4 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300 rounded-full opacity-60 blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Thông điệp TrustNet</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed italic mb-3">
          "Đọc → Kiểm tra → Suy nghĩ → Đánh giá → Quyết định thay vì Đọc → Tin → Chia sẻ."
        </p>

        <button 
          onClick={() => setActiveTab('factcheck')}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black border-2 border-slate-900 shadow-hard-sm hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kiểm chứng ngay</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t-2 border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold">TrustNet v1.0 Gen Z</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Online
          </span>
        </div>
        <p className="text-slate-400 dark:text-slate-500">Bảo vệ giới trẻ khỏi thông tin sai lệch</p>
      </div>

    </aside>
  );
};
