'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Clock, MapPin, Play, Pause, Zap, Sun, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { GuideData, GuideChapter } from '@/types/guide';

// Dynamic import for Map component
const MapWithRoute = dynamic(
  () => import('@/components/guide/MapWithRoute'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        Loading map...
      </div>
    )
  }
);

// Icon definitions
const ICONS = {
  PLAY: <Play className="w-7 h-7" />,
  PAUSE: <Pause className="w-7 h-7" />,
  BACK: <ArrowLeft className="w-7 h-7" />
};

// Props interface for the component
interface TourContentProps {
  locationName: string;
  offlineData: GuideData;
}

// Helper function to normalize POI names for API search
const normalizePOI = (titleOrLocation?: string): string => {
  if (!titleOrLocation) return '';
  return titleOrLocation
    .replace(/^\d+\.\s*/, '') // Remove leading numbers
    .replace(/\s*\(.*\)/g, '') // Remove parentheses and their content
    .trim();
};

// Hook to fetch coordinates for chapters that lack them
const useChaptersWithCoordinates = (chapters: GuideChapter[] = [], language: string) => {
  const [chaptersWithCoords, setChaptersWithCoords] = useState<GuideChapter[]>(chapters);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const chaptersNeedingCoords = chapters.filter(c => !c.lat || !c.lng);
    if (chaptersNeedingCoords.length === 0) {
        setChaptersWithCoords(chapters);
        return;
    }

    const fetchCoordinates = async () => {
      setIsLoading(true);
      try {
        const updatedChapters = await Promise.all(
          chapters.map(async (chapter) => {
            if (chapter.lat && chapter.lng) return chapter; // Already has coords

            try {
              const searchQuery = normalizePOI(chapter.title || chapter.location?.name || '');
              if (!searchQuery) return chapter;
              const response = await fetch(
                `/api/places/search?query=${encodeURIComponent(searchQuery)}&language=${language}`
              );
              if (!response.ok) return chapter;
              const data = await response.json();
              const place = data.results?.[0];
              if (place?.geometry?.location) {
                return {
                  ...chapter,
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                  coordinates: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng
                  }
                };
              }
              return chapter;
            } catch {
              return chapter; // Return original chapter on individual fetch error
            }
          })
        );
        setChaptersWithCoords(updatedChapters);
      } catch (err) {
        console.error("Failed to fetch coordinates", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoordinates();
  }, [chapters, language]);

  return { chapters: chaptersWithCoords, isLoading };
};


