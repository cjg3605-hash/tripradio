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

interface ChapterAudioState {
  isPlaying: boolean;
  isLoading: boolean;
  audioProgress: number;
  duration: number;
  error: string | null;
}

export default function TourContent({ guide, language }: TourContentProps) {
  const chapters = guide.realTimeGuide?.chapters || [];
  
  // 가이드 ID 생성 (일관된 식별자)
  const guideId = crypto.createHash('md5').update(`${guide.metadata.originalLocationName}_${guide.overview.title}`).digest('hex');

  // 각 챕터별 오디오 상태 관리
  const [chapterStates, setChapterStates] = useState<ChapterAudioState[]>(
    chapters.map(() => ({
      isPlaying: false,
      isLoading: false,
      audioProgress: 0,
      duration: 0,
      error: null
    }))
  );

  // 각 챕터별 오디오 ref
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(
    new Array(chapters.length).fill(null)
  );

  // 오디오 이벤트 리스너 설정
  useEffect(() => {
    audioRefs.current.forEach((audio, chapterIndex) => {
      if (!audio) return;

      const handleLoadedMetadata = () => {
        setChapterStates(prev => prev.map((state, idx) => 
          idx === chapterIndex ? { ...state, duration: audio.duration } : state
        ));
      };

      const handleTimeUpdate = () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setChapterStates(prev => prev.map((state, idx) => 
          idx === chapterIndex ? { ...state, audioProgress: progress } : state
        ));
      };

      const handleEnded = () => {
        setChapterStates(prev => prev.map((state, idx) => 
          idx === chapterIndex ? { ...state, isPlaying: false, audioProgress: 0 } : state
        ));
      };

      const handleError = () => {
        setChapterStates(prev => prev.map((state, idx) => 
          idx === chapterIndex ? { ...state, isPlaying: false, error: '오디오 재생 중 오류가 발생했습니다.' } : state
        ));
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
    });
  }, [chapters.length]);

  const handlePlayPause = async (chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (!chapter?.narrative) return;

    const audio = audioRefs.current[chapterIndex];
    if (!audio) return;

    try {
      setChapterStates(prev => prev.map((state, idx) => 
        idx === chapterIndex ? { ...state, error: null } : state
      ));

      if (chapterStates[chapterIndex].isPlaying) {
        // 일시정지
        audio.pause();
        setChapterStates(prev => prev.map((state, idx) => 
          idx === chapterIndex ? { ...state, isPlaying: false } : state
        ));
        return;
      }

      // 새로운 오디오 로드가 필요한 경우
      if (!audio.src || audio.ended) {
        setChapterStates(prev => prev.map((state, idx) => 
          idx === chapterIndex ? { ...state, isLoading: true } : state
        ));

        console.log('🎵 챕터 오디오 로딩 시작...', { 
          guideId, 
          chapterIndex, 
          language 
        });

        try {
          const audioUrl = await getOrCreateChapterAudio(
            guideId,
            chapterIndex,
            chapter.narrative,
            language
          );

          audio.src = audioUrl;
          console.log('✅ 챕터 오디오 로드 완료:', { 
            chapter: chapterIndex,
            url: audioUrl.substring(0, 50) + '...'
          });
        } catch (ttsError) {
          console.error('❌ 챕터 오디오 생성 실패:', ttsError);
          setChapterStates(prev => prev.map((state, idx) => 
            idx === chapterIndex ? { ...state, error: '음성 생성에 실패했습니다. 잠시 후 다시 시도해주세요.', isLoading: false } : state
          ));
          return;
        } finally {
          setChapterStates(prev => prev.map((state, idx) => 
            idx === chapterIndex ? { ...state, isLoading: false } : state
          ));
        }
      }

      // 재생
      await audio.play();
      setChapterStates(prev => prev.map((state, idx) => 
        idx === chapterIndex ? { ...state, isPlaying: true } : state
      ));

    } catch (playError) {
      console.error('❌ 오디오 재생 실패:', playError);
      setChapterStates(prev => prev.map((state, idx) => 
        idx === chapterIndex ? { ...state, error: '오디오 재생에 실패했습니다.', isPlaying: false, isLoading: false } : state
      ));
    }
  };

  const handleRestart = (chapterIndex: number) => {
    const audio = audioRefs.current[chapterIndex];
    if (!audio) return;

    audio.currentTime = 0;
    setChapterStates(prev => prev.map((state, idx) => 
      idx === chapterIndex ? { ...state, audioProgress: 0 } : state
    ));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (chapters.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">투어 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{guide.overview.title}</h1>
        <p className="text-gray-600">
          실시간 오디오 가이드
        </p>
        <p className="text-sm text-gray-500 mt-1">
          가이드 ID: {guideId.substring(0, 8)}...
        </p>
      </div>

      {/* 맵 */}
      <div className="mb-8">
        <MapWithRoute 
          chapters={chapters}
          activeChapter={0}
          onMarkerClick={() => {}}
        />
      </div>

      {/* 모든 챕터를 스크롤 형태로 표시 */}
      <div className="space-y-8">
        {chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 오디오 엘리먼트 */}
            <audio 
              ref={el => { audioRefs.current[chapterIndex] = el; }} 
              preload="none" 
            />

            {/* 챕터 헤더 */}
            <div className="bg-indigo-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-indigo-900">
                챕터 {chapterIndex + 1}: {chapter.title}
              </h2>
            </div>

            {/* 오디오 컨트롤 */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => handlePlayPause(chapterIndex)}
                    disabled={chapterStates[chapterIndex].isLoading}
                    size="lg"
                    className="rounded-full"
                  >
                    {chapterStates[chapterIndex].isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : chapterStates[chapterIndex].isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    onClick={() => handleRestart(chapterIndex)}
                    variant="outline"
                    size="sm"
                    disabled={!chapterStates[chapterIndex].duration}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  <Volume2 className="w-4 h-4 text-gray-500" />
                </div>

                <div className="text-sm text-gray-500">
                  {chapterStates[chapterIndex].duration > 0 && (
                    <>
                      {formatTime((chapterStates[chapterIndex].audioProgress / 100) * chapterStates[chapterIndex].duration)} / {formatTime(chapterStates[chapterIndex].duration)}
                    </>
                  )}
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${chapterStates[chapterIndex].audioProgress}%` }}
                />
              </div>

              {/* 에러 메시지 */}
              {chapterStates[chapterIndex].error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {chapterStates[chapterIndex].error}
                </div>
              )}
            </div>

            {/* 텍스트 내용 */}
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {chapter.narrative}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}