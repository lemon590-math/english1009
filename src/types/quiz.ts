export interface Question {
  id: number;
  word: string;
  pronunciation?: string;
  meaning: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  category: string;
  emoji: string;
  exampleSentence: string;
  exampleKorean: string;
  explanation: string;
}

export interface StudentInfo {
  classRoom: string;
  studentNumber: number | string;
  studentName: string;
}

export interface StudentAnswer {
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
  selectedText: string;
  correctAnswerText: string;
  word: string;
  meaning: string;
}

export interface QuizResultRecord {
  id?: string;
  userId: string;
  classRoom: string;
  studentNumber: number;
  studentName: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  answers: StudentAnswer[];
  submittedAt: string;
}

export interface QuestionAccuracyStat {
  questionId: number;
  word: string;
  meaning: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracyRate: number;
  optionCounts: number[];
}
