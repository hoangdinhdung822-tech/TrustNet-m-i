/**
 * TrustNet Support Chat - Vercel Serverless Function
 * POST /api/support-chat
 * 
 * Endpoint riêng cho chatbot hỗ trợ tinh thần.
 * KHÔNG ảnh hưởng đến hệ thống fact-check hiện tại.
 * API Key chỉ tồn tại phía server.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleSupportChat } from '../backend/services/supportAIService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Chỉ hỗ trợ phương thức POST.',
    });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_MESSAGE',
        message: 'Vui lòng nhập nội dung tin nhắn.',
      });
    }

    // Validate history format
    let sanitizedHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    if (Array.isArray(history)) {
      sanitizedHistory = history
        .filter(
          (m: any) =>
            m &&
            typeof m.content === 'string' &&
            (m.role === 'user' || m.role === 'assistant')
        )
        .slice(-20); // Limit history length
    }

    const result = await handleSupportChat({
      message: message.trim(),
      history: sanitizedHistory,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(503).json(result);
    }
  } catch (err: any) {
    console.error('[SUPPORT-CHAT API ERROR]', err?.message || err);
    return res.status(500).json({
      success: false,
      error: 'SUPPORT_AI_UNAVAILABLE',
      message: 'Hiện tại hệ thống hỗ trợ AI đang tạm thời không khả dụng.',
    });
  }
}
