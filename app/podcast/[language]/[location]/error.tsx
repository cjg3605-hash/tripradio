'use client';

import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Podcast page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">페이지를 로드할 수 없습니다</h1>
          <p className="text-slate-300 mb-4">{error?.message || '알 수 없는 오류가 발생했습니다.'}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
