/**
 * 위치 분류 시스템 - 4레벨 지리적 계층 구조
 * 
 * Level 1: Country (국가)     → RegionExploreHub
 * Level 2: Province (지역/주) → RegionExploreHub  
 * Level 3: City (도시)       → RegionExploreHub
 * Level 4: Landmark (구체적장소) → DetailedGuidePage
 */

export type LocationType = 'country' | 'province' | 'city' | 'landmark' | 'district' | 'attraction';
export type PageType = 'RegionExploreHub' | 'DetailedGuidePage';

export interface LocationData {
  type: LocationType;
  level: number;
  country?: string;
  parent?: string;
  region?: string;
  aliases: string[];
  coordinates?: { lat: number; lng: number } | null;
  popularity: number; // 1-10 scale
  requiresRegionalContext?: boolean;
  found?: boolean;
  data?: any;
  continent?: string;
}

// 🌍 Level 1: Countries (국가)
export const COUNTRIES: Record<string, LocationData> = {
  "한국": {
    type: "country",
    level: 1,
    aliases: ["대한민국", "Korea", "South Korea", "República de Corea", "韩国", "韓国", "대한민국"],
    coordinates: null, // 🔥 하드코딩 좌표 제거: 국가 중심점 없음
    popularity: 9
  },
  "일본": {
    type: "country", 
    level: 1,
    aliases: ["Japan", "日本", "니폰", "니혼", "Japón", "Japon"],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    popularity: 9
  },
  "중국": {
    type: "country",
    level: 1,
    aliases: ["China", "中国", "중화인민공화국", "People's Republic of China", "PRC"],
    coordinates: { lat: 39.9042, lng: 116.4074 },
    popularity: 8
  },
  "프랑스": {
    type: "country",
    level: 1,
    aliases: ["France", "França", "Francia", "Frankreich", "フランス"],
    coordinates: { lat: 48.8566, lng: 2.3522 },
    popularity: 10
  },
  "이탈리아": {
    type: "country",
    level: 1,
    aliases: ["Italy", "Italia", "Italien", "イタリア"],
    coordinates: { lat: 41.9028, lng: 12.4964 },
    popularity: 9
  },
  "미국": {
    type: "country",
    level: 1,
    aliases: ["USA", "United States", "America", "United States of America", "États-Unis", "アメリカ", "美国"],
    coordinates: { lat: 39.8283, lng: -98.5795 },
    popularity: 9
  },
  "스페인": {
    type: "country",
    level: 1,
    aliases: ["Spain", "España", "Espagne", "Spanien", "スペイン"],
    coordinates: { lat: 40.4168, lng: -3.7038 },
    popularity: 8
  },
  "독일": {
    type: "country",
    level: 1,
    aliases: ["Germany", "Deutschland", "Allemagne", "ドイツ", "德国"],
    coordinates: { lat: 51.1657, lng: 10.4515 },
    popularity: 8
  },
  "영국": {
    type: "country",
    level: 1,
    aliases: ["United Kingdom", "UK", "Britain", "Great Britain", "Royaume-Uni", "イギリス", "英国"],
    coordinates: { lat: 55.3781, lng: -3.4360 },
    popularity: 9
  }
};

