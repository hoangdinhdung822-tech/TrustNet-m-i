import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle, Flag } from 'lucide-react';
import { DatabaseService } from '../services/dbMock';
import { Post } from '../types';

interface Props {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onReportSuccess?: () => void;
}

const REPORT_REASONS = [
  'Thông tin sai sự thật / Tin giả nguy hiểm về sức khỏe & an ninh',
  'Dấu hiệu lừa đảo, chiếm đoạt tài sản hoặc yêu cầu nạp tiền / OTP',
  'Đường link giả mạo (Phishing) mạo danh ngân hàng hoặc thương hiệu',
  'Ngôn ngữ thù ghét, kích động bạo lực, chia rẽ vùng miền',
  'Sử dụng công nghệ Deepfake bôi nhọ danh dự người khác',
  'Nội dung quảng cáo rác (Spam) hoặc mã độc đính kèm'
];

export const ReportModal: React.FC<Props> = ({ post, isOpen, onClose, onReportSuccess }) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = details.trim() ? `${selectedReason} - Ghi chú thêm: ${details}` : selectedReason;
    DatabaseService.createReport(
      post.id,
      post.content.slice(0, 100) + '...',
      post.author.name,
      finalReason
    );
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      if (onReportSuccess) onReportSuccess();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0_0_#0f172a] relative text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white bg-mint-50 dark:bg-slate-800 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all hover:-translate-y-0.5"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-2 border-slate-900 flex items-center justify-center shadow-[3px_3px_0_0_#0f172a]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Báo cáo đã được ghi nhận!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto font-medium">
              Cảm ơn bạn đã bảo vệ không gian mạng an toàn. Bài viết đã được chuyển vào hàng đợi kiểm duyệt AI & Admin. (+10 XP)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-900">
              <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Báo cáo nội dung đáng ngờ</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Giúp TrustNet giữ vững môi trường thông tin minh bạch</p>
              </div>
            </div>

            {/* Target Post Snippet */}
            <div className="p-3.5 rounded-2xl bg-mint-50/70 dark:bg-slate-950/60 border-2 border-slate-900 text-xs text-slate-800 dark:text-slate-300 shadow-[2px_2px_0_0_#0f172a]">
              <span className="font-black text-blue-700 dark:text-indigo-400">Người đăng:</span> {post.author.name} ({post.author.username})
              <p className="mt-1 line-clamp-2 italic text-slate-600 dark:text-slate-400 font-medium">"{post.content}"</p>
            </div>

            {/* Reason Options */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 dark:text-slate-300 block">
                Chọn lý do báo cáo:
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-3 p-3 rounded-xl text-xs cursor-pointer border-2 transition-all ${
                      selectedReason === reason
                        ? 'bg-rose-100 dark:bg-rose-950/40 border-slate-900 text-rose-950 dark:text-white font-bold shadow-[2px_2px_0_0_#0f172a]'
                        : 'bg-white dark:bg-slate-950/40 border-slate-900 text-slate-700 dark:text-slate-400 font-medium hover:bg-mint-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="mt-0.5 text-rose-600 focus:ring-0"
                    />
                    <span className="leading-tight">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="text-xs font-black text-slate-800 dark:text-slate-300 block mb-1">
                Ghi chú thêm (bằng chứng hoặc liên kết đối chiếu):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="VD: Thông tin này vừa bị đính chính trên báo Tuổi Trẻ lúc 14h..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-mint-50/50 dark:bg-slate-950 border-2 border-slate-900 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium shadow-[2px_2px_0_0_#0f172a] transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-black bg-mint-50 dark:bg-slate-800 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Gửi báo cáo</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
