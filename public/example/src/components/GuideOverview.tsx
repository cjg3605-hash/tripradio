import { Info, Clock, TrendingUp, Calendar } from "lucide-react";
import { Card } from "./ui/card";

export function GuideOverview() {
  const infoItems = [
    { icon: "📍", text: "서울특별시 용산구" },
    { icon: "✨", text: "서울의 랜드마크, 파노라마 전망" },
    { icon: "🏛️", text: "도시와 자연이 조화된 문화 공간" }
  ];

  return (
    <Card className="max-w-6xl mx-auto p-8 mb-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
      {/* Section Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
          <Info className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">개요</h2>
          <p className="text-gray-600">필수 정보</p>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Info List */}
      <div className="space-y-4 mb-8">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100">
            <div className="w-1 h-4 bg-black rounded-full"></div>
            <span className="font-medium text-black">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-4 p-4 rounded-2xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-black" />
          <span className="font-medium text-black">2~3시간</span>
        </div>
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-4 h-4 text-black" />
          <span className="font-medium text-black">낮음 (케이블카 또는 대중교통 이용 시)</span>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-black" />
          <span className="font-medium text-black">사계절 모두 방문 가능 (야경은 저녁 시간 추천)</span>
        </div>
      </div>
    </Card>
  );
}