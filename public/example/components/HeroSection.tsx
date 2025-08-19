import { Search, Play, MapPin, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection() {
  const backgroundImage = "https://images.unsplash.com/photo-1591366152219-48d643eb3aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHNzZW91bCUyMGNpdHlzY2FwZSUyMG1vZGVybiUyMHNreWxpbmV8ZW58MXx8fHwxNzU1NTMxODUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback 
          src={backgroundImage}
          alt="서울 도시 전경"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-8">
          <span className="text-sm font-medium text-white/90">AI 오디오가이드</span>
          <span className="mx-2 text-white/50">•</span>
          <span className="text-sm font-medium text-white/90">무료 체험</span>
        </div>

        {/* Main Heading - Location Placeholder */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight tracking-tight">
          경복궁, 남산타워, 해운대...
        </h1>

        {/* Search Bar with Location Placeholders */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="flex items-center bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/30 p-2">
            <div className="flex items-center flex-1 px-4">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <Input
                placeholder="경복궁, 남산타워, 부산 해운대..."
                className="border-0 bg-transparent text-lg placeholder:text-gray-500 focus-visible:ring-0"
              />
            </div>
            <Button size="lg" className="rounded-xl px-8 bg-black hover:bg-black/90">
              <Search className="w-5 h-5 mr-2" />
              검색
            </Button>
          </div>
          
          {/* Popular searches */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="text-white/60 text-sm">인기 검색:</span>
            {["경복궁", "제주도", "부산 감천문화마을", "경주 불국사"].map((place) => (
              <button
                key={place}
                className="px-3 py-1 bg-white/10 backdrop-blur text-white/80 text-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors"
              >
                {place}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">장소 입력</h3>
              <p className="text-sm text-white/70">특정 장소 검색</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">AI 생성</h3>
              <p className="text-sm text-white/70">가이드 자동 생성</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">오디오 재생</h3>
              <p className="text-sm text-white/70">투어 시작</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button size="lg" className="px-8 py-4 text-lg rounded-xl bg-white text-black hover:bg-white/90">
          무료로 시작하기
        </Button>
      </div>
    </section>
  );
}