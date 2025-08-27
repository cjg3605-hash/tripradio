import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'NotebookLM TTS 시스템 테스트 엔드포인트가 정상 작동 중입니다!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    const { locationName, language = 'ko-KR' } = await req.json();
    
    return NextResponse.json({
      success: true,
      message: `NotebookLM 스타일 팟캐스트 생성 요청을 받았습니다.`,
      data: {
        locationName,
        language,
        mockResponse: {
          episodeId: `test-${Date.now()}`,
          audioUrl: 'https://example.com/mock-notebooklm-audio.mp3',
          userScript: `${locationName} 완전 가이드\n\n이것은 ${locationName}의 모든 것을 담은 NotebookLM 스타일 오디오 가이드입니다. 두 명의 AI 호스트가 자연스럽고 흥미진진한 대화를 통해 ${locationName}의 숨겨진 이야기들을 들려드립니다.`,
          duration: 1800, // 30분
          qualityScore: 85,
          chapterTimestamps: [
            { title: '인트로', timestamp: 0 },
            { title: '역사와 배경', timestamp: 300 },
            { title: '주요 명소', timestamp: 900 },
            { title: '문화와 전통', timestamp: 1350 },
            { title: '마무리', timestamp: 1650 }
          ]
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '요청 처리 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}