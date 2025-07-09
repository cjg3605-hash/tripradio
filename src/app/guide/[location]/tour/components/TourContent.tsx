'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Clock, MapPin, Play, Pause, Volume2, StopCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from 'next-auth/react';
import { REALTIME_GUIDE_KEYS } from '@/lib/ai/prompts';

// Types
interface Chapter {
  id: number;
  title: string;
  description?: string;
  duration?: number | string;
  audioUrl?: string;
  sceneDescription?: string;
  narrativeLayers?: {
    coreNarrative?: string;
    architectureDeepDive?: string;
    humanStories?: string;
    sensoryBehindTheScenes?: string;
    [key: string]: any;
  };
  nextDirection?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  realTimeScript?: string;
  location?: {
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Step {
  step: number;
  location: string;
  title: string;
  [key: string]: any;
}

interface Overview {
  title: string;
  narrativeTheme?: string;
  keyFacts?: Array<{
    title: string;
    description: string;
  }>;
  visitInfo?: {
    duration?: number | string;
    difficulty?: string;
    season?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface TourData {
  content?: {
    overview?: Overview;
    route?: { steps: Step[] };
    realTimeGuide?: { chapters: Chapter[] };
    RealTimeGuide?: { chapters: Chapter[] };
    '실시간가이드'?: { chapters: Chapter[] };
    personalizedNote?: string;
    [key: string]: any;
  };
  overview?: Overview;
  route?: { steps: Step[] };
  realTimeGuide?: { chapters: Chapter[] };
  RealTimeGuide?: { chapters: Chapter[] };
  '실시간가이드'?: { chapters: Chapter[] };
  metadata?: {
    originalLocationName: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface TourContentProps {
  locationName: string;
  userProfile?: any;
  initialGuide?: TourData | null;
  offlineData?: TourData;
}

// Dynamic imports with loading states
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

// Icons
const ICONS = {
  PLAY: <Play className="w-7 h-7" />,
  PAUSE: <Pause className="w-7 h-7" />,
  STOP: <StopCircle className="w-7 h-7" />,
  VOLUME: <Volume2 className="w-7 h-7" />,
  CLOCK: <Clock className="w-7 h-7" />,
  MAP: <MapPin className="w-7 h-7" />,
  BACK: <ArrowLeft className="w-7 h-7" />
};

// Helper function to normalize POI names
const normalizePOI = (titleOrLocation?: string): string => {
  if (!titleOrLocation) return '';
  return titleOrLocation
    .replace(/^\d+\.\s*/, '') // Remove leading numbers
    .replace(/\s*\(.*?\)/g, '') // Remove parentheses and their content
    .trim();
};

// Hook to fetch coordinates for chapters
const useChaptersWithCoordinates = (chapters: Chapter[] = [], language: string) => {
  const [chaptersWithCoords, setChaptersWithCoords] = useState<Chapter[]>(chapters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chapters?.length) {
      setIsLoading(false);
      return;
    }

    const fetchCoordinates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedChapters = await Promise.all(
          chapters.map(async (chapter) => {
            try {
              const searchQuery = normalizePOI(chapter.title || chapter.location?.name || '');
              if (!searchQuery) return chapter;
              const response = await fetch(
                `/api/places/search?query=${encodeURIComponent(searchQuery)}&language=${language}`
              );
              if (!response.ok) throw new Error('Failed to fetch coordinates');
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
              return chapter;
            }
          })
        );
        setChaptersWithCoords(updatedChapters);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch coordinates'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoordinates();
  }, [chapters, language]);

  return { chapters: chaptersWithCoords, isLoading, error };
};

const TourContent: React.FC<TourContentProps> = ({ locationName, userProfile, initialGuide, offlineData }) => {
  const { t } = useTranslation('guide');
  const { data: session } = useSession();
  const { currentLanguage } = useLanguage();
  
  // State management
  const [tourData, setTourData] = useState<TourData | null>(initialGuide || null);
  const [isLoading, setIsLoading] = useState(!initialGuide);
  const [error, setError] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Extract chapters from tour data
  const chapters = useMemo(() => {
    if (!tourData) return [];
    const realTimeGuide =
      tourData.content?.realTimeGuide?.chapters ||
      tourData.content?.RealTimeGuide?.chapters ||
      tourData.content?.['실시간가이드']?.chapters ||
      tourData.realTimeGuide?.chapters ||
      tourData.RealTimeGuide?.chapters ||
      tourData['실시간가이드']?.chapters ||
      [];
    return realTimeGuide;
  }, [tourData]);
  
  // Get coordinates for chapters
  const { chapters: chaptersWithCoords, isLoading: isLoadingCoords } = 
    useChaptersWithCoordinates(chapters, currentLanguage);
  
  // Load tour data
  const loadTourData = useCallback(async (forceRegenerate = false) => {
    if (!locationName || !currentLanguage) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: locationName,
          language: currentLanguage,
          forceRegenerate
        })
      });
      
      if (!response.ok) {
        throw new Error(t('error.loading_guide'));
      }
      
      const data = await response.json();
      setTourData(data);
      
    } catch (err) {
      console.error('Error loading tour data:', err);
      setError(err instanceof Error ? err.message : t('error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [locationName, currentLanguage, t]);
  
  // Initial load
  useEffect(() => {
    if (!initialGuide) {
      loadTourData();
    }
  }, [initialGuide, loadTourData]);
  
  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError(t('error.audio_playback'));
      });
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying, t]);
  
  // Handle chapter selection
  const handleChapterSelect = useCallback((chapterId: number) => {
    setActiveChapter(chapterId);
    // TODO: Implement chapter navigation logic
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">{t('error.title')}</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => loadTourData()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // Get overview data with fallbacks
  const overview = tourData?.content?.overview || tourData?.overview;
  const routeSteps = tourData?.content?.route?.steps || tourData?.route?.steps || [];
  const keyFacts = overview?.keyFacts || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label={t('back')}
          >
            {ICONS.BACK}
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {overview?.title || locationName}
          </h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Map Section */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-64 md:h-96 w-full relative">
              {chaptersWithCoords.length > 0 ? (
                <div className="h-full w-full">
                  <MapWithRoute
                    chapters={chaptersWithCoords}
                    activeChapter={typeof activeChapter === 'number' ? activeChapter : 0}
                    onMarkerClick={handleChapterSelect}
                  />
                </div>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">{t('map_loading')}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Audio Player */}
        <section className="mb-8 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {typeof activeChapter === 'number' && chapters[activeChapter] 
                  ? chapters[activeChapter].title 
                  : t('audio_guide')}
              </h2>
              <p className="text-sm text-gray-500">
                {typeof activeChapter === 'number' && chapters[activeChapter]?.duration 
                  ? `${chapters[activeChapter].duration} ${t('minutes')}`
                  : t('select_chapter')}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                disabled={activeChapter === null}
              >
                {isPlaying ? ICONS.PAUSE : ICONS.PLAY}
              </button>
              <audio
                ref={audioRef}
                src={typeof activeChapter === 'number' ? chapters[activeChapter]?.audioUrl : undefined}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          </div>
        </section>

        {/* Key Facts */}
        {keyFacts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('key_facts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keyFacts.map((fact, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-900">{fact.title}</h3>
                  <p className="text-gray-600 mt-1">{fact.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Chapters */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('chapters')}</h2>
          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <div
                key={index}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-colors ${
                  activeChapter === index ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleChapterSelect(index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{chapter.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {chapter.description}
                    </p>
                  </div>
                  {chapter.duration && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {chapter.duration} {t('minutes')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TourContent;
