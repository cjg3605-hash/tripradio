import { supabase } from './supabaseClient';

// Supabase에 히스토리 저장
export async function saveGuideHistoryToSupabase(user, locationName, guideData, userProfile) {
  if (!user?.id) return;
  const { error } = await supabase
    .from('guide_history')
    .insert([{
      user_id: user.id,
      location_name: locationName,
      guide_data: guideData,
      user_profile: userProfile,
      created_at: new Date().toISOString()
    }]);
  if (error) {
    console.error('Supabase 히스토리 저장 실패:', error);
  }
}

// Supabase에서 히스토리 불러오기
export async function fetchGuideHistoryFromSupabase(user) {
  if (!user?.id) return [];
  const { data, error } = await supabase
    .from('guide_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase 히스토리 불러오기 실패:', error);
    return [];
  }
  return data;
} 