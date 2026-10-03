import React, { useState, useMemo } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Flame, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  MessageSquare, 
  AlertTriangle, 
  Lightbulb,
  CheckSquare,
  Square,
  Zap,
  Edit3,
  Eye,
  ShieldCheck,
  ShieldX,
  Check,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DatabaseService } from '../services/dbMock';
import { Scenario, ScenarioQuestionType, User } from '../types';

interface Props {
  user: User;
  onUserUpdate: (u: User) => void;
}

type FilterType = 'all' | 'fill_in_the_blank' | 'quick_reflex_judgment' | 'multi_select' | 'single_choice' | 'completed';

// Helper chuẩn hóa chuỗi tiếng Việt để so sánh điền từ vào ô trống
const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
};

const checkFillInBlankCorrectness = (input: string, acceptable: string[]): boolean => {
  const cleanInput = input.trim().toLowerCase();
  const normUser = normalizeString(input);
  if (!normUser) return false;

  return acceptable.some(ans => {
    const rawMatch = ans.trim().toLowerCase() === cleanInput;
    const normAns = normalizeString(ans);
    return rawMatch || normUser === normAns || normUser.includes(normAns) || (normAns.length > 3 && normAns.includes(normUser));
  });
};

export const ScenariosPage: React.FC<Props> = ({ user, onUserUpdate }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => DatabaseService.getScenarios());
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(() => scenarios[0]?.id || 'scen-1');
  
  // Trạng thái cho từng loại câu hỏi
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [blankInput, setBlankInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [selectedVerdict, setSelectedVerdict] = useState<'MALICIOUS' | 'SAFE' | null>(null);
  
  // Trạng thái kiểm tra kết quả
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isEvaluationSuccess, setIsEvaluationSuccess] = useState<boolean | null>(null);

  // Bộ lọc danh mục câu hỏi
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  const qType: ScenarioQuestionType = activeScenario?.questionType || 'single_choice';

  // Lọc kịch bản theo filter và tìm kiếm
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const matchSearch = searchQuery.trim() === '' || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeFilter === 'all') return true;
      if (activeFilter === 'completed') return s.isCompleted;
      if (activeFilter === 'fill_in_the_blank') return (s.questionType || 'single_choice') === 'fill_in_the_blank';
      if (activeFilter === 'quick_reflex_judgment') return (s.questionType || 'single_choice') === 'quick_reflex_judgment';
      if (activeFilter === 'multi_select') return (s.questionType || 'single_choice') === 'multi_select';
      if (activeFilter === 'single_choice') return (s.questionType || 'single_choice') === 'single_choice';

      return true;
    });
  }, [scenarios, activeFilter, searchQuery]);

  // Reset toàn bộ input khi đổi tình huống
  const handleSelectScenario = (scenId: string) => {
    setSelectedScenarioId(scenId);
    setSelectedOptionId(null);
    setBlankInput('');
    setShowHint(false);
    setSelectedMultiIds([]);
    setSelectedVerdict(null);
    setIsAnswerRevealed(false);
    setIsEvaluationSuccess(null);
  };

  // Reset lại trạng thái của kịch bản hiện tại để làm lại
  const handleResetCurrentScenario = () => {
    setSelectedOptionId(null);
    setBlankInput('');
    setShowHint(false);
    setSelectedMultiIds([]);
    setSelectedVerdict(null);
    setIsAnswerRevealed(false);
    setIsEvaluationSuccess(null);
  };

  // Xử lý chọn Single Choice
  const handleSelectSingleOption = (optId: string) => {
    if (isAnswerRevealed) return;
    setSelectedOptionId(optId);
  };

  // Xử lý Toggle Multi Select
  const handleToggleMultiSelect = (itemId: string) => {
    if (isAnswerRevealed) return;
    setSelectedMultiIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Xử lý chọn Quick Reflex
  const handleSelectQuickReflex = (verdict: 'MALICIOUS' | 'SAFE') => {
    if (isAnswerRevealed) return;
    setSelectedVerdict(verdict);
  };

  // Kiểm tra xem đã đủ điều kiện để bấm nút nộp bài chưa
  const canSubmit = useMemo(() => {
    if (isAnswerRevealed) return false;
    switch (qType) {
      case 'single_choice':
        return !!selectedOptionId;
      case 'fill_in_the_blank':
        return blankInput.trim().length > 0;
      case 'multi_select':
        return selectedMultiIds.length > 0;
      case 'quick_reflex_judgment':
        return selectedVerdict !== null;
      default:
        return false;
    }
  }, [qType, isAnswerRevealed, selectedOptionId, blankInput, selectedMultiIds, selectedVerdict]);

  // Xử lý nộp bài và chấm điểm
  const handleConfirmDecision = () => {
    if (!canSubmit) return;

    let isSuccess = false;

    if (qType === 'single_choice') {
      const chosen = activeScenario.options?.find(o => o.id === selectedOptionId);
      isSuccess = !!chosen?.isCorrect;
    } else if (qType === 'fill_in_the_blank') {
      const acceptable = activeScenario.fillBlankData?.acceptableAnswers || [];
      isSuccess = checkFillInBlankCorrectness(blankInput, acceptable);
    } else if (qType === 'multi_select') {
      const items = activeScenario.multiSelectData?.items || [];
      const correctItemIds = items.filter(i => i.isCorrect).map(i => i.id);
      const minRequired = activeScenario.multiSelectData?.minCorrectRequired || correctItemIds.length;
      
      const hasChosenWrong = selectedMultiIds.some(id => !correctItemIds.includes(id));
      const correctSelectedCount = selectedMultiIds.filter(id => correctItemIds.includes(id)).length;
      
      isSuccess = !hasChosenWrong && correctSelectedCount >= minRequired;
    } else if (qType === 'quick_reflex_judgment') {
      isSuccess = selectedVerdict === activeScenario.quickReflexData?.correctVerdict;
    }

    setIsAnswerRevealed(true);
    setIsEvaluationSuccess(isSuccess);

    // Bắn pháo hoa và cộng điểm XP nếu đúng và chưa hoàn thành trước đó
    if (isSuccess && !activeScenario.isCompleted) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });

      const updated = DatabaseService.completeScenario(activeScenario.id);
      setScenarios(updated);
      onUserUpdate(DatabaseService.getCurrentUser());
    }
  };

  // Chuyển sang tình huống tiếp theo
  const handleGoNextScenario = () => {
    const currentIndex = scenarios.findIndex(s => s.id === activeScenario.id);
    if (currentIndex !== -1 && currentIndex < scenarios.length - 1) {
      handleSelectScenario(scenarios[currentIndex + 1].id);
    } else if (scenarios.length > 0) {
      handleSelectScenario(scenarios[0].id);
    }
  };

  // Helper render huy hiệu loại câu hỏi
  const renderQuestionTypeBadge = (type?: ScenarioQuestionType) => {
    switch (type) {
      case 'fill_in_the_blank':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Điền từ ô trống</span>
          </span>
        );
      case 'quick_reflex_judgment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Phản xạ nhanh</span>
          </span>
        );
      case 'multi_select':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Chọn nhiều đáp án</span>
          </span>
        );
      case 'single_choice':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trắc nghiệm kịch bản</span>
          </span>
        );
    }
  };

  const completedCount = scenarios.filter(s => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / (scenarios.length || 1)) * 100);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header Banner */}
      <section className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Gamepad2 className="w-4 h-4" />
            <span>Cyber Sandbox & Crisis Simulator</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Phòng Thí Nghiệm Tình Huống Giả Lập
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Mô phỏng 12+ kịch bản tấn công mạng, Deepfake AI, tin giả thao túng tâm lý và lừa đảo tài chính với đa dạng hình thức trả lời: 
            <strong> điền từ khuyết, phản xạ nhị phân tốc độ cao, chọn danh mục cấp cứu đa phương án</strong> và trắc nghiệm thực chiến.
          </p>
        </div>

        {/* Level & completed count */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <span>Tiến độ chinh phục:</span>
            <strong className="text-amber-400 font-mono text-sm">{completedCount}/{scenarios.length}</strong>
            <span className="text-slate-400">({progressPercent}%)</span>
          </div>

          <div className="w-44 h-2.5 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] ml-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mỗi tình huống hoàn thành nhận ngay +50 XP</span>
          </div>
        </div>

      </section>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-glow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            Tất cả ({scenarios.length})
          </button>

          <button
            onClick={() => setActiveFilter('fill_in_the_blank')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeFilter === 'fill_in_the_blank'
                ? 'bg-amber-600 text-white shadow-glow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Edit3 className="w-3 h-3 text-amber-400" />
            <span>Điền ô trống ({scenarios.filter(s => s.questionType === 'fill_in_the_blank').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('quick_reflex_judgment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeFilter === 'quick_reflex_judgment'
                ? 'bg-cyan-600 text-white shadow-glow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Phản xạ nhanh ({scenarios.filter(s => s.questionType === 'quick_reflex_judgment').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('multi_select')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeFilter === 'multi_select'
                ? 'bg-purple-600 text-white shadow-glow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <CheckSquare className="w-3 h-3 text-purple-400" />
            <span>Chọn nhiều ({scenarios.filter(s => s.questionType === 'multi_select').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('single_choice')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeFilter === 'single_choice'
                ? 'bg-indigo-600 text-white shadow-glow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <HelpCircle className="w-3 h-3 text-indigo-400" />
            <span>Trắc nghiệm ({scenarios.filter(s => !s.questionType || s.questionType === 'single_choice').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-glow-sm'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Đã hoàn thành ({completedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm kịch bản..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

      </div>

      {/* Main Grid: Left Scenario List (4 cols) - Right Interactive Sandbox (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List (4 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Danh mục ({filteredScenarios.length} Kịch bản)
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Hiển thị: {activeFilter}
            </span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredScenarios.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl text-center text-slate-400 text-xs">
                Không tìm thấy kịch bản nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              filteredScenarios.map((scen) => {
                const isSelected = activeScenario.id === scen.id;
                return (
                  <div
                    key={scen.id}
                    onClick={() => handleSelectScenario(scen.id)}
                    className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500/70 shadow-glow-sm'
                        : 'glass-panel hover:bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-indigo-400 uppercase text-[10px]">
                          {scen.categoryLabel}
                        </span>
                        {renderQuestionTypeBadge(scen.questionType)}
                      </div>

                      {scen.isCompleted ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-400 shrink-0 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Xong
                        </span>
                      ) : (
                        <span className="font-bold text-amber-400 font-mono shrink-0 text-[11px]">
                          +{scen.pointsReward} XP
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs md:text-sm font-bold text-white leading-snug line-clamp-2">
                      {scen.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {scen.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sandbox (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 text-slate-100 relative">
            
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-400" />
                    <span>Mô phỏng thực chiến</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  {renderQuestionTypeBadge(activeScenario.questionType)}
                </div>

                <h2 className="text-lg md:text-2xl font-black text-white leading-tight">
                  {activeScenario.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                  {activeScenario.urgencyLevel}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold font-mono">
                  +{activeScenario.pointsReward} XP
                </span>
              </div>
            </div>

            {/* Context narrative description */}
            <div className="text-xs md:text-sm text-slate-300 italic bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80">
              {activeScenario.description}
            </div>

            {/* Simulated Live Post / Message Box (Mock Social / Chat UI) */}
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-950 p-4 md:p-5 space-y-3 shadow-inner">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeScenario.simulatedMessage.senderAvatar}
                    alt={activeScenario.simulatedMessage.senderName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40"
                  />
                  <div>
                    <span className="font-bold text-white text-xs md:text-sm block">
                      {activeScenario.simulatedMessage.senderName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {activeScenario.simulatedMessage.senderHandle} • {activeScenario.simulatedMessage.timeAgo}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-mono">
                  {activeScenario.simulatedMessage.platform}
                </span>
              </div>

              {/* Message Content */}
              <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed whitespace-pre-line bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                {activeScenario.simulatedMessage.messageText}
              </p>

              {/* Media attached if any */}
              {activeScenario.simulatedMessage.mediaUrl && (
                <div className="rounded-xl overflow-hidden max-h-60 bg-slate-900 border border-slate-800">
                  <img
                    src={activeScenario.simulatedMessage.mediaUrl}
                    alt="Ảnh tình huống"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Tag marker */}
              {activeScenario.simulatedMessage.metadataTag && (
                <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{activeScenario.simulatedMessage.metadataTag}</span>
                </div>
              )}

            </div>

            {/* Question Section Header */}
            <div className="space-y-4">
              <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{activeScenario.question}</span>
              </h3>

              {/* MODE 1: FILL IN THE BLANK (Điền từ vào ô trống) */}
              {qType === 'fill_in_the_blank' && activeScenario.fillBlankData && (
                <div className="space-y-4 p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
                  
                  <div className="text-xs text-amber-300/90 font-medium flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Điền từ hoặc cụm từ then chốt còn thiếu vào ô trống dưới đây:</span>
                  </div>

                  {/* Interactive Inline Sentence Display */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs md:text-sm leading-relaxed text-slate-200">
                    <span>{activeScenario.fillBlankData.prefixText} </span>
                    <span className="inline-block px-3 py-1 mx-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono font-bold tracking-wide">
                      {blankInput.trim() || activeScenario.fillBlankData.blankPlaceholder || '... ? ...'}
                    </span>
                    <span> {activeScenario.fillBlankData.suffixText}</span>
                  </div>

                  {/* Input Form */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Câu trả lời của bạn:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={isAnswerRevealed}
                        value={blankInput}
                        onChange={(e) => setBlankInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && canSubmit) handleConfirmDecision();
                        }}
                        placeholder="Nhập từ khóa (Ví dụ: OTP, cọc tiền, giấy triệu tập...)"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium disabled:opacity-60"
                      />

                      {activeScenario.fillBlankData.hint && !isAnswerRevealed && (
                        <button
                          type="button"
                          onClick={() => setShowHint(!showHint)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý'}</span>
                        </button>
                      )}
                    </div>

                    {showHint && activeScenario.fillBlankData.hint && !isAnswerRevealed && (
                      <p className="text-xs text-amber-300/80 italic bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 animate-in fade-in duration-150">
                        💡 <strong>Gợi ý:</strong> {activeScenario.fillBlankData.hint}
                      </p>
                    )}
                  </div>

                  {/* Feedback when revealed */}
                  {isAnswerRevealed && (
                    <div className={`p-4 rounded-xl border text-xs md:text-sm space-y-2 animate-in fade-in duration-200 ${
                      isEvaluationSuccess 
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200' 
                        : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {isEvaluationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Chính xác tuyệt đối!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Chưa chính xác!</span>
                          </>
                        )}
                      </div>

                      <p className="text-xs">
                        Từ khóa được chấp nhận: <strong className="font-mono underline">{activeScenario.fillBlankData.acceptableAnswers.join(' / ')}</strong>
                      </p>
                      <p className="text-xs italic leading-relaxed text-slate-300 pt-1 border-t border-slate-800">
                        👉 {activeScenario.fillBlankData.explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* MODE 2: MULTI SELECT (Chọn nhiều phương án) */}
              {qType === 'multi_select' && activeScenario.multiSelectData && (
                <div className="space-y-3 p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30">
                  <div className="text-xs text-purple-300 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                      <span>{activeScenario.multiSelectData.instruction}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Đã chọn: <strong className="text-purple-300">{selectedMultiIds.length}</strong>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeScenario.multiSelectData.items.map((item) => {
                      const isChecked = selectedMultiIds.includes(item.id);
                      
                      let cardStyle = 'bg-slate-950 border-slate-800 hover:border-purple-500/50 text-slate-300';
                      if (isAnswerRevealed) {
                        if (item.isCorrect) {
                          cardStyle = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200';
                        } else if (isChecked && !item.isCorrect) {
                          cardStyle = 'bg-rose-950/40 border-rose-500/80 text-rose-200';
                        }
                      } else if (isChecked) {
                        cardStyle = 'bg-purple-950/50 border-purple-500 text-white shadow-glow-sm';
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleMultiSelect(item.id)}
                          className={`p-3.5 rounded-xl border text-xs md:text-sm cursor-pointer transition-all flex items-start gap-3 ${cardStyle}`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-purple-400 shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-purple-400 fill-purple-500/20" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-500" />
                            )}
                          </button>
                          
                          <div className="space-y-1 flex-1">
                            <p className="font-medium">{item.text}</p>
                            {isAnswerRevealed && item.feedback && (
                              <p className={`text-[11px] italic ${
                                item.isCorrect ? 'text-emerald-400' : 'text-rose-300'
                              }`}>
                                👉 {item.feedback}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isAnswerRevealed && (
                    <div className={`p-4 rounded-xl border text-xs md:text-sm space-y-1.5 animate-in fade-in duration-200 ${
                      isEvaluationSuccess 
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200' 
                        : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        {isEvaluationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Bạn đã chọn chính xác toàn bộ các biện pháp xử lý an toàn!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Phương án chưa đầy đủ hoặc có lẫn hành động nguy hại!</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                        {activeScenario.multiSelectData.explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* MODE 3: QUICK REFLEX JUDGMENT (Phản xạ tức thì) */}
              {qType === 'quick_reflex_judgment' && activeScenario.quickReflexData && (
                <div className="space-y-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
                  
                  <div className="text-xs text-cyan-300 font-medium flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Kiểm tra đối tượng sau và quyết định trong chớp mắt:</span>
                  </div>

                  {/* Suspicious Target Inspection Terminal */}
                  <div className="rounded-xl bg-slate-950 border border-cyan-500/40 p-4 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[11px] text-cyan-400/80 pb-2 border-b border-slate-800">
                      <span>TERMINAL SCANNER // FORENSIC VIEW</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> INSPECTING
                      </span>
                    </div>

                    <div className="p-3 bg-black/60 rounded-lg border border-slate-800 text-xs md:text-sm text-cyan-200 break-all leading-relaxed whitespace-pre-wrap">
                      {activeScenario.quickReflexData.targetSnippet}
                    </div>
                  </div>

                  {/* 2 Big Tactile Reflex Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    <button
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectQuickReflex('MALICIOUS')}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        selectedVerdict === 'MALICIOUS'
                          ? 'bg-rose-950 border-rose-500 text-white ring-2 ring-rose-500/50'
                          : 'bg-slate-950 border-slate-800 hover:border-rose-500/50 text-slate-300'
                      }`}
                    >
                      <ShieldX className="w-6 h-6 text-rose-400 shrink-0" />
                      <div>
                        <span className="block font-bold text-xs md:text-sm text-rose-300">
                          {activeScenario.quickReflexData.maliciousLabel || '🔴 ĐỘC HẠI / LỪA ĐẢO'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Chứa mã độc, link giả hoặc bẫy gian lận
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectQuickReflex('SAFE')}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        selectedVerdict === 'SAFE'
                          ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/50'
                          : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 text-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <span className="block font-bold text-xs md:text-sm text-emerald-300">
                          {activeScenario.quickReflexData.safeLabel || '🟢 AN TOÀN / CHÍNH THỐNG'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Nguồn tin cậy, định dạng hợp lệ
                        </span>
                      </div>
                    </button>

                  </div>

                  {isAnswerRevealed && (
                    <div className={`p-4 rounded-xl border text-xs md:text-sm space-y-1.5 animate-in fade-in duration-200 ${
                      isEvaluationSuccess 
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200' 
                        : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        {isEvaluationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Phản xạ cực kỳ sắc bén! Bạn đã nhận diện chuẩn xác.</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Phán đoán chưa chuẩn xác! Bạn đã bị đối tượng đánh lừa.</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                        {activeScenario.quickReflexData.explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* MODE 4: SINGLE CHOICE (Trắc nghiệm 1 đáp án A, B, C, D) */}
              {(!activeScenario.questionType || activeScenario.questionType === 'single_choice') && activeScenario.options && (
                <div className="space-y-2.5">
                  {activeScenario.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;

                    let cardStyle = 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 text-slate-300';
                    if (isAnswerRevealed) {
                      if (opt.isCorrect) {
                        cardStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold shadow-glow-emerald';
                      } else if (isSelected && !opt.isCorrect) {
                        cardStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                      }
                    } else if (isSelected) {
                      cardStyle = 'bg-indigo-950/60 border-indigo-500 text-white font-semibold shadow-glow-sm';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectSingleOption(opt.id)}
                        className={`p-4 rounded-2xl border text-xs md:text-sm cursor-pointer transition-all ${cardStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 mt-0.5 ${
                            isSelected ? 'bg-indigo-500 text-white border-indigo-400' : 'border-slate-700 text-slate-400'
                          }`}>
                            {opt.id.replace('opt-', '').toUpperCase()}
                          </span>
                          <div className="space-y-1">
                            <p>{opt.text}</p>
                            {isAnswerRevealed && (
                              <p className={`text-xs mt-1 italic ${
                                opt.isCorrect ? 'text-emerald-400 font-medium' : 'text-rose-300'
                              }`}>
                                👉 {opt.feedback}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Decision Controls: Submit button or Result & Action Bar */}
            {!isAnswerRevealed ? (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleConfirmDecision}
                  disabled={!canSubmit}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-black text-xs md:text-sm shadow-md transition-all cursor-pointer"
                >
                  <span>Chốt phương án xử lý</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                
                {/* Expert Cyber Tip Callout */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs md:text-sm text-indigo-200 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">
                      Bí quyết từ chuyên gia an ninh mạng TrustNet:
                    </span>
                    <p className="leading-relaxed">{activeScenario.expertTip}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
                  <span className="text-xs text-slate-400 text-center sm:text-left">
                    {isEvaluationSuccess
                      ? '🎉 Bạn đã xuất sắc giải quyết tình huống an toàn và nâng cao kinh nghiệm số!'
                      : '💡 Hãy ghi nhớ kinh nghiệm này để áp dụng bảo vệ bản thân ngoài đời thực!'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCurrentScenario}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Thử lại</span>
                    </button>

                    <button
                      onClick={handleGoNextScenario}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-glow-sm"
                    >
                      <span>Tình huống tiếp</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
