import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Bell, 
  Sun, 
  Moon, 
  Search, 
  Award, 
  CheckCircle, 
  LogOut, 
  ShieldAlert,
  Heart,
  MessageSquare,
  Share2,
  Check
} from 'lucide-react';
import { User, AppNotification } from '../types';
import { DatabaseService } from '../services/dbMock';
import { formatFacebookTime, formatFacebookFullTime } from '../utils/timeAgo';

interface Props {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  setActiveTab,
  isDark,
  setIsDark,
  isAdminMode,
  setIsAdminMode,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    DatabaseService.getNotifications(user.id)
  );
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  // Lắng nghe cập nhật thông báo realtime khi có like, comment, share, fact-check
  useEffect(() => {
    const refresh = () => {
      setNotifications(DatabaseService.getNotifications(user.id));
    };
    refresh();
    window.addEventListener('trustnet_notification_event', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('trustnet_notification_event', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [user.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = DatabaseService.markAllNotificationsAsRead(user.id);
    setNotifications(updated);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    DatabaseService.markNotificationAsRead(notif.id);
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setShowNotifications(false);
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    } else {
      setActiveTab('feed');
    }
  };

  const filteredNotifications = notifFilter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b-2 border-slate-900 dark:border-slate-800 shadow-[0_2px_0_0_#0f172a] dark:shadow-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Motto */}
        <div 
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-hard-sm group-hover:scale-105 transition-transform border-2 border-slate-900">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                TrustNet
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-600 text-white border-2 border-slate-900 shadow-hard-sm">
                AI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>Đừng chỉ tin. Hãy kiểm chứng!</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveTab('school'); }}
                className="text-blue-600 dark:text-cyan-400 hover:text-orange-500 font-bold hover:underline transition-colors cursor-pointer"
                title="Xem giới thiệu Trường THPT"
              >
                Giới thiệu trường
              </button>
            </div>
          </div>
        </div>

        {/* Speech bubble mascot — desktop only */}
        <div className="hidden xl:flex items-center">
          <div className="relative bg-yellow-300 border-2 border-slate-900 rounded-2xl px-3 py-1.5 shadow-hard-sm text-[11px] font-bold text-slate-900 max-w-[200px] text-center">
            Đừng để lừa đảo làm bạn lo lắng — TrustNet đây! 🤖🛡️
            <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[10px] border-r-slate-900"></span>
            <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[9px] border-r-yellow-300"></span>
          </div>
        </div>

        {/* Center Quick Search Button */}
        <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
          <button 
            onClick={() => setActiveTab('search')}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-mint-100 dark:bg-slate-900/90 border-2 border-slate-900 dark:border-slate-700 hover:border-blue-600 dark:hover:border-indigo-500 text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-slate-200 text-sm transition-all group shadow-hard-sm hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs font-semibold">Tìm kiếm & kiểm tra nguồn tin...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-slate-900 dark:border-slate-700">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & User Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Admin Indicator */}
          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-rose-500 text-white border-2 border-slate-900 shadow-hard-sm hover:-translate-y-0.5 transition-all neo-btn"
              title="Mở Bảng Quản Trị & Kiểm Duyệt"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Quản Trị</span>
            </button>
          )}

          {/* XP & Level Badge */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-yellow-300 border-2 border-slate-900 shadow-hard-sm hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                {user.rankTitle}
              </span>
              <span className="text-xs font-black text-slate-900 font-mono flex items-center gap-1">
                {user.points} <span className="text-[10px] text-slate-600">XP</span>
              </span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="p-2 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-white dark:bg-slate-900/80 border-2 border-slate-900 dark:border-slate-700 shadow-hard-sm hover:-translate-y-0.5 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-white dark:bg-slate-900/80 border-2 border-slate-900 dark:border-slate-700 shadow-hard-sm hover:-translate-y-0.5 transition-all"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center border border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-hard p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b-2 border-slate-900 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      Thông báo
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white border border-slate-900 text-[10px] font-black">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-blue-600 dark:text-indigo-400 hover:text-orange-500 font-bold cursor-pointer hover:underline"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-black transition-all border-2 border-slate-900 shadow-hard-sm ${
                      notifFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-mint-100'
                    }`}
                  >
                    Tất cả ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('unread')}
                    className={`px-3 py-1 rounded-full text-xs font-black transition-all border-2 border-slate-900 shadow-hard-sm ${
                      notifFilter === 'unread'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-mint-100'
                    }`}
                  >
                    Chưa đọc ({unreadCount})
                  </button>
                </div>

                {/* Notifications list */}
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      {notifFilter === 'unread' ? 'Không có thông báo chưa đọc nào.' : 'Chưa có thông báo nào.'}
                    </div>
                  ) : (
                    filteredNotifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-2xl text-xs transition-colors cursor-pointer flex items-start gap-2.5 border-2 ${
                          n.read 
                            ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:bg-mint-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400' 
                            : 'bg-blue-50 dark:bg-indigo-950/30 border-blue-400 dark:border-indigo-500/40 hover:bg-blue-100 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {/* Actor Avatar with Icon Overlay */}
                        <div className="relative shrink-0 mt-0.5">
                          <img
                            src={n.actor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={n.actor?.name || 'User'}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-900"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-white ${
                            n.type === 'like' ? 'bg-rose-500 text-white' :
                            n.type === 'comment' ? 'bg-blue-600 text-white' :
                            n.type === 'share' ? 'bg-cyan-500 text-slate-950' :
                            n.type === 'fact_check' ? 'bg-emerald-500 text-white' :
                            n.type === 'reward' ? 'bg-yellow-400 text-slate-950' :
                            'bg-slate-700 text-white'
                          }`}>
                            {n.type === 'like' && <Heart className="w-2.5 h-2.5 fill-current" />}
                            {n.type === 'comment' && <MessageSquare className="w-2.5 h-2.5 fill-current" />}
                            {n.type === 'share' && <Share2 className="w-2.5 h-2.5" />}
                            {n.type === 'fact_check' && <Sparkles className="w-2.5 h-2.5" />}
                            {n.type === 'reward' && <Award className="w-2.5 h-2.5" />}
                            {n.type === 'system' && <ShieldCheck className="w-2.5 h-2.5" />}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold flex items-start justify-between gap-1 leading-snug">
                            <span className={n.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                            )}
                          </div>
                          {n.content && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                              {n.content}
                            </p>
                          )}
                          <span 
                            title={formatFacebookFullTime(n.createdAt)}
                            className="text-[10px] text-slate-400 mt-1 block"
                          >
                            {formatFacebookTime(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="cursor-pointer relative flex items-center justify-center p-0.5 rounded-full border-2 border-slate-900 shadow-hard-sm hover:-translate-y-0.5 transition-all"
            title={`Xem hồ sơ của ${user.name}`}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>

          {/* Quick Logout Button */}
          {onLogout && (
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
                  onLogout();
                }
              }}
              className="p-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-900/80 border-2 border-slate-900 dark:border-slate-700 shadow-hard-sm hover:-translate-y-0.5 transition-all"
              title="Đăng xuất khỏi TrustNet"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
