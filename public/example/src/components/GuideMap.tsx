import { Navigation } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

// Import the map tile images
import imgImageLeafletTile from "../imports/DesktopLightMode";

export function GuideMap() {
  return (
    <Card className="max-w-6xl mx-auto p-8 mb-8 bg-white border border-gray-200 rounded-3xl shadow-sm">
      {/* Section Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
          <Navigation className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-black">추천 시작지점</h2>
      </div>

      <hr className="border-gray-100 mb-4" />

      {/* Map Container */}
      <div className="relative h-64 bg-gray-100 rounded-3xl overflow-hidden">
        {/* Map placeholder with location info */}
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">지도 보기</p>
          </div>
        </div>
        
        {/* Map controls */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <Button variant="ghost" size="sm" className="rounded-t-lg rounded-b-none border-b border-gray-200">
            +
          </Button>
          <Button variant="ghost" size="sm" className="rounded-b-lg rounded-t-none">
            −
          </Button>
        </div>

        {/* Fullscreen button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute bottom-4 right-4 bg-white shadow-sm border border-gray-200 rounded-xl"
        >
          <Navigation className="w-4 h-4" />
        </Button>

        {/* Location info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/5 backdrop-blur border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <span className="font-medium text-black">3개 지점</span>
            </div>
            <span className="text-gray-600">남산타워</span>
          </div>
        </div>
      </div>
    </Card>
  );
}