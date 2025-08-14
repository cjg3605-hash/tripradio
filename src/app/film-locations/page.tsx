'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
// 30개 영화/드라마 대규모 촬영지 데이터
const getFilmLocations = (t: (key: string) => string) => [
  // 한국 작품 (K-Drama & 영화)
  {
    title: t('films.parasite.title'),
    type: 'movie',
    year: 2019,
    genre: 'thriller',
    poster: '🏆',
    locations: [
      { name: t('films.parasite.locations.jahamun.name'), area: t('films.parasite.locations.jahamun.area'), description: t('films.parasite.locations.jahamun.description') },
      { name: t('films.parasite.locations.snu.name'), area: t('films.parasite.locations.snu.area'), description: t('films.parasite.locations.snu.description') },
      { name: t('films.parasite.locations.seongbuk.name'), area: t('films.parasite.locations.seongbuk.area'), description: t('films.parasite.locations.seongbuk.description') }
    ],
    popularity: 95,
    difficulty: 'easy',
    awards: t('films.parasite.awards')
  },
  {
    title: t('films.squidGame.title'),
    type: 'drama',
    year: 2021,
    genre: 'drama',
    poster: '🦑',
    locations: [
      { name: t('films.squidGame.locations.tribowl.name'), area: t('films.squidGame.locations.tribowl.area'), description: t('films.squidGame.locations.tribowl.description') },
      { name: t('films.squidGame.locations.yongyu.name'), area: t('films.squidGame.locations.yongyu.area'), description: t('films.squidGame.locations.yongyu.description') },
      { name: t('films.squidGame.locations.cheongnyangni.name'), area: t('films.squidGame.locations.cheongnyangni.area'), description: t('films.squidGame.locations.cheongnyangni.description') }
    ],
    popularity: 98,
    difficulty: 'normal',
    awards: t('films.squidGame.awards')
  },
  {
    title: t('films.cloy.title'),
    type: 'drama', 
    year: 2019,
    genre: 'romance',
    poster: '🪂',
    locations: [
      { name: t('films.cloy.locations.sigriswil.name'), area: t('films.cloy.locations.sigriswil.area'), description: t('films.cloy.locations.sigriswil.description') },
      { name: t('films.cloy.locations.beolgok.name'), area: t('films.cloy.locations.beolgok.area'), description: t('films.cloy.locations.beolgok.description') },
      { name: t('films.cloy.locations.bukhan.name'), area: t('films.cloy.locations.bukhan.area'), description: t('films.cloy.locations.bukhan.description') }
    ],
    popularity: 92,
    difficulty: 'hard',
    awards: t('films.cloy.awards')
  },
  {
    title: t('films.goblin.title'),
    type: 'drama',
    year: 2016,
    genre: 'fantasy',
    poster: '👹',
    locations: [
      { name: t('films.goblin.locations.deoksugung.name'), area: t('films.goblin.locations.deoksugung.area'), description: t('films.goblin.locations.deoksugung.description') },
      { name: t('films.goblin.locations.jumunjin.name'), area: t('films.goblin.locations.jumunjin.area'), description: t('films.goblin.locations.jumunjin.description') },
      { name: t('films.goblin.locations.chinatown.name'), area: t('films.goblin.locations.chinatown.area'), description: t('films.goblin.locations.chinatown.description') }
    ],
    popularity: 93,
    difficulty: 'easy',
    awards: t('films.goblin.awards')
  },
  {
    title: t('films.taegeukgi.title'),
    type: 'movie',
    year: 2004,
    genre: 'war',
    poster: '🇰🇷',
    locations: [
      { name: t('films.taegeukgi.locations.taebaek.name'), area: t('films.taegeukgi.locations.taebaek.area'), description: t('films.taegeukgi.locations.taebaek.description') },
      { name: t('films.taegeukgi.locations.auraji.name'), area: t('films.taegeukgi.locations.auraji.area'), description: t('films.taegeukgi.locations.auraji.description') },
      { name: t('films.taegeukgi.locations.seoul.name'), area: t('films.taegeukgi.locations.seoul.area'), description: t('films.taegeukgi.locations.seoul.description') }
    ],
    popularity: 88,
    difficulty: 'normal',
    awards: t('films.taegeukgi.awards')
  },
  {
    title: '미나리',
    type: 'movie',
    year: 2020,
    genre: 'drama',
    poster: '🌿',
    locations: [
      { name: '털사', area: '오클라호마 주', description: '이민 가족의 농장' },
      { name: '아칸소', area: '아칸소 주', description: '주요 배경지' }
    ],
    popularity: 85,
    difficulty: 'hard',
    awards: '아카데미 여우조연상'
  },

  // 할리우드 블록버스터
  {
    title: '어벤져스',
    type: 'movie',
    year: 2012,
    genre: 'action',
    poster: '⚡',
    locations: [
      { name: '스타크 타워', area: '뉴욕 맨해튼', description: '아이언맨의 본거지' },
      { name: '중앙역', area: '뉴욕 맨해튼', description: '최종 결전 장면' },
      { name: '타임스퀘어', area: '뉴욕 맨해튼', description: '외계인 침공 장면' }
    ],
    popularity: 89,
    difficulty: 'normal',
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
    difficulty: 'hard',
    awards: '아카데미 시각효과상'
  },
  {
    title: '라라랜드',
    type: 'movie',
    year: 2016,
    genre: 'musical',
    poster: '🎭',
    locations: [
      { name: '그리피스 천문대', area: '로스앤젤레스', description: '데이트 장면' },
      { name: '허모사 비치', area: '캘리포니아', description: '해변 댄스' },
      { name: '선셋 스트립', area: '할리우드', description: '재즈클럽' }
    ],
    popularity: 87,
    difficulty: 'normal',
    awards: '아카데미 6개 부문'
  },
  {
    title: '토이 스토리',
    type: 'animation',
    year: 1995,
    genre: 'animation',
    poster: '🤠',
    locations: [
      { name: '픽사 스튜디오', area: '캘리포니아', description: '제작사 본사' },
      { name: '샌프란시스코', area: '캘리포니아', description: '도시 배경' }
    ],
    popularity: 86,
    difficulty: 'easy',
    awards: '픽사 첫 장편'
  },

  // 유럽 명작들
  {
    title: '겨울왕국',
    type: 'animation',
    year: 2013,
    genre: 'animation',
    poster: '❄️',
    locations: [
      { name: '할슈타트', area: '오스트리아', description: '아렌델 왕국의 모티브' },
      { name: '베르겐', area: '노르웨이', description: '안나와 엘사의 고향 배경' },
      { name: '스톡홀름', area: '스웨덴', description: '성 내부 디자인 모티브' }
    ],
    popularity: 94,
    difficulty: 'normal',
    awards: '디즈니 최고 흥행작'
  },
  {
    title: '해리포터: 마법사의 돌',
    type: 'movie',
    year: 2001,
    genre: 'fantasy',
    poster: '⚡',
    locations: [
      { name: '옥스퍼드 대학', area: '영국 옥스퍼드', description: '호그와트 내부' },
      { name: '앨닉 성', area: '영국 노섬벌랜드', description: '호그와트 외관' },
      { name: '킹스 크로스역', area: '런던', description: '9와 3/4 승강장' }
    ],
    popularity: 96,
    difficulty: 'normal',
    awards: '전세계 흥행 1위'
  },
  {
    title: '로마의 휴일',
    type: 'movie',
    year: 1953,
    genre: 'romance',
    poster: '🏛️',
    locations: [
      { name: '트레비 분수', area: '이탈리아 로마', description: '동전 던지기 장면' },
      { name: '스페인 계단', area: '이탈리아 로마', description: '젤라토 먹는 장면' },
      { name: '콜로세움', area: '이탈리아 로마', description: '관광 장면' }
    ],
    popularity: 88,
    difficulty: 'easy',
    awards: '아카데미 주연여우상'
  },
  {
    title: '아멜리에',
    type: 'movie',
    year: 2001,
    genre: 'romance',
    poster: '💚',
    locations: [
      { name: '몽마르트 언덕', area: '프랑스 파리', description: '아멜리의 동네' },
      { name: '사크레쾨르', area: '프랑스 파리', description: '전망 장면' },
      { name: '센강', area: '프랑스 파리', description: '로맨틱 산책' }
    ],
    popularity: 90,
    difficulty: 'normal',
    awards: '칸 영화제 화제작'
  },

  // 일본 애니메이션 & 영화
  {
    title: '너의 이름은',
    type: 'animation',
    year: 2016,
    genre: 'animation',
    poster: '☄️',
    locations: [
      { name: '스가 신사', area: '일본 도쿄', description: '계단 명장면' },
      { name: '히다시', area: '일본 기후현', description: '시골 마을 배경' },
      { name: '이타모리 호수', area: '일본 나가노현', description: '운석호 모티브' }
    ],
    popularity: 93,
    difficulty: 'normal',
    awards: '일본 최고 흥행 애니'
  },
  {
    title: '센과 치히로의 행방불명',
    type: 'animation',
    year: 2001,
    genre: 'animation',
    poster: '👻',
    locations: [
      { name: '도고 온천', area: '일본 에히메현', description: '목욕탕 모티브' },
      { name: '지브리 박물관', area: '일본 도쿄', description: '제작사 박물관' },
      { name: '구마모토 아소산', area: '일본 구마모토현', description: '자연 배경' }
    ],
    popularity: 95,
    difficulty: 'normal',
    awards: '아카데미 장편애니상'
  },

  // 중국/홍콩 영화
  {
    title: '와호장룡',
    type: 'movie',
    year: 2000,
    genre: 'martial-arts',
    poster: '🗡️',
    locations: [
      { name: '우당산', area: '중국 후베이성', description: '무협 액션 장면' },
      { name: '자금성', area: '중국 베이징', description: '궁궐 장면' },
      { name: '대나무숲', area: '중국 저장성', description: '유명한 대나무숲 액션' }
    ],
    popularity: 84,
    difficulty: 'hard',
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
    difficulty: 'hard',
    awards: 'Netflix 간판 시리즈'
  },
  {
    title: '킹덤',
    type: 'drama',
    year: 2019,
    genre: 'zombie',
    poster: '🧟',
    locations: [
      { name: '문경새재', area: '경북 문경시', description: '조선 궁궐 세트' },
      { name: '해인사', area: '경남 합천군', description: '사찰 장면' },
      { name: '정동진', area: '강원 강릉시', description: '해안가 장면' }
    ],
    popularity: 86,
    difficulty: 'normal',
    awards: 'Netflix 한국 오리지널'
  },

  // 액션/스릴러
  {
    title: '존 윅',
    type: 'movie',
    year: 2014,
    genre: 'action',
    poster: '🔫',
    locations: [
      { name: '컨티넨탈 호텔', area: '뉴욕 맨해튼', description: '킬러들의 호텔' },
      { name: '브루클린', area: '뉴욕', description: '존 윅의 집' },
      { name: '센트럴파크', area: '뉴욕', description: '추격 장면' }
    ],
    popularity: 88,
    difficulty: 'normal',
    awards: '액션 영화 걸작'
  },
  {
    title: '미션 임파서블',
    type: 'movie',
    year: 1996,
    genre: 'action',
    poster: '🎯',
    locations: [
      { name: '버즈 할리파', area: 'UAE 두바이', description: '톰 크루즈 건물 오르기' },
      { name: '시드니 오페라하우스', area: '호주', description: '추격 장면' },
      { name: 'CIA 랭글리', area: '버지니아', description: '침투 장면' }
    ],
    popularity: 85,
    difficulty: 'hard',
    awards: 'IMF 시리즈'
  },

  // 드라마/멜로
  {
    title: '포레스트 검프',
    type: 'movie',
    year: 1994,
    genre: 'drama',
    poster: '🏃',
    locations: [
      { name: '새너 광장', area: '조지아 사바나', description: '벤치 장면' },
      { name: '링컨 메모리얼', area: '워싱턴 DC', description: '연설 장면' },
      { name: '몬터레이', area: '캘리포니아', description: '새우잡이' }
    ],
    popularity: 92,
    difficulty: 'normal',
    awards: '아카데미 6개 부문'
  },
  {
    title: '타이타닉',
    type: 'movie',
    year: 1997,
    genre: 'romance',
    poster: '🚢',
    locations: [
      { name: '벨파스트', area: '북아일랜드', description: '타이타닉 건조소' },
      { name: '할리팩스', area: '캐나다', description: '타이타닉 박물관' },
      { name: '로스앤젤레스', area: '캘리포니아', description: '촬영 스튜디오' }
    ],
    popularity: 94,
    difficulty: 'normal',
    awards: '역대 흥행 2위'
  },

  // 코미디
  {
    title: '마스크',
    type: 'movie',
    year: 1994,
    genre: 'comedy',
    poster: '🎭',
    locations: [
      { name: '로스앤젤레스', area: '캘리포니아', description: '도시 배경' },
      { name: '코코넛 그로브', area: '플로리다', description: '나이트클럽' }
    ],
    popularity: 83,
    difficulty: 'easy',
    awards: '짐 캐리 대표작'
  },

  // 공포/스릴러
  {
    title: '겟 아웃',
    type: 'movie',
    year: 2017,
    genre: 'horror',
    poster: '👁️',
    locations: [
      { name: '앨라바마', area: '앨라바마 주', description: '저택 촬영지' },
      { name: '모바일', area: '앨라바마 주', description: '마을 배경' }
    ],
    popularity: 86,
    difficulty: 'normal',
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
    difficulty: 'hard',
    awards: '아카데미 6개 부문'
  },
  {
    title: '탑건: 매버릭',
    type: 'movie',
    year: 2022,
    genre: 'action',
    poster: '✈️',
    locations: [
      { name: '샌디에이고', area: '캘리포니아', description: '해군 기지' },
      { name: '모뉴먼트 밸리', area: '유타/아리조나', description: '비행 훈련' }
    ],
    popularity: 91,
    difficulty: 'normal',
    awards: '2022년 최고 흥행'
  }
];

