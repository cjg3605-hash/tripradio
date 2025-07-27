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
      lat: 37.579617,
      lng: 126.977041,
      name: '광화문(경복궁 정문)',
      description: '조선왕조의 정궁 정문'
    },
    pois: [
      { lat: 37.579617, lng: 126.977041, name: '광화문', description: '경복궁의 정문, 대한민국 상징' },
      { lat: 37.580394, lng: 126.976435, name: '흥례문', description: '경복궁 제2문, 조선시대 궁궐의 첫 관문' },
      { lat: 37.580470, lng: 126.976089, name: '근정문', description: '근정전 앞 문' },
      { lat: 37.580839, lng: 126.976089, name: '근정전', description: '경복궁 정전, 조선 왕의 즉위식과 중요 국정 처리' },
      { lat: 37.581230, lng: 126.975800, name: '사정전', description: '왕의 편전, 일상적인 정무 처리' },
      { lat: 37.581650, lng: 126.975200, name: '강녕전', description: '왕의 침전' },
      { lat: 37.581890, lng: 126.974800, name: '교태전', description: '왕비의 침전' },
      { lat: 37.582150, lng: 126.974500, name: '자경전', description: '대비전, 대왕대비 거처' },
      { lat: 37.582456, lng: 126.974103, name: '향원정', description: '경회루 북쪽 향원지 연못 속 정자' },
      { lat: 37.581234, lng: 126.975456, name: '경회루', description: '연못 위의 누각, 연회와 외교 장소' }
    ]
  },
  
  '창덕궁': {
    id: 'changdeokgung',
    name: '창덕궁',
    center: {
      lat: 37.579412,
      lng: 126.991312,
      name: '돈화문(창덕궁 정문)',
      description: '유네스코 세계문화유산, 조선왕조 이궁'
    },
    pois: [
      { lat: 37.579412, lng: 126.991312, name: '돈화문', description: '창덕궁 정문, 현존하는 가장 오래된 궁궐 정문' },
      { lat: 37.580134, lng: 126.991789, name: '인정전', description: '창덕궁 정전, 조선 후기 정치의 중심' },
      { lat: 37.580456, lng: 126.992123, name: '선정전', description: '편전, 왕의 일상 정무 처리' },
      { lat: 37.580789, lng: 126.992456, name: '희정당', description: '왕의 침전, 조선 후기 왕실 생활 공간' },
      { lat: 37.581234, lng: 126.992890, name: '대조전', description: '왕비의 침전' },
      { lat: 37.582456, lng: 126.994012, name: '후원(비원)', description: '한국 전통 정원의 백미, 자연과 조화' },
      { lat: 37.582890, lng: 126.994456, name: '부용지', description: '후원의 대표적 연못, 부용정과 어우러진 절경' },
      { lat: 37.583123, lng: 126.994789, name: '애련지', description: '후원 내 작은 연못, 애련정 위치' }
    ]
  },
  
  '덕수궁': {
    id: 'deoksugung',
    name: '덕수궁',
    center: {
      lat: 37.565834,
      lng: 126.975123,
      name: '대한문(덕수궁 정문)',
      description: '대한제국의 궁궐, 근현대사의 중심지'
    },
    pois: [
      { lat: 37.565834, lng: 126.975123, name: '대한문', description: '덕수궁 정문, 대한제국 황궁의 위엄' },
      { lat: 37.566456, lng: 126.974789, name: '중화전', description: '덕수궁 정전, 대한제국 황제의 즉위식 장소' },
      { lat: 37.566789, lng: 126.974456, name: '즉조당', description: '편전, 고종황제의 집무실' },
      { lat: 37.567123, lng: 126.973890, name: '석조전', description: '한국 최초 서양식 궁궐 건물, 네오클래식 양식' },
      { lat: 37.566890, lng: 126.973456, name: '정관헌', description: '러시아 건축가 설계, 황실 휴식 공간' },
      { lat: 37.566234, lng: 126.974234, name: '함녕전', description: '고종황제의 침전' }
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
      lat: 37.551169,
      lng: 126.988227,
      name: 'N서울타워',
      description: '서울의 대표 랜드마크, 남산 정상의 타워'
    },
    pois: [
      { lat: 37.551169, lng: 126.988227, name: 'N서울타워 전망대', description: '서울 전경 360도 조망, 높이 236m' },
      { lat: 37.551034, lng: 126.987989, name: '사랑의 자물쇠', description: '연인들의 영원한 사랑 약속 장소' },
      { lat: 37.550789, lng: 126.987456, name: '남산 케이블카 정상역', description: '남산 케이블카 종점, 타워 접근로' },
      { lat: 37.550456, lng: 126.987123, name: '남산 팔각정', description: '한국 전통 정자, 서울 시내 조망 포인트' },
      { lat: 37.551456, lng: 126.988567, name: 'N타워 플라자', description: '타워 입구 상업 시설' },
      { lat: 37.550234, lng: 126.986789, name: '남산 봉수대', description: '조선시대 봉수대 터, 역사적 의미' }
    ]
  },
  
  '명동': {
    id: 'myeongdong',
    name: '명동',
    center: {
      lat: 37.563692,
      lng: 126.983417,
      name: '명동 중심가',
      description: '서울 대표 쇼핑·관광 특구'
    },
    pois: [
      { lat: 37.563692, lng: 126.983417, name: '명동 중심가', description: '한국 최대 쇼핑 관광지, 화장품·패션 메카' },
      { lat: 37.564012, lng: 126.982987, name: '명동성당', description: '한국 천주교 대성당, 고딕 양식 건축의 걸작' },
      { lat: 37.563234, lng: 126.983789, name: '롯데백화점 본점', description: '명동 대표 백화점, 면세점 운영' },
      { lat: 37.562890, lng: 126.984123, name: '명동 먹자골목', description: '한국 전통 길거리 음식 체험' },
      { lat: 37.564456, lng: 126.983456, name: '명동예술극장', description: '공연예술의 메카, 문화 복합 공간' },
      { lat: 37.563456, lng: 126.982456, name: '을지로입구역', description: '지하철 2호선, 명동 접근의 관문' }
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
      lat: 37.581423,
      lng: 126.983089,
      name: '북촌 8경',
      description: '조선시대 한옥이 살아 숨쉬는 전통 마을'
    },
    pois: [
      { lat: 37.581423, lng: 126.983089, name: '북촌 8경', description: '북촌 최고 뷰포인트, 한옥마을 전경과 N서울타워 조망' },
      { lat: 37.582012, lng: 126.983456, name: '북촌 5경', description: '한옥 기와지붕의 아름다운 곡선미 감상' },
      { lat: 37.581012, lng: 126.982567, name: '북촌 6경', description: '돌담길과 한옥의 조화, 전통 골목길 정취' },
      { lat: 37.582456, lng: 126.984012, name: '북촌문화센터', description: '한옥 문화 체험관, 전통 공예 체험' },
      { lat: 37.580567, lng: 126.982012, name: '가회동 먹자골목', description: '전통 한식과 분위기 있는 찻집' },
      { lat: 37.581789, lng: 126.983678, name: '북촌 1경', description: '창덕궁 돌담길, 궁궐과 한옥의 만남' },
      { lat: 37.580890, lng: 126.982890, name: '북촌 2경', description: '원서동 공방거리, 전통 공예 작업실' }
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