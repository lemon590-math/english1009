import React, { useState } from 'react';
import { Award, BookOpen, RotateCcw, Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { QuizResultRecord } from '../types/quiz';
import { VOCABULARY_QUESTIONS } from '../data/vocabularyQuestions';
import { useSpeech } from '../hooks/useSpeech';

interface QuizResultViewProps {
  result: QuizResultRecord;
  onOpenWrongNotes: () => void;
  onRetry: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  result,
  onOpenWrongNotes,
  onRetry,
}) => {
  const { speak } = useSpeech();
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');

  const { score, correctCount, wrongCount, totalQuestions, answers } = result;

  // 사회정서학습(SEL) 성장 마인드셋 피드백
  let growthMessage = '';
  let emojiBadge = '🌟';
  if (score === 100) {
    growthMessage = '완벽해요! 일상생활 영단어 최고 박사님이시네요! 👏';
    emojiBadge = '👑';
  } else if (score >= 80) {
    growthMessage = '정말 훌륭해요! 대부분의 필수 영단어를 멋지게 기억하고 있어요! 🌟';
    emojiBadge = '⭐';
  } else if (score >= 60) {
    growthMessage = '새로운 관점을 훌륭하게 발견했군요! 오답 노트를 보면 실력이 쑥쑥 늘어요! 🌱';
    emojiBadge = '🌱';
  } else {
    growthMessage = '끝까지 20문제를 완주한 용기가 멋져요! 오답 노트를 통해 하나씩 내 것으로 만들어 볼까요? 💪';
    emojiBadge = '🌈';
  }

  const displayedAnswers = answers.filter((a) => {
    if (filterMode === 'wrong') return !a.isCorrect;
    if (filterMode === 'correct') return a.isCorrect;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* 점수 & 축하 피드백 카드 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-100 text-center mb-6 relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-tr from-amber-400 to-orange-400 text-white text-4xl mb-4 shadow-md">
          {emojiBadge}
        </div>

        <div className="text-xs sm:text-sm font-bold text-amber-700 mb-1">
          {result.classRoom} {result.studentNumber}번 {result.studentName} 학생의 결과
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight mb-2">
          {score}<span className="text-xl sm:text-2xl text-slate-400 font-semibold">점</span>
        </h1>

        <p className="text-base sm:text-lg font-bold text-slate-700 mb-6 max-w-lg mx-auto">
          {growthMessage}
        </p>

        {/* 정답 / 오답 요약 카드 */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-0.5">총 문항</div>
            <div className="text-xl font-extrabold text-slate-800">{totalQuestions}개</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="text-xs font-semibold text-emerald-700 mb-0.5">맞힌 문제</div>
            <div className="text-xl font-extrabold text-emerald-600">{correctCount}개</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
            <div className="text-xs font-semibold text-rose-700 mb-0.5">틀린 문제</div>
            <div className="text-xl font-extrabold text-rose-600">{wrongCount}개</div>
          </div>
        </div>

        {/* 주요 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {wrongCount > 0 ? (
            <button
              type="button"
              onClick={onOpenWrongNotes}
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-linear-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <BookOpen className="w-5 h-5" />
              <span>틀린 문제 모아보기 (오답 노트 {wrongCount}개)</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenWrongNotes}
              className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Award className="w-5 h-5" />
              <span>단어장 전체 복습하기</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>처음부터 다시 풀기</span>
          </button>
        </div>
      </div>

      {/* 문항별 정답/오답 상세 리뷰 섹션 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-amber-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">문항별 정답 및 오답 확인</h2>
            <p className="text-xs text-slate-500">내가 고른 답과 올바른 정답을 비교해 보세요</p>
          </div>

          {/* 필터 탭 */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체 ({totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'wrong'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              오답 ({wrongCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'correct'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              정답 ({correctCount})
            </button>
          </div>
        </div>

        {/* 문항 리스트 */}
        <div className="space-y-3">
          {displayedAnswers.map((ans) => {
            const questionData = VOCABULARY_QUESTIONS.find((q) => q.id === ans.questionId);
            return (
              <div
                key={ans.questionId}
                className={`p-4 rounded-2xl border transition-all ${
                  ans.isCorrect
                    ? 'border-emerald-100 bg-emerald-50/30'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center ${
                        ans.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {ans.questionId}
                    </span>
                    <span className="font-bold text-slate-800 text-base">
                      {ans.word} ({ans.meaning})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ans.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        정답
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        오답
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => speak(ans.word)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="발음 듣기"
                    >
                      <Volume2 className="w-4 h-4 text-sky-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">내가 고른 답:</span>
                    <span
                      className={`font-bold ${
                        ans.isCorrect ? 'text-emerald-700' : 'text-rose-600 line-through'
                      }`}
                    >
                      {ans.selectedText}
                    </span>
                  </div>
                  {!ans.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">올바른 정답:</span>
                      <span className="font-extrabold text-emerald-700">
                        {ans.correctAnswerText}
                      </span>
                    </div>
                  )}
                </div>

                {questionData && (
                  <p className="mt-2 text-xs text-slate-500 bg-white/80 p-2.5 rounded-xl border border-slate-100">
                    💡 <span className="font-medium">{questionData.explanation}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
