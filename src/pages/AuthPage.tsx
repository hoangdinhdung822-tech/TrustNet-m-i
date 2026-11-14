import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  User, 
  School, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowRight, 
  Users, 
  Award, 
  Bot, 
  Sun, 
  Moon,
  Flame,
  Check,
  ShieldAlert, 
  Upload, 
  RefreshCw,
  Laptop,
  X
} from 'lucide-react';
import { DatabaseService, DeviceSavedAccount } from '../services/dbMock';
import { User as UserType } from '../types';
import { processDeviceImage } from '../utils/imageUpload';

interface Props {
  onLoginSuccess: (user: UserType) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const AVATAR_PRESETS = [
  {
    label: 'Nam sinh CÃ´ng nghá»‡ (DÅ©ng)',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  },
  {
    label: 'Ná»¯ sinh NÄƒng Ä‘á»™ng (TrÃ¢m)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  },
  {
    label: 'Admin / Hiá»‡p sÄ© sá»‘',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
  },
  {
    label: 'Nam sinh TrÃ­ thá»©c',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  },
  {
    label: 'Ná»¯ sinh SÃ¡ng táº¡o',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  },
  {
    label: 'NhÃ  phÃ¢n tÃ­ch Fact-Check',
    url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=250&q=80',
  },
  {
    label: 'Äáº¡i sá»© ÄoÃ n TrÆ°á»ng',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  },
  {
    label: 'Chiáº¿n binh An ninh máº¡ng',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=250&q=80',
  },
];

export const AuthPage: React.FC<Props> = ({ onLoginSuccess, isDark, setIsDark }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const loginPasswordInputRef = useRef<HTMLInputElement>(null);

  // Danh sÃ¡ch cÃ¡c tÃ i khoáº£n Ä‘Ã£ Ä‘Äƒng nháº­p trÆ°á»›c Ä‘Ã¢y trÃªn thiáº¿t bá»‹ nÃ y (Local storage cá»§a thiáº¿t bá»‹)
  const [deviceAccounts, setDeviceAccounts] = useState<DeviceSavedAccount[]>(() => DatabaseService.getDeviceAccounts());

  // Chá»n nhanh tÃ i khoáº£n Ä‘Ã£ lÆ°u trÃªn thiáº¿t bá»‹
  const handleSelectDeviceAccount = (acc: DeviceSavedAccount) => {
    setLoginIdentifier(acc.username);
    setLoginPassword('');
    setLoginError(null);
    setTimeout(() => {
      loginPasswordInputRef.current?.focus();
    }, 50);
  };

  // XÃ³a tÃ i khoáº£n khá»i bá»™ nhá»› thiáº¿t bá»‹ nÃ y
  const handleRemoveDeviceAccount = (id: string) => {
    const updated = DatabaseService.removeDeviceAccount(id);
    setDeviceAccounts(updated);
    if (loginIdentifier === id) {
      setLoginIdentifier('');
      setLoginPassword('');
    }
  };

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSchool, setRegSchool] = useState('TrÆ°á»ng THPT Sá»‘ 1 Phan ÄÃ¬nh PhÃ¹ng');
  const [regClass, setRegClass] = useState('Lá»›p 11A1');
  const [regAvatar, setRegAvatar] = useState(AVATAR_PRESETS[0].url);
  const [regAgreed, setRegAgreed] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  // File upload ref vÃ  handler cho áº£nh tá»« thiáº¿t bá»‹
  const regAvatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingRegAvatar, setIsUploadingRegAvatar] = useState(false);

