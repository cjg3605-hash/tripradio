'use client';

import React, { useState } from 'react';
import { Mic, Play, Pause, Download, Clock, Star, Globe, Headphones } from 'lucide-react';

interface PodcastResponse {
  success: boolean;
  message?: string;
  data?: {
    locationName: string;
    language: string;
    mockResponse: {
      episodeId: string;
      audioUrl: string;
      userScript: string;
      duration: number;
      qualityScore: number;
      chapterTimestamps: Array<{
        title: string;
        timestamp: number;
      }>;
    };
  };
}

export default function NationalMuseumDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [podcastData, setPodcastData] = useState<PodcastResponse | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('ko-KR');
  const [isPlaying, setIsPlaying] = useState(false);

  const generatePodcast = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/test-notebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName: '국립중앙박물관',
          language: selectedLanguage
        }),
      });
      
      const result = await response.json();
      setPodcastData(result);
    } catch (error) {
      console.error('팟캐스트 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Headphones className="w-8 h-8 text-indigo-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-800">NotebookLM 스타일 박물관 가이드</h1>
          </div>
          <p className="text-xl text-gray-600">AI가 생성하는 자연스러운 대화형 오디오 가이드</p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <Star className="w-4 h-4 mr-2" />
            <span className="font-semibold">NotebookLM 2025 기술 적용</span>
          </div>
        </div>

        {/* 박물관 정보 카드 */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <img 
              src="https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=100&h=100&fit=crop&crop=center" 
              alt="국립중앙박물관" 
              className="w-20 h-20 rounded-lg object-cover mr-6"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">국립중앙박물관</h2>
              <p className="text-gray-600">대한민국 최대 규모의 박물관</p>
              <div className="flex items-center mt-2">
                <Globe className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-500">서울특별시 용산구</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">주요 컬렉션</h3>
              <p className="text-sm text-blue-700">선사·고대관, 중세·근세관, 기증관, 아시아관</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">소장품 수</h3>
              <p className="text-sm text-purple-700">약 42만점의 문화재</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">설립</h3>
              <p className="text-sm text-green-700">1945년 설립</p>
            </div>
          </div>

          {/* 언어 선택 및 생성 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">언어 선택:</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ko-KR">한국어</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
                <option value="zh-CN">中文</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
            
            <button
              onClick={generatePodcast}
              disabled={isGenerating}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  팟캐스트 생성 중...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  NotebookLM 팟캐스트 생성
                </>
              )}
            </button>
          </div>
        </div>

        {/* 팟캐스트 결과 */}
        {podcastData && podcastData.success && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">생성된 팟캐스트</h3>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="font-semibold text-gray-700">
                  {podcastData.data?.mockResponse.qualityScore}/100
                </span>
              </div>
            </div>

            {/* 오디오 플레이어 UI */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {podcastData.data?.locationName} 완전 가이드
                  </h4>
                  <p className="text-gray-600">NotebookLM 스타일 오디오 가이드</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {podcastData.data?.mockResponse.duration && formatDuration(podcastData.data.mockResponse.duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                
                <div className="flex-1 bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-200" style={{ width: isPlaying ? '65%' : '0%' }}></div>
                </div>
                
                <button className="flex items-center px-4 py-2 text-indigo-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </button>
              </div>
            </div>

            {/* 챕터 타임스탬프 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">챕터별 구성</h4>
              <div className="space-y-2">
                {podcastData.data?.mockResponse.chapterTimestamps.map((chapter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <span className="font-medium text-gray-800">{chapter.title}</span>
                    <span className="text-sm text-gray-500">
                      {Math.floor(chapter.timestamp / 60)}:{(chapter.timestamp % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 대본 미리보기 */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">대본 미리보기</h4>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {podcastData.data?.mockResponse.userScript}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 기술 설명 */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">NotebookLM 2025 기술</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">자연스러운 대화</h4>
                  <p className="text-gray-600 text-sm">두 명의 AI 호스트가 실제 사람처럼 자연스러운 대화를 나눕니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">정보 계층화</h4>
                  <p className="text-gray-600 text-sm">기본 → 흥미로운 → 놀라운 정보 순으로 체계적 구성</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">5개국어 지원</h4>
                  <p className="text-gray-600 text-sm">한국어, 영어, 일본어, 중국어, 스페인어 문화 적응</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-red-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">고품질 TTS</h4>
                  <p className="text-gray-600 text-sm">Google Cloud Neural2 음성과 SSML 최적화</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}