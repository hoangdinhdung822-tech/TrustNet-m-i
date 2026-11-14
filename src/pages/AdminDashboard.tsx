import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  Bot, 
  Flag, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RefreshCw,
  BarChart3,
  TrendingDown,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Search,
  Award,
  Sparkles
} from 'lucide-react';
import { DatabaseService } from '../services/dbMock';
import { Post, ReportItem, User } from '../types';
import { AiStatusBadge } from '../components/AiStatusBadge';
import { formatFacebookTime, formatFacebookFullTime } from '../utils/timeAgo';

export const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(() => DatabaseService.getPosts());
  const [reports, setReports] = useState<ReportItem[]>(() => DatabaseService.getReports());
  const [accounts, setAccounts] = useState<User[]>(() => DatabaseService.getAllAccounts());
  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'users' | 'stats'>('moderation');

  // Bộ lọc cho danh sách bài viết
  const [postFilter, setPostFilter] = useState<'all' | 'flagged' | 'verified'>('all');
  const [postSearch, setPostSearch] = useState('');

  // Bộ lọc cho danh sách người dùng
  const [userSearch, setUserSearch] = useState('');

  // Thông báo hành động
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // KPI Calculations dựa trên số liệu thực tế
  const totalWebUsers = accounts.length;
  const totalPostsCount = posts.length;
  const flaggedPostsCount = posts.filter(p => p.verificationStatus === 'suspicious' || p.verificationStatus === 'debunked').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  // 1. Duyệt bài viết an toàn
  const handleApprovePost = (postId: string) => {
    const updated = DatabaseService.moderatePost(
      postId, 
      'verified', 
      95, 
      'Đã được Quản trị viên TrustNet thẩm định và xác nhận nội dung an toàn.'
    );
    setPosts(updated);
    showNotice('Đã duyệt và dán nhãn AN TOÀN cho bài viết!');
  };

  // 2. Gỡ bỏ & dán nhãn Tin giả / Lừa đảo
  const handleMarkFakeNews = (postId: string) => {
    const updated = DatabaseService.moderatePost(
      postId, 
      'debunked', 
      10, 
      'Cảnh báo từ Quản trị viên: Bài viết đã bị gỡ bỏ nhãn an toàn do chứa thông tin sai sự thật hoặc dấu hiệu lừa đảo.'
    );
    setPosts(updated);
    showNotice('Đã gắn nhãn CẢNH BÁO TIN GIẢ / LỪA ĐẢO cho bài viết!');
  };

  // 3. XÓA VĨNH VIỄN BÀI VIẾT KHỎI NỀN TẢNG
  const handleDeletePost = (postId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bài đăng này khỏi hệ thống TrustNet?')) {
      const updated = DatabaseService.deletePost(postId);
      setPosts(updated);
      showNotice('Đã xóa vĩnh viễn bài đăng khỏi hệ thống thành công!');
    }
  };

  // 4. Xử lý báo cáo từ người dùng
  const handleResolveReport = (reportId: string) => {
    const updated = DatabaseService.updateReportStatus(reportId, 'resolved');
    setReports(updated);
    showNotice('Đã cập nhật trạng thái: ĐÃ XỬ LÝ báo cáo.');
  };

  // 5. Gỡ bài đăng trực tiếp từ báo cáo
  const handleDeleteFromReport = (postId: string, reportId: string) => {
    if (window.confirm('Xóa bài đăng bị báo cáo và hoàn tất xử lý vi phạm?')) {
      const updatedPosts = DatabaseService.deletePost(postId);
      const updatedReports = DatabaseService.updateReportStatus(reportId, 'resolved');
      setPosts(updatedPosts);
      setReports(updatedReports);
      showNotice('Đã xóa bài viết vi phạm và đóng báo cáo thành công!');
    }
  };

  // 6. Xóa tài khoản người dùng vi phạm
  const handleDeleteUser = (userId: string) => {
    const target = accounts.find(a => a.id === userId);
    if (!target) return;
    if (target.role === 'admin') {
      alert('Không thể xóa tài khoản Quản trị viên chính!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản người dùng @${target.username} (${target.name})?`)) {
      const res = DatabaseService.deleteUserAccount(userId);
      if (res.success) {
        setAccounts(res.accounts);
        showNotice(`Đã xóa tài khoản @${target.username} khỏi hệ thống.`);
      } else {
        alert(res.error || 'Có lỗi xảy ra');
      }
    }
  };

  // Lọc bài viết
  const filteredPosts = posts.filter(p => {
    const matchSearch = postSearch.trim() === '' || 
      p.content.toLowerCase().includes(postSearch.toLowerCase()) || 
      p.author.name.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.author.username.toLowerCase().includes(postSearch.toLowerCase());

    if (!matchSearch) return false;

    if (postFilter === 'flagged') return p.verificationStatus === 'suspicious' || p.verificationStatus === 'debunked';
    if (postFilter === 'verified') return p.verificationStatus === 'verified';
    return true;
  });

  // Lọc người dùng
  const filteredAccounts = accounts.filter(a => {
    return userSearch.trim() === '' ||
      a.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      a.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (a.school && a.school.toLowerCase().includes(userSearch.toLowerCase()));
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Action Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-slate-900 border-2 border-slate-900 text-white text-xs md:text-sm font-black shadow-[4px_4px_0_0_#0f172a] flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Header */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 relative overflow-hidden text-slate-900 dark:text-slate-100">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-200/40 via-yellow-100/30 to-transparent dark:from-rose-500/15 dark:via-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] text-rose-900 dark:text-rose-400 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Admin & Moderation Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              Bảng Quản Trị & Kiểm Duyệt Nội Dung
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Quyền hạn Quản trị viên: Toàn quyền rà soát, dán nhãn, gỡ bỏ và xóa vĩnh viễn bài đăng tin giả, lừa đảo; nắm bắt số lượng người dùng web.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-black">Quyền hạn Quản trị: HOẠT ĐỘNG</span>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 relative z-10">
          
          <div 
            onClick={() => setActiveTab('users')}
            className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 cursor-pointer transition-all"
          >
            <span className="text-xl md:text-2xl font-black text-blue-700 dark:text-indigo-400 font-mono">{totalWebUsers}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Người dùng web</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('moderation')}
            className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 cursor-pointer transition-all"
          >
            <span className="text-xl md:text-2xl font-black text-cyan-700 dark:text-cyan-400 font-mono">{totalPostsCount}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <FileText className="w-3.5 h-3.5 text-cyan-600" />
              <span>Bài đăng hệ thống</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
            <span className="text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">100%</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI quét tự động</span>
            </div>
          </div>

          <div 
            onClick={() => {
              setActiveTab('moderation');
              setPostFilter('flagged');
            }}
            className="p-3.5 rounded-2xl bg-amber-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 cursor-pointer transition-all"
          >
            <span className="text-xl md:text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">{flaggedPostsCount}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Tin giả / Nghi vấn</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('reports')}
            className="p-3.5 rounded-2xl bg-rose-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] col-span-2 sm:col-span-1 hover:-translate-y-0.5 cursor-pointer transition-all"
          >
            <span className="text-xl md:text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">{pendingReportsCount}</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <Flag className="w-3.5 h-3.5 text-rose-600" />
              <span>Báo cáo chờ xử lý</span>
            </div>
          </div>

        </div>

      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all border-2 border-slate-900 cursor-pointer ${
            activeTab === 'moderation'
              ? 'bg-rose-500 text-white shadow-[2px_2px_0_0_#0f172a]'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shadow-[2px_2px_0_0_#0f172a]'
          }`}
        >
          Hàng Đợi Kiểm Duyệt Bài Viết ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all border-2 border-slate-900 cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-rose-500 text-white shadow-[2px_2px_0_0_#0f172a]'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shadow-[2px_2px_0_0_#0f172a]'
          }`}
        >
          Báo Cáo Vi Phạm ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5 border-2 border-slate-900 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-[2px_2px_0_0_#0f172a]'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shadow-[2px_2px_0_0_#0f172a]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Quản Lý Người Dùng Web ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all border-2 border-slate-900 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-blue-600 text-white shadow-[2px_2px_0_0_#0f172a]'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 shadow-[2px_2px_0_0_#0f172a]'
          }`}
        >
          Thống Kê An Toàn Số
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MODERATION QUEUE (Kiểm duyệt, Gỡ bỏ & Xóa bài đăng)*/}
      {/* ======================================================== */}
      {activeTab === 'moderation' && (
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl overflow-hidden text-slate-900 dark:text-slate-100 space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Kiểm soát bài viết đang lưu hành trên TrustNet</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Admin có quyền xóa vĩnh viễn hoặc dán nhãn cảnh báo tin giả/lừa đảo</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Lọc bài viết theo từ khóa..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-bold"
                />
              </div>

              <select
                value={postFilter}
                onChange={(e: any) => setPostFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 text-xs text-slate-900 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="all">Tất cả ({posts.length})</option>
                <option value="flagged">Tin nghi vấn/Tin giả ({flaggedPostsCount})</option>
                <option value="verified">Đã duyệt an toàn</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider text-[11px] border-b-2 border-slate-900">
                <tr>
                  <th className="py-3.5 px-4">Nội dung bài viết</th>
                  <th className="py-3.5 px-4">Tác giả</th>
                  <th className="py-3.5 px-4">Đánh giá AI</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs font-bold">
                      Không có bài viết nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 dark:text-slate-200 line-clamp-2">{post.content}</p>
                        {post.sourceUrl && (
                          <span className="text-[10px] text-blue-600 dark:text-cyan-400 truncate block mt-0.5 font-semibold">
                            🔗 {post.sourceUrl}
                          </span>
                        )}
                        <span 
                          title={formatFacebookFullTime(post.createdAt)} 
                          className="text-[10px] text-slate-500 block mt-0.5 cursor-pointer hover:underline font-semibold"
                        >
                          {formatFacebookTime(post.createdAt)} • ❤️ {post.likesCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img src={post.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-slate-900" />
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block">{post.author.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold">@{post.author.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <AiStatusBadge status={post.verificationStatus} score={post.verificationScore} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {post.verificationStatus === 'verified' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 border-2 border-slate-900 text-[10px] font-black shadow-[1px_1px_0_0_#0f172a]">
                            ✓ Đã xác thực
                          </span>
                        )}
                        {post.verificationStatus === 'unverified' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border-2 border-slate-900 text-[10px] font-black shadow-[1px_1px_0_0_#0f172a]">
                            Chờ kiểm chứng
                          </span>
                        )}
                        {(post.verificationStatus === 'suspicious' || post.verificationStatus === 'debunked') && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-900 dark:text-rose-400 border-2 border-slate-900 text-[10px] font-black shadow-[1px_1px_0_0_#0f172a]">
                            ⚠️ Tin giả / Lừa đảo
                          </span>
                        )}
                      </td>

                      {/* Admin Action Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                        
                        {/* Duyệt an toàn */}
                        <button
                          onClick={() => handleApprovePost(post.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-200 dark:bg-emerald-900/60 hover:bg-emerald-300 text-emerald-950 dark:text-emerald-200 border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a] text-[11px] font-black transition-all cursor-pointer"
                          title="Xác nhận nội dung an toàn"
                        >
                          Duyệt an toàn
                        </button>

                        {/* Gỡ/Gắn nhãn lừa đảo */}
                        <button
                          onClick={() => handleMarkFakeNews(post.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-950 dark:text-amber-200 border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a] text-[11px] font-black transition-all cursor-pointer"
                          title="Gắn nhãn cảnh báo tin giả / lừa đảo"
                        >
                          Gắn nhãn lừa đảo
                        </button>

                        {/* XOÁ VĨNH VIỄN */}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all inline-flex items-center gap-1 cursor-pointer"
                          title="Xóa vĩnh viễn bài đăng này khỏi hệ thống"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa bài</span>
                        </button>

                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </section>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REPORTS QUEUE (Xử lý báo cáo vi phạm từ người dùng)*/}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Danh sách báo cáo vi phạm từ cộng đồng ({reports.length})</h2>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-black">
              {pendingReportsCount} báo cáo đang chờ xử lý
            </span>
          </div>

          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] space-y-2.5 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" /> Người gửi báo cáo: {r.reporterName}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span 
                      title={formatFacebookFullTime(r.createdAt)} 
                      className="text-slate-500 cursor-pointer hover:underline font-semibold"
                    >
                      {formatFacebookTime(r.createdAt)}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a] ${
                    r.status === 'resolved' 
                      ? 'bg-emerald-100 text-emerald-900' 
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {r.status === 'resolved' ? '✓ Đã xử lý xong' : '⚠️ Chờ xử lý'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-900 text-slate-800 dark:text-slate-300 font-medium">
                  <span className="text-blue-700 dark:text-indigo-400 font-black">Tác giả bị tố cáo:</span> {r.postAuthor}
                  <p className="italic text-slate-600 dark:text-slate-400 mt-1">"{r.postSnippet}"</p>
                </div>

                <p className="text-slate-900 dark:text-slate-200 font-semibold">
                  <span className="text-rose-600 font-black">Lý do báo cáo: </span>
                  {r.reason}
                </p>

                {r.status === 'pending' && (
                  <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-200 dark:border-slate-800">
                    
                    {/* Gỡ bài đăng bị báo cáo ngay lập tức */}
                    <button
                      onClick={() => handleDeleteFromReport(r.postId, r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Gỡ bài vi phạm & Đóng báo cáo</span>
                    </button>

                    {/* Chỉ xác nhận xử lý mà không xóa */}
                    <button
                      onClick={() => handleResolveReport(r.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-900 dark:text-slate-100 font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Xác nhận đã xử lý</span>
                    </button>

                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB 3: USER MANAGEMENT (Nắm chính xác số lượng người dùng)*/}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
                <span>Danh sách tài khoản người dùng web ({accounts.length} người dùng)</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Toàn bộ người dùng đã đăng ký và đang hoạt động trên hệ sinh thái TrustNet.
              </p>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm người dùng theo tên, username..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-black uppercase tracking-wider text-[11px] border-b-2 border-slate-900">
                <tr>
                  <th className="py-3.5 px-4">Người dùng</th>
                  <th className="py-3.5 px-4">Email & Trường học</th>
                  <th className="py-3.5 px-4">Vai trò</th>
                  <th className="py-3.5 px-4">Điểm XP / Cấp bậc</th>
                  <th className="py-3.5 px-4">Hoạt động</th>
                  <th className="py-3.5 px-4 text-right">Quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={acc.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-slate-900" />
                        <div>
                          <span className="font-black text-slate-900 dark:text-white block">{acc.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">@{acc.username}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-900 dark:text-slate-200 font-bold block">{acc.email}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{acc.school || 'THPT Số 1 Phan Đình Phùng'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {acc.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border-2 border-slate-900 text-[10px] font-black shadow-[1px_1px_0_0_#0f172a]">
                          <Shield className="w-3 h-3 text-rose-600" />
                          <span>Admin Tối Cao</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-slate-900 text-[10px] font-bold">
                          <span>Học sinh / Thành viên</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-amber-700 dark:text-amber-400 font-mono block">{acc.points} XP</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{acc.rankTitle || 'Người kiểm chứng'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 dark:text-slate-300 font-bold block">Kiểm chứng: <strong>{acc.factChecksCount || 0}</strong></span>
                      <span className="text-[10px] text-slate-500 font-semibold">Tình huống: {acc.scenariosCompletedCount || 0}/12</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {acc.role === 'admin' ? (
                        <span className="text-[10px] text-slate-500 italic font-bold">Bảo vệ hệ thống</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(acc.id)}
                          className="px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border-2 border-slate-900 text-[11px] font-black transition-all cursor-pointer inline-flex items-center gap-1 shadow-[1px_1px_0_0_#0f172a]"
                          title="Xóa tài khoản người dùng vi phạm"
                        >
                          <UserX className="w-3.5 h-3.5 text-rose-600" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      )}

      {/* ======================================================== */}
      {/* TAB 4: STATS & ANALYTICS                                 */}
      {/* ======================================================== */}
      {activeTab === 'stats' && (
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 space-y-6 text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
              <span>Báo Cáo Phân Tích Tin Giả & An Toàn Số Quốc Gia</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold">Cập nhật thời gian thực</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-bold">
                <span>Số tin giả đã ngăn chặn:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black font-mono">100%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 w-full" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Tất cả bài viết có link lạ đều được đối soát qua Google Search Grounding và cơ sở dữ liệu VAFC.</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-bold">
                <span>Tỷ lệ hoàn thành kịch bản mô phỏng:</span>
                <span className="text-amber-700 dark:text-amber-400 font-black font-mono">78%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 overflow-hidden">
                <div className="h-full bg-amber-400 w-[78%]" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Học sinh THPT Số 1 Phan Đình Phùng tích cực rèn luyện phản xạ với 12 kịch bản an toàn số.</p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-slate-950 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 font-bold">
                <span>Thời gian phản hồi báo cáo:</span>
                <span className="text-cyan-700 dark:text-cyan-400 font-black font-mono">&lt; 15 phút</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 overflow-hidden">
                <div className="h-full bg-cyan-500 w-[92%]" />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Admin và hệ thống tự động xử lý các tin đồn độc hại ngay khi nhận báo cáo từ thành viên.</p>
            </div>

          </div>
        </section>
      )}

    </div>
  );
};
