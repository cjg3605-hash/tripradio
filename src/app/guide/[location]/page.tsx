import MultiLangGuideClient from './MultiLangGuideClient';
import { supabase } from '@/lib/supabaseClient';
import { safeLanguageCode, detectPreferredLanguage, LANGUAGE_COOKIE_NAME } from '@/lib/utils';
import { cookies } from 'next/headers';
import { generateMetadataFromGuide } from '@/lib/seo/dynamicMetadata';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ location: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// 동적 메타데이터 생성
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locationName = decodeURIComponent(resolvedParams.location || '');
  const requestedLang = safeLanguageCode(
    Array.isArray(resolvedSearchParams?.lang) 
      ? resolvedSearchParams.lang[0] 
      : resolvedSearchParams?.lang
  );
  
  // 서버에서 쿠키 기반 언어 감지
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  const serverDetectedLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage,
    urlLang: requestedLang,
    prioritizeUrl: true
  });
  
  return generateMetadataFromGuide(locationName, serverDetectedLanguage);
}

export default async function GuidePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locationName = decodeURIComponent(resolvedParams.location || '');
  const requestedLang = safeLanguageCode(
    Array.isArray(resolvedSearchParams?.lang) 
      ? resolvedSearchParams.lang[0] 
      : resolvedSearchParams?.lang
  );
  const normLocation = normalizeString(locationName);
  
  // 🔥 서버에서 통합 언어 감지 (쿠키 우선)
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  // 서버-클라이언트 일관성을 위한 언어 우선순위 (URL 우선)
  const serverDetectedLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage,
    urlLang: requestedLang,
    prioritizeUrl: true
  });
  
  // 🔍 디버깅: 언어 감지 로깅
  console.log('🔍 가이드 페이지 언어 감지:', {
    rawLocation: resolvedParams.location,
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
  
  // 구조화된 데이터를 위한 정보 준비
  const structuredData = {
    name: locationName,
    description: `${locationName}의 상세한 AI 여행 가이드입니다. 실시간 음성 안내로 ${locationName}의 숨겨진 이야기를 발견해보세요.`,
    url: `https://navidocent.com/guide/${encodeURIComponent(locationName)}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressLocality: locationName
    },
    geo: initialGuide?.content?.coordinates ? {
      '@type': 'GeoCoordinates',
      latitude: initialGuide.content.coordinates.lat,
      longitude: initialGuide.content.coordinates.lng
    } : undefined,
    potentialAction: {
      '@type': 'ListenAction',
      target: `https://navidocent.com/guide/${encodeURIComponent(locationName)}/tour`
    }
  };

  return (
    <>
      <StructuredData type="TouristAttraction" data={structuredData} />
      <MultiLangGuideClient 
        locationName={locationName} 
        initialGuide={initialGuide}
        requestedLanguage={serverDetectedLanguage}
      />
    </>
  );
}