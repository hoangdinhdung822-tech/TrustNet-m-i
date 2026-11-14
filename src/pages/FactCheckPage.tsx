import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Loader2, 
  Settings,
  Zap,
  Shield,
  X,
  Globe,
  AlertTriangle,
  Clock,
  Calendar,
  Layers
} from 'lucide-react';
import { AiVerificationService } from '../services/aiService';
import { DatabaseService } from '../services/dbMock';
import { AiVerificationResult, FactCheckRecord, User } from '../types';
import { AiStatusBadge } from '../components/AiStatusBadge';
import { FRONTEND_GEMINI_CONFIG } from '../config/geminiConfig';

interface FactCheckResultViewProps {
  result: AiVerificationResult;
  scrollToSource: (index: number) => void;
}

const FactCheckResultView: React.FC<FactCheckResultViewProps> = ({ result, scrollToSource }) => {
  const isFalse = result.verdict === 'FALSE' || result.status === 'debunked' || result.directVerdict === 'SAI';
  const isTrue = result.verdict === 'TRUE' || result.status === 'verified' || result.directVerdict === 'ĐÚNG';
  const isMisleading = result.verdict === 'MISLEADING' || result.status === 'suspicious' || result.directVerdict === 'CẢNH BÁO';

  // Tính điểm tin cậy thực tế của thông tin (Credibility Score)
  const credibilityScore = isFalse
    ? (result.score !== undefined && result.score <= 20 ? result.score : Math.max(4, Math.min(12, 100 - (result.confidence || 90))) || 8)
    : isTrue
    ? (result.score ?? result.confidence ?? 92)
    : isMisleading
    ? (result.score !== undefined && result.score <= 50 ? result.score : 35)
    : (result.score !== undefined && result.score <= 35 ? result.score : 15);

  const keyEvidence = result.keyEvidence ?? [];
  const limitations = result.limitations ?? result.unverifiedPoints ?? [];
  const searchQueries = result.searchQueries ?? result.googleSearchQueries ?? [];
  const sources = result.sources ?? [];

  return (
    <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[6px_6px_0_0_#0f172a] rounded-3xl p-6 md:p-8 space-y-7 animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
      
      {/* Top Header: BÁO CÁO KIỂM CHỨNG & VERDICT BADGE & SCORE */}
      <div className="pb-6 border-b-2 border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-700 dark:text-indigo-400">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              BÁO CÁO KIỂM CHỨNG
            </span>
            {result.modelUsed && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-950/60 text-blue-900 dark:text-cyan-300 border border-slate-900 text-[10px] font-mono font-bold flex items-center gap-1 shadow-[1px_1px_0_0_#0f172a]">
                <Zap className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                {result.modelUsed}
              </span>
            )}
            {result.timestampChecked && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                Đã kiểm tra web tại: {result.timestampChecked}
              </span>
            )}
          </div>

          {/* [VERDICT BADGE] */}
          <div className="flex items-center gap-3 pt-1">
            <AiStatusBadge verdict={result.verdict} size="lg" showScore={false} />
          </div>
        </div>

        {/* Credibility Score Gauge */}
        <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] shrink-0 ${
          isFalse 
            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200' 
            : isTrue 
            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200' 
            : isMisleading 
            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200' 
            : 'bg-mint-50 dark:bg-slate-900/90 text-slate-900 dark:text-slate-200'
        }`}>
          <div className="text-center pr-3 border-r-2 border-slate-900">
            <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-400 block tracking-wider">
              Mức độ tin cậy
            </span>
            <span className={`text-2xl md:text-3xl font-black font-mono ${
              isFalse ? 'text-rose-600 dark:text-rose-400' :
              isTrue ? 'text-emerald-600 dark:text-emerald-400' :
              isMisleading ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-400'
            }`}>
              {credibilityScore}<span className="text-xs font-normal text-slate-600 dark:text-slate-500">/100</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-800 dark:text-slate-300 max-w-[155px] leading-tight space-y-0.5">
            <div className={`font-black ${
              isFalse ? 'text-rose-700 dark:text-rose-400' :
              isTrue ? 'text-emerald-700 dark:text-emerald-400' :
              isMisleading ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-slate-300'
            }`}>
              {isFalse ? 'Độ tin cậy rất thấp' :
               isTrue ? 'Độ tin cậy cao' :
               isMisleading ? 'Độ tin cậy yếu' : 'Chưa đủ dữ liệu'}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal font-medium">
              {isFalse 
                ? 'Thông tin sai sự thật / Bị bác bỏ bởi các nguồn đối chứng.'
                : isTrue 
                ? 'Đã được nhiều nguồn uy tín và chính thống xác thực.'
                : isMisleading 
                ? 'Thông tin gây hiểu lầm hoặc sai lệch ngữ cảnh.'
                : 'Chưa đủ nguồn web độc lập để xác minh.'}
            </div>
            {result.confidence && (
              <div className="text-[9px] font-mono font-bold text-blue-700 dark:text-cyan-400/90 pt-0.5">
                Độ chắc chắn AI: {result.confidence}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 13: Xử lý chuyên biệt khi "CHƯA ĐỦ DỮ LIỆU" (INSUFFICIENT_EVIDENCE) */}
      {result.verdict === 'INSUFFICIENT_EVIDENCE' && (
        <div className="p-5 rounded-2xl bg-mint-50 dark:bg-slate-900/90 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-slate-900 dark:text-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-300 font-black text-sm uppercase tracking-wide">
            <HelpCircle className="w-5 h-5 text-slate-700 dark:text-slate-400" />
            <span>⚪ CHƯA ĐỦ DỮ LIỆU</span>
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-slate-200">
            TrustNet chưa tìm thấy đủ bằng chứng đáng tin cậy để xác minh hoàn toàn thông tin này.
          </p>
          <div className="text-xs text-slate-700 dark:text-slate-400 space-y-1.5 pt-1 font-medium">
            <div>• <strong>Lý do chưa thể kết luận:</strong> {result.explanation || result.summary}</div>
            {limitations.length > 0 && (
              <div>• <strong>Dữ liệu còn thiếu:</strong> {limitations.join('; ')}</div>
            )}
          </div>
        </div>
      )}

      {/* User-Provided URL Context Report (nếu có) */}
      {result.urlContextAnalysis && (
        <div className="p-4 rounded-2xl bg-mint-50/70 dark:bg-slate-950/70 border-2 border-slate-900 space-y-2 shadow-[2px_2px_0_0_#0f172a]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-900 dark:text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Đường dẫn nguồn người dùng đính kèm:
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border border-slate-900 shadow-[1px_1px_0_0_#0f172a] ${
              result.urlContextAnalysis.accessible 
                ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-950 dark:bg-rose-500/20 dark:text-rose-300'
            }`}>
              {result.urlContextAnalysis.accessible ? '✓ Đã đọc & phân tích' : '✕ Không thể truy cập'}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-300 break-all">
            {result.urlContextAnalysis.providedUrl}
          </div>
          {result.urlContextAnalysis.error && (
            <div className="text-xs text-rose-600 font-bold">
              {result.urlContextAnalysis.error}
            </div>
          )}
          {result.urlContextAnalysis.independentComparison && (
            <div className="text-[11px] text-slate-600 dark:text-slate-400 italic">
              * {result.urlContextAnalysis.independentComparison}
            </div>
          )}
        </div>
      )}

      {/* Section: CLAIM ĐƯỢC KIỂM TRA (Claim Extraction Decomposition) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/70 border-2 border-slate-900 space-y-3 shadow-[3px_3px_0_0_#0f172a]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            CLAIM ĐƯỢC KIỂM TRA
          </h3>
          {result.claimAnalysis?.isVerifiable !== undefined && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-mint-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300 border border-slate-900 font-bold">
              {result.claimAnalysis.isVerifiable ? 'Có thể kiểm chứng' : 'Khó kiểm chứng'}
            </span>
          )}
        </div>

        <div className="text-sm md:text-base font-black text-slate-900 dark:text-white bg-mint-50 dark:bg-slate-900/60 p-4 rounded-xl border-2 border-slate-900">
          "{result.claim || result.summary}"
        </div>

        {/* Bóc tách các thành phần cấu trúc của Claim */}
        {result.claimAnalysis && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            {result.claimAnalysis.subject && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a]">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Chủ thể</span>
                <span className="text-slate-900 dark:text-slate-200 font-black">{result.claimAnalysis.subject}</span>
              </div>
            )}
            {result.claimAnalysis.actionOrEvent && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a]">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Hành động / Sự kiện</span>
                <span className="text-slate-900 dark:text-slate-200 font-black">{result.claimAnalysis.actionOrEvent}</span>
              </div>
            )}
            {result.claimAnalysis.time && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a]">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Thời gian</span>
                <span className="text-slate-900 dark:text-slate-200 font-black">{result.claimAnalysis.time}</span>
              </div>
            )}
            {result.claimAnalysis.location && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/50 border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a]">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Địa điểm</span>
                <span className="text-slate-900 dark:text-slate-200 font-black">{result.claimAnalysis.location}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section: KẾT LUẬN & TRỰC DIỆN (Google AI Overview Style) */}
      <div className="p-5 rounded-2xl bg-mint-100 dark:bg-slate-900 border-2 border-slate-900 space-y-3 shadow-[4px_4px_0_0_#0f172a]">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-900">
          <span className="text-blue-600 dark:text-cyan-400 text-lg font-bold">✦</span>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            KẾT LUẬN & ĐÁP ÁN SỰ THẬT
          </h3>
        </div>

        <p className="text-sm md:text-base text-slate-900 dark:text-slate-100 font-bold leading-relaxed">
          {result.factAnswer || result.summary}
        </p>

        {result.explanation && result.explanation !== result.factAnswer && (
          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1 font-medium">
            {result.explanation}
          </p>
        )}
      </div>

      {/* Section: BẰNG CHỨNG (Evidence Items with Clickable Citations) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-950/70 border-2 border-slate-900 space-y-3 shadow-[3px_3px_0_0_#0f172a]">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          BẰNG CHỨNG ĐÃ ĐỐI CHIẾU
        </h3>

        <div className="space-y-2.5">
          {keyEvidence.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Đang tổng hợp bằng chứng từ mạng Internet...</p>
          ) : (
            keyEvidence.map((ev, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-mint-50/50 dark:bg-slate-900/70 border-2 border-slate-900 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 leading-relaxed font-medium shadow-[2px_2px_0_0_#0f172a]"
              >
                <span className="text-blue-600 dark:text-indigo-400 font-black shrink-0 mt-0.5">•</span>
                <div className="flex-1">
                  <span>{ev.statement}</span>

                  {/* Citations badges [1], [2] */}
                  {ev.citationIndices && ev.citationIndices.length > 0 && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      {ev.citationIndices.map((cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => scrollToSource(cIdx)}
                          className="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white border border-slate-900 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-[1px_1px_0_0_#0f172a]"
                          title={`Xem nguồn số [${cIdx}]`}
                        >
                          [{cIdx}]
                        </button>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section: NGUỒN ĐÃ KIỂM TRA (Source Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            NGUỒN ĐÃ KIỂM TRA ({sources.length} NGUỒN THỰC TẾ)
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">
            Nguồn được trích xuất trực tiếp từ Google Search Grounding
          </span>
        </div>

        {sources.length === 0 ? (
          <div className="p-4 rounded-xl bg-mint-50 dark:bg-slate-900/60 border-2 border-slate-900 text-xs text-slate-600 dark:text-slate-400 italic">
            Không thu thập được đủ nguồn web độc lập qua Google Search Grounding.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((source, idx) => {
              const citationIndex = idx + 1;
              return (
                <div
                  id={`source-card-${citationIndex}`}
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border-2 border-slate-900 hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-3 group shadow-[3px_3px_0_0_#0f172a]"
                >
                  <div className="space-y-2">
                    {/* Source Header: Citation Index + SourceType Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 dark:bg-indigo-500/20 dark:text-indigo-300 border border-slate-900 font-mono font-black text-xs shadow-[1px_1px_0_0_#0f172a]">
                        [{citationIndex}]
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-mint-100 dark:bg-slate-900 border border-slate-900 text-slate-900 dark:text-cyan-300">
                        {source.sourceType || 'UNKNOWN'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                      {source.title}
                    </h4>

                    {/* Publisher & Domain */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      <span className="truncate">{source.publisher || source.domain}</span>
                      {source.domain && <span className="text-slate-400">•</span>}
                      {source.domain && <span className="font-mono text-slate-500">{source.domain}</span>}
                    </div>

                    {/* Published Date if available */}
                    {source.publishedDate && (
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{source.publishedDate}</span>
                      </div>
                    )}

                    {/* Why this source matters / Summary */}
                    {(source.summary || source.evidenceSummary) && (
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug line-clamp-3 bg-mint-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-900 font-medium">
                        <strong className="text-blue-700 dark:text-cyan-400">Ý nghĩa: </strong>{source.summary || source.evidenceSummary}
                      </p>
                    )}
                  </div>

                  {/* Footer: Stance & Open Source Link */}
                  <div className="pt-2 border-t-2 border-slate-900/60 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold">
                      {source.contradictsClaim && (
                        <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Phản bác claim
                        </span>
                      )}
                      {source.supportsClaim && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Hỗ trợ claim
                        </span>
                      )}
                      {!source.contradictsClaim && !source.supportsClaim && (
                        <span className="text-[10px] text-slate-500">Nguồn tham chiếu</span>
                      )}
                    </div>

                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-cyan-400 hover:underline font-black transition-colors group/link"
                    >
                      <span>Mở nguồn</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: TRUY VẤN ĐÃ SỬ DỤNG (Search Queries) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/70 border-2 border-slate-900 space-y-2 shadow-[3px_3px_0_0_#0f172a]">
        <span className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          TRUY VẤN ĐÃ SỬ DỤNG TRÊN GOOGLE SEARCH
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {searchQueries.map((query, idx) => (
            <a
              key={idx}
              href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint-50 dark:bg-slate-900 border-2 border-slate-900 hover:bg-mint-100 text-slate-900 dark:text-cyan-300 text-xs font-mono font-bold transition-all shadow-[2px_2px_0_0_#0f172a]"
              title="Nhấn để tìm kiếm truy vấn này trực tiếp trên Google"
            >
              <span>🔍 "{query}"</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          ))}
        </div>
      </div>

      {/* Section: GIỚI HẠN KIỂM CHỨNG & THỜI ĐIỂM (Limitations) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-slate-900 space-y-2 shadow-[2px_2px_0_0_#0f172a]">
        <span className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          GIỚI HẠN KIỂM CHỨNG
        </span>
        <div className="text-xs text-slate-700 dark:text-slate-400 space-y-1 font-medium">
          {limitations.length > 0 ? (
            limitations.map((lim, idx) => (
              <p key={idx}>• {lim}</p>
            ))
          ) : (
            <p>• Báo cáo phản ánh thông tin tính đến thời điểm tra cứu ({result.timestampChecked || 'vừa xong'}).</p>
          )}
          {result.timestampChecked && (
            <p className="text-[11px] text-blue-600 dark:text-cyan-300 pt-1 font-mono font-bold">
              • Đã kiểm tra web tại: {result.timestampChecked}
            </p>
          )}
        </div>
      </div>

      {/* Recommendation Box */}
      <div className="p-4 rounded-2xl bg-amber-100 dark:bg-slate-900 border-2 border-slate-900 text-xs md:text-sm text-slate-900 dark:text-indigo-200 shadow-[3px_3px_0_0_#0f172a] font-medium">
        <span className="font-black text-amber-900 dark:text-cyan-300">💡 Lời khuyên công dân số: </span>
        {result.recommendation}
      </div>

    </section>
  );
};

interface Props {
  user: User;
  onUserUpdate: (u: User) => void;
}

export const FactCheckPage: React.FC<Props> = ({ user, onUserUpdate }) => {
  const [inputText, setInputText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'statement' | 'social_post' | 'url' | 'image'>('text');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [result, setResult] = useState<AiVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulatedImageName, setSimulatedImageName] = useState<string | null>(null);

  // Gemini Settings State
  const [selectedModel, setSelectedModel] = useState<string>(() => AiVerificationService.getGeminiModel() || FRONTEND_GEMINI_CONFIG.DEFAULT_MODEL);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [testState, setTestState] = useState<{ testing: boolean; message: string | null; success: boolean | null }>({
    testing: false,
    message: null,
    success: null
  });

  // Sample Presets for Gen Z and Students to test immediately
  const samplePresets = [
    {
      label: 'Wat Pho Thái Lan (TEST 3)',
      text: 'Chùa Wat Pho là cây cầu nổi tiếng của Thái Lan',
      url: ''
    },
    {
      label: 'Thủ đô Việt Nam là Hà Nội (TEST 1)',
      text: 'Thủ đô của Việt Nam là Hà Nội.',
      url: ''
    },
    {
      label: 'Thủ đô là TP.HCM (TEST 2)',
      text: 'Thủ đô của Việt Nam là Thành phố Hồ Chí Minh.',
      url: ''
    },
    {
      label: 'Claim mơ hồ khó kiểm chứng (TEST 4)',
      text: 'Vào năm 1742, người ngoài hành tinh đã bí mật ký hiệp ước với các nhà giả kim thuật tại châu Âu.',
      url: ''
    },
    {
      label: 'Thông tin một phần đúng (TEST 5)',
      text: 'Cà rốt chứa vitamin A giúp mắt sáng và chữa khỏi 100% bệnh cận thị trong 1 tuần.',
      url: ''
    },
    {
      label: 'Thời sự mới nhất (TEST 6)',
      text: 'Thời tiết hiện nay tại Hà Nội đang có nhiệt độ khoảng bao nhiêu độ C?',
      url: ''
    },
    {
      label: 'Lừa đảo trúng thưởng',
      text: 'Chúc mừng bạn đã trúng 50.000.000 VNĐ. Nhấn vào link http://nhanthuong-50trieu.gift-claim.xyz để nhận tiền.',
      url: 'http://nhanthuong-50trieu.gift-claim.xyz'
    }
  ];

  const handleRunCheck = async () => {
    if (!inputText.trim() && !sourceUrl.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const fullText = inputText || `Kiểm tra nội dung tại địa chỉ: ${sourceUrl}`;
      const res = await AiVerificationService.verifyContent(fullText, sourceUrl, (step) => {
        setAnalysisStep(step);
      });
      setResult(res);

      // Đảm bảo mức độ tin cậy của thông tin phản ánh đúng bản chất (thông tin sai thì điểm tin cậy phải thấp 4-12/100)
      if ((res.verdict === 'FALSE' || res.status === 'debunked') && res.score > 20) {
        res.score = Math.max(4, Math.min(12, Math.round(100 - res.score))) || 8;
      }

      // Lưu lịch sử kiểm chứng & cộng điểm XP
      const record: FactCheckRecord = {
        id: 'fc-' + Date.now(),
        userId: user.id,
        inputText: fullText,
        inputCategory: inputMode,
        result: res,
        createdAt: new Date().toISOString()
      };
      DatabaseService.saveFactCheckRecord(record);
      onUserUpdate(DatabaseService.getCurrentUser());

    } catch (err: any) {
      console.error('Fact-check failure:', err);
      const msg = err?.message || 'Có lỗi xảy ra trong quá trình kiểm chứng thông tin.';
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setInputText(preset.text);
    setSourceUrl(preset.url);
    setResult(null);
    setErrorMessage(null);
  };

  const handleSimulateImageUpload = () => {
    setSimulatedImageName('screenshot_tinnhan_fb.png');
    setInputText('Hệ thống OCR trích xuất: "Wat Pho là cây cầu dây văng lớn nhất nối liền hai bờ sông Chao Phraya ở Thái Lan."');
  };

  const handleTestConnection = async () => {
    setTestState({ testing: true, message: 'Đang kiểm tra kết nối tới Google Gemini qua Serverless Backend...', success: null });
    const res = await AiVerificationService.testGeminiConnection(undefined, selectedModel);
    if (res.resolvedModel && res.resolvedModel !== selectedModel) {
      setSelectedModel(res.resolvedModel);
      AiVerificationService.setGeminiModel(res.resolvedModel);
    }
    setTestState({ testing: false, message: res.message, success: res.success });
  };

  const handleSaveSettings = () => {
    AiVerificationService.setGeminiModel(selectedModel);
    setIsSettingsOpen(false);
  };

  const scrollToSource = (index: number) => {
    const el = document.getElementById(`source-card-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-cyan-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-cyan-400');
      }, 1800);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 relative overflow-hidden text-slate-900 dark:text-slate-100">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-indigo-500/10 border border-slate-900 text-blue-700 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0_0_#0f172a]">
              <Bot className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span>Hệ Thống Fact-Checking Chuyên Sâu • Google Search Grounding</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Kiểm Chứng Tính Xác Thực Đa Nguồn Bằng AI
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
              Nhập nội dung, bài báo hoặc đường link cần kiểm tra. Hệ thống kích hoạt <strong>Google Search Grounding</strong> để truy xuất dữ liệu độc lập thời gian thực, bóc tách luận điểm, đối chiếu bằng chứng và cung cấp trích dẫn nguồn thực tế.
            </p>
          </div>

          {/* Model Status & Config Button */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black border-2 border-slate-900 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 transition-all"
              title="Google Search Grounding kích hoạt trên máy chủ. Nhấn để xem trạng thái kết nối."
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Google Gemini ({selectedModel})</span>
              <Settings className="w-3.5 h-3.5 text-slate-600 ml-1" />
            </button>
          </div>
        </div>

        {/* Input Mode Selector Chips */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 relative z-10">
          {[
            { id: 'text', label: 'Văn bản / Câu nói', icon: FileText },
            { id: 'url', label: 'Đường dẫn liên kết (URL)', icon: LinkIcon },
            { id: 'image', label: 'Quét ảnh / Ảnh chụp màn hình (OCR)', icon: ImageIcon },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = inputMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setInputMode(mode.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-900 hover:bg-mint-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

      </section>

      {/* Main Fact-Check Input Card */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-5 md:p-6 space-y-4">
        
        {/* Presets Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-400 uppercase tracking-wider">
            Thử nhanh các tình huống thực tế:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className="px-3 py-1.5 rounded-xl text-xs bg-mint-50 hover:bg-mint-100 dark:bg-slate-900 border-2 border-slate-900 text-slate-800 dark:text-slate-300 font-bold shadow-[2px_2px_0_0_#0f172a] transition-all hover:-translate-y-0.5"
              >
                👉 {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Dán nội dung bài đăng Facebook, tin đồn TikTok, phát ngôn hoặc thông tin bạn muốn kiểm tra vào đây..."
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-mint-50/50 dark:bg-slate-950/80 border-2 border-slate-900 focus:border-blue-600 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all resize-none font-sans font-medium shadow-[2px_2px_0_0_#0f172a]"
          />

          {inputMode === 'image' && (
            <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-300 font-bold">
                <ImageIcon className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>{simulatedImageName || 'Tải lên ảnh chụp màn hình tin nhắn hoặc bài đăng'}</span>
              </div>
              <button
                onClick={handleSimulateImageUpload}
                className="px-3 py-1 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold border border-slate-900 shadow-[1px_1px_0_0_#0f172a]"
              >
                Chọn ảnh mô phỏng
              </button>
            </div>
          )}
        </div>

        {/* Source URL Optional Input */}
        <div className="p-3.5 rounded-2xl bg-mint-50/50 dark:bg-slate-950/60 border-2 border-slate-900 flex items-center gap-3 shadow-[2px_2px_0_0_#0f172a]">
          <LinkIcon className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Đường dẫn nguồn bài viết gốc (nếu có, VD: https://chinhphu.vn/...)"
            className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none font-medium"
          />
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/40 border-2 border-slate-900 text-rose-950 dark:text-rose-300 text-xs flex items-start justify-between gap-3 animate-in fade-in shadow-[3px_3px_0_0_#0f172a]">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block mb-0.5">Không thể hoàn tất kiểm chứng:</span>
                <span className="font-medium">{errorMessage}</span>
                {(errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('hạn mức') || errorMessage.toLowerCase().includes('giới hạn')) && (
                  <p className="mt-1.5 text-[11px] text-amber-950 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-slate-900">
                    💡 <strong>Mẹo:</strong> Gói miễn phí Google AI Studio giới hạn tần suất yêu cầu trong 1 phút (RPM limit). Bạn chỉ cần đợi khoảng 1 phút rồi bấm <strong>"Thử lại ngay"</strong>.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRunCheck}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-[11px] border border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all cursor-pointer"
              >
                Thử lại ngay
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-mint-100 text-slate-900 font-bold text-[11px] border border-slate-900 shadow-[2px_2px_0_0_#0f172a]"
              >
                Mở Cấu hình
              </button>
            </div>
          </div>
        )}

        {/* Submit Button & Model Status indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
            <span className="text-blue-700 dark:text-cyan-400 font-black flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Google Search Grounding trực tiếp • Đối chiếu nguồn độc lập
            </span>
          </div>

          <button
            onClick={handleRunCheck}
            disabled={(!inputText.trim() && !sourceUrl.trim()) || isAnalyzing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs md:text-sm border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang quét Google Search...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>🔍 Kiểm tra bằng AI</span>
              </>
            )}
          </button>
        </div>

      </section>

      {/* Scanning Radar Progress Animation */}
      {isAnalyzing && (
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 text-center space-y-4 animate-pulse">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-full h-full rounded-full border-2 border-slate-900 flex items-center justify-center bg-blue-100">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-500 radar-beam" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">TrustNet AI Fact-Checking Engine đang phân tích...</h3>
            <p className="text-xs text-blue-700 dark:text-indigo-300 font-mono font-bold">
              {analysisStep || 'Đang kết nối Google Search Grounding để đối soát dữ liệu trên mạng Internet...'}
            </p>
          </div>

          <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-900">
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 animate-shimmer" style={{ width: '100%' }} />
          </div>
        </section>
      )}

      {/* DETAILED FACT-CHECK RESULTS (Theo chuẩn Section 12 & 13) */}
      {result && !isAnalyzing && (
        <FactCheckResultView result={result} scrollToSource={scrollToSource} />
      )}

      {/* Gemini Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0_0_#0f172a] relative text-slate-900 dark:text-slate-100 space-y-5">
            
            <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-cyan-300 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Cấu hình Google Gemini AI</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Kết nối máy chủ kiểm chứng với Google Search Grounding</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-xl text-slate-600 hover:text-black bg-mint-50 dark:bg-slate-800 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Note: Google Search Grounding */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border-2 border-slate-900 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2.5 shadow-[2px_2px_0_0_#0f172a]">
              <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-blue-800 dark:text-cyan-300 block mb-0.5">Google Search Grounding kích hoạt:</span>
                Hệ thống tự động sử dụng Google Search để tìm kiếm và đối chiếu với các bài viết thực tế trên mạng Internet trước khi kết luận.
              </div>
            </div>

            {/* Server-Side Security Note */}
            <div className="p-3.5 rounded-2xl bg-mint-50 dark:bg-slate-900/90 border-2 border-slate-900 text-xs space-y-1.5 shadow-[2px_2px_0_0_#0f172a]">
              <div className="font-black text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Kiến trúc Xác thực Server-Side (Bảo mật 100%)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-400 leading-relaxed text-[11px] font-medium">
                Khóa <code className="text-blue-700 bg-white border border-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">GEMINI_API_KEY</code> được bảo vệ trực tiếp trên môi trường máy chủ Vercel. Người dùng không cần và không thể nhập API key từ trình duyệt, đảm bảo an toàn tuyệt đối cho hệ thống.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 dark:text-slate-300 block">
                  Phiên bản mô hình Google Gemini trên máy chủ:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel(FRONTEND_GEMINI_CONFIG.DEFAULT_MODEL);
                    AiVerificationService.setGeminiModel(FRONTEND_GEMINI_CONFIG.DEFAULT_MODEL);
                  }}
                  className="text-[11px] text-blue-700 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                >
                  ⚡ Đặt về {FRONTEND_GEMINI_CONFIG.DEFAULT_MODEL}
                </button>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-mint-50 dark:bg-slate-950 border-2 border-slate-900 text-xs text-slate-900 dark:text-slate-200 focus:outline-none font-bold shadow-[2px_2px_0_0_#0f172a]"
              >
                {FRONTEND_GEMINI_CONFIG.AVAILABLE_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Status feedback */}
            {testState.message && (
              <div className={`p-3 rounded-xl border-2 border-slate-900 text-xs leading-relaxed font-bold shadow-[2px_2px_0_0_#0f172a] ${
                testState.success 
                  ? 'bg-emerald-100 text-emerald-950' 
                  : testState.success === false
                  ? 'bg-rose-100 text-rose-950'
                  : 'bg-blue-100 text-blue-950'
              }`}>
                {testState.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testState.testing}
                className="px-4 py-2.5 rounded-xl bg-mint-50 hover:bg-mint-100 dark:bg-slate-800 disabled:opacity-50 text-slate-900 dark:text-slate-300 text-xs font-bold border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] flex items-center gap-1.5 transition-all"
              >
                {testState.testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Kiểm tra kết nối máy chủ</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 transition-all"
              >
                Lưu & Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
