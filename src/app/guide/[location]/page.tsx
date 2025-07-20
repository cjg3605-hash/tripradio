import MultiLangGuideClient from './MultiLangGuideClient';
import { supabase } from '@/lib/supabaseClient';
import { safeLanguageCode } from '@/lib/utils';

export const revalidate = 0;

interface PageProps {
  params: { location: string };
  searchParams?: { lang?: string };
}

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default async function GuidePage({ params, searchParams }: PageProps) {
  const locationName = decodeURIComponent(params.location || '');
  const requestedLang = safeLanguageCode(searchParams?.lang);
  const normLocation = normalizeString(locationName);
  
  // 서버에서 요청된 언어의 가이드 조회
  let initialGuide: { content: any } | null = null;
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', requestedLang.toLowerCase())
      .maybeSingle();
    
    if (!error && data && data.content) {
      initialGuide = { content: data.content };
    }
  } catch (e) {
    console.error('서버 사이드 가이드 조회 오류:', e);
  }
  
  return (
    <MultiLangGuideClient 
      locationName={locationName} 
      initialGuide={initialGuide}
    />
  );
}