import { GoogleGenAI } from '@google/genai';

function sendJson(res: any, statusCode: number, data: any) {
  if (res && typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  if (res && typeof res.writeHead === 'function') {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
    return;
  }
  if (typeof Response !== 'undefined' && typeof Response.json === 'function') {
    return Response.json(data, {
      status: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
}

function resolveServerApiKey(): { apiKey: string; matchedKeyName: string | null } {
  const directCandidates = [
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'VITE_GEMINI_API_KEY',
    'GEMINI_KEY',
    'GOOGLE_GEMINI_API_KEY',
    'GEMINI_APIKEY'
  ];

  for (const name of directCandidates) {
    const val = process.env[name];
    if (typeof val === 'string' && val.trim().length > 0) {
      return {
        apiKey: val.replace(/^["']|["']$/g, '').trim(),
        matchedKeyName: name
      };
    }
  }

  // Case-insensitive & trimmed search across ALL process.env keys (tránh lỗi viết thường hoặc khoảng trắng)
  for (const [key, val] of Object.entries(process.env)) {
    if (typeof val !== 'string' || val.trim().length === 0) continue;
    const cleanKey = key.trim().toUpperCase();
    if (
      cleanKey === 'GEMINI_API_KEY' ||
      cleanKey === 'GOOGLE_API_KEY' ||
      cleanKey === 'VITE_GEMINI_API_KEY' ||
      cleanKey === 'GEMINI_KEY' ||
      cleanKey === 'GOOGLE_GEMINI_API_KEY' ||
      cleanKey === 'GEMINI_APIKEY' ||
      cleanKey.startsWith('GEMINI_API_KEY') ||
      cleanKey.startsWith('VITE_GEMINI_API_KEY') ||
      (cleanKey.includes('GEMINI') && cleanKey.includes('KEY')) ||
      (cleanKey.includes('GOOGLE') && cleanKey.includes('KEY'))
    ) {
      return {
        apiKey: val.replace(/^["']|["']$/g, '').trim(),
        matchedKeyName: key
      };
    }
  }

  return { apiKey: '', matchedKeyName: null };
}

function normalizeModelName(model?: string): string {
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

const GEMINI_CONFIG = {
  PRIMARY_MODEL: normalizeModelName(process.env.GEMINI_FACT_CHECK_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'),
  FAST_MODEL: normalizeModelName(process.env.GEMINI_FAST_MODEL || 'gemini-3.5-flash-lite'),
  FALLBACK_MODEL: normalizeModelName(process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-pro-preview')
} as const;

export const runtime = 'nodejs';
export const maxDuration = 60;

export default async function handler(req: any, res?: any) {
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  const method = req?.method || (req instanceof Request ? req.method : 'POST');
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') return res.status(204).end();
    if (res && typeof res.writeHead === 'function') {
      res.writeHead(204);
      res.end();
      return;
    }
    return new Response(null, { status: 204 });
  }

  if (method === 'GET') {
    return sendJson(res, 200, {
      status: 'ok',
      endpoint: '/api/ping',
      supportedMethods: ['POST', 'GET']
    });
  }

  if (method !== 'POST') {
    return sendJson(res, 405, { 
      success: false, 
      message: 'Phương thức không được hỗ trợ (Method Not Allowed)' 
    });
  }

  try {
    let body: any = {};
    if (req instanceof Request) {
      body = await req.json().catch(() => ({}));
    } else if (typeof req?.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch {
        body = {};
      }
    } else if (req?.body && typeof req.body === 'object') {
      body = req.body;
    }

    // SERVER-SIDE ONLY: Đọc duy nhất từ biến môi trường server với giải thuật linh hoạt
    const { apiKey, matchedKeyName } = resolveServerApiKey();
    const hasGeminiKey = Boolean(apiKey);

    console.log('[PING_DIAGNOSTIC]', { hasGeminiKey, matchedKeyName });

    const requestedModel = normalizeModelName(body.model || process.env.GEMINI_MODEL);

    if (!apiKey) {
      const detectedKeys = Object.keys(process.env).filter(k => {
        const u = k.toUpperCase();
        return u.includes('GEMINI') || u.includes('GOOGLE') || u.includes('KEY') || u.includes('VERCEL');
      });

      console.error('[FACT_CHECK] GEMINI_API_KEY is missing. Detected keys:', detectedKeys);
      return sendJson(res, 500, {
        success: false,
        message: 'Gemini API chưa được cấu hình trên máy chủ (Thiếu GEMINI_API_KEY trong Vercel Environment Variables). Hãy đảm bảo đã tích chọn Production và Preview trong Settings rồi bấm Redeploy deployment mới nhất.',
        diagnostics: {
          hasGeminiKey: false,
          detectedKeys
        }
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { timeout: 6000 }
    });

    const candidateModels = Array.from(new Set([
      requestedModel,
      GEMINI_CONFIG.FAST_MODEL,
      GEMINI_CONFIG.PRIMARY_MODEL,
      GEMINI_CONFIG.FALLBACK_MODEL
    ])).filter(Boolean);

    let resolvedModel = candidateModels[0] || GEMINI_CONFIG.FAST_MODEL;
    let reply = 'Connected';
    let lastPingErr: any = null;
    let pingSuccess = false;

    for (const m of candidateModels) {
      for (let attempt = 0; attempt <= 1; attempt++) {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 1000));
        }
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);

          const response: any = await ai.models.generateContent({
            model: m,
            contents: 'Ping test: Hãy trả lời "TrustNet AI Connected" trong 3 từ.',
            config: {
              abortSignal: controller.signal,
              httpOptions: { timeout: 6000 }
            }
          });
          clearTimeout(timer);

          reply = response.text || 'Connected';
          resolvedModel = m;
          pingSuccess = true;
          break;
        } catch (err: any) {
          lastPingErr = err;
          let msg = err?.message || String(err);
          try {
            const parsedErr = JSON.parse(msg);
            if (parsedErr?.error?.message) msg = parsedErr.error.message;
          } catch {}

          if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
            return sendJson(res, 500, {
              success: false,
              message: 'Khóa Gemini API Key trên máy chủ không hợp lệ hoặc đã bị vô hiệu hóa trên Google AI Studio.'
            });
          }
          if ((msg.includes('503') || msg.includes('high demand') || msg.includes('overloaded')) && attempt < 1) {
            continue;
          }
          break;
        }
      }
      if (pingSuccess) break;
    }

    if (!pingSuccess) {
      let errorMsg = lastPingErr?.message || String(lastPingErr);
      try {
        const parsedJson = JSON.parse(errorMsg);
        if (parsedJson?.error?.message) errorMsg = parsedJson.error.message;
      } catch {}

      if (errorMsg.includes('no longer available') || errorMsg.includes('not found') || errorMsg.includes('NOT_FOUND') || errorMsg.includes('unsupported model')) {
        return sendJson(res, 400, {
          success: false,
          code: 'GEMINI_MODEL_UNAVAILABLE',
          message: `Mô hình Gemini [${resolvedModel}] không khả dụng hoặc đã bị Google ngừng cung cấp: ${errorMsg}`
        });
      } else if (errorMsg.includes('high demand') || errorMsg.includes('503')) {
        return sendJson(res, 503, {
          success: false,
          code: 'GEMINI_TEMPORARILY_UNAVAILABLE',
          message: `Mô hình Gemini đang trải qua thời điểm quá tải tạm thời (503 High Demand). Vui lòng thử lại sau giây lát hoặc chọn ${GEMINI_CONFIG.FAST_MODEL}.`
        });
      } else if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || errorMsg.includes('429')) {
        return sendJson(res, 429, {
          success: false,
          message: 'Hạn mức truy vấn (Quota) của API Key trên máy chủ tạm thời đã hết hoặc bị giới hạn trên AI Studio.'
        });
      } else {
        return sendJson(res, 500, {
          success: false,
          message: errorMsg
        });
      }
    }

    const isSwitched = resolvedModel !== requestedModel;
    return sendJson(res, 200, {
      success: true,
      message: isSwitched
        ? `✅ Kết nối thành công với Google ${resolvedModel}! (Lưu ý: ${requestedModel} được tự động chuẩn hóa sang ${resolvedModel})`
        : `✅ Kết nối thành công với Google ${resolvedModel}! (${reply.trim()})`,
      resolvedModel,
      matchedKeyName: matchedKeyName || undefined
    });
  } catch (err: any) {
    return sendJson(res, 500, {
      success: false,
      message: `Kết nối thất bại: ${err?.message || err}`
    });
  }
}
