import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Heart, 
  Shield, 
  AlertTriangle, 
  RefreshCw, 
  ChevronDown, 
  Phone, 
  Copy, 
  Check, 
  Sparkles, 
  Wind, 
  Play, 
  Pause, 
  RotateCcw,
  LifeBuoy,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { SupportChatService, SupportMessage } from '../services/supportService';

// ========================================
// GREETING VARIANTS
// ========================================

const GREETING_VARIANTS = [
  `Chào bạn 💙\nNếu bạn vừa trải qua một vụ lừa đảo hay sự cố trên mạng, trước hết xin bạn hãy hít một hơi thật sâu và ngồi xuống nghỉ ngơi một chút.\n\nBạn không cần phải tự trách mình. Những kẻ lừa đảo ngày nay sử dụng các kịch bản tâm lý cực kỳ tinh vi, đánh vào lòng tốt hoặc nỗi sợ hãi để ép nạn nhân hành động vội vàng.\n\nBạn hoàn toàn an toàn ở đây. Hãy kể cho mình nghe chuyện gì đã xảy ra, mình sẽ luôn lắng nghe và đồng hành cùng bạn tìm hướng giải quyết.`,
  `Chào bạn 💙\nMình là Trợ Lý Tư Vấn Tâm Lý TrustNet. Mình ở đây để lắng nghe và chia sẻ cùng bạn.\n\nDù bạn đang bàng hoàng, lo sợ, xót xa hay tự dằn vặt — tất cả những cảm xúc đó đều hoàn toàn tự nhiên và dễ hiểu của bất kỳ ai trong hoàn cảnh này.\n\nHãy chia sẻ với mình khi bạn đã sẵn sàng. Không có ai phán xét bạn ở đây cả.`,
  `Chào bạn 💙\nNếu bạn đang cảm thấy bất lực hay mệt mỏi vì một chuyện vừa xảy ra trên không gian mạng, xin hãy nhớ rằng: Bạn không hề đơn độc.\n\nLừa đảo trực tuyến có thể xảy ra với bất kỳ ai, và việc bị lừa không hề nói lên điều gì xấu về trí tuệ hay phẩm giá của bạn.\n\nMình sẵn sàng lắng nghe câu chuyện của bạn và cùng bạn thực hiện các bước xử lý tiếp theo.`,
];

// ========================================
// QUICK ACTION BUTTONS
// ========================================

const QUICK_ACTIONS = [
  { emoji: '💸', label: 'Mình vừa bị lừa chuyển tiền', message: 'Mình vừa bị lừa chuyển tiền trên mạng và đang rất hoảng sợ, không biết phải làm gì bây giờ.' },
  { emoji: '😞', label: 'Mình đang rất tự trách bản thân', message: 'Mình đang rất tự trách bản thân vì đã quá tin người và bị lừa. Mình cảm thấy mình thật ngu ngốc và tồi tệ.' },
  { emoji: '👨‍👩‍👧', label: 'Mình sợ bố mẹ/người thân biết', message: 'Mình đang rất sợ bố mẹ và gia đình biết chuyện sẽ mắng mỏ và thất vọng về mình.' },
  { emoji: '🔐', label: 'Kẻ xấu đang đe dọa tống tiền', message: 'Kẻ lừa đảo đang đe dọa tống tiền và dọa tung tin nhắn hoặc hình ảnh riêng tư của mình lên mạng.' },
  { emoji: '📱', label: 'Mình lỡ nhập mã OTP/click link lạ', message: 'Mình vừa lỡ bấm vào một đường link lạ và nhập số điện thoại cùng mã OTP ngân hàng, mình sợ bị mất hết thông tin.' },
  { emoji: '🌿', label: 'Mình cần lời khuyên để bình tĩnh lại', message: 'Hiện tại tâm trí mình đang rất rối bời và tim đập nhanh. Hãy cho mình lời khuyên để bình tâm lại lúc này.' },
];

// ========================================
// HOTLINES DATA
// ========================================

const EMERGENCY_HOTLINES = [
  {
    name: 'Tổng đài Quốc gia Bảo vệ Trẻ em & Học sinh',
    number: '111',
    desc: 'Tư vấn tâm lý, can thiệp bạo lực & lừa đảo học đường 24/7 (Miễn phí)',
    tag: 'Miễn phí 24/7',
    color: 'emerald'
  },
  {
    name: 'Đường dây nóng An ninh mạng & Phòng chống lừa đảo (NCSC)',
    number: '156',
    desc: 'Tiếp nhận phản ánh cuộc gọi rác, tin nhắn rác & dấu hiệu lừa đảo',
    tag: 'Bộ TT&TT',
    color: 'cyan'
  },
  {
    name: 'Cục An ninh mạng & Phòng chống tội phạm công nghệ cao (A05)',
    number: '069.234.3636',
    desc: 'Tiếp nhận tố giác tội phạm lừa đảo công nghệ cao',
    tag: 'Bộ Công An',
    color: 'blue'
  },
  {
    name: 'Đường dây nóng Hỗ trợ Tâm lý Ngày Mai',
    number: '096 306 1414',
    desc: 'Lắng nghe, thấu cảm và sơ cứu tâm lý cho người đang khủng hoảng',
    tag: 'Tư vấn tâm lý',
    color: 'rose'
  }
];

