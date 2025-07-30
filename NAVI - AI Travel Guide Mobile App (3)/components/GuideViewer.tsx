import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Play, 
  Download, 
  Share, 
  Bookmark,
  Clock,
  MapPin,
  AlertTriangle,
  Info,
  Route,
  Volume2,
  DollarSign,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useApp } from '../App';

export default function GuideViewer() {
  const { currentGuide, setCurrentScreen, setIsPlaying, setCurrentAudioChapter } = useApp();

  if (!currentGuide) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-background">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-32 h-32 border-4 border-border rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-16 h-16 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-medium mb-2">가이드를 선택하세요</h2>
            <p className="text-muted-foreground">여행지를 검색하여 AI 가이드를 생성해보세요</p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setCurrentScreen('search')}
            className="w-full py-6 bg-foreground text-background hover:bg-foreground/90"
          >
            여행지 찾아보기
          </Button>
        </div>
      </div>
    );
  }

  const playChapter = (chapterIndex: number) => {
    setCurrentAudioChapter(chapterIndex);
    setIsPlaying(true);
    setCurrentScreen('audio');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentScreen('search')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-medium">여행 가이드</h1>
              <p className="text-sm text-muted-foreground">AI 맞춤형 가이드</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* 장소명 */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 border-4 border-foreground rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-medium mb-2">{currentGuide.overview.title}</h1>
              <div className="flex items-center justify-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentGuide.overview.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Route className="w-4 h-4" />
                  <span>{currentGuide.overview.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 개요 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-foreground rounded flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                개요
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {currentGuide.overview.description}
              </p>
              
              <div>
                <h4 className="font-medium mb-3">주요 볼거리</h4>
                <div className="space-y-2">
                  {currentGuide.overview.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 장소소개 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-foreground rounded flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                장소소개
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">관람 시간</p>
                  <p className="font-medium">{currentGuide.notice?.visitingHours || '오전 9시 - 오후 6시'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">입장료</p>
                  <p className="font-medium">{currentGuide.notice?.admissionFee || '성인 15유로'}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  오디오 가이드 특징
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 전문 큐레이터가 선별한 핵심 정보</li>
                  <li>• 개인 취향에 맞춘 맞춤형 설명</li>
                  <li>• 오프라인에서도 이용 가능</li>
                  <li>• 다양한 재생 속도 지원</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 주의사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-destructive rounded flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                주의사항
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">운영시간</p>
                    <p className="text-sm text-muted-foreground">월요일 휴관, 화-일 09:00-18:00 (마지막 입장 17:30)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">입장료 정보</p>
                    <p className="text-sm text-muted-foreground">온라인 사전 예약 권장, 현장 구매시 대기시간 발생 가능</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-1 text-destructive" />
                  <div>
                    <p className="font-medium mb-1">관람 시 주의사항</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 플래시 촬영 금지</li>
                      <li>• 큰 가방 및 배낭 반입 제한</li>
                      <li>• 음식물 반입 금지</li>
                      <li>• 휠체어 접근 가능</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* 관람순서 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">
                <Route className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-medium">관람순서</h2>
              <Badge variant="outline" className="border-border">
                {currentGuide.audioChapters.length}개 챕터
              </Badge>
            </div>

            <div className="space-y-4">
              {currentGuide.audioChapters.map((chapter, index) => (
                <Card 
                  key={chapter.id} 
                  className="hover:shadow-md transition-all border border-border hover:border-foreground"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 border-2 border-foreground rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{chapter.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{chapter.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Volume2 className="w-3 h-3" />
                              <span>오디오 가이드</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="icon"
                        onClick={() => playChapter(index)}
                        className="w-12 h-12 rounded-full bg-foreground text-background hover:bg-foreground/90"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 전체 재생 버튼 */}
          <Card className="border-2 border-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">전체 오디오 투어</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentGuide.audioChapters.reduce((total, chapter) => {
                      const minutes = parseInt(chapter.duration);
                      return total + minutes;
                    }, 0)}분 • {currentGuide.audioChapters.length}개 챕터
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={() => playChapter(0)}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  전체 재생
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Download Option */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">오프라인 다운로드</h3>
                  <p className="text-sm text-muted-foreground">인터넷 없이도 가이드를 들을 수 있어요</p>
                </div>
                <Button variant="outline" className="border-border">
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>
    </div>
  );
}