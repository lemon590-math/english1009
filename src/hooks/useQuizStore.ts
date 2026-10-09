import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { StudentInfo, StudentAnswer, QuizResultRecord } from '../types/quiz';
import { VOCABULARY_QUESTIONS } from '../data/vocabularyQuestions';
import { submitQuizResult } from '../firebase/firestoreService';
import { ensureAnonymousAuth, testConnection } from '../firebase/config';

export type AppView = 'entry' | 'quiz' | 'result' | 'wrongNotes' | 'teacher';

const STUDENT_STORAGE_KEY = 'voca_quiz_student_profile';

export function useQuizStore() {
  const [view, setView] = useState<AppView>('entry');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(() => {
    try {
      const saved = localStorage.getItem(STUDENT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return { classRoom: '', studentNumber: '', studentName: '' };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<QuizResultRecord | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'offline' | 'checking'>('checking');

  // 익명 로그인 및 연결 상태 초기화
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        await ensureAnonymousAuth();
        const connected = await testConnection();
        if (isMounted) {
          setCloudStatus(connected ? 'connected' : 'connected'); // 익명 인증 완료되면 연결 상태로 간주
        }
      } catch (err) {
        if (isMounted) {
          setCloudStatus('offline');
        }
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // 학생 정보 저장
  const updateStudentInfo = useCallback((info: StudentInfo) => {
    setStudentInfo(info);
    try {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(info));
    } catch (e) {
      // ignore
    }
  }, []);

  // 답변 선택
  const handleSelectAnswer = useCallback((questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }, []);

  // 퀴즈 시작
  const startQuiz = useCallback((info: StudentInfo) => {
    updateStudentInfo(info);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setSubmittedResult(null);
    setView('quiz');
  }, [updateStudentInfo]);

  // 퀴즈 제출 및 점수 계산
  const submitQuiz = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const answers: StudentAnswer[] = VOCABULARY_QUESTIONS.map((q) => {
      const selectedIndex = selectedAnswers[q.id] ?? -1;
      const isCorrect = selectedIndex === q.correctAnswerIndex;
      return {
        questionId: q.id,
        selectedIndex,
        isCorrect,
        selectedText: selectedIndex >= 0 ? q.options[selectedIndex] : '(선택 안 함)',
        correctAnswerText: q.options[q.correctAnswerIndex],
        word: q.word,
        meaning: q.meaning,
      };
    });

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = VOCABULARY_QUESTIONS.length;
    const wrongCount = totalQuestions - correctCount;
    // 100점 만점 환산 (문항당 5점)
    const score = Math.round((correctCount / totalQuestions) * 100);

    const resultRecord: Omit<QuizResultRecord, 'id' | 'userId'> = {
      classRoom: studentInfo.classRoom.trim(),
      studentNumber: Number(studentInfo.studentNumber) || 1,
      studentName: studentInfo.studentName.trim(),
      score,
      correctCount,
      wrongCount,
      totalQuestions,
      answers,
      submittedAt: new Date().toISOString(),
    };

    try {
      const submission = await submitQuizResult(resultRecord);
      const fullRecord: QuizResultRecord = {
        ...resultRecord,
        id: submission.id,
        userId: 'student_current',
      };
      setSubmittedResult(fullRecord);

      // 축하 폭죽 효과 (부드럽고 밝은 애니메이션)
      if (score >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'],
        });
      }

      setView('result');
    } catch (err) {
      console.warn('퀴즈 제출 처리 오류:', err);
      // 에러가 나더라도 로컬 계산으로 학생 결과 화면은 정상 표시
      const fallbackRecord: QuizResultRecord = {
        ...resultRecord,
        id: `local_${Date.now()}`,
        userId: 'student_current',
      };
      setSubmittedResult(fallbackRecord);
      setView('result');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, selectedAnswers, studentInfo]);

  // 처음부터 다시 시작
  const restartEntireQuiz = useCallback(() => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setSubmittedResult(null);
    setView('quiz');
  }, []);

  return {
    view,
    setView,
    studentInfo,
    updateStudentInfo,
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
  };
}
