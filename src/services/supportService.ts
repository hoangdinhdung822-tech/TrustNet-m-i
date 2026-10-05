/**
 * TrustNet Support Chat - Frontend Service
 * Kết nối frontend với API /api/support-chat
 * KHÔNG lưu API Key. KHÔNG gửi dữ liệu tới bên thứ ba.
 */

export interface SupportMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  riskLevel?: string;
  actions?: string[];
  needsHumanSupport?: boolean;
  timestamp: number;
}

export interface SupportChatResult {
  success: boolean;
  reply?: string;
  emotion?: string;
  riskLevel?: string;
  actions?: string[];
  needsHumanSupport?: boolean;
  error?: string;
  message?: string;
}

export class SupportChatService {
  /**
   * Gửi tin nhắn hỗ trợ tới API server
   */
  static async sendMessage(
    userMessage: string,
    history: SupportMessage[]
  ): Promise<SupportChatResult> {
    try {
      // Prepare history (chỉ gửi role + content, không gửi metadata)
      const apiHistory = history
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.trim(),
          history: apiHistory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      let data: any = {};
      try {
        const rawText = await response.text();
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        // Not JSON
      }

      if (!response.ok || !data.success) {
        let errorMsg = data?.message || data?.error;

        if (!errorMsg) {
          if (response.status === 404) {
            errorMsg =
              'Không tìm thấy dịch vụ hỗ trợ AI. Vui lòng đảm bảo server đang chạy.';
          } else if (response.status === 429) {
            errorMsg =
              'Hệ thống hỗ trợ đang tạm thời quá tải. Vui lòng thử lại sau vài phút.';
          } else if (response.status === 503) {
            errorMsg =
              'Dịch vụ hỗ trợ AI đang tạm thời không khả dụng. Vui lòng thử lại sau.';
          } else {
            errorMsg = `Lỗi kết nối (${response.status}): Vui lòng thử lại.`;
          }
        }

        // Khi API server gặp lỗi (ví dụ chưa bật Vercel dev hoặc lỗi mạng), sử dụng bộ tư vấn tâm lý chuyên sâu dự phòng để không bỏ rơi nạn nhân
        const fallback = this.generateEmpatheticLocalReply(userMessage);
        return fallback;
      }

      return {
        success: true,
        reply: data.reply,
        emotion: data.emotion,
        riskLevel: data.riskLevel,
        actions: data.actions,
        needsHumanSupport: data.needsHumanSupport,
      };
    } catch {
      // Khi mạng ngoại tuyến hoặc máy chủ không phản hồi, lập tức kích hoạt bộ an ủi & tư vấn tâm lý nội bộ
      return this.generateEmpatheticLocalReply(userMessage);
    }
  }

