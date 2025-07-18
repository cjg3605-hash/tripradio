import GuideClient from './GuideClient';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0; // 페이지 캐시 비활성화

interface PageProps {
  params: {
    location: string;
  };
}

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default async function GuidePage({ params }: PageProps) {
  const locationName = decodeURIComponent(params.location || '');
  const normLocation = normalizeString(locationName);
  
  // 서버에서 guides 테이블에서 locationName으로 캐시 조회
  let initialGuide: { content: any } | null = null;
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', 'ko')
      .maybeSingle();
    
    if (!error && data && data.content) {
      initialGuide = { content: data.content };
    }
  } catch (e) {
    console.error('서버 사이드 가이드 조회 오류:', e);
  }
  
  return <GuideClient locationName={locationName} initialGuide={initialGuide} />;
} // src/app/guide/[location]/page.tsx

import MultiLangGuideClient from './MultiLangGuideClient';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 0;

interface PageProps {
  params: { location: string };
  searchParams: { lang?: string };
}

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default async function GuidePage({ params, searchParams }: PageProps) {
  const locationName = decodeURIComponent(params.location || '');
  const requestedLang = searchParams.lang || 'ko'; // URL에서 언어 파라미터
  const normLocation = normalizeString(locationName);
  
  // 🌍 서버에서 요청된 언어의 가이드 조회
  let initialGuide: { content: any } | null = null;
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', requestedLang.toLowerCase())
      .maybeSingle();
    
    if (!error && data && data.content) {
      initialGuide = { content: data.content };
      console.log(`✅ 서버에서 ${requestedLang} 가이드 발견:`, locationName);
    } else {
      console.log(`📭 서버에서 ${requestedLang} 가이드 없음:`, locationName);
    }
  } catch (e) {
    console.error('서버 사이드 가이드 조회 오류:', e);
  }
  
  return (
    <MultiLangGuideClient 
      locationName={locationName} 
      initialGuide={initialGuide}
    />
  );
}