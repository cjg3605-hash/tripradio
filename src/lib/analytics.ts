import { supabase } from './supabaseClient';

// 가이드 생성 로그 기록
export async function logGuideGeneration({
  userId,
  locationName,
  region,
  category,
  language = 'Korean',
  guideContent,
  responseTime,
  errorMessage,
  ipAddress,
  userAgent
}: {
  userId?: string;
  locationName?: string;
  region?: string;
  category?: string;
  language?: string;
  guideContent?: string;
  responseTime?: number;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const { error } = await supabase
      .from('guide_generation_logs')
      .insert({
        user_id: userId,
        location_name: locationName,
        region: region,
        category: category,
        language: language,
        guide_content: guideContent,
        response_time: responseTime,
        error_message: errorMessage,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) {
      console.error('가이드 생성 로그 기록 실패:', error);
    }
  } catch (error) {
    console.error('가이드 생성 로그 기록 중 오류:', error);
  }
}

// API 호출 로그 기록
export async function logApiCall({
  endpoint,
  method = 'GET',
  statusCode,
  responseTime,
  userId,
  ipAddress,
  userAgent
}: {
  endpoint: string;
  method?: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const { error } = await supabase
      .from('api_call_logs')
      .insert({
        endpoint,
        method,
        status_code: statusCode,
        response_time: responseTime,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) {
      console.error('API 호출 로그 기록 실패:', error);
    }
  } catch (error) {
    console.error('API 호출 로그 기록 중 오류:', error);
  }
}

// 사용자 활동 로그 기록
export async function logUserActivity({
  userId,
  activityType,
  pagePath,
  sessionDuration
}: {
  userId: string;
  activityType: string;
  pagePath?: string;
  sessionDuration?: number;
}) {
  try {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: userId,
        activity_type: activityType,
        page_path: pagePath,
        session_duration: sessionDuration
      });

    if (error) {
      console.error('사용자 활동 로그 기록 실패:', error);
    }
  } catch (error) {
    console.error('사용자 활동 로그 기록 중 오류:', error);
  }
}

// 지역/카테고리 자동 감지 함수
export function detectLocationInfo(locationName: string): { region?: string; category?: string } {
  const locationName_lower = locationName.toLowerCase();
  
  // 지역 감지
  let region: string | undefined;
  if (locationName_lower.includes('서울') || locationName_lower.includes('seoul')) region = '서울';
  else if (locationName_lower.includes('부산') || locationName_lower.includes('busan')) region = '부산';
  else if (locationName_lower.includes('제주') || locationName_lower.includes('jeju')) region = '제주';
  else if (locationName_lower.includes('경기') || locationName_lower.includes('gyeonggi')) region = '경기';
  else if (locationName_lower.includes('강원') || locationName_lower.includes('gangwon')) region = '강원';
  else if (locationName_lower.includes('경북') || locationName_lower.includes('gyeongbuk')) region = '경북';
  else if (locationName_lower.includes('경남') || locationName_lower.includes('gyeongnam')) region = '경남';
  else if (locationName_lower.includes('전북') || locationName_lower.includes('jeonbuk')) region = '전북';
  else if (locationName_lower.includes('전남') || locationName_lower.includes('jeonnam')) region = '전남';
  else if (locationName_lower.includes('충북') || locationName_lower.includes('chungbuk')) region = '충북';
  else if (locationName_lower.includes('충남') || locationName_lower.includes('chungnam')) region = '충남';
  else if (locationName_lower.includes('대구') || locationName_lower.includes('daegu')) region = '대구';
  else if (locationName_lower.includes('인천') || locationName_lower.includes('incheon')) region = '인천';
  else if (locationName_lower.includes('광주') || locationName_lower.includes('gwangju')) region = '광주';
  else if (locationName_lower.includes('울산') || locationName_lower.includes('ulsan')) region = '울산';
  else if (locationName_lower.includes('대전') || locationName_lower.includes('daejeon')) region = '대전';
  else if (locationName_lower.includes('세종') || locationName_lower.includes('sejong')) region = '세종';

  // 카테고리 감지
  let category: string | undefined;
  if (locationName_lower.includes('궁') || locationName_lower.includes('palace') || 
      locationName_lower.includes('사찰') || locationName_lower.includes('temple') ||
      locationName_lower.includes('유적') || locationName_lower.includes('heritage')) {
    category = '역사 유적지';
  } else if (locationName_lower.includes('산') || locationName_lower.includes('mountain') ||
             locationName_lower.includes('해수욕장') || locationName_lower.includes('beach') ||
             locationName_lower.includes('공원') || locationName_lower.includes('park') ||
             locationName_lower.includes('강') || locationName_lower.includes('river')) {
    category = '자연 관광지';
  } else if (locationName_lower.includes('타워') || locationName_lower.includes('tower') ||
             locationName_lower.includes('빌딩') || locationName_lower.includes('building') ||
             locationName_lower.includes('거리') || locationName_lower.includes('street')) {
    category = '도시 명소';
  } else if (locationName_lower.includes('박물관') || locationName_lower.includes('museum') ||
             locationName_lower.includes('미술관') || locationName_lower.includes('gallery') ||
             locationName_lower.includes('문화') || locationName_lower.includes('culture')) {
    category = '문화 시설';
  } else if (locationName_lower.includes('쇼핑') || locationName_lower.includes('shopping') ||
             locationName_lower.includes('시장') || locationName_lower.includes('market') ||
             locationName_lower.includes('몰') || locationName_lower.includes('mall')) {
    category = '쇼핑/엔터테인먼트';
  }

  return { region, category };
}