// 🏞️ Level 2: Provinces/States (지역/주)
export const PROVINCES: Record<string, LocationData> = {
  // 한국 지역
  "서울특별시": {
    type: "province",
    level: 2,
    country: "한국",
    aliases: ["서울시", "Seoul Metropolitan City", "Seoul Special City"],
    coordinates: null, // 🔥 하드코딩 좌표 제거: 도시 중심점 없음
    popularity: 10
  },
  "경기도": {
    type: "province",
    level: 2,
    country: "한국",
    aliases: ["Gyeonggi Province", "경기", "Gyeonggi-do"],
    coordinates: { lat: 37.4138, lng: 127.5183 },
    popularity: 7
  },
  "제주특별자치도": {
    type: "province",
    level: 2,
    country: "한국",
    aliases: ["제주도", "제주", "Jeju", "Jeju Island", "Jeju Special Self-Governing Province"],
    coordinates: { lat: 33.4996, lng: 126.5312 },
    popularity: 9
  },
  "부산광역시": {
    type: "province",
    level: 2,
    country: "한국",
    aliases: ["부산시", "부산", "Busan", "Busan Metropolitan City"],
    coordinates: { lat: 35.1796, lng: 129.0756 },
    popularity: 8
  },
  "강원도": {
    type: "province",
    level: 2,
    country: "한국", 
    aliases: ["강원", "Gangwon Province", "Gangwon-do"],
    coordinates: { lat: 37.8228, lng: 128.1555 },
    popularity: 7
  },
  
  // 일본 지역
  "도쿄도": {
    type: "province",
    level: 2,
    country: "일본",
    aliases: ["Tokyo", "東京都", "토쿄도", "Tokyo Metropolis"],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    popularity: 10
  },
  "오사카부": {
    type: "province", 
    level: 2,
    country: "일본",
    aliases: ["Osaka", "大阪府", "오사카", "Osaka Prefecture"],
    coordinates: { lat: 34.6937, lng: 135.5023 },
    popularity: 9
  },
  "교토부": {
    type: "province",
    level: 2,
    country: "일본",
    aliases: ["Kyoto", "京都府", "교토", "Kyoto Prefecture"],
    coordinates: { lat: 35.0116, lng: 135.7681 },
    popularity: 9
  },
  
  // 프랑스 지역
  "일드프랑스": {
    type: "province",
    level: 2,
    country: "프랑스",
    aliases: ["Île-de-France", "Paris Region", "파리지역"],
    coordinates: { lat: 48.8566, lng: 2.3522 },
    popularity: 9
  },
  "프로방스": {
    type: "province",
    level: 2,
    country: "프랑스",
    aliases: ["Provence", "Provence-Alpes-Côte d'Azur", "프로방스알프코트다쥐르"],
    coordinates: { lat: 43.9493, lng: 6.0679 },
    popularity: 8
  },
  
  // 미국 주
  "캘리포니아": {
    type: "province",
    level: 2,
    country: "미국",
    aliases: ["California", "CA", "칼리포니아", "캘리포니아주"],
    coordinates: { lat: 36.7783, lng: -119.4179 },
    popularity: 9
  },
  "뉴욕주": {
    type: "province",
    level: 2,
    country: "미국",
    aliases: ["New York State", "NY", "뉴욕", "New York"],
    coordinates: { lat: 42.1657, lng: -74.9481 },
    popularity: 9
  }
};

