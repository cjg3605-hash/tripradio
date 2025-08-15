'use client';

import Link from 'next/link';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { KeywordPageSchema } from '@/components/seo/KeywordPageSchema';
// 20개 노마드 도시 대규모 데이터 (2024년 기준, Nomad List 등 참조)
const getNomadCities = (t: (key: string) => string) => [
  // 유럽 (최고 노마드 도시들)
  {
    name: '리스본',
    country: '포르투갈',
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
  const { t } = useLanguage();
  
  // nomad-calculator 전용 번역 함수
  const nomadT = (key: string): string => {
    const translation = t(`nomadCalculator.${key}`);
    return Array.isArray(translation) ? translation[0] || '' : translation || '';
  };
  
  const nomadCities = getNomadCities(nomadT);
  
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
        keyword={nomadT('keyword')}
        pagePath="/nomad-calculator"
        title={nomadT('metadata.title')}
        description={nomadT('metadata.description')}
        features={[nomadT('features.calculator'), nomadT('features.cities'), nomadT('features.budget'), nomadT('features.costs'), nomadT('features.visa'), nomadT('features.planning')]}
      />
      
      <div className="min-h-screen" style={{ 
        /* Typography tokens */
        '--font-family-base': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
        '--fs-h1-d': '40px', '--fs-h1-t': '34px', '--fs-h1-m': '28px',
        '--fs-h2-d': '32px', '--fs-h2-t': '28px', '--fs-h2-m': '24px',
        '--fs-h3-d': '24px', '--fs-h3-t': '22px', '--fs-h3-m': '20px',
        '--fs-body-l-d': '18px', '--fs-body-l-t': '18px', '--fs-body-l-m': '16px',
        '--fs-body-d': '16px', '--fs-body-t': '16px', '--fs-body-m': '14px',
        '--fs-body-s-d': '14px', '--fs-body-s-t': '14px', '--fs-body-s-m': '13px',
        '--lh-heading': '1.2', '--lh-body': '1.5',
        /* Radius and shadow tokens */
        '--radius-sm': '4px', '--radius-md': '8px', '--radius-lg': '16px',
        '--shadow-sm': '0 1px 2px rgba(0,0,0,.06)', '--shadow-md': '0 4px 10px rgba(0,0,0,.08)', '--shadow-lg': '0 12px 24px rgba(0,0,0,.12)',
        /* Spacing tokens */
        '--space-2xs': '4px', '--space-xs': '8px', '--space-sm': '12px', '--space-md': '16px', '--space-lg': '24px', '--space-xl': '40px', '--space-2xl': '64px',
        /* Color tokens - styleguide.md compliant */
        '--color-bg': '#ffffff', '--color-bg-alt': '#f8f8f8', '--color-text-high': '#000000', '--color-text-medium': '#555555', '--color-text-low': 'rgba(0,0,0,0.54)',
        '--color-primary': '#007AFF', '--color-primary-hover': '#005FCC', '--color-border': '#e6e6e6',
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-family-base)'
      } as React.CSSProperties}>
        {/* Hero Section */}
        <section className="container mx-auto" style={{ paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)', paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-lg)' } as React.CSSProperties}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-light tracking-tight" style={{ fontSize: 'clamp(var(--fs-h1-d), 4vw, 56px)', lineHeight: 'var(--lh-heading)', color: 'var(--color-text-high)', marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
              {nomadT('hero.title')}
            </h1>
            <p className="font-light max-w-3xl mx-auto" style={{ fontSize: 'clamp(var(--fs-body-d), 2vw, var(--fs-body-l-d))', lineHeight: 'var(--lh-body)', color: 'var(--color-text-medium)', marginBottom: 'var(--space-xl)' } as React.CSSProperties}>
              당신의 라이프스타일에 맞는 도시를 찾아보세요
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
            background: #555555;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .slider-gray::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #555555;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `}</style>
        <section style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)', backgroundColor: 'var(--color-bg-alt)' } as React.CSSProperties}>
          <div className="container mx-auto" style={{ paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)' } as React.CSSProperties}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' } as React.CSSProperties}>
                <h2 className="text-3xl lg:text-4xl font-light" style={{ color: 'var(--color-text-high)', marginBottom: 'var(--space-lg)' } as React.CSSProperties}>
                  {nomadT('calculator.title')}
                </h2>
                <p className="text-lg font-light" style={{ color: 'var(--color-text-medium)' } as React.CSSProperties}>
                  {nomadT('calculator.subtitle')}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Calculator Form */}
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-medium text-black mb-6">
                    {nomadT('calculator.form.title')}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* City Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {nomadT('calculator.form.city.label')}
                      </label>
                      <select
                        value={selectedCity.name}
                        onChange={(e) => {
                          const foundCity = nomadCities.find(city => city.name === e.target.value);
                          if (foundCity) setSelectedCity(foundCity);
                        }}
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
                        {nomadT('calculator.form.workingDays.label')} ({workingDays}{nomadT('calculator.form.workingDays.unit')})
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
                        {nomadT('calculator.form.coworking.label')} ({coworkingDays}{nomadT('calculator.form.coworking.unit')})
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
                        {nomadT('calculator.form.accommodation.label')}
                      </label>
                      <select
                        value={accommodationType}
                        onChange={(e) => setAccommodationType(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[44px]"
                      >
                        <option value="hostel">{nomadT('calculator.form.accommodation.options.hostel')}</option>
                        <option value="apartment">{nomadT('calculator.form.accommodation.options.apartment')}</option>
                        <option value="hotel">{nomadT('calculator.form.accommodation.options.hotel')}</option>
                      </select>
                    </div>

                    {/* Dining Out */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {nomadT('calculator.form.dining.label')} ({diningOut}{nomadT('calculator.form.dining.unit')})
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
                        {nomadT('calculator.form.entertainment.label')} ({entertainmentLevel}%)
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
                    <h3 className="text-xl font-medium text-black">
                      {nomadT('calculator.results.title')}
                    </h3>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{selectedCity.name}, {selectedCity.country}</div>
                      <div className="text-2xl font-bold text-black">
                        ${Math.round(monthlyBudget.total)}/{nomadT('calculator.results.perMonth')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-[#555555] font-light">{nomadT('calculator.results.items.accommodation')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.accommodation)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-[#555555] font-light">{nomadT('calculator.results.items.food')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.food)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-[#555555] font-light">{nomadT('calculator.results.items.coworking')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.coworking)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-[#555555] font-light">{nomadT('calculator.results.items.transport')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.transport)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-[#555555] font-light">{nomadT('calculator.results.items.entertainment')}</span>
                      <span className="font-medium">${Math.round(monthlyBudget.entertainment)}</span>
                    </div>
                  </div>

                  {/* City Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-black mb-3">{nomadT('calculator.results.cityInfo.title')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{nomadT('calculator.results.cityInfo.nomadScore')}</span>
                        <div className="font-medium">{selectedCity.nomadScore}/10</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{nomadT('calculator.results.cityInfo.wifi')}</span>
                        <div className="font-medium">{selectedCity.wifiSpeed.avg}Mbps</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{nomadT('calculator.results.cityInfo.coworking')}</span>
                        <div className="font-medium">{selectedCity.coworkingSpaces}{nomadT('calculator.results.cityInfo.spaces')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">{nomadT('calculator.results.cityInfo.visa')}</span>
                        <div className="font-medium">{selectedCity.visaFree}{nomadT('calculator.results.cityInfo.days')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Cities */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-light text-black mb-4 tracking-tight">
                {nomadT('cities.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {nomadT('cities.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {nomadCities.slice(0, 6).map((city) => (
                <div key={city.name} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-black">{city.name}</h3>
                      <p className="text-sm text-[#555555] font-light">{city.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{nomadT('cities.monthlyBudget')}</div>
                      <div className="font-bold text-black">
                        {city.monthlyBudget.currency}{city.monthlyBudget.min}-{city.monthlyBudget.max}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {city.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center text-sm text-[#555555] font-light">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                        {highlight}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{nomadT('cities.nomadScore')}: {city.nomadScore}/10</span>
                      <span>{nomadT('cities.wifi')}: {city.wifiSpeed.avg}Mbps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nomad Tips */}
        <section className="py-12 lg:py-16 bg-[#F8F8F8]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-light text-black mb-4 tracking-tight">
                {nomadT('tips.title')}
              </h2>
              <p className="text-lg text-[#555555] font-light">
                {nomadT('tips.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{nomadT('tips.items.0.title')}</h3>
                <p className="text-[#555555] font-light text-sm">
                  {nomadT('tips.items.0.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-[#F8F8F8]0 rounded-sm"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{nomadT('tips.items.1.title')}</h3>
                <p className="text-[#555555] font-light text-sm">
                  {nomadT('tips.items.1.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-4 h-6 bg-gray-600 rounded-sm"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{nomadT('tips.items.2.title')}</h3>
                <p className="text-[#555555] font-light text-sm">
                  {nomadT('tips.items.2.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-gray-500 rounded-full"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{nomadT('tips.items.3.title')}</h3>
                <p className="text-[#555555] font-light text-sm">
                  {nomadT('tips.items.3.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-3 h-3 bg-gray-600 rounded-full mr-1"></div>
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{nomadT('tips.items.4.title')}</h3>
                <p className="text-[#555555] font-light text-sm">
                  {nomadT('tips.items.4.description')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-gray-500 rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-[#F8F8F8]0 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-black mb-3">{nomadT('tips.items.5.title')}</h3>
                <p className="text-[#555555] font-light text-sm">
                  {nomadT('tips.items.5.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 lg:py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight">
                {nomadT('finalCta.title')}
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 mb-12 leading-relaxed">
                {nomadT('finalCta.description')}
              </p>
              <Link 
                href="/trip-planner?type=nomad&focus=budget"
                className="inline-block bg-white text-black px-10 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg min-h-[44px] flex items-center justify-center"
              >
                {nomadT('finalCta.button')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}