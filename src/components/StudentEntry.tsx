import React, { useState } from 'react';
import { Sparkles, User, Hash, School, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StudentInfo } from '../types/quiz';

interface StudentEntryProps {
  initialInfo: StudentInfo;
  onStart: (info: StudentInfo) => void;
}

export const StudentEntry: React.FC<StudentEntryProps> = ({ initialInfo, onStart }) => {
  const [classRoom, setClassRoom] = useState(initialInfo.classRoom || '');
  const [studentNumber, setStudentNumber] = useState(initialInfo.studentNumber ? String(initialInfo.studentNumber) : '');
  const [studentName, setStudentName] = useState(initialInfo.studentName || '');
  const [errorMsg, setErrorMsg] = useState('');

  const quickClassOptions = ['3학년 1반', '3학년 2반', '4학년 1반', '4학년 2반', '5학년 1반', '6학년 1반'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classRoom.trim()) {
      setErrorMsg('반(학급)을 입력해 주세요.');
      return;
    }
    if (!studentNumber.trim()) {
      setErrorMsg('출석 번호를 입력해 주세요.');
      return;
    }
    const num = parseInt(studentNumber.trim(), 10);
    if (isNaN(num) || num < 1 || num > 100) {
      setErrorMsg('올바른 번호(1~100)를 입력해 주세요.');
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('이름을 입력해 주세요.');
      return;
    }

    setErrorMsg('');
    onStart({
      classRoom: classRoom.trim(),
      studentNumber: num,
      studentName: studentName.trim(),
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
      {/* 웰컴 인트로 카드 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100/80 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-amber-100 rounded-full opacity-50 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-36 h-36 bg-sky-100 rounded-full opacity-50 blur-2xl pointer-events-none" />

        <div className="relative text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 text-3xl mb-3 shadow-inner">
            🌟
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            반짝반짝 일상 영단어 퀴즈
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            우리 주변에서 매일 만나는 재미있는 필수 영단어 20문항!
            <br />
            로그인 없이 <span className="font-semibold text-amber-600">반, 번호, 이름</span>만 적고 바로 도전해 볼까요?
          </p>
        </div>

        {/* 심리적 안정감을 주는 특징 안내 카드 */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 py-3 mb-6 bg-amber-50/60 rounded-2xl p-3 border border-amber-100 text-center">
          <div className="p-2">
            <span className="text-xl block mb-1">🎯</span>
            <div className="font-bold text-xs sm:text-sm text-slate-800">객관식 20문제</div>
            <div className="text-[11px] text-slate-500">누르기 쉬운 4지선다</div>
          </div>
          <div className="p-2 border-x border-amber-200/60">
            <span className="text-xl block mb-1">🔊</span>
            <div className="font-bold text-xs sm:text-sm text-slate-800">원어민 발음</div>
            <div className="text-[11px] text-slate-500">듣기 기능 지원</div>
          </div>
          <div className="p-2">
            <span className="text-xl block mb-1">📖</span>
            <div className="font-bold text-xs sm:text-sm text-slate-800">맞춤 오답노트</div>
            <div className="text-[11px] text-slate-500">틀린 문제만 쏙 복습</div>
          </div>
        </div>

        {/* 학생 정보 입력 양식 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
              <span className="font-bold">앗!</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <School className="w-4 h-4 text-amber-600" />
              <span>반 (학급)</span>
            </label>
            <input
              type="text"
              value={classRoom}
              onChange={(e) => setClassRoom(e.target.value)}
              placeholder="예: 3학년 2반 또는 4-1"
              maxLength={20}
              className="w-full px-4 py-3 text-base rounded-2xl border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all bg-slate-50/50 min-h-[48px]"
            />
            {/* 빠른 추천 버튼 */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickClassOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setClassRoom(opt)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-sky-600" />
                <span>번호</span>
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="예: 7"
                className="w-full px-4 py-3 text-base rounded-2xl border border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all bg-slate-50/50 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>이름</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="예: 김민우"
                maxLength={20}
                className="w-full px-4 py-3 text-base rounded-2xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-slate-50/50 min-h-[48px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-4 px-6 bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-lg rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2 min-h-[52px]"
          >
            <Sparkles className="w-5 h-5" />
            <span>영단어 퀴즈 시작하기!</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
            구글 계정 없이 안전하게 바로 참여할 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
};
