import { Heart, Share2, Download, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

export function GuideBottomActions() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-30">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
            <Heart className="w-4 h-4" />
            <span className="text-xs">즐겨찾기</span>
          </Button>
          
          <Button variant="outline" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
            <Share2 className="w-4 h-4" />
            <span className="text-xs">공유</span>
          </Button>
          
          <Button variant="outline" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
            <Download className="w-4 h-4" />
            <span className="text-xs">저장</span>
          </Button>
          
          <Button variant="outline" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs">재생성</span>
          </Button>
        </div>
      </div>
    </div>
  );
}