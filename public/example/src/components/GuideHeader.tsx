import { ArrowLeft, MoreVertical, Share2 } from "lucide-react";
import { Button } from "./ui/button";

interface GuideHeaderProps {
  onBackToHome: () => void;
}

export function GuideHeader({ onBackToHome }: GuideHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Back Button */}
          <Button variant="ghost" size="sm" className="flex items-center space-x-2" onClick={onBackToHome}>
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">뒤로</span>
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <h1 className="text-xl font-bold text-black hidden sm:block">TripRadio.AI</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}