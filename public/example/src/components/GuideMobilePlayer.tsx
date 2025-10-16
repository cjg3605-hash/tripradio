import { Play, Pause, SkipBack, SkipForward, Volume2, List } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useState } from "react";

interface GuideMobilePlayerProps {
  destination: string;
}

export function GuideMobilePlayer({ destination }: GuideMobilePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);

  const tracks = [
    { title: `${destination} 인트로`, duration: "2:30" },
    { title: `${destination} 전망대`, duration: "3:45" },
    { title: "사랑의 자물쇠", duration: "2:15" }
  ];

  const destinationTitles: { [key: string]: string } = {
    '경복궁': '경복궁',
    '남산타워': '남산타워',
    '명동': '명동',
    '해운대해수욕장': '해운대',
    '감천문화마을': '감천문화마을',
    '자갈치시장': '자갈치시장',
    '한라산': '한라산',
    '성산일출봉': '성산일출봉',
    '중문관광단지': '중문관광단지',
    '불국사': '불국사',
    '석굴암': '석굴암',
    '첨성대': '첨성대'
  };

  const displayTitle = destinationTitles[destination] || destination || '남산타워';

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
      {/* Compact Hero Section */}
      <div className="relative h-24 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-lg font-bold">{displayTitle}</h1>
          <p className="text-white/80 text-xs">AI 오디오 가이드</p>
        </div>
      </div>

      {/* Compact Player Controls */}
      <div className="px-4 py-3 bg-white">
        {/* Current Track Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-black truncate">
              {tracks[currentTrack]?.title}
            </h3>
            <p className="text-gray-500 text-xs">
              {currentTrack + 1} / {tracks.length} • {tracks[currentTrack]?.duration}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="ml-2">
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCurrentTrack(Math.max(0, currentTrack - 1))}
            disabled={currentTrack === 0}
            className="w-8 h-8"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button 
            size="sm"
            className="w-10 h-10 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCurrentTrack(Math.min(tracks.length - 1, currentTrack + 1))}
            disabled={currentTrack === tracks.length - 1}
            className="w-8 h-8"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" className="w-8 h-8 ml-2">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}