const genreKeys = ['all', 'action', 'romance', 'thriller', 'drama', 'sf', 'animation'];
const regionKeys = ['all', 'domestic', 'japan', 'china', 'usa', 'europe', 'other'];
const difficultyKeys = ['all', 'easy', 'normal', 'hard'];

export default function FilmLocationsPage() {
  const t = useTranslations('filmLocations');
  const filmLocations = getFilmLocations(t);
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('hero.title')}
        pagePath="/film-locations"
        title={t('hero.description')}
        description={t('hero.description')}
        features={[t('features.exactLocation.title'), t('features.photoGuide.title'), t('features.behindStory.title'), t('features.transport'), t('features.nearbyFood'), t('features.audioGuide.title')]}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-8">
              {t('badge')}
            </div>
            <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('hero.title')}
            </h1>
            <h2 className="text-2xl lg:text-3xl font-normal text-gray-700 mb-8">
              {t('hero.subtitle')}
            </h2>
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
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-center transition-all duration-200 min-h-[44px]"
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
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-all duration-200 font-medium"
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
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-gray-400 rounded"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{film.title}</h3>
                        <p className="text-sm text-gray-600">{film.year} · {t(`genres.${film.genre}`)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
                        {film.popularity}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      film.difficulty === 'easy' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                      film.difficulty === 'normal' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                      'bg-gray-200 text-gray-800 border border-gray-400'
                    }`}>
                      {t(`difficulties.${film.difficulty}`)}
                    </span>
                    <span className="text-gray-600">{t('locations.locationCount', film.locations.length)}</span>
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
                    className="w-full bg-black text-white py-3 px-4 rounded-lg text-center block hover:bg-gray-800 transition-all duration-200 text-sm font-medium shadow-sm min-h-[44px] flex items-center justify-center"
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
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-gray-600">{t('features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.exactLocation.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.exactLocation.description')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-4 bg-gray-600 rounded-sm"></div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.photoGuide.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.photoGuide.description')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-gray-500 rounded-lg"></div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.behindStory.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.behindStory.description')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-5 h-5 border-2 border-gray-500 rounded-full"></div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{t('features.audioGuide.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.audioGuide.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-light text-gray-900 mb-8 text-center">
              {t('categories.title')}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/film-locations?genre=kdrama" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.kdrama.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.kdrama.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.kdrama.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=hollywood" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-4 bg-gray-700 rounded-sm"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.hollywood.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.hollywood.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.hollywood.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=anime" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.anime.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.anime.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.anime.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=marvel" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-6 bg-gray-600 transform rotate-12"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.marvel.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.marvel.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.marvel.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=historic" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-6 bg-gray-700 rounded-t-lg"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('categories.historic.title')}</h3>
                    <p className="text-sm text-gray-600">{t('categories.historic.description')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('categories.historic.count')}</p>
                  </div>
                </div>
              </Link>

              <Link href="/film-locations?genre=romance" className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                  </div>
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
      <section className="py-20 lg:py-32 bg-gray-50">
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
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-gray-500 rounded"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('tools.tripPlanner.title')}</h3>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                {t('tools.tripPlanner.description')}
              </p>
              <div className="text-center">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">{t('tools.tripPlanner.badge')}</span>
              </div>
            </Link>

            <Link href="/visa-checker?purpose=filming" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-5 h-6 bg-gray-600 rounded-sm"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('tools.visaChecker.title')}</h3>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                {t('tools.visaChecker.description')}
              </p>
              <div className="text-center">
                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-xs font-medium">{t('tools.visaChecker.badge')}</span>
              </div>
            </Link>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-4 bg-gray-500 rounded"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('tools.collection.title')}</h3>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                {t('tools.collection.description')}
              </p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => {
                    const saved = JSON.parse(localStorage.getItem('saved-film-locations') || '[]');
                    alert(t('tools.collection.savedCount', saved.length));
                  }}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs hover:bg-gray-200 transition-all duration-200 font-medium"
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
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('routes.kdramaSeoul.title')}</h4>
                  <p className="text-sm text-gray-600">{t('routes.kdramaSeoul.description')}</p>
                  <span className="text-xs text-blue-600">{t('routes.kdramaSeoul.cost')}</span>
                </div>
              </Link>
              
              <Link href="/trip-planner?route=ghibli-japan" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <div className="w-4 h-3 bg-gray-700 rounded-sm"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('routes.ghibliJapan.title')}</h4>
                  <p className="text-sm text-gray-600">{t('routes.ghibliJapan.description')}</p>
                  <span className="text-xs text-blue-600">{t('routes.ghibliJapan.cost')}</span>
                </div>
              </Link>
              
              <Link href="/trip-planner?route=marvel-usa" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <div className="w-3 h-4 bg-gray-600 transform rotate-12"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{t('routes.marvelUsa.title')}</h4>
                  <p className="text-sm text-gray-600">{t('routes.marvelUsa.description')}</p>
                  <span className="text-xs text-blue-600">{t('routes.marvelUsa.cost')}</span>
                </div>
              </Link>
              
              <Link href="/trip-planner?route=lotr-newzealand" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                </div>
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
      <section className="py-20 lg:py-32 bg-gray-900 text-white">
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
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-lg"></div>
                </div>
                <h3 className="font-medium mb-2">{t('audioExperience.filmingStory.title')}</h3>
                <p className="text-sm text-gray-300">{t('audioExperience.filmingStory.description')}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                </div>
                <h3 className="font-medium mb-2">{t('audioExperience.photoSpot.title')}</h3>
                <p className="text-sm text-gray-300">{t('audioExperience.photoSpot.description')}</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                </div>
                <h3 className="font-medium mb-2">{t('audioExperience.immersive.title')}</h3>
                <p className="text-sm text-gray-300">{t('audioExperience.immersive.description')}</p>
              </div>
            </div>
            <Link 
              href="/?film=experience&setjetting=true"
              className="inline-block bg-white text-gray-900 px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
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