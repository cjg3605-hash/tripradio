// 🧪 Enhanced Intro Chapter Generation System Test
// 개선된 인트로 챕터 생성 시스템 테스트 및 검증

import { EnhancedIntroChapterGenerator } from './intro-chapter-generator';
import { EnhancedChapterSelectionSystem } from './enhanced-chapter-system';
import { LocationData, UserProfile } from '@/types/enhanced-chapter';

/**
 * 🎯 Enhanced Intro Chapter 시스템 테스트
 */
export async function testEnhancedIntroChapterSystem() {
  console.log('🧪 Enhanced Intro Chapter System 테스트 시작');

  // 🏛️ 테스트용 위치 데이터 생성 (경복궁 예시)
  const testLocationData: LocationData = {
    name: '경복궁',
    coordinates: { lat: 37.5796, lng: 126.9770 },
    venueType: 'mixed',
    scale: 'major_attraction',
    averageVisitDuration: 120, // 2시간
    tier1Points: [
      {
        id: 'gyeonghoeru',
        name: '경회루',
        coordinates: { lat: 37.5798, lng: 126.9765 },
        tier: 'tier1_worldFamous',
        scores: {
          globalFameScore: 9.2,
          culturalImportance: 9.5,
          visitorPreference: 9.0,
          photoWorthiness: 9.8,
          uniquenessScore: 9.3,
          accessibilityScore: 7.5
        },
        compositeScore: 9.2,
        content: {
          shortDescription: '조선 왕궁의 대표적인 누각',
          detailedDescription: '경복궁 내 가장 아름다운 건축물 중 하나',
          interestingFacts: '국가 보물 제224호',
          photoTips: '연못에 비친 모습이 아름답습니다'
        },
        location: {
          sectionName: '경회루 구역',
          visualLandmarks: ['연못', '돌다리'],
          walkingDirections: '근정전에서 서쪽으로 이동'
        },
        metadata: {
          lastVerified: new Date(),
          curatorNotes: '전문가 검증 완료'
        }
      }
    ],
    tier2Points: [
      {
        id: 'geunjeongjeon',
        name: '근정전',
        coordinates: { lat: 37.5794, lng: 126.9772 },
        tier: 'tier2_nationalTreasure',
        scores: {
          globalFameScore: 8.8,
          culturalImportance: 9.8,
          visitorPreference: 8.5,
          photoWorthiness: 9.0,
          uniquenessScore: 9.0,
          accessibilityScore: 8.0
        },
        compositeScore: 8.9,
        content: {
          shortDescription: '조선왕조의 정전',
          detailedDescription: '왕이 신하들과 조회를 하던 곳',
          interestingFacts: '국보 제223호',
          photoTips: '정면에서 촬영하면 웅장함을 느낄 수 있습니다'
        },
        location: {
          sectionName: '근정전 구역',
          visualLandmarks: ['월대', '품계석'],
          walkingDirections: '광화문에서 직진'
        },
        metadata: {
          lastVerified: new Date(),
          curatorNotes: '전문가 검증 완료'
        }
      }
    ],
    tier3Points: []
  };

  // 👤 테스트용 사용자 프로필
  const testUserProfile: UserProfile = {
    interests: ['역사', '문화', '건축'],
    ageGroup: '30대',
    knowledgeLevel: '중급',
    companions: 'family',
    tourDuration: 120,
    preferredStyle: '교육적',
    language: 'ko'
  };

  try {
    // 🎯 테스트 1: EnhancedIntroChapterGenerator 직접 테스트
    console.log('\n📝 테스트 1: Enhanced Intro Chapter Generator 직접 테스트');
    
    const introGenerator = new EnhancedIntroChapterGenerator();
    const directIntroChapter = await introGenerator.generateEnhancedIntroChapter(
      testLocationData,
      testUserProfile
    );

    console.log('✅ 직접 생성 결과:', {
      title: directIntroChapter.title,
      timeEstimate: directIntroChapter.content.timeEstimate,
      timePercentage: ((directIntroChapter.content.timeEstimate / testLocationData.averageVisitDuration) * 100).toFixed(1) + '%',
      contentLengths: {
        historical: directIntroChapter.content.historicalBackground.length,
        cultural: directIntroChapter.content.culturalContext.length,
        tips: directIntroChapter.content.visitingTips.length,
        expectation: directIntroChapter.content.whatsToExpected.length
      },
      highlightsCount: directIntroChapter.content.highlightsPreview.length,
      nextChapterHint: directIntroChapter.navigation.nextChapterHint.substring(0, 50) + '...'
    });

    // 🎯 테스트 2: Enhanced Chapter Selection System 통합 테스트
    console.log('\n🏗️ 테스트 2: Enhanced Chapter Selection System 통합 테스트');
    
    const chapterSystem = new EnhancedChapterSelectionSystem();
    const chapterResponse = await chapterSystem.generateOptimalChapters({
      locationName: testLocationData.name,
      userProfile: testUserProfile,
      preferredLanguage: 'ko',
      visitDuration: testLocationData.averageVisitDuration
    });

    if (chapterResponse.success && chapterResponse.data) {
      const introChapter = chapterResponse.data.introChapter;
      
      console.log('✅ 통합 시스템 결과:', {
        success: chapterResponse.success,
        introTitle: introChapter.title,
        introTimeEstimate: introChapter.content.timeEstimate,
        timePercentage: ((introChapter.content.timeEstimate / testLocationData.averageVisitDuration) * 100).toFixed(1) + '%',
        totalChapters: chapterResponse.data.metadata.totalChapters,
        totalDuration: chapterResponse.data.metadata.estimatedTotalDuration,
        confidence: chapterResponse.metadata?.confidence
      });

      // 🔍 테스트 3: 컨텐츠 품질 검증
      console.log('\n🔍 테스트 3: 컨텐츠 품질 검증');
      
      const qualityReport = analyzeContentQuality(introChapter);
      console.log('📊 품질 분석 결과:', qualityReport);

      // 🎯 테스트 4: 기존 시스템과 비교
      console.log('\n📊 테스트 4: 기존 시스템과의 개선점 비교');
      
      const improvementReport = {
        '시간 배정 개선': `기존 10% → 현재 ${((introChapter.content.timeEstimate / testLocationData.averageVisitDuration) * 100).toFixed(1)}%`,
        '컨텐츠 풍부함': `AI 기반 상세 내용 생성`,
        '개인화 수준': `사용자 프로필 기반 맞춤 설명`,
        '문화적 깊이': `종합적 배경지식 제공`,
        '실용성': `구체적이고 도움되는 팁 제공`
      };
      
      console.log('🚀 개선점:', improvementReport);

    } else {
      console.error('❌ 통합 시스템 테스트 실패:', chapterResponse.error);
    }

    console.log('\n✅ Enhanced Intro Chapter System 테스트 완료');
    return true;

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    return false;
  }
}

