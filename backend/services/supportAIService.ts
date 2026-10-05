/**
 * TrustNet Support AI Service
 * Dịch vụ hỗ trợ tinh thần cho nạn nhân lừa đảo trên mạng.
 * Sử dụng Gemini API với structured output.
 * KHÔNG thay thế chuyên gia tâm lý.
 * KHÔNG lưu API key trong frontend.
 */

import { GoogleGenAI } from '@google/genai';

// Types
export type SupportEmotion =
  | 'CALM'
  | 'WORRIED'
  | 'SAD'
  | 'ANGRY'
  | 'ASHAMED'
  | 'PANICKED'
  | 'DESPERATE'
  | 'SELF_BLAME'
  | 'POSSIBLE_SELF_HARM'
  | 'UNKNOWN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SupportChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SupportChatRequest {
  message: string;
  history?: SupportChatMessage[];
}

export interface SupportChatResponse {
  success: true;
  reply: string;
  emotion: SupportEmotion;
  riskLevel: RiskLevel;
  actions: string[];
  needsHumanSupport: boolean;
}

export interface SupportChatError {
  success: false;
  error: string;
  message: string;
}

// ========================================
// SYSTEM INSTRUCTION
// ========================================

const SUPPORT_SYSTEM_INSTRUCTION = `Bạn là TrustNet Support AI, một trợ lý hỗ trợ tinh thần dành cho những người có thể đã trở thành nạn nhân của lừa đảo hoặc các sự cố nguy hiểm trên Internet.

Nhiệm vụ của bạn không phải là chẩn đoán bệnh tâm lý hoặc thay thế chuyên gia.

Bạn cần:
- Lắng nghe một cách bình tĩnh.
- Không phán xét.
- Không đổ lỗi.
- Không làm người dùng cảm thấy xấu hổ.
- Công nhận cảm xúc của người dùng.
- Giúp người dùng lấy lại sự bình tĩnh.
- Đưa ra lời khuyên thực tế.
- Khuyến khích người dùng tìm kiếm sự hỗ trợ từ người đáng tin cậy.
- Khi cần, hướng dẫn các bước bảo vệ tài khoản, tiền bạc và thông tin cá nhân.
- Luôn phân biệt giữa hỗ trợ tinh thần và tư vấn chuyên môn.

Khi người dùng nói rằng họ bị lừa:
Không được nói:
- "Bạn quá bất cẩn."
- "Tại sao bạn lại tin họ?"
- "Đáng lẽ bạn phải biết."
- "Đây là lỗi của bạn."

Thay vào đó có thể nói:
- "Chuyện này có thể xảy ra với rất nhiều người."
- "Việc bạn tin tưởng một người trong hoàn cảnh đó không có nghĩa bạn ngu ngốc."
- "Điều quan trọng nhất lúc này là tập trung vào những gì chúng ta có thể làm tiếp theo."

Hãy ưu tiên:
1. An toàn tinh thần.
2. An toàn tài chính.
3. An toàn tài khoản.
4. Bảo vệ dữ liệu cá nhân.
5. Hỗ trợ từ người thân hoặc người đáng tin cậy.

Không đưa ra lời khuyên nguy hiểm.
Không khẳng định chắc chắn điều gì nếu chưa đủ thông tin.
Không bịa thông tin.
Không giả vờ là chuyên gia tâm lý, bác sĩ, hoặc nhà trị liệu.
Không hứa rằng người dùng chắc chắn sẽ lấy lại được tiền.

Nếu người dùng hỏi về vấn đề pháp lý hoặc tài chính:
- Chỉ cung cấp thông tin định hướng.
- Không khẳng định đây là tư vấn pháp lý/tài chính chuyên nghiệp.
- Khuyến khích liên hệ ngân hàng, cơ quan chức năng hoặc chuyên gia phù hợp.

Nếu người dùng có dấu hiệu tuyệt vọng nghiêm trọng, nói rằng họ không muốn sống, muốn tự làm hại bản thân hoặc đang gặp nguy hiểm:
- Không tranh luận.
- Không phán xét.
- Không bỏ qua tín hiệu nguy hiểm.
- Khuyến khích họ liên hệ ngay với một người đáng tin cậy ở gần họ.
- Khuyến khích liên hệ dịch vụ khẩn cấp hoặc hỗ trợ khủng hoảng phù hợp tại nơi họ đang sống.
- Ưu tiên sự an toàn trước mọi vấn đề về tiền bạc.
- Không để cuộc trò chuyện chỉ dừng ở những lời động viên chung chung.

Giọng điệu:
- Ấm áp, bình tĩnh, tôn trọng, tự nhiên.
- Không quá dài. Không sáo rỗng. Không nói chuyện như robot.
- Không sử dụng quá nhiều emoji (tối đa 1-2 emoji mỗi tin nhắn).
- Ưu tiên tiếng Việt dễ hiểu.

Hãy coi người dùng là một người đang gặp khó khăn chứ không phải một "ca bệnh".

Cấu trúc phản hồi linh hoạt (không cần đủ cả, tùy ngữ cảnh):
A. Công nhận cảm xúc
B. Trấn an
C. Hướng dẫn cụ thể (nếu phù hợp)
D. Hành động tiếp theo
E. Kết thúc nhẹ nhàng

Bạn PHẢI trả lời bằng JSON hợp lệ với schema sau:
{
  "reply": "Nội dung phản hồi cho người dùng (string)",
  "emotion": "CALM | WORRIED | SAD | ANGRY | ASHAMED | PANICKED | DESPERATE | SELF_BLAME | POSSIBLE_SELF_HARM | UNKNOWN",
  "riskLevel": "LOW | MEDIUM | HIGH",
  "actions": ["Danh sách hành động gợi ý (array of strings, có thể rỗng)"],
  "needsHumanSupport": false
}

Quy tắc phát hiện cảm xúc:
- Nếu người dùng tự trách bản thân → emotion: "SELF_BLAME", tập trung giảm cảm giác tội lỗi.
- Nếu người dùng hoảng loạn → emotion: "PANICKED", ưu tiên giúp bình tĩnh trước khi đưa hướng dẫn.
- Nếu người dùng tức giận → emotion: "ANGRY", công nhận cảm xúc nhưng không khuyến khích trả thù.
- Nếu người dùng tuyệt vọng → emotion: "DESPERATE", chuyển sang chế độ hỗ trợ an toàn.
- Nếu người dùng có dấu hiệu muốn tự làm hại bản thân → emotion: "POSSIBLE_SELF_HARM", riskLevel: "HIGH", needsHumanSupport: true.

Nếu riskLevel là "HIGH":
- Phản hồi PHẢI khuyến khích liên hệ người thân, dịch vụ khẩn cấp.
- Không tiếp tục nói chuyện như chatbot thông thường.
- Ưu tiên sự an toàn của người dùng.`;