// The main presentational component
const TourContent: React.FC<TourContentProps> = ({ locationName, offlineData }) => {
  const { t } = useTranslation('guide');
  const { currentLanguage } = useLanguage();

  // State for UI interaction
  const [activeChapter, setActiveChapter] = useState<number | null>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Memoized data extraction from props
  const { overview, route, realTimeGuide, metadata } = offlineData;
  const chapters = useMemo(() => realTimeGuide?.chapters || [], [realTimeGuide]);
  const keyFacts = useMemo(() => overview.keyFacts || [], [overview]);

  // Fetch coordinates for chapters
  const { chapters: chaptersWithCoords, isLoading: isLoadingCoords } = 
    useChaptersWithCoordinates(chapters, currentLanguage);

  // Audio player controls
  const togglePlayPause = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(err => console.error("Audio play failed:", err));
    }
  }, [isPlaying]);

  const handleChapterSelect = useCallback((index: number) => {
    setActiveChapter(index);
    setIsPlaying(false);
    if (audioRef.current) {
        audioRef.current.pause();
        const newSrc = chapters[index]?.audioUrl;
        if (newSrc) {
            audioRef.current.src = newSrc;
        }
    }
  }, [chapters]);

  // Effect to handle audio source change when activeChapter changes
  useEffect(() => {
    if (activeChapter === null || !audioRef.current) return;
    const audioUrl = chapters[activeChapter]?.audioUrl;
    if (audioUrl) {
      audioRef.current.src = audioUrl;
      if(isPlaying) {
        audioRef.current.play().catch(e => console.error("Failed to autoplay:", e));
      }
    }
  }, [activeChapter, chapters, isPlaying]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label={t('back', 'Back')}
          >
            {ICONS.BACK}
          </button>
          <h1 className="text-xl font-semibold text-gray-900 truncate px-2">
            {overview?.title || locationName}
          </h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Overview Section */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{overview.title}</h2>
            {overview.summary && <p className="text-lg text-gray-600 mb-4">{overview.summary}</p>}
            {overview.narrativeTheme && (
                <p className="text-sm italic text-gray-500 mb-4">{t('theme', 'Theme')}: {overview.narrativeTheme}</p>
            )}
            {overview.visitInfo && (
                <div className="flex items-center space-x-4 text-sm text-gray-700">
                    {overview.visitInfo.duration && <span><Clock size={16} className="inline mr-1"/>{overview.visitInfo.duration} {t('minutes_short', 'min')}</span>}
                    {overview.visitInfo.difficulty && <span><Zap size={16} className="inline mr-1"/>{overview.visitInfo.difficulty}</span>}
                    {overview.visitInfo.season && <span><Sun size={16} className="inline mr-1"/>{overview.visitInfo.season}</span>}
                </div>
            )}
        </section>

        {/* Key Facts */}
        {keyFacts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('key_facts', 'Key Facts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keyFacts.map((fact, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-900">{fact.title}</h3>
                  {fact.description && <p className="text-gray-600 mt-1">{fact.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Route */}
        {route?.steps && route.steps.length > 0 && (
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{t('recommended_route', 'Recommended Route')}</h2>
                <div className="bg-white p-4 rounded-lg shadow">
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        {route.steps.map((step, index) => (
                            <li key={index}>
                                <span className="font-semibold">{step.title}</span>
                                <span className="text-sm text-gray-500 ml-2">({step.location})</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        )}

        {/* Audio Player and Chapters */}
        {chapters.length > 0 && (
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{t('real_time_guide', 'Real-Time Guide')}</h2>
                {/* Audio Player */}
                <div className="bg-white rounded-lg shadow p-4 sticky top-[72px] z-10 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                {activeChapter !== null && chapters[activeChapter] 
                                ? `${activeChapter + 1}. ${chapters[activeChapter].title}`
                                : t('audio_guide', 'Audio Guide')}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {activeChapter !== null && chapters[activeChapter]?.duration 
                                ? `${chapters[activeChapter].duration} ${t('minutes', 'min')}`
                                : t('select_chapter', 'Select a chapter to begin')}
                            </p>
                        </div>
                        <div className="flex space-x-4 pl-4">
                            <button
                                onClick={togglePlayPause}
                                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400"
                                disabled={activeChapter === null}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? ICONS.PAUSE : ICONS.PLAY}
                            </button>
                            <audio
                                ref={audioRef}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                            />
                        </div>
                    </div>
                </div>

                {/* Chapters List */}
                <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                        <div
                            key={chapter.id || index}
                            className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all duration-300`}
                            onClick={() => handleChapterSelect(index)}
                        >
                            <div className={`flex items-center justify-between transition-colors ${activeChapter === index ? 'text-blue-600' : ''}`}>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{`${index + 1}. ${chapter.title}`}</h4>
                                </div>
                                {chapter.duration && (
                                    <div className="flex items-center text-sm text-gray-500 pl-4">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {chapter.duration} {t('minutes', 'min')}
                                    </div>
                                )}
                                <ChevronDown className={`w-5 h-5 ml-2 transform transition-transform ${activeChapter === index ? 'rotate-180' : ''}`} />
                            </div>
                            {activeChapter === index && (
                                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700 space-y-3">
                                    {chapter.description && <p className="text-base">{chapter.description}</p>}
                                    {chapter.sceneDescription && <p className="text-sm italic text-gray-500">{chapter.sceneDescription}</p>}
                                    
                                    {chapter.narrativeLayers && (
                                        <div className="p-3 bg-gray-50 rounded-md space-y-2">
                                            {chapter.narrativeLayers.coreNarrative && <p><span className="font-semibold">{t('narrative_core', 'Core Story')}:</span> {chapter.narrativeLayers.coreNarrative}</p>}
                                            {chapter.narrativeLayers.humanStories && <p><span className="font-semibold">{t('narrative_human', 'Human Stories')}:</span> {chapter.narrativeLayers.humanStories}</p>}
                                            {chapter.narrativeLayers.architectureDeepDive && <p><span className="font-semibold">{t('narrative_architecture', 'Architecture')}:</span> {chapter.narrativeLayers.architectureDeepDive}</p>}
                                            {chapter.narrativeLayers.sensoryBehindTheScenes && <p><span className="font-semibold">{t('narrative_sensory', 'Behind the Scenes')}:</span> {chapter.narrativeLayers.sensoryBehindTheScenes}</p>}
                                        </div>
                                    )}

                                    {chapter.nextDirection && (
                                        <div className="mt-3 flex items-center text-blue-600 font-semibold">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>{chapter.nextDirection}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}
      </main>
    </div>
  );
};

export default TourContent;