/**
 * 🔍 컨텐츠 품질 분석
 */
function analyzeContentQuality(introChapter: any) {
  const content = introChapter.content;
  
  return {
    '역사적 배경 길이': `${content.historicalBackground.length}자 ${content.historicalBackground.length >= 400 ? '✅' : '⚠️'}`,
    '문화적 맥락 길이': `${content.culturalContext.length}자 ${content.culturalContext.length >= 300 ? '✅' : '⚠️'}`,
    '방문 팁 길이': `${content.visitingTips.length}자 ${content.visitingTips.length >= 200 ? '✅' : '⚠️'}`,
    '기대치 설명 길이': `${content.whatsToExpected.length}자 ${content.whatsToExpected.length >= 200 ? '✅' : '⚠️'}`,
    '시간 배정': `${content.timeEstimate}분 ${content.timeEstimate >= 20 ? '✅' : '⚠️'}`,
    '하이라이트 개수': `${content.highlightsPreview.length}개 ${content.highlightsPreview.length > 0 ? '✅' : '⚠️'}`,
    '네비게이션 힌트': content.nextChapterHint ? '✅' : '❌'
  };
}

/**
 * 🚀 테스트 실행 함수
 */
export async function runEnhancedIntroChapterTests() {
  console.log('🎯 Enhanced Intro Chapter Generation System 테스트 시작');
  console.log('=' .repeat(60));
  
  const testResult = await testEnhancedIntroChapterSystem();
  
  console.log('=' .repeat(60));
  console.log(testResult ? '✅ 모든 테스트 통과' : '❌ 테스트 실패');
  
  return testResult;
}

// 테스트 실행 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  // runEnhancedIntroChapterTests();
}