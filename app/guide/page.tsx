'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

// 인기 가이드 데이터 (실제 sitemap.xml 기반)
const popularGuides = [
  // 유럽
  { name: 'Eiffel Tower', nameKo: '에펠탑', country: 'France', continent: 'Europe', emoji: '🗼' },
  { name: 'Colosseum', nameKo: '콜로세움', country: 'Italy', continent: 'Europe', emoji: '🏛️' },
  { name: 'Sagrada Familia', nameKo: '사그라다 파밀리아', country: 'Spain', continent: 'Europe', emoji: '⛪' },
  { name: 'Louvre Museum', nameKo: '루브르 박물관', country: 'France', continent: 'Europe', emoji: '🎨' },
  { name: 'Palace of Versailles', nameKo: '베르사유 궁전', country: 'France', continent: 'Europe', emoji: '👑' },
  { name: 'Big Ben', nameKo: '빅벤', country: 'United Kingdom', continent: 'Europe', emoji: '🕰️' },

  // 아시아
  { name: 'Great Wall of China', nameKo: '만리장성', country: 'China', continent: 'Asia', emoji: '🏯' },
  { name: 'Taj Mahal', nameKo: '타지마할', country: 'India', continent: 'Asia', emoji: '🕌' },
  { name: 'Mount Fuji', nameKo: '후지산', country: 'Japan', continent: 'Asia', emoji: '🗻' },
  { name: 'Gyeongbokgung Palace', nameKo: '경복궁', country: 'South Korea', continent: 'Asia', emoji: '🏰' },
  { name: 'Angkor Wat', nameKo: '앙코르와트', country: 'Cambodia', continent: 'Asia', emoji: '🛕' },
  { name: 'Petronas Twin Towers', nameKo: '페트로나스 트윈 타워', country: 'Malaysia', continent: 'Asia', emoji: '🏙️' },

  // 아메리카
  { name: 'Statue of Liberty', nameKo: '자유의 여신상', country: 'USA', continent: 'Americas', emoji: '🗽' },
  { name: 'Machu Picchu', nameKo: '마추픽추', country: 'Peru', continent: 'Americas', emoji: '⛰️' },
  { name: 'Christ the Redeemer', nameKo: '구세주 그리스도상', country: 'Brazil', continent: 'Americas', emoji: '✝️' },
  { name: 'Grand Canyon', nameKo: '그랜드캐니언', country: 'USA', continent: 'Americas', emoji: '🏔️' },
  { name: 'Niagara Falls', nameKo: '나이아가라 폭포', country: 'USA/Canada', continent: 'Americas', emoji: '💦' },
  { name: 'Times Square', nameKo: '타임스퀘어', country: 'USA', continent: 'Americas', emoji: '🌃' },

  // 아프리카/오세아니아
  { name: 'Pyramids of Giza', nameKo: '기자 피라미드', country: 'Egypt', continent: 'Africa', emoji: '🔺' },
  { name: 'Sydney Opera House', nameKo: '시드니 오페라하우스', country: 'Australia', continent: 'Oceania', emoji: '🎭' },
];

export default function GuidePage() {
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  const continents = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'];

  const filteredGuides = popularGuides.filter(guide => {
    const matchesSearch = searchQuery === '' ||
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.nameKo.includes(searchQuery) ||
      guide.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesContinent = selectedContinent === 'All' || guide.continent === selectedContinent;

    return matchesSearch && matchesContinent;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
            🎧 AI Audio Guide
          </div>
          <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            Travel Guides
            <span className="font-semibold block mt-2">Worldwide Destinations</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Explore the world&apos;s most iconic landmarks with AI-powered audio guides. Available in 5 languages, completely free.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Continent Filter */}
          <div className="flex flex-wrap gap-3 justify-center">
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedContinent === continent
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {continent === 'All' && '🌍'}
                {continent === 'Europe' && '🇪🇺'}
                {continent === 'Asia' && '🌏'}
                {continent === 'Americas' && '🌎'}
                {continent === 'Africa' && '🌍'}
                {continent === 'Oceania' && '🇦🇺'}
                {' '}{continent}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Showing {filteredGuides.length} destination{filteredGuides.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGuides.map((guide, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className="text-4xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {guide.emoji}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
                    {currentLanguage === 'ko' ? guide.nameKo : guide.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 text-center">{guide.country}</p>

                  <div className="space-y-2">
                    <Link
                      href={`/guide/ko/${encodeURIComponent(guide.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="block w-full bg-black text-white text-center py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      🎧 Listen to Guide
                    </Link>
                    <Link
                      href={`/podcast/ko/${encodeURIComponent(guide.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="block w-full bg-gray-100 text-gray-700 text-center py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      🎙️ Podcast
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No destinations found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedContinent('All');
                }}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
              Can&apos;t find your destination?
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Use our AI-powered search to create a personalized audio guide for any location in the world.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Create Custom Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
