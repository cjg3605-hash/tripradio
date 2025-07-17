'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { GuideData } from '@/types/guide';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
}

const TourContent = ({ guide, language, chapterRefs = { current: [] } }: TourContentProps) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 오디오 정리
  const stopAndCleanupAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      stopAndCleanupAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TTS 재생 핸들러
  const handlePlayChapter = async (chapterIndex: number) => {
    // 이미 재생 중인 챕터 클릭 시 일시정지/재개 처리
    if (currentChapter === chapterIndex && currentAudio) {
      handleTogglePlayback();
      return;
    }
    stopAndCleanupAudio();

    const chapter = guide.realTimeGuide?.chapters?.[chapterIndex];
    if (!chapter) return;

    let textToSpeak = '';
    if (chapter.narrative) {
      textToSpeak = chapter.narrative;
      if (chapter.nextDirection) {
        textToSpeak += '\n\n' + chapter.nextDirection;
      }
    } else {
      const parts = [
        chapter.sceneDescription,
        chapter.coreNarrative,
        chapter.humanStories,
        chapter.nextDirection,
      ].filter(Boolean);
      textToSpeak = parts.join('\n\n');
    }

    if (!textToSpeak.trim()) {
      alert('이 챕터의 내용이 아직 준비되지 않았습니다.');
      return;
    }

    try {
      setCurrentChapter(chapterIndex);
      setIsPlaying(true);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: language,
        }),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('TTS 응답 파싱 실패: 서버에서 올바른 JSON을 반환하지 않았습니다.');
      }

      if (!response.ok || !data.success) {
        const errorMsg = data?.error || 'TTS 생성 실패';
        const errorCode = data?.code ? ` (코드: ${data.code})` : '';
        console.error('TTS API 오류:', errorMsg, errorCode, data);
        alert(`음성 생성 중 오류가 발생했습니다.\n${errorMsg}${errorCode}`);
        setIsPlaying(false);
        return;
      }

      if (!data.audioData || !data.mimeType) {
        console.error('TTS API 응답에 오디오 데이터가 없습니다:', data);
        alert('TTS 응답에 오디오 데이터가 없습니다.');
        setIsPlaying(false);
        return;
      }

      // base64 -> Blob 변환
      const byteCharacters = atob(data.audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: data.mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setCurrentAudio(audio);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
        alert('오디오 재생 중 오류가 발생했습니다.');
      };

      await audio.play();
    } catch (error: any) {
      setIsPlaying(false);
      if (error instanceof Error) {
        console.error('TTS 오류:', error.message, error);
        alert(`음성 생성 중 오류가 발생했습니다.\n${error.message}`);
      } else {
        console.error('TTS 알 수 없는 오류:', error);
        alert('음성 생성 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  // 일시정지/재개 핸들러
  const handleTogglePlayback = async () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        try {
          await currentAudio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('오디오 재생 오류:', error);
          setIsPlaying(false);
        }
      }
    }
  };

  // 정지 핸들러
  const handleStopPlayback = () => {
    stopAndCleanupAudio();
  };

  // realTimeGuide가 없거나 chapters가 없는 경우 처리
  if (!guide.realTimeGuide?.chapters || guide.realTimeGuide.chapters.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <p className="text-yellow-800 font-medium">가이드 준비 중</p>
            <p className="text-yellow-700 text-sm mt-1">
              실시간 가이드 내용이 준비되고 있습니다. 잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {guide.realTimeGuide?.chapters?.map((chapter, index) => {
        const isCurrentlyPlaying = isPlaying && currentChapter === index;
        const hasContent = chapter.narrative || 
                          chapter.sceneDescription || 
                          chapter.coreNarrative || 
                          chapter.humanStories;

        return (
          <div
            key={index}
            ref={(el) => {
              chapterRefs.current[index] = el;
            }}
            className={`border rounded-lg p-6 transition-all duration-300 ${
              isCurrentlyPlaying
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:shadow-md'
            }`}
            tabIndex={0}
            aria-label={`챕터 ${index + 1}: ${chapter.title || ''}`}
            onClick={() => handlePlayChapter(index)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handlePlayChapter(index);
              }
            }}
            role="region"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isCurrentlyPlaying
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{chapter.title}</h3>
              </div>

              <div className="flex items-center space-x-2">
                {hasContent && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (currentChapter === index && currentAudio) {
                        handleTogglePlayback();
                      } else {
                        handlePlayChapter(index);
                      }
                    }}
                    disabled={isPlaying && currentChapter !== index}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isCurrentlyPlaying
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={isCurrentlyPlaying ? (isPlaying ? '일시정지' : '재개') : '재생'}
                  >
                    {isCurrentlyPlaying && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {hasContent ? (
                <div className="text-gray-700 leading-relaxed space-y-4">
                  {chapter.narrative ? (
                    <div className="whitespace-pre-line">
                      <p>{chapter.narrative}</p>
                      {chapter.nextDirection && (
                        <p className="text-blue-600 font-medium mt-4">{chapter.nextDirection}</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {chapter.sceneDescription && <p>{chapter.sceneDescription}</p>}
                      {chapter.coreNarrative && <p>{chapter.coreNarrative}</p>}
                      {chapter.humanStories && <p>{chapter.humanStories}</p>}
                      {chapter.nextDirection && (
                        <p className="text-blue-600 font-medium">{chapter.nextDirection}</p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-yellow-800 font-medium">챕터 내용 생성 중</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        이 챕터의 상세 내용이 AI에 의해 생성되고 있습니다. 잠시만 기다려주세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TourContent;