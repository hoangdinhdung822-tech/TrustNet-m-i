import { FactCheckService } from '../../../backend/services/factCheckService.ts';

export default async function handler(req: any, res: any) {
  // Cấu hình CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Phương thức không được hỗ trợ (Method Not Allowed)' 
    });
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
    const text = body.text;
    const sourceUrl = body.sourceUrl;
    const model = body.model;

    if (!text && !sourceUrl) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp nội dung hoặc đường dẫn nguồn cần kiểm chứng.'
      });
    }

    const result = await FactCheckService.verifyClaim({
      text: text || '',
      sourceUrl: sourceUrl || undefined,
      userApiKey: userApiKey || undefined,
      requestedModel: model || undefined
    });

    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error('FactCheck API Vercel Handler Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Lỗi máy chủ trong quá trình kiểm chứng thông tin.'
    });
  }
}
