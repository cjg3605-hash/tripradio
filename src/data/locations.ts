// 정확한 관광지 위치 좌표 데이터베이스
export interface LocationCoordinates {
  lat: number;
  lng: number;
  name: string;
  description?: string;
}

export interface TourLocation {
  id: string;
  name: string;
  center: LocationCoordinates;
  pois: LocationCoordinates[];
}

// 서울 주요 관광지 정확한 좌표
export const TOUR_LOCATIONS: Record<string, TourLocation> = {
  '경복궁': {
    id: 'gyeongbokgung',
    name: '경복궁',
    center: {
      lat: 37.5796,
      lng: 126.9770,
      name: '경복궁 정문(광화문)',
      description: '조선왕조의 정궁'
    },
    pois: [
      { lat: 37.5796, lng: 126.9770, name: '광화문', description: '경복궁의 정문' },
      { lat: 37.5799, lng: 126.9765, name: '흥례문', description: '두 번째 문' },
      { lat: 37.5804, lng: 126.9760, name: '근정전', description: '정전, 왕의 즉위식과 조회' },
      { lat: 37.5810, lng: 126.9758, name: '사정전', description: '편전, 왕의 일상 집무' },
      { lat: 37.5815, lng: 126.9752, name: '강녕전', description: '왕의 침전' },
      { lat: 37.5818, lng: 126.9748, name: '교태전', description: '왕비의 침전' },
      { lat: 37.5812, lng: 126.9745, name: '자경전', description: '대비전' },
      { lat: 37.5820, lng: 126.9740, name: '향원정', description: '연못 속 정자' }
    ]
  },
  
  '창덕궁': {
    id: 'changdeokgung',
    name: '창덕궁',
    center: {
      lat: 37.5794,
      lng: 126.9913,
      name: '창덕궁 정문(돈화문)',
      description: '조선왕조의 이궁, 유네스코 세계문화유산'
    },
    pois: [
      { lat: 37.5794, lng: 126.9913, name: '돈화문', description: '창덕궁 정문' },
      { lat: 37.5801, lng: 126.9918, name: '인정전', description: '정전' },
      { lat: 37.5806, lng: 126.9922, name: '선정전', description: '편전' },
      { lat: 37.5810, lng: 126.9925, name: '희정당', description: '왕의 침전' },
      { lat: 37.5815, lng: 126.9930, name: '대조전', description: '왕비의 침전' },
      { lat: 37.5825, lng: 126.9940, name: '후원(비원)', description: '아름다운 정원' }
    ]
  },
  
  '덕수궁': {
    id: 'deoksugung',
    name: '덕수궁',
    center: {
      lat: 37.5658,
      lng: 126.9751,
      name: '덕수궁 정문(대한문)',
      description: '대한제국의 궁궐'
    },
    pois: [
      { lat: 37.5658, lng: 126.9751, name: '대한문', description: '덕수궁 정문' },
      { lat: 37.5665, lng: 126.9748, name: '중화전', description: '정전' },
      { lat: 37.5670, lng: 126.9745, name: '즉조당', description: '편전' },
      { lat: 37.5672, lng: 126.9740, name: '석조전', description: '서양식 건물' },
      { lat: 37.5668, lng: 126.9735, name: '정관헌', description: '러시아풍 건물' }
    ]
  },
  
  '창경궁': {
    id: 'changgyeonggung',
    name: '창경궁',
    center: {
      lat: 37.5826,
      lng: 126.9946,
      name: '창경궁 정문(홍화문)',
      description: '조선왕조의 이궁'
    },
    pois: [
      { lat: 37.5826, lng: 126.9946, name: '홍화문', description: '창경궁 정문' },
      { lat: 37.5833, lng: 126.9951, name: '명정전', description: '정전' },
      { lat: 37.5838, lng: 126.9955, name: '문정전', description: '편전' },
      { lat: 37.5842, lng: 126.9960, name: '환경전', description: '침전' },
      { lat: 37.5845, lng: 126.9965, name: '통명전', description: '침전' }
    ]
  },
  
  '종묘': {
    id: 'jongmyo',
    name: '종묘',
    center: {
      lat: 37.5744,
      lng: 126.9944,
      name: '종묘 정문',
      description: '조선왕조 왕과 왕비의 신주를 모신 사당'
    },
    pois: [
      { lat: 37.5744, lng: 126.9944, name: '종묘 정문', description: '종묘 입구' },
      { lat: 37.5750, lng: 126.9950, name: '정전', description: '태조부터 순종까지 19왕 30왕비 신주' },
      { lat: 37.5755, lng: 126.9955, name: '영녕전', description: '추존왕과 왕비 신주' },
      { lat: 37.5748, lng: 126.9940, name: '공민왕신당', description: '고려 공민왕 신당' }
    ]
  },
  
  'N서울타워': {
    id: 'nseoultower',
    name: 'N서울타워',
    center: {
      lat: 37.5512,
      lng: 126.9882,
      name: 'N서울타워',
      description: '서울의 랜드마크 타워'
    },
    pois: [
      { lat: 37.5512, lng: 126.9882, name: 'N서울타워 전망대', description: '서울 시내 전경' },
      { lat: 37.5510, lng: 126.9880, name: '사랑의 자물쇠', description: '연인들의 약속 장소' },
      { lat: 37.5515, lng: 126.9885, name: '케이블카 승강장', description: '남산 케이블카' },
      { lat: 37.5508, lng: 126.9875, name: '남산 팔각정', description: '전통 정자' }
    ]
  },
  
  '명동': {
    id: 'myeongdong',
    name: '명동',
    center: {
      lat: 37.5636,
      lng: 126.9834,
      name: '명동 중심가',
      description: '서울의 대표 쇼핑 거리'
    },
    pois: [
      { lat: 37.5636, lng: 126.9834, name: '명동 중심가', description: '쇼핑의 메카' },
      { lat: 37.5640, lng: 126.9830, name: '명동성당', description: '한국 천주교 중심지' },
      { lat: 37.5632, lng: 126.9838, name: '롯데백화점', description: '대형 쇼핑몰' },
      { lat: 37.5628, lng: 126.9840, name: '명동 먹자골목', description: '다양한 음식점' }
    ]
  },
  
  '동대문': {
    id: 'dongdaemun',
    name: '동대문',
    center: {
      lat: 37.5703,
      lng: 127.0094,
      name: '동대문 흥인지문',
      description: '조선시대 한양도성의 동쪽 대문'
    },
    pois: [
      { lat: 37.5703, lng: 127.0094, name: '흥인지문', description: '동대문, 보물 제1호' },
      { lat: 37.5708, lng: 127.0098, name: '동대문 디자인플라자', description: 'DDP, 현대적 건축물' },
      { lat: 37.5700, lng: 127.0090, name: '동대문 패션타운', description: '24시간 쇼핑' },
      { lat: 37.5695, lng: 127.0085, name: '청계천', description: '도심 속 하천' }
    ]
  },
  
  '북촌한옥마을': {
    id: 'bukchon',
    name: '북촌한옥마을',
    center: {
      lat: 37.5814,
      lng: 126.9831,
      name: '북촌 8경',
      description: '전통 한옥이 잘 보존된 마을'
    },
    pois: [
      { lat: 37.5814, lng: 126.9831, name: '북촌 8경', description: '가장 유명한 뷰포인트' },
      { lat: 37.5820, lng: 126.9835, name: '북촌 5경', description: '한옥 지붕 전경' },
      { lat: 37.5810, lng: 126.9825, name: '북촌 6경', description: '돌담길' },
      { lat: 37.5825, lng: 126.9840, name: '북촌문화센터', description: '한옥 문화 체험' },
      { lat: 37.5805, lng: 126.9820, name: '가회동 먹자골목', description: '전통 음식점' }
    ]
  },
  
  '인사동': {
    id: 'insadong',
    name: '인사동',
    center: {
      lat: 37.5759,
      lng: 126.9859,
      name: '인사동 중심가',
      description: '전통 문화의 거리'
    },
    pois: [
      { lat: 37.5759, lng: 126.9859, name: '인사동길', description: '전통 문화거리' },
      { lat: 37.5765, lng: 126.9855, name: '쌈지길', description: '나선형 쇼핑몰' },
      { lat: 37.5755, lng: 126.9863, name: '조계사', description: '한국 불교 중심 사찰' },
      { lat: 37.5750, lng: 126.9850, name: '인사동 전통찻집', description: '전통차 체험' },
      { lat: 37.5770, lng: 126.9865, name: '인사동 골동품 거리', description: '전통 공예품' }
    ]
  }
};

// 위치명으로 좌표 찾기
export function getLocationCoordinates(locationName: string): TourLocation | null {
  // 정확한 매치 먼저 시도
  const exactMatch = TOUR_LOCATIONS[locationName];
  if (exactMatch) return exactMatch;
  
  // 부분 매치 시도
  const partialMatch = Object.values(TOUR_LOCATIONS).find(location => 
    location.name.includes(locationName) || locationName.includes(location.name)
  );
  
  return partialMatch || null;
}

// 기본 서울 중심 좌표 (매치되는 위치가 없을 때)
export const DEFAULT_SEOUL_CENTER = {
  lat: 37.5665,
  lng: 126.9780,
  name: '서울 중심가'
};