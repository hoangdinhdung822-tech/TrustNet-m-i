import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Calendar,
  Lock,
  Unlock,
  Search,
  Flame,
  ShieldCheck,
  Eye,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DatabaseService } from '../services/dbMock';
import { Lesson, User } from '../types';

interface Props {
  user: User;
  onUserUpdate: (u: User) => void;
}

export const AcademyPage: React.FC<Props> = ({ user, onUserUpdate }) => {
  const [previewAllMode, setPreviewAllMode] = useState<boolean>(false);
  const [lessons, setLessons] = useState<Lesson[]>(() => DatabaseService.getLessons(previewAllMode));
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(() => {
    const list = DatabaseService.getLessons(previewAllMode);
    // Ưu tiên chọn bài của tuần hiện tại hoặc bài chưa hoàn thành đầu tiên
    const currentWeekLesson = list.find(l => l.isNewThisWeek) || list.find(l => !l.isCompleted && l.isUnlocked) || list[0];
    return currentWeekLesson;
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unlocked' | 'current' | 'completed' | 'upcoming'>('all');

  const weeklyInfo = useMemo(() => DatabaseService.getAcademyWeeklyInfo(), []);
  const currentWeekNum = useMemo(() => DatabaseService.getCurrentAcademyWeek(), []);

  // Chuyển đổi chế độ mở khóa sớm
  const handleTogglePreviewAll = (enable: boolean) => {
    setPreviewAllMode(enable);
    const updated = DatabaseService.getLessons(enable);
    setLessons(updated);
    if (activeLesson) {
      const refreshed = updated.find(l => l.id === activeLesson.id) || updated[0];
      setActiveLesson(refreshed);
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  const handleOptionClick = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || !activeLesson) return;
    setQuizSubmitted(true);

    const isCorrect = selectedOption === activeLesson.quiz.answerIndex;
    if (isCorrect && !activeLesson.isCompleted) {
      // Bắn pháo hoa ăn mừng
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });

      const updated = DatabaseService.completeLesson(activeLesson.id);
      setLessons(updated);
      setActiveLesson({ ...activeLesson, isCompleted: true });
      onUserUpdate(DatabaseService.getCurrentUser());
    }
  };

  // Lọc danh sách bài học theo tab và từ khóa
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      // Lọc theo search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchTopic = l.topic.toLowerCase().includes(q);
        const matchDesc = l.description.toLowerCase().includes(q);
        if (!matchTitle && !matchTopic && !matchDesc) return false;
      }

      // Lọc theo tab
      if (filterTab === 'unlocked') return l.isUnlocked;
      if (filterTab === 'current') return l.isNewThisWeek;
      if (filterTab === 'completed') return l.isCompleted;
      if (filterTab === 'upcoming') return !l.isUnlocked;

      return true;
    });
  }, [lessons, searchQuery, filterTab]);

  const completedCount = lessons.filter(l => l.isCompleted).length;
  const unlockedCount = lessons.filter(l => l.isUnlocked).length;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header Banner */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden border border-purple-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>Digital Safety Academy • Chu Kỳ Hàng Tuần</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Học An Toàn Số & Kỹ Năng Phản Biện
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
              Chương trình đào tạo an toàn không gian mạng thiết thực cho học sinh THPT và Gen Z.
              Hệ thống tự động phát hành <strong>mỗi tuần 1 bài học mới</strong> theo lịch trình niên khóa, kèm thử thách trắc nghiệm phản xạ nhận điểm thưởng XP.
            </p>

            {/* Weekly Cadence Status Tag */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Tuần học hiện tại: <strong className="text-white">Tuần {currentWeekNum}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Bài tiếp theo mở vào: <strong className="text-white">{weeklyInfo.unlockDate}</strong>
                {weeklyInfo.daysRemaining > 0 && (
                  <span className="text-[11px] text-purple-400"> (còn {weeklyInfo.daysRemaining} ngày)</span>
                )}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-semibold">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                Tự động mở khóa thứ Hai hàng tuần
              </span>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="shrink-0 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Tiến độ chương trình:</span>
              <strong className="text-emerald-400 font-bold text-sm">
                {completedCount}/{lessons.length} bài
              </strong>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${(completedCount / lessons.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Đã phát hành: <strong className="text-indigo-300">{unlockedCount} bài</strong></span>
              <span>Tổng quỹ điểm: <strong className="text-amber-400">{lessons.reduce((acc, l) => acc + l.points, 0)} XP</strong></span>
            </div>

            {/* Preview all toggle button */}
            <button
              type="button"
              onClick={() => handleTogglePreviewAll(!previewAllMode)}
              className={`mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                previewAllMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              {previewAllMode ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đang xem toàn bộ (Đã mở sớm)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mở khóa sớm tất cả để học trước</span>
                </>
              )}
            </button>
          </div>
        </div>

      </section>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-indigo-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({lessons.length})
          </button>
          <button
            onClick={() => setFilterTab('unlocked')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === 'unlocked'
                ? 'bg-indigo-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã mở ({unlockedCount})
          </button>
          <button
            onClick={() => setFilterTab('current')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              filterTab === 'current'
                ? 'bg-purple-600 text-white shadow-glow-sm'
                : 'text-purple-300 hover:text-purple-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-300" />
            Tuần này
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đã xong ({completedCount})
          </button>
          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterTab === 'upcoming'
                ? 'bg-slate-700 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sắp ra mắt ({lessons.length - unlockedCount})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo chủ đề, tiêu đề..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Main Grid: Left Lessons List - Right Lesson Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Lesson Selector List (5 columns) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lộ trình bài học ({filteredLessons.length} bài)
            </h2>
            <span className="text-[11px] text-indigo-400 font-semibold">
              Chu kỳ 1 bài/tuần
            </span>
          </div>

          <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredLessons.map((lesson) => {
              const isSelected = activeLesson?.id === lesson.id;
              const isLocked = !lesson.isUnlocked;

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500/80 shadow-glow-sm'
                      : isLocked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-75 hover:opacity-100 hover:border-slate-700'
                      : 'glass-panel hover:bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  {/* Highlight bar for current week lesson */}
                  {lesson.isNewThisWeek && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-400" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lesson.icon}</span>
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        Tuần {lesson.weekNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {lesson.isNewThisWeek && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/40 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5 text-purple-300" /> Mới tuần này
                        </span>
                      )}

                      {lesson.isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Đã xong
                        </span>
                      ) : isLocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                          <Lock className="w-2.5 h-2.5" /> Khóa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          +{lesson.points} XP
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className={`text-sm font-bold mt-2 leading-snug ${
                    isSelected ? 'text-white' : isLocked ? 'text-slate-300' : 'text-slate-100'
                  }`}>
                    {lesson.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {lesson.topic}
                  </p>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {lesson.readTime}
                    </span>
                    <span className="text-indigo-300 font-medium">{lesson.difficulty}</span>
                    {isLocked ? (
                      <span className="text-[10px] text-amber-400 font-mono">
                        Mở: {lesson.releaseDate}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400">Sẵn sàng học</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredLessons.length === 0 && (
              <div className="p-8 text-center glass-panel rounded-2xl text-slate-400 text-xs">
                Không tìm thấy bài học nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Lesson Reader & Quiz (8 columns) */}
        {activeLesson && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* If lesson is locked, show schedule alert with option to unlock */}
            {!activeLesson.isUnlocked && (
              <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Bài học theo lịch trình Tuần {activeLesson.weekNumber} (Dự kiến mở: {activeLesson.releaseDate})</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  Hệ thống thiết kế theo chu kỳ 1 bài/tuần để học sinh có thời gian tiếp thu và thực hành từng kỹ năng phản biện. 
                  Bạn có thể kiên nhẫn chờ đến ngày mở khóa chính thức, hoặc bấm mở khóa sớm dưới đây để tự học ngay!
                </p>
                <button
                  type="button"
                  onClick={() => handleTogglePreviewAll(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-glow-sm transition-all"
                >
                  🚀 Mở khóa sớm bài học này ngay
                </button>
              </div>
            )}

            {/* Lesson Content Card */}
            <article className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 text-slate-100 border border-slate-800/80">
              
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                      Tuần {activeLesson.weekNumber}
                    </span>
                    <span>•</span>
                    <span>{activeLesson.topic}</span>
                    <span>•</span>
                    <span className="text-slate-400">{activeLesson.readTime}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                    {activeLesson.icon} {activeLesson.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                    {activeLesson.description}
                  </p>
                </div>

                <div className="shrink-0 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[70px]">
                  <span className="text-sm font-black text-amber-400 font-mono block">
                    +{activeLesson.points}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">XP THƯỞNG</span>
                </div>
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-6 text-xs md:text-sm text-slate-200 leading-relaxed">
                {activeLesson.content.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
                    <h3 className="font-extrabold text-white text-sm md:text-base text-cyan-300 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-cyan-400 rounded-full" />
                      {sec.heading}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{sec.body}</p>

                    {sec.tip && (
                      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs leading-relaxed">
                        <span className="font-bold text-indigo-300">💡 Lời khuyên vàng: </span>
                        {sec.tip}
                      </div>
                    )}

                    {sec.example && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs leading-relaxed">
                        <span className="font-bold text-emerald-400">📌 Tình huống thực tế: </span>
                        {sec.example}
                      </div>
                    )}

                    {sec.warning && (
                      <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs leading-relaxed">
                        <span className="font-bold text-rose-400">⚠️ Cảnh báo khẩn cấp: </span>
                        {sec.warning}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </article>

            {/* Interactive Quiz Card */}
            <section className="glass-panel rounded-3xl p-6 md:p-8 space-y-5 border border-indigo-500/30 text-slate-100">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Thử Thách Trắc Nghiệm Phản Xạ Nhanh
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  +{activeLesson.points} XP
                </span>
              </div>

              {/* Question */}
              <p className="text-xs md:text-sm font-semibold text-slate-200 leading-relaxed">
                {activeLesson.quiz.question}
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {activeLesson.quiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isAnswer = activeLesson.quiz.answerIndex === idx;

                  let optionStyle = 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 text-slate-300';
                  if (quizSubmitted) {
                    if (isAnswer) {
                      optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected && !isAnswer) {
                      optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-indigo-950/60 border-indigo-500 text-white font-semibold shadow-glow-sm';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOptionClick(idx)}
                      disabled={quizSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {quizSubmitted && isSelected && !isAnswer && (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Quiz / Result Explanation */}
              <div className="pt-2">
                {!quizSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={selectedOption === null}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs shadow-glow-sm transition-all"
                  >
                    Xác nhận câu trả lời & Nhận XP
                  </button>
                ) : (
                  <div className={`p-4 rounded-2xl border text-xs md:text-sm leading-relaxed space-y-2 ${
                    selectedOption === activeLesson.quiz.answerIndex
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        {selectedOption === activeLesson.quiz.answerIndex ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Xuất sắc! Bạn đã trả lời hoàn toàn chính xác (+{activeLesson.points} XP)
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            Chưa chính xác! Hãy đọc kỹ giải thích dưới đây
                          </>
                        )}
                      </span>

                      {selectedOption !== activeLesson.quiz.answerIndex && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuizSubmitted(false);
                            setSelectedOption(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 text-xs font-semibold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Thử lại
                        </button>
                      )}
                    </div>
                    <p className="text-slate-300 text-xs">
                      {activeLesson.quiz.explanation}
                    </p>
                  </div>
                )}
              </div>

            </section>

          </div>
        )}

      </div>

    </div>
  );
};
