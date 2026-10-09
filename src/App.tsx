import React from 'react';
import { Header } from './components/Header';
import { StudentEntry } from './components/StudentEntry';
import { QuizRunner } from './components/QuizRunner';
import { QuizResultView } from './components/QuizResultView';
import { WrongAnswerNotes } from './components/WrongAnswerNotes';
import { TeacherDashboard } from './components/TeacherDashboard';
import { useQuizStore } from './hooks/useQuizStore';
import { Heart, Sparkles } from 'lucide-react';

export default function App() {
  const {
    view,
    setView,
    studentInfo,
    currentIndex,
    setCurrentIndex,
    selectedAnswers,
    handleSelectAnswer,
    startQuiz,
    submitQuiz,
    isSubmitting,
    submittedResult,
    restartEntireQuiz,
    cloudStatus,
  } = useQuizStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 antialiased font-sans">
      {/* 글로벌 상단 헤더 */}
      <Header
        currentView={view}
        onNavigate={(newView) => setView(newView)}
        cloudStatus={cloudStatus}
        onOpenTeacher={() => setView('teacher')}
      />

      {/* 메인 뷰 컨텐츠 영역 */}
      <main className="flex-1 w-full">
        {view === 'entry' && (
          <StudentEntry
            initialInfo={studentInfo}
            onStart={(info) => startQuiz(info)}
          />
        )}

        {view === 'quiz' && (
          <QuizRunner
            studentInfo={studentInfo}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            selectedAnswers={selectedAnswers}
            onSelectAnswer={handleSelectAnswer}
            onSubmit={submitQuiz}
            isSubmitting={isSubmitting}
          />
        )}

        {view === 'result' && submittedResult && (
          <QuizResultView
            result={submittedResult}
            onOpenWrongNotes={() => setView('wrongNotes')}
            onRetry={restartEntireQuiz}
          />
        )}

        {view === 'wrongNotes' && submittedResult && (
          <WrongAnswerNotes
            result={submittedResult}
            onBackToResult={() => setView('result')}
            onRestartQuiz={restartEntireQuiz}
          />
        )}

        {view === 'teacher' && (
          <TeacherDashboard
            onBackToStudent={() => setView('entry')}
          />
        )}
      </main>

      {/* 친절하고 따뜻한 푸터 */}
      <footer className="py-6 border-t border-amber-100/80 bg-white/60 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span>초등학생을 위한 일상 영단어 퀴즈</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">20문항 도전</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>실수를 두려워하지 않고 배움을 즐겨요</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}
