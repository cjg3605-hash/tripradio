// src/app/test-supabase/page.tsx - 수파베이스 연결 테스트
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0;

export default async function TestSupabasePage() {
  let connectionStatus = '❌ 연결 실패';
  let tableData: any = null;
  let error: any = null;

  try {
    // 간단한 수파베이스 연결 테스트
    const { data, error: connectionError } = await supabase
      .from('guides')
      .select('locationname, language')
      .limit(5);
    
    if (!connectionError && data) {
      connectionStatus = '✅ 연결 성공';
      tableData = data;
    } else {
      error = connectionError;
    }
  } catch (e) {
    error = e;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase 연결 테스트</h1>
      
      <div className="mb-4">
        <strong>연결 상태:</strong> {connectionStatus}
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {error.message || JSON.stringify(error)}
        </div>
      )}
      
      {tableData && (
        <div className="mb-4">
          <strong>guides 테이블 샘플 데이터:</strong>
          <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(tableData, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">환경변수 확인</h2>
        <p><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '설정 안됨'}</p>
        <p><strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정 안됨'}</p>
      </div>
    </div>
  );
}