// ========================================
// NORMALIZE MODEL
// ========================================

function normalizeModel(model?: string): string {
  if (!model) return 'gemini-3.5-flash-lite';
  let clean = model.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-').trim();
  if (clean.startsWith('models/')) clean = clean.replace(/^models\//, '');
  if (clean.includes('pro') && (clean.includes('2.5') || clean.includes('1.5') || clean.includes('2.0'))) {
    return 'gemini-3.1-pro-preview';
  }
  if (clean.includes('1.5') || clean.includes('2.0') || clean.includes('2.5') || !clean.startsWith('gemini-')) {
    return 'gemini-3.5-flash-lite';
  }
  return clean;
}

// ========================================
// SAFE FALLBACK RESPONSE
// ========================================

function getSafeFallback(): SupportChatResponse {
  return {
    success: true,
    reply: 'Mình hiểu bạn đang trải qua một tình huống khó khăn. Hiện tại hệ thống hỗ trợ AI đang gặp sự cố tạm thời, nhưng bạn không cần phải đối mặt một mình.\n\nNếu bạn đang gặp nguy hiểm hoặc cần hỗ trợ khẩn cấp, hãy liên hệ ngay với người thân hoặc dịch vụ hỗ trợ tại nơi bạn sống.\n\nBạn có thể thử gửi lại tin nhắn sau vài phút.',
    emotion: 'UNKNOWN',
    riskLevel: 'LOW',
    actions: [
      'Liên hệ người thân đáng tin cậy nếu cần hỗ trợ ngay',
      'Thử gửi lại tin nhắn sau vài phút'
    ],
    needsHumanSupport: false,
  };
}

// ========================================
// VALIDATE AI RESPONSE
// ========================================

const VALID_EMOTIONS: SupportEmotion[] = [
  'CALM', 'WORRIED', 'SAD', 'ANGRY', 'ASHAMED',
  'PANICKED', 'DESPERATE', 'SELF_BLAME', 'POSSIBLE_SELF_HARM', 'UNKNOWN'
];
const VALID_RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

function validateAndParseResponse(raw: string): SupportChatResponse | null {
  try {
    // Try to extract JSON from the response (AI might wrap it in markdown code blocks)
    let jsonStr = raw.trim();
    
    // Remove markdown code block wrappers if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonStr);

    if (!parsed.reply || typeof parsed.reply !== 'string') return null;

    const emotion: SupportEmotion = VALID_EMOTIONS.includes(parsed.emotion) ? parsed.emotion : 'UNKNOWN';
    const riskLevel: RiskLevel = VALID_RISK_LEVELS.includes(parsed.riskLevel) ? parsed.riskLevel : 'LOW';
    const actions: string[] = Array.isArray(parsed.actions) ? parsed.actions.filter((a: any) => typeof a === 'string') : [];
    const needsHumanSupport: boolean = typeof parsed.needsHumanSupport === 'boolean' ? parsed.needsHumanSupport : false;

    return {
      success: true,
      reply: parsed.reply,
      emotion,
      riskLevel,
      actions,
      needsHumanSupport,
    };
  } catch {
    return null;
  }
}

// ========================================
// MAIN CHAT FUNCTION
// ========================================

export async function handleSupportChat(
  request: SupportChatRequest
): Promise<SupportChatResponse | SupportChatError> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'SUPPORT_AI_UNAVAILABLE',
      message: 'Hiện tại hệ thống hỗ trợ AI đang tạm thời không khả dụng. Vui lòng thử lại sau.',
    };
  }

  const message = (request.message || '').trim();
  if (!message) {
    return {
      success: false,
      error: 'EMPTY_MESSAGE',
      message: 'Vui lòng nhập nội dung tin nhắn.',
    };
  }

  const model = normalizeModel(process.env.GEMINI_MODEL);

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: 30000 },
    });

    // Build conversation history for context
    const contents: { role: string; parts: { text: string }[] }[] = [];

    if (request.history && Array.isArray(request.history)) {
      // Limit history to last 20 messages to avoid token overflow
      const recentHistory = request.history.slice(-20);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    let retryCount = 0;
    const maxRetries = 1;
    let lastError: any = null;

    while (retryCount <= maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SUPPORT_SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024,
            abortSignal: controller.signal,
            httpOptions: { timeout: 25000 },
          },
        });

        clearTimeout(timer);

        const rawText = response.text || '';
        
        // Try to parse structured output
        const parsed = validateAndParseResponse(rawText);
        if (parsed) {
          return parsed;
        }

        // If parsing fails, use the raw text as reply with safe defaults
        return {
          success: true,
          reply: rawText || getSafeFallback().reply,
          emotion: 'UNKNOWN',
          riskLevel: 'LOW',
          actions: [],
          needsHumanSupport: false,
        };
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || String(err)).toLowerCase();

        // API key invalid - don't retry
        if (errMsg.includes('api_key_invalid') || errMsg.includes('api key not valid')) {
          clearTimeout(timer);
          return {
            success: false,
            error: 'SUPPORT_AI_UNAVAILABLE',
            message: 'Khóa API không hợp lệ. Vui lòng kiểm tra cấu hình GEMINI_API_KEY.',
          };
        }

        // Quota exceeded - don't retry
        if (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('resource_exhausted')) {
          clearTimeout(timer);
          return {
            success: false,
            error: 'SUPPORT_AI_QUOTA_EXCEEDED',
            message: 'Hệ thống hỗ trợ AI đang tạm thời quá tải. Vui lòng thử lại sau vài phút.',
          };
        }

        // 503 - retry once
        if ((errMsg.includes('503') || errMsg.includes('high demand')) && retryCount < maxRetries) {
          retryCount++;
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        // Abort / timeout - don't retry
        if (errMsg.includes('abort') || errMsg.includes('timeout')) {
          clearTimeout(timer);
          return getSafeFallback();
        }

        retryCount++;
      }
    }

    clearTimeout(timer);

    // All retries exhausted
    console.error('[SUPPORT-AI] All retries exhausted:', lastError?.message || lastError);
    return getSafeFallback();
  } catch (err: any) {
    console.error('[SUPPORT-AI] Unexpected error:', err?.message || err);
    return getSafeFallback();
  }
}
