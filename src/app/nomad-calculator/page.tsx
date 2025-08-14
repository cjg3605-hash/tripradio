'use client';

import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
// 20개 노마드 도시 대규모 데이터 (2024년 기준, Nomad List 등 참조)
const getNomadCities = (t: (key: string) => string) => [
  // 유럽 (최고 노마드 도시들)
  {
    name: '리스본',
    country: '포르투갈',
    emoji: '🇵🇹',
    monthlyBudget: { min: 1200, max: 2000, currency: '€' },
    wifiSpeed: { avg: 95, rating: 'excellent' },
    timezone: 'GMT+0',
    coworkingSpaces: 45,
    nomadScore: 9.2,
    highlights: [t('cities.lisbon.highlights.timezone'), t('cities.lisbon.highlights.community'), t('cities.lisbon.highlights.weather')],
    livingCosts: { accommodation: 600, food: 300, transport: 40, coworking: 150, entertainment: 200 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '베르린',
    country: '독일',
    emoji: '🇩🇪',
    monthlyBudget: { min: 1500, max: 2500, currency: '€' },
    wifiSpeed: { avg: 88, rating: 'excellent' },
    timezone: 'GMT+1',
    coworkingSpaces: 78,
    nomadScore: 9.0,
    highlights: [t('cities.berlin.highlights.startup'), t('cities.berlin.highlights.culture'), t('cities.berlin.highlights.beer')],
    livingCosts: { accommodation: 800, food: 400, transport: 60, coworking: 180, entertainment: 300 },
    region: 'europe',
    visaFree: 90,
    bestSeason: 'May-Sep'
  },
  {
    name: '창구',
    country: '인도네시아',
    emoji: '🇮🇩', 
    monthlyBudget: { min: 800, max: 1500, currency: '$' },
    wifiSpeed: { avg: 50, rating: 'good' },
    timezone: 'GMT+8',
    coworkingSpaces: 25,
    nomadScore: 8.8,
    highlights: [t('cities.canggu.highlights.lowCost'), t('cities.canggu.highlights.beach'), t('cities.canggu.highlights.surfing')],
    livingCosts: { accommodation: 400, food: 200, transport: 50, coworking: 100, entertainment: 150 },
    region: 'asia',
    visaFree: 30,
    bestSeason: 'Apr-Oct'
  },
  {
    name: '치앙마이',
    country: '태국',
    emoji: '🇹🇭',
    monthlyBudget: { min: 600, max: 1200, currency: '$' },
    wifiSpeed: { avg: 45, rating: 'good' },
    timezone: 'GMT+7',
    coworkingSpaces: 18,
    nomadScore: 8.5,
    highlights: [t('cities.chiangmai.highlights.ultraLowCost'), t('cities.chiangmai.highlights.food'), t('cities.chiangmai.highlights.people')],
    livingCosts: { accommodation: 300, food: 150, transport: 30, coworking: 80, entertainment: 100 },
    region: 'asia',
    visaFree: 30,
    bestSeason: 'Nov-Mar'
  },
  {
    name: '호치민',
    country: '베트남',
    emoji: '🇻🇳',
    monthlyBudget: { min: 700, max: 1300, currency: '$' },
    wifiSpeed: { avg: 55, rating: 'good' },
    timezone: 'GMT+7',
    coworkingSpaces: 22,
    nomadScore: 8.3,
    highlights: [t('cities.hcmc.highlights.affordable'), t('cities.hcmc.highlights.vibrant'), t('cities.hcmc.highlights.food')],
    livingCosts: { accommodation: 350, food: 180, transport: 40, coworking: 90, entertainment: 120 },
    region: 'asia',
    visaFree: 45,
    bestSeason: 'Nov-Apr'
  },
  {
    name: '멕시코시티',
    country: '멕시코',
    emoji: '🇲🇽',
    monthlyBudget: { min: 900, max: 1600, currency: '$' },
    wifiSpeed: { avg: 65, rating: 'good' },
    timezone: 'GMT-6',
    coworkingSpaces: 35,
    nomadScore: 8.4,
    highlights: [t('cities.mexicocity.highlights.culture'), t('cities.mexicocity.highlights.food'), t('cities.mexicocity.highlights.art')],
    livingCosts: { accommodation: 500, food: 250, transport: 50, coworking: 120, entertainment: 180 },
    region: 'americas',
    visaFree: 180,
    bestSeason: 'Oct-Apr'
  }
];

export default function NomadCalculatorPage() {
  const t = useTranslations('nomadCalculator');
  const nomadCities = getNomadCities(t);
  
  const [selectedCity, setSelectedCity] = React.useState(nomadCities[0]);
  const [workingDays, setWorkingDays] = React.useState(22);
  const [coworkingDays, setCoworkingDays] = React.useState(10);
  const [diningOut, setDiningOut] = React.useState(15);
  const [entertainmentLevel, setEntertainmentLevel] = React.useState(50);
  const [accommodationType, setAccommodationType] = React.useState('apartment');

  const calculateCosts = () => {
    const costs = selectedCity.livingCosts;
    let accommodation = costs.accommodation;
    
    if (accommodationType === 'hostel') accommodation *= 0.4;
    else if (accommodationType === 'hotel') accommodation *= 1.8;
    
    const coworking = (coworkingDays / workingDays) * costs.coworking;
    const food = costs.food + (diningOut * 15); // $15 per dining out
    const entertainment = (entertainmentLevel / 50) * costs.entertainment;
    
    return {
      accommodation,
      coworking,
      food,
      transport: costs.transport,
      entertainment,
      total: accommodation + coworking + food + costs.transport + entertainment
    };
  };

  const monthlyBudget = calculateCosts();

  return (
    <>
      <KeywordPageSchema 
        keyword={t('keyword')}
        pagePath="/nomad-calculator"
        title={t('metadata.title')}
        description={t('metadata.description')}
        features={[t('features.calculator'), t('features.cities'), t('features.budget'), t('features.costs'), t('features.visa'), t('features.planning')]}
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600 mb-8">
              {t('badge')}
            </div>
            <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
              {t('hero.title')}
            </h1>
            <h2 className="text-2xl lg:text-3xl font-normal text-gray-700 mb-8">
              {t('hero.subtitle')}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
          </div>
        </section>

        {/* Calculator Section with Slider Styles */}
        <style jsx>{`
          .slider-gray::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #374151;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .slider-gray::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #374151;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `}</style>
        <section className="py-20 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                  {t('calculator.title')}
                </h2>
                <p className="text-lg text-gray-600">
                  {t('calculator.subtitle')}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Calculator Form */}
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-medium text-gray-900 mb-6">
                    {t('calculator.form.title')}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* City Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('calculator.form.city.label')}
                      </label>
                      <select
                        value={selectedCity.name}
                        onChange={(e) => setSelectedCity(nomadCities.find(city => city.name === e.target.value))}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]"
                      >
                        {nomadCities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}, {city.country}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Working Days */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('calculator.form.workingDays.label')} ({workingDays}{t('calculator.form.workingDays.unit')})
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="30"
                        value={workingDays}
                        onChange={(e) => setWorkingDays(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gray"
                      />
                    </div>

                    {/* Coworking Days */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('calculator.form.coworking.label')} ({coworkingDays}{t('calculator.form.coworking.unit')})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={workingDays}
                        value={coworkingDays}
                        onChange={(e) => setCoworkingDays(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gray"
                      />
                    </div>

                    {/* Accommodation Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('calculator.form.accommodation.label')}
                      </label>
                      <select
                        value={accommodationType}
                        onChange={(e) => setAccommodationType(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]"
                      >
                        <option value="hostel">{t('calculator.form.accommodation.options.hostel')}</option>
                        <option value="apartment">{t('calculator.form.accommodation.options.apartment')}</option>
                        <option value="hotel">{t('calculator.form.accommodation.options.hotel')}</option>
                      </select>
                    </div>

                    {/* Dining Out */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('calculator.form.dining.label')} ({diningOut}{t('calculator.form.dining.unit')})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={diningOut}
                        onChange={(e) => setDiningOut(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gray"
                      />
                    </div>

                    {/* Entertainment Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('calculator.form.entertainment.label')} ({entertainmentLevel}%)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={entertainmentLevel}
                        onChange={(e) => setEntertainmentLevel(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gray"
                      />
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium text-gray-900">
                      {t('calculator.results.title')}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{selectedCity.name}, {selectedCity.country}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${Math.round(monthlyBudget.total)}/{t('calculator.results.perMonth')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('calculator.results.items.accommodation')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.accommodation)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('calculator.results.items.food')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.food)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('calculator.results.items.coworking')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.coworking)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('calculator.results.items.transport')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.transport)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('calculator.results.items.entertainment')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.entertainment)}</span>
                    </div>
                  </div>

                  {/* City Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">{t('calculator.results.cityInfo.title')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t('calculator.results.cityInfo.nomadScore')}</span>
                        <div className="font-medium">{selectedCity.nomadScore}/10</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('calculator.results.cityInfo.wifi')}</span>
                        <div className="font-medium">{selectedCity.wifiSpeed.avg}Mbps</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('calculator.results.cityInfo.coworking')}</span>
                        <div className="font-medium">{selectedCity.coworkingSpaces}{t('calculator.results.cityInfo.spaces')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('calculator.results.cityInfo.visa')}</span>
                        <div className="font-medium">{selectedCity.visaFree}{t('calculator.results.cityInfo.days')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Cities */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
                {t('cities.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('cities.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {nomadCities.slice(0, 6).map((city) => (
                <div key={city.name} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{city.name}</h3>
                      <p className="text-sm text-gray-600">{city.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{t('cities.monthlyBudget')}</div>
                      <div className="font-bold text-gray-900">
                        {city.monthlyBudget.currency}{city.monthlyBudget.min}-{city.monthlyBudget.max}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {city.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {highlight}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t('cities.nomadScore')}: {city.nomadScore}/10</span>
                      <span>{t('cities.wifi')}: {city.wifiSpeed.avg}Mbps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nomad Tips */}
        <section className="py-20 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 tracking-tight">
                {t('tips.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('tips.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.0.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('tips.items.0.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-gray-500 rounded-sm"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.1.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('tips.items.1.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-4 h-6 bg-gray-600 rounded-sm"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.2.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('tips.items.2.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-gray-500 rounded-full"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.3.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('tips.items.3.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-3 h-3 bg-gray-600 rounded-full mr-1"></div>
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.4.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('tips.items.4.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-gray-500 rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-gray-500 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">{t('tips.items.5.title')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('tips.items.5.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32 bg-gray-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
                {t('finalCta.title')}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
                {t('finalCta.description')}
              </p>
              <Link 
                href="/trip-planner?type=nomad&focus=budget"
                className="inline-block bg-white text-gray-900 px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
              >
                {t('finalCta.button')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}