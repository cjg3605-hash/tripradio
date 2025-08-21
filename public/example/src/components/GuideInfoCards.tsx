import { Clock, TrendingUp, Star, AlertTriangle, MapPin } from "lucide-react";
import { Card } from "./ui/card";

interface GuideInfoCardsProps {
  destination: string;
}

export function GuideInfoCards({ destination }: GuideInfoCardsProps) {
  const getDestinationInfo = (dest: string) => {
    const info: { [key: string]: any } = {
      '경복궁': {
        duration: '2-3시간',
        difficulty: '쉬움',
        highlights: ['근정전', '경회루', '수문장교대식'],
        tip: '오전 10시 수문장 교대식을 놓치지 마세요',
        location: '서울특별시 종로구'
      },
      '남산타워': {
        duration: '2-3시간', 
        difficulty: '낮음',
        highlights: ['전망대', '사랑의자물쇠', '케이블카'],
        tip: '야경 감상을 위해 해질 무렵 방문을 추천합니다',
        location: '서울특별시 용산구'
      }
    };
    
    return info[dest] || info['남산타워'];
  };

  const info = getDestinationInfo(destination);

  return (
    <div className="space-y-4">
      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-gray-50 border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">소요시간</p>
              <p className="text-sm font-semibold text-black">{info.duration}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gray-50 border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600">난이도</p>
              <p className="text-sm font-semibold text-black">{info.difficulty}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Highlights */}
      <Card className="p-4 bg-white border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-black">필수 관람 포인트</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {info.highlights.map((highlight: string, index: number) => (
            <span 
              key={index}
              className="px-2 py-1 bg-black text-white text-xs rounded-full"
            >
              #{highlight}
            </span>
          ))}
        </div>
      </Card>

      {/* Pro Tip */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">💡 여행 팁</h4>
            <p className="text-sm text-blue-800 leading-relaxed">{info.tip}</p>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="p-3 bg-white border-gray-200">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-800">{info.location}</span>
        </div>
      </Card>
    </div>
  );
}