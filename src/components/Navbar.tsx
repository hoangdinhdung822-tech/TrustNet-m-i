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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Motto */}
        <div 
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-glow-sm group-hover:shadow-glow-md transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
                TrustNet
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI Fact Check
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <span>Đừng chỉ tin. Hãy kiểm chứng!</span>
              <span className="text-slate-600">•</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveTab('school'); }}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors cursor-pointer"
                title="Xem giới thiệu Trường THPT Số 1 Phan Đình Phùng"
              >
                Giới thiệu trường
              </button>
            </div>
          </div>
        </div>

        {/* Center Quick Search Button */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
          <button 
            onClick={() => setActiveTab('search')}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200 text-sm transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span>Tìm kiếm & kiểm tra nguồn tin uy tín...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & User Stats */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Admin Indicator - CHỈ HIỂN THỊ KHI ĐĂNG NHẬP VỚI TÀI KHOẢN ADMIN */}
          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer shadow-sm"
              title="Mở Bảng Quản Trị & Kiểm Duyệt"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Quản Trị Viên</span>
            </button>
          )}

          {/* XP & Level Badge */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 hover:border-indigo-500/60 transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300">
                {user.rankTitle}
              </span>
              <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1">
                {user.points} <span className="text-[10px] text-amber-500/80">XP</span>
              </span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Thông báo hệ thống"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center font-mono shadow-md animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500/50 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      Thông báo
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold font-mono">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer hover:underline"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-800/60">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      notifFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    Tất cả ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('unread')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      notifFilter === 'unread'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
                        className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-start gap-2.5 ${
                          n.read 
                            ? 'bg-slate-950/40 hover:bg-slate-800/50 text-slate-400' 
                            : 'bg-indigo-950/30 hover:bg-indigo-950/50 text-slate-200 border border-indigo-500/20'
                        }`}
                      >
                        {/* Actor Avatar with Icon Overlay */}
                        <div className="relative shrink-0 mt-0.5">
                          <img
                            src={n.actor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt={n.actor?.name || 'User'}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-800"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                            n.type === 'like' ? 'bg-rose-500 text-white' :
                            n.type === 'comment' ? 'bg-indigo-500 text-white' :
                            n.type === 'share' ? 'bg-cyan-500 text-slate-950' :
                            n.type === 'fact_check' ? 'bg-emerald-500 text-white' :
                            n.type === 'reward' ? 'bg-amber-500 text-slate-950' :
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
                          <div className="font-semibold flex items-start justify-between gap-1 leading-snug">
                            <span className={n.read ? 'text-slate-300' : 'text-white'}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1" />
                            )}
                          </div>
                          {n.content && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                              {n.content}
                            </p>
                          )}
                          <span 
                            title={formatFacebookFullTime(n.createdAt)}
                            className="text-[10px] text-slate-500 mt-1 block"
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
            className="cursor-pointer relative flex items-center justify-center p-0.5 rounded-full ring-2 ring-indigo-500/40 hover:ring-indigo-400 transition-all"
            title={`Xem hồ sơ của ${user.name}`}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>

          {/* Quick Logout Button */}
          {onLogout && (
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
                  onLogout();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
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
