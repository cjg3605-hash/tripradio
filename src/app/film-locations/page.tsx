'use client';

import Link from 'next/link';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
// 30개 영화/드라마 대규모 촬영지 데이터
const filmLocations = [
  // 한국 작품 (K-Drama & 영화)
  {
    title: '기생충',
    type: 'movie',
    year: 2019,
    genre: '스릴러',
    poster: '🏆',
    locations: [
      { name: '자하문터널', area: '서울 종로구', description: '반지하 집 외부 촬영지' },
      { name: '서울대 계단', area: '서울 관악구', description: '유명한 계단 씬 촬영지' },
      { name: '성북동 계단길', area: '서울 성북구', description: '메인 포스터 촬영지' }
    ],
    popularity: 95,
    difficulty: '쉬움',
    awards: '아카데미 작품상'
  },
  {
    title: '오징어 게임',
    type: 'drama',
    year: 2021,
    genre: '드라마',
    poster: '🦑',
    locations: [
      { name: '트라이보울', area: '인천 강화군', description: '유리구슬 게임 촬영지' },
      { name: '용유정거장', area: '인천 중구', description: '첫 번째 게임 이후 지하철역' },
      { name: '청량리역', area: '서울 동대문구', description: '시작 장면 지하철역' }
    ],
    popularity: 98,
    difficulty: '보통',
    awards: 'Netflix 최고 시청률'
  },
  {
    title: '사랑의 불시착',
    type: 'drama', 
    year: 2019,
    genre: '로맨스',
    poster: '🪂',
    locations: [
      { name: '시그리스빌', area: '스위스', description: '세리의 패러글라이딩 착륙 지점' },
      { name: '벌곡교', area: '경기 양평군', description: '로맨틱한 다리 씬' },
      { name: '북한산', area: '서울 은평구', description: '패러글라이딩 출발점' }
    ],
    popularity: 92,
    difficulty: '어려움',
    awards: '백상예술대상'
  },
  {
    title: '도깨비',
    type: 'drama',
    year: 2016,
    genre: '판타지',
    poster: '👹',
    locations: [
      { name: '덕수궁 돌담길', area: '서울 중구', description: '유명한 문이 나타나는 장소' },
      { name: '주문진해변', area: '강원 강릉시', description: '메밀꽃밭과 해변' },
      { name: '인천차이나타운', area: '인천 중구', description: '공유와 김고은 데이트' }
    ],
    popularity: 93,
    difficulty: '쉬움',
    awards: '대상 수상작'
  },
  {
    title: '태극기 휘날리며',
    type: 'movie',
    year: 2004,
    genre: '전쟁',
    poster: '🇰🇷',
    locations: [
      { name: '태백산맥', area: '강원 태백시', description: '전투 장면' },
      { name: '정선 아우라지', area: '강원 정선군', description: '형제의 고향' },
      { name: '서울역', area: '서울 용산구', description: '징집 장면' }
    ],
    popularity: 88,
    difficulty: '보통',
    awards: '청룡영화상 대상'
  },
  {
    title: '미나리',
    type: 'movie',
    year: 2020,
    genre: '드라마',
    poster: '🌿',
    locations: [
      { name: '털사', area: '오클라호마 주', description: '이민 가족의 농장' },
      { name: '아칸소', area: '아칸소 주', description: '주요 배경지' }
    ],
    popularity: 85,
    difficulty: '어려움',
    awards: '아카데미 여우조연상'
  },

  // 할리우드 블록버스터
  {
    title: '어벤져스',
    type: 'movie',
    year: 2012,
    genre: '액션',
    poster: '⚡',
    locations: [
      { name: '스타크 타워', area: '뉴욕 맨해튼', description: '아이언맨의 본거지' },
      { name: '중앙역', area: '뉴욕 맨해튼', description: '최종 결전 장면' },
      { name: '타임스퀘어', area: '뉴욕 맨해튼', description: '외계인 침공 장면' }
    ],
    popularity: 89,
    difficulty: '보통',
    awards: 'Marvel 시네마틱 유니버스'
  },
  {
    title: '인터스텔라',
    type: 'movie',
    year: 2014,
    genre: 'SF',
    poster: '🌌',
    locations: [
      { name: '아이슬란드 빙하', area: '아이슬란드', description: '얼음 행성 장면' },
      { name: '앨버타 평원', area: '캐나다', description: '옥수수밭 장면' },
      { name: '로스앤젤레스', area: '캘리포니아', description: 'NASA 본부' }
    ],
    popularity: 91,
    difficulty: '어려움',
    awards: '아카데미 시각효과상'
  },
  {
    title: '라라랜드',
    type: 'movie',
    year: 2016,
    genre: '뮤지컬',
    poster: '🎭',
    locations: [
      { name: '그리피스 천문대', area: '로스앤젤레스', description: '데이트 장면' },
      { name: '허모사 비치', area: '캘리포니아', description: '해변 댄스' },
      { name: '선셋 스트립', area: '할리우드', description: '재즈클럽' }
    ],
    popularity: 87,
    difficulty: '보통',
    awards: '아카데미 6개 부문'
  },
  {
    title: '토이 스토리',
    type: 'animation',
    year: 1995,
    genre: '애니메이션',
    poster: '🤠',
    locations: [
      { name: '픽사 스튜디오', area: '캘리포니아', description: '제작사 본사' },
      { name: '샌프란시스코', area: '캘리포니아', description: '도시 배경' }
    ],
    popularity: 86,
    difficulty: '쉬움',
    awards: '픽사 첫 장편'
  },

  // 유럽 명작들
  {
    title: '겨울왕국',
    type: 'animation',
    year: 2013,
    genre: '애니메이션',
    poster: '❄️',
    locations: [
      { name: '할슈타트', area: '오스트리아', description: '아렌델 왕국의 모티브' },
      { name: '베르겐', area: '노르웨이', description: '안나와 엘사의 고향 배경' },
      { name: '스톡홀름', area: '스웨덴', description: '성 내부 디자인 모티브' }
    ],
    popularity: 94,
    difficulty: '보통',
    awards: '디즈니 최고 흥행작'
  },
  {
    title: '해리포터: 마법사의 돌',
    type: 'movie',
    year: 2001,
    genre: '판타지',
    poster: '⚡',
    locations: [
      { name: '옥스퍼드 대학', area: '영국 옥스퍼드', description: '호그와트 내부' },
      { name: '앨닉 성', area: '영국 노섬벌랜드', description: '호그와트 외관' },
      { name: '킹스 크로스역', area: '런던', description: '9와 3/4 승강장' }
    ],
    popularity: 96,
    difficulty: '보통',
    awards: '전세계 흥행 1위'
  },
  {
    title: '로마의 휴일',
    type: 'movie',
    year: 1953,
    genre: '로맨스',
    poster: '🏛️',
    locations: [
      { name: '트레비 분수', area: '이탈리아 로마', description: '동전 던지기 장면' },
      { name: '스페인 계단', area: '이탈리아 로마', description: '젤라토 먹는 장면' },
      { name: '콜로세움', area: '이탈리아 로마', description: '관광 장면' }
    ],
    popularity: 88,
    difficulty: '쉬움',
    awards: '아카데미 주연여우상'
  },
  {
    title: '아멜리에',
    type: 'movie',
    year: 2001,
    genre: '로맨스',
    poster: '💚',
    locations: [
      { name: '몽마르트 언덕', area: '프랑스 파리', description: '아멜리의 동네' },
      { name: '사크레쾨르', area: '프랑스 파리', description: '전망 장면' },
      { name: '센강', area: '프랑스 파리', description: '로맨틱 산책' }
    ],
    popularity: 90,
    difficulty: '보통',
    awards: '칸 영화제 화제작'
  },

  // 일본 애니메이션 & 영화
  {
    title: '너의 이름은',
    type: 'animation',
    year: 2016,
    genre: '애니메이션',
    poster: '☄️',
    locations: [
      { name: '스가 신사', area: '일본 도쿄', description: '계단 명장면' },
      { name: '히다시', area: '일본 기후현', description: '시골 마을 배경' },
      { name: '이타모리 호수', area: '일본 나가노현', description: '운석호 모티브' }
    ],
    popularity: 93,
    difficulty: '보통',
    awards: '일본 최고 흥행 애니'
  },
  {
    title: '센과 치히로의 행방불명',
    type: 'animation',
    year: 2001,
    genre: '애니메이션',
    poster: '👻',
    locations: [
      { name: '도고 온천', area: '일본 에히메현', description: '목욕탕 모티브' },
      { name: '지브리 박물관', area: '일본 도쿄', description: '제작사 박물관' },
      { name: '구마모토 아소산', area: '일본 구마모토현', description: '자연 배경' }
    ],
    popularity: 95,
    difficulty: '보통',
    awards: '아카데미 장편애니상'
  },

  // 중국/홍콩 영화
  {
    title: '와호장룡',
    type: 'movie',
    year: 2000,
    genre: '무협',
    poster: '🗡️',
    locations: [
      { name: '우당산', area: '중국 후베이성', description: '무협 액션 장면' },
      { name: '자금성', area: '중국 베이징', description: '궁궐 장면' },
      { name: '대나무숲', area: '중국 저장성', description: '유명한 대나무숲 액션' }
    ],
    popularity: 84,
    difficulty: '어려움',
    awards: '아카데미 4개 부문'
  },

  // 넷플릭스 오리지널
  {
    title: '기묘한 이야기',
    type: 'drama',
    year: 2016,
    genre: 'SF',
    poster: '🔬',
    locations: [
      { name: '호킨스 중학교', area: '조지아 주', description: '주인공들의 학교' },
      { name: '스타코트 몰', area: '조지아 주', description: '시즌3 주요 무대' },
      { name: '애틀랜타', area: '조지아 주', description: '대부분의 촬영지' }
    ],
    popularity: 87,
    difficulty: '어려움',
    awards: 'Netflix 간판 시리즈'
  },
  {
    title: '킹덤',
    type: 'drama',
    year: 2019,
    genre: '좀비',
    poster: '🧟',
    locations: [
      { name: '문경새재', area: '경북 문경시', description: '조선 궁궐 세트' },
      { name: '해인사', area: '경남 합천군', description: '사찰 장면' },
      { name: '정동진', area: '강원 강릉시', description: '해안가 장면' }
    ],
    popularity: 86,
    difficulty: '보통',
    awards: 'Netflix 한국 오리지널'
  },

  // 액션/스릴러
  {
    title: '존 윅',
    type: 'movie',
    year: 2014,
    genre: '액션',
    poster: '🔫',
    locations: [
      { name: '컨티넨탈 호텔', area: '뉴욕 맨해튼', description: '킬러들의 호텔' },
      { name: '브루클린', area: '뉴욕', description: '존 윅의 집' },
      { name: '센트럴파크', area: '뉴욕', description: '추격 장면' }
    ],
    popularity: 88,
    difficulty: '보통',
    awards: '액션 영화 걸작'
  },
  {
    title: '미션 임파서블',
    type: 'movie',
    year: 1996,
    genre: '액션',
    poster: '🎯',
    locations: [
      { name: '버즈 할리파', area: 'UAE 두바이', description: '톰 크루즈 건물 오르기' },
      { name: '시드니 오페라하우스', area: '호주', description: '추격 장면' },
      { name: 'CIA 랭글리', area: '버지니아', description: '침투 장면' }
    ],
    popularity: 85,
    difficulty: '어려움',
    awards: 'IMF 시리즈'
  },

  // 드라마/멜로
  {
    title: '포레스트 검프',
    type: 'movie',
    year: 1994,
    genre: '드라마',
    poster: '🏃',
    locations: [
      { name: '새너 광장', area: '조지아 사바나', description: '벤치 장면' },
      { name: '링컨 메모리얼', area: '워싱턴 DC', description: '연설 장면' },
      { name: '몬터레이', area: '캘리포니아', description: '새우잡이' }
    ],
    popularity: 92,
    difficulty: '보통',
    awards: '아카데미 6개 부문'
  },
  {
    title: '타이타닉',
    type: 'movie',
    year: 1997,
    genre: '로맨스',
    poster: '🚢',
    locations: [
      { name: '벨파스트', area: '북아일랜드', description: '타이타닉 건조소' },
      { name: '할리팩스', area: '캐나다', description: '타이타닉 박물관' },
      { name: '로스앤젤레스', area: '캘리포니아', description: '촬영 스튜디오' }
    ],
    popularity: 94,
    difficulty: '보통',
    awards: '역대 흥행 2위'
  },

  // 코미디
  {
    title: '마스크',
    type: 'movie',
    year: 1994,
    genre: '코미디',
    poster: '🎭',
    locations: [
      { name: '로스앤젤레스', area: '캘리포니아', description: '도시 배경' },
      { name: '코코넛 그로브', area: '플로리다', description: '나이트클럽' }
    ],
    popularity: 83,
    difficulty: '쉬움',
    awards: '짐 캐리 대표작'
  },

  // 공포/스릴러
  {
    title: '겟 아웃',
    type: 'movie',
    year: 2017,
    genre: '공포',
    poster: '👁️',
    locations: [
      { name: '앨라바마', area: '앨라바마 주', description: '저택 촬영지' },
      { name: '모바일', area: '앨라바마 주', description: '마을 배경' }
    ],
    popularity: 86,
    difficulty: '보통',
    awards: '아카데미 각본상'
  },

  // 최신 화제작
  {
    title: '듄',
    type: 'movie',
    year: 2021,
    genre: 'SF',
    poster: '🏜️',
    locations: [
      { name: '와디럼', area: '요단', description: '사막 행성' },
      { name: '아부다비', area: 'UAE', description: '미래 도시' },
      { name: '노르웨이', area: '노르웨이', description: '얼음 행성' }
    ],
    popularity: 88,
    difficulty: '어려움',
    awards: '아카데미 6개 부문'
  },
  {
    title: '탑건: 매버릭',
    type: 'movie',
    year: 2022,
    genre: '액션',
    poster: '✈️',
    locations: [
      { name: '샌디에이고', area: '캘리포니아', description: '해군 기지' },
      { name: '모뉴먼트 밸리', area: '유타/아리조나', description: '비행 훈련' }
    ],
    popularity: 91,
    difficulty: '보통',
    awards: '2022년 최고 흥행'
  }
];

