/**
 * Centralized Gemini Model Configuration for TrustNet Frontend
 * 
 * Google AI Studio / Gemini API Active Models:
 * - Primary: gemini-3.5-flash-lite (high throughput, search grounding supported)
 * - Pro/Deep Reasoning: gemini-3.1-pro-preview
 */

export function sanitizeFrontendModel(model?: string): string {
  if (!model) return 'gemini-3.5-flash-lite';
  let clean = model.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-').trim();
  if (clean.startsWith('models/')) clean = clean.replace(/^models\//, '');
  
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

export const FRONTEND_GEMINI_CONFIG = {
  DEFAULT_MODEL: 'gemini-3.5-flash-lite',
  AVAILABLE_MODELS: [
    {
      id: 'gemini-3.5-flash-lite',
      name: 'gemini-3.5-flash-lite (Khuyến nghị: Chuẩn Google AI Studio, siêu nhanh, Search Grounding)',
      recommended: true
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'gemini-3.1-pro-preview (Mô hình suy luận sâu thế hệ mới)',
      recommended: false
    }
  ]
} as const;
