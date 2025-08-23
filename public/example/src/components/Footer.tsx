import { Globe, MapPin, Users, Star, Calculator, Plane, Camera, Coffee, Heart, Briefcase, CheckCircle, Film } from "lucide-react";
import { Button } from "./ui/button";

interface FooterProps {
  onTripPlannerClick?: () => void;
  onNomadCalculatorClick?: () => void;
  onVisaCheckerClick?: () => void;
  onFilmLocationsClick?: () => void;
}

export function Footer({ onTripPlannerClick, onNomadCalculatorClick, onVisaCheckerClick, onFilmLocationsClick }: FooterProps) {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold">T</span>
              </div>
              <h2 className="text-xl font-bold">TripRadio.AI</h2>
            </div>
            <p className="text-gray-400 text-sm">
              AI 기반 실시간 오디오 가이드로 더 깊이 있는 여행을 경험하세요
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <Camera className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <Heart className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">서비스</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto">
                <MapPin className="w-4 h-4 mr-2" />
                AI 오디오 가이드
              </Button>
              <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto">
                <Globe className="w-4 h-4 mr-2" />
                실시간 위치 서비스
              </Button>
              <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto">
                <Star className="w-4 h-4 mr-2" />
                맞춤형 여행 추천
              </Button>
              <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto">
                <Camera className="w-4 h-4 mr-2" />
                여행 기록 관리
              </Button>
            </div>
          </div>

          {/* Travel Tools */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">여행 도구</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="justify-start text-gray-400 hover:text-white p-0 h-auto"
                onClick={onTripPlannerClick}
              >
                <Plane className="w-4 h-4 mr-2" />
                AI 여행 계획
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-gray-400 hover:text-white p-0 h-auto"
                onClick={onNomadCalculatorClick}
              >
                <Calculator className="w-4 h-4 mr-2" />
                노마드 생활비 계산기
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-gray-400 hover:text-white p-0 h-auto"
                onClick={onVisaCheckerClick}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                비자 요건 확인
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start text-gray-400 hover:text-white p-0 h-auto"
                onClick={onFilmLocationsClick}
              >
                <Film className="w-4 h-4 mr-2" />
                영화 촬영지 탐방
              </Button>
              <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto">
                <Coffee className="w-4 h-4 mr-2" />
                현지 추천 맛집
              </Button>
              <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto">
                <Briefcase className="w-4 h-4 mr-2" />
                여행 준비 체크리스트
              </Button>
            </div>
          </div>

          {/* Stats & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">서비스 현황</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-white font-medium">10K+</div>
                  <div className="text-gray-400 text-xs">활성 사용자</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-white font-medium">500+</div>
                  <div className="text-gray-400 text-xs">여행지 가이드</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-white font-medium">4.9</div>
                  <div className="text-gray-400 text-xs">평균 평점</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h4 className="font-medium text-white text-sm mb-2">고객지원</h4>
              <div className="space-y-1">
                <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto text-xs">
                  도움말 센터
                </Button>
                <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto text-xs">
                  문의하기
                </Button>
                <Button variant="ghost" className="justify-start text-gray-400 hover:text-white p-0 h-auto text-xs">
                  피드백 보내기
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm">
            © 2024 TripRadio.AI. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm p-0 h-auto">
              개인정보처리방침
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white text-sm p-0 h-auto">
              이용약관
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
              쿠키 정책
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}