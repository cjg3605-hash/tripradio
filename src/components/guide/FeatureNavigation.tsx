'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Headphones, 
  MapPin, 
  Play,
  Navigation,
  Route,
  Clock,
  Star,
  ArrowRight,
  Waves
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FeatureNavigationProps {
  locationName: string;
  hasAudioContent?: boolean;
  hasRoute?: boolean;
  estimatedDuration?: number;
  className?: string;
}

const FeatureNavigation: React.FC<FeatureNavigationProps> = ({
  locationName,
  hasAudioContent = true,
  hasRoute = true,
  estimatedDuration = 30,
  className = ''
}) => {
  const { currentLanguage, t } = useLanguage();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'live-tour',
      title: t('features.liveTour'),
      description: t('features.liveTourDesc'),
      icon: Navigation,
      href: `/guide/${encodeURIComponent(locationName)}/live`,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700',
      badge: t('features.recommended'),
      features: [
        t('features.realTimeTracking'),
        t('features.audioGuide'),
        t('features.smartAlerts')
      ]
    },
    {
      id: 'audio-guide',
      title: t('features.audioGuide'),
      description: t('features.audioGuideDesc'),
      icon: Headphones,
      href: `/guide/${encodeURIComponent(locationName)}/tour`,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700',
      badge: hasAudioContent ? t('features.available') : t('features.generating'),
      features: [
        t('features.personalizedVoice'),
        t('features.offlineMode'),
        t('features.bookmarks')
      ]
    },
    {
      id: 'route-planner',
      title: t('features.routePlanner'),
      description: t('features.routePlannerDesc'),
      icon: Route,
      href: `/guide/${encodeURIComponent(locationName)}/route`,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      hoverColor: 'from-green-600 to-green-700',
      badge: hasRoute ? `${estimatedDuration}${t('common.minutes')}` : t('features.planning'),
      features: [
        t('features.optimizedPath'),
        t('features.timeEstimates'),
        t('features.mustVisitSpots')
      ]
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('features.chooseYourExperience')}
        </h2>
        <p className="text-gray-600">
          {t('features.experienceDescription')}
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isHovered = hoveredFeature === feature.id;
          
          return (
            <Link
              key={feature.id}
              href={feature.href}
              className="block group"
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="relative bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300 transform hover:-translate-y-1">
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    feature.id === 'live-tour' 
                      ? 'bg-blue-100 text-blue-700'
                      : feature.badge === t('features.available')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {feature.badge}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg ${
                  isHovered ? feature.hoverColor : feature.color
                } flex items-center justify-center mb-4 transition-all duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 mb-4">
                  {feature.features.map((featureItem, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span className="text-xs text-gray-500">
                        {featureItem}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {t('features.startExperience')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {estimatedDuration}{t('common.minutes')}
            </span>
          </div>
          <p className="text-xs text-gray-500">{t('features.avgDuration')}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              5-8 {t('features.pois')}
            </span>
          </div>
          <p className="text-xs text-gray-500">{t('features.keyLocations')}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('features.aiPowered')}
            </span>
          </div>
          <p className="text-xs text-gray-500">{t('features.personalizedExp')}</p>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Waves className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              💡 {t('features.proTip')}
            </h4>
            <p className="text-sm text-blue-700">
              {t('features.proTipDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureNavigation;