// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { generateSitemapUrls } from '@/lib/seo/metadata';
import { supabase } from '@/lib/supabaseClient';

// 실제 데이터베이스에서 가이드 목록 가져오기 (네이버 SEO 최적화)
async function getGuides() {
  try {
    const { data, error } = await supabase
      .from('guide_versions')
      .select('location_name, updated_at')
      .eq('status', 'production')
      .eq('language', 'ko') // 한국어 버전만 가져와서 중복 방지
      .order('location_name');

    if (error) {
      console.error('❌ Sitemap 가이드 조회 실패:', error);
      return [];
    }

    // 데이터 변환 (네이버 크롤링 최적화)
    const guides = data?.map(item => ({
      name: item.location_name,
      slug: encodeURIComponent(item.location_name),
      lastModified: new Date(item.updated_at)
    })) || [];

    console.log(`✅ Sitemap용 가이드 ${guides.length}개 조회 완료`);
    return guides;

  } catch (error) {
    console.error('❌ Sitemap 생성 중 오류:', error);
    
    // 오류 발생시 기본 가이드 반환 (fallback)
    const fallbackDate = new Date();
    return [
      { name: '경복궁', slug: '경복궁', lastModified: fallbackDate },
      { name: '제주도', slug: '제주도', lastModified: fallbackDate },
      { name: '부산', slug: '부산', lastModified: fallbackDate },
      { name: '서울', slug: '서울', lastModified: fallbackDate },
      { name: '인천', slug: '인천', lastModified: fallbackDate }
    ];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await getGuides();
  const basicUrls = generateSitemapUrls(guides);
  
  const now = new Date();
  
  // 🚀 직접 메인 페이지들 (언어 파라미터 제거로 캐싱 최적화)
  const multilangPages: MetadataRoute.Sitemap = [
    {
      url: 'https://navidocent.com',
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];
  
  // 키워드 전용 페이지들 추가
  const keywordPages: MetadataRoute.Sitemap = [
    {
      url: 'https://navidocent.com/audio-guide',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/docent',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/tour-radio',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/travel-radio',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // 새로운 여행 관련 페이지들
    {
      url: 'https://navidocent.com/travel',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: 'https://navidocent.com/free-travel',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: 'https://navidocent.com/destinations',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    // 영어 페이지들 - 글로벌 SEO 타겟
    {
      url: 'https://navidocent.com/en/ai-travel-guide',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/en/travel-planning-app',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/en/digital-nomad-travel',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/en/film-location-travel',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // 전용 도구 페이지들
    {
      url: 'https://navidocent.com/nomad-calculator',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: 'https://navidocent.com/trip-planner',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: 'https://navidocent.com/film-locations',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: 'https://navidocent.com/visa-checker',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    // 지역별 정적 페이지들 - AdSense 승인을 위한 정적 컨텐츠
    {
      url: 'https://navidocent.com/regions/korea',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/regions/europe',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/regions/asia',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://navidocent.com/regions/americas',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];
  
  // 🚀 새 URL 구조 가이드 페이지들 (generateSitemapUrls에서 이미 처리되므로 중복 제거)
  const guideMultilangPages: MetadataRoute.Sitemap = [];

  return [...basicUrls, ...multilangPages, ...keywordPages, ...guideMultilangPages];
}