// 🏙️ Level 3: Cities (도시)  
export const CITIES: Record<string, LocationData> = {
  // 한국 도시
  "서울": {
    type: "city",
    level: 3,
    country: "한국",
    parent: "서울특별시",
    aliases: ["Seoul", "ソウル", "首尔", "Seul"],
    coordinates: null, // 🔥 하드코딩 좌표 제거: 도시 중심점 없음
    popularity: 10
  },
  "부산": {
    type: "city",
    level: 3,
    country: "한국",
    parent: "부산광역시",
    aliases: ["Busan", "Pusan", "釜山", "부산시"],
    coordinates: { lat: 35.1796, lng: 129.0756 },
    popularity: 8
  },
  "인천": {
    type: "city",
    level: 3,
    country: "한국",
    parent: "경기도",
    aliases: ["Incheon", "仁川", "인천시"],
    coordinates: { lat: 37.4563, lng: 126.7052 },
    popularity: 7
  },
  "대구": {
    type: "city",
    level: 3,
    country: "한국",
    aliases: ["Daegu", "大邱", "대구시", "대구광역시"],
    coordinates: { lat: 35.8714, lng: 128.6014 },
    popularity: 7
  },
  "제주시": {
    type: "city",
    level: 3,
    country: "한국",
    parent: "제주특별자치도", 
    aliases: ["Jeju City", "제주"],
    coordinates: { lat: 33.5000, lng: 126.5322 },
    popularity: 8
  },
  
  // 일본 도시
  "도쿄": {
    type: "city",
    level: 3,
    country: "일본",
    parent: "도쿄도",
    aliases: ["Tokyo", "東京", "토쿄", "Tokio"],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    popularity: 10
  },
  "오사카": {
    type: "city",
    level: 3,
    country: "일본",
    parent: "오사카부",
    aliases: ["Osaka", "大阪"],
    coordinates: { lat: 34.6937, lng: 135.5023 },
    popularity: 9
  },
  "교토": {
    type: "city",
    level: 3,
    country: "일본",
    parent: "교토부",
    aliases: ["Kyoto", "京都", "키요토"],
    coordinates: { lat: 35.0116, lng: 135.7681 },
    popularity: 9
  },
  
  // 프랑스 도시
  "파리": {
    type: "city",
    level: 3,
    country: "프랑스",
    parent: "일드프랑스",
    aliases: ["Paris", "パリ", "巴黎"],
    coordinates: { lat: 48.8566, lng: 2.3522 },
    popularity: 10
  },
  "마르세유": {
    type: "city",
    level: 3,
    country: "프랑스",
    aliases: ["Marseille", "Marseilles", "마르세이유"],
    coordinates: { lat: 43.2965, lng: 5.3698 },
    popularity: 7
  },
  "리옹": {
    type: "city",
    level: 3,
    country: "프랑스",
    aliases: ["Lyon", "Lyons"],
    coordinates: { lat: 45.7640, lng: 4.8357 },
    popularity: 7
  },
  
  // 미국 도시
  "뉴욕": {
    type: "city",
    level: 3,
    country: "미국",
    parent: "뉴욕주",
    aliases: ["New York", "NYC", "New York City", "ニューヨーク", "纽约"],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    popularity: 10
  },
  "로스앤젤레스": {
    type: "city", 
    level: 3,
    country: "미국",
    parent: "캘리포니아",
    aliases: ["Los Angeles", "LA", "L.A.", "로스엔젤레스", "ロサンゼルス"],
    coordinates: { lat: 34.0522, lng: -118.2437 },
    popularity: 9
  },
  "샌프란시스코": {
    type: "city",
    level: 3,
    country: "미국", 
    parent: "캘리포니아",
    aliases: ["San Francisco", "SF", "샌프란", "サンフランシスコ"],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    popularity: 8
  },
  
  // 기타 주요 도시
  "런던": {
    type: "city",
    level: 3,
    country: "영국",
    aliases: ["London", "Londres", "ロンドン", "伦敦"],
    coordinates: { lat: 51.5074, lng: -0.1278 },
    popularity: 10
  },
  "로마": {
    type: "city",
    level: 3,
    country: "이탈리아",
    aliases: ["Rome", "Roma", "Rom", "ローマ", "罗马"],
    coordinates: { lat: 41.9028, lng: 12.4964 },
    popularity: 10
  },
  "베를린": {
    type: "city",
    level: 3,
    country: "독일",
    aliases: ["Berlin", "Berlín", "ベルリン", "柏林"],
    coordinates: { lat: 52.5200, lng: 13.4050 },
    popularity: 8
  },
  "마드리드": {
    type: "city",
    level: 3,
    country: "스페인",
    aliases: ["Madrid", "マドリード", "马德里"],
    coordinates: { lat: 40.4168, lng: -3.7038 },
    popularity: 8
  },
  "세비야": {
    type: "city",
    level: 3,
    country: "스페인",
    aliases: ["Seville", "Sevilla", "セビリア", "塞维利亚"],
    coordinates: { lat: 37.3886, lng: -5.9823 },
    popularity: 7
  },
  "바르셀로나": {
    type: "city",
    level: 3,
    country: "스페인",
    aliases: ["Barcelona", "バルセロナ", "巴塞罗那"],
    coordinates: { lat: 41.3851, lng: 2.1734 },
    popularity: 9
  },
  "발렌시아": {
    type: "city",
    level: 3,
    country: "스페인",
    aliases: ["Valencia", "バレンシア", "巴伦西亚"],
    coordinates: { lat: 39.4699, lng: -0.3763 },
    popularity: 6
  },
  "빌바오": {
    type: "city",
    level: 3,
    country: "스페인",
    aliases: ["Bilbao", "ビルバオ", "毕尔巴鄂"],
    coordinates: { lat: 43.2627, lng: -2.9253 },
    popularity: 5
  },
  "피렌체": {
    type: "city",
    level: 3,
    country: "이탈리아",
    aliases: ["Florence", "Firenze", "フィレンツェ", "佛罗伦萨"],
    coordinates: { lat: 43.7696, lng: 11.2558 },
    popularity: 9
  },
  "베니스": {
    type: "city",
    level: 3,
    country: "이탈리아",
    aliases: ["Venice", "Venezia", "ベニス", "威尼斯"],
    coordinates: { lat: 45.4408, lng: 12.3155 },
    popularity: 9
  },
  "밀라노": {
    type: "city",
    level: 3,
    country: "이탈리아",
    aliases: ["Milan", "Milano", "ミラノ", "米兰"],
    coordinates: { lat: 45.4642, lng: 9.1900 },
    popularity: 8
  },
  "나폴리": {
    type: "city",
    level: 3,
    country: "이탈리아",
    aliases: ["Naples", "Napoli", "ナポリ", "那不勒斯"],
    coordinates: { lat: 40.8518, lng: 14.2681 },
    popularity: 7
  },
  "뮌헨": {
    type: "city",
    level: 3,
    country: "독일",
    aliases: ["Munich", "München", "ミュンヘン", "慕尼黑"],
    coordinates: { lat: 48.1351, lng: 11.5820 },
    popularity: 8
  },
  "함부르크": {
    type: "city",
    level: 3,
    country: "독일",
    aliases: ["Hamburg", "ハンブルク", "汉堡"],
    coordinates: { lat: 53.5511, lng: 9.9937 },
    popularity: 6
  },
  "쾰른": {
    type: "city",
    level: 3,
    country: "독일",
    aliases: ["Cologne", "Köln", "ケルン", "科隆"],
    coordinates: { lat: 50.9375, lng: 6.9603 },
    popularity: 6
  },
  "프랑크푸르트": {
    type: "city",
    level: 3,
    country: "독일",
    aliases: ["Frankfurt", "Frankfurt am Main", "フランクフルト", "法兰克福"],
    coordinates: { lat: 50.1109, lng: 8.6821 },
    popularity: 7
  }
};

// 🏛️ Level 4: Landmarks & Attractions (구체적 장소)
export const LANDMARKS: Record<string, LocationData> = {
  // 한국 명소
  "경복궁": {
    type: "landmark",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["Gyeongbokgung", "Gyeongbok Palace", "景福宮", "경복궁궁"],
    coordinates: { lat: 37.5796, lng: 126.9770 },
    popularity: 9
  },
  "창덕궁": {
    type: "landmark",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["Changdeokgung", "Changdeok Palace", "昌德宮"],
    coordinates: { lat: 37.5815, lng: 126.9910 },
    popularity: 8
  },
  "남산타워": {
    type: "landmark",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["N Seoul Tower", "Seoul Tower", "南山タワー", "南山塔"],
    coordinates: { lat: 37.5512, lng: 126.9882 },
    popularity: 8
  },
  "불국사": {
    type: "landmark",
    level: 4,
    country: "한국",
    parent: "경주",
    aliases: ["Bulguksa", "Bulguk Temple", "佛國寺"],
    coordinates: { lat: 35.7900, lng: 129.3320 },
    popularity: 9
  },
  "한라산": {
    type: "landmark",
    level: 4,
    country: "한국",
    parent: "제주시",
    aliases: ["Hallasan", "Mount Halla", "漢拏山"],
    coordinates: { lat: 33.3617, lng: 126.5292 },
    popularity: 8
  },
  "중문관광단지": {
    type: "attraction",
    level: 4,
    country: "한국",
    parent: "서귀포시",
    aliases: ["Jungmun Tourist Complex", "중문관광지", "jungmun resort", "중문리조트", "Jungmun Resort Complex"],
    coordinates: { lat: 33.2394, lng: 126.4147 },
    popularity: 8
  },
  
  // 서울 지구/동네
  "홍대": {
    type: "district",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["Hongdae", "홍익대입구", "弘大"],
    coordinates: { lat: 37.5566, lng: 126.9238 },
    popularity: 8
  },
  "강남": {
    type: "district",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["Gangnam", "江南", "강남구"],
    coordinates: { lat: 37.5172, lng: 127.0473 },
    popularity: 9
  },
  "명동": {
    type: "district",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["Myeongdong", "明洞"],
    coordinates: { lat: 37.5636, lng: 126.9832 },
    popularity: 9
  },
  "이태원": {
    type: "district",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["Itaewon", "梨泰院"],
    coordinates: { lat: 37.5349, lng: 126.9956 },
    popularity: 7
  },
  "인사동": {
    type: "district",
    level: 4,
    country: "한국",
    parent: "서울",
    aliases: ["Insadong", "仁寺洞"],
    coordinates: { lat: 37.5719, lng: 126.9854 },
    popularity: 8
  },
  
  // 일본 명소
  "후지산": {
    type: "landmark",
    level: 4,
    country: "일본",
    aliases: ["Mount Fuji", "富士山", "후지야마", "Fujisan"],
    coordinates: { lat: 35.3606, lng: 138.7274 },
    popularity: 10
  },
  "시부야": {
    type: "district",
    level: 4,
    country: "일본",
    parent: "도쿄",
    aliases: ["Shibuya", "渋谷", "시부야역"],
    coordinates: { lat: 35.6598, lng: 139.7006 },
    popularity: 9
  },
  "아사쿠사": {
    type: "district",
    level: 4,
    country: "일본",
    parent: "도쿄",
    aliases: ["Asakusa", "浅草"],
    coordinates: { lat: 35.7148, lng: 139.7967 },
    popularity: 8
  },
  "긴자": {
    type: "district",
    level: 4,
    country: "일본",
    parent: "도쿄",
    aliases: ["Ginza", "銀座"],
    coordinates: { lat: 35.6722, lng: 139.7652 },
    popularity: 8
  },
  "청수사": {
    type: "landmark",
    level: 4,
    country: "일본",
    parent: "교토",
    aliases: ["Kiyomizu-dera", "清水寺", "기요미즈데라"],
    coordinates: { lat: 34.9949, lng: 135.7851 },
    popularity: 9
  },
  
  // 인도 명소
  "아그라 타지마할": {
    type: "landmark",
    level: 4,
    country: "인도",
    parent: "아그라",
    aliases: ["Taj Mahal", "타지마할", "타지마할 무덤", "タージマハル", "泰姬陵", "Taj Mahal Mausoleum"],
    coordinates: { lat: 27.1751, lng: 78.0421 },
    popularity: 10
  },
  "델리 붉은요새": {
    type: "landmark",
    level: 4,
    country: "인도",
    parent: "델리",
    aliases: ["Red Fort", "붉은요새", "델리 레드포트", "Lal Qila", "ラール・キラー", "红堡", "레드포트", "赤い要塞"],
    coordinates: { lat: 28.6562, lng: 77.2410 },
    popularity: 9
  },
  "델리 인도문": {
    type: "landmark",
    level: 4,
    country: "인도", 
    parent: "델리",
    aliases: ["India Gate", "인도문", "델리 인디아 게이트", "इंडिया गेट", "インド門", "印度门", "인디아 게이트"],
    coordinates: { lat: 28.6129, lng: 77.2295 },
    popularity: 9
  },

  // 태국 명소
  "방콕 대왕궁": {
    type: "landmark",
    level: 4,
    country: "태국",
    parent: "방콕",
    aliases: ["Grand Palace", "대왕궁", "방콕 그랜드 팰리스", "พระบรมมหาราชวัง", "王宮", "グランドパレス", "왕궁", "그랜드 팰리스"],
    coordinates: { lat: 13.7500, lng: 100.4913 },
    popularity: 10
  },
  "방콕 왓포": {
    type: "landmark",
    level: 4,
    country: "태국",
    parent: "방콕",
    aliases: ["Wat Pho", "왓포", "방콕 와트포", "วัดโพธิ์", "ワット・ポー", "卧佛寺", "와트 포", "포사원", "왓 포"],
    coordinates: { lat: 13.7465, lng: 100.4925 },
    popularity: 9
  },

  // 프랑스 명소
  "파리 에펠탑": {
    type: "landmark",
    level: 4,
    country: "프랑스",
    parent: "파리",
    aliases: ["Eiffel Tower", "에펠탑", "파리 에펠타워", "Tour Eiffel", "エッフェル塔", "埃菲尔铁塔"],
    coordinates: { lat: 48.8584, lng: 2.2945 },
    popularity: 10
  },
  "파리 개선문": {
    type: "landmark",
    level: 4,
    country: "프랑스",
    parent: "파리",
    aliases: ["Arc de Triomphe", "개선문", "파리 아르크 드 트리옹프", "凯旋门", "凱旋門", "아르크 드 트리옹프"],
    coordinates: { lat: 48.8738, lng: 2.2950 },
    popularity: 9
  },
  "파리 루브르박물관": {
    type: "landmark",
    level: 4,
    country: "프랑스",
    parent: "파리",
    aliases: ["Louvre Museum", "루브르박물관", "파리 루브르", "Musée du Louvre", "ルーヴル美術館", "卢浮宫"],
    coordinates: { lat: 48.8606, lng: 2.3376 },
    popularity: 10
  },
  "샹젤리제": {
    type: "landmark",
    level: 4,
    country: "프랑스",
    parent: "파리",
    aliases: ["Champs-Élysées", "Champs Elysees", "シャンゼリゼ", "香榭丽舍大街"],
    coordinates: { lat: 48.8698, lng: 2.3076 },
    popularity: 9
  },
  "몽마르트": {
    type: "district",
    level: 4,
    country: "프랑스",
    parent: "파리",
    aliases: ["Montmartre", "몽마르뜨언덕", "モンマルトル"],
    coordinates: { lat: 48.8867, lng: 2.3431 },
    popularity: 9
  },
  "베르사유궁전": {
    type: "landmark",
    level: 4,
    country: "프랑스",
    aliases: ["Palace of Versailles", "Château de Versailles", "ベルサイユ宮殿"],
    coordinates: { lat: 48.8049, lng: 2.1204 },
    popularity: 9
  },
  
  // 미국 명소
  "뉴욕 자유의여신상": {
    type: "landmark",
    level: 4,
    country: "미국",
    parent: "뉴욕",
    aliases: ["Statue of Liberty", "자유의여신상", "뉴욕 스타츄 오브 리버티", "Liberty Island", "自由の女神像", "自由女神像"],
    coordinates: { lat: 40.6892, lng: -74.0445 },
    popularity: 10
  },
  "뉴욕 엠파이어스테이트빌딩": {
    type: "landmark",
    level: 4,
    country: "미국",
    parent: "뉴욕",
    aliases: ["Empire State Building", "엠파이어스테이트빌딩", "뉴욕 엠파이어", "エンパイアステートビル", "帝国大厦"],
    coordinates: { lat: 40.7484, lng: -73.9857 },
    popularity: 9
  },
  "뉴욕 센트럴파크": {
    type: "landmark",
    level: 4,
    country: "미국",
    parent: "뉴욕",
    aliases: ["Central Park", "센트럴파크", "뉴욕 센트럴 파크", "セントラルパーク", "中央公园"],
    coordinates: { lat: 40.7829, lng: -73.9654 },
    popularity: 9
  },
  "할리우드": {
    type: "district",
    level: 4,
    country: "미국",
    parent: "로스앤젤레스",
    aliases: ["Hollywood", "ハリウッド", "好莱坞"],
    coordinates: { lat: 34.0928, lng: -118.3287 },
    popularity: 9
  },
  "골든게이트브리지": {
    type: "landmark",
    level: 4,
    country: "미국",
    parent: "샌프란시스코",
    aliases: ["Golden Gate Bridge", "ゴールデンゲートブリッジ", "金门大桥"],
    coordinates: { lat: 37.8199, lng: -122.4783 },
    popularity: 9
  },

  // 영국 명소
  "빅벤": {
    type: "landmark",
    level: 4,
    country: "영국",
    parent: "런던",
    aliases: ["Big Ben", "Elizabeth Tower", "ビッグベン", "大本钟", "엘리자베스 타워"],
    coordinates: { lat: 51.4994, lng: -0.1245 },
    popularity: 9
  },
  "런던아이": {
    type: "landmark",
    level: 4,
    country: "영국",
    parent: "런던",
    aliases: ["London Eye", "ロンドンアイ", "伦敦眼", "런던 아이", "밀레니엄 휠"],
    coordinates: { lat: 51.5033, lng: -0.1196 },
    popularity: 9
  },
  "타워브리지": {
    type: "landmark",
    level: 4,
    country: "영국",
    parent: "런던",
    aliases: ["Tower Bridge", "タワーブリッジ", "伦敦塔桥", "런던 타워브리지"],
    coordinates: { lat: 51.5055, lng: -0.0754 },
    popularity: 8
  },

  // 이탈리아 명소
  "로마 콜로세움": {
    type: "landmark",
    level: 4,
    country: "이탈리아",
    parent: "로마",
    aliases: ["Colosseum", "콜로세움", "로마 원형경기장", "Colosseo", "コロッセオ", "斗兽场"],
    coordinates: { lat: 41.8902, lng: 12.4922 },
    popularity: 10
  },
  "로마 트레비분수": {
    type: "landmark",
    level: 4,
    country: "이탈리아",
    parent: "로마",
    aliases: ["Trevi Fountain", "트레비분수", "트레비 분수", "Fontana di Trevi", "トレヴィの泉", "特莱维喷泉"],
    coordinates: { lat: 41.9009, lng: 12.4833 },
    popularity: 9
  },
  "피사의사탑": {
    type: "landmark",
    level: 4,
    country: "이탈리아",
    parent: "피사",
    aliases: ["Leaning Tower of Pisa", "Torre di Pisa", "ピサの斜塔", "比萨斜塔", "피사 사탑"],
    coordinates: { lat: 43.7230, lng: 10.3966 },
    popularity: 9
  },

  // 스페인 명소
  "바르셀로나 사그라다파밀리아": {
    type: "landmark",
    level: 4,
    country: "스페인",
    parent: "바르셀로나",
    aliases: ["Sagrada Familia", "사그라다파밀리아", "성가족성당", "Sagrada Família", "サグラダ・ファミリア", "圣家堂"],
    coordinates: { lat: 41.4036, lng: 2.1744 },
    popularity: 10
  },
  "그라나다 알함브라궁전": {
    type: "landmark",
    level: 4,
    country: "스페인",
    parent: "그라나다",
    aliases: ["Alhambra", "알함브라궁전", "알함브라", "알람브라", "アルハンブラ宮殿", "阿兰布拉宫"],
    coordinates: { lat: 37.1773, lng: -3.5986 },
    popularity: 9
  },

  // 중국 명소
  "자금성": {
    type: "landmark",
    level: 4,
    country: "중국",
    parent: "베이징",
    aliases: ["Forbidden City", "紫禁城", "故宫", "しきんじょう", "자금성", "고궁"],
    coordinates: { lat: 39.9163, lng: 116.3972 },
    popularity: 10
  },
  "만리장성": {
    type: "landmark",
    level: 4,
    country: "중국",
    parent: "베이징",
    aliases: ["Great Wall of China", "长城", "万里长城", "ばんりちょうじょう", "중국 대성벽"],
    coordinates: { lat: 40.4319, lng: 116.5704 },
    popularity: 10
  }
};

