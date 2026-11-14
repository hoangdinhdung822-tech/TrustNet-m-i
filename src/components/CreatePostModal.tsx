import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { AiVerificationService } from '../services/aiService';
import { DatabaseService } from '../services/dbMock';
import { AiVerificationResult, Post, User } from '../types';
import { AiStatusBadge } from './AiStatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onPostCreated
}) => {
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showSourceInput, setShowSourceInput] = useState(false);

  // AI Verification State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [aiResult, setAiResult] = useState<AiVerificationResult | null>(null);

  if (!isOpen) return null;

  const handleStartVerification = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const result = await AiVerificationService.verifyContent(content, sourceUrl, (step) => {
        setAnalysisStep(step);
      });
      setAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = () => {
    if (!content.trim() || !aiResult) return;

    const nowIso = new Date().toISOString();

    const newPost: Post = {
      id: 'post-' + Date.now(),
      userId: currentUser.id,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
        rankTitle: currentUser.rankTitle,
        isVerifiedUser: true
      },
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      verificationStatus: aiResult.status,
      verificationScore: aiResult.score,
      aiExplanation: aiResult,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      likedBy: [],
      sharedBy: [],
      isLiked: false,
      isSaved: false,
      createdAt: nowIso
    };

    DatabaseService.createPost(newPost);
    
    // Tạo thông báo thực tế từ AI kiểm chứng và nhận thưởng XP
    DatabaseService.addNotification({
      userId: currentUser.id,
      actor: {
        id: 'u-system',
        name: 'Hệ Thống TrustNet AI',
        username: 'trustnet_ai',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'
      },
      type: 'fact_check',
      title: `AI đã kiểm chứng bài viết của bạn: ${aiResult.status === 'verified' ? 'Đã kiểm chứng' : aiResult.status === 'suspicious' ? 'Đáng ngờ' : aiResult.status === 'debunked' ? 'Cảnh báo tin giả' : 'Chờ xác minh'} (${aiResult.score}/100)`,
      content: `${aiResult.summary} (Đã cộng +25 XP vào tài khoản)`,
      targetPostId: newPost.id,
      targetTab: 'feed'
    });

    onPostCreated(newPost);
    
    // Reset form
    setContent('');
    setSourceUrl('');
    setImageUrl('');
    setAiResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0_0_#0f172a] relative text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-400 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">Tạo bài viết mới & Kiểm chứng AI</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Đăng tin có trách nhiệm – AI tự động hỗ trợ xác minh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white bg-mint-50 dark:bg-slate-800 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all hover:-translate-y-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          
          {/* Author snippet */}
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]" 
            />
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                {currentUser.name}
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-mint-100 text-slate-900 dark:bg-indigo-950 dark:text-indigo-300 border border-slate-900 font-bold">
                  {currentUser.rankTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Mọi bài đăng sẽ được AI cấp chứng chỉ kiểm chứng trước khi công khai</p>
            </div>
          </div>

          {/* Text input area */}
          <div>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (aiResult) setAiResult(null); // Reset analysis if text changes
              }}
              placeholder="Bạn muốn chia sẻ thông tin hoặc phát hiện tin tức gì hôm nay? Đừng quên đính kèm nguồn để đạt điểm uy tín cao..."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl bg-mint-50/50 dark:bg-slate-950/70 border-2 border-slate-900 focus:border-blue-600 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all resize-none shadow-[2px_2px_0_0_#0f172a] font-medium"
            />
          </div>

          {/* Optional Attachments Toggle */}
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-bold">
            <button
              type="button"
              onClick={() => setShowSourceInput(!showSourceInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all ${
                showSourceInput || sourceUrl
                  ? 'bg-blue-100 dark:bg-cyan-950/50 border-slate-900 text-blue-700 dark:text-cyan-300 shadow-[2px_2px_0_0_#0f172a]'
                  : 'bg-white dark:bg-slate-800/50 border-slate-900 hover:bg-mint-100'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Đính kèm nguồn chính thức</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all ${
                showImageInput || imageUrl
                  ? 'bg-blue-100 dark:bg-indigo-950/50 border-slate-900 text-blue-700 dark:text-indigo-300 shadow-[2px_2px_0_0_#0f172a]'
                  : 'bg-white dark:bg-slate-800/50 border-slate-900 hover:bg-mint-100'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Thêm ảnh minh họa</span>
            </button>
          </div>

          {/* Source URL Input */}
          {(showSourceInput || sourceUrl) && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-900 space-y-1 animate-in fade-in shadow-[2px_2px_0_0_#0f172a]">
              <label className="text-[11px] font-black text-blue-700 dark:text-cyan-400 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                Đường dẫn liên kết nguồn (VD: https://chinhphu.vn/...):
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => {
                  setSourceUrl(e.target.value);
                  if (aiResult) setAiResult(null);
                }}
                placeholder="https://tuoitre.vn/bai-viet-goc..."
                className="w-full px-3.5 py-2 rounded-xl bg-mint-50 dark:bg-slate-900 border-2 border-slate-900 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none font-medium"
              />
            </div>
          )}

          {/* Image URL Input */}
          {(showImageInput || imageUrl) && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-900 space-y-1 animate-in fade-in shadow-[2px_2px_0_0_#0f172a]">
              <label className="text-[11px] font-black text-blue-700 dark:text-indigo-400 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                URL hình ảnh trực quan:
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-mint-50 dark:bg-slate-900 border-2 border-slate-900 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none font-medium"
              />
            </div>
          )}

          {/* AI Scanning Banner Animation */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-indigo-950/50 border-2 border-slate-900 space-y-3 animate-pulse shadow-[3px_3px_0_0_#0f172a]">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-cyan-400 animate-spin" />
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  {analysisStep || 'Hệ thống AI đang khởi động kiểm tra chéo dữ liệu...'}
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 animate-shimmer" style={{ width: '100%' }} />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                * AI phân tích tính nhất quán, tra cứu cổng thông tin chính thống và cảnh báo dấu hiệu bóp méo ngữ cảnh.
              </p>
            </div>
          )}

          {/* AI Result Card Preview */}
          {aiResult && !isAnalyzing && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-900 space-y-3 animate-in zoom-in-95 duration-200 shadow-[3px_3px_0_0_#0f172a]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
                  Kết quả đánh giá từ AI Trợ lý:
                </span>
                <AiStatusBadge status={aiResult.status} score={aiResult.score} />
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-mint-50 dark:bg-slate-900/80 p-3.5 rounded-xl border-2 border-slate-900">
                <p className="font-black text-slate-900 dark:text-white mb-1">
                  {aiResult.summary}
                </p>
                <p className="text-slate-700 dark:text-slate-400 font-medium">
                  <span className="text-blue-700 dark:text-indigo-300 font-bold">Lý do: </span>
                  {aiResult.reasoning}
                </p>
              </div>

              {/* Claims Breakdown */}
              {aiResult.claims.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-400">Các tuyên bố chính phát hiện:</span>
                  <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-0.5 font-medium">
                    {aiResult.claims.map((c, i) => (
                      <li key={i} className="line-clamp-1">{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              <div className="text-xs p-3 rounded-xl bg-amber-100 dark:bg-amber-500/10 border-2 border-slate-900 text-amber-950 dark:text-amber-300 shadow-[2px_2px_0_0_#0f172a] font-medium">
                <span className="font-black">Khuyến nghị: </span>
                {aiResult.recommendation}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 dark:text-slate-500 font-bold hidden sm:block">
            {aiResult ? '✨ Đã sẵn sàng xuất bản' : '⚠️ Cần kiểm chứng AI trước khi đăng'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white bg-mint-50 dark:bg-slate-800 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all"
            >
              Hủy
            </button>

            {!aiResult ? (
              <button
                type="button"
                onClick={handleStartVerification}
                disabled={!content.trim() || isAnalyzing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Kiểm tra bằng AI trước khi đăng</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartVerification}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] text-xs transition-all"
                  title="Kiểm tra lại"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận xuất bản (+25 XP)</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
