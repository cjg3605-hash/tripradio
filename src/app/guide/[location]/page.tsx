import GuideClient from './GuideClient';
import { supabase } from '@/lib/supabaseClient';
import { normalizeString } from '@/app/api/node/ai/generate-guide/route';

export default async function GuidePage({ params }) {
  // locationName을 반드시 decode + trim + toLowerCase로 정규화
  const locationName = normalizeString(params.location || '');
  // 서버에서 guides 테이블에서 locationName으로 캐시 조회
  let initialGuide = null;
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .filter('locationname', 'eq', locationName)
      .single();
    if (!error && data) {
      initialGuide = data;
    }
  } catch (e) {
    // ignore
  }
  return <GuideClient locationName={locationName} initialGuide={initialGuide} />;
} 