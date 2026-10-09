import React, { useState } from 'react';
import { BookOpen, Volume2, ArrowLeft, RotateCcw, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { QuizResultRecord } from '../types/quiz';
import { VOCABULARY_QUESTIONS } from '../data/vocabularyQuestions';
import { useSpeech } from '../hooks/useSpeech';

interface WrongAnswerNotesProps {
  result: QuizResultRecord;
  onBackToResult: () => void;
  onRestartQuiz: () => void;
}

export const WrongAnswerNotes: React.FC<WrongAnswerNotesProps> = ({
  result,
  onBackToResult,
  onRestartQuiz,
}) => {
  const { speak, isSpeaking } = useSpeech();
  const [retryAnswers, setRetryAnswers] = useState<Record<number, number>>({});
  const [retrySuccessIds, setRetrySuccessIds] = useState<number[]>([]);

  const wrongAnswerList = result.answers.filter((a) => !a.isCorrect);

  const wrongQuestions = wrongAnswerList
    .map((ans) => VOCABULARY_QUESTIONS.find((q) => q.id === ans.questionId))
    .filter((q): q is typeof VOCABULARY_QUESTIONS[0] => q !== undefined);

  const handleRetrySelect = (questionId: number, optionIdx: number, correctIdx: number) => {
    setRetryAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    if (optionIdx === correctIdx) {
      if (!retrySuccessIds.includes(questionId)) {
        setRetrySuccessIds((prev) => [...prev, questionId]);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* 헤더 바 */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onBackToResult}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>결과 화면으로 돌아가기</span>
        </button>

        <button
          type="button"
          onClick={onRestartQuiz}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>퀴즈 전체 다시 풀기</span>
        </button>
      </div>

      {/* 인트로 카드 */}
      <div className="bg-linear-to-r from-rose-500 via-amber-500 to-orange-400 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>나만의 맞춤 스마트 오답 노트</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
            틀린 문제 쏙쏙 복습 노트 📖
          </h1>

          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            실수는 배움의 가장 멋진 디딤돌이에요!
            <br />
            아래에서 발음을 다시 듣고, 해설을 읽어본 뒤 바로 다시 풀어보세요.
          </p>

          <div className="mt-4 flex items-center gap-3 text-xs font-semibold bg-black/15 w-fit px-4 py-2 rounded-xl">
            <span>복습 대상: {wrongQuestions.length}문항</span>
            <span>•</span>
            <span>
              다시 맞힌 문항: {retrySuccessIds.length} / {wrongQuestions.length}개
            </span>
          </div>
        </div>
      </div>

      {/* 오답이 없을 때 (만점인 경우) */}
      {wrongQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-amber-100 shadow-sm">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">틀린 문제가 없어요!</h2>
          <p className="text-sm text-slate-600 mb-6">
            모든 문제를 완벽하게 맞혔습니다. 대단한 실력이에요!
          </p>
          <button
            type="button"
            onClick={onRestartQuiz}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-colors"
          >
            새로운 마음으로 다시 풀어보기
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {wrongQuestions.map((q, idx) => {
            const studentAns = result.answers.find((a) => a.questionId === q.id);
            const userRetryChoice = retryAnswers[q.id];
            const isRetrySuccess = retrySuccessIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-3xl p-6 sm:p-7 shadow-xs border transition-all ${
                  isRetrySuccess
                    ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20'
                    : 'border-amber-100'
                }`}
              >
                {/* 상단 문항 정보 & 발음 듣기 */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center">
                      {q.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-800">{q.word}</span>
                        {q.pronunciation && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            [{q.pronunciation}]
                          </span>
                        )}
                        <span className="text-sm font-bold text-slate-600"> 뜻: {q.meaning}</span>
                      </div>
                      <span className="text-xs text-slate-400">{q.emoji} {q.category}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => speak(q.word)}
                    disabled={isSpeaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors min-h-[44px]"
                  >
                    <Volume2 className="w-4 h-4 text-sky-600" />
                    <span>발음 듣기</span>
                  </button>
                </div>

                {/* 원래 문제 내용 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed mb-4">
                  <div className="font-semibold text-slate-800 mb-1">Q. {q.questionText}</div>
                  <div className="text-xs text-slate-500 italic">
                    예문: {q.exampleSentence} ({q.exampleKorean})
                  </div>
                </div>

                {/* 이전 오답 기록 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 flex items-center gap-1.5">
                    <span className="font-bold">내가 골랐던 오답:</span>
                    <span className="line-through">{studentAns?.selectedText || '(선택 안 함)'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-1.5">
                    <span className="font-bold">올바른 정답:</span>
                    <span className="font-black text-emerald-700">
                      {q.options[q.correctAnswerIndex]} ({q.meaning})
                    </span>
                  </div>
                </div>

                {/* 친절한 해설 */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-slate-700 mb-5">
                  <p className="font-bold text-amber-900 mb-1">💡 기억 쏙쏙 해설:</p>
                  <p>{q.explanation}</p>
                </div>

                {/* 즉석 다시 풀기 섹션 */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>지금 다시 맞혀보기!</span>
                    </span>

                    {isRetrySuccess && (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        정답 정복 완료!
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = userRetryChoice === optIdx;
                      const isCorrectChoice = optIdx === q.correctAnswerIndex;
                      const showResultForThis = userRetryChoice !== undefined;

                      let btnStyle = 'border-slate-200 bg-white hover:border-amber-300 text-slate-700';
                      if (showResultForThis) {
                        if (isCorrectChoice) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                        } else if (isChosen && !isCorrectChoice) {
                          btnStyle = 'border-rose-400 bg-rose-50 text-rose-700 line-through';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleRetrySelect(q.id, optIdx, q.correctAnswerIndex)}
                          className={`p-2.5 rounded-xl border text-center text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 네비게이션 버튼 */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onBackToResult}
          className="py-3.5 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors min-h-[48px]"
        >
          결과 화면으로 가기
        </button>
      </div>
    </div>
  );
};
