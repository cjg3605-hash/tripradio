import { MapPin } from "lucide-react";

interface GuideTitleProps {
  destination: string;
}

export function GuideTitle({ destination }: GuideTitleProps) {
  // 목적지별 기본 타이틀 매핑
  const destinationTitles: { [key: string]: string } = {
    '경복궁': '경복궁',
    '남산타워': '남산타워',
    '명동': '명동',
    '해운대해수욕장': '해운대 해수욕장',
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
    <section className="text-center py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Location Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-gray-200 mb-8">
          <MapPin className="w-10 h-10 text-black" />
        </div>
        
        {/* Main Title */}
        <h1 className="text-5xl font-bold text-black mb-2 tracking-tight">
          {displayTitle}
        </h1>
        
        {/* Breadcrumb indicator */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}