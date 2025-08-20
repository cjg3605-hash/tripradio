import { Star } from "lucide-react";
import { Card } from "./ui/card";

export function GuideHighlights() {
  const highlights = [
    "#남산타워전망대",
    "#사랑의자물쇠", 
    "#남산공원",
    "#케이블카"
  ];

  return (
    <Card className="max-w-6xl mx-auto p-8 mb-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black">필수관람포인트</h2>
        </div>
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">4</span>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Highlights */}
      <div className="flex flex-wrap gap-3">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className="group relative overflow-hidden"
          >
            <div className="px-5 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
              {highlight}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}