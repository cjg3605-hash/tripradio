import MultiLangGuideClient from './MultiLangGuideClient';
import { supabase } from '@/lib/supabaseClient';
import { safeLanguageCode, detectPreferredLanguage, LANGUAGE_COOKIE_NAME } from '@/lib/utils';
import { cookies } from 'next/headers';
import { generateMetadataFromGuide } from '@/lib/seo/dynamicMetadata';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: { location: string };
  searchParams?: { lang?: string };
}

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// 동적 메타데이터 생성
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const locationName = decodeURIComponent(params.location || '');
  const requestedLang = safeLanguageCode(searchParams?.lang);
  
  // 서버에서 쿠키 기반 언어 감지
  const cookieStore = cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  const serverDetectedLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage,
    urlLang: requestedLang,
    prioritizeUrl: true
  });
  
  return generateMetadataFromGuide(locationName, serverDetectedLanguage);
}

export default async function GuidePage({ params, searchParams }: PageProps) {
  const locationName = decodeURIComponent(params.location || '');
  const requestedLang = safeLanguageCode(searchParams?.lang);
  const normLocation = normalizeString(locationName);
  
  // 🔥 서버에서 통합 언어 감지 (쿠키 우선)
  const cookieStore = cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  // 서버-클라이언트 일관성을 위한 언어 우선순위 (URL 우선)
  const serverDetectedLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage,
    urlLang: requestedLang,
    prioritizeUrl: true
  });
  
  // 🔍 디버깅: 언어 감지 로깅
  console.log('🔍 가이드 페이지 언어 감지:', {
    rawLocation: params.location,
    decodedLocation: locationName,
    normalizedLocation: normLocation,
    requestedLang,
    cookieLanguage,
    serverDetectedLanguage,
    finalLanguage: serverDetectedLanguage
  });
  
  // 🔥 서버에서 감지된 언어로 가이드 조회 (쿠키 우선)
  let initialGuide: { content: any } | null = null;
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', serverDetectedLanguage.toLowerCase())
      .maybeSingle();
    
    if (!error && data && data.content) {
      initialGuide = { content: data.content };
      console.log(`✅ 서버에서 ${serverDetectedLanguage} 가이드 발견`);
    } else {
      console.log(`⚠️ 서버에서 ${serverDetectedLanguage} 가이드 없음, 클라이언트에서 생성`);
    }
  } catch (e) {
    console.error('서버 사이드 가이드 조회 오류:', e);
  }
  
  return (
    <MultiLangGuideClient 
      locationName={locationName} 
      initialGuide={initialGuide}
      requestedLanguage={serverDetectedLanguage}
    />
  );
}