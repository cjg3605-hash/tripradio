import { AlertTriangle } from "lucide-react";
import { Card } from "./ui/card";

export function GuideWarning() {
  return (
    <Card className="max-w-6xl mx-auto p-8 mb-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-black">주의사항</h2>
        </div>
        <div className="w-3 h-3 bg-black opacity-80 rounded-full"></div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Warning Content */}
      <div className="flex items-start space-x-4 p-6 rounded-2xl border border-gray-100">
        <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
        <p className="text-black leading-relaxed">
          타워 전망대 이용 시, 안전을 위해 난간에 기대거나 위험한 행동을 삼가시기 바랍니다. 또한, 타워 내 상업 시설 이용 시에는 각 업체의 운영 방침을 따르시기 바랍니다.
        </p>
      </div>
    </Card>
  );
}