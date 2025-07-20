// src/app/guide/[location]/page.tsx
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
  const requestedLang = searchParams.lang || 'ko';
  const normLocation = normalizeString(locationName);
  
  console.log(`🔍 서버 사이드 가이드 조회: ${locationName} (${requestedLang})`);
  
  // 서버에서 요청된 언어의 가이드 조회
  let initialGuide: any = null;
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('guide_data')
      .eq('locationname', normLocation)
      .eq('language', requestedLang.toLowerCase())
      .maybeSingle();
    
    if (!error && data && data.guide_data) {
      initialGuide = data.guide_data;
      console.log(`✅ 서버에서 ${requestedLang} 가이드 발견:`, locationName);
    } else {
      console.log(`📭 서버에서 ${requestedLang} 가이드 없음:`, locationName);
    }
  } catch (e) {
    console.error('❌ 서버 사이드 가이드 조회 오류:', e);
  }
  
  return (
    <MultiLangGuideClient 
      locationName={locationName} 
      initialGuide={initialGuide}
    />
  );
}