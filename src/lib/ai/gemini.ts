import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경변수 확인 및 초기화
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY가 설정되지 않았습니다. 더미 데이터를 사용합니다.');
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// UserProfile은 types/guide.ts에서 import
import { UserProfile } from '@/types/guide';

export const GEMINI_PROMPTS = {
  GUIDE_GENERATION: {
    system: `당신은 세계 최고의 개인화 관광 가이드 AI입니다.

핵심 원칙:
1. 사용자의 관심사와 시간에 맞춘 개인화
2. 정확한 역사적 사실만 사용
3. 친근하고 이해하기 쉬운 설명
4. 반드시 유효한 JSON 형식으로만 응답

설명 스타일:
- 친근한 말투로 "~입니다", "~해요" 사용
- 복잡한 개념은 쉬운 비유로 설명
- 흥미로운 일화나 놀라운 사실 포함

출력 형식 (반드시 유효한 JSON):
{
  "overview": "명소 개요 (2-3문장)",
  "history": "역사적 배경 설명",
  "highlights": ["중요 포인트1", "중요 포인트2", "중요 포인트3"],
  "visitRoute": {
    "totalDuration": 90,
    "description": "관람 동선 설명",
    "steps": [
      {
        "order": 1,
        "location": "장소명",
        "duration": "30분",
        "description": "해당 구간 설명"
      }
    ]
  },
  "detailedStops": [
    {
      "order": 1,
      "name": "정류장 제목",
      "navigation": "이동 방법",
      "content": "가이드 설명 (200-300자)",
      "keyPoints": ["포인트1", "포인트2", "포인트3"],
      "guideNote": "가이드 조언",
      "duration": 15
    }
  ],
  "personalizedNote": "개인화 메시지"
}`,

    user: (location: string, profile: UserProfile) => `
명소: ${location}

사용자 정보:
- 관심사: ${profile.interests?.join(', ') || '일반'}
- 희망시간: ${profile.tourDuration || 90}분
- 스타일: ${profile.preferredStyle || '친근함'}

이 사용자를 위한 개인화 가이드를 JSON 형식으로 생성하세요.

중요: 
- JSON 외에 다른 텍스트 없이 순수 JSON만 응답
- 문자열 내 따옴표는 \\"로 이스케이프
- 모든 중괄호와 대괄호가 올바르게 닫혀야 함`
  }
};

// 이전 함수명과의 호환성을 위해 추가
export const generateGuide = generatePersonalizedGuide;

export async function generatePersonalizedGuide(
  location: string,
  userProfile: UserProfile
) {
  // userProfile 안전성 검사 및 기본값 설정 (함수 최상단으로 이동)
  const safeProfile: UserProfile = {
    interests: userProfile?.interests || ['history'],
    ageGroup: userProfile?.ageGroup || '30s',
    knowledgeLevel: userProfile?.knowledgeLevel || 'intermediate',
    companions: userProfile?.companions || 'solo',
    tourDuration: userProfile?.tourDuration || 90,
    preferredStyle: userProfile?.preferredStyle || 'friendly',
    language: userProfile?.language || 'ko'
  };

  try {
    // Gemini API가 없는 경우 더미 데이터 반환
    if (!genAI) {
      console.log('🎭 더미 데이터로 가이드 생성:', location);
      return generateFallbackGuide(location, safeProfile);
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite-preview-06-17"
    });
    
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
      // @ts-ignore - topK is supported by the API but not in types
      topK: 40
    };

    const prompt = `${GEMINI_PROMPTS.GUIDE_GENERATION.system}

${GEMINI_PROMPTS.GUIDE_GENERATION.user(location, safeProfile)}`;

    console.log('🤖 Gemini 라이브러리에서 프롬프트 전송 중...');

    // Generate content by passing the prompt string directly
    const result = await model.generateContent(prompt);
    
    // Get the response and extract text
    const response = await result.response;
    const responseText = await response.text();
    
    try {
      // 디버깅을 위한 로그
      if (process.env.NODE_ENV === 'development') {
        const textLength = responseText.length;
        const textPreview = responseText.substring(0, 200);
        console.log('원본 AI 응답 길이:', textLength);
        console.log('응답 미리보기:', textPreview + '...');
      }
      
      let cleanedText = responseText.trim();
      
      // 마크다운 코드 블록 제거
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      cleanedText = cleanedText.replace(/```\s*/, '');
      
      // 앞뒤 공백 및 불필요한 텍스트 제거
      cleanedText = cleanedText.trim();
      
      // 첫 번째 { 찾기
      const startIndex = cleanedText.indexOf('{');
      if (startIndex === -1) {
        throw new Error('JSON 시작 중괄호를 찾을 수 없습니다');
      }
      
      // 중괄호 균형을 맞춰서 JSON 끝 찾기
      let openBraces = 0;
      let endIndex = -1;
      
      for (let i = startIndex; i < cleanedText.length; i++) {
        if (cleanedText[i] === '{') {
          openBraces++;
        } else if (cleanedText[i] === '}') {
          openBraces--;
          if (openBraces === 0) {
            endIndex = i;
            break;
          }
        }
      }
      
      if (endIndex === -1) {
        throw new Error('JSON 종료 중괄호를 찾을 수 없습니다');
      }
      
      const jsonString = cleanedText.substring(startIndex, endIndex + 1);
      console.log('추출된 JSON 길이:', jsonString.length);
      
      const parsed = JSON.parse(jsonString);
      console.log('✅ JSON 파싱 성공');
      return parsed;
      
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      console.log('실패한 응답 (처음 500자):', responseText.substring(0, 500));
      console.log('실패한 응답 (마지막 500자):', responseText.substring(Math.max(0, responseText.length - 500)));
      throw new Error(`AI 응답을 파싱할 수 없습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

  } catch (error) {
    console.error('Gemini API 호출 실패:', error);
    // 에러 발생 시 더미 데이터로 대체하지 않고 에러를 그대로 던짐
    throw error;
  }
}