  const handleRegAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingRegAvatar(true);
    try {
      const dataUrl = await processDeviceImage(file);
      setRegAvatar(dataUrl);
      setRegError(null);
    } catch (err: any) {
      setRegError(err.message || 'Lá»—i khi táº£i áº£nh tá»« thiáº¿t bá»‹');
    } finally {
      setIsUploadingRegAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  // Submit Sign In - Báº®T BUá»˜C nháº­p Ä‘Ãºng tÃ i khoáº£n vÃ  Ä‘Ãºng máº­t kháº©u
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim()) {
      setLoginError('Vui lÃ²ng nháº­p tÃªn ngÆ°á»i dÃ¹ng (@username) hoáº·c email');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Vui lÃ²ng nháº­p máº­t kháº©u Ä‘á»ƒ báº£o vá»‡ thÃ´ng tin cÃ¡ nhÃ¢n!');
      return;
    }
    const res = DatabaseService.loginSecure(loginIdentifier.trim(), loginPassword);
    if (!res.success || !res.user) {
      setLoginError(res.error || 'TÃ i khoáº£n hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c! Vui lÃ²ng kiá»ƒm tra láº¡i.');
      return;
    }
    setDeviceAccounts(DatabaseService.getDeviceAccounts());
    onLoginSuccess(res.user);
  };

  // Submit Sign Up - Báº¯t buá»™c máº­t kháº©u & xÃ¡c nháº­n máº­t kháº©u
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim()) {
      setRegError('Vui lÃ²ng nháº­p há» vÃ  tÃªn cá»§a báº¡n');
      return;
    }
    if (!regPassword.trim()) {
      setRegError('Vui lÃ²ng thiáº¿t láº­p máº­t kháº©u Ä‘á»ƒ báº£o vá»‡ tÃ i khoáº£n cÃ¡ nhÃ¢n!');
      return;
    }
    if (regPassword.length < 3) {
      setRegError('Máº­t kháº©u pháº£i cÃ³ Ä‘á»™ dÃ i tá»« 3 kÃ½ tá»± trá»Ÿ lÃªn!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p! Vui lÃ²ng nháº­p láº¡i chÃ­nh xÃ¡c.');
      return;
    }
    if (!regAgreed) {
      setRegError('Vui lÃ²ng Ä‘á»“ng Ã½ vá»›i cam káº¿t cÃ´ng dÃ¢n sá»‘ vÄƒn minh');
      return;
    }

    const cleanUsername = regUsername.trim() || `user_${Date.now().toString().slice(-4)}`;
    if (cleanUsername.toLowerCase() === 'admin' || cleanUsername.toLowerCase() === 'trustnet_admin' || cleanUsername.toLowerCase().includes('admin')) {
      setRegError('TÃªn ngÆ°á»i dÃ¹ng "admin" Ä‘Æ°á»£c báº£o lÆ°u riÃªng cho Quáº£n trá»‹ viÃªn há»‡ thá»‘ng!');
      return;
    }
    const user = DatabaseService.registerUser({
      name: regName.trim(),
      username: cleanUsername,
      password: regPassword.trim(),
      school: regSchool.trim() || 'TrÆ°á»ng THPT Sá»‘ 1 Phan ÄÃ¬nh PhÃ¹ng',
      className: regClass.trim() || 'Há»c sinh',
      avatar: regAvatar,
      bio: 'ThÃ nh viÃªn má»›i tÃ­ch cá»±c tham gia máº¡ng xÃ£ há»™i kiá»ƒm chá»©ng TrustNet.'
    });

    onLoginSuccess(user);
  };


  return (
    <div className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'text-slate-900'
    }`} style={!isDark ? {
      backgroundColor: '#ccfbf1',
      backgroundImage: 'linear-gradient(rgba(37,99,235,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.07) 1px, transparent 1px)',
      backgroundSize: '32px 32px'
    } : {}}>

      {/* Dark mode: Dynamic Cyber Light Orbs */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-full blur-[150px]" />
          <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] bg-purple-600/15 rounded-full blur-[150px]" />
        </div>
      )}

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] ${
            isDark ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400' : 'bg-blue-600'
          }`}>
            <ShieldCheck className="w-6 h-6 text-white" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border border-slate-900" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl md:text-2xl font-black tracking-tight ${
                isDark ? 'bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent' : 'text-slate-900'
              }`}>
                TrustNet
              </span>
              <span className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] ${
                isDark ? 'bg-indigo-500/20 text-cyan-300' : 'bg-blue-600 text-white'
              }`}>
                THPT toàn quốc
              </span>
            </div>
            <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Mạng xã hội học đường &amp; Kiểm chứng tin tức bằng AI
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] hover:-translate-y-0.5 transition-all ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600'
          }`}
          title="Đổi giao diện Sáng / Tối"
        >
          {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
      </header>

      {/* Main Hero & Auth Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">

        {/* Left Side: Brand Story + Robot Mascot */}
        <div className="flex-1 space-y-6 text-center lg:text-left max-w-xl">

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] ${
            isDark ? 'bg-indigo-600 text-white' : 'bg-yellow-300 text-slate-900'
          }`}>
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Nền tảng an toàn số chính thức của Đoàn Trường</span>
          </div>

          {/* Heading + Robot side by side */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 space-y-3">
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Đừng chỉ tin.{' '}
                <span className={isDark
                  ? 'bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent'
                }>
                  Hãy kiểm chứng!
                </span>
              </h1>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Chào mừng bạn đến với <strong className={isDark ? 'text-white' : 'text-slate-900'}>TrustNet</strong> — Môi trường mạng xã hội thông minh dành cho{' '}
                <span className="font-black text-blue-600">học sinh THPT toàn quốc</span>. Trang bị tư duy phản biện &amp; AI kiểm chứng sự thật.
              </p>
            </div>

            {/* 🤖 Robot Security Mascot SVG */}
            <div className="shrink-0 animate-float-slow select-none">
              <svg width="120" height="145" viewBox="0 0 120 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="TrustNet Robot mascot">
                {/* Antenna */}
                <line x1="60" y1="8" x2="60" y2="22" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="60" cy="6" r="5" fill="#FCD34D" stroke="#0f172a" strokeWidth="2"/>
                {/* Head */}
                <rect x="22" y="22" width="76" height="58" rx="16" fill="#2563EB" stroke="#0f172a" strokeWidth="2.5"/>
                <rect x="26" y="26" width="68" height="50" rx="13" fill="#3b82f6" opacity="0.3"/>
                {/* Eyes */}
                <rect x="31" y="36" width="22" height="16" rx="6" fill="#0f172a" stroke="#FCD34D" strokeWidth="1.5"/>
                <rect x="34" y="39" width="16" height="10" rx="4" fill="#34d399"/>
                <circle cx="39" cy="44" r="3" fill="#ffffff" opacity="0.9"/>
                <rect x="67" y="36" width="22" height="16" rx="6" fill="#0f172a" stroke="#FCD34D" strokeWidth="1.5"/>
                <rect x="70" y="39" width="16" height="10" rx="4" fill="#34d399"/>
                <circle cx="75" cy="44" r="3" fill="#ffffff" opacity="0.9"/>
                {/* Smile */}
                <path d="M 42 63 Q 60 73 78 63" stroke="#FCD34D" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                {/* Blush */}
                <ellipse cx="34" cy="65" rx="6" ry="4" fill="#f97316" opacity="0.4"/>
                <ellipse cx="86" cy="65" rx="6" ry="4" fill="#f97316" opacity="0.4"/>
                {/* Neck */}
                <rect x="50" y="80" width="20" height="10" rx="4" fill="#1d4ed8" stroke="#0f172a" strokeWidth="2"/>
                {/* Body */}
                <rect x="18" y="90" width="84" height="44" rx="14" fill="#1d4ed8" stroke="#0f172a" strokeWidth="2.5"/>
                <rect x="22" y="94" width="76" height="36" rx="11" fill="#2563EB" opacity="0.4"/>
                {/* Shield */}
                <path d="M 60 97 L 72 102 L 72 114 Q 72 120 60 124 Q 48 120 48 114 L 48 102 Z" fill="#FCD34D" stroke="#0f172a" strokeWidth="2"/>
                {/* Lock */}
                <rect x="55" y="108" width="10" height="8" rx="2" fill="#0f172a"/>
                <path d="M 57 108 Q 57 103 60 103 Q 63 103 63 108" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round"/>
                {/* Arms */}
                <rect x="2" y="92" width="18" height="32" rx="9" fill="#2563EB" stroke="#0f172a" strokeWidth="2"/>
                <circle cx="11" cy="128" r="8" fill="#3b82f6" stroke="#0f172a" strokeWidth="2"/>
                <rect x="100" y="92" width="18" height="32" rx="9" fill="#2563EB" stroke="#0f172a" strokeWidth="2"/>
                <circle cx="109" cy="128" r="8" fill="#3b82f6" stroke="#0f172a" strokeWidth="2"/>
                {/* Sparkles */}
                <text x="4" y="50" fontSize="13" fill="#FCD34D">✦</text>
                <text x="104" y="38" fontSize="10" fill="#f97316">★</text>
                <text x="108" y="68" fontSize="8" fill="#34d399">⚡</text>
                <text x="2" y="80" fontSize="9" fill="#818cf8">⚙</text>
              </svg>
            </div>
          </div>

          {/* Key Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { Icon: Bot, color: 'text-blue-600', title: 'AI Kiểm Chứng', desc: 'Đối chiếu Google & dữ liệu báo chí trong 3 giây.' },
              { Icon: School, color: 'text-indigo-500', title: 'Bản Tin Trường', desc: 'Thông báo chính thức từ Đoàn trường & Ban giám hiệu.' },
              { Icon: Award, color: 'text-yellow-500', title: 'Tích Điểm & Danh Hiệu', desc: 'Vượt qua tình huống để nhận huy hiệu Hiệp sĩ số.' },
            ].map(({ Icon, color, title, desc }) => (
              <div key={title} className={`p-3.5 rounded-2xl text-left border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] ${
                isDark ? 'bg-slate-900/80' : 'bg-white'
              }`}>
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Quote */}
          <div className={`p-4 rounded-2xl text-xs italic flex items-center gap-3 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] ${
            isDark ? 'bg-slate-900/70 text-slate-300' : 'bg-yellow-100 text-slate-700'
          }`}>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0" />
            <span className="font-semibold">"Một cú nhấp chuột có trách nhiệm là một lá chắn bảo vệ bạn và bạn bè trên không gian mạng."</span>
          </div>

        </div>

        {/* Right Side: Auth Card */}
        <div className="w-full max-w-md shrink-0">
          <div className={`rounded-3xl p-6 sm:p-8 relative border-2 border-slate-900 shadow-[6px_6px_0_0_#0f172a] ${
            isDark ? 'bg-slate-900 backdrop-blur-xl' : 'bg-white'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Tab Switcher */}
            <div className={`flex rounded-2xl p-1 border-2 border-slate-900 mb-6 ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'login'
                    ? 'bg-blue-600 text-white shadow-[2px_2px_0_0_#0f172a] border border-slate-900'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'register'
                    ? 'bg-blue-600 text-white shadow-[2px_2px_0_0_#0f172a] border border-slate-900'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tạo tài khoản mới
              </button>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: ĐĂNG NHẬP                                         */}
            {/* ======================================================== */}
            {activeTab === 'login' && (
              <div className="space-y-5">

                {/* Danh sách tài khoản đã đăng nhập trước đây trên thiết bị này */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Laptop className="w-3.5 h-3.5 text-blue-500" />
                      <span>Các tài khoản đã đăng nhập trước đây:</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 bg-blue-600 text-white">
                      Thiết bị này
                    </span>
                  </div>

                  {deviceAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {deviceAccounts.map((acc) => {
                        const isSelected = loginIdentifier.toLowerCase() === acc.username.toLowerCase();
                        return (
                          <div
                            key={acc.id}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all border-2 ${
                              isSelected
                                ? isDark
                                  ? 'bg-indigo-950/70 border-cyan-400 shadow-[2px_2px_0_0_#06b6d4]'
                                  : 'bg-blue-50 border-blue-500 shadow-[2px_2px_0_0_#2563eb]'
                                : isDark
                                  ? 'bg-slate-950/60 hover:bg-indigo-950/40 border-slate-800 hover:border-indigo-500/60'
                                  : 'bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-400'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSelectDeviceAccount(acc)}
                              className="flex items-center gap-3 min-w-0 flex-1 text-left group"
                            >
                              <div className="relative shrink-0">
                                <img
                                  src={acc.avatar}
                                  alt={acc.name}
                                  className={`w-9 h-9 rounded-xl object-cover ring-2 transition-all ${
                                    isSelected ? 'ring-blue-500' : isDark ? 'ring-slate-700 group-hover:ring-cyan-400' : 'ring-slate-300 group-hover:ring-blue-400'
                                  }`}
                                />
                                {acc.role === 'admin' && (
                                  <span className="absolute -bottom-1 -right-1 px-1 rounded bg-rose-500 text-[8px] font-black text-white uppercase border border-slate-900">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-xs font-black truncate ${
                                    isSelected ? isDark ? 'text-cyan-300' : 'text-blue-700'
                                      : isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-blue-700'
                                  }`}>
                                    {acc.name}
                                  </span>
                                </div>
                                <div className={`flex items-center gap-2 text-[10px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  <span className={`font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>@{acc.username}</span>
                                  {acc.lastLogin && (
                                    <>
                                      <span>•</span>
                                      <span>Đăng nhập: {acc.lastLogin}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <span className={`text-xs font-black flex items-center gap-1 shrink-0 px-2 ${
                                isSelected ? 'text-blue-600' : isDark ? 'text-indigo-400 group-hover:text-cyan-300' : 'text-blue-500 group-hover:text-blue-700'
                              }`}>
                                {isSelected ? 'Đang chọn' : 'Chọn'} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </button>

                            {/* Xóa tài khoản khỏi thiết bị */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDeviceAccount(acc.id);
                              }}
                              className={`p-1.5 rounded-xl transition-colors ml-1 shrink-0 ${isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                              title="Xóa tài khoản khỏi thiết bị này"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`p-3.5 rounded-2xl border-2 border-dashed text-center ${isDark ? 'bg-slate-950/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                      <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-1.5 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Chưa có tài khoản nào từng đăng nhập trên thiết bị này</p>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Khi bạn đăng nhập, thông tin sẽ được ghi nhớ riêng trên thiết bị này.
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center justify-center my-3">
                  <div className={`border-t-2 w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                  <span className={`absolute px-3 text-[11px] uppercase font-black ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}`}>
                    Xác thực tài khoản &amp; Mật khẩu
                  </span>
                </div>

                {/* Form Input */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  {loginError && (
                    <div className={`p-3 rounded-2xl border-2 border-rose-400 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200 ${isDark ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-50 text-rose-700'}`}>
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Tên người dùng (@username) hoặc Email *
                    </label>
                    <div className="relative">
                      <User className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="VD: @username hoặc email của bạn"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                          isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Mật khẩu tài khoản *
                      </label>
                      <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Phải nhập đúng mật khẩu
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        ref={loginPasswordInputRef}
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Nhập mật khẩu tài khoản của bạn"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                          isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className={`absolute right-3.5 top-3 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'}`}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_0_#0f172a] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Đăng nhập vào TrustNet</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: TẠO TÀI KHOẢN MỚI                                 */}
            {/* ======================================================== */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {regError && (
                  <div className={`p-2.5 rounded-2xl border-2 border-rose-400 text-xs font-bold ${isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700'}`}>
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Họ và tên học sinh *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="VD: Nguyễn Văn An"
                      className={`w-full px-3 py-2 rounded-2xl text-xs focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Tên người dùng (@)
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="VD: nguyenvanan"
                      className={`w-full px-3 py-2 rounded-2xl text-xs font-mono focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Trường học
                    </label>
                    <input
                      type="text"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="Trường THPT Số 1 Phan Đình Phùng"
                      className={`w-full px-3 py-2 rounded-2xl text-xs focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Lớp / Khối
                    </label>
                    <input
                      type="text"
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      placeholder="Lớp 11A1"
                      className={`w-full px-3 py-2 rounded-2xl text-xs focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Mật khẩu bảo mật *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 3 ký tự"
                        className={`w-full px-3 py-2 rounded-2xl text-xs focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                          isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className={`absolute right-3 top-2.5 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'}`}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Xác nhận mật khẩu *
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full px-3 py-2 rounded-2xl text-xs focus:outline-none transition-all border-2 border-slate-900 focus:border-blue-500 ${
                        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Avatar Selection with Device Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Ảnh đại diện tài khoản
                    </label>
                    <span className="text-[10px] text-blue-500 font-black">Hỗ trợ tải từ thiết bị</span>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 border-slate-900 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                    <div className="relative shrink-0">
                      <img
                        src={regAvatar}
                        alt="Preview"
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500 ring-offset-1 shadow-md"
                      />
                      {regAvatar.startsWith('data:image') && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white border border-slate-900">
                          Từ máy
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <input
                        type="file"
                        ref={regAvatarFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleRegAvatarUpload}
                      />
                      <button
                        type="button"
                        onClick={() => regAvatarFileInputRef.current?.click()}
                        disabled={isUploadingRegAvatar}
                        className="w-full py-2 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isUploadingRegAvatar ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang xử lý ảnh...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải ảnh từ thiết bị cá nhân</span>
                          </>
                        )}
                      </button>
                      <span className={`text-[10px] block text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Điện thoại, máy tính hoặc thư viện ảnh
                      </span>
                    </div>
                  </div>

                  {/* Ready-to-use Presets */}
                  <div className="space-y-1">
                    <span className={`text-[11px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Hoặc chọn nhanh từ các mẫu avatar an toàn số:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setRegAvatar(preset.url)}
                          className={`rounded-xl overflow-hidden aspect-square border-2 transition-all relative cursor-pointer ${
                            regAvatar === preset.url
                              ? 'border-blue-500 scale-105 shadow-[2px_2px_0_0_#0f172a]'
                              : isDark ? 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600' : 'border-slate-300 opacity-70 hover:opacity-100 hover:border-slate-900'
                          }`}
                          title={preset.label}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                          {regAvatar === preset.url && (
                            <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Safety Commitment Checkbox */}
                <label className={`flex items-start gap-2.5 text-xs cursor-pointer pt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={regAgreed}
                    onChange={(e) => setRegAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] leading-relaxed">
                    Tôi cam kết thực hiện văn hóa ứng xử số văn minh, không chia sẻ tin thất thiệt, và luôn kiểm chứng trước khi like/share.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Tạo tài khoản &amp; Bắt đầu (+150 XP)</span>
                </button>
              </form>
            )}

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t-2 ${
        isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
      }`}>
        <span className="font-bold">© 2026 TrustNet • Học sinh THPT toàn quốc</span>
        <span>Phát triển vì một môi trường Internet học đường an toàn, tin cậy</span>
      </footer>

    </div>
  );
};
