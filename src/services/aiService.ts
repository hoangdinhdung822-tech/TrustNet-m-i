import { AiVerificationResult, CodeInspectionReport } from '../types';
import { FRONTEND_GEMINI_CONFIG, sanitizeFrontendModel } from '../config/geminiConfig';

/**
 * TrustNet AI Verification Engine (Client Service)
 * Kết nối an toàn tới Fact-Checking API Server với Google Search Grounding.
 * Bảo mật: API Key không bị lộ trong client bundle.
 */

const GEMINI_MODEL_STORAGE = 'trustnet_gemini_model';
const DEFAULT_GEMINI_MODEL = FRONTEND_GEMINI_CONFIG.DEFAULT_MODEL;

// Danh sách từ khóa báo động giật gân, thao túng cảm xúc (Dành cho Inspector)
const SENSATIONAL_WORDS = [
  'khẩn cấp', 'chia sẻ ngay', 'nguy hiểm chết người', 'bí mật bị giấu kín',
  'chữa khỏi 100%', 'thần dược', 'tặng tiền', 'trúng thưởng khủng', 'chuyển khoản gấp',
  'sự thật kinh hoàng', 'cấm lưu hành', 'tin chấn động', 'ai không đọc sẽ hối hận'
];

// Danh sách dấu hiệu lừa đảo / Phishing (Dành cho Inspector)
const PHISHING_SIGNALS = [
  'nhận thưởng', 'bấm vào link bên dưới', 'nhập otp', 'xác thực tài khoản ngay',
  'tài khoản sắp bị khóa', 'nạp thẻ cào', 'làm nhiệm vụ kiếm tiền', 'đầu tư sinh lời 30%'
];

export class AiVerificationService {
  /**
   * Chuẩn hóa tên Model Gemini (xử lý dấu gạch ngang unicode en-dash/em-dash '–', khoảng trắng)
   * Tự động nâng cấp các phiên bản đã đóng (1.5, 2.0, 2.5) lên chuẩn mới
   */
  public static sanitizeModel(model?: string): string {
    return sanitizeFrontendModel(model);
  }