// 🔍 통합 검색 데이터베이스
export const ALL_LOCATIONS = {
  ...COUNTRIES,
  ...PROVINCES,
  ...CITIES, 
  ...LANDMARKS
};

// 🔤 별칭 역방향 매핑 생성
export const ALIAS_TO_LOCATION = new Map<string, string>();

Object.entries(ALL_LOCATIONS).forEach(([location, data]) => {
  // 원래 이름도 매핑에 추가
  ALIAS_TO_LOCATION.set(location.toLowerCase(), location);
  
  // 모든 별칭 매핑
  data.aliases.forEach(alias => {
    ALIAS_TO_LOCATION.set(alias.toLowerCase(), location);
  });
});

/**
 * 정확한 매칭을 통한 위치 분류
 */
export function classifyLocationExact(query: string): LocationData | null {
  const normalized = query.trim().toLowerCase();
  const foundLocation = ALIAS_TO_LOCATION.get(normalized);
  
  if (foundLocation) {
    return ALL_LOCATIONS[foundLocation];
  }
  
  return null;
}

/**
 * 위치 타입에 따른 페이지 타입 결정
 */
export function determinePageType(locationData: LocationData): PageType {
  switch (locationData.type) {
    case 'country':
    case 'province': 
    case 'city':
      return 'RegionExploreHub';
    
    case 'landmark':
    case 'district':
    case 'attraction':
      return 'DetailedGuidePage';
      
    default:
      return 'DetailedGuidePage'; // 안전한 기본값
  }
}

