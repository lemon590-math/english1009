import React, { useState } from 'react';
import { Volume2, ChevronLeft, ChevronRight, Send, AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';
import { VOCABULARY_QUESTIONS } from '../data/vocabularyQuestions';
import { StudentInfo } from '../types/quiz';
import { useSpeech } from '../hooks/useSpeech';

interface QuizRunnerProps {
  studentInfo: StudentInfo;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  selectedAnswers: Record<number, number>;
  onSelectAnswer: (questionId: number, optionIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  studentInfo,
  currentIndex,
  onIndexChange,
  selectedAnswers,
  onSelectAnswer,
  onSubmit,
  isSubmitting,
}) => {
  const currentQ = VOCABULARY_QUESTIONS[currentIndex];
  const { speak, isSpeaking } = useSpeech();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const totalQuestions = VOCABULARY_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const selectedOption = selectedAnswers[currentQ.id];

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      setShowHint(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      onIndexChange(currentIndex + 1);
      setShowHint(false);
    }
  };

  const unansweredQuestions = VOCABULARY_QUESTIONS.filter((q) => selectedAnswers[q.id] === undefined).map(
    (q) => q.id
  );

  const handleCheckSubmit = () => {
    if (unansweredQuestions.length > 0) {
      setShowConfirmModal(true);
    } else {
      onSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
      {/* 상단 학생 배지 및 진행도 바 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-amber-100 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
              {studentInfo.classRoom}
            </span>
            <span className="text-slate-500">{studentInfo.studentNumber}번</span>
            <span className="text-slate-800 font-bold">{studentInfo.studentName} 학생</span>
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <span>푼 문제:</span>
            <span className="text-amber-600 font-extrabold text-sm">{answeredCount}</span>
            <span>/ {totalQuestions}</span>
            <span className="text-slate-400">({progressPercent}%)</span>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-linear-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 메인 문제 카드 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100/90 mb-5 relative">
        {/* 문항 헤더: 번호 및 카테고리 태그 */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-amber-500 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
              {currentQ.id}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-600 px-3 py-1 rounded-full bg-slate-100 flex items-center gap-1">
              <span>{currentQ.emoji}</span>
              <span>{currentQ.category}</span>
            </span>
          </div>

          {/* 발음 듣기 버튼 */}
          <button
            type="button"
            onClick={() => speak(currentQ.word)}
            disabled={isSpeaking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs sm:text-sm font-semibold transition-colors border border-sky-200 min-h-[44px]"
            title="원어민 발음 듣기"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-sky-600' : ''}`} />
            <span>발음 듣기</span>
            {currentQ.pronunciation && (
              <span className="text-sky-500 text-xs hidden sm:inline">[{currentQ.pronunciation}]</span>
            )}
          </button>
        </div>

        {/* 문제 질문 문장 */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed mb-3">
            {currentQ.questionText}
          </h2>

          {/* 힌트 및 실생활 예문 토글 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 py-1 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? '예문 힌트 접기' : '생활 속 예문 힌트 보기'}</span>
            </button>
          </div>

          {showHint && (
            <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-700 animate-fadeIn">
              <p className="font-semibold text-amber-900 mb-1">💡 예문 힌트:</p>
              <p className="italic text-slate-800 mb-0.5">{currentQ.exampleSentence}</p>
              <p className="text-slate-600">({currentQ.exampleKorean})</p>
            </div>
          )}
        </div>

        {/* 4지선다 객관식 선택지 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const optionLabels = ['①', '②', '③', '④'];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectAnswer(currentQ.id, idx)}
                className={`p-4 rounded-2xl border-2 text-left font-semibold text-base transition-all duration-150 flex items-center justify-between min-h-[56px] ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 text-amber-950 shadow-xs ring-2 ring-amber-200'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {optionLabels[idx]}
                  </span>
                  <span className="text-base sm:text-lg">{option}</span>
                </div>

                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 이전 / 다음 / 제출 버튼 바 */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 문제</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-xs transition-colors min-h-[44px]"
            >
              <span>다음 문제</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCheckSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all active:scale-98 min-h-[44px]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? '제출 중...' : '답안 제출하기'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 문항 번호 빠른 이동 네비게이터 칩 */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-amber-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">문항 번호 바로가기</span>
          <span className="text-[11px] text-slate-400">색칠된 번호는 푼 문제예요</span>
        </div>
        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
          {VOCABULARY_QUESTIONS.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  onIndexChange(idx);
                  setShowHint(false);
                }}
                className={`h-9 rounded-lg text-xs font-bold transition-all min-w-[32px] ${
                  isCurrent
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-1 scale-105'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title={`${q.id}번 문제로 이동`}
              >
                {q.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* 미답변 문제 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-amber-100 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
              아직 풀지 않은 문제가 있어요!
            </h3>
            <p className="text-sm text-slate-600 text-center mb-4">
              총 <span className="font-bold text-rose-600">{unansweredQuestions.length}개</span>의 문제를 아직 선택하지 않았어요.
              <br />
              (비어 있는 번호: {unansweredQuestions.slice(0, 6).join(', ')}
              {unansweredQuestions.length > 6 ? '...' : ''}번)
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  if (unansweredQuestions[0]) {
                    onIndexChange(unansweredQuestions[0] - 1);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors min-h-[44px]"
              >
                돌아가서 마저 풀기
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onSubmit();
                }}
                className="py-3 px-4 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors min-h-[44px]"
              >
                그냥 제출할래요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
