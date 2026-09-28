export default async function handler(req: any, res?: any) {
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key, Authorization');
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

  const data = {
    status: 'ok',
    service: 'TrustNet Serverless API Gateway',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/ping',
      '/api/fact-check',
      '/api/v1/health',
      '/api/v1/fact-check',
      '/api/v1/fact-check/ping'
    ]
  };

  if (res && typeof res.status === 'function') {
    return res.status(200).json(data);
  }
  if (res && typeof res.writeHead === 'function') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
    return;
  }
  if (typeof Response !== 'undefined' && typeof Response.json === 'function') {
    return Response.json(data, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
