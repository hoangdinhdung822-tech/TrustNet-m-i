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

    // SERVER-SIDE ONLY: Đọc duy nhất từ biến môi trường server
    const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();

    const hasGeminiKey = Boolean(apiKey);
    console.log('[PING_DIAGNOSTIC]', { hasGeminiKey });

    let rawModel = body.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    if (rawModel === 'gemini-3.8-flash' || rawModel === 'gemini-3.5-flash') {
      rawModel = 'gemini-2.5-flash';
    }
    const model = rawModel;

    if (!apiKey) {
      console.error('[FACT_CHECK] GEMINI_API_KEY is missing');
      return sendJson(res, 500, {
        success: false,
        message: 'Gemini API chưa được cấu hình trên máy chủ (Thiếu GEMINI_API_KEY trong Vercel Environment Variables).'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const candidateModels = Array.from(new Set([
      model,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ])).filter(m => m && m !== 'gemini-3.8-flash');

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
      resolvedModel
    });
  } catch (err: any) {
    return sendJson(res, 500, {
      success: false,
      message: `Kết nối thất bại: ${err?.message || err}`
    });
  }
}