const genreKeys = ['all', 'action', 'romance', 'thriller', 'drama', 'sf', 'animation'];
const regionKeys = ['all', 'domestic', 'japan', 'china', 'usa', 'europe', 'other'];
const difficultyKeys = ['all', 'easy', 'normal', 'hard'];

export default function FilmLocationsPage() {
  // 임시 번역 함수
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'keyword': '영화 촬영지',
      'metadata.title': 'AI 영화 촬영지 가이드 - 전 세계 명작의 실제 장소를 찾아서',
      'metadata.description': '30개 유명 영화와 드라마의 실제 촬영지를 AI가 분석하여 완벽한 여행 코스로 제안합니다.',
      'badge': '🎬 글로벌 촬영지',
      'hero.title': 'AI 영화 촬영지 가이드',
      'hero.subtitle': '스크린 속 그 장소를 실제로 만나보세요'
    };
    return translations[key] || key;
  };
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('hero.title')}
        pagePath="/film-locations"
        title={t('hero.description')}
        description={t('hero.description')}
        features={['촬영지 정확한 위치', '포토 스팟 안내', '비하인드 스토리', '대중교통 정보', '근처 맛집', '오디오 가이드']}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              {t('badge')}
            </div>
            <h1 className="text-3xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              {t('hero.title')} 
              <span className="font-semibold block mt-2">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="container mx-auto px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="max-w-2xl mx-auto mb-6">
              <input 
                type="text" 
                placeholder={t('search.placeholder')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 text-center"
              />
              <p className="text-sm text-gray-600 text-center mt-2">
                {t('search.examples')}
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t('filters.genre')}</span>
                <div className="flex flex-wrap gap-2">
                  {genreKeys.map((genreKey) => (
                    <button 
                      key={genreKey}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition-colors"
                    >
                      {t(`genres.${genreKey}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Film Locations Grid */}
      <section className="container mx-auto px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-light text-gray-900">
              {t('locations.title')}
            </h2>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option>{t('filters.sortBy.popularity')}</option>
                <option>{t('filters.sortBy.latest')}</option>
                <option>{t('filters.sortBy.accessible')}</option>
                <option>{t('filters.sortBy.distance')}</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filmLocations.map((film, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Film Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{film.poster}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{film.title}</h3>
                        <p className="text-sm text-gray-600">{film.year} · {film.genre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                        🔥 {film.popularity}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      film.difficulty === '쉬움' ? 'bg-green-100 text-green-800' :
                      film.difficulty === '보통' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(`difficulties.${film.difficulty === '쉬움' ? 'easy' : film.difficulty === '보통' ? 'normal' : 'hard'}`)}
                    </span>
                    <span className="text-gray-600">{t('locations.locationCount', {count: film.locations.length})}</span>
                  </div>
                </div>

                {/* Locations List */}
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-3">{t('locations.mainLocations')}</h4>
                  <div className="space-y-3">
                    {film.locations.map((location, locIndex) => (
                      <div key={locIndex} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {locIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-gray-900">{location.name}</h5>
                          <p className="text-xs text-gray-600 mb-1">{location.area}</p>
                          <p className="text-xs text-gray-500">{location.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  <Link 
                    href={`/?film=${encodeURIComponent(film.title)}&setjetting=true`}
                    className="w-full bg-black text-white py-3 px-4 rounded-lg text-center block hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    {t('locations.detailGuide')}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              {t('locations.loadMore')}
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-gray-600">{t('features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.exactLocation.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.exactLocation.description')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-3xl mb-4">📸</div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.photoGuide.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.photoGuide.description')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-3xl mb-4">🎬</div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.behindStory.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.behindStory.description')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-3xl mb-4">🎧</div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.audioGuide.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.audioGuide.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">
              {t('categories.title')}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/film-locations?genre=kdrama" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🇰🇷</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.kdrama.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.kdrama.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.kdrama.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=hollywood" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🎭</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.hollywood.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.hollywood.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.hollywood.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=anime" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🗾</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.anime.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.anime.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.anime.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=marvel" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">⚡</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.marvel.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.marvel.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.marvel.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=historic" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🏰</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.historic.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.historic.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.historic.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=romance" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">💕</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.romance.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.romance.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.romance.count')}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Tool Integration */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {t('tools.title')}
            </h2>
            <p className="text-gray-600">{t('tools.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <Link href="/trip-planner?theme=movie" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-3xl mb-3">🗺️</div>
                <h3 className="text-lg font-medium text-gray-900">{t('tools.tripPlanner.title')}</h3>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                {t('tools.tripPlanner.description')}
              </p>
              <div className="text-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs">{t('tools.tripPlanner.badge')}</span>
              </div>
            </Link>

            <Link href="/visa-checker?purpose=filming" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-lg font-medium text-gray-900">{t('tools.visaChecker.title')}</h3>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                {t('tools.visaChecker.description')}
              </p>
              <div className="text-center">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs">{t('tools.visaChecker.badge')}</span>
              </div>
            </Link>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-3xl mb-3">💾</div>
                <h3 className="text-lg font-medium text-gray-900">{t('tools.collection.title')}</h3>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                {t('tools.collection.description')}
              </p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => {
                    const saved = JSON.parse(localStorage.getItem('saved-film-locations') || '[]');
                    alert(t('tools.collection.savedCount', {count: saved.length}));
                  }}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-xs hover:bg-purple-200 transition-colors"
                >
                  {t('tools.collection.checkSaved')}
                </button>
              </div>
            </div>
          </div>

          {/* Popular Film Tourism Routes */}
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-900 mb-6 text-center">{t('routes.title')}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/trip-planner?route=kdrama-seoul" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">🇰🇷</div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('routes.kdramaSeoul.title')}</h4>
                  <p className="text-sm text-gray-600">{t('routes.kdramaSeoul.description')}</p>
                  <span className="text-xs text-blue-600">{t('routes.kdramaSeoul.cost')}</span>
                </div>
              </Link>
              
              <Link href="/trip-planner?route=ghibli-japan" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">🎭</div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('routes.ghibliJapan.title')}</h4>
                  <p className="text-sm text-gray-600">{t('routes.ghibliJapan.description')}</p>
                  <span className="text-xs text-blue-600">{t('routes.ghibliJapan.cost')}</span>
                </div>
              </Link>
              
              <Link href="/trip-planner?route=marvel-usa" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">⚡</div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('routes.marvelUsa.title')}</h4>
                  <p className="text-sm text-gray-600">{t('routes.marvelUsa.description')}</p>
                  <span className="text-xs text-blue-600">{t('routes.marvelUsa.cost')}</span>
                </div>
              </Link>
              
              <Link href="/trip-planner?route=lotr-newzealand" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">💍</div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('routes.lotrNewzealand.title')}</h4>
                  <p className="text-sm text-gray-600">{t('routes.lotrNewzealand.description')}</p>
                  <span className="text-xs text-blue-600">{t('routes.lotrNewzealand.cost')}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Guide Integration for Film Locations */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              {t('audioExperience.title')}
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed">
              {t('audioExperience.description')}
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-2xl mb-3">🎬</div>
                <h3 className="font-medium mb-2">{t('audioExperience.filmingStory.title')}</h3>
                <p className="text-sm text-gray-300">{t('audioExperience.filmingStory.description')}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-2xl mb-3">🎯</div>
                <h3 className="font-medium mb-2">{t('audioExperience.photoSpot.title')}</h3>
                <p className="text-sm text-gray-300">{t('audioExperience.photoSpot.description')}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-2xl mb-3">🎵</div>
                <h3 className="font-medium mb-2">{t('audioExperience.immersive.title')}</h3>
                <p className="text-sm text-gray-300">{t('audioExperience.immersive.description')}</p>
              </div>
            </div>
            <Link 
              href="/?film=experience&setjetting=true"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              {t('audioExperience.cta')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}