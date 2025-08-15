import MultiLangGuideClient from './MultiLangGuideClient';
import { supabase } from '@/lib/supabaseClient';
import { safeLanguageCode, detectPreferredLanguage, LANGUAGE_COOKIE_NAME, normalizeLocationName } from '@/lib/utils';
import { cookies } from 'next/headers';
import { generateMetadataFromGuide } from '@/lib/seo/dynamicMetadata';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import TouristAttractionSchema from '@/components/seo/TouristAttractionSchema';
import PlaceSchema from '@/components/seo/PlaceSchema';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ location: string }>;
  searchParams?: Promise<{ 
    lang?: string; 
    parent?: string;
    region?: string;
    country?: string;
    countryCode?: string;
    type?: string;
  }>;
}

// normalizeString 함수 제거 - utils에서 normalizeLocationName 사용

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
  // 🎯 새로운 구조화된 지역 컨텍스트 정보 추출
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
  
  // 🔥 서버에서 통합 언어 감지 (쿠키 우선)
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  
  // 서버-클라이언트 일관성을 위한 언어 우선순위 (URL 우선)
  const serverDetectedLanguage = detectPreferredLanguage({
    cookieValue: cookieLanguage,
    urlLang: requestedLang,
    prioritizeUrl: true
  });
  
  // 🔍 디버깅: 언어 감지 및 지역 컨텍스트 로깅
  console.log('🔍 가이드 페이지 언어 감지:', {
    rawLocation: resolvedParams.location,
    decodedLocation: locationName,
    normalizedLocation: normLocation,
    requestedLang,
    cookieLanguage,
    serverDetectedLanguage,
    finalLanguage: serverDetectedLanguage,
    parentRegion: parentRegion || 'none', // 🎯 지역 컨텍스트 로깅
    regionalContext: regionalContext || 'none' // 🚀 새로운 구조화된 지역 정보 로깅
  });
  
  console.log('🔎 DB 조회 준비:', {
    query: `locationname = "${normLocation}" AND language = "${serverDetectedLanguage.toLowerCase()}"`
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
  const guideContent = initialGuide?.content;
  
  // TouristAttraction 스키마 데이터
  const touristAttractionData = {
    name: locationName,
    description: guideContent?.description || `${locationName}의 상세한 AI 여행 가이드입니다. 실시간 음성 안내로 ${locationName}의 숨겨진 이야기를 발견해보세요.`,
    address: {
      streetAddress: guideContent?.address?.street,
      addressLocality: guideContent?.address?.city || locationName,
      addressRegion: guideContent?.address?.region || "서울특별시",
      postalCode: guideContent?.address?.postalCode,
      addressCountry: "KR"
    },
    coordinates: guideContent?.coordinates,
    image: guideContent?.images?.[0] || `https://navidocent.com/images/landmarks/${locationName.toLowerCase().replace(/\s+/g, '-')}.webp`,
    website: `https://navidocent.com/guide/${encodeURIComponent(locationName)}`,
    openingHours: guideContent?.operatingHours || ["월-일: 09:00-18:00"],
    priceRange: guideContent?.admissionFee || "무료",
    category: guideContent?.categories || ["문화재", "관광명소", "역사유적"],
    language: ["Korean", "English", "Japanese", "Chinese", "Spanish"],
    accessibility: guideContent?.accessibility || ["휠체어 접근 가능", "시각장애인 안내"],
    amenityFeature: ["AI 음성 가이드", "다국어 지원", "실시간 위치 안내", "오프라인 사용"],
    touristType: ["Leisure", "Cultural", "Educational", "Family"],
    starRating: guideContent?.rating ? {
      ratingValue: guideContent.rating.average || 4.8,
      ratingCount: guideContent.rating.count || 156
    } : {
      ratingValue: 4.8,
      ratingCount: 156
    }
  };

  // Place 스키마 데이터
  const placeData = {
    name: locationName,
    description: guideContent?.description || `${locationName}는 한국의 대표적인 문화유산입니다. TripRadio.AI와 함께 특별한 여행을 경험해보세요.`,
    placeType: guideContent?.placeType as any || 'LandmarksOrHistoricalBuildings',
    address: {
      streetAddress: guideContent?.address?.street,
      addressLocality: guideContent?.address?.city || locationName,
      addressRegion: guideContent?.address?.region || "서울특별시",
      postalCode: guideContent?.address?.postalCode,
      addressCountry: "KR"
    },
    coordinates: guideContent?.coordinates,
    image: guideContent?.images || [`https://navidocent.com/images/landmarks/${locationName.toLowerCase().replace(/\s+/g, '-')}.webp`],
    website: `https://navidocent.com/guide/${encodeURIComponent(locationName)}`,
    telephone: guideContent?.contact?.phone,
    email: guideContent?.contact?.email,
    openingHours: guideContent?.operatingHours || ["09:00-18:00"],
    admissionPrice: guideContent?.admissionFee || "무료",
    containedInPlace: regionalContext?.region || "서울특별시",
    containsPlace: guideContent?.subLocations,
    publicAccess: true,
    smokingAllowed: false,
    wheelchairAccessible: guideContent?.accessibility?.includes('wheelchair') || true
  };

  return (
    <>
      <TouristAttractionSchema data={touristAttractionData} />
      <PlaceSchema data={placeData} />
      <MultiLangGuideClient 
        locationName={locationName} 
        initialGuide={initialGuide}
        requestedLanguage={serverDetectedLanguage}
        parentRegion={parentRegion}
        regionalContext={regionalContext}
      />
    </>
  );
}