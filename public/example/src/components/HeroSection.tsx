import { Search, MapPin, Sparkles, Play, Star, Users, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroSectionProps {
  onDestinationClick: (destination: string) => void;
}

export function HeroSection({ onDestinationClick }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const popularDestinations = [
    { name: "경복궁", emoji: "🏯" },
    { name: "남산타워", emoji: "🗼" },
    { name: "부산 해운대", emoji: "🏖️" },
    { name: "제주도", emoji: "🌴" },
    { name: "강릉", emoji: "⛱️" }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onDestinationClick(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1613433005625-ab8e438f7187?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHRyYXZlbCUyMGRlc3RpbmF0aW9ufGVufDF8fHx8MTc1NTc5NTM0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Beautiful travel destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce delay-1000">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-3 text-white">
          <MapPin className="w-6 h-6" />
        </div>
      </div>
      
      <div className="absolute top-32 right-20 animate-bounce delay-2000">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-3 text-white">
          <Star className="w-6 h-6" />
        </div>
      </div>

      <div className="absolute bottom-40 left-20 animate-bounce">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-3 text-white">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Travel Guide</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
          <span className="block mb-2">여행이 더 특별해지는</span>
          <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            AI 오디오 가이드
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          실시간 위치 기반 AI 가이드로 더 깊이 있는 여행을 경험하세요
        </p>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="장소를 검색하세요 (예: 경복궁, 남산타워)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 pr-4 py-4 text-lg rounded-full border-white/30 bg-white/10 backdrop-blur-md text-white placeholder-white/70 focus:border-white/50 focus:ring-white/30 focus:bg-white/20"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-black px-6 py-2 rounded-full hover:bg-white/90 transition-colors font-medium"
            >
              검색
            </Button>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="space-y-6 mb-12">
          <p className="text-sm text-white/80 font-medium">인기 여행지</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {popularDestinations.map((dest) => (
              <Button
                key={dest.name}
                variant="outline"
                size="sm"
                onClick={() => onDestinationClick(dest.name)}
                className="flex items-center space-x-2 rounded-full border-white/30 bg-white/10 backdrop-blur-md text-white hover:border-white/50 hover:bg-white/20 transition-all duration-300"
              >
                <span>{dest.emoji}</span>
                <span>{dest.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-16">
          <Button
            onClick={() => onDestinationClick('경복궁')}
            className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/90 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2" />
            지금 체험해보기
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">10K+</div>
            <div className="text-sm text-white/70">활성 사용자</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-white/70">여행지 가이드</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">4.9</div>
            <div className="text-sm text-white/70">평균 평점</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}