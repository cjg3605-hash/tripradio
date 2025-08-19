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
import { redirect, notFound } from 'next/navigation';

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
  const rawLocationName = decodeURIComponent(resolvedParams.location || '');
  const requestedLang = safeLanguageCode(
    Array.isArray(resolvedSearchParams?.lang) 
      ? resolvedSearchParams.lang[0] 
      : resolvedSearchParams?.lang
  );
  
  // 🗺️ 다국어 지명 매핑 시도
  const mappedKoreanLocation = mapLocationToKorean(rawLocationName);
  if (mappedKoreanLocation && mappedKoreanLocation !== rawLocationName) {
    // 영어/다국어 지명이 한국어로 매핑된 경우 리다이렉트
    const newUrl = `/guide/${encodeURIComponent(mappedKoreanLocation)}`;
    const params = new URLSearchParams();
    if (requestedLang) params.set('lang', requestedLang);
    
    const redirectUrl = params.toString() ? `${newUrl}?${params.toString()}` : newUrl;
    console.log(`🗺️ 지명 매핑 리다이렉트: ${rawLocationName} → ${mappedKoreanLocation}`);
    redirect(redirectUrl);
  }
  
  const locationName = mappedKoreanLocation || rawLocationName;
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
  let guideNotFoundInAnyLanguage = false;
  
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
      console.log(`⚠️ 서버에서 ${serverDetectedLanguage} 가이드 없음, 다른 언어 확인`);
      
      // 다른 언어로도 가이드가 존재하는지 확인
      const { data: anyLanguageData, error: anyLanguageError } = await supabase
        .from('guides')
        .select('content')
        .eq('locationname', normLocation)
        .limit(1);
      
      if (anyLanguageError || !anyLanguageData || anyLanguageData.length === 0) {
        console.log(`❌ "${locationName}" 가이드가 어떤 언어로도 존재하지 않음`);
        guideNotFoundInAnyLanguage = true;
      } else {
        console.log(`✅ 다른 언어로 가이드 존재, 클라이언트에서 생성 예정`);
      }
    }
  } catch (e) {
    console.error('서버 사이드 가이드 조회 오류:', e);
  }
  
  // 가이드가 전혀 존재하지 않으면 404 페이지로 리다이렉트
  if (guideNotFoundInAnyLanguage) {
    notFound();
  }
  
  // 구조화된 데이터를 위한 정보 준비
  const guideContent = initialGuide?.content;

  // AudioObject 데이터 추출
  const extractAudioObject = (raw: any) => {
    if (!raw) return null;
    let c = raw;
    try { if (typeof c === 'string') c = JSON.parse(c); } catch {}
    const pick = (...paths: Array<(o: any) => any>) => {
      for (const fn of paths) {
        try {
          const v = fn(c);
          if (v) return v;
        } catch {}
      }
      return undefined;
    };
    const url =
      pick(o => o.audioUrl, o => o.audio?.url) ||
      pick(
        o => Array.isArray(o.chapters) && o.chapters.find((x: any) => x?.audioUrl)?.audioUrl,
        o => Array.isArray(o.sections) && o.sections.find((x: any) => x?.audioUrl)?.audioUrl,
      );
    if (!url) return null;

    const title =
      pick(o => o.title, o => o.name) ||
      pick(
        o => Array.isArray(o.chapters) && o.chapters.find((x: any) => x?.title)?.title,
        o => Array.isArray(o.sections) && o.sections.find((x: any) => x?.title)?.title,
      ) || `${locationName} 오디오 가이드`;

    const duration =
      pick(o => o.duration, o => o.audio?.duration) ||
      pick(
        o => Array.isArray(o.chapters) && o.chapters.find((x: any) => x?.duration)?.duration,
        o => Array.isArray(o.sections) && o.sections.find((x: any) => x?.duration)?.duration,
      );

    return {
      name: title,
      contentUrl: url,
      description: guideContent?.description,
      encodingFormat: url.includes('.mp3') ? 'audio/mpeg' : undefined,
      duration,
      inLanguage: serverDetectedLanguage,
    };
  };

  const audioData = extractAudioObject(guideContent);
  
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

  // 현재 페이지 URL 생성
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  const currentUrl = `${baseUrl}/guide/${encodeURIComponent(locationName)}${serverDetectedLanguage !== 'ko' ? `?lang=${serverDetectedLanguage}` : ''}`;

  return (
    <>
      <MultilingualHreflang 
        locationName={locationName}
        currentLanguage={serverDetectedLanguage}
        currentUrl={currentUrl}
      />
      <TouristAttractionSchema data={touristAttractionData} />
      <PlaceSchema data={placeData} />
      {audioData && <AudioObjectSchema data={audioData} />}
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