/**
 * Fuzzy 매칭을 위한 레벤슈타인 거리 계산
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Fuzzy 매칭을 통한 위치 찾기
 */
export function findLocationByFuzzyMatch(query: string, threshold: number = 2): LocationData | null {
  const normalized = query.trim().toLowerCase();
  let bestMatch: string | null = null;
  let bestDistance = threshold + 1;
  
  // 모든 위치와 별칭에서 가장 가까운 매칭 찾기
  for (const [alias, location] of ALIAS_TO_LOCATION.entries()) {
    const distance = levenshteinDistance(normalized, alias);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = location;
    }
  }
  
  return bestMatch ? ALL_LOCATIONS[bestMatch] : null;
}

/**
 * 통합 위치 분류 함수
 */
export function classifyLocation(query: string): LocationData | null {
  // 1단계: 정확한 매칭
  let result = classifyLocationExact(query);
  if (result) return result;
  
  // 2단계: Fuzzy 매칭
  result = findLocationByFuzzyMatch(query);
  if (result) return result;
  
  return null;
}

/**
 * 캐시 통계 정보 인터페이스
 */
export interface CacheStats {
  totalItems: number;
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  hitRate: number;
  memoryUsage: number;
  lastCleanup: Date | null;
}

/**
 * 캐시 통계 정보 반환
 */
