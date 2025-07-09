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
  guideData: GuideData;
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
const TourContent: React.FC<TourContentProps> = ({ guideData }) => {
  const { t } = useTranslation('guide');
  const { currentLanguage } = useLanguage();

  // State for UI interaction
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState<number | null>(null); // Track loading state by chapter index
  const audioRef = useRef<HTMLAudioElement>(null);

  // Memoized data extraction from props
  const { overview, route, realTimeGuide, metadata } = guideData;
  const chapters = useMemo(() => realTimeGuide?.chapters || [], [realTimeGuide]);
  const keyFacts = useMemo(() => overview.keyFacts || [], [overview]);

  const handlePlayPause = useCallback(async (index: number) => {
    if (activeChapter === index && isPlaying) {
      audioRef.current?.pause();
      return;
    }

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }

    setActiveChapter(index);
    setIsTtsLoading(index);

    const chapter = chapters[index];
    if (!chapter) {
      setIsTtsLoading(null);
      return;
    }

    const textToSpeak = [
      chapter.title,
      chapter.sceneDescription,
      chapter.coreNarrative,
      chapter.humanStories,
      chapter.architectureDeepDive,
      chapter.sensoryBehindTheScenes
    ].filter(Boolean).join(' ');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: currentLanguage,
          guideId: guideData.metadata.originalLocationName, // Using locationName as a unique ID for the guide
          chapterId: chapter.id || index
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate TTS audio');
      }

      const { url } = await response.json();

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => console.error(e));
      }
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsTtsLoading(null);
    }
  }, [chapters, activeChapter, isPlaying, currentLanguage, guideData.metadata.originalLocationName]);

  const handleChapterSelect = useCallback((index: number) => {
    setActiveChapter(prev => (prev === index ? null : index));
  }, []);

  // Effect to handle audio player state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100" aria-label={t('back', 'Back')}>
            {ICONS.BACK}
          </button>
          <h1 className="text-xl font-semibold text-gray-900 truncate px-2">
            {overview?.title || 'Tour Guide'}
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{overview.title}</h2>
            {overview.summary && <p className="text-lg text-gray-600 mb-4">{overview.summary}</p>}
        </section>

        {route?.steps && route.steps.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('recommended_route', 'Recommended Route')}</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <ol className="list-decimal list-inside space-y-3">
                {route.steps.map((step) => (
                  <li key={step.step} className="text-gray-800">
                    <span className="font-semibold text-gray-900">{step.title}</span>: {step.location}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {chapters.length > 0 && (
            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{t('real_time_guide', 'Real-Time Guide')}</h2>
                <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                        <div key={chapter.id || index} className={`bg-white p-4 rounded-lg shadow transition-all duration-300`}>
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => handleChapterSelect(index)}>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate">{index === 0 ? chapter.title : `${index}. ${chapter.title}`}</h4>
                                </div>
                                <button 
                                   onClick={(e) => { e.stopPropagation(); handlePlayPause(index); }}
                                   className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4"
                                   aria-label={isPlaying && activeChapter === index ? 'Pause' : 'Play'}
                                   disabled={isTtsLoading === index}
                                >
                                  {isTtsLoading === index ? (
                                    <Zap className="w-5 h-5 text-gray-400 animate-pulse" />
                                  ) : (
                                    isPlaying && activeChapter === index ? <Pause className="w-5 h-5 text-blue-600" /> : <Play className="w-5 h-5 text-gray-600" />
                                  )}
                                </button>
                                <ChevronDown className={`w-5 h-5 ml-2 transform transition-transform ${activeChapter === index ? 'rotate-180' : ''}`} />
                            </div>
                            {activeChapter === index && (
                                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700 space-y-4 prose prose-sm max-w-none">
                                    {chapter.sceneDescription && <p className="italic text-gray-600">{chapter.sceneDescription}</p>}
                                    {chapter.coreNarrative && <p>{chapter.coreNarrative}</p>}
                                    {chapter.humanStories && <p>{chapter.humanStories}</p>}
                                    {chapter.architectureDeepDive && <p>{chapter.architectureDeepDive}</p>}
                                    {chapter.sensoryBehindTheScenes && <p>{chapter.sensoryBehindTheScenes}</p>}

                                    {chapter.nextDirection && (
                                        <div className="not-prose mt-4 flex items-center text-blue-600 font-semibold">
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
      <audio ref={audioRef} />
    </div>
  );
};

export default TourContent;
