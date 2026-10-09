import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, ensureAnonymousAuth, auth } from './config';
import { QuizResultRecord, QuestionAccuracyStat } from '../types/quiz';
import { VOCABULARY_QUESTIONS } from '../data/vocabularyQuestions';

const COLLECTION_NAME = 'quiz_results';
const LOCAL_STORAGE_BACKUP_KEY = 'voca_quiz_local_results_backup';

// 로컬 스토리지에 결과 안전 백업
export function saveLocalBackup(record: QuizResultRecord): void {
  try {
    const existing = getLocalBackup();
    const updated = [record, ...existing.filter(r => r.id !== record.id)];
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('로컬 스토리지 백업 실패:', err);
  }
}

// 로컬 스토리지 백업 데이터 가져오기
export function getLocalBackup(): QuizResultRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('로컬 백업 파싱 오류:', err);
    return [];
  }
}

// 퀴즈 결과 제출
export async function submitQuizResult(data: Omit<QuizResultRecord, 'id' | 'userId'>): Promise<{ success: boolean; id: string; cloudSaved: boolean }> {
  const resultId = `result_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  // 1. 익명 로그인 상태 확인/수행
  let userId = auth.currentUser?.uid;
  let cloudSaved = false;

  try {
    if (!userId) {
      const user = await ensureAnonymousAuth();
      userId = user.uid;
    }
  } catch (authErr) {
    console.warn('익명 인증 지연 또는 오프라인 상태:', authErr);
    userId = `offline_${Date.now()}`;
  }

  const record: QuizResultRecord = {
    ...data,
    id: resultId,
    userId: userId || 'anonymous_student',
  };

  // 2. 로컬 스토리지 즉시 백업 (네트워크 오류 대비)
  saveLocalBackup(record);

  // 3. Firestore 저장 시도
  if (auth.currentUser && !userId.startsWith('offline_')) {
    try {
      const docRef = doc(db, COLLECTION_NAME, resultId);
      await setDoc(docRef, {
        userId: record.userId,
        classRoom: record.classRoom,
        studentNumber: Number(record.studentNumber),
        studentName: record.studentName,
        score: record.score,
        correctCount: record.correctCount,
        totalQuestions: record.totalQuestions,
        answers: record.answers,
        submittedAt: record.submittedAt,
      });
      cloudSaved = true;
    } catch (err) {
      console.warn('Firestore 저장 실패 (로컬에 안전하게 보관됨):', err);
      // 필수 에러 포맷 로깅
      try {
        handleFirestoreError(err, OperationType.WRITE, `${COLLECTION_NAME}/${resultId}`);
      } catch (e) {
        // Logged, but continue gracefully for user experience
      }
    }
  }

  return { success: true, id: resultId, cloudSaved };
}

// 교사 대시보드용 실시간 결과 구독
export function subscribeToQuizResults(
  onData: (results: QuizResultRecord[], fromCloud: boolean) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // 초기 로컬 백업 먼저 제공
  const localResults = getLocalBackup();
  if (localResults.length > 0) {
    onData(localResults, false);
  }

  // Firestore 실시간 리스너 연결
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('submittedAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudResults: QuizResultRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          cloudResults.push({
            id: docSnap.id,
            userId: data.userId || '',
            classRoom: data.classRoom || '',
            studentNumber: data.studentNumber || 0,
            studentName: data.studentName || '',
            score: data.score ?? 0,
            correctCount: data.correctCount ?? 0,
            wrongCount: (data.totalQuestions ?? 20) - (data.correctCount ?? 0),
            totalQuestions: data.totalQuestions || 20,
            answers: data.answers || [],
            submittedAt: data.submittedAt || '',
          });
        });

        // 로컬 백업과 클라우드 결과 병합 (중복 제거)
        const combinedMap = new Map<string, QuizResultRecord>();
        localResults.forEach(r => { if (r.id) combinedMap.set(r.id, r); });
        cloudResults.forEach(r => { if (r.id) combinedMap.set(r.id, r); });
        
        const merged = Array.from(combinedMap.values()).sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );

        onData(merged, true);
      },
      (error) => {
        console.warn('Firestore 실시간 구독 중 오류 발생 (로컬 데이터 유지):', error);
        if (onError) onError(error);
        try {
          handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        } catch (e) {
          // Logged
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore 리스너 등록 실패:', err);
    return () => {};
  }
}

// 문항별 정답률 통계 계산 함수
export function calculateQuestionStats(results: QuizResultRecord[]): QuestionAccuracyStat[] {
  return VOCABULARY_QUESTIONS.map((question) => {
    let totalAttempts = 0;
    let correctAttempts = 0;
    const optionCounts = [0, 0, 0, 0];

    results.forEach((record) => {
      const answer = record.answers.find((a) => a.questionId === question.id);
      if (answer) {
        totalAttempts++;
        if (answer.isCorrect) {
          correctAttempts++;
        }
        if (answer.selectedIndex >= 0 && answer.selectedIndex < 4) {
          optionCounts[answer.selectedIndex]++;
        }
      }
    });

    const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    return {
      questionId: question.id,
      word: question.word,
      meaning: question.meaning,
      totalAttempts,
      correctAttempts,
      accuracyRate,
      optionCounts,
    };
  });
}
