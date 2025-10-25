// 올바른 URL 구조로 완전 재작성: /guide/언어코드/장소명, /podcast/언어코드/장소명
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

// 다국어 가이드 및 팟캐스트 데이터 가져오기
async function getMultilingualContent() {
  try {
    // 가이드 데이터 조회 (모든 언어)
    const { data: guidesData, error: guidesError } = await supabase
      .from('guides')
      .select('locationname, language, updated_at')
      .in('language', ['ko', 'en', 'ja', 'zh', 'es'])
      .order('locationname');

    // 팟캐스트 데이터 조회
    const { data: podcastsData, error: podcastsError } = await supabase
      .from('podcast_episodes')
      .select('location_input, language, updated_at, location_slug')
      .eq('status', 'completed')
      .order('location_input');

    if (guidesError) {
      console.warn('⚠️ 가이드 조회 오류:', guidesError);
    }
    if (podcastsError) {
      console.warn('⚠️ 팟캐스트 조회 오류:', podcastsError);
    }

    // 가이드 데이터 정리
    const guides = (guidesData || []).map(item => ({
      locationName: item.locationname,
      language: item.language,
      slug: encodeURIComponent(item.locationname),
      lastModified: new Date(item.updated_at || new Date()),
      contentType: 'guide'
    }));

    // 팟캐스트 데이터 정리  
    const podcasts = (podcastsData || []).map(item => ({
      locationName: item.location_input,
      language: item.language,
      slug: item.location_slug || encodeURIComponent(item.location_input),
      lastModified: new Date(item.updated_at || new Date()),
      contentType: 'podcast'
    }));

    // AdSense 승인을 위한 fallback 팟캐스트 (DB에 데이터가 부족할 경우)
    const fallbackPodcasts = [
      { name: 'colosseum', language: 'ko' },
      { name: 'eiffel-tower', language: 'ko' },
      { name: 'taj-mahal', language: 'ko' },
      { name: 'great-wall-of-china', language: 'ko' },
      { name: 'statue-of-liberty', language: 'ko' },
      { name: 'machu-picchu', language: 'ko' },
      { name: 'gyeongbokgung', language: 'ko' },
      { name: 'sagrada-familia', language: 'ko' },
      { name: 'vatican-city', language: 'ko' },
      { name: 'tokyo-tower', language: 'ko' },
      { name: 'pyramids-of-giza', language: 'ko' },
      { name: 'sydney-opera-house', language: 'ko' },
      // 영어 버전
      { name: 'colosseum', language: 'en' },
      { name: 'eiffel-tower', language: 'en' },
      { name: 'taj-mahal', language: 'en' },
      { name: 'great-wall-of-china', language: 'en' },
      { name: 'statue-of-liberty', language: 'en' },
      { name: 'machu-picchu', language: 'en' },
      { name: 'gyeongbokgung', language: 'en' },
      { name: 'sagrada-familia', language: 'en' },
    ];

    // fallback 팟캐스트를 podcasts 배열에 추가 (중복 제거)
    const existingSlugs = new Set(podcasts.map(p => `${p.language}-${p.slug}`));
    fallbackPodcasts.forEach(fb => {
      const key = `${fb.language}-${fb.name}`;
      if (!existingSlugs.has(key)) {
        podcasts.push({
          locationName: fb.name,
          language: fb.language,
          slug: fb.name,
          lastModified: new Date(),
          contentType: 'podcast'
        });
      }
    });

    console.log(`✅ 콘텐츠 조회 완료: 가이드 ${guides.length}개, 팟캐스트 ${podcasts.length}개 (fallback 포함)`);
    return { guides, podcasts };

  } catch (error) {
    console.error('❌ 콘텐츠 조회 중 오류:', error);
    
    // 폴백 데이터
    const fallbackDate = new Date();
    const fallbackLocations = ['경복궁', '제주도', '부산', '서울', '인천'];
    const fallbackGuides: Array<{
      locationName: string;
      language: string;
      slug: string;
      lastModified: Date;
      contentType: string;
    }> = [];
    
    for (const location of fallbackLocations) {
      for (const lang of ['ko', 'en']) {
        fallbackGuides.push({
          locationName: location,
          language: lang,
          slug: encodeURIComponent(location),
          lastModified: fallbackDate,
          contentType: 'guide'
        });
      }
    }
    
    return { guides: fallbackGuides, podcasts: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { guides, podcasts } = await getMultilingualContent();
  const now = new Date();
  
  // 🚀 정규화된 도메인 (SEO 최적화)
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop';
  
  const sitemapEntries: MetadataRoute.Sitemap = [
    // 메인 페이지
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 키워드 전용 페이지들 추가
  const keywordPages: MetadataRoute.Sitemap = [
    // 목록 페이지 (AdSense 승인 필수)
    {
      url: `${BASE_URL}/guide`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/podcast`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/audio-guide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/docent`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tour-radio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/travel-radio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/travel`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/free-travel`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/destinations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    // 영어 페이지들 - 글로벌 SEO 타겟
    {
      url: `${BASE_URL}/en/ai-travel-guide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/travel-planning-app`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/digital-nomad-travel`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/film-location-travel`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // 전용 도구 페이지들
    {
      url: `${BASE_URL}/nomad-calculator`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/trip-planner`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/film-locations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/visa-checker`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    // 지역별 정적 페이지들
    {
      url: `${BASE_URL}/regions/korea`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/regions/europe`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/regions/asia`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/regions/americas`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 🎯 가이드 페이지들 생성 - 올바른 구조: /guide/언어코드/장소명
  const guidePages: MetadataRoute.Sitemap = [];
  
  guides.forEach(guide => {
    const priority = guide.language === 'ko' ? 0.9 : 
                    guide.language === 'en' ? 0.8 : 0.7;
    
    guidePages.push({
      url: `${BASE_URL}/guide/${guide.language}/${guide.slug}`,
      lastModified: guide.lastModified,
      changeFrequency: 'weekly',
      priority
    });
  });
  
  // 🎙️ 팟캐스트 페이지들 생성 - 올바른 구조: /podcast/언어코드/장소명
  const podcastPages: MetadataRoute.Sitemap = [];
  
  podcasts.forEach(podcast => {
    const priority = podcast.language === 'ko' ? 0.85 : 
                    podcast.language === 'en' ? 0.75 : 0.65;
    
    podcastPages.push({
      url: `${BASE_URL}/podcast/${podcast.language}/${podcast.slug}`,
      lastModified: podcast.lastModified,
      changeFrequency: 'weekly',
      priority
    });
  });

  console.log(`🗺️ Sitemap 생성 완료:`, {
    메인페이지: sitemapEntries.length,
    키워드페이지: keywordPages.length,
    가이드페이지: guidePages.length,
    팟캐스트페이지: podcastPages.length,
    총합: sitemapEntries.length + keywordPages.length + guidePages.length + podcastPages.length
  });

  return [...sitemapEntries, ...keywordPages, ...guidePages, ...podcastPages];
}