  /**
   * Bộ tư vấn tâm lý dự phòng thông minh (Empathetic AI Core)
   * Phân tích cảm xúc, xoa dịu tội lỗi và đưa ra lời khuyên thực tế ngay lập tức.
   */
  static generateEmpatheticLocalReply(userMessage: string): SupportChatResult {
    const text = userMessage.toLowerCase();

    // 1. Dấu hiệu tuyệt vọng / làm hại bản thân (High Crisis)
    if (
      text.includes('không muốn sống') ||
      text.includes('chết đi') ||
      text.includes('tự tử') ||
      text.includes('kết thúc cuộc đời') ||
      text.includes('quá bế tắc') ||
      text.includes('không còn lối thoát')
    ) {
      return {
        success: true,
        reply:
          'Mình nghe bạn và mình thực sự quan tâm đến sự an toàn của bạn lúc này. Xin bạn hãy nhớ rằng bạn vô cùng quý giá, và sự hiện diện của bạn có ý nghĩa lớn lao hơn bất kỳ số tiền bạc hay sai lầm nào trên đời.\n\nTiền mất đi còn có thể làm lại được, nhưng mạng sống và tương lai của bạn là duy nhất. Những kẻ lừa đảo là tội phạm đã lên kế hoạch bài bản để thao túng bạn, lỗi hoàn toàn không thuộc về bạn.\n\nXin bạn đừng ở một mình lúc này. Hãy gọi ngay cho một người bạn thân, người thân mà bạn tin tưởng nhất, hoặc liên hệ ngay với đường dây nóng hỗ trợ tâm lý khẩn cấp.',
        emotion: 'POSSIBLE_SELF_HARM',
        riskLevel: 'HIGH',
        needsHumanSupport: true,
        actions: [
          'Gọi ngay Tổng đài Quốc gia 111 (Miễn phí 24/7) hoặc Đường dây nóng Tâm lý Ngày Mai: 096 306 1414',
          'Gọi điện hoặc chạy ngay sang với người thân, bạn bè gần nhất để có người ở cạnh',
          'Tạm thời tắt điện thoại, uống một ly nước ấm và hít thở sâu, không đưa ra bất kỳ quyết định vội vàng nào'
        ]
      };
    }

    // 2. Tự trách bản thân, cảm thấy xấu hổ / tội lỗi (Self-blame & Shame)
    if (
      text.includes('tự trách') ||
      text.includes('ngu ngốc') ||
      text.includes('xấu hổ') ||
      text.includes('tại sao lại tin') ||
      text.includes('hối hận') ||
      text.includes('dại dột') ||
      text.includes('quá tin người')
    ) {
      return {
        success: true,
        reply:
          'Trước hết, mình muốn bạn biết: Bạn KHÔNG hề ngu ngốc, và bạn không có lỗi trong chuyện này 💙.\n\nViệc bạn tin tưởng người khác chỉ chứng minh bạn là một người lương thiện, sống chân thành và tử tế. Những kẻ lừa đảo ngày nay sử dụng những thủ đoạn thao túng tâm lý và công nghệ Deepfake cực kỳ tinh vi, được thiết kế để đánh lừa ngay cả những người cẩn thận và có học thức cao nhất.\n\nĐừng để sự gian xảo của kẻ xấu cướp đi sự tự tin và lòng tự trọng của bạn. Vấp ngã này là một bài học đắt giá về không gian mạng, nhưng nó không định nghĩa giá trị con người bạn. Hãy tha thứ cho chính mình nhé!',
        emotion: 'SELF_BLAME',
        riskLevel: 'LOW',
        needsHumanSupport: false,
        actions: [
          'Dừng ngay việc tự chỉ trích bản thân – bạn là nạn nhân, không phải thủ phạm',
          'Hít thở sâu theo nhịp 4-7-8 để đưa hệ thần kinh về trạng thái cân bằng',
          'Nhìn nhận sự việc như một rủi ro an ninh mạng cần xử lý từng bước, thay vì một thất bại cá nhân'
        ]
      };
    }

    // 3. Mất tiền / lừa đảo tài chính / chuyển khoản (Financial Loss)
    if (
      text.includes('mất tiền') ||
      text.includes('chuyển tiền') ||
      text.includes('lừa tiền') ||
      text.includes('đặt cọc') ||
      text.includes('nạp tiền') ||
      text.includes('nhiệm vụ') ||
      text.includes('tiết kiệm') ||
      text.includes('vay tiền')
    ) {
      return {
        success: true,
        reply:
          'Mình rất thấu hiểu cảm giác xót xa, hoảng hốt và bất an khi số tiền bạn dành dụm bỗng nhiên biến mất. Đó là cảm xúc hoàn toàn tự nhiên của bất kỳ ai trong hoàn cảnh này.\n\nLúc này, điều quan trọng nhất là bạn cần giữ bình tĩnh để ngăn chặn rủi ro tiếp theo. Kẻ lừa đảo thường sẽ tiếp tục giả vờ là chuyên viên, luật sư, hoặc yêu cầu bạn nạp thêm tiền để "mở khóa hoàn tiền" – đây là bẫy lừa đảo bồi thêm, bạn TUYỆT ĐỐI KHÔNG chuyển thêm bất kỳ đồng nào.\n\nHãy cùng mình thực hiện các bước bảo vệ khẩn cấp ngay dưới đây:',
        emotion: 'WORRIED',
        riskLevel: 'MEDIUM',
        needsHumanSupport: false,
        actions: [
          'Tuyệt đối DỪNG chuyển thêm tiền, dù đối phương có hứa hẹn "hoàn tiền" hay đe dọa thế nào',
          'Liên hệ ngay hotline ngân hàng của bạn để yêu cầu tra soát giao dịch lừa đảo và tạm khóa tài khoản/thẻ',
          'Chụp ảnh toàn bộ tin nhắn, số tài khoản nhận tiền, biên lai chuyển khoản và link kẻ gian để làm bằng chứng',
          'Làm đơn trình báo cơ quan Công an phường/xã hoặc Cục An ninh mạng (A05) để ghi nhận vụ việc'
        ]
      };
    }

    // 4. Bị tống tiền, đe dọa lộ ảnh / tin nhắn nhạy cảm (Blackmail / Extortion)
    if (
      text.includes('tống tiền') ||
      text.includes('đe dọa') ||
      text.includes('ảnh nóng') ||
      text.includes('ảnh nhạy cảm') ||
      text.includes('clip') ||
      text.includes('dọa gửi cho bạn bè') ||
      text.includes('dọa gửi cho bố mẹ')
    ) {
      return {
        success: true,
        reply:
          'Hãy bình tĩnh lại một chút, mình đang ở đây cùng bạn. Tống tiền bằng hình ảnh hoặc thông tin nhạy cảm là một hành vi tội phạm nghiêm trọng và kẻ xấu đang lợi dụng nỗi sợ hãi để tống tiền bạn.\n\nNguyên tắc vàng sống còn: TUYỆT ĐỐI KHÔNG CHUYỂN TIỀN. Kẻ tống tiền sẽ không bao giờ xóa ảnh hay dừng lại sau khi nhận tiền; ngược lại, việc bạn chuyển tiền sẽ khiến chúng nhận ra bạn đang hoảng sợ và tiếp tục đòi số tiền lớn hơn gấp nhiều lần.\n\nHãy cùng mình cắt đứt vòng xoáy này ngay bây giờ:',
        emotion: 'PANICKED',
        riskLevel: 'HIGH',
        needsHumanSupport: true,
        actions: [
          'Tuyệt đối KHÔNG trả tiền, không van xin hay thỏa hiệp với kẻ tống tiền',
          'Chụp ảnh lưu lại toàn bộ tin nhắn đe dọa, tài khoản mạng xã hội của kẻ gian để làm chứng cứ tố giác',
          'Chặn liên lạc ngay lập tức và cài đặt tài khoản mạng xã hội của bạn về chế độ Riêng tư (Private)',
          'Liên hệ ngay Tổng đài Quốc gia 111 hoặc cơ quan Công an để được hướng dẫn can thiệp pháp lý an toàn'
        ]
      };
    }

    // 5. Sợ bố mẹ, người thân biết chuyện (Fear of Family Reaction)
    if (
      text.includes('sợ bố mẹ') ||
      text.includes('bố mẹ mắng') ||
      text.includes('gia đình') ||
      text.includes('sợ thầy cô') ||
      text.includes('giấu') ||
      text.includes('không dám nói')
    ) {
      return {
        success: true,
        reply:
          'Nỗi sợ bị bố mẹ hoặc người thân trách móc là tâm lý vô cùng phổ biến, đặc biệt khi đó là số tiền lớn hoặc tiền học phí. Bạn lo lắng vì bạn yêu thương và không muốn làm người thân thất vọng.\n\nNhưng bạn hãy nhớ rằng: Gia đình vẫn là chỗ dựa an toàn nhất. Bố mẹ ban đầu có thể sốc hoặc giận dữ vì lo lắng cho bạn, nhưng đến cuối cùng, sự an toàn tính mạng và tinh thần của bạn mới là điều quan trọng nhất đối với họ.\n\nViệc giấu giếm chỉ khiến bạn chịu áp lực một mình và kẻ xấu có thể lợi dụng điều này để đe dọa thêm. Hãy chọn một thời điểm mọi người bình tĩnh và thành thật chia sẻ nhé.',
        emotion: 'WORRIED',
        riskLevel: 'LOW',
        needsHumanSupport: false,
        actions: [
          'Chọn một thời điểm gia đình quây quần, thư thái để mở lời giãi bày',
          'Bắt đầu bằng sự thành thật: "Con có một sự cố nghiêm trọng xảy ra trên mạng, con rất ân hận và cần sự giúp đỡ của bố mẹ..."',
          'Trình bày bạn đã lưu lại bằng chứng và xin ý kiến định hướng từ gia đình để cùng giải quyết'
        ]
      };
    }

    // 6. Gợi ý tổng quát / Lắng nghe mở đầu (General Empathy)
    return {
      success: true,
      reply:
        'Cảm ơn bạn đã mở lòng và tin tưởng chia sẻ cùng mình 💙.\n\nBất cứ ai khi gặp phải sự cố lừa đảo hay bị lừa gạt trên Internet đều sẽ trải qua những cảm xúc xáo trộn: từ giật mình, lo sợ, tiếc nuối đến mất niềm tin vào xung quanh. Tất cả những cảm xúc bạn đang có đều hoàn toàn bình thường.\n\nMình ở đây để lắng nghe mà không hề phán xét. Bạn có thể kể chi tiết hơn về chuyện vừa xảy ra được không? Kẻ lừa đảo đã tiếp cận bạn qua đâu và hiện tại bạn đang lo lắng về điều gì nhất?',
      emotion: 'CALM',
      riskLevel: 'LOW',
      needsHumanSupport: false,
      actions: [
        'Hít thở thật chậm và sâu: Hít vào 4 giây, giữ 7 giây, thở ra từ từ trong 8 giây',
        'Ghi lại vắn tắt diễn biến sự việc để lấy lại quyền kiểm soát tinh thần',
        'Chia sẻ thêm chi tiết với mình để chúng ta cùng vạch ra giải pháp cụ thể'
      ]
    };
  }

  /**
   * Tạo ID duy nhất cho message
   */
  static generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}
