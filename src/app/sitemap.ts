import { MetadataRoute } from 'next';
import { generateSitemapUrls } from '@/lib/seo/metadata';

// 가이드 데이터 가져오기 (실제 구현에서는 데이터베이스에서)
async function getGuides() {
  // 임시 데이터 - 실제로는 supabase에서 가져옴
  return [
    { name: '경복궁', slug: 'gyeongbokgung' },
    { name: '제주도', slug: 'jeju-island' },
    { name: '부산', slug: 'busan' },
    // ... 더 많은 가이드들
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await getGuides();
  return generateSitemapUrls(guides);
} 