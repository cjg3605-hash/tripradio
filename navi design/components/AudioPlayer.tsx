import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Volume2,
  MoreVertical,
  FileText,
  Download,
  Share,
  List,
  X,
  Headphones,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../App";

// 오디오 시각화 컴포넌트
const AudioVisualizer = ({
  isPlaying,
}: {
  isPlaying: boolean;
}) => {
  return (
    <div className="w-64 h-64 mx-auto flex items-center justify-center">
      <div className="relative">
        {/* 외부 원 */}
        <div
          className={`w-64 h-64 border-2 border-foreground rounded-full ${isPlaying ? "animate-spin" : ""}`}
          style={{ animationDuration: "8s" }}
        >
          <div className="absolute inset-4 border border-muted-foreground rounded-full">
            <div className="absolute inset-4 border border-muted-foreground rounded-full">
              <div className="absolute inset-8 bg-foreground rounded-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-background rounded-full flex items-center justify-center">
                  {isPlaying ? (
                    <div className="flex gap-1">
                      <div className="w-1 h-8 bg-background animate-pulse"></div>
                      <div
                        className="w-1 h-6 bg-background animate-pulse"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-10 bg-background animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1 h-4 bg-background animate-pulse"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                      <div
                        className="w-1 h-7 bg-background animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  ) : (
                    <Volume2 className="w-8 h-8 text-background" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 재생 상태 표시 */}
        {isPlaying && (
          <>
            <div
              className="absolute inset-0 border-2 border-foreground/20 rounded-full animate-ping"
              style={{ animationDuration: "2s" }}
            ></div>
            <div
              className="absolute inset-2 border border-foreground/10 rounded-full animate-ping"
              style={{
                animationDuration: "3s",
                animationDelay: "1s",
              }}
            ></div>
          </>
        )}
      </div>
    </div>
  );
};

export default function AudioPlayer() {
  const {
    currentGuide,
    currentAudioChapter,
    setCurrentAudioChapter,
    isPlaying,
    setIsPlaying,
    setCurrentScreen,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            if (
              currentGuide &&
              currentAudioChapter <
                currentGuide.audioChapters.length - 1
            ) {
              setCurrentAudioChapter(currentAudioChapter + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [
    isPlaying,
    currentTime,
    duration,
    currentGuide,
    currentAudioChapter,
    setCurrentAudioChapter,
    setIsPlaying,
  ]);

  if (!currentGuide) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-background">
        <div className="text-center space-y-8 max-w-sm">
          <div className="w-32 h-32 border-4 border-border rounded-full flex items-center justify-center mx-auto">
            <Headphones className="w-16 h-16 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-medium mb-2">
              오디오 투어를 선택하세요
            </h2>
            <p className="text-muted-foreground">
              여행 가이드를 생성하면 오디오 투어를 들을 수
              있어요
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setCurrentScreen("search")}
            className="w-full py-6 bg-foreground text-background hover:bg-foreground/90"
          >
            여행지 찾아보기
          </Button>
        </div>
      </div>
    );
  }

  const currentChapter =
    currentGuide.audioChapters[currentAudioChapter];
  const canGoBack = currentAudioChapter > 0;
  const canGoForward =
    currentAudioChapter < currentGuide.audioChapters.length - 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePrevious = () => {
    if (currentTime > 10) {
      setCurrentTime(0);
    } else if (canGoBack) {
      setCurrentAudioChapter(currentAudioChapter - 1);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setCurrentAudioChapter(currentAudioChapter + 1);
      setCurrentTime(0);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  if (showTranscript) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">대본</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTranscript(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center pb-6 border-b border-border">
              <div className="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium">
                {currentChapter.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentChapter.duration}
              </p>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed text-base">
                {currentChapter.transcript}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowTranscript(false)}
          >
            플레이어로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (showChapterList) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">챕터 목록</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChapterList(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {currentGuide.audioChapters.map(
              (chapter, index) => (
                <Card
                  key={chapter.id}
                  className={`cursor-pointer transition-all border ${
                    index === currentAudioChapter
                      ? "border-foreground bg-muted/50"
                      : "border-border hover:border-foreground"
                  }`}
                  onClick={() => {
                    setCurrentAudioChapter(index);
                    setCurrentTime(0);
                    setShowChapterList(false);
                  }}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-medium ${
                        index === currentAudioChapter
                          ? "border-foreground bg-foreground text-background"
                          : "border-border"
                      }`}
                    >
                      {index === currentAudioChapter &&
                      isPlaying ? (
                        <div className="w-3 h-3 bg-background rounded-full animate-pulse" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {chapter.duration}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen("guide")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="font-medium">지금 재생 중</p>
            <p className="text-sm text-muted-foreground">
              {currentGuide.location}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChapterList(true)}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Player */}
      <div className="flex-1 flex flex-col justify-center p-8 space-y-8">
        {/* Audio Visualizer */}
        <AudioVisualizer isPlaying={isPlaying} />

        {/* Track Info */}
        <div className="text-center space-y-3">
          <h2 className="text-xl font-medium">
            {currentChapter.title}
          </h2>
          <div className="flex items-center justify-center gap-3">
            <Badge variant="outline" className="border-border">
              {currentAudioChapter + 1} /{" "}
              {currentGuide.audioChapters.length}
            </Badge>
            <Badge variant="outline" className="border-border">
              {currentChapter.duration}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full [&>span]:h-2 [&>span>span]:h-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="font-mono">
              {formatTime(currentTime)}
            </span>
            <span className="font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={!canGoBack && currentTime <= 10}
            className="h-14 w-14 border-2 border-border rounded-full disabled:opacity-30"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <Button
            size="icon"
            onClick={togglePlayPause}
            className="h-20 w-20 rounded-full bg-foreground text-background hover:bg-foreground/90 border-4 border-background shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={!canGoForward}
            className="h-14 w-14 border-2 border-border rounded-full disabled:opacity-30"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleSpeed}
            className="border border-border"
          >
            <span className="font-mono">{playbackSpeed}×</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranscript(true)}
            className="border border-border"
          >
            <FileText className="w-4 h-4 mr-2" />
            대본
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="border border-border"
          >
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="border border-border"
          >
            <Share className="w-4 h-4 mr-2" />
            공유
          </Button>
        </div>
      </div>

      {/* Mini Chapter Navigation */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">챕터</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChapterList(true)}
          >
            전체 보기
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {currentGuide.audioChapters.map((chapter, index) => (
            <Card
              key={chapter.id}
              className={`cursor-pointer transition-all flex-shrink-0 border ${
                index === currentAudioChapter
                  ? "border-foreground bg-muted/50"
                  : "border-border hover:border-foreground"
              }`}
              onClick={() => {
                setCurrentAudioChapter(index);
                setCurrentTime(0);
              }}
            >
              <CardContent className="p-3 w-28">
                <div className="text-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium mx-auto mb-2 ${
                      index === currentAudioChapter
                        ? "border-foreground bg-foreground text-background"
                        : "border-border"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-xs font-medium truncate">
                    {chapter.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {chapter.duration}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  );
}