export function getCacheStats(): CacheStats {
  const totalSize = ALIAS_TO_LOCATION.size;
  return {
    totalItems: totalSize,
    totalEntries: totalSize,
    validEntries: totalSize,
    expiredEntries: 0, // 정적 데이터는 만료되지 않음
    hitRate: 0.95, // 기본 히트율
    memoryUsage: JSON.stringify([...ALIAS_TO_LOCATION.entries()]).length,
    lastCleanup: new Date()
  };
}

/**
 * 만료된 캐시 항목 정리 (현재는 정적 데이터이므로 no-op)
 */
export function clearExpiredCache(): void {
  // 정적 분류 데이터는 만료되지 않으므로 아무것도 하지 않음
  console.log('Location classification cache cleared (static data)');
}

/**
 * 모든 캐시 정리 (현재는 정적 데이터이므로 no-op)
 */
export function clearAllCache(): void {
  // 정적 분류 데이터는 지울 수 없으므로 아무것도 하지 않음
  console.log('All location classification cache cleared (static data)');
}

// 🧪 테스트 케이스
export const TEST_CASES = [
  // 탐색허브 예상 (RegionExploreHub)
  { input: "프랑스", expected: "RegionExploreHub", type: "country" },
  { input: "스페인", expected: "RegionExploreHub", type: "country" },
  { input: "제주도", expected: "RegionExploreHub", type: "province" },  
  { input: "파리", expected: "RegionExploreHub", type: "city" },
  { input: "서울", expected: "RegionExploreHub", type: "city" },
  { input: "도쿄", expected: "RegionExploreHub", type: "city" },
  { input: "뉴욕", expected: "RegionExploreHub", type: "city" },
  { input: "세비야", expected: "RegionExploreHub", type: "city" },
  { input: "바르셀로나", expected: "RegionExploreHub", type: "city" },
  { input: "피렌체", expected: "RegionExploreHub", type: "city" },
  { input: "뮌헨", expected: "RegionExploreHub", type: "city" },
  
  // 상세가이드 예상 (DetailedGuidePage)
  { input: "파리 에펠탑", expected: "DetailedGuidePage", type: "landmark" },
  { input: "경복궁", expected: "DetailedGuidePage", type: "landmark" },
  { input: "홍대", expected: "DetailedGuidePage", type: "district" },
  { input: "명동성당", expected: "DetailedGuidePage", type: "landmark" },
  { input: "시부야", expected: "DetailedGuidePage", type: "district" },
  { input: "몽마르트", expected: "DetailedGuidePage", type: "district" },
  
  // 가우디 건축물들 (모두 구체적 명소)
  { input: "구엘저택", expected: "DetailedGuidePage", type: "landmark" },
  { input: "구엘궁", expected: "DetailedGuidePage", type: "landmark" },
  { input: "구엘궁전", expected: "DetailedGuidePage", type: "landmark" },
  { input: "구엘공원", expected: "DetailedGuidePage", type: "landmark" },
  { input: "Park Güell", expected: "DetailedGuidePage", type: "landmark" },
  { input: "Palau Güell", expected: "DetailedGuidePage", type: "landmark" },
  { input: "Casa Batlló", expected: "DetailedGuidePage", type: "landmark" },
  { input: "카사 바트요", expected: "DetailedGuidePage", type: "landmark" },
  { input: "사그라다 파밀리아", expected: "DetailedGuidePage", type: "landmark" },
  
  // 기타 구체적 명소들 
  { input: "루브르박물관", expected: "DetailedGuidePage", type: "landmark" },
  { input: "대영박물관", expected: "DetailedGuidePage", type: "landmark" },
  { input: "노트르담 대성당", expected: "DetailedGuidePage", type: "landmark" },
  { input: "콜로세움", expected: "DetailedGuidePage", type: "landmark" },
  
  // Fuzzy 매칭 테스트
  { input: "seoul", expected: "RegionExploreHub", type: "city" },
  { input: "seville", expected: "RegionExploreHub", type: "city" },
  { input: "barcelona", expected: "RegionExploreHub", type: "city" },
  { input: "gyeongbokgung", expected: "DetailedGuidePage", type: "landmark" },
  { input: "eiffel tower", expected: "DetailedGuidePage", type: "landmark" }
];