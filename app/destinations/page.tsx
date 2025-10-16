'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';

// 전세계 TOP100 관광명소 데이터 (SEO 최적화용)
const worldTop100Destinations = [
  // 유럽
  { name: '에펠탑', country: '프랑스', continent: '유럽', emoji: '🗼', description: '파리의 상징적 랜드마크' },
  { name: '로마 콜로세움', country: '이탈리아', continent: '유럽', emoji: '🏛️', description: '고대 로마의 영광' },
  { name: '사그라다 파밀리아', country: '스페인', continent: '유럽', emoji: '⛪', description: '가우디의 미완성 걸작' },
  { name: '루브르 박물관', country: '프랑스', continent: '유럽', emoji: '🎨', description: '세계 최대 미술관' },
  { name: '베르사유 궁전', country: '프랑스', continent: '유럽', emoji: '👑', description: '프랑스 왕실의 화려함' },
  
  // 아시아
  { name: '만리장성', country: '중국', continent: '아시아', emoji: '🏯', description: '인류 최대의 건축물' },
  { name: '후지산', country: '일본', continent: '아시아', emoji: '🗻', description: '일본의 상징' },
  { name: '앙코르와트', country: '캄보디아', continent: '아시아', emoji: '🕌', description: '크메르 문명의 걸작' },
  { name: '타지마할', country: '인도', continent: '아시아', emoji: '🕌', description: '사랑의 무덤' },
  { name: '경복궁', country: '한국', continent: '아시아', emoji: '🏰', description: '조선왕조의 정궁' },
  
  // 아메리카
  { name: '자유의 여신상', country: '미국', continent: '아메리카', emoji: '🗽', description: '자유와 민주주의의 상징' },
  { name: '마추픽추', country: '페루', continent: '아메리카', emoji: '⛰️', description: '공중도시 잉카의 비밀' },
  { name: '그랜드캐니언', country: '미국', continent: '아메리카', emoji: '🏔️', description: '지구의 상처' },
  
  // 아프리카
  { name: '피라미드', country: '이집트', continent: '아프리카', emoji: '🔺', description: '고대 이집트의 신비' },
  { name: '빅토리아 폭포', country: '잠비아/짐바브웨', continent: '아프리카', emoji: '💦', description: '천둥치는 연기' },
  
  // 오세아니아
  { name: '시드니 오페라하우스', country: '호주', continent: '오세아니아', emoji: '🎭', description: '현대 건축의 아이콘' },
  { name: '울루루', country: '호주', continent: '오세아니아', emoji: '🪨', description: '호주 원주민의 성지' },
];

export default function DestinationsPage() {
  const t = useTranslations('destinations');
  const continents = [t('continents.europe'), t('continents.asia'), t('continents.americas'), t('continents.africa'), t('continents.oceania')];
  
  // Map Korean continent names to translated names
  const getContinentName = (koreanName: string) => {
    switch (koreanName) {
      case '유럽': return t('continents.europe');
      case '아시아': return t('continents.asia');
      case '아메리카': return t('continents.americas');
      case '아프리카': return t('continents.africa');
      case '오세아니아': return t('continents.oceania');
      default: return koreanName;
    }
  };
  
  return (
    <>
      <KeywordPageSchema 
        keyword={t('meta.keyword')}
        pagePath="/destinations"
        title={t('meta.title')}
        description={t('meta.description')}
        features={[t('meta.features.top100'), t('meta.features.aiGuide'), t('meta.features.hiddenStories'), t('meta.features.historyCulture'), t('meta.features.localInfo'), t('meta.features.personalizedRecs')]}
      />
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
              {t('hero.badge')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('hero.title')} 
              <span className="font-semibold block mt-2">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 min-w-[200px]"
            >
              {t('hero.startFreeGuide')}
            </Link>
            <Link 
              href="#top-destinations"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 min-w-[200px]"
            >
              {t('hero.viewTop100')}
            </Link>
          </div>
        </div>
      </section>

      {/* Why TOP100 */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('whyTop100.title')} 
              <span className="font-semibold block mt-2">{t('whyTop100.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🏛️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('whyTop100.historical.title')}</h3>
              <p className="text-gray-600">
                {t('whyTop100.historical.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎨</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('whyTop100.artistic.title')}</h3>
              <p className="text-gray-600">
                {t('whyTop100.artistic.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🌿</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('whyTop100.natural.title')}</h3>
              <p className="text-gray-600">
                {t('whyTop100.natural.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Guide Benefits */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('aiBenefits.title')} 
              <span className="font-semibold block mt-2">{t('aiBenefits.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🧠</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('aiBenefits.expertKnowledge.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('aiBenefits.expertKnowledge.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('aiBenefits.alwaysAvailable.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('aiBenefits.alwaysAvailable.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🎯</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('aiBenefits.customInterests.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('aiBenefits.customInterests.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">🗣️</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('aiBenefits.multiLanguage.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('aiBenefits.multiLanguage.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">📱</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('aiBenefits.smartphone.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('aiBenefits.smartphone.description')}
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <div className="text-2xl">💰</div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{t('aiBenefits.completelyFree.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('aiBenefits.completelyFree.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Destinations by Continent */}
      <section id="top-destinations" className="py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('topDestinations.title')} 
              <span className="font-semibold block mt-2">{t('topDestinations.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="space-y-16">
            {continents.map((continent) => {
              const destinations = worldTop100Destinations.filter(d => getContinentName(d.continent) === continent);
              return (
                <div key={continent} className="max-w-6xl mx-auto">
                  <h3 className="text-2xl font-medium text-gray-900 mb-8 text-center">
                    {continent === t('continents.europe') && '🇪🇺'} 
                    {continent === t('continents.asia') && '🌏'} 
                    {continent === t('continents.americas') && '🌎'} 
                    {continent === t('continents.africa') && '🌍'} 
                    {continent === t('continents.oceania') && '🇦🇺'} 
                    {' '}{continent}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinations.map((destination, index) => (
                      <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                        <div className="text-center mb-4">
                          <div className="text-3xl mb-3">{destination.emoji}</div>
                          <h4 className="text-lg font-medium text-gray-900">{destination.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">{destination.country}</p>
                          <p className="text-xs text-gray-600">{destination.description}</p>
                        </div>
                        <Link 
                          href={`/guide/${encodeURIComponent(destination.name)}`}
                          className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded text-center text-sm hover:bg-gray-200 transition-colors"
                        >
                          {t('listenToGuide')}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">
              {t('moreDestinations')}
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              {t('searchAllDestinations')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Features */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
              {t('specialFeatures.title')} 
              <span className="font-semibold block mt-2">{t('specialFeatures.subtitle')}</span>
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🏺</div>
                <h3 className="text-xl font-medium text-gray-900">{t('specialFeatures.hiddenHistory.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4">
                {t('specialFeatures.hiddenHistory.description')}
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{t('specialFeatures.hiddenHistory.example1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{t('specialFeatures.hiddenHistory.example2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{t('specialFeatures.hiddenHistory.example3')}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-xl font-medium text-gray-900">{t('specialFeatures.culturalSignificance.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4">
                {t('specialFeatures.culturalSignificance.description')}
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{t('specialFeatures.culturalSignificance.example1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{t('specialFeatures.culturalSignificance.example2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{t('specialFeatures.culturalSignificance.example3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              {t('cta.title')}
            </h2>
            <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
              {t('cta.description')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              {t('cta.startFree')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}