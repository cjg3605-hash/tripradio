import GuideClient from './GuideClient';
import { supabase } from '@/lib/supabaseClient';

export default async function GuidePage({ params }) {
  const locationName = decodeURIComponent(params.location);
  // 서버에서 guides 테이블에서 locationName으로 캐시 조회
  let initialGuide = null;
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('locationName', locationName)
      .single();
    if (!error && data) {
      initialGuide = data;
    }
  } catch (e) {
    // ignore
  }
  return <GuideClient locationName={locationName} initialGuide={initialGuide} />;
} 