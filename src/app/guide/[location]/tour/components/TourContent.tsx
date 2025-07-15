'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { GuideData } from '@/types/guide';
import MapWithRoute from '@/components/guide/MapWithRoute';
import { getOrCreateChapterAudio } from '@/lib/tts-gcs';
import crypto from 'crypto';

interface TourContentProps {
  guide: GuideData;
  language: string;
}

export default function TourContent({ guide, language }: TourContentProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);

  const chapters = guide.realTimeGuide?.chapters || [];
  const currentChapterData = chapters[currentChapter];
  
  // 가이드 ID 생성 (일관된 식별자)
  const guideId = crypto.createHash('md5').update(`${guide.metadata.originalLocationName}_${guide.overview.title}`).digest('hex');

  // 오디오 이벤트 리스너 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setAudioProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      // 자동으로 다음 챕터로 이동
      if (currentChapter < chapters.length - 1) {
        setCurrentChapter(prev => prev + 1);
      }
    };

    const handleError = () => {
      setIsPlaying(false);
      setError('오디오 재생 중 오류가 발생했습니다.');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentChapter, chapters.length]);

  // 챕터 변경 시 오디오 초기화
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
      setIsPlaying(false);
      setAudioProgress(0);
      setDuration(0);
      setError(null);
    }
  }, [currentChapter]);

  const handlePlayPause = async () => {
    if (!currentChapterData?.narrative) return;

    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError(null);

      if (isPlaying) {
        // 일시정지
        audio.pause();
        setIsPlaying(false);
        return;
      }

      // 새로운 오디오 로드가 필요한 경우
      if (!audio.src || audio.ended) {
        setIsLoading(true);
        console.log('🎵 챕터 오디오 로딩 시작...', { 
          guideId, 
          chapterIndex: currentChapter, 
          language 
        });

        try {
          // 🎯 새로운 챕터별 오디오 시스템 사용
          const audioUrl = await getOrCreateChapterAudio(
            guideId,
            currentChapter,
            currentChapterData.narrative,
            language
          );

          audio.src = audioUrl;
          console.log('✅ 챕터 오디오 로드 완료:', { 
            chapter: currentChapter,
            url: audioUrl.substring(0, 50) + '...'
          });
        } catch (ttsError) {
          console.error('❌ 챕터 오디오 생성 실패:', ttsError);
          setError('음성 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
          return;
        } finally {
          setIsLoading(false);
        }
      }

      // 재생
      await audio.play();
      setIsPlaying(true);

    } catch (playError) {
      console.error('❌ 오디오 재생 실패:', playError);
      setError('오디오 재생에 실패했습니다.');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setAudioProgress(0);
  };

  const handleChapterChange = (newChapterIndex: number) => {
    if (newChapterIndex >= 0 && newChapterIndex < chapters.length) {
      setCurrentChapter(newChapterIndex);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentChapterData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">투어 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 오디오 엘리먼트 */}
      <audio ref={audioRef} preload="none" />

      {/* 헤더 */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{guide.overview.title}</h1>
        <p className="text-gray-600">
          챕터 {currentChapter + 1} / {chapters.length}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          가이드 ID: {guideId.substring(0, 8)}...
        </p>
      </div>

      {/* 맵 */}
      <div className="mb-8">
        <MapWithRoute 
          chapters={chapters}
          activeChapter={currentChapter}
          onMarkerClick={handleChapterChange}
        />
      </div>

      {/* 현재 챕터 제목 */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{currentChapterData.title}</h2>
      </div>

      {/* 오디오 컨트롤 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              size="lg"
              className="rounded-full"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              disabled={!duration}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Volume2 className="w-4 h-4 text-gray-500" />
          </div>

          <div className="text-sm text-gray-500">
            {duration > 0 && (
              <>
                {formatTime((audioProgress / 100) * duration)} / {formatTime(duration)}
              </>
            )}
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${audioProgress}%` }}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* 텍스트 내용 */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="prose max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {currentChapterData.narrative}
          </p>
        </div>
      </div>

      {/* 챕터 네비게이션 */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => handleChapterChange(currentChapter - 1)}
          disabled={currentChapter === 0}
          variant="outline"
        >
          이전 챕터
        </Button>

        <div className="flex space-x-2">
          {chapters.map((_, index) => (
            <button
              key={index}
              onClick={() => handleChapterChange(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentChapter
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={() => handleChapterChange(currentChapter + 1)}
          disabled={currentChapter === chapters.length - 1}
          variant="outline"
        >
          다음 챕터
        </Button>
      </div>
    </div>
  );
}