import { List, Play, Pause, ChevronDown, Heart, RotateCcw } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export function GuideOrder() {
  const guides = [
    {
      title: "N서울타워 서울의 중심",
      subtitle: "인트로",
      duration: "0:00",
      content: "서울의 심장부에 우뚝 솟은 N서울타워는 단순한 방송 송신탑을 넘어, 대한민국 현대사의 궤적과 서울 시민들의 염원을 담고 있는 상징적인 건축물입니다. 1971년 첫 완공 이후, 이 타워는 끊임없이 변화하는 서울의 풍경을 묵묵히 지켜보며 도시의 성장과 함께해왔습니다...",
      nextStep: "이제 이 의미 깊은 장소에서 잠시 발걸음을 옮겨, 서울의 숨 막히는 파노라마를 직접 경험해볼 차례입니다. 타워의 승강기를 타고 정상으로 향하면, 여러분을 기다리는 것은 놀라운 경관입니다..."
    },
    {
      title: "N서울타워 전망대", 
      subtitle: "01",
      duration: "0:00"
    },
    {
      title: "사랑의 자물쇠",
      subtitle: "02", 
      duration: "0:00"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Section Header */}
      <Card className="p-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <List className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black">관람순서</h2>
          </div>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">3</span>
          </div>
        </div>
      </Card>

      {/* Guide Items */}
      {guides.map((guide, index) => (
        <Card key={index} className={`p-8 bg-white border border-gray-200 rounded-xl shadow-sm ${index === 0 ? 'ring-1 ring-gray-300' : ''}`}>
          {/* Guide Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 border-2 border-gray-200 rounded-full flex items-center justify-center">
                <span className="font-medium text-black">{guide.subtitle}</span>
              </div>
              <div>
                <h3 className="text-xl font-medium text-black mb-2">{guide.title}</h3>
                {/* Audio Controls */}
                <div className="flex items-center space-x-4">
                  <Button variant="default" size="sm" className="w-8 h-8 rounded-full p-0">
                    <Play className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 max-w-sm">
                    <div className="h-1.5 bg-gray-200 rounded-full mb-1">
                      <div className="h-full bg-gray-300 rounded-full w-0"></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{guide.duration}</span>
                      <span>0:00</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-black" />
          </div>

          {/* Expanded Content for first guide */}
          {index === 0 && guide.content && (
            <>
              <hr className="border-gray-200 mb-6" />
              <div className="space-y-6">
                <div>
                  <p className="text-black leading-relaxed mb-6">
                    {guide.content}
                  </p>
                </div>
                
                {guide.nextStep && (
                  <div className="p-6 bg-gray-50 rounded-2xl border-l-4 border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-black mb-2">다음 이동 안내</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {guide.nextStep}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex-1 py-4 rounded-3xl bg-white text-black border border-gray-200 hover:bg-gray-50">
          <Heart className="w-5 h-5 mr-2" />
          즐겨찾기
        </Button>
        <Button className="flex-1 py-4 rounded-3xl bg-white text-black border border-gray-200 hover:bg-gray-50">
          <RotateCcw className="w-5 h-5 mr-2" />
          재생성
        </Button>
      </div>
    </div>
  );
}