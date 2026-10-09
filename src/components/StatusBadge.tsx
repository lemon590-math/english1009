import React from 'react';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'connected' | 'offline' | 'checking';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === 'checking') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
        <span>Firebase 연결 확인 중...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Cloud className="w-3.5 h-3.5 text-emerald-600" />
        <span>Firebase 실시간 연동 중</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
      <CloudOff className="w-3.5 h-3.5 text-rose-500" />
      <span>오프라인 (로컬 안전 저장 중)</span>
    </div>
  );
};
