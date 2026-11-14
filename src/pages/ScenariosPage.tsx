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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-slate-900 text-amber-900 dark:text-amber-300 text-[11px] font-black shadow-[1px_1px_0_0_#0f172a]">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Điền từ ô trống</span>
          </span>
        );
      case 'quick_reflex_judgment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border-2 border-slate-900 text-cyan-900 dark:text-cyan-300 text-[11px] font-black shadow-[1px_1px_0_0_#0f172a]">
            <Zap className="w-3.5 h-3.5" />
            <span>Phản xạ nhanh</span>
          </span>
        );
      case 'multi_select':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 border-2 border-slate-900 text-purple-900 dark:text-purple-300 text-[11px] font-black shadow-[1px_1px_0_0_#0f172a]">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Chọn nhiều đáp án</span>
          </span>
        );
      case 'single_choice':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-indigo-950/60 border-2 border-slate-900 text-blue-900 dark:text-indigo-300 text-[11px] font-black shadow-[1px_1px_0_0_#0f172a]">
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
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/40 via-yellow-100/30 to-transparent dark:from-amber-500/15 dark:via-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] text-amber-900 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
            <Gamepad2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Cyber Sandbox & Crisis Simulator</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Phòng Thí Nghiệm Tình Huống Giả Lập
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
            Mô phỏng 12+ kịch bản tấn công mạng, Deepfake AI, tin giả thao túng tâm lý và lừa đảo tài chính với đa dạng hình thức trả lời: 
            <strong className="text-blue-700 dark:text-blue-300"> điền từ khuyết, phản xạ nhị phân tốc độ cao, chọn danh mục cấp cứu đa phương án</strong> và trắc nghiệm thực chiến.
          </p>
        </div>

        {/* Level & completed count */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs relative z-10 pt-3 border-t-2 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <span>Tiến độ chinh phục:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{completedCount}/{scenarios.length}</strong>
            <span className="text-slate-500 dark:text-slate-400 font-bold">({progressPercent}%)</span>
          </div>

          <div className="w-44 h-3 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px] font-bold ml-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
            className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 border-slate-900 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-[2px_2px_0_0_#0f172a]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_0_#0f172a]'
            }`}
          >
            Tất cả ({scenarios.length})
          </button>

          <button
            onClick={() => setActiveFilter('fill_in_the_blank')}
            className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border-2 border-slate-900 cursor-pointer ${
              activeFilter === 'fill_in_the_blank'
                ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0_0_#0f172a]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_0_#0f172a]'
            }`}
          >
            <Edit3 className="w-3 h-3 text-amber-600" />
            <span>Điền ô trống ({scenarios.filter(s => s.questionType === 'fill_in_the_blank').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('quick_reflex_judgment')}
            className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border-2 border-slate-900 cursor-pointer ${
              activeFilter === 'quick_reflex_judgment'
                ? 'bg-cyan-400 text-slate-950 shadow-[2px_2px_0_0_#0f172a]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_0_#0f172a]'
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-600" />
            <span>Phản xạ nhanh ({scenarios.filter(s => s.questionType === 'quick_reflex_judgment').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('multi_select')}
            className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border-2 border-slate-900 cursor-pointer ${
              activeFilter === 'multi_select'
                ? 'bg-purple-500 text-white shadow-[2px_2px_0_0_#0f172a]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_0_#0f172a]'
            }`}
          >
            <CheckSquare className="w-3 h-3 text-purple-600" />
            <span>Chọn nhiều ({scenarios.filter(s => s.questionType === 'multi_select').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('single_choice')}
            className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border-2 border-slate-900 cursor-pointer ${
              activeFilter === 'single_choice'
                ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_#0f172a]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_0_#0f172a]'
            }`}
          >
            <HelpCircle className="w-3 h-3 text-indigo-600" />
            <span>Trắc nghiệm ({scenarios.filter(s => !s.questionType || s.questionType === 'single_choice').length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border-2 border-slate-900 cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-[2px_2px_0_0_#0f172a]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-[2px_2px_0_0_#0f172a]'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-bold"
          />
        </div>

      </div>

      {/* Main Grid: Left Scenario List (4 cols) - Right Interactive Sandbox (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List (4 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Danh mục ({filteredScenarios.length} Kịch bản)
            </h2>
            <span className="text-[11px] text-slate-500 font-mono font-bold">
              Hiển thị: {activeFilter}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredScenarios.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] p-6 rounded-2xl text-center text-slate-500 text-xs font-bold">
                Không tìm thấy kịch bản nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              filteredScenarios.map((scen) => {
                const isSelected = activeScenario.id === scen.id;
                return (
                  <div
                    key={scen.id}
                    onClick={() => handleSelectScenario(scen.id)}
                    className={`p-4 rounded-2xl cursor-pointer border-2 border-slate-900 transition-all ${
                      isSelected
                        ? 'bg-amber-100 dark:bg-indigo-950/80 shadow-[4px_4px_0_0_#0f172a] -translate-y-0.5'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/90 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-blue-700 dark:text-indigo-400 uppercase text-[10px]">
                          {scen.categoryLabel}
                        </span>
                        {renderQuestionTypeBadge(scen.questionType)}
                      </div>

                      {scen.isCompleted ? (
                        <span className="flex items-center gap-1 font-black text-emerald-800 dark:text-emerald-400 shrink-0 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Xong
                        </span>
                      ) : (
                        <span className="font-black text-amber-700 dark:text-amber-400 font-mono shrink-0 text-[11px]">
                          +{scen.pointsReward} XP
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {scen.title}
                    </h3>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
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
          
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] rounded-3xl p-6 md:p-8 space-y-6 text-slate-900 dark:text-slate-100 relative">
            
            {/* Context Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>Mô phỏng thực chiến</span>
                  </div>
                  <span className="text-slate-400 font-bold">•</span>
                  {renderQuestionTypeBadge(activeScenario.questionType)}
                </div>

                <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeScenario.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-400 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] text-xs font-black">
                  {activeScenario.urgencyLevel}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] text-xs font-black font-mono">
                  +{activeScenario.pointsReward} XP
                </span>
              </div>
            </div>

            {/* Context narrative description */}
            <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] font-medium">
              {activeScenario.description}
            </div>

            {/* Simulated Live Post / Message Box (Mock Social / Chat UI) */}
            <div className="rounded-2xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-950 p-4 md:p-5 space-y-3 shadow-[3px_3px_0_0_#0f172a]">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeScenario.simulatedMessage.senderAvatar}
                    alt={activeScenario.simulatedMessage.senderName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]"
                  />
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-xs md:text-sm block">
                      {activeScenario.simulatedMessage.senderName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {activeScenario.simulatedMessage.senderHandle} • {activeScenario.simulatedMessage.timeAgo}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-2 border-slate-900 text-[11px] font-mono font-bold shadow-[1px_1px_0_0_#0f172a]">
                  {activeScenario.simulatedMessage.platform}
                </span>
              </div>

              {/* Message Content */}
              <p className="text-xs md:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900/40 p-3.5 rounded-xl border-2 border-slate-900">
                {activeScenario.simulatedMessage.messageText}
              </p>

              {/* Media attached if any */}
              {activeScenario.simulatedMessage.mediaUrl && (
                <div className="rounded-xl overflow-hidden max-h-60 bg-slate-900 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
                  <img
                    src={activeScenario.simulatedMessage.mediaUrl}
                    alt="Ảnh tình huống"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Tag marker */}
              {activeScenario.simulatedMessage.metadataTag && (
                <div className="text-[11px] font-black text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{activeScenario.simulatedMessage.metadataTag}</span>
                </div>
              )}

            </div>

            {/* Question Section Header */}
            <div className="space-y-4">
              <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-indigo-400 shrink-0" />
                <span>{activeScenario.question}</span>
              </h3>

              {/* MODE 1: FILL IN THE BLANK (Điền từ vào ô trống) */}
              {qType === 'fill_in_the_blank' && activeScenario.fillBlankData && (
                <div className="space-y-4 p-5 rounded-2xl bg-amber-50 dark:bg-slate-950/80 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
                  
                  <div className="text-xs text-amber-900 dark:text-amber-300 font-black flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-700" />
                    <span>Điền từ hoặc cụm từ then chốt còn thiếu vào ô trống dưới đây:</span>
                  </div>

                  {/* Interactive Inline Sentence Display */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-900 text-xs md:text-sm leading-relaxed text-slate-900 dark:text-slate-200 font-medium">
                    <span>{activeScenario.fillBlankData.prefixText} </span>
                    <span className="inline-block px-3 py-1 mx-1.5 rounded-lg bg-amber-200 dark:bg-amber-500/20 border-2 border-slate-900 text-amber-950 dark:text-amber-300 font-mono font-black tracking-wide shadow-[1px_1px_0_0_#0f172a]">
                      {blankInput.trim() || activeScenario.fillBlankData.blankPlaceholder || '... ? ...'}
                    </span>
                    <span> {activeScenario.fillBlankData.suffixText}</span>
                  </div>

                  {/* Input Form */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-400 uppercase tracking-wider block">
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
                        className="flex-1 bg-white dark:bg-slate-950 border-2 border-slate-900 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-bold disabled:opacity-60 shadow-[2px_2px_0_0_#0f172a]"
                      />

                      {activeScenario.fillBlankData.hint && !isAnswerRevealed && (
                        <button
                          type="button"
                          onClick={() => setShowHint(!showHint)}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border-2 border-slate-900 text-xs font-black flex items-center gap-1.5 transition-all shadow-[2px_2px_0_0_#0f172a] cursor-pointer"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý'}</span>
                        </button>
                      )}
                    </div>

                    {showHint && activeScenario.fillBlankData.hint && !isAnswerRevealed && (
                      <p className="text-xs text-amber-950 dark:text-amber-300/80 italic bg-amber-100 dark:bg-amber-500/10 p-3 rounded-xl border-2 border-slate-900 font-semibold animate-in fade-in duration-150">
                        💡 <strong>Gợi ý:</strong> {activeScenario.fillBlankData.hint}
                      </p>
                    )}
                  </div>

                  {/* Feedback when revealed */}
                  {isAnswerRevealed && (
                    <div className={`p-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-xs md:text-sm space-y-2 animate-in fade-in duration-200 ${
                      isEvaluationSuccess 
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium' 
                        : 'bg-rose-100 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-medium'
                    }`}>
                      <div className="flex items-center gap-2 font-black text-sm">
                        {isEvaluationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Chính xác tuyệt đối!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-700" />
                            <span>Chưa chính xác!</span>
                          </>
                        )}
                      </div>

                      <p className="text-xs font-bold">
                        Từ khóa được chấp nhận: <strong className="font-mono underline">{activeScenario.fillBlankData.acceptableAnswers.join(' / ')}</strong>
                      </p>
                      <p className="text-xs italic leading-relaxed text-slate-800 dark:text-slate-300 pt-1 border-t-2 border-slate-900/10 dark:border-slate-800">
                        👉 {activeScenario.fillBlankData.explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* MODE 2: MULTI SELECT (Chọn nhiều phương án) */}
              {qType === 'multi_select' && activeScenario.multiSelectData && (
                <div className="space-y-3 p-5 rounded-2xl bg-purple-50 dark:bg-slate-950/80 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
                  <div className="text-xs text-purple-900 dark:text-purple-300 font-black flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-purple-700" />
                      <span>{activeScenario.multiSelectData.instruction}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                      Đã chọn: <strong className="text-purple-800 dark:text-purple-300 font-black">{selectedMultiIds.length}</strong>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeScenario.multiSelectData.items.map((item) => {
                      const isChecked = selectedMultiIds.includes(item.id);
                      
                      let cardStyle = 'bg-white dark:bg-slate-950 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] hover:bg-slate-50 text-slate-800 dark:text-slate-200';
                      if (isAnswerRevealed) {
                        if (item.isCorrect) {
                          cardStyle = 'bg-emerald-100 dark:bg-emerald-950/40 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-emerald-950 dark:text-emerald-200 font-bold';
                        } else if (isChecked && !item.isCorrect) {
                          cardStyle = 'bg-rose-100 dark:bg-rose-950/40 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-rose-950 dark:text-rose-200 font-bold';
                        }
                      } else if (isChecked) {
                        cardStyle = 'bg-purple-100 dark:bg-purple-950/50 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-purple-950 dark:text-white font-bold -translate-y-0.5';
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleMultiSelect(item.id)}
                          className={`p-3.5 rounded-xl border text-xs md:text-sm cursor-pointer transition-all flex items-start gap-3 ${cardStyle}`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 text-purple-700 shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-purple-700" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                          
                          <div className="space-y-1 flex-1">
                            <p className="font-bold">{item.text}</p>
                            {isAnswerRevealed && item.feedback && (
                              <p className={`text-[11px] italic font-semibold ${
                                item.isCorrect ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-300'
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
                    <div className={`p-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-xs md:text-sm space-y-1.5 animate-in fade-in duration-200 ${
                      isEvaluationSuccess 
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200' 
                        : 'bg-rose-100 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 font-black">
                        {isEvaluationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Bạn đã chọn chính xác toàn bộ các biện pháp xử lý an toàn!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-700" />
                            <span>Phương án chưa đầy đủ hoặc có lẫn hành động nguy hại!</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed pt-1 border-t-2 border-slate-900/10 dark:border-slate-800 font-medium">
                        {activeScenario.multiSelectData.explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* MODE 3: QUICK REFLEX JUDGMENT (Phản xạ tức thì) */}
              {qType === 'quick_reflex_judgment' && activeScenario.quickReflexData && (
                <div className="space-y-4 p-5 rounded-2xl bg-teal-50 dark:bg-slate-950/80 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
                  
                  <div className="text-xs text-teal-900 dark:text-cyan-300 font-black flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-teal-700 dark:text-cyan-400" />
                    <span>Kiểm tra đối tượng sau và quyết định trong chớp mắt:</span>
                  </div>

                  {/* Suspicious Target Inspection Terminal */}
                  <div className="rounded-xl bg-slate-900 dark:bg-slate-950 border-2 border-slate-900 p-4 space-y-2 font-mono shadow-[2px_2px_0_0_#0f172a]">
                    <div className="flex items-center justify-between text-[11px] text-cyan-300 pb-2 border-b border-slate-800 font-bold">
                      <span>TERMINAL SCANNER // FORENSIC VIEW</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> INSPECTING
                      </span>
                    </div>

                    <div className="p-3 bg-black/60 rounded-lg border border-slate-800 text-xs md:text-sm text-cyan-200 break-all leading-relaxed whitespace-pre-wrap font-semibold">
                      {activeScenario.quickReflexData.targetSnippet}
                    </div>
                  </div>

                  {/* 2 Big Tactile Reflex Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    <button
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectQuickReflex('MALICIOUS')}
                      className={`p-4 rounded-2xl border-2 border-slate-900 text-left transition-all flex items-center gap-3 cursor-pointer ${
                        selectedVerdict === 'MALICIOUS'
                          ? 'bg-rose-200 dark:bg-rose-950 shadow-[4px_4px_0_0_#0f172a] -translate-y-0.5'
                          : 'bg-white dark:bg-slate-950 hover:bg-rose-50 shadow-[2px_2px_0_0_#0f172a]'
                      }`}
                    >
                      <ShieldX className="w-6 h-6 text-rose-600 shrink-0" />
                      <div>
                        <span className="block font-black text-xs md:text-sm text-rose-900 dark:text-rose-300">
                          {activeScenario.quickReflexData.maliciousLabel || '🔴 ĐỘC HẠI / LỪA ĐẢO'}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                          Chứa mã độc, link giả hoặc bẫy gian lận
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectQuickReflex('SAFE')}
                      className={`p-4 rounded-2xl border-2 border-slate-900 text-left transition-all flex items-center gap-3 cursor-pointer ${
                        selectedVerdict === 'SAFE'
                          ? 'bg-emerald-200 dark:bg-emerald-950 shadow-[4px_4px_0_0_#0f172a] -translate-y-0.5'
                          : 'bg-white dark:bg-slate-950 hover:bg-emerald-50 shadow-[2px_2px_0_0_#0f172a]'
                      }`}
                    >
                      <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <span className="block font-black text-xs md:text-sm text-emerald-900 dark:text-emerald-300">
                          {activeScenario.quickReflexData.safeLabel || '🟢 AN TOÀN / CHÍNH THỐNG'}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                          Nguồn tin cậy, định dạng hợp lệ
                        </span>
                      </div>
                    </button>

                  </div>

                  {isAnswerRevealed && (
                    <div className={`p-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-xs md:text-sm space-y-1.5 animate-in fade-in duration-200 ${
                      isEvaluationSuccess 
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200' 
                        : 'bg-rose-100 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200'
                    }`}>
                      <div className="flex items-center gap-2 font-black">
                        {isEvaluationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Phản xạ cực kỳ sắc bén! Bạn đã nhận diện chuẩn xác.</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-700" />
                            <span>Phán đoán chưa chuẩn xác! Bạn đã bị đối tượng đánh lừa.</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed pt-1 border-t-2 border-slate-900/10 dark:border-slate-800 font-medium">
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

                    let cardStyle = 'bg-white dark:bg-slate-900/80 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] hover:bg-slate-50 text-slate-800 dark:text-slate-200';
                    if (isAnswerRevealed) {
                      if (opt.isCorrect) {
                        cardStyle = 'bg-emerald-100 dark:bg-emerald-950/40 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-emerald-950 dark:text-emerald-200 font-black';
                      } else if (isSelected && !opt.isCorrect) {
                        cardStyle = 'bg-rose-100 dark:bg-rose-950/40 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-rose-950 dark:text-rose-200 font-black';
                      }
                    } else if (isSelected) {
                      cardStyle = 'bg-blue-100 dark:bg-indigo-950/60 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-blue-900 dark:text-white font-black -translate-y-0.5';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectSingleOption(opt.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${cardStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-slate-900 shrink-0 mt-0.5 shadow-[1px_1px_0_0_#0f172a] ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                          }`}>
                            {opt.id.replace('opt-', '').toUpperCase()}
                          </span>
                          <div className="space-y-1">
                            <p className="font-bold">{opt.text}</p>
                            {isAnswerRevealed && (
                              <p className={`text-xs mt-1 italic font-semibold ${
                                opt.isCorrect ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-300'
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
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs md:text-sm border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>Chốt phương án xử lý</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-3 border-t-2 border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                
                {/* Expert Cyber Tip Callout */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-indigo-950/40 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-xs md:text-sm text-blue-950 dark:text-indigo-200 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-blue-900 dark:text-amber-300 block mb-0.5">
                      Bí quyết từ chuyên gia an ninh mạng TrustNet:
                    </span>
                    <p className="leading-relaxed font-semibold">{activeScenario.expertTip}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left font-bold">
                    {isEvaluationSuccess
                      ? '🎉 Bạn đã xuất sắc giải quyết tình huống an toàn và nâng cao kinh nghiệm số!'
                      : '💡 Hãy ghi nhớ kinh nghiệm này để áp dụng bảo vệ bản thân ngoài đời thực!'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCurrentScenario}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-black border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Thử lại</span>
                    </button>

                    <button
                      onClick={handleGoNextScenario}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] hover:-translate-y-0.5 transition-all cursor-pointer"
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
