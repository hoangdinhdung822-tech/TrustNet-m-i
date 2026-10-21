import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Post } from '../types';
import { DatabaseService } from '../services/dbMock';
import { AiStatusBadge } from './AiStatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onShareSuccess?: (postId: string) => void;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, post, onShareSuccess }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [sharedToast, setSharedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://trustnet.vn';
  const postUrl = `${currentOrigin}/?post=${post.id}`;

  const verdictLabel = 
    post.verificationStatus === 'verified' ? '🟢 ĐÃ KIỂM CHỨNG' :
    post.verificationStatus === 'suspicious' ? '🟠 ĐÁNG NGỜ - CẦN LƯU Ý' :
    post.verificationStatus === 'debunked' ? '🔴 CẢNH BÁO TIN GIẢ / LỪA ĐẢO' : '🟡 CHỜ XÁC MINH';

  // Văn bản định dạng sẵn để paste vào Zalo / Messenger / Facebook
  const factCheckSummaryText = `🛡️ [TRUSTNET AI FACT-CHECK: ${verdictLabel}]
Độ tin cậy: ${post.verificationScore}/100
📌 Bài đăng của: ${post.author.name} (@${post.author.username})
Nội dung: "${post.content.length > 120 ? post.content.slice(0, 117) + '...' : post.content}"
🔍 Phân tích AI: ${post.aiExplanation?.summary || 'Đã đối chiếu cơ sở dữ liệu chính thống.'}
💡 Khuyến nghị: ${post.aiExplanation?.recommendation || 'Kiểm tra nguồn tin trước khi chia sẻ.'}
🌐 Xem bài viết và tài liệu đối chiếu gốc tại: ${postUrl}`;

  const triggerRecordShare = (platformName: string) => {
    DatabaseService.sharePost(post.id);
    if (onShareSuccess) {
      onShareSuccess(post.id);
    }
    setSharedToast(`Đã ghi nhận chia sẻ qua ${platformName} (+5 XP)!`);
    setTimeout(() => setSharedToast(null), 3000);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopiedLink(true);
      triggerRecordShare('Liên kết');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCardText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(factCheckSummaryText);
      setCopiedCard(true);
      triggerRecordShare('Thẻ trích dẫn kiểm chứng');
      setTimeout(() => setCopiedCard(false), 2500);
    }
  };

  // 1. Chia sẻ Facebook
  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(`[TrustNet Fact-Check: ${verdictLabel}] ${post.content.slice(0, 80)}...`)}`;
    window.open(fbUrl, '_blank', 'width=620,height=520,toolbar=0,status=0');
    triggerRecordShare('Facebook');
  };

  // 2. Chia sẻ Zalo
  const handleShareZalo = () => {
    const zaloUrl = `https://sp.zalo.me/share_inline?link=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(factCheckSummaryText)}`;
    window.open(zaloUrl, '_blank', 'width=600,height=600,toolbar=0,status=0');
    triggerRecordShare('Zalo');
  };

  // 3. Chia sẻ Telegram
  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(`🛡️ [TrustNet: ${verdictLabel}]\n${post.content.slice(0, 100)}...`)}`;
    window.open(tgUrl, '_blank', 'width=600,height=500,toolbar=0,status=0');
    triggerRecordShare('Telegram');
  };

  // 4. Chia sẻ X (Twitter)
  const handleShareTwitter = () => {
    const tweetText = `🛡️ Kiểm chứng thông tin cùng TrustNet:\n"${post.content.slice(0, 90)}..."\nKết quả: ${verdictLabel} (${post.verificationScore}/100)`;
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(twUrl, '_blank', 'width=600,height=450,toolbar=0,status=0');
    triggerRecordShare('X (Twitter)');
  };

  // 5. Chia sẻ WhatsApp
  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(factCheckSummaryText)}`;
    window.open(waUrl, '_blank', 'width=600,height=500,toolbar=0,status=0');
    triggerRecordShare('WhatsApp');
  };

  // 6. Chia sẻ Email
  const handleShareEmail = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(`[TrustNet] Chia sẻ bài viết kiểm chứng an toàn số`)}&body=${encodeURIComponent(factCheckSummaryText)}`;
    window.location.href = mailto;
    triggerRecordShare('Email');
  };

  // 7. Chia sẻ qua Menu Thiết bị (Web Share API - Dành cho Mobile/Tablet)
  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);
  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: `TrustNet: ${post.author.name}`,
          text: `[${verdictLabel}] ${post.content.slice(0, 100)}...`,
          url: postUrl
        });
        triggerRecordShare('Ứng dụng hệ thống');
      } catch (err) {
        // User cancelled share
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Toast confirmation */}
        {sharedToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xl animate-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{sharedToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Chia sẻ bài đăng ra ngoài</h2>
              <p className="text-xs text-slate-400">Lan tỏa tin tức đã kiểm chứng đến người thân & mạng xã hội</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1">
          
          {/* Post Snippet Card Preview */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                />
                <div>
                  <span className="font-bold text-xs text-white block">{post.author.name}</span>
                  <span className="text-[10px] text-slate-500">@{post.author.username}</span>
                </div>
              </div>
              <AiStatusBadge status={post.verificationStatus} score={post.verificationScore} size="sm" />
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 italic">
              "{post.content}"
            </p>
          </div>

          {/* Section 1: External Social Media Channels */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              1. Chia sẻ trực tiếp qua mạng xã hội
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              
              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-blue-950/40 border border-blue-600/30 hover:border-blue-500 hover:bg-blue-900/40 text-blue-300 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
                title="Chia sẻ lên Facebook"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                  f
                </div>
                <span className="text-[11px]">Facebook</span>
              </button>

              {/* Zalo */}
              <button
                onClick={handleShareZalo}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-sky-950/40 border border-sky-600/30 hover:border-sky-500 hover:bg-sky-900/40 text-sky-300 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
                title="Chia sẻ qua Zalo"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-extrabold text-xs shadow-sm group-hover:scale-105 transition-transform">
                  Zalo
                </div>
                <span className="text-[11px]">Zalo</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleShareTelegram}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-600/30 hover:border-cyan-500 hover:bg-cyan-900/40 text-cyan-300 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
                title="Chia sẻ qua Telegram"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <span className="text-[11px]">Telegram</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={handleShareTwitter}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-slate-500 hover:bg-slate-800 text-slate-200 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
                title="Chia sẻ lên X (Twitter)"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-extrabold text-xs shadow-sm group-hover:scale-105 transition-transform">
                  𝕏
                </div>
                <span className="text-[11px]">X (Twitter)</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-600/30 hover:border-emerald-500 hover:bg-emerald-900/40 text-emerald-300 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
                title="Chia sẻ qua WhatsApp"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4 h-4 fill-current" />
                </div>
                <span className="text-[11px]">WhatsApp</span>
              </button>

              {/* Email */}
              <button
                onClick={handleShareEmail}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-950/40 border border-purple-600/30 hover:border-purple-500 hover:bg-purple-900/40 text-purple-300 text-xs font-semibold gap-1.5 transition-all group cursor-pointer"
                title="Chia sẻ qua Email"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[11px]">Email</span>
              </button>

            </div>
          </div>

          {/* Native OS Share Button (nếu trình duyệt hỗ trợ) */}
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mở danh sách chia sẻ của thiết bị (Zalo, Messenger, SMS...)</span>
            </button>
          )}

          {/* Section 2: Copy Direct Post Link */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              2. Sao chép liên kết trực tiếp
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={postUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Đã sao chép!' : 'Sao chép link'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Copy Formatted AI Fact-Check Summary (Dành riêng cho nhóm chat Zalo/Facebook) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                3. Sao chép Thẻ Đánh Giá AI (Gửi vào nhóm lớp, Zalo, Messenger)
              </span>
              <button
                onClick={handleCopyCardText}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  copiedCard
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {copiedCard ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCard ? 'Đã sao chép thẻ!' : 'Sao chép nội dung'}</span>
              </button>
            </div>
            <pre className="text-[11px] text-slate-300 font-sans whitespace-pre-wrap bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed max-h-32 overflow-y-auto">
              {factCheckSummaryText}
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Mỗi lượt chia sẻ tin xác thực được thưởng <strong>+5 XP</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
