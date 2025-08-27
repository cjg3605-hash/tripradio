import MultiLangGuideClient from './MultiLangGuideClient';
import { supabase } from '@/lib/supabaseClient';
import { safeLanguageCode, detectPreferredLanguage, LANGUAGE_COOKIE_NAME, normalizeLocationName } from '@/lib/utils';
import { generateMultilingualUrls, suggestSimilarLocations } from '@/lib/location-mapping';
import { routeLocationQueryCached } from '@/lib/location/location-router';
import { cookies } from 'next/headers';
import { generateMetadataFromGuide } from '@/lib/seo/dynamicMetadata';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import TouristAttractionSchema from '@/components/seo/TouristAttractionSchema';
import PlaceSchema from '@/components/seo/PlaceSchema';
import AudioObjectSchema from '@/components/seo/AudioObjectSchema';
import MultilingualHreflang from '@/components/seo/MultilingualHreflang';
import { notFound, redirect } from 'next/navigation';

export const revalidate = 1800; // 30분 캐시 (SEO 최적화)

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
    selectedCity?: string;
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
  
  // 🚀 동적 라우팅 시스템으로 위치 분석 및 페이지 타입 결정
  const routingResult = await routeLocationQueryCached(
    rawLocationName, 
    requestedLang,
    requestedLang !== 'ko' ? {
      isTranslatedRoute: true,
      originalLocationName: rawLocationName
    } : undefined
  );
  
  console.log('📍 라우팅 분석 완료:', {
    pageType: routingResult.pageType,
    confidence: routingResult.confidence,
    showHub: routingResult.pageType === 'RegionExploreHub',
    hasTranslationContext: requestedLang !== 'ko',
    needsDisambiguation: routingResult.needsDisambiguation
  });
  
  // 🏙️ 도시 모호성 처리
  if (routingResult.needsDisambiguation && routingResult.disambiguationOptions) {
    const params = new URLSearchParams({
      query: rawLocationName,
      language: requestedLang,
      options: JSON.stringify(routingResult.disambiguationOptions)
    });
    
    console.log('🔄 Redirecting to disambiguation page with params:', params.toString());
    
    // Next.js 서버 컴포넌트에서 올바른 리다이렉트 방법
    redirect(`/disambiguate?${params.toString()}`);
  }
  
  // 한국어 지명 결정 (동적 분류 결과 우선)
  let locationName = rawLocationName;
  if (routingResult.locationData && requestedLang !== 'ko') {
    // 동적 분류에서 한국어 지명을 찾았으면 사용
    locationName = routingResult.locationData.aliases?.find(alias => /^[가-힣\s]+$/.test(alias)) || rawLocationName;
    console.log(`🗺️ 동적 라우팅 매핑: ${rawLocationName} → ${locationName}`);
  }
  
  // 🎯 구조화된 지역 컨텍스트 정보 추출 (searchParams에서)
  const parentRegion = resolvedSearchParams?.parent 
    ? decodeURIComponent(resolvedSearchParams.parent)
    : undefined;
    
  // 🏙️ 선택된 도시 처리
  const selectedCityId = resolvedSearchParams?.selectedCity;
  if (selectedCityId) {
    console.log(`🏙️ 사용자가 선택한 도시: ${selectedCityId}`);
    // 선택된 도시의 경우 무조건 RegionExploreHub로 처리
    // TODO: 선택된 도시 정보를 기반으로 컨텍스트 설정
  }
    
  // 🚀 검색박스에서 전달된 구조화된 지역 정보
  const regionalContext = resolvedSearchParams ? {
    region: resolvedSearchParams.region ? decodeURIComponent(resolvedSearchParams.region) : undefined,
    country: resolvedSearchParams.country ? decodeURIComponent(resolvedSearchParams.country) : undefined,
    countryCode: resolvedSearchParams.countryCode || undefined,
    type: resolvedSearchParams.type as 'location' | 'attraction' || undefined
  } : undefined;
  
  // 🌏 서버사이드 라우팅 분류로 허브/가이드 결정 (URL 파라미터 불필요)
  
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
          initialGuide={existingGuide && existingGuide.length > 0 ? existingGuide[0] : undefined}
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