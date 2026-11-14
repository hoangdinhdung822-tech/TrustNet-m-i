import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Target, 
  Gamepad2, 
  Award, 
  Filter, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';
import { Post, User, Scenario } from '../types';
import { PostCard } from '../components/PostCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { ReportModal } from '../components/ReportModal';
import { DatabaseService } from '../services/dbMock';

interface Props {
  user: User;
  onUserUpdate: (u: User) => void;
  setActiveTab: (tab: string) => void;
}

export const HomeFeed: React.FC<Props> = ({ user, onUserUpdate, setActiveTab }) => {
  const [posts, setPosts] = useState<Post[]>(DatabaseService.getPosts());
  const [scenarios] = useState<Scenario[]>(DatabaseService.getScenarios());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [, setTick] = useState(0);

  // Tự động làm mới thời gian tương đối ("Vừa xong", "1 phút trước", ...) mỗi 30s như Facebook
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Featured Daily Scenario (Tình huống hôm nay)
  const todayScenario = scenarios.find(s => !s.isCompleted) || scenarios[0];

  const handleLikeToggle = (postId: string) => {
    const updated = DatabaseService.toggleLike(postId);
    setPosts(updated);
  };

  const handleSharePost = (postId: string) => {
    const updated = DatabaseService.getPosts();
    setPosts(updated);
    onUserUpdate(DatabaseService.getCurrentUser());
  };

  const handleCommentAdded = (postId: string) => {
    const updated = DatabaseService.getPosts();
    setPosts(updated);
    onUserUpdate(DatabaseService.getCurrentUser());
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    onUserUpdate(DatabaseService.getCurrentUser());
  };

  const filteredPosts = posts.filter(p => {
    if (filterStatus === 'all') return true;
    return p.verificationStatus === filterStatus;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Section 17: Welcome Banner & Daily Stats Dashboard */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-5 md:p-6 text-slate-900 dark:text-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-2 px-3 py-1 rounded-full border border-blue-300 dark:border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span>Bảng theo dõi kỹ năng số</span>
            </div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              👋 Xin chào, {user.name}!
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
              Hôm nay bạn đã kiểm chứng <span className="font-bold text-blue-600 dark:text-cyan-400 underline decoration-yellow-400 decoration-2">3 thông tin</span> mới. Hãy giữ vững phản biện số nhé!
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs md:text-sm border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đăng bài & Kiểm chứng AI</span>
          </button>
        </div>

        {/* 4 KPI Grid Cards as requested in Section 17 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          
          <div className="p-3.5 rounded-2xl bg-mint-50 dark:bg-slate-950/80 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] flex flex-col justify-between">
            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {user.factChecksCount}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
              <span>Bài đã kiểm tra</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-mint-50 dark:bg-slate-950/80 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] flex flex-col justify-between">
            <span className="text-2xl md:text-3xl font-black text-blue-600 dark:text-cyan-400 font-mono">
              {user.quizAccuracy}%
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <Target className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Độ chính xác quiz</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-mint-50 dark:bg-slate-950/80 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] flex flex-col justify-between">
            <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {user.scenariosCompletedCount}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tình huống xong</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-yellow-50 dark:bg-slate-950/80 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] flex flex-col justify-between">
            <span className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-300 font-mono flex items-center gap-1">
              {user.points} <span className="text-xs text-amber-600 dark:text-amber-500 font-black">XP</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 mt-1 font-bold">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Điểm kỹ năng số</span>
            </div>
          </div>

        </div>

      </section>

      {/* Featured Daily Scenario Card (Tình huống hôm nay) */}
      {todayScenario && (
        <section className="p-4 md:p-5 rounded-3xl bg-amber-100 dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-400 border-2 border-slate-900 text-slate-950 shrink-0 shadow-[2px_2px_0_0_#0f172a]">
              <Flame className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-400">
                  🔥 Tình huống hôm nay
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-indigo-500/20 text-slate-900 dark:text-indigo-300 border border-slate-900 font-black shadow-[1px_1px_0_0_#0f172a]">
                  +{todayScenario.pointsReward} XP
                </span>
              </div>
              <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {todayScenario.title}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                {todayScenario.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('scenarios')}
            className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>Luyện tập ngay</span>
          </button>
        </section>
      )}

      {/* Quick Create Post Bar */}
      <div 
        onClick={() => setIsCreateModalOpen(true)}
        className="p-3.5 md:p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all group"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]"
        />
        <div className="flex-1 px-4 py-2.5 rounded-2xl bg-mint-50 dark:bg-slate-950 border-2 border-slate-900 text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
          Chia sẻ thông tin mới hoặc dán đường link cần AI kiểm chứng...
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-black border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kiểm tra</span>
        </button>
      </div>

      {/* Social Feed Filter Chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-800 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Lọc:
          </span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'verified', label: '🟢 Đã kiểm chứng' },
            { id: 'suspicious', label: '🟠 Đáng ngờ' },
            { id: 'debunked', label: '🔴 Cảnh báo' },
            { id: 'unverified', label: '🟡 Chờ xác minh' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterStatus(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap border-2 transition-all ${
                filterStatus === chip.id
                  ? 'bg-blue-600 text-white border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 dark:border-slate-800 hover:bg-mint-100 dark:hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-5">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onReportClick={(p) => setReportingPost(p)}
            onSharePost={handleSharePost}
            onCommentAdded={handleCommentAdded}
          />
        ))}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={user}
        onPostCreated={handlePostCreated}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={Boolean(reportingPost)}
        post={reportingPost}
        onClose={() => setReportingPost(null)}
        onReportSuccess={() => onUserUpdate(DatabaseService.getCurrentUser())}
      />

    </div>
  );
};
