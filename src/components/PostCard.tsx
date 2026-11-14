import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Flag, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Sparkles,
  Send
} from 'lucide-react';
import { Post, Comment } from '../types';
import { AiStatusBadge } from './AiStatusBadge';
import { ShareModal } from './ShareModal';
import { DatabaseService } from '../services/dbMock';
import { formatFacebookTime, formatFacebookFullTime } from '../utils/timeAgo';

interface Props {
  post: Post;
  onLikeToggle: (postId: string) => void;
  onReportClick: (post: Post) => void;
  onSharePost?: (postId: string) => void;
  onCommentAdded?: (postId: string) => void;
}

export const PostCard: React.FC<Props> = ({ 
  post, 
  onLikeToggle, 
  onReportClick,
  onSharePost,
  onCommentAdded 
}) => {
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() => DatabaseService.getComments(post.id));
  const [newCommentText, setNewCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const currentUser = DatabaseService.getCurrentUser();

  // Đồng bộ bình luận thời gian thực để mọi người dùng đều thấy bình luận của nhau ngay lập tức
  useEffect(() => {
    const handleCommentEvent = (e?: any) => {
      if (!e?.detail?.postId || e.detail.postId === post.id) {
        setComments(DatabaseService.getComments(post.id));
      }
    };
    window.addEventListener('trustnet_comment_event', handleCommentEvent);
    window.addEventListener('storage', handleCommentEvent);
    return () => {
      window.removeEventListener('trustnet_comment_event', handleCommentEvent);
      window.removeEventListener('storage', handleCommentEvent);
    };
  }, [post.id]);

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const created = DatabaseService.addComment(post.id, newCommentText.trim());
    setComments(DatabaseService.getComments(post.id));
    setNewCommentText('');
    setShowComments(true);
    if (onCommentAdded) {
      onCommentAdded(post.id);
    }
  };

  const handleLikeComment = (commentId: string) => {
    DatabaseService.toggleLikeComment(commentId);
    setComments(DatabaseService.getComments(post.id));
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const ai = post.aiExplanation;

  return (
    <article className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-5 md:p-6 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-all hover:-translate-y-0.5">
      {/* Post Header: Author info & AI Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-indigo-300 cursor-pointer">
                {post.author.name}
              </h3>
              {post.author.isVerifiedUser && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 fill-blue-500/20" />
              )}
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-mint-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-300 border border-slate-900 dark:border-slate-700/60 font-bold">
                {post.author.rankTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              <span>@{post.author.username}</span>
              <span>•</span>
              <span 
                title={formatFacebookFullTime(post.createdAt)} 
                className="hover:underline cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {formatFacebookTime(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Badge */}
        <div className="shrink-0">
          <AiStatusBadge 
            status={post.verificationStatus} 
            score={post.verificationScore} 
            size="sm" 
          />
        </div>

      </div>

      {/* Post Text Body */}
      <div className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 mb-4 font-normal">
        <p className="whitespace-pre-line">{post.content}</p>

        {/* Source link badge if present */}
        {post.sourceUrl && (
          <div className="pt-1">
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-cyan-950/40 border-2 border-slate-900 dark:border-cyan-500/30 text-blue-700 dark:text-cyan-300 text-xs font-bold hover:bg-blue-100 transition-colors shadow-[2px_2px_0_0_#0f172a]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="truncate max-w-xs md:max-w-md">Nguồn bài viết: {post.sourceUrl}</span>
            </a>
          </div>
        )}
      </div>

      {/* Post Image Preview */}
      {post.imageUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border-2 border-slate-900 bg-slate-950 shadow-[2px_2px_0_0_#0f172a]">
          <img
            src={post.imageUrl}
            alt="Hình ảnh bài đăng"
            className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Expandable AI In-Depth Fact-Check Accordion */}
      <div className="mb-4 rounded-2xl border-2 border-slate-900 bg-mint-50/60 dark:bg-slate-950/60 overflow-hidden shadow-[2px_2px_0_0_#0f172a]">
        <button
          onClick={() => setShowAiDetails(!showAiDetails)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs md:text-sm font-bold text-slate-900 dark:text-slate-300 hover:text-black dark:hover:text-white bg-mint-100/80 dark:bg-slate-900/40 hover:bg-mint-200/80 dark:hover:bg-slate-900 transition-colors border-b-2 border-slate-900"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span>Tại sao AI đánh giá: </span>
            <span className={`font-black ${
              post.verificationStatus === 'verified' ? 'text-emerald-700 dark:text-emerald-400' :
              post.verificationStatus === 'suspicious' ? 'text-orange-700 dark:text-orange-400' :
              post.verificationStatus === 'debunked' ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
              {ai.summary}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-bold">
            <span>{showAiDetails ? 'Thu gọn' : 'Xem chi tiết'}</span>
            {showAiDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAiDetails && (
          <div className="p-4 space-y-3.5 text-xs text-slate-800 dark:text-slate-300 animate-in fade-in duration-200">
            
            {/* Reasoning */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
              <span className="font-black text-slate-900 dark:text-slate-200 block mb-1">🔍 Phân tích của AI:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{ai.reasoning}</p>
            </div>

            {/* Claims Breakdown */}
            {ai.claims && ai.claims.length > 0 && (
              <div>
                <span className="font-black text-slate-800 dark:text-slate-400 block mb-1">📌 Các luận điểm (Claims) được kiểm tra:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300 font-medium">
                  {ai.claims.map((claim, idx) => (
                    <li key={idx} className="leading-snug">{claim}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supporting or Refuting Evidence */}
            {ai.supportingEvidence && ai.supportingEvidence.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-slate-900 text-emerald-950 dark:text-emerald-300 shadow-[2px_2px_0_0_#0f172a]">
                <span className="font-black block mb-1">✅ Bằng chứng hỗ trợ:</span>
                <ul className="list-disc list-inside space-y-0.5 font-medium">
                  {ai.supportingEvidence.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {ai.refutingEvidence && ai.refutingEvidence.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border-2 border-slate-900 text-rose-950 dark:text-rose-300 shadow-[2px_2px_0_0_#0f172a]">
                <span className="font-black block mb-1">❌ Bằng chứng mâu thuẫn / Cảnh báo:</span>
                <ul className="list-disc list-inside space-y-0.5 font-medium">
                  {ai.refutingEvidence.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Misleading Terms */}
            {ai.misleadingTerms && ai.misleadingTerms.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-orange-700 dark:text-orange-400">⚠️ Từ ngữ giật gân phát hiện:</span>
                {ai.misleadingTerms.map((term, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 dark:bg-orange-500/10 dark:text-orange-300 border border-slate-900 font-bold text-[11px] shadow-[1px_1px_0_0_#0f172a]">
                    "{term}"
                  </span>
                ))}
              </div>
            )}

            {/* Sources Reference */}
            {ai.sources && ai.sources.length > 0 && (
              <div>
                <span className="font-black text-slate-800 dark:text-slate-400 block mb-1">🌐 Nguồn tham khảo đối chiếu:</span>
                <div className="flex flex-wrap gap-2">
                  {ai.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-mint-100 text-blue-700 dark:text-indigo-300 border-2 border-slate-900 text-[11px] font-bold shadow-[2px_2px_0_0_#0f172a] transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{s.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation Footer */}
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-400 italic pt-2 border-t-2 border-slate-900/40">
              💡 Khuyến nghị người đọc: {ai.recommendation}
            </div>

          </div>
        )}
      </div>

      {/* Interactions Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-slate-900/80 text-xs md:text-sm text-slate-700 dark:text-slate-400 font-bold">
        
        {/* Like */}
        <button
          onClick={() => onLikeToggle(post.id)}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border-2 transition-all ${
            post.isLiked 
              ? 'text-rose-600 bg-rose-100 border-slate-900 shadow-[2px_2px_0_0_#0f172a] font-black' 
              : 'border-transparent hover:border-slate-900 hover:bg-mint-50 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{post.likesCount}</span>
        </button>

        {/* Comment Drawer Toggle */}
        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border-2 transition-colors cursor-pointer ${
            showComments ? 'text-blue-700 bg-blue-100 border-slate-900 shadow-[2px_2px_0_0_#0f172a] font-black' : 'border-transparent hover:border-slate-900 hover:bg-mint-50 dark:hover:bg-slate-800'
          }`}
          title="Xem và gửi bình luận"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{comments.length}</span>
        </button>

        {/* Share Button (Mở Modal Chia sẻ ra ngoài) */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border-2 border-transparent hover:border-slate-900 hover:bg-mint-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Chia sẻ bài viết ra mạng xã hội ngoài"
        >
          <Share2 className="w-4 h-4" />
          <span>{post.sharesCount}</span>
        </button>

        {/* Save Bookmark */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`p-2 rounded-xl border-2 transition-colors ${
            isSaved ? 'text-amber-600 bg-amber-100 border-slate-900 shadow-[2px_2px_0_0_#0f172a]' : 'border-transparent hover:border-slate-900 hover:bg-mint-50 dark:hover:bg-slate-800'
          }`}
          title={isSaved ? 'Đã lưu' : 'Lưu bài viết'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Report Button */}
        <button
          onClick={() => onReportClick(post)}
          className="flex items-center gap-1 py-1.5 px-3 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-2 border-transparent hover:border-slate-900 transition-colors"
          title="Báo cáo nội dung đáng ngờ"
        >
          <Flag className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold">Báo cáo</span>
        </button>

      </div>

      {/* Hiển thị tóm tắt bình luận công khai khi chưa mở rộng */}
      {!showComments && comments.length > 0 && (
        <div className="mt-3 pt-3 border-t-2 border-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowComments(true)}
              className="text-xs text-blue-700 dark:text-indigo-400 hover:underline font-black flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Xem tất cả {comments.length} bình luận từ cộng đồng...</span>
            </button>
            <span className="text-[11px] text-slate-500 font-medium">
              Mới nhất: {formatFacebookTime(comments[comments.length - 1].createdAt)}
            </span>
          </div>

          {/* Preview bình luận mới nhất của cộng đồng */}
          {comments.slice(-1).map((latest) => (
            <div 
              key={latest.id} 
              onClick={() => setShowComments(true)}
              className="p-3 rounded-2xl bg-mint-50 dark:bg-slate-950/70 border-2 border-slate-900 flex items-start gap-2.5 text-xs cursor-pointer hover:bg-mint-100 transition-colors shadow-[2px_2px_0_0_#0f172a]"
            >
              <img
                src={latest.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={latest.author.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-900 shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <span className="font-black text-slate-900 dark:text-indigo-300 mr-1.5">{latest.author.name}:</span>
                <span className="text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">{latest.content}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments Section Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t-2 border-slate-900 space-y-3.5 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
              <span>Bình luận & Thảo luận công khai ({comments.length})</span>
            </h4>
            <button
              onClick={() => setShowComments(false)}
              className="text-xs font-bold text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              Thu gọn
            </button>
          </div>

          {/* Comment list của mọi người */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-500 italic py-3 text-center bg-mint-50 dark:bg-slate-950/50 rounded-2xl border-2 border-slate-900">
                Chưa có bình luận nào. Hãy là người đầu tiên trao đổi góc nhìn phản biện!
              </p>
            ) : (
              comments.map((c) => {
                const isCommentLiked = Boolean(c.likedBy && c.likedBy.includes(currentUser.id));
                return (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
                    <img
                      src={c.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={c.author.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-slate-900 shrink-0 mt-0.5 shadow-[1px_1px_0_0_#0f172a]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/90 border-2 border-slate-900 space-y-1 shadow-[2px_2px_0_0_#0f172a]">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 dark:text-indigo-300 hover:underline cursor-pointer">
                              {c.author.name}
                            </span>
                            {c.author.rankTitle && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-mint-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300 border border-slate-900 font-bold">
                                {c.author.rankTitle}
                              </span>
                            )}
                          </div>
                          {c.author.username && (
                            <span className="text-[10px] text-slate-500">@{c.author.username}</span>
                          )}
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed break-words font-medium">{c.content}</p>
                      </div>

                      {/* Comment Actions: Like, Time, Reply */}
                      <div className="flex items-center gap-3 px-2 text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                        <span 
                          title={formatFacebookFullTime(c.createdAt)} 
                          className="cursor-pointer hover:underline text-slate-500 hover:text-slate-800"
                        >
                          {formatFacebookTime(c.createdAt)}
                        </span>
                        <span>•</span>
                        <button 
                          type="button" 
                          onClick={() => handleLikeComment(c.id)}
                          className={`flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                            isCommentLiked ? 'text-rose-600' : 'hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${isCommentLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{c.likesCount || 0 > 0 ? c.likesCount : 'Thích'}</span>
                        </button>
                        <span>•</span>
                        <button 
                          type="button" 
                          onClick={() => setNewCommentText(`@${c.author.username || c.author.name} `)}
                          className="font-bold hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          Trả lời
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add comment input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-slate-900 shrink-0 shadow-[1px_1px_0_0_#0f172a]"
            />
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Viết nhận xét hoặc cung cấp thêm nguồn xác minh phản biện..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-900 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-[2px_2px_0_0_#0f172a]"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all cursor-pointer hover:-translate-y-0.5"
              title="Gửi bình luận"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Share Modal - Cho phép chia sẻ bài đăng ra ngoài */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={post}
        onShareSuccess={onSharePost}
      />

    </article>
  );
};
