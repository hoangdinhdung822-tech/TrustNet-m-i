import { FactCheckCore } from './lib/factCheckCore.ts';

function sendJson(res: any, statusCode: number, data: any) {
  if (res && typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  if (res && typeof res.writeHead === 'function') {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-gemini-api-key, Authorization'
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
        'Access-Control-Allow-Headers': 'Content-Type, x-gemini-api-key, Authorization'
      }
    });
  }
}

export default async function handler(req: any, res?: any) {
  // 1. CORS Preflight
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key, Authorization');
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

  // 2. Health / Test mode check via GET
  if (method === 'GET') {
    return sendJson(res, 200, {
      status: 'ok',
      endpoint: '/api/fact-check',
      message: 'Fact-checking endpoint is operational. Send a POST request with { claim: "..." } to verify.'
    });
  }

  if (method !== 'POST') {
    return sendJson(res, 405, { 
      success: false, 
      error: 'Phương thức không được hỗ trợ (Method Not Allowed). Chỉ chấp nhận POST.' 
    });
  }

  try {
    // 3. Parse request body (tương thích cả Web Request và Node req)
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

    // Hỗ trợ test mode qua body hoặc query
    if (body.health === true || req?.query?.health === 'true') {
      return sendJson(res, 200, {
        status: 'ok',
        mode: 'test-mode',
        message: 'Fact-checking test mode verified successfully without calling Gemini.'
      });
    }

    const claim = (body.claim || body.text || '').trim();
    const url = (body.url || body.sourceUrl || '').trim();
    const model = body.model;

    // 4. Validation: Claim & URL
    if (!claim && !url) {
      return sendJson(res, 400, {
        success: false,
        error: 'Vui lòng cung cấp nội dung phát ngôn (claim) hoặc đường dẫn bài viết (url) cần kiểm chứng.'
      });
    }

    if (url) {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return sendJson(res, 400, {
            success: false,
            error: 'Địa chỉ URL không hợp lệ. Chỉ chấp nhận giao thức http:// hoặc https://.'
          });
        }
      } catch {
        return sendJson(res, 400, {
          success: false,
          error: 'Địa chỉ URL không đúng định dạng.'
        });
      }
    }

    // 5. Kiểm tra Gemini API Key an toàn (Không bao giờ log key)
    const getHeader = (name: string): string | undefined => {
      if (req?.headers) {
        if (typeof req.headers.get === 'function') return req.headers.get(name) || undefined;
        return (req.headers[name] as string) || (req.headers[name.toLowerCase()] as string);
      }
      return undefined;
    };

    const userApiKey = getHeader('x-gemini-api-key') || body.apiKey;
    const apiKey = (userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

    if (!apiKey) {
      console.error('[FACT_CHECK_ERROR] GEMINI_API_KEY is not configured');
      return sendJson(res, 500, {
        success: false,
        error: 'GEMINI_API_KEY is not configured'
      });
    }

    // 6. Thực thi Fact-Checking lõi
    const result = await FactCheckCore.verifyClaim({
      claim: claim || undefined,
      text: claim || undefined,
      url: url || undefined,
      sourceUrl: url || undefined,
      userApiKey: userApiKey || undefined,
      requestedModel: model || undefined
    });

    return sendJson(res, 200, { success: true, result });
  } catch (error: any) {
    console.error('[FACT_CHECK_ERROR]', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Fact-check server error'
    });
  }
}
