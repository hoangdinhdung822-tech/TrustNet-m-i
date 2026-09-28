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
  if (!model) return 'gemini-2.5-flash';
  let clean = model.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-').trim();
  if (clean.startsWith('models/')) clean = clean.replace(/^models\//, '');
  // Google đã đóng (shut down/deprecated) Gemini 1.5 và Gemini 2.0 trên v1beta -> tự động ánh xạ lên gemini-2.5-flash
  if (
    clean.includes('1.5') || 
    clean.includes('2.0') || 
    clean.includes('3.5') || 
    clean.includes('3.8') ||
    !clean.startsWith('gemini-')
  ) {
    return 'gemini-2.5-flash';
  }
  return clean;
}

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

    const ai = new GoogleGenAI({ apiKey });

    // Tự động tìm kiếm các model đang hoạt động thực tế trên API key của người dùng
    let discoveredModels: string[] = [];
    try {
      const list = await ai.models.list();
      for await (const item of list) {
        if (item.name) {
          const cleanName = item.name.replace(/^models\//, '');
          if (cleanName.startsWith('gemini-') && !cleanName.includes('1.5') && !cleanName.includes('2.0')) {
            discoveredModels.push(cleanName);
          }
        }
      }
    } catch (e: any) {
      console.warn('[PING] Could not list models:', e?.message);
    }

    const candidateModels = Array.from(new Set([
      requestedModel,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
      ...discoveredModels
    ])).filter(Boolean);

    let resolvedModel = candidateModels[0] || 'gemini-2.5-flash';
    let reply = 'Connected';
    let lastPingErr: any = null;
    let pingSuccess = false;

    for (const m of candidateModels) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout 10s khi ping mô hình ${m}`)), 10000)
        );

        const callPromise = ai.models.generateContent({
          model: m,
          contents: 'Ping test: Hãy trả lời "TrustNet AI Connected" trong 3 từ.'
        });

        const response: any = await Promise.race([callPromise, timeoutPromise]);
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
        continue;
      }
    }

    if (!pingSuccess) {
      let errorMsg = lastPingErr?.message || String(lastPingErr);
      try {
        const parsedJson = JSON.parse(errorMsg);
        if (parsedJson?.error?.message) errorMsg = parsedJson.error.message;
      } catch {}

      if (errorMsg.includes('high demand') || errorMsg.includes('503')) {
        return sendJson(res, 503, {
          success: false,
          message: 'Mô hình Gemini đang trải qua thời điểm quá tải tạm thời (503 High Demand). Vui lòng thử lại sau giây lát hoặc chọn gemini-2.5-flash.'
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

    const isSwitched = resolvedModel !== model;
    return sendJson(res, 200, {
      success: true,
      message: isSwitched
        ? `✅ Kết nối thành công với Google ${resolvedModel}! (Lưu ý: ${model} tạm quá tải trên AI Studio, hệ thống đã tự động kết nối qua ${resolvedModel})`
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
