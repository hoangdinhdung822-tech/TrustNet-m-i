function sendJson(res: any, statusCode: number, data: any) {
  if (res && typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  if (res && typeof res.writeHead === 'function') {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

  // Case-insensitive & trimmed search across ALL process.env keys
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

export default async function handler(req: any, res?: any) {
  // CORS Preflight
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  const method = req?.method || (req instanceof Request ? req.method : 'GET');
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') return res.status(204).end();
    if (res && typeof res.writeHead === 'function') {
      res.writeHead(204);
      res.end();
      return;
    }
    return new Response(null, { status: 204 });
  }

  // Server-side diagnostic an toàn
  const { apiKey, matchedKeyName } = resolveServerApiKey();
  const hasGeminiKey = Boolean(apiKey);

  const rawGemini = process.env.GEMINI_API_KEY;
  const keyDiagnostics: Record<string, any> = {
    GEMINI_API_KEY: {
      existsInProcessEnv: 'GEMINI_API_KEY' in process.env,
      typeof: typeof rawGemini,
      length: typeof rawGemini === 'string' ? rawGemini.length : 0,
      trimmedLength: typeof rawGemini === 'string' ? rawGemini.trim().length : 0,
      isEmpty: typeof rawGemini !== 'string' || rawGemini.trim().length === 0,
      diagnosticMessage: (typeof rawGemini === 'string' && rawGemini.trim().length > 0)
        ? `Hợp lệ (Độ dài: ${rawGemini.trim().length} ký tự)`
        : 'CẢNH BÁO: Tên biến GEMINI_API_KEY có tồn tại trên Vercel nhưng GIÁ TRỊ ĐANG BỊ RỖNG (0 ký tự)! Vui lòng vào Vercel Settings -> Environment Variables -> Edit GEMINI_API_KEY và dán mã AIza... vào ô Value.'
    }
  };

  // Liệt kê chi tiết các biến có liên quan mà không lộ mã bảo mật
  const detectedKeys = Object.keys(process.env).filter(k => {
    const u = k.toUpperCase();
    return u.includes('GEMINI') || u.includes('GOOGLE') || u.includes('KEY') || u.includes('VERCEL');
  });

  for (const k of detectedKeys) {
    if (k.includes('GEMINI') || k.includes('GOOGLE')) {
      const v = process.env[k];
      const str = typeof v === 'string' ? v : '';
      keyDiagnostics[k] = {
        existsInProcessEnv: true,
        typeof: typeof v,
        length: str.length,
        trimmedLength: str.trim().length,
        isEmpty: str.trim().length === 0,
        startsWithAIza: str.trim().startsWith('AIza'),
        preview: str.trim().length > 4 ? `${str.trim().slice(0, 4)}...${str.trim().slice(-2)}` : '(rỗng)'
      };
    }
  }

  return sendJson(res, 200, {
    status: 'ok',
    hasGeminiKey,
    matchedKeyName: matchedKeyName || null,
    keyDiagnostics,
    detectedKeys,
    service: 'TrustNet Serverless Health',
    environment: {
      vercelEnv: process.env.VERCEL_ENV || 'local',
      vercelRegion: process.env.VERCEL_REGION || 'local'
    },
    timestamp: new Date().toISOString()
  });
}

