import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Users,
  BarChart3,
  Search,
  Download,
  Clock,
  Sparkles,
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { QuizResultRecord } from '../types/quiz';
import { subscribeToQuizResults, calculateQuestionStats } from '../firebase/firestoreService';
import { VOCABULARY_QUESTIONS } from '../data/vocabularyQuestions';
import { useSpeech } from '../hooks/useSpeech';

interface TeacherDashboardProps {
  onBackToStudent: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBackToStudent }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [results, setResults] = useState<QuizResultRecord[]>([]);
  const [isCloudSync, setIsCloudSync] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'accuracy'>('submissions');
  
  // 검색 및 필터링
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 학생 답안 상세 보기 모달
  const [inspectStudent, setInspectStudent] = useState<QuizResultRecord | null>(null);

  const { speak } = useSpeech();

  // Firestore 실시간 리스너 구독
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribeToQuizResults((data, fromCloud) => {
      setResults(data);
      setIsCloudSync(fromCloud);
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated]);

  // 비밀번호 확인 핸들러 (기본 비밀번호: 1234)
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // 반 목록 추출
  const classList = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      if (r.classRoom) set.add(r.classRoom);
    });
    return Array.from(set).sort();
  }, [results]);

  // 필터링된 학생 결과
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchClass = selectedClass === 'all' || r.classRoom === selectedClass;
      const matchSearch =
        searchQuery === '' ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.studentNumber).includes(searchQuery);
      return matchClass && matchSearch;
    });
  }, [results, selectedClass, searchQuery]);

  // 전체 통계 계산
  const summaryStats = useMemo(() => {
    if (filteredResults.length === 0) {
      return { totalStudents: 0, averageScore: 0, highestScore: 0, perfectCount: 0 };
    }
    const totalStudents = filteredResults.length;
    const totalScore = filteredResults.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = Math.round(totalScore / totalStudents);
    const highestScore = Math.max(...filteredResults.map((r) => r.score));
    const perfectCount = filteredResults.filter((r) => r.score === 100).length;

    return { totalStudents, averageScore, highestScore, perfectCount };
  }, [filteredResults]);

  // 문항별 정답률 통계 계산
  const questionStats = useMemo(() => {
    return calculateQuestionStats(filteredResults.length > 0 ? filteredResults : results);
  }, [filteredResults, results]);

  // CSV 내보내기
  const exportToCSV = () => {
    if (filteredResults.length === 0) return;

    const headers = ['반', '번호', '이름', '점수', '정답개수', '오답개수', '제출일시'];
    const rows = filteredResults.map((r) => [
      `"${r.classRoom}"`,
      r.studentNumber,
      `"${r.studentName}"`,
      r.score,
      r.correctCount,
      r.wrongCount,
      `"${new Date(r.submittedAt).toLocaleString('ko-KR')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `영단어퀴즈_제출결과_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 비밀번호 입력 폼
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-1">교사 전용 대시보드</h2>
          <p className="text-xs text-slate-500 mb-6">
            제출된 학생 결과 및 문항별 정답률 통계를 조회하려면 비밀번호를 입력해 주세요.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="비밀번호 입력 (기본: 1234)"
                autoFocus
                className="w-full px-4 py-3.5 text-center text-lg tracking-widest rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all min-h-[48px]"
              />
              {passwordError && (
                <p className="text-xs text-rose-600 font-semibold mt-2">
                  비밀번호가 올바르지 않습니다. (기본 비밀번호: 1234)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Unlock className="w-4 h-4" />
              <span>대시보드 입장하기</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onBackToStudent}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>학생 화면으로 돌아가기</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>학생 화면</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">교사 실시간 대시보드</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                {isCloudSync ? 'Firebase 실시간' : '로컬 모드'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={filteredResults.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 transition-colors min-h-[44px]"
            title="CSV 파일로 다운로드"
          >
            <Download className="w-4 h-4" />
            <span>CSV 다운로드</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 요약 통계 카드 4개 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>제출 학생 수</span>
          </div>
          <div className="text-2xl font-black text-slate-800">{summaryStats.totalStudents}명</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>평균 점수</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{summaryStats.averageScore}점</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>최고 점수</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{summaryStats.highestScore}점</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-100 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            <span>만점(100점) 학생</span>
          </div>
          <div className="text-2xl font-black text-sky-600">{summaryStats.perfectCount}명</div>
        </div>
      </div>

      {/* 탭 네비게이션: 제출 결과 표 vs 문항별 정답률 */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>실시간 학생 제출 결과 ({filteredResults.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accuracy')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'accuracy'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>문항별 정답률 분석 (20문항)</span>
        </button>
      </div>

      {/* 탭 1: 제출 결과 실시간 표 */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200">
          {/* 필터 및 검색 컨트롤 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="학생 이름 또는 번호 검색..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-indigo-500 bg-slate-50"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-indigo-500"
              >
                <option value="all">모든 학급 ({results.length})</option>
                {classList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>실시간 자동 갱신 중</span>
            </div>
          </div>

          {/* 표 테이블 */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-3 sm:px-4">반</th>
                  <th className="py-3 px-3 sm:px-4">번호</th>
                  <th className="py-3 px-3 sm:px-4">이름</th>
                  <th className="py-3 px-3 sm:px-4 text-center">점수</th>
                  <th className="py-3 px-3 sm:px-4 text-center">정답 / 오답</th>
                  <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">제출 시간</th>
                  <th className="py-3 px-3 sm:px-4 text-center">상세 답안</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      아직 제출된 학생 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((record) => (
                    <tr key={record.id || `${record.studentName}_${record.submittedAt}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">
                        {record.classRoom}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-slate-600">
                        {record.studentNumber}번
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-bold text-slate-800">
                        {record.studentName}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold text-xs sm:text-sm ${
                            record.score >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.score >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {record.score}점
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center text-xs">
                        <span className="text-emerald-600 font-bold">{record.correctCount}</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-rose-600 font-bold">{record.wrongCount}</span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs text-slate-500 hidden sm:table-cell">
                        {new Date(record.submittedAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setInspectStudent(record)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>확인</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 탭 2: 문항별 정답률 통계 */}
      {activeTab === 'accuracy' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">20개 일상 영단어 문항별 정답률</h2>
              <p className="text-xs text-slate-500">
                학생들이 어떤 단어를 쉽게 맞히고, 어떤 단어를 헷갈려했는지 분석합니다.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500">
              기준: 총 {filteredResults.length}명 응시 데이터
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {questionStats.map((stat) => {
              const qObj = VOCABULARY_QUESTIONS.find((q) => q.id === stat.questionId);
              let barColor = 'bg-emerald-500';
              let badgeColor = 'text-emerald-700 bg-emerald-100';
              if (stat.accuracyRate < 50) {
                barColor = 'bg-rose-500';
                badgeColor = 'text-rose-700 bg-rose-100';
              } else if (stat.accuracyRate < 75) {
                barColor = 'bg-amber-500';
                badgeColor = 'text-amber-700 bg-amber-100';
              }

              return (
                <div
                  key={stat.questionId}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {stat.questionId}
                      </span>
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm">{stat.word}</span>
                        <span className="text-xs text-slate-500 ml-1.5">({stat.meaning})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speak(stat.word)}
                        className="p-1 rounded-md text-slate-400 hover:text-sky-600"
                        title="발음 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${badgeColor}`}>
                        {stat.accuracyRate}%
                      </span>
                    </div>
                  </div>

                  {/* 정답률 게이지 막대 */}
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${stat.accuracyRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      정답 {stat.correctAttempts}명 / 총 응시 {stat.totalAttempts}명
                    </span>
                    {qObj && <span className="text-slate-400">{qObj.category}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 개별 학생 20문항 답안 상세 보기 모달 */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-indigo-100 animate-scaleIn">
            {/* 모달 헤더 */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {inspectStudent.classRoom} {inspectStudent.studentNumber}번 {inspectStudent.studentName} 학생
                </h3>
                <p className="text-xs text-slate-500">
                  점수: <span className="font-bold text-indigo-600">{inspectStudent.score}점</span> (정답 {inspectStudent.correctCount} / 오답 {inspectStudent.wrongCount})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 답안 리스트 */}
            <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
              {inspectStudent.answers.map((ans) => {
                const q = VOCABULARY_QUESTIONS.find((item) => item.id === ans.questionId);
                return (
                  <div
                    key={ans.questionId}
                    className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
                      ans.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center text-white ${
                          ans.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      >
                        {ans.questionId}
                      </span>
                      <span className="font-bold text-slate-800">{ans.word}</span>
                      <span className="text-slate-500">({ans.meaning})</span>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-slate-400 text-xs mr-1">선택:</span>
                        <span className={ans.isCorrect ? 'font-bold text-emerald-700' : 'font-bold text-rose-600 line-through'}>
                          {ans.selectedText}
                        </span>
                        {!ans.isCorrect && (
                          <span className="ml-2 font-bold text-emerald-700">
                            (정답: {ans.correctAnswerText})
                          </span>
                        )}
                      </div>
                      {ans.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 모달 하단 닫기 */}
            <div className="p-4 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