// 더미 데이터 생성 함수 (API 키 없을 때 사용)
function generateFallbackGuide(location: string, userProfile: UserProfile) {
  // 안전한 접근을 위한 기본값 설정
  const tourDuration = userProfile?.tourDuration || 90;
  const preferredStyle = userProfile?.preferredStyle || 'friendly';
  
  return {
    overview: `${location}은(는) 역사와 문화가 살아 숨쉬는 특별한 장소입니다. 이곳에서 당신만의 특별한 여행 경험을 만들어보세요.`,
    history: `${location}은(는) 오랜 세월 동안 많은 사람들에게 사랑받아온 명소입니다. 각 시대마다 다른 이야기들이 이곳에 스며들어 있어요.`,
    highlights: [
      "아름다운 건축양식과 독특한 디자인",
      "깊은 역사적 의미와 문화적 가치", 
      "방문객들이 꼭 봐야 할 포토스팟"
    ],
    visitRoute: {
      totalDuration: tourDuration,
      description: "효율적이고 재미있는 관람 동선을 추천드립니다",
      steps: [
        {
          order: 1,
          location: "입구 및 외관",
          duration: "20분",
          description: "전체적인 모습을 감상하고 역사적 배경을 이해합니다"
        },
        {
          order: 2,
          location: "주요 내부 공간",
          duration: "40분", 
          description: "가장 중요한 볼거리들을 차례대로 둘러봅니다"
        },
        {
          order: 3,
          location: "특별 전시 공간",
          duration: "30분",
          description: "세부적인 볼거리와 숨겨진 이야기들을 발견합니다"
        }
      ]
    },
    detailedStops: [
      {
        order: 1,
        name: `${location} 입구`,
        navigation: "정문에서 시작하여 전체적인 모습을 먼저 감상해보세요",
        content: `자, 이제 ${location}에 도착했습니다! 먼저 전체적인 모습을 천천히 둘러보시면서 이 곳의 웅장함을 느껴보세요. 멀리서 보는 것과 가까이서 보는 것이 완전히 다른 느낌을 줄 거예요.`,
        keyPoints: [
          "독특한 건축 양식의 특징",
          "전체적인 규모와 배치", 
          "주변 환경과의 조화"
        ],
        guideNote: "사진을 찍기에도 좋은 포인트니까 여러 각도로 담아보세요!",
        duration: 20
      },
      {
        order: 2,
        name: `${location} 내부`,
        navigation: "입구를 통해 내부로 들어가시면 메인 공간이 나타납니다",
        content: `이제 내부로 들어가볼까요? 내부에는 정말 놀라운 것들이 가득해요. 천장부터 바닥까지, 곳곳에 숨겨진 이야기들이 있답니다. 천천히 걸으면서 세부적인 장식들도 놓치지 마세요.`,
        keyPoints: [
          "내부 장식의 의미와 상징",
          "건축 기법의 특별함",
          "당시 사람들의 생활상"
        ],
        guideNote: "이곳에서는 조용히 감상하는 것이 예의예요. 다른 방문객들도 배려해주세요.",
        duration: 40
      },
      {
        order: 3,
        name: `${location} 특별 공간`,
        navigation: "메인 공간에서 좀 더 깊숙이 들어가면 특별한 공간들이 있어요",
        content: `마지막으로 이 특별한 공간을 소개해드릴게요. 여기는 많은 사람들이 놓치고 지나가는 곳인데, 사실 가장 중요한 의미를 담고 있는 곳이랍니다. 시간을 충분히 갖고 여유롭게 둘러보세요.`,
        keyPoints: [
          "숨겨진 보물 같은 볼거리",
          "특별한 역사적 사건들",
          "현재까지 이어지는 의미"
        ],
        guideNote: "여기서의 경험이 오래도록 기억에 남을 거예요. 마음속에 깊이 새겨두세요!",
        duration: 30
      }
    ],
    personalizedNote: `${preferredStyle === 'friendly' ? '친구' : '여행자'}님! ${location}에서의 특별한 시간이 되길 바라요. 이곳의 이야기들이 당신의 마음에 오래도록 남기를 희망합니다. 🌟`
  };
} 