  /**
   * Lấy Model Gemini đang chọn
   */
  public static getGeminiModel(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GEMINI_MODEL_STORAGE);
      if (stored) {
        const sanitized = this.sanitizeModel(stored);
        if (sanitized !== stored) {
          localStorage.setItem(GEMINI_MODEL_STORAGE, sanitized);
        }
        return sanitized;
      }
    }
    return DEFAULT_GEMINI_MODEL;
  }

  /**
   * Lưu Model Gemini
   */
  public static setGeminiModel(model: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GEMINI_MODEL_STORAGE, this.sanitizeModel(model));
    }
  }

  /**
   * Kiểm tra kết nối tới Google Gemini API qua server-side ping endpoint (Server-Side Only)
   */
  public static async testGeminiConnection(
    _unusedKey?: string, 
    model?: string
  ): Promise<{ success: boolean; message: string; resolvedModel?: string }> {
    const targetModel = this.sanitizeModel(model || this.getGeminiModel());

    try {
      const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: targetModel })
      });

      let data: any = {};
      let rawText = '';
      try {
        rawText = await res.text();
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        // Không phải JSON
      }

      if (!res.ok || !data.success) {
        let msg = data?.message || data?.error;
        if (!msg) {
          if (rawText && rawText.trim().length > 0 && !rawText.trim().startsWith('<')) {
            msg = rawText.trim().slice(0, 300);
          } else if (res.status === 404) {
            msg = 'Lỗi 404: Không tìm thấy máy chủ kiểm chứng (/api/ping). Vui lòng đảm bảo server đang chạy hoặc đã triển khai Vercel Serverless Function.';
          } else if (res.status === 500) {
            msg = 'Lỗi 500: Gemini API chưa được cấu hình trên máy chủ (Thiếu GEMINI_API_KEY).';
          } else {
            msg = `Lỗi kiểm tra kết nối (${res.status}): ${res.statusText || 'Yêu cầu không thành công'}`;
          }
        }
        return {
          success: false,
          message: msg
        };
      }

      return {
        success: true,
        message: data.message || `✅ Kết nối thành công tới Google ${targetModel}!`,
        resolvedModel: data.resolvedModel || targetModel
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Lỗi kết nối tới máy chủ kiểm chứng: ${err?.message || err}`
      };
    }
  }

  /**
   * Thực hiện Fact-Checking chuyên sâu với Google Search Grounding qua máy chủ
   * Tuyệt đối không hard-code kết quả, không fake nguồn, lấy trích dẫn thực tế từ Google Grounding Chunks.
   */
  public static async verifyContent(
    text: string,
    sourceUrl?: string,
    onProgress?: (step: string) => void
  ): Promise<AiVerificationResult> {
    const model = this.getGeminiModel();

    if (onProgress) {
      onProgress('🔍 Đang trích xuất luận điểm (Claim Extraction) & phân tích bối cảnh...');
    }
    await new Promise(r => setTimeout(r, 350));

    if (onProgress) {
      onProgress('🌐 Đang kích hoạt Google Search Grounding để truy xuất nguồn trên mạng Internet...');
    }
    await new Promise(r => setTimeout(r, 400));

    try {
      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          claim: text,
          url: sourceUrl?.trim() || undefined,
          model
        })
      });

      if (onProgress) {
        onProgress('⚖️ Đang đối chiếu bằng chứng đa nguồn & tính toán độ tin cậy...');
      }

      let data: any = {};
      let rawText = '';
      try {
        rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        // Không phải JSON
      }

      if (!response.ok || !data.success) {
        let errorMsg = data?.message || data?.error;
        if (!errorMsg) {
          if (rawText && rawText.includes('FUNCTION_INVOCATION_TIMEOUT')) {
            errorMsg = 'Quá thời gian thực thi máy chủ (FUNCTION_INVOCATION_TIMEOUT). Vui lòng bấm Thử lại.';
          } else if (response.status === 504 || data?.code === 'FACT_CHECK_TIMEOUT' || data?.code === 'GEMINI_TIMEOUT') {
            errorMsg = 'Kiểm chứng mất quá nhiều thời gian (Timeout). Vui lòng bấm Thử lại để hệ thống kiểm tra lại.';
          } else if (response.status === 503 || data?.code === 'GEMINI_TEMPORARILY_UNAVAILABLE') {
            errorMsg = 'Dịch vụ AI đang tạm thời quá tải (503 High Demand). Vui lòng thử lại sau giây lát.';
          } else if (rawText && rawText.trim().length > 0 && !rawText.trim().startsWith('<')) {
            errorMsg = rawText.trim().slice(0, 300);
          } else if (response.status === 404) {
            errorMsg = 'Lỗi 404: Không tìm thấy API kiểm chứng (/api/fact-check). Vui lòng kiểm tra Vercel Serverless Function hoặc khởi động server backend.';
          } else if (response.status === 500) {
            errorMsg = 'Lỗi máy chủ (500): Gemini API chưa được cấu hình trên máy chủ (Thiếu GEMINI_API_KEY).';
          } else {
            errorMsg = `Lỗi phản hồi máy chủ (${response.status}): ${response.statusText || 'Lỗi không xác định'}`;
          }
        }
        throw new Error(errorMsg);
      }

      if (onProgress) {
        onProgress('✅ Đã hoàn tất báo cáo kiểm chứng sự thật.');
      }

      return data.result as AiVerificationResult;
    } catch (err: any) {
      console.error('AiVerificationService error:', err);
      throw err;
    }
  }

  /**
   * Phân tích mã nguồn / nội dung kỹ thuật (Content & Code Inspector)
   */
  public static inspectContentOrCode(input: string): CodeInspectionReport {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();

    // Nhận diện loại ngôn ngữ
    let detectedType: CodeInspectionReport['detectedType'] = 'Văn bản';
    let isCode = false;

    if (/<(!doctype|html|head|body|script|div|form|iframe)/i.test(trimmed)) {
      detectedType = 'HTML';
      isCode = true;
    } else if (/(function|const|let|var|=>|document\.|window\.|console\.log|import\s+.*from)/.test(trimmed)) {
      detectedType = 'JavaScript';
      isCode = true;
    } else if (/(def\s+[a-z_]|import\s+[a-z_]|print\(|class\s+[A-Z]|if\s+__name__\s*==)/.test(trimmed)) {
      detectedType = 'Python';
      isCode = true;
    } else if (trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes('":')) {
      detectedType = 'JSON';
      isCode = true;
    }

    // Nếu là mã nguồn, thực hiện kiểm tra an ninh tĩnh (Static Security Analysis)
    if (isCode) {
      const issues: CodeInspectionReport['issues'] = [];
      let hasSuspiciousRedirect = false;
      let hasDataHarvesting = false;
      let hasSecretLeak = false;
      let hasPhishingSignals = false;

      // 1. Kiểm tra đánh cắp cookie / token
      if (/document\.cookie|localStorage\.getItem|sessionStorage/i.test(trimmed)) {
        hasDataHarvesting = true;
        issues.push({
          type: 'Truy cập dữ liệu phiên nhạy cảm',
          severity: 'high',
          description: 'Mã cố gắng đọc document.cookie hoặc localStorage, có nguy cơ đánh cắp phiên đăng nhập (Session Hijacking).',
          codeSnippet: 'document.cookie / localStorage',
          remedy: 'Sử dụng cookie gắn cờ HttpOnly để JavaScript phía client không thể can thiệp.'
        });
      }

      // 2. Chuyển hướng nguy hiểm
      if (/window\.location(\.href)?\s*=|location\.replace/i.test(trimmed) && /http[s]?:\/\//.test(trimmed)) {
        hasSuspiciousRedirect = true;
        issues.push({
          type: 'Chuyển hướng trang tự động (Suspicious Redirect)',
          severity: 'medium',
          description: 'Mã ép buộc trình duyệt người dùng chuyển sang một địa chỉ URL bên ngoài mà không có xác nhận từ người dùng.',
          codeSnippet: 'window.location.replace(...)',
          remedy: 'Yêu cầu người dùng bấm nút xác nhận rõ ràng trước khi điều hướng.'
        });
      }

      // 3. Thực thi chuỗi tùy ý eval()
      if (/eval\(|new Function\(|setTimeout\(["']/i.test(trimmed)) {
        issues.push({
          type: 'Sử dụng hàm thực thi tùy ý nguy hiểm (eval)',
          severity: 'critical',
          description: 'Hàm eval() biến dữ liệu văn bản thành mã chạy trực tiếp, là nguyên nhân hàng đầu gây lỗ hổng XSS (Cross-Site Scripting).',
          codeSnippet: 'eval(...)',
          remedy: 'Tránh hoàn toàn eval(). Sử dụng JSON.parse() để phân tích dữ liệu dạng chuỗi.'
        });
      }

      // 4. Lộ API Key hoặc mật khẩu
      if (/(sk_live_[0-9a-zA-Z]{20,}|api_key\s*=\s*['"][^'"]{8,}['"]|password\s*=\s*['"][^'"]+['"])/i.test(trimmed)) {
        hasSecretLeak = true;
        issues.push({
          type: 'Lộ thông tin bí mật / API Key',
          severity: 'critical',
          description: 'Phát hiện secret key hoặc mật khẩu được ghi cứng (hardcoded) ngay trong mã nguồn mở.',
          codeSnippet: 'api_key = "..."',
          remedy: 'Lưu trữ thông tin bí mật trong biến môi trường (.env) và KHÔNG BAO GIỜ đẩy lên GitHub hoặc client-side.'
        });
      }

      // 5. Form HTML giả mạo đánh cắp thông tin
      if (detectedType === 'HTML' && /<form/i.test(trimmed) && /(password|matkhau|otp|cc-number|credit)/i.test(trimmed)) {
        hasPhishingSignals = true;
        issues.push({
          type: 'Form có dấu hiệu Phishing giả mạo',
          severity: 'high',
          description: 'Form thu thập mật khẩu hoặc thông tin thẻ ngân hàng nhưng gửi dữ liệu đến máy chủ lạ.',
          codeSnippet: '<form action="http://..." method="POST">',
          remedy: 'Chỉ nhập thông tin đăng nhập trên tên miền đã được xác thực SSL (HTTPS) chính chủ.'
        });
      }

      let riskLevel: CodeInspectionReport['riskLevel'] = 'an_toan';
      let riskScore = 10;
      if (issues.some(i => i.severity === 'critical')) {
        riskLevel = 'rat_nguy_hiem';
        riskScore = 95;
      } else if (issues.some(i => i.severity === 'high')) {
        riskLevel = 'nguy_hiem';
        riskScore = 75;
      } else if (issues.length > 0) {
        riskLevel = 'chu_y';
        riskScore = 40;
      }

      return {
        isCode: true,
        detectedType,
        riskLevel,
        riskScore,
        hasSyntaxIssues: false,
        hasSuspiciousRedirect,
        hasDataHarvesting,
        hasSecretLeak,
        hasPhishingSignals,
        issues,
        explanation: issues.length > 0
          ? `AI phát hiện ${issues.length} vấn đề an ninh tiềm ẩn trong đoạn mã ${detectedType}. Có dấu hiệu rò rỉ dữ liệu hoặc hành vi nguy hiểm đối với người dùng cuối.`
          : `Đoạn mã ${detectedType} có cấu trúc sạch, không phát hiện thấy các hàm nguy hiểm thông thường (eval, token harvesting, hay credential leak).`,
        recommendation: issues.length > 0
          ? '🔴 CẢNH BÁO BẢO MẬT: Không nên chạy đoạn mã này trên trình duyệt hoặc máy tính của bạn trước khi cô lập và xác minh máy chủ đích!'
          : '✅ Đoạn mã kiểm tra ban đầu an toàn. Hãy đảm bảo tiếp tục duy trì nguyên tắc kiểm thử trước khi deploy.'
      };
    }

    // Nếu là nội dung văn bản thông thường
    const hasPhishingText = PHISHING_SIGNALS.some(word => lower.includes(word));
    const hasSensationalText = SENSATIONAL_WORDS.some(word => lower.includes(word));

    return {
      isCode: false,
      detectedType: 'Văn bản',
      riskLevel: hasPhishingText ? 'nguy_hiem' : hasSensationalText ? 'chu_y' : 'an_toan',
      riskScore: hasPhishingText ? 80 : hasSensationalText ? 45 : 15,
      hasSyntaxIssues: false,
      hasSuspiciousRedirect: false,
      hasDataHarvesting: hasPhishingText,
      hasSecretLeak: false,
      hasPhishingSignals: hasPhishingText,
      issues: hasPhishingText ? [{
        type: 'Dấu hiệu lừa đảo qua nội dung (Phishing Text)',
        severity: 'high',
        description: 'Văn bản chứa lời mời gọi nhận quà, cung cấp mã OTP hoặc click vào link đáng ngờ.',
        remedy: 'Xóa tin nhắn và không làm theo bất kỳ chỉ dẫn chuyển tiền nào.'
      }] : [],
      explanation: hasPhishingText
        ? 'Văn bản có dấu hiệu lừa đảo trực tuyến nhắm vào người dùng nhẹ dạ.'
        : 'Nội dung văn bản được định dạng thông thường, không chứa mã độc nhúng.',
      recommendation: hasPhishingText
        ? 'Khuyên bạn nên chuyển nội dung này sang mục "AI Fact Check" để phân tích chi tiết nguồn tin.'
        : 'Bạn có thể chia sẻ thông tin này lên TrustNet để cùng cộng đồng kiểm chứng.'
    };
  }
}
