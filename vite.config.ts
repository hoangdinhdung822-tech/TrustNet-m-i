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
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.statusCode = 204;
      res.end();
      return;
    }

    // [GET] /api/health & /api/v1/health & /v1/health
    if ((urlPath === '/api/health' || urlPath === '/api/v1/health' || urlPath === '/v1/health') && req.method === 'GET') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        system: 'TrustNet Integrated Server Engine',
        aiStatus: 'Operational',
        searchGrounding: 'Enabled (@google/genai)',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // [POST] /api/ping & /api/v1/fact-check/ping & /v1/fact-check/ping
    if ((urlPath === '/api/ping' || urlPath === '/api/v1/fact-check/ping' || urlPath === '/v1/fact-check/ping') && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', async () => {
        try {
          res.setHeader('Access-Control-Allow-Origin', '*');
          const parsed = body ? JSON.parse(body) : {};
          const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
          let rawModel = parsed?.model || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
          let clean = rawModel.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-').trim();
          if (clean.includes('pro') && (clean.includes('2.5') || clean.includes('1.5') || clean.includes('2.0'))) {
            clean = 'gemini-3.1-pro-preview';
          } else if (clean.includes('1.5') || clean.includes('2.0') || clean.includes('2.5') || !clean.startsWith('gemini-')) {
            clean = 'gemini-3.5-flash-lite';
          }
          const model = clean;

          if (!apiKey) {
            console.error('[FACT_CHECK] GEMINI_API_KEY is missing');
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              message: 'Gemini API is not configured on the server.'
            }));
            return;
          }

          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ 
            apiKey,
            httpOptions: { timeout: 10000 }
          });

          const candidateModels = [
            model,
            'gemini-3.5-flash-lite',
            'gemini-3.1-pro-preview'
          ];
          const uniqueModels = Array.from(new Set(candidateModels)).filter(Boolean);

          let resolvedModel = model;
          let reply = 'Connected';
          let lastPingErr: any = null;
          let pingSuccess = false;

          for (const m of uniqueModels) {
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 10000);

              const response = await ai.models.generateContent({
                model: m,
                contents: 'Ping test: Hãy trả lời "TrustNet AI Connected" trong 3 từ.',
                config: {
                  abortSignal: controller.signal,
                  httpOptions: { timeout: 10000 }
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
              throw new Error('Mô hình Gemini đang trải qua thời điểm quá tải tạm thời (503 High Demand). Vui lòng thử lại sau giây lát hoặc chọn gemini-3.5-flash-lite.');
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

    // [GET / POST] /api/fact-check & /api/v1/fact-check & /v1/fact-check
    if (urlPath === '/api/fact-check' || urlPath === '/api/v1/fact-check' || urlPath === '/v1/fact-check') {
      if (req.method === 'GET') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          endpoint: urlPath,
          message: 'Fact-checking endpoint is operational.'
        }));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', async () => {
          try {
            res.setHeader('Access-Control-Allow-Origin', '*');
            const parsed = body ? JSON.parse(body) : {};

            if (parsed.health === true) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                status: 'ok',
                mode: 'test-mode',
                message: 'Fact-checking test mode verified successfully.'
              }));
              return;
            }
          const claim = (parsed.claim || parsed.text || '').trim();
          const url = (parsed.url || parsed.sourceUrl || '').trim();
          const model = parsed.model;

          if (!claim && !url) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Vui lòng cung cấp nội dung phát ngôn (claim) hoặc đường dẫn bài viết (url) cần kiểm chứng.'
            }));
            return;
          }

          const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
          if (!apiKey) {
            console.error('[FACT_CHECK] GEMINI_API_KEY is missing');
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Gemini API is not configured on the server.'
            }));
            return;
          }

          const { FactCheckService } = await import('./backend/services/factCheckService.ts');
          const result = await FactCheckService.verifyClaim({
            claim: claim || undefined,
            text: claim || undefined,
            url: url || undefined,
            sourceUrl: url || undefined,
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
