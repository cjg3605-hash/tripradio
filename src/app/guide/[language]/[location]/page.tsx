import MultiLangGuideClient from './MultiLangGuideClient';
import { supabase } from '@/lib/supabaseClient';
import { safeLanguageCode, detectPreferredLanguage, LANGUAGE_COOKIE_NAME, normalizeLocationName } from '@/lib/utils';
import { mapLocationToKorean, generateMultilingualUrls, suggestSimilarLocations } from '@/lib/location-mapping';
import { cookies } from 'next/headers';
import { generateMetadataFromGuide } from '@/lib/seo/dynamicMetadata';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import TouristAttractionSchema from '@/components/seo/TouristAttractionSchema';
import PlaceSchema from '@/components/seo/PlaceSchema';
import AudioObjectSchema from '@/components/seo/AudioObjectSchema';
import MultilingualHreflang from '@/components/seo/MultilingualHreflang';
import { notFound } from 'next/navigation';

export const revalidate = 0;

// 🚀 새로운 URL 구조에 맞는 파라미터 인터페이스
interface PageProps {
  params: Promise<{ 
    language: string;  // 🔥 URL에서 언어 코드 직접 추출
    location: string;
  }>;
  searchParams?: Promise<{ 
    parent?: string;
    region?: string;
    country?: string;
    countryCode?: string;
    type?: string;
  }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const locationName = decodeURIComponent(resolvedParams.location || '');
  const requestedLang = safeLanguageCode(resolvedParams.language); // 🔥 URL에서 직접 추출
  
  // 서버에서 쿠키 기반 언어 감지 (URL 언어 우선)
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
  const rawLocationName = decodeURIComponent(resolvedParams.location || '');
  const requestedLang = safeLanguageCode(resolvedParams.language); // 🔥 URL에서 직접 추출
  
  // 🗺️ 새 URL 구조: 한국어 지명 그대로 사용 (매핑 제거)
  // 언어가 ko가 아닌 경우에만 매핑 시도
  let locationName = rawLocationName;
  
  if (requestedLang !== 'ko') {
    const mappedKoreanLocation = mapLocationToKorean(rawLocationName);
    if (mappedKoreanLocation && mappedKoreanLocation !== rawLocationName) {
      console.log(`🗺️ 외국어 지명 매핑: ${rawLocationName} (${requestedLang}) → ${mappedKoreanLocation}`);
      locationName = mappedKoreanLocation;
    }
  }
  
  // 🎯 구조화된 지역 컨텍스트 정보 추출 (searchParams에서)
  const parentRegion = resolvedSearchParams?.parent 
    ? decodeURIComponent(resolvedSearchParams.parent)
    : undefined;
    
  // 🚀 검색박스에서 전달된 구조화된 지역 정보
  const regionalContext = resolvedSearchParams ? {
    region: resolvedSearchParams.region ? decodeURIComponent(resolvedSearchParams.region) : undefined,
    country: resolvedSearchParams.country ? decodeURIComponent(resolvedSearchParams.country) : undefined,
    countryCode: resolvedSearchParams.countryCode || undefined,
    type: resolvedSearchParams.type as 'location' | 'attraction' || undefined
  } : undefined;
  
  const normLocation = normalizeLocationName(locationName);
  
  // 🔥 서버에서 통합 언어 감지 (URL 언어 우선)
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  // URL에서 추출한 언어를 최우선으로 사용
  const serverDetectedLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage,
    urlLang: requestedLang,
    prioritizeUrl: true
  });

  console.log(`🌍 새로운 URL 구조 처리: /guide/${requestedLang}/${locationName}`, {
    requestedLanguage: requestedLang,
    detectedLanguage: serverDetectedLanguage,
    locationName,
    normLocation
  });

  // 🗃️ 기존 가이드 데이터 조회 (로직 변경 없음)
  try {
    const { data: existingGuide, error: dbError } = await supabase
      .from('guides')
      .select('id, locationname, language, content, coordinates, location_region, country_code, created_at, updated_at')
      .eq('locationname', normLocation)
      .eq('language', serverDetectedLanguage.toLowerCase())
      .limit(1);

    if (dbError) {
      console.error('❌ DB 조회 오류:', dbError);
    } else if (existingGuide && existingGuide.length > 0) {
      console.log(`✅ 기존 가이드 발견: ${locationName} (${serverDetectedLanguage})`);
    } else {
      console.log(`📭 기존 가이드 없음: ${locationName} (${serverDetectedLanguage})`);
    }
    
    // 🎯 다국어 URL 생성 (새 구조 적용)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.ai';
    const multilingualUrls = generateMultilingualUrls(locationName, baseUrl);
    const adjustedUrls = Object.entries(multilingualUrls).reduce((acc, [lang, url]) => {
      // 새로운 URL 구조로 변환: /guide/[language]/[location]
      acc[lang] = `/guide/${lang}/${encodeURIComponent(locationName)}`;
      return acc;
    }, {} as Record<string, string>);

    // 🚀 클라이언트 컴포넌트에 필요한 모든 정보 전달
    return (
      <>
        {/* SEO 스키마들 */}
        <StructuredData 
          type="TravelGuide"
          data={{
            name: `${locationName} 여행 가이드`,
            location: locationName,
            language: serverDetectedLanguage,
            description: `${locationName}의 상세한 여행 가이드`,
            url: `https://tripradio.ai/guide/${requestedLang}/${encodeURIComponent(locationName)}`,
            coordinates: existingGuide?.[0]?.coordinates,
            datePublished: existingGuide?.[0]?.created_at,
            dateModified: existingGuide?.[0]?.updated_at
          }}
        />
        <TouristAttractionSchema 
          data={{
            name: locationName,
            description: `${locationName}의 상세한 관광 정보`,
            website: `https://tripradio.ai/guide/${requestedLang}/${encodeURIComponent(locationName)}`,
            coordinates: existingGuide?.[0]?.coordinates
          }}
        />
        <PlaceSchema 
          data={{
            name: locationName,
            description: `${locationName}의 상세한 장소 정보`,
            coordinates: existingGuide?.[0]?.coordinates
          }}
        />
        <AudioObjectSchema 
          data={{
            name: `${locationName} 오디오 가이드`,
            contentUrl: `https://tripradio.ai/guide/${requestedLang}/${encodeURIComponent(locationName)}/audio`,
            description: `${locationName}의 음성 해설 가이드`
          }}
        />
        
        {/* 다국어 hreflang */}
        <MultilingualHreflang
          locationName={locationName}
          currentLanguage={serverDetectedLanguage}
          urls={adjustedUrls}
        />

        {/* 메인 가이드 클라이언트 */}
        <MultiLangGuideClient
          initialLocationName={locationName}
          initialLanguage={serverDetectedLanguage}
          parentRegion={parentRegion}
          regionalContext={regionalContext}
        />
      </>
    );

  } catch (error) {
    console.error('❌ Guide 페이지 렌더링 오류:', error);
    notFound();
  }
}