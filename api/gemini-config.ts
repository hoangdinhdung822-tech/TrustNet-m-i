/**
 * Centralized Gemini Model Configuration for TrustNet Backend & API Routes
 * 
 * Google AI Studio / Gemini API Active Models:
 * - Primary Fact-Checking: gemini-3.5-flash-lite (high throughput, search grounding supported)
 * - Deep Reasoning / Fallback: gemini-3.1-pro-preview
 */

export function normalizeModelName(model?: string): string {
  if (!model) return 'gemini-3.5-flash-lite';
  let clean = model.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-').trim();
  if (clean.startsWith('models/')) clean = clean.replace(/^models\//, '');
  
  // Tự động nâng cấp các model đã bị Google đóng hoàn toàn
  if (clean.includes('pro') && (clean.includes('2.5') || clean.includes('1.5') || clean.includes('2.0'))) {
    return 'gemini-3.1-pro-preview';
  }
  if (
    clean.includes('1.5') || 
    clean.includes('2.0') || 
    clean.includes('2.5') ||
    !clean.startsWith('gemini-')
  ) {
    return 'gemini-3.5-flash-lite';
  }
  return clean;
}

export const GEMINI_CONFIG = {
  // Model chính cho Fact-Checking (đã qua chuẩn hóa an toàn)
  PRIMARY_MODEL: normalizeModelName(process.env.GEMINI_FACT_CHECK_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'),
  // Model nhanh cho Ping / Test
  FAST_MODEL: normalizeModelName(process.env.GEMINI_FAST_MODEL || 'gemini-3.5-flash-lite'),
  // Model dự phòng khi model chính gặp lỗi 503
  FALLBACK_MODEL: normalizeModelName(process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-pro-preview'),
  // Danh sách các model hợp lệ
  AVAILABLE_MODELS: [
    {
      id: 'gemini-3.5-flash-lite',
      name: 'gemini-3.5-flash-lite (Khuyến nghị: Chuẩn Google AI Studio, siêu nhanh, hỗ trợ Search Grounding)',
      recommended: true
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'gemini-3.1-pro-preview (Mô hình suy luận sâu thế hệ mới)',
      recommended: false
    }
  ]
} as const;
