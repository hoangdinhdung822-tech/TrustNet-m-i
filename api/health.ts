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

  // Server-side diagnostic an toàn (Chỉ kiểm tra boolean và tên biến, TUYỆT ĐỐI không log key)
  const { apiKey, matchedKeyName } = resolveServerApiKey();
  const hasGeminiKey = Boolean(apiKey);

  const detectedKeys = Object.keys(process.env).filter(k => {
    const u = k.toUpperCase();
    return u.includes('GEMINI') || u.includes('GOOGLE') || u.includes('KEY') || u.includes('VERCEL');
  });

  console.log('[HEALTH_CHECK]', {
    hasGeminiKey,
    matchedKeyName,
    detectedKeys
  });

  return sendJson(res, 200, {
    status: 'ok',
    hasGeminiKey,
    matchedKeyName: matchedKeyName || null,
    detectedKeys,
    service: 'TrustNet Serverless Health',
    environment: {
      vercelEnv: process.env.VERCEL_ENV || 'local',
      vercelRegion: process.env.VERCEL_REGION || 'local'
    },
    timestamp: new Date().toISOString()
  });
}
