import { Play, Pause, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useState } from "react";

interface GuideTrackListProps {
  destination: string;
}

export function GuideTrackList({ destination }: GuideTrackListProps) {
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);

  const getTracksForDestination = (dest: string) => {
    const trackData: { [key: string]: any[] } = {
      '경복궁': [
        {
          title: '경복궁 인트로',
          duration: '2:30',
          description: '조선왕조 600년의 역사가 시작된 경복궁으로 여러분을 안내합니다.',
          content: '안녕하세요! 경복궁 오디오 가이드에 오신 것을 환영합니다. 1395년에 창건된 경복궁은 조선왕조의 법궁으로서 600년 역사를 간직하고 있는 곳입니다...'
        },
        {
          title: '광화문과 근정전',
          duration: '4:15',
          description: '경복궁의 정문 광화문부터 조선의 정치 중심지 근정전까지',
          content: '지금 보시는 광화문은 경복궁의 정문입니다. 화려한 단청과 웅장한 규모로 조선왕조의 위엄을 보여주고 있습니다...'
        },
        {
          title: '경회루와 아미산',
          duration: '3:45',
          description: '궁중 연회가 열리던 경회루와 왕비의 휴식처 아미산',
          content: '경회루는 궁중의 큰 연회나 외국 사신을 접대할 때 사용되던 곳입니다. 연못 위에 떠 있는 듯한 아름다운 누각...'
        }
      ],
      '남산타워': [
        {
          title: '남산타워 인트로',
          duration: '2:30',
          description: '서울의 랜드마크 남산타워의 역사와 의미를 소개합니다.',
          content: '1971년 첫 완공 이후, 이 타워는 끊임없이 변화하는 서울의 풍경을 묵묵히 지켜보며 도시의 성장과 함께해왔습니다...'
        },
        {
          title: '남산타워 전망대',
          duration: '3:45',
          description: '서울 전경을 한눈에 볼 수 있는 최고의 전망 포인트',
          content: '이제 이 의미 깊은 장소에서 잠시 발걸음을 옮겨, 서울의 숨 막히는 파노라마를 직접 경험해볼 차례입니다...'
        },
        {
          title: '사랑의 자물쇠',
          duration: '2:15',
          description: '연인들의 영원한 사랑을 약속하는 특별한 공간',
          content: '남산타워를 찾는 연인들이 사랑의 맹세와 함께 자물쇠를 걸어두는 로맨틱한 명소입니다...'
        }
      ]
    };

    return trackData[dest] || trackData['남산타워'];
  };

  const tracks = getTracksForDestination(destination);

  const togglePlay = (trackIndex: number) => {
    if (playingTrack === trackIndex) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackIndex);
    }
  };

  const toggleExpand = (trackIndex: number) => {
    if (expandedTrack === trackIndex) {
      setExpandedTrack(null);
    } else {
      setExpandedTrack(trackIndex);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">오디오 가이드</h2>
        <span className="text-xs text-gray-500">{tracks.length}개 트랙</span>
      </div>

      {tracks.map((track, index) => (
        <Card key={index} className="overflow-hidden border-gray-200">
          {/* Track Header */}
          <div className="p-3">
            <div className="flex items-center space-x-3">
              {/* Track Number */}
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-gray-700">{index + 1}</span>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-black mb-1">{track.title}</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{track.duration}</span>
                  </div>
                  {playingTrack === index && (
                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
                      재생 중
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 rounded-full"
                  onClick={() => togglePlay(index)}
                >
                  {playingTrack === index ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8"
                  onClick={() => toggleExpand(index)}
                >
                  {expandedTrack === index ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedTrack === index && (
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">{track.description}</p>
              <p className="text-sm text-gray-800 leading-relaxed">
                {track.content}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}