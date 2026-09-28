import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

dotenv.config();

function trustnetApiPlugin(): Plugin {
  const apiHandler = async (req: any, res: any, next: any) => {
    const rawUrl = req.url || '';
    const urlPath = rawUrl.split('?')[0].replace(/\/+$/, '');

    // Hỗ trợ CORS Preflight (OPTIONS)
    if (req.method === 'OPTIONS' && (urlPath.startsWith('/api') || urlPath.startsWith('/v1'))) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-api-key, Authorization');
      res.statusCode = 204;
      res.end();
      return;
    }

    // [GET] /api/v1/health & /v1/health
    if ((urlPath === '/api/v1/health' || urlPath === '/v1/health') && req.method === 'GET') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'online',
        system: 'TrustNet Integrated Server Engine',
        aiStatus: 'Operational',
        searchGrounding: 'Enabled (@google/genai)',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // [POST] /api/v1/fact-check/ping & /v1/fact-check/ping
    if ((urlPath === '/api/v1/fact-check/ping' || urlPath === '/v1/fact-check/ping') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        try {
          res.setHeader('Access-Control-Allow-Origin', '*');
          const parsed = body ? JSON.parse(body) : {};
          const userApiKey = (req.headers['x-gemini-api-key'] as string) || parsed?.apiKey;
          const apiKey = (userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
          let rawModel = parsed?.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
          if (rawModel === 'gemini-3.8-flash' || rawModel === 'gemini-3.5-flash') {
            rawModel = 'gemini-2.5-flash';
          }
          const model = rawModel;

          if (!apiKey) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Chưa cấu hình API Key. Vui lòng thêm GEMINI_API_KEY vào .env hoặc nhập trong Cấu hình.'
            }));
            return;
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
            console.warn('Could not list models:', e?.message);
          }

          const candidateModels = [
            model,
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            ...discoveredModels.filter(m => m.includes('flash')),
            ...discoveredModels.filter(m => !m.includes('flash'))
          ].filter(m => m && m !== 'gemini-3.8-flash');
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
                throw new Error('Khóa Gemini API Key không hợp lệ hoặc đã bị vô hiệu hóa trên Google AI Studio.');
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
              throw new Error('Mô hình Gemini đang trải qua thời điểm quá tải tạm thời (503 High Demand). Vui lòng thử lại sau giây lát hoặc chọn gemini-2.5-flash.');
            } else if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || errorMsg.includes('429')) {
              throw new Error('Hạn mức truy vấn (Quota) của API Key tạm thời đã hết hoặc bị giới hạn trên AI Studio.');
            } else {
              throw new Error(errorMsg);
            }
          }

          const isSwitched = resolvedModel !== model;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: isSwitched
              ? `✅ Kết nối thành công với Google ${resolvedModel}! (Lưu ý: ${model} tạm quá tải trên AI Studio, hệ thống đã tự động kết nối qua ${resolvedModel})`
              : `✅ Kết nối thành công với Google ${resolvedModel}! (${reply.trim()})`,
            resolvedModel
          }));
        } catch (err: any) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            message: `Kết nối thất bại: ${err?.message || err}`
          }));
        }
      });
      return;
    }

    // [POST] /api/v1/fact-check & /v1/fact-check
    if ((urlPath === '/api/v1/fact-check' || urlPath === '/v1/fact-check') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        try {
          res.setHeader('Access-Control-Allow-Origin', '*');
          const parsed = body ? JSON.parse(body) : {};
          const claim = (parsed.claim || parsed.text || '').trim();
          const url = (parsed.url || parsed.sourceUrl || '').trim();
          const model = parsed.model;
          const userApiKey = req.headers['x-gemini-api-key'] as string | undefined;

          if (!claim && !url) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Vui lòng cung cấp nội dung phát ngôn (claim) hoặc đường dẫn bài viết (url) cần kiểm chứng.'
            }));
            return;
          }

          if (url) {
            try {
              const parsedUrl = new URL(url);
              if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'Địa chỉ URL không hợp lệ. Chỉ chấp nhận giao thức http:// hoặc https://.'
                }));
                return;
              }
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: 'Địa chỉ URL không đúng định dạng.'
              }));
              return;
            }
          }

          const apiKey = (userApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
          if (!apiKey) {
            console.error('[FACT-CHECK ERROR] GEMINI_API_KEY is not configured');
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'GEMINI_API_KEY is not configured'
            }));
            return;
          }

          const { FactCheckService } = await import('./backend/services/factCheckService.ts');
          const result = await FactCheckService.verifyClaim({
            claim: claim || undefined,
            text: claim || undefined,
            url: url || undefined,
            sourceUrl: url || undefined,
            userApiKey: userApiKey || undefined,
            requestedModel: model || undefined
          });

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, result }));
        } catch (err: any) {
          console.error('[FACT-CHECK ERROR]', {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined
          });
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : 'Unknown server error'
          }));
        }
      });
      return;
    }

    next();
  };

  return {
    name: 'trustnet-api-server',
    configureServer(server) {
      server.middlewares.use(apiHandler);
    },
    configurePreviewServer(previewServer) {
      previewServer.middlewares.use(apiHandler);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), trustnetApiPlugin()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && 'writeHead' in res && !(res as any).headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend server (port 5000) chưa được khởi động.' }));
            }
          });
        }
      }
    }
  }
});
