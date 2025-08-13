// src/app/test-guide/page.tsx - 가이드 데이터 로드 테스트
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0;

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s가-힣]/g, ''); // 특수문자 제거, 한글 유지
}

export default async function TestGuidePage() {
  const locationName = '경복궁';
  const language = 'ko';
  const normLocation = normalizeString(locationName);
  
  let guideData = null;
  let error: any = null;

  try {
    console.log(`🔍 서버 사이드 가이드 조회: ${locationName} (${language})`);
    
    const { data, error: queryError } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', language.toLowerCase())
      .maybeSingle();
    
    if (!queryError && data && data.content) {
      guideData = data.content;
      console.log(`✅ 서버에서 ${language} 가이드 발견:`, locationName);
    } else {
      console.log(`📭 서버에서 ${language} 가이드 없음:`, locationName);
      error = queryError || '가이드 데이터가 없습니다';
    }
  } catch (e) {
    console.error('❌ 서버 사이드 가이드 조회 오류:', e);
    error = e;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">가이드 데이터 로드 테스트</h1>
      
      <div className="mb-4">
        <strong>검색 조건:</strong>
        <ul>
          <li>locationname: &quot;{normLocation}&quot; (정규화됨)</li>
          <li>language: &quot;{language}&quot;</li>
          <li>원본 이름: &quot;{locationName}&quot;</li>
        </ul>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {error.message || JSON.stringify(error, null, 2)}
        </div>
      )}
      
      {guideData ? (
        <div className="mb-4">
          <strong>가이드 데이터 발견!</strong>
          <div className="mt-2 p-4 bg-green-100 border border-green-400 rounded">
            <pre className="overflow-auto max-h-96">
              {JSON.stringify(guideData, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <strong>가이드 데이터가 없습니다.</strong>
          <p>DB에서 해당 위치와 언어에 맞는 가이드를 찾을 수 없습니다.</p>
        </div>
      )}
    </div>
  );
}