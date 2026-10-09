import React from 'react';
import { BookOpen, ShieldCheck, Home } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { AppView } from '../hooks/useQuizStore';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  cloudStatus: 'connected' | 'offline' | 'checking';
  onOpenTeacher: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  cloudStatus,
  onOpenTeacher,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-amber-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* 앱 브랜드 타이틀 */}
        <button
          onClick={() => onNavigate('entry')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-98"
          title="처음 화면으로 가기"
        >
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white shadow-xs group-hover:rotate-6 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-lg sm:text-xl tracking-tight">
                반짝반짝 일상 영단어
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-md">
                초등 20문항
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              주변의 친근한 일상 영단어 퀴즈와 스마트 오답노트
            </p>
          </div>
        </button>

        {/* 우측 도구: 연결 상태 & 교사 대시보드 버튼 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <StatusBadge status={cloudStatus} />
          </div>

          {currentView !== 'entry' && currentView !== 'teacher' && (
            <button
              onClick={() => onNavigate('entry')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">홈으로</span>
            </button>
          )}

          <button
            onClick={onOpenTeacher}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs min-h-[44px] ${
              currentView === 'teacher'
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110" />
            <span>교사 대시보드</span>
          </button>
        </div>
      </div>
    </header>
  );
};