export const SupportPage: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Breathing Exercise State
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    const randomGreeting = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
    const greetingMsg: SupportMessage = {
      id: SupportChatService.generateId(),
      role: 'assistant',
      content: randomGreeting,
      emotion: 'CALM',
      riskLevel: 'LOW',
      actions: [
        'Hít thở chậm và thả lỏng cơ thể',
        'Chia sẻ chi tiết sự việc để cùng tìm hướng giải quyết',
        'Tham khảo các bước xử lý khẩn cấp ở cột bên phải'
      ],
      needsHumanSupport: false,
      timestamp: Date.now(),
    };
    setMessages([greetingMsg]);
  }, []);

  // 4-7-8 Breathing Cycle Timer
  useEffect(() => {
    let timer: any;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            // Chuyển pha
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 8;
            } else {
              setBreathPhase('inhale');
              return 4;
            }
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase]);

  const toggleBreathing = () => {
    if (!isBreathingActive) {
      setBreathPhase('inhale');
      setBreathCount(4);
      setIsBreathingActive(true);
    } else {
      setIsBreathingActive(false);
    }
  };

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('inhale');
    setBreathCount(4);
  };

  // Auto-scroll
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll detection
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Send message
  const handleSendMessage = async (messageText?: string) => {
    const text = (messageText || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: SupportMessage = {
      id: SupportChatService.generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const historyForApi = messages.filter(
        (m) => m.role === 'user' || m.role === 'assistant'
      );

      const result = await SupportChatService.sendMessage(text, historyForApi);

      const aiMsg: SupportMessage = {
        id: SupportChatService.generateId(),
        role: 'assistant',
        content: result.reply || 'Mình đang lắng nghe bạn. Bạn có thể chia sẻ thêm chi tiết được không?',
        emotion: result.emotion,
        riskLevel: result.riskLevel,
        actions: result.actions,
        needsHumanSupport: result.needsHumanSupport,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const historyForApi = messages.filter(
        (m) => m.role === 'user' || m.role === 'assistant'
      );
      const fallbackResult = SupportChatService.generateEmpatheticLocalReply(text, historyForApi);
      const aiMsg: SupportMessage = {
        id: SupportChatService.generateId(),
        role: 'assistant',
        content: fallbackResult.reply || 'Mình luôn ở đây lắng nghe bạn. Bạn hãy yên tâm chia sẻ nhé.',
        emotion: fallbackResult.emotion,
        riskLevel: fallbackResult.riskLevel,
        actions: fallbackResult.actions,
        needsHumanSupport: fallbackResult.needsHumanSupport,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleClearChat = () => {
    const randomGreeting = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
    const greetingMsg: SupportMessage = {
      id: SupportChatService.generateId(),
      role: 'assistant',
      content: randomGreeting,
      emotion: 'CALM',
      riskLevel: 'LOW',
      actions: [
        'Hít thở chậm và thả lỏng cơ thể',
        'Chia sẻ chi tiết sự việc để cùng tìm hướng giải quyết',
        'Tham khảo các bước xử lý khẩn cấp ở cột bên phải'
      ],
      needsHumanSupport: false,
      timestamp: Date.now(),
    };
    setMessages([greetingMsg]);
  };

  const copyPhoneNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const showQuickActions = messages.length <= 1 && !isLoading;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Banner */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden text-slate-100 border border-indigo-500/20 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/15 via-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-teal-400" />
              <span>Phòng Tư Vấn Tâm Lý AI • Trạm Bình Yên TrustNet</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Bạn Không Phải Đối Mặt Với Điều Này Một Mình 💙
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Không gian an toàn, riêng tư và hoàn toàn không phán xét. AI sẽ luôn lắng nghe, chia sẻ sự đồng cảm, xoa dịu lo âu và hướng dẫn bạn những bước xử lý tốt nhất khi bị lừa đảo hoặc gặp sự cố trên mạng.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <Lock className="w-3.5 h-3.5" />
                100% Ẩn danh & Bảo mật
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-cyan-300 font-medium bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Đồng cảm & Không phán xét
              </span>
              <button
                onClick={() => setIsBreathingOpen(!isBreathingOpen)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBreathingOpen ? 'Ẩn trợ thở 4-7-8' : '🌿 Bài tập thở thư giãn 4-7-8'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleClearChat}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition-all shadow-sm"
              title="Làm mới cuộc trò chuyện"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Bắt đầu cuộc trò chuyện mới</span>
            </button>
            <a
              href="tel:111"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Gọi Tổng Đài 111 (Khẩn cấp 24/7)</span>
            </a>
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-start gap-2.5 text-[11px] text-amber-300/80 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Lưu ý quan trọng:</strong> TrustNet AI đóng vai trò sơ cứu tinh thần và tư vấn định hướng bước đầu, không thay thế cho can thiệp y khoa chuyên sâu. Nếu bạn hoặc ai đó đang có ý nghĩ làm hại bản thân, xin hãy liên hệ ngay với người thân hoặc dịch vụ khẩn cấp gần nhất.
          </span>
        </div>
      </section>

      {/* 2. Interactive 4-7-8 Breathing Tool (Collapsible) */}
      {isBreathingOpen && (
        <section className="glass-panel rounded-3xl p-6 text-slate-100 border border-teal-500/30 bg-gradient-to-br from-teal-950/40 via-slate-900/90 to-slate-950 relative overflow-hidden animate-support-fadein">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Wind className="w-4 h-4" />
                <span>Phương Pháp Thở 4-7-8 Cân Bằng Thần Kinh</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Giải tỏa cơn hoảng loạn và hạ nhịp tim trong 1 phút
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Phương pháp y khoa của TS. Andrew Weil giúp kích hoạt hệ thần kinh đối giao cảm, đưa cơ thể thoát khỏi phản ứng sợ hãi và tái lập sự sáng suốt.
              </p>
            </div>

            {/* Breathing Circle Visualizer */}
            <div className="flex flex-col items-center gap-3">
              <div 
                className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000 border-4 ${
                  breathPhase === 'inhale'
                    ? 'scale-110 bg-teal-500/20 border-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.3)]'
                    : breathPhase === 'hold'
                    ? 'scale-110 bg-indigo-500/25 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.35)]'
                    : 'scale-90 bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                }`}
              >
                <span className="text-3xl font-black font-mono text-white leading-none">
                  {isBreathingActive ? breathCount : '4-7-8'}
                </span>
                <span className="text-xs font-bold text-teal-200 mt-1 uppercase tracking-wider">
                  {!isBreathingActive
                    ? 'Sẵn sàng'
                    : breathPhase === 'inhale'
                    ? 'Hít vào...'
                    : breathPhase === 'hold'
                    ? 'Giữ hơi...'
                    : 'Thở ra từ từ...'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleBreathing}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isBreathingActive
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                >
                  {isBreathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isBreathingActive ? 'Tạm dừng' : 'Bắt đầu thở'}</span>
                </button>
                <button
                  onClick={resetBreathing}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Đặt lại bài tập"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Chat Room (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex flex-col shadow-2xl" style={{ height: '620px' }}>
            
            {/* Chat Bar Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md">
                    <HeartHandshake className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">TrustNet Care AI</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                      Tư vấn tâm lý
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Luôn lắng nghe, thấu cảm & bảo mật</p>
                </div>
              </div>

              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all"
                title="Xóa đoạn chat cũ và bắt đầu lại"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>

            {/* Privacy Shield Sub-header */}
            <div className="px-4 py-2 bg-indigo-950/30 border-b border-slate-800/60 text-center text-[11px] text-indigo-300/80">
              🔒 Hãy thoải mái giãi bày mọi chuyện. Tránh chia sẻ mật khẩu, mã OTP hay thông tin nhạy cảm của bạn.
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            >
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}

              {/* Quick Action Chips when conversation starts */}
              {showQuickActions && (
                <div className="pt-2 space-y-2 animate-support-fadein">
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>Chọn nhanh tình huống của bạn để được tư vấn ngay:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(action.message)}
                        className="text-left flex items-start gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 hover:bg-teal-950/20 text-slate-200 transition-all group cursor-pointer shadow-sm"
                      >
                        <span className="text-lg shrink-0 mt-0.5">{action.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                            {action.label}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {action.message}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-start gap-3 animate-support-fadein">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <HeartHandshake className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-slate-900/90 border border-slate-800/80 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-support-dot1" />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-support-dot2" />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-support-dot3" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">
                      TrustNet AI đang lắng nghe và suy ngẫm lời khuyên cho bạn...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll Down Button */}
            {showScrollBtn && (
              <div className="relative">
                <button
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 shadow-xl transition-all flex items-center gap-1 z-10"
                >
                  <span>Xem tin nhắn mới</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Composer */}
            <div className="border-t border-slate-800/80 bg-slate-900/50 p-3 sm:p-4">
              <div className="flex items-end gap-2.5">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Hãy chia sẻ câu chuyện hoặc cảm xúc của bạn... (Nhấn Enter để gửi)"
                    rows={1}
                    disabled={isLoading}
                    className="w-full resize-none rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-500/70 focus:ring-2 focus:ring-teal-500/20 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-r from-teal-500 via-indigo-600 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 disabled:shadow-none cursor-pointer"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Crisis Toolkit & Hotlines (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Toolkit 1: 4 Bước sơ cứu khủng hoảng khi bị lừa */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-3.5 text-slate-200 shadow-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  4 Bước Ngăn Chặn Tổn Thất
                </h3>
                <p className="text-[10px] text-slate-400">Quy tắc ứng cứu khẩn cấp</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-white block">Dừng mọi chuyển khoản:</strong>
                  <span className="text-slate-400 text-[11px]">Tuyệt đối không đóng thêm "phí hoàn tiền" hay "tiền bảo hiểm".</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-white block">Khóa thẻ & Đổi mật khẩu:</strong>
                  <span className="text-slate-400 text-[11px]">Gọi hotline ngân hàng tạm khóa tài khoản và đổi mật khẩu mạng xã hội.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-white block">Chụp lưu toàn bộ chứng cứ:</strong>
                  <span className="text-slate-400 text-[11px]">Chụp ảnh màn hình tin nhắn, biên lai chuyển tiền, số tài khoản kẻ gian.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-white block">Chia sẻ với người tin cậy:</strong>
                  <span className="text-slate-400 text-[11px]">Mở lòng với bố mẹ, thầy cô hoặc báo cơ quan công an để được bảo vệ.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Toolkit 2: Emergency Hotlines 24/7 */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-3.5 text-slate-200 shadow-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Đường Dây Nóng Hỗ Trợ 24/7
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold">Hoàn toàn miễn cước gọi</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {EMERGENCY_HOTLINES.map((hotline, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/40 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/20">
                      {hotline.tag}
                    </span>
                    <button
                      onClick={() => copyPhoneNumber(hotline.number)}
                      className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Sao chép số điện thoại"
                    >
                      {copiedNumber === hotline.number ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]" title={hotline.name}>
                      {hotline.name}
                    </span>
                    <a
                      href={`tel:${hotline.number.replace(/\./g, '')}`}
                      className="text-xs font-mono font-black text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {hotline.number}
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight">
                    {hotline.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

// ========================================
// CHAT BUBBLE COMPONENT
// ========================================

interface ChatBubbleProps {
  message: SupportMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isHighRisk = message.riskLevel === 'HIGH';

  const getEmotionBadge = (emotion?: string) => {
    switch (emotion) {
      case 'SELF_BLAME':
        return { label: 'Xoa dịu tự trách', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'PANICKED':
        return { label: 'Trấn an hoảng loạn', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'WORRIED':
        return { label: 'Đồng cảm & định hướng', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'POSSIBLE_SELF_HARM':
        return { label: 'Cảnh báo khẩn cấp', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
      default:
        return { label: 'Lắng nghe & thấu cảm', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    }
  };

  const badge = getEmotionBadge(message.emotion);

  return (
    <div className={`flex items-start gap-3 animate-support-fadein ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isUser ? (
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isHighRisk
            ? 'bg-gradient-to-tr from-rose-600 to-red-600'
            : 'bg-gradient-to-tr from-teal-500 to-indigo-600'
        }`}>
          {isHighRisk ? (
            <AlertTriangle className="w-4 h-4 text-white" />
          ) : (
            <HeartHandshake className="w-4 h-4 text-white" />
          )}
        </div>
      ) : null}

      <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Assistant Emotion Badge */}
        {!isUser && message.emotion && (
          <div className="flex items-center gap-1.5 pb-0.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
            isUser
              ? 'rounded-2xl rounded-tr-md bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-medium'
              : isHighRisk
              ? 'rounded-2xl rounded-tl-md bg-red-950/40 border border-red-500/30 text-slate-100'
              : 'rounded-2xl rounded-tl-md bg-slate-900/90 border border-slate-800 text-slate-200'
          }`}
        >
          {message.content}
        </div>

        {/* Action Steps Suggestions */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Gợi ý hành động thiết thực tiếp theo:</span>
            </p>
            <div className="space-y-1.5">
              {message.actions.map((act, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Human Support Alert */}
        {!isUser && message.needsHumanSupport && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2 text-rose-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>Sự an toàn và sức khỏe của bạn là ưu tiên số một.</strong>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">
                Xin hãy gọi ngay người thân hoặc liên hệ Tổng đài Quốc gia 111 (hoặc 096 306 1414) để có người trò chuyện và hỗ trợ trực tiếp bạn nhé!
              </p>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>

      </div>
    </div>
  );
};

export default SupportPage;
