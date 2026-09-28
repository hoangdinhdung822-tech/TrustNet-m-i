export default async function handler(req: any, res: any) {
  // Cấu hình CORS cho mọi request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Phương thức không được hỗ trợ (Method Not Allowed)' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const userApiKey = (req.headers['x-gemini-api-key'] as string) || body.apiKey;
    const apiKey = (userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    const model = body.model || process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Chưa cấu hình API Key. Vui lòng thêm GEMINI_API_KEY vào .env hoặc nhập trong Cấu hình.'
      });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    let discoveredModels: string[] = [];
    try {
      const list = await ai.models.list();
      for await (const item of list) {
        if (item.name) {
          const cleanName = item.name.replace(/^models\//, '');
          discoveredModels.push(cleanName);
        }
      }
    } catch (e: any) {
      console.warn('[Vercel Ping] Không thể lấy danh sách models:', e?.message);
    }

    const candidateModels = [
      model,
      ...discoveredModels.filter(m => m.includes('flash')),
      ...discoveredModels.filter(m => !m.includes('flash')),
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.8-flash'
    ].filter(Boolean);
    const uniqueModels = Array.from(new Set(candidateModels));

    let resolvedModel = model;
    let reply = 'Connected';
    let lastPingErr: any = null;
    let pingSuccess = false;

    for (const m of uniqueModels) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: 'Ping test: Hãy trả lời "TrustNet AI Connected" trong 3 từ.'
        });
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
          return res.status(400).json({
            success: false,
            message: 'Khóa Gemini API Key không hợp lệ hoặc đã bị vô hiệu hóa trên Google AI Studio.'
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
        return res.status(503).json({
          success: false,
          message: 'Mô hình Gemini đang trải qua thời điểm quá tải tạm thời (503 High Demand). Vui lòng thử lại sau giây lát hoặc chọn gemini-2.5-flash.'
        });
      } else if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || errorMsg.includes('429')) {
        return res.status(429).json({
          success: false,
          message: 'Hạn mức truy vấn (Quota) của API Key tạm thời đã hết hoặc bị giới hạn trên AI Studio.'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: errorMsg
        });
      }
    }

    const isSwitched = resolvedModel !== model;
    return res.status(200).json({
      success: true,
      message: isSwitched
        ? `✅ Kết nối thành công với Google ${resolvedModel}! (Lưu ý: ${model} tạm quá tải 503 trên AI Studio, hệ thống đã tự động kết nối qua ${resolvedModel})`
        : `✅ Kết nối thành công với Google ${resolvedModel}! (${reply.trim()})`,
      resolvedModel
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: `Kết nối thất bại: ${err?.message || err}`
    });
  }
}
