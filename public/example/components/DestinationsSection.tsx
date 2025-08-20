import { DestinationCard } from "./DestinationCard";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface DestinationsSectionProps {
  onDestinationClick: (destination: string) => void;
}

export function DestinationsSection({ onDestinationClick }: DestinationsSectionProps) {
  const destinations = [
    {
      name: "서울",
      description: "대한민국의 활기찬 수도",
      isPopular: true,
      attractions: [
        { name: "경복궁" },
        { name: "남산타워" },
        { name: "명동" }
      ]
    },
    {
      name: "부산",
      description: "아름다운 바다와 항구의 도시",
      isPopular: true,
      attractions: [
        { name: "해운대해수욕장" },
        { name: "감천문화마을" },
        { name: "자갈치시장" }
      ]
    },
    {
      name: "제주",
      description: "환상적인 자연경관의 섬",
      isPopular: true,
      attractions: [
        { name: "한라산" },
        { name: "성산일출봉" },
        { name: "중문관광단지" }
      ]
    },
    {
      name: "경주",
      description: "신라 천년의 고도",
      isPopular: false,
      attractions: [
        { name: "불국사" },
        { name: "석굴암" },
        { name: "첨성대" }
      ]
    }
  ];

  const categories = [
    { name: "한국", active: true },
    { name: "유럽", active: false },
    { name: "아시아", active: false },
    { name: "미주", active: false }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            인기 여행 국가
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            세계 각국의 대표 관광명소와 함께하는 특별한 오디오 가이드 여행을 시작하세요
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-2xl p-1 border border-gray-200 shadow-sm">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={category.active ? "default" : "ghost"}
                size="sm"
                className={`px-6 py-2 rounded-xl transition-all ${
                  category.active 
                    ? "bg-black text-white shadow-sm" 
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.name}
              name={destination.name}
              description={destination.description}
              isPopular={destination.isPopular}
              attractions={destination.attractions}
              onAttractionClick={onDestinationClick}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="px-8 py-4 rounded-xl">
            <span>더 많은 명소 보기</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}