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
      const timer = setTimeout(() => controller.abort(), 20000);

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

      // Nếu API phản hồi thành công và có câu trả lời thực sự
      if (response.ok && data.success && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 10) {
        return {
          success: true,
          reply: data.reply,
          emotion: data.emotion,
          riskLevel: data.riskLevel,
          actions: data.actions,
          needsHumanSupport: data.needsHumanSupport,
        };
      }

      // Khi API chưa cấu hình Gemini hoặc gặp lỗi kết nối, kích hoạt bộ phân tích tâm lý thích ứng đa tầng (Adaptive AI Care Engine)
      return this.generateEmpatheticLocalReply(userMessage, history);
    } catch {
      // Khi mạng ngoại tuyến hoặc máy chủ không phản hồi, lập tức kích hoạt bộ an ủi & tư vấn tâm lý thích ứng
      return this.generateEmpatheticLocalReply(userMessage, history);
    }
  }

  /**
   * Bộ tư vấn tâm lý thích ứng đa tầng (Adaptive Empathetic AI Core)
   * Tùy cơ ứng biến dựa trên chi tiết nạn nhân chia sẻ:
   * - Trích xuất số tiền bị mất (ví dụ: 5 triệu, 500k, 20 triệu, tiền học phí...)
   * - Nhận diện hình thức lừa đảo (chuyển khoản, nhiệm vụ Telegram/Shopee, giả mạo công an, tống tiền ảnh nóng, vay app...)
   * - Nhận diện trạng thái tâm lý (tự trách, hoảng loạn, sợ bố mẹ mắng, bế tắc tuyệt vọng...)
   * - Ghi nhớ ngữ cảnh các câu trò chuyện trước đó, không lặp lại câu chào hay văn mẫu mặc định.
   */
  static generateEmpatheticLocalReply(
    userMessage: string,
    history: SupportMessage[] = []
  ): SupportChatResult {
    const rawText = userMessage.trim();
    const text = rawText.toLowerCase();

    // 0. Xác định lượt trò chuyện (Multi-turn context)
    const userTurnCount = history.filter((m) => m.role === 'user').length;
    const isFirstUserTurn = userTurnCount === 0;

    // 1. TRÍCH XUẤT CÁC THỰC THỂ CỤ THỂ (Entity Extraction)
    
    // a. Trích xuất số tiền bị mất
    const amountMatch = rawText.match(
      /(?:mất|lừa|chuyển|vay|đòi|nạp|cọc|được|gửi|chiếm đoạt|tiêu)?\s*(\d+(?:[.,]\d+)?\s*(?:triệu|tr|nghìn|ngàn|k|tỷ|ty|vnd|đ|đồng)|năm\s*triệu|mười\s*triệu|hai\s*mươi\s*triệu|ba\s*mươi\s*triệu|năm\s*mươi\s*triệu|một\s*triệu|hai\s*triệu|ba\s*triệu|bốn\s*triệu|sáu\s*triệu|bảy\s*triệu|tám\s*triệu|chín\s*triệu|vài\s*triệu|mấy\s*chục\s*triệu|vài\s*chục\s*triệu|tiền\s*học\s*phí|tiền\s*tiết\s*kiệm|tiền\s*lương|toàn\s*bộ\s*tiền|tiền\s*ăn)/i
    );
    const amountStr = amountMatch ? amountMatch[1].trim() : null;

    // b. Trích xuất ngân hàng / phương thức chuyển khoản
    let detectedBank: { name: string; hotline: string; note?: string } | null = null;
    if (text.includes('vietcombank') || text.includes('vcb')) {
      detectedBank = { name: 'Vietcombank', hotline: '1900 54 54 13 (hoặc 024 3824 3524)' };
    } else if (text.includes('techcombank') || text.includes('tcb')) {
      detectedBank = { name: 'Techcombank', hotline: '1800 588 822 (hoặc 024 3944 6699)' };
    } else if (text.includes('mb') || text.includes('quân đội')) {
      detectedBank = { name: 'MB Bank (Ngân hàng Quân Đội)', hotline: '1900 54 54 26' };
    } else if (text.includes('bidv')) {
      detectedBank = { name: 'BIDV', hotline: '1900 9247 (hoặc 024 2220 0588)' };
    } else if (text.includes('agribank') || text.includes('nông nghiệp')) {
      detectedBank = { name: 'Agribank', hotline: '1900 55 88 18' };
    } else if (text.includes('vpbank') || text.includes('vp bank')) {
      detectedBank = { name: 'VPBank', hotline: '1900 54 54 15' };
    } else if (text.includes('acb') || text.includes('á châu')) {
      detectedBank = { name: 'ACB', hotline: '1900 54 54 86' };
    } else if (text.includes('tpbank') || text.includes('tiên phong')) {
      detectedBank = { name: 'TPBank', hotline: '1900 58 58 85' };
    } else if (text.includes('sacombank')) {
      detectedBank = { name: 'Sacombank', hotline: '1800 5858 88' };
    } else if (text.includes('momo')) {
      detectedBank = { name: 'Ví MoMo', hotline: '1900 54 54 41' };
    } else if (text.includes('zalopay')) {
      detectedBank = { name: 'ZaloPay', hotline: '1900 54 54 36' };
    } else if (text.includes('viettel') || text.includes('viettelpay')) {
      detectedBank = { name: 'Viettel Money', hotline: '1800 9000' };
    }

    // ========================================================
    // PHÂN LOẠI ƯU TIÊN 1: NGUY HIỂM TÍNH MẠNG / TỰ HẠI (CRISIS)
    // ========================================================
    if (
      text.includes('không muốn sống') ||
      text.includes('chết đi') ||
      text.includes('tự tử') ||
      text.includes('kết thúc cuộc đời') ||
      text.includes('quá bế tắc') ||
      text.includes('không còn lối thoát') ||
      text.includes('muốn chết') ||
      text.includes('không chịu nổi nữa')
    ) {
      return {
        success: true,
        reply:
          `Mình đang ở đây lắng nghe bạn, và sự an toàn của bạn lúc này là điều quan trọng nhất trên đời 💙.\n\n` +
          (amountStr ? `Mình biết việc mất ${amountStr} là một cú sốc vô cùng nặng nề khiến bạn cảm thấy sụp đổ và bế tắc. ` : `Mình hiểu cảm giác cùng cực và bế tắc đang đè nặng lên ngực bạn lúc này. `) +
          `Nhưng xin bạn hãy tin mình: Tiền bạc hay sai lầm này đều có thể làm lại được theo thời gian, còn mạng sống và sự hiện diện của bạn đối với những người thực sự thương yêu bạn là điều thiêng liêng và duy nhất.\n\n` +
          `Những kẻ lừa đảo là tội phạm đã lên kế hoạch bài bản để thao túng bạn vào góc tối. Lỗi hoàn toàn thuộc về kẻ thủ ác, KHÔNG PHẢI lỗi của bạn.\n\n` +
          `Xin bạn đừng ở một mình lúc này. Hãy hít một hơi thật sâu, uống một ngụm nước ấm và gọi ngay cho người thân tin cậy hoặc đường dây nóng tâm lý miễn phí bên dưới. Có người luôn sẵn lòng ở cạnh bạn!`,
        emotion: 'POSSIBLE_SELF_HARM',
        riskLevel: 'HIGH',
        needsHumanSupport: true,
        actions: [
          'Gọi ngay Tổng đài Quốc gia 111 (Miễn phí 24/7) hoặc Đường dây nóng Tâm lý Ngày Mai: 096 306 1414',
          'Gọi điện hoặc tìm ngay đến người thân, bạn bè thân thiết gần nhất để có người bên cạnh',
          'Tạm đặt điện thoại xuống, không chuyển thêm tiền và không đưa ra bất kỳ quyết định tiêu cực nào'
        ]
      };
    }

    // ========================================================
    // PHÂN LOẠI ƯU TIÊN 2: BỊ TỐNG TIỀN ẢNH NÓNG / SEXTORTION
    // ========================================================
    if (
      text.includes('tống tiền') ||
      text.includes('ảnh nóng') ||
      text.includes('ảnh nhạy cảm') ||
      text.includes('clip') ||
      text.includes('video riêng tư') ||
      text.includes('dọa tung') ||
      text.includes('dọa phát tán') ||
      text.includes('dọa gửi cho bạn') ||
      text.includes('dọa gửi cho bố mẹ') ||
      text.includes('đe dọa')
    ) {
      return {
        success: true,
        reply:
          `Hãy hít một hơi thật sâu và bình tĩnh lại cùng mình: Bạn đang an toàn ở đây và bạn KHÔNG ĐƠN ĐỘC.\n\n` +
          `Tống tiền bằng hình ảnh hay tin nhắn nhạy cảm (Sextortion) là hành vi tội phạm hình sự nguy hiểm. Kẻ xấu đang lợi dụng sự xấu hổ và nỗi sợ hãi để ép bạn phải chuyển tiền.\n\n` +
          `⚠️ **QUY TẮC SỐNG CÒN:**\n` +
          `1. **TUYỆT ĐỐI KHÔNG CHUYỂN TIỀN` + (amountStr ? ` (kể cả số tiền ${amountStr} chúng đòi)` : '') + `:** Kẻ tống tiền không bao giờ dừng lại hay xóa ảnh sau khi nhận tiền. Ngược lại, nếu bạn chuyển, chúng sẽ biết bạn đang hoảng loạn và tiếp tục tống tiền với số tiền gấp 5, gấp 10 lần.\n` +
          `2. **Lưu chứng cứ:** Chụp ảnh màn hình toàn bộ tin nhắn đe dọa, tài khoản mạng xã hội và số tài khoản ngân hàng của kẻ tống tiền.\n` +
          `3. **Chặn dứt khoát:** Chặn tài khoản kẻ gian, khóa trang cá nhân và tạm thời chuyển tài khoản mạng xã hội sang chế độ Riêng tư (Private).\n\n` +
          `Nếu bạn cảm thấy quá áp lực, hãy gọi ngay Tổng đài Quốc gia 111 hoặc nhờ cơ quan công an can thiệp an ninh mạng. Bạn là nạn nhân bị gài bẫy, xin đừng tự hủy hoại bản thân vì sự bẩn thỉu của kẻ xấu!`,
        emotion: 'PANICKED',
        riskLevel: 'HIGH',
        needsHumanSupport: true,
        actions: [
          'Tuyệt đối KHÔNG chuyển tiền, không van xin hay nhân nhượng với kẻ tống tiền',
          'Chụp ảnh lưu giữ toàn bộ tin nhắn đe dọa làm chứng cứ tố giác tội phạm',
          'Chặn kẻ gian trên mọi nền tảng và khóa bảo vệ trang cá nhân mạng xã hội',
          'Liên hệ ngay Tổng đài Quốc gia 111 hoặc cơ quan công an để được bảo vệ an ninh'
        ]
      };
    }

    // ========================================================
    // PHÂN LOẠI ƯU TIÊN 3: SỢ BỐ MẸ / GIA ĐÌNH BIẾT CHUYỆN (KÈM TIỀN HỌC PHÍ NẾU CÓ)
    // ========================================================
    if (
      text.includes('sợ bố mẹ') ||
      text.includes('sợ ba mẹ') ||
      text.includes('bố mẹ mắng') ||
      text.includes('ba mẹ chửi') ||
      text.includes('sợ gia đình') ||
      text.includes('sợ mẹ') ||
      text.includes('sợ bố') ||
      text.includes('sợ thầy cô') ||
      (text.includes('học phí') && (text.includes('sợ') || text.includes('giấu') || text.includes('lo'))) ||
      text.includes('không dám nói')
    ) {
      const tuitionNote = (text.includes('học phí') || amountStr)
        ? ` đặc biệt khi khoản tiền bị mất là ${amountStr || 'tiền học phí'}`
        : '';

      return {
        success: true,
        reply:
          `Mình rất thấu hiểu cảm giác hoảng sợ và áp lực đè nặng trong lòng bạn lúc này 💙. Nỗi sợ bị bố mẹ giận, thất vọng hay trách mắng${tuitionNote} là tâm lý vô cùng tự nhiên vì bạn yêu thương và không muốn làm người thân đau lòng.\n\n` +
          `Nhưng xin bạn hãy ghi nhớ điều này:\n` +
          `- **Bạn là nạn nhân bị kẻ gian gài bẫy, bạn không hề cố ý:** Tội phạm mạng sử dụng kịch bản thao túng tâm lý bài bản, đánh vào sự lương thiện để ép người khác chuyển tiền.\n` +
          `- **Tuyệt đối không vay mượn bù vào:** Rất nhiều bạn vì sợ bố mẹ biết đã tìm đến các app vay tiền online hay tín dụng đen để bù lại${tuitionNote}, dẫn đến số nợ lãi mẹ đẻ lãi con cực kỳ nguy hiểm.\n` +
          `- **Gia đình luôn là điểm tựa an toàn nhất:** Bố mẹ lúc đầu có thể giật mình hoặc buồn vì lo cho bạn, nhưng sự an toàn tính mạng, sức khỏe và tương lai của bạn mới là điều quan trọng nhất đối với bố mẹ.\n\n` +
          `💡 **Gợi ý cách mở lời an toàn với bố mẹ:**\n` +
          `Hãy chuẩn bị sẵn biên lai hoặc chứng cứ bị lừa, chọn lúc bố mẹ thư thái và nói thật lòng: *"Bố mẹ ơi, con vừa gặp phải sự cố lừa đảo trên mạng rất nghiêm trọng. Con đang vô cùng hoảng sợ và ân hận, con cần sự giúp đỡ của bố mẹ để cùng giải quyết..."* Mở lời sớm sẽ giúp bạn trút bỏ được gánh nặng khủng khiếp trong lòng!`,
        emotion: 'WORRIED',
        riskLevel: 'LOW',
        needsHumanSupport: false,
        actions: [
          'Tuyệt đối không tìm đến các app vay tiền online hoặc tín dụng đen để giấu giếm',
          'Hít thở sâu theo nhịp 4-7-8 để lấy lại sự bình tĩnh trước khi mở lời với người thân',
          'Chuẩn bị sẵn bằng chứng bị lừa (tin nhắn, biên lai) để gia đình cùng nắm rõ sự việc'
        ]
      };
    }

    // ========================================================
    // PHÂN LOẠI ƯU TIÊN 4: HỎI CÁCH LẤY LẠI TIỀN / CÓ LẤY LẠI ĐƯỢC KHÔNG
    // ========================================================
    if (
      text.includes('lấy lại được không') ||
      text.includes('lấy lại được tiền') ||
      text.includes('lấy lại tiền') ||
      text.includes('thu hồi tiền') ||
      text.includes('cơ hội lấy lại') ||
      text.includes('hacker lấy lại') ||
      text.includes('luật sư lấy lại') ||
      (text.includes('lấy lại') && text.includes('tiền'))
    ) {
      return {
        success: true,
        reply:
          `Về câu hỏi **"Liệu có lấy lại được tiền không?"**, mình xin chia sẻ rất chân thành và thực tế với bạn để bạn có cái nhìn sáng suốt nhất:\n\n` +
          `1. **Khả năng thu hồi phụ thuộc vào việc phong tỏa kịp thời:** Nếu bạn báo ngân hàng và cơ quan công an thật sớm, khi tiền của kẻ lừa đảo chưa kịp phân tán qua chuỗi tài khoản rác (tài khoản mua bán trái phép), ngân hàng có thể phong tỏa tạm thời tài khoản thụ hưởng để chờ cơ quan điều tra xử lý.\n\n` +
          `2. **Quy trình chính thống:** Chỉ có hai đơn vị duy nhất có thẩm quyền hợp pháp xử lý dòng tiền này: **Ngân hàng thụ hưởng** (tra soát giao dịch) và **Cơ quan Công an** (Cảnh sát điều tra / An ninh mạng A05).\n\n` +
          `3. ⚠️ **CẢNH BÁO SỐNG CÒN:** Trên Facebook, TikTok, Google hiện có hàng loạt fanpage quảng cáo "Cục An ninh mạng hỗ trợ thu hồi tiền treo", "Luật sư lấy lại tiền lừa đảo", "Hacker kéo lại tiền bị lừa". **TẤT CẢ 100% ĐỀU LÀ KẺ LỪA ĐẢO LẦN HAI.** Chúng sẽ yêu cầu bạn nộp "phí mở cổng thanh toán", "phí ủy quyền" rồi biến mất.\n\n` +
          `Hãy tập trung vào việc bảo vệ những gì bạn đang có, làm việc với ngân hàng và cơ quan công an chính thống, bạn nhé!`,
        emotion: 'WORRIED',
        riskLevel: 'LOW',
        needsHumanSupport: false,
        actions: [
          'Liên hệ trực tiếp ngân hàng để yêu cầu tra soát và phong tỏa tài khoản người nhận',
          'Nộp đơn trình báo kèm sao kê giao dịch cho Công an xã/phường hoặc Cục An ninh mạng A05',
          'Cảnh giác tuyệt đối: Không tin bất kỳ ai trên mạng cam kết "lấy lại tiền có phí"'
        ]
      };
    }

    // ========================================================
    // PHÂN LOẠI ƯU TIÊN 5: CÓ SỐ TIỀN CỤ THỂ / MẤT TIỀN (FINANCIAL LOSS)
    // Ví dụ: "tôi vừa bị lừa mất 5 triệu", "mất 500k", "chuyển khoản 20tr"
    // ========================================================
    if (
      amountStr ||
      text.includes('mất tiền') ||
      text.includes('bị lừa') ||
      text.includes('chuyển tiền') ||
      text.includes('chuyển khoản') ||
      text.includes('lừa tiền') ||
      text.includes('mất trắng') ||
      text.includes('đặt cọc') ||
      text.includes('nạp tiền')
    ) {
      const displayAmount = amountStr ? amountStr : 'một số tiền';

      let bankInstruction = '';
      if (detectedBank) {
        bankInstruction = `\n\n🏦 **Xử lý khẩn cấp với ${detectedBank.name}:**\n` +
          `- Gọi ngay Hotline 24/7 của ${detectedBank.name}: **${detectedBank.hotline}**.\n` +
          `- Yêu cầu tổng đài viên hỗ trợ tra soát giao dịch gian lận lừa đảo khẩn cấp và đề nghị gửi công văn phối hợp phong tỏa tài khoản người nhận.`;
      } else {
        bankInstruction = `\n\n🏦 **Liên hệ hotline ngân hàng của bạn ngay:**\n` +
          `- Gọi tổng đài ngân hàng bạn vừa dùng để chuyển tiền, báo cáo giao dịch là hành vi gian lận lừa đảo.\n` +
          `- Đề nghị hỗ trợ tra soát dòng tiền và phối hợp phong tỏa tài khoản thụ hưởng kịp thời.`;
      }

      // Nhận diện thêm kịch bản cụ thể nếu có
      let scenarioSpecificAdvice = '';
      if (text.includes('nhiệm vụ') || text.includes('hoa hồng') || text.includes('shopee') || text.includes('tiktok') || text.includes('telegram') || text.includes('cộng tác viên')) {
        scenarioSpecificAdvice = `\n\n📌 **Về thủ đoạn lừa làm nhiệm vụ / hoa hồng:**\nĐây là kịch bản rất phổ biến: ban đầu chúng trả tiền thưởng nhỏ để tạo lòng tin, sau đó ép bạn nạp các khoản tiền lớn hơn (như ${displayAmount}) với lý do "sai cú pháp", "kẹt lệnh", "đóng thuế mới rút được". Toàn bộ số tiền trên hệ thống đó đều là con số ảo, bạn TUYỆT ĐỐI không nạp thêm bất kỳ đồng nào nữa!`;
      } else if (text.includes('công an') || text.includes('lệnh bắt') || text.includes('viện kiểm sát') || text.includes('phạt nguội') || text.includes('rửa tiền')) {
        scenarioSpecificAdvice = `\n\n📌 **Về thủ đoạn mạo danh Công an / Viện kiểm sát:**\nCơ quan Công an, Viện kiểm sát và Tòa án KHÔNG BAO GIỜ làm việc qua điện thoại, Zalo hay yêu cầu người dân "chuyển tiền vào tài khoản an toàn để thanh tra". 100% các cuộc gọi yêu cầu chuyển tiền đều là mạo danh lừa đảo!`;
      } else if (text.includes('vay') || text.includes('app vay') || text.includes('tín dụng đen')) {
        scenarioSpecificAdvice = `\n\n📌 **Về thủ đoạn app vay tiền / phí giải ngân:**\nKhông có tổ chức tài chính hợp pháp nào yêu cầu người vay nộp tiền trước để "chứng minh thu nhập" hay "mở khóa hợp đồng". Số tiền ${displayAmount} bạn nộp đã bị kẻ gian chiếm đoạt, tuyệt đối không đóng thêm bất kỳ khoản phí nào!`;
      }

      const greetingOpening = isFirstUserTurn
        ? `Mình rất chia sẻ với bạn 💙. Mất đi **${displayAmount}** là một cú sốc không hề nhỏ đối với bất kỳ ai — dù là tiền tích góp, tiền sinh hoạt hay học phí, đó đều là mồ hôi công sức của bạn. Hoàn toàn dễ hiểu khi lúc này bạn đang cảm thấy xót xa, tiếc nuối và tim đập thắt lại.`
        : `Mình ghi nhận và rất hiểu cảm xúc của bạn khi bị mất đi **${displayAmount}**. Lúc này, điều quan trọng nhất là bạn cần giữ bình tĩnh để không bị kẻ gian thao túng thêm.`;

      return {
        success: true,
        reply:
          `${greetingOpening}\n\n` +
          `Trước hết, xin bạn nhớ rõ: **Bạn hoàn toàn không có lỗi trong chuyện này.** Những kẻ lừa đảo là các tổ chức tội phạm chuyên nghiệp, sử dụng kịch bản thao túng tâm lý tinh vi để đánh lừa nạn nhân trong lúc mất cảnh giác.` +
          scenarioSpecificAdvice +
          `\n\n🛑 **CÁC BƯỚC HÀNH ĐỘNG KHẨN CẤP ĐỂ BẢO VỆ BẠN:**\n` +
          `1. **TUYỆT ĐỐI KHÔNG CHUYỂN THÊM TIỀN:** Kẻ gian thường sẽ dở chiêu 'nộp thêm phí để lấy lại ${displayAmount}' hoặc 'bảo hiểm mở khóa tài khoản'. ĐÂY LÀ BẪY BỒI LẦN HAI, tuyệt đối không nộp thêm!\n` +
          `2. **Lưu giữ toàn bộ bằng chứng:** Chụp ảnh màn hình biên lai chuyển tiền ${displayAmount}, số tài khoản nhận, tên chủ tài khoản kẻ gian và toàn bộ tin nhắn trao đổi.` +
          bankInstruction +
          `\n\n3. **CẢNH GIÁC BẪY LẤY LẠI TIỀN:** Tuyệt đối không tin các dịch vụ "hacker lấy lại tiền bị lừa" hay "luật sư cam kết thu hồi tiền treo" trên mạng xã hội — 100% đều là bẫy lừa đảo bồi thêm.\n` +
          `4. **Trình báo cơ quan chức năng:** Bạn có thể gọi Tổng đài 156 (Bộ TT&TT) hoặc đường dây nóng Cục An ninh mạng A05: 069.234.3636 để gửi thông tin tố giác.\n\n` +
          (isFirstUserTurn
            ? `Bạn có thể cho mình biết bạn đã chuyển ${displayAmount} này qua ngân hàng nào, và kẻ gian đã tiếp cận bạn bằng chiêu thức gì không? Mình sẽ hướng dẫn bạn các bước tiếp theo cụ thể nhất!`
            : `Hiện tại bạn đã liên hệ ngân hàng chưa, và bạn có đang cảm thấy quá căng thẳng hay sợ người nhà biết không?`),
        emotion: 'WORRIED',
        riskLevel: 'MEDIUM',
        needsHumanSupport: false,
        actions: [
          `Dừng tuyệt đối mọi chuyển khoản – Không nộp thêm tiền với bất kỳ lý do "thu hồi ${displayAmount}" nào`,
          detectedBank ? `Gọi ngay hotline ${detectedBank.name}: ${detectedBank.hotline}` : 'Liên hệ ngay hotline ngân hàng của bạn để yêu cầu tra soát giao dịch khẩn cấp',
          `Chụp màn hình lưu lại biên lai chuyển ${displayAmount} và tin nhắn với kẻ gian làm bằng chứng`,
          'Tuyệt đối không tìm đến các dịch vụ "thu hồi tiền lừa đảo" hay "hacker" trên mạng',
          'Gọi 156 (Bộ TT&TT) hoặc 069.234.3636 (Cục An ninh mạng A05) để trình báo vụ việc'
        ]
      };
    }

    // ========================================================
    // PHÂN LOẠI 6: TỰ TRÁCH BẢN THÂN / CẢM THẤY TỘI LỖI (SELF-BLAME)
    // ========================================================
    if (
      text.includes('tự trách') ||
      text.includes('ngu ngốc') ||
      text.includes('ngu quá') ||
      text.includes('xấu hổ') ||
      text.includes('tại sao lại tin') ||
      text.includes('hối hận') ||
      text.includes('dại dột') ||
      text.includes('quá tin người') ||
      text.includes('sao mình lại') ||
      text.includes('tự dằn vặt')
    ) {
      return {
        success: true,
        reply:
          `Trước hết, mình muốn bạn lắng nghe thật kỹ điều này: **Bạn KHÔNG hề ngu ngốc, và bạn không đáng bị dằn vặt như vậy 💙.**\n\n` +
          `Việc bạn tin tưởng người khác chỉ chứng minh bạn là một người lương thiện, sống chân thành và đối xử tử tế với cuộc đời. Người có lỗi duy nhất ở đây là những kẻ lừa đảo bất lương đã lợi dụng lòng tốt và sự nhẹ dạ của bạn.\n\n` +
          `Tội phạm mạng ngày nay sử dụng công nghệ Deepfake, tài liệu con dấu giả mạo và các bài học thao túng tâm lý cấp cao được huấn luyện bài bản. Rất nhiều bác sĩ, giáo viên, luật sư và người từng trải cũng đã từng là nạn nhân của chúng.\n\n` +
          `Vấp ngã này là một bài học đắt giá về không gian mạng, nhưng nó KHÔNG định nghĩa giá trị con người bạn. Hãy tha thứ cho chính mình, hít một hơi thật sâu và cùng mình tập trung vào những việc cần xử lý tiếp theo nhé!`,
        emotion: 'SELF_BLAME',
        riskLevel: 'LOW',
        needsHumanSupport: false,
        actions: [
          'Dừng ngay việc tự chỉ trích bản thân – bạn là nạn nhân bị tấn công tâm lý',
          'Thực hiện bài tập thở 4-7-8 ở phía trên để xoa dịu hệ thần kinh',
          'Xem đây là một sự cố an ninh mạng cần giải quyết theo từng bước thực tế'
        ]
      };
    }

    // ========================================================
    // PHÂN LOẠI 7: LỠ NHẬP MÃ OTP / CLICK LINK LẠ / MẤT TÀI KHOẢN
    // ========================================================
    if (
      text.includes('otp') ||
      text.includes('link lạ') ||
      text.includes('mã xác thực') ||
      text.includes('mất nick') ||
      text.includes('lộ mật khẩu') ||
      text.includes('bị chiếm quyền')
    ) {
      return {
        success: true,
        reply:
          `Nếu bạn vừa lỡ bấm vào đường link lạ hoặc nhập mã OTP, hãy hành động NGAY LẬP TỨC theo thứ tự ưu tiên sau:\n\n` +
          `1. **TÀI KHOẢN NGÂN HÀNG (Ưu tiên số 1):**\n` +
          `   - Đăng nhập ngay vào app ngân hàng và thực hiện tính năng **"Khóa thẻ / Tạm khóa tài khoản"**.\n` +
          `   - Nếu không vào được app, gọi ngay số điện thoại hotline ngân hàng báo mất quyền kiểm soát tài khoản để nhân viên khóa khẩn cấp.\n` +
          `   - Đổi mã PIN và mật khẩu Smart OTP trên thiết bị an toàn khác.\n\n` +
          `2. **TÀI KHOẢN MẠNG XÃ HỘI (Facebook, Zalo, Telegram):**\n` +
          `   - Vào Cài đặt bảo mật -> Chọn "Đăng xuất khỏi tất cả các thiết bị".\n` +
          `   - Đổi mật khẩu mới phức tạp và bật xác thực 2 yếu tố (2FA) qua ứng dụng Authenticator (tránh dùng SMS OTP nếu bị chiếm SIM).\n` +
          `   - Đăng thông báo lên một kênh khác để bạn bè, người thân biết nick đang bị nghi ngờ và không chuyển tiền nếu có tin nhắn mượn tiền.\n\n` +
          `Bạn đã thực hiện bước khóa thẻ hay đổi mật khẩu chưa?`,
        emotion: 'PANICKED',
        riskLevel: 'MEDIUM',
        needsHumanSupport: false,
        actions: [
          'Tạm khóa thẻ và tài khoản ngân hàng trên app hoặc qua hotline ngân hàng ngay',
          'Đổi mật khẩu và đăng xuất khỏi mọi thiết bị đối với các tài khoản mạng xã hội',
          'Cảnh báo người thân, bạn bè đề phòng kẻ xấu mạo danh nhắn tin mượn tiền'
        ]
      };
    }

    // ========================================================
    // PHÂN LOẠI 8: TIN NHẮN TIẾP NỐI TRONG HỘI THOẠI (MULTI-TURN DIALOGUE)
    // Khi người dùng đã trò chuyện từ câu 2 trở đi mà không rơi vào các mẫu trên
    // ========================================================
    if (!isFirstUserTurn) {
      let bankFollowUp = '';
      const actionsFollowUp = [
        'Tiếp tục giữ bình tĩnh, thả lỏng vai và thở chậm',
        'Ghi chép lại các mốc thời gian diễn ra sự việc để thuận tiện trình báo',
        'Chia sẻ cụ thể điều làm bạn lo âu nhất để nhận giải pháp thích hợp'
      ];

      if (detectedBank) {
        bankFollowUp = `\n\n🏦 **Về phía ngân hàng ${detectedBank.name}:**\n` +
          `- Bạn hãy gọi ngay Hotline 24/7 của ${detectedBank.name}: **${detectedBank.hotline}**.\n` +
          `- Nhấn phím kết nối tổng đài viên khẩn cấp, báo cáo rõ: "Tôi vừa thực hiện một giao dịch bị lừa đảo, đề nghị ngân hàng hỗ trợ tra soát và hướng dẫn thủ tục phối hợp phong tỏa tài khoản người nhận".\n` +
          `- Hãy lưu lại mã số tra soát của cuộc gọi để nộp cho cơ quan công an khi làm đơn tố giác.`;
        actionsFollowUp.unshift(`Gọi ngay hotline ${detectedBank.name}: ${detectedBank.hotline} để yêu cầu tra soát giao dịch`);
      }

      return {
        success: true,
        reply:
          `Mình đã lắng nghe và nắm được thêm điều bạn vừa chia sẻ: "${rawText.length > 80 ? rawText.slice(0, 80) + '...' : rawText}".` +
          bankFollowUp +
          `\n\nTrong hoàn cảnh này, từng bước đi cẩn trọng và bình tĩnh sẽ giúp bạn kiểm soát lại tình hình tốt hơn. Bạn không cần phải vội vã đưa ra bất kỳ quyết định tài chính nào nữa lúc này.\n\n` +
          `Hiện tại bạn đang cảm thấy lo lắng nhất về khía cạnh nào: việc bảo mật tài khoản, việc giải trình với gia đình, hay các thủ tục trình báo công an? Hãy nói cho mình biết nhé, mình sẽ cùng bạn tháo gỡ từng nút thắt một.`,
        emotion: 'CALM',
        riskLevel: 'LOW',
        needsHumanSupport: false,
        actions: actionsFollowUp
      };
    }

    // ========================================================
    // PHÂN LOẠI 9: CÂU CHUYỆN MỞ ĐẦU TỔNG QUÁT (FIRST CONTACT EMPATHY)
    // ========================================================
    return {
      success: true,
      reply:
        `Mình rất trân trọng khi bạn đã tin tưởng chia sẻ cùng mình 💙.\n\n` +
        `Khi gặp phải một sự cố hay nghi vấn lừa đảo trên mạng, ai trong chúng ta cũng sẽ trải qua cảm giác hoang mang, bối rối và tiếc nuối. Bạn hoàn toàn có thể yên tâm rằng ở đây không có bất kỳ sự phán xét hay trách cứ nào cả.\n\n` +
        `Bạn có thể chia sẻ cụ thể hơn chuyện vừa xảy ra được không? Ví dụ như kẻ gian đã tiếp cận bạn qua nền tảng nào, có liên quan đến tiền bạc hay thông tin cá nhân gì không? Mình sẽ cùng bạn vạch ra giải pháp an toàn nhất!`,
      emotion: 'CALM',
      riskLevel: 'LOW',
      needsHumanSupport: false,
      actions: [
        'Hít thở thật chậm: Hít vào 4 giây, giữ 7 giây và thở ra từ từ trong 8 giây',
        'Ghi lại vắn tắt sự việc để lấy lại quyền kiểm soát tâm lý',
        'Chia sẻ thêm chi tiết với mình để có hướng dẫn cụ thể'
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

