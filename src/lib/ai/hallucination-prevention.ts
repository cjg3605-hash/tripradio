// 🛡️ AI 할루시네이션 방지 시스템
// 다층적 검증을 통한 가상 정보 생성 방지

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🔍 할루시네이션 방지를 위한 다층적 검증 시스템
 */
export class HallucinationPreventionSystem {
  private genAI: GoogleGenerativeAI;
  private realPlaceDatabase: Set<string> = new Set();
  private suspiciousPatterns: RegExp[] = [];

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.initializeRealPlaceDatabase();
    this.initializeSuspiciousPatterns();
  }

  /**
   * 🔄 챕터 중복 내용 방지 검증
   */
  detectDuplicateContent(
    chapters: Array<{ title: string; content?: any; narrative?: string }>,
    threshold: number = 0.7
  ): Array<{ chapterIndex: number; duplicates: number[]; similarity: number }> {
    const duplicates: Array<{ chapterIndex: number; duplicates: number[]; similarity: number }> = [];
    
    for (let i = 0; i < chapters.length; i++) {
      const currentChapter = chapters[i];
      const currentContent = this.extractContentText(currentChapter);
      
      if (!currentContent || currentContent.length < 50) continue;
      
      const chapterDuplicates: number[] = [];
      let maxSimilarity = 0;
      
      for (let j = i + 1; j < chapters.length; j++) {
        const compareChapter = chapters[j];
        const compareContent = this.extractContentText(compareChapter);
        
        if (!compareContent || compareContent.length < 50) continue;
        
        const similarity = this.calculateContentSimilarity(currentContent, compareContent);
        
        if (similarity >= threshold) {
          chapterDuplicates.push(j);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
      
      if (chapterDuplicates.length > 0) {
        duplicates.push({
          chapterIndex: i,
          duplicates: chapterDuplicates,
          similarity: maxSimilarity
        });
      }
    }
    
    return duplicates;
  }

  /**
   * 📝 챕터에서 텍스트 내용 추출
   */
  private extractContentText(chapter: { title: string; content?: any; narrative?: string }): string {
    let text = chapter.title || '';
    
    if (chapter.narrative) {
      text += ' ' + chapter.narrative;
    }
    
    if (chapter.content) {
      if (typeof chapter.content === 'string') {
        text += ' ' + chapter.content;
      } else if (chapter.content.description) {
        text += ' ' + chapter.content.description;
      } else if (chapter.content.narrative) {
        text += ' ' + chapter.content.narrative;
      }
    }
    
    return text.trim().toLowerCase();
  }

  /**
   * 📊 콘텐츠 유사도 계산 (Jaccard + Levenshtein 조합)
   */
  private calculateContentSimilarity(content1: string, content2: string): number {
    // 1. Jaccard 유사도 (단어 기반)
    const words1 = new Set(content1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(content2.split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const jaccardSimilarity = union.size > 0 ? intersection.size / union.size : 0;
    
    // 2. 레벤시타인 유사도 (문자 기반)
    const maxLength = Math.max(content1.length, content2.length);
    const levenshteinSimilarity = maxLength > 0 
      ? 1 - (this.levenshteinDistance(content1, content2) / maxLength)
      : 0;
    
    // 3. 가중 평균 (Jaccard 70%, Levenshtein 30%)
    return jaccardSimilarity * 0.7 + levenshteinSimilarity * 0.3;
  }

  /**
   * 🎯 메인 할루시네이션 검증 함수 (내용 품질 중심)
   */
  async verifyChapterReality(
    chapterTitle: string,
    locationName: string,
    chapterContent?: any,
    options: { skipAI?: boolean; fastMode?: boolean } = {}
  ): Promise<RealityVerificationResult> {
    console.log('🔍 챕터 내용 품질 검증 시작:', chapterTitle);

    // 1단계: 명백한 가짜 패턴 검증 (AI생성, 테스트 등)
    const obviousFakeCheck = this.checkObviousFakePatterns(chapterTitle, chapterContent);
    if (!obviousFakeCheck.isReal) {
      return obviousFakeCheck;
    }

    // 🚀 빠른 모드: 기본 검증만 실행
    if (options.fastMode || options.skipAI) {
      return {
        isReal: true,
        confidence: 0.8,
        reason: 'fast_mode_pass',
        details: '빠른 모드: 명백한 문제 없음',
        suggestions: []
      };
    }

    // 2단계: AI 기반 내용 품질 검증 (장소명이 아닌 내용 중심)
    const contentQualityCheck = await this.performContentQualityCheck(
      chapterTitle, 
      locationName, 
      chapterContent
    );

    console.log('✅ 챕터 내용 품질 검증 완료:', {
      제목: chapterTitle,
      품질적절성: contentQualityCheck.isReal,
      신뢰도: contentQualityCheck.confidence,
      사유: contentQualityCheck.reason
    });

    return contentQualityCheck;
  }

  /**
   * 🚨 명백한 가짜 패턴 검증 (AI생성 흔적, 테스트 데이터 등)
   */
  private checkObviousFakePatterns(chapterTitle: string, chapterContent?: any): RealityVerificationResult {
    const suspiciousMatches: string[] = [];
    
    // 명백한 AI 생성 흔적들
    const obviousFakePatterns = [
      /\b(AI\s*생성|자동\s*생성|테스트|샘플|더미)\b/i,
      /\b(example|sample|test|placeholder)\b/i,
      /\b(XXX|YYY|ZZZ|TODO|FIXME)\b/,
      /\[.*?\]/  // [여기에 내용] 같은 플레이스홀더
    ];

    // 제목 검사
    for (const pattern of obviousFakePatterns) {
      const match = chapterTitle.match(pattern);
      if (match) {
        suspiciousMatches.push(match[0]);
      }
    }

    // 내용 검사 (있는 경우)
    if (chapterContent) {
      const contentText = this.extractContentText({ 
        title: chapterTitle, 
        content: chapterContent 
      });
      
      for (const pattern of obviousFakePatterns) {
        const match = contentText.match(pattern);
        if (match) {
          suspiciousMatches.push(match[0]);
        }
      }
    }

    if (suspiciousMatches.length > 0) {
      return {
        isReal: false,
        confidence: 0.95,
        reason: 'obvious_fake',
        details: `명백한 가짜 패턴 발견: ${suspiciousMatches.join(', ')}`,
        suggestions: ['실제 내용으로 교체 필요']
      };
    }

    return {
      isReal: true,
      confidence: 0.9,
      reason: 'no_obvious_fake',
      details: '명백한 가짜 패턴 없음'
    };
  }

  /**
   * 📝 내용 품질 검증 (AI 기반)
   */
  private async performContentQualityCheck(
    chapterTitle: string,
    locationName: string,
    chapterContent?: any
  ): Promise<RealityVerificationResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite-preview-06-17',
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200  // 대폭 축소: 1024 → 200
        }
      });

      const contentText = chapterContent ? 
        this.extractContentText({ title: chapterTitle, content: chapterContent }) : 
        chapterTitle;

      const qualityPrompt = `관광가이드 품질평가:

위치: ${locationName}
챕터: ${chapterTitle}
내용: ${contentText.substring(0, 300)}

JSON 응답:
{
  "is_appropriate": true/false,
  "confidence": 0-1,
  "reasoning": "평가근거(간단히)"
}

평가기준:
1. 해당지역 관련성?
2. 논리적 설명?
3. 관광객 유용성?
4. 모순/오류 없음?

참고: 지역적/세부적 장소도 OK, 내용품질 중심평가`;

      const result = await model.generateContent(qualityPrompt);
      const response = await result.response;
      const text = await response.text();

      try {
        const aiResult = JSON.parse(text);
        
        return {
          isReal: aiResult.is_appropriate,
          confidence: Math.min(1, Math.max(0, aiResult.confidence || 0.5)),
          reason: 'content_quality_check',
          details: aiResult.reasoning || 'AI 내용 품질 검증 완료',
          suggestions: [],
          warnings: []
        };

      } catch (parseError) {
        console.warn('⚠️ AI 응답 파싱 실패:', parseError);
        return {
          isReal: true,
          confidence: 0.7,
          reason: 'ai_parse_error',
          details: 'AI 응답 파싱 실패, 기본 통과',
          suggestions: ['수동 검토 권장']
        };
      }

    } catch (error) {
      console.error('❌ 내용 품질 검증 실패:', error);
      return {
        isReal: true,
        confidence: 0.6,
        reason: 'quality_check_error',
        details: '내용 품질 검증 시스템 오류',
        suggestions: ['대안 검증 방법 필요']
      };
    }
  }

  /**
   * 🔍 1단계: 의심스러운 패턴 검증
   */
  private checkSuspiciousPatterns(chapterTitle: string): RealityVerificationResult {
    const suspiciousMatches: string[] = [];

    for (const pattern of this.suspiciousPatterns) {
      const match = chapterTitle.match(pattern);
      if (match) {
        suspiciousMatches.push(match[0]);
      }
    }

    if (suspiciousMatches.length > 0) {
      return {
        isReal: false,
        confidence: 0.95,
        reason: 'suspicious_pattern',
        details: `의심스러운 패턴 발견: ${suspiciousMatches.join(', ')}`,
        suggestions: ['구체적이고 실제 존재하는 장소명으로 수정해주세요']
      };
    }

    return {
      isReal: true,
      confidence: 0.6, // 패턴만으로는 확신할 수 없음
      reason: 'pattern_pass',
      details: '의심스러운 패턴 없음'
    };
  }

  /**
   * 🗄️ 2단계: 실제 장소 데이터베이스 검증
   */
  private checkRealPlaceDatabase(chapterTitle: string, locationName: string): RealityVerificationResult {
    const title = chapterTitle.toLowerCase();
    const location = locationName.toLowerCase();

    // 유명 관광지의 실제 하위 장소들 확인
    const knownRealPlaces = this.getKnownRealPlaces(location);
    
    for (const realPlace of knownRealPlaces) {
      if (title.includes(realPlace.toLowerCase()) || 
          this.calculateSimilarity(title, realPlace.toLowerCase()) > 0.8) {
        return {
          isReal: true,
          confidence: 0.9,
          reason: 'database_verified',
          details: `알려진 실제 장소와 일치: ${realPlace}`,
          suggestions: []
        };
      }
    }

    // 일반적인 관광지 구성 요소 확인 (신뢰도 강화)
    const commonTouristElements = [
      '입구', '출구', '매표소', '주차장', '화장실', '안내소', '카페', '기념품점',
      '전시관', '박물관', '정원', '광장', '계단', '다리', '탑', '문', '건물'
    ];

    for (const element of commonTouristElements) {
      if (title.includes(element)) {
        return {
          isReal: true,
          confidence: 0.75, // 신뢰도 상향 (70% → 75%)
          reason: 'common_element',
          details: `일반적인 관광지 구성요소 포함: ${element}`,
          suggestions: []
        };
      }
    }

    // 추가 확장: 관광지 활동 및 지역 표현
    const touristActivities = [
      '산책로', '둘레길', '관람로', '코스', '구간', '지점', '장소', '공간',
      '휴게소', '전망대', '포토존', '기념촬영', '쉼터', '벤치', '분수',
      '조형물', '석물', '연못', '호수', '숲', '언덕'
    ];

    for (const activity of touristActivities) {
      if (title.includes(activity)) {
        return {
          isReal: true,
          confidence: 0.65, // 중간 신뢰도
          reason: 'tourist_activity',
          details: `관광지 일반 활동/장소 표현: ${activity}`,
          suggestions: []
        };
      }
    }

    return {
      isReal: true,
      confidence: 0.35, // 더 보수적으로 설정 (40% → 35%)
      reason: 'unknown',
      details: '데이터베이스에서 확인되지 않음'
    };
  }

  /**
   * 🤖 3단계: AI 기반 실존성 검증
   */
  private async performAIRealityCheck(
    chapterTitle: string,
    locationName: string,
    chapterContent?: any
  ): Promise<RealityVerificationResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite-preview-06-17',
        generationConfig: {
          temperature: 0.1, // 일관된 검증을 위해
          maxOutputTokens: 1024
        }
      });

      const verificationPrompt = `다음 장소가 실제로 존재하는지 검증해주세요.

메인 위치: ${locationName}
검증 대상: ${chapterTitle}
${chapterContent ? `내용: ${JSON.stringify(chapterContent, null, 2)}` : ''}

다음 JSON 형식으로만 응답해주세요:
{
  "exists": true/false,
  "confidence": 0-1 (확신도),
  "reasoning": "판단 근거",
  "evidences": ["실존 증거들"],
  "warnings": ["의심스러운 점들"],
  "alternatives": ["대안 제안들"]
}

검증 기준:
1. 해당 위치에 실제로 이런 장소가 있는가?
2. 일반적인 관광지 구성과 일치하는가?
3. 너무 구체적이거나 모호한 표현은 없는가?
4. 알려진 사실과 모순되지 않는가?`;

      const result = await model.generateContent(verificationPrompt);
      const response = await result.response;
      const text = await response.text();

      try {
        const aiResult = JSON.parse(text);
        
        return {
          isReal: aiResult.exists,
          confidence: Math.min(1, Math.max(0, aiResult.confidence || 0.5)),
          reason: 'ai_verification',
          details: aiResult.reasoning || 'AI 검증 완료',
          suggestions: aiResult.alternatives || [],
          evidences: aiResult.evidences || [],
          warnings: aiResult.warnings || []
        };

      } catch (parseError) {
        console.warn('⚠️ AI 응답 파싱 실패:', parseError);
        return {
          isReal: true,
          confidence: 0.3,
          reason: 'ai_parse_error',
          details: 'AI 응답을 파싱할 수 없음',
          suggestions: ['수동 검증 필요']
        };
      }

    } catch (error) {
      console.error('❌ AI 실존성 검증 실패:', error);
      return {
        isReal: true,
        confidence: 0.2,
        reason: 'ai_error',
        details: 'AI 검증 시스템 오류',
        suggestions: ['대안 검증 방법 필요']
      };
    }
  }

  /**
   * 🏗️ 4단계: 구조적 일관성 검증
   */
  private checkStructuralConsistency(
    chapterTitle: string,
    locationName: string
  ): RealityVerificationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // 너무 구체적인 숫자나 시간 확인
    const specificNumbers = chapterTitle.match(/\d{4}년|\d+월\s*\d+일|\d+:\d+/g);
    if (specificNumbers && specificNumbers.length > 2) {
      issues.push('과도하게 구체적인 시간/날짜 정보');
    }

    // 일관성 없는 명명 규칙
    const hasKoreanAndNumbers = /[가-힣].*\d+.*[가-힣]/.test(chapterTitle);
    if (hasKoreanAndNumbers && chapterTitle.includes('호실')) {
      warnings.push('구체적인 호실 번호 포함');
    }

    // 모순적인 표현
    const contradictoryTerms = [
      ['실내', '야외'],
      ['지하', '옥상'],
      ['입구', '출구']
    ];

    for (const [term1, term2] of contradictoryTerms) {
      if (chapterTitle.includes(term1) && chapterTitle.includes(term2)) {
        issues.push(`모순적인 표현: ${term1}와 ${term2}`);
      }
    }

    const hasIssues = issues.length > 0;
    const hasWarnings = warnings.length > 0;

    return {
      isReal: !hasIssues,
      confidence: hasIssues ? 0.2 : (hasWarnings ? 0.6 : 0.8),
      reason: hasIssues ? 'structural_inconsistency' : 'structural_consistent',
      details: hasIssues ? issues.join(', ') : '구조적 일관성 통과',
      suggestions: hasIssues ? ['더 일반적이고 일관된 표현 사용'] : [],
      warnings: warnings
    };
  }

  /**
   * 🔗 5단계: 검증 결과 통합
   */
  private combineVerificationResults(
    results: RealityVerificationResult[]
  ): RealityVerificationResult {
    // 가중 평균으로 최종 신뢰도 계산
    const weights = [0.3, 0.25, 0.3, 0.15]; // 패턴, DB, AI, 구조
    let totalConfidence = 0;
    let totalWeight = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const weight = weights[i] || 0.1;
      
      totalConfidence += (result.isReal ? result.confidence : -result.confidence) * weight;
      totalWeight += weight;
    }

    const finalConfidence = Math.abs(totalConfidence / totalWeight);
    const isReal = totalConfidence > 0;

    // 가장 확실한 부정적 결과가 있으면 우선
    const negativeResults = results.filter(r => !r.isReal && r.confidence > 0.8);
    if (negativeResults.length > 0) {
      return negativeResults[0];
    }

    // 모든 결과 통합
    const allSuggestions = results.flatMap(r => r.suggestions || []);
    const allWarnings = results.flatMap(r => r.warnings || []);
    const allEvidences = results.flatMap(r => r.evidences || []);

    return {
      isReal,
      confidence: finalConfidence,
      reason: 'combined_analysis',
      details: `${results.length}개 검증 방법 통합 분석`,
      suggestions: [...new Set(allSuggestions)],
      warnings: [...new Set(allWarnings)],
      evidences: [...new Set(allEvidences)]
    };
  }

  /**
   * 🗃️ 초기화: 실제 장소 데이터베이스
   */
  private initializeRealPlaceDatabase(): void {
    this.realPlaceDatabase = new Set([
      // 경복궁
      '광화문', '근정전', '경회루', '향원정', '강녕전', '교태전', '자경전', '흥례문',
      // 창덕궁  
      '돈화문', '인정전', '선정전', '희정당', '대조전', '비원', '후원',
      // 덕수궁
      '대한문', '중화전', '중화문', '석조전', '즉조당', '함녕전',
      // 기타 서울 명소
      '남산타워', '명동성당', '동대문', '광장시장', '청계천', '북촌한옥마을', '인사동',
      // 제주도
      '성산일출봉', '만장굴', '천지연폭포', '정방폭포', '섭지코지', '우도', '한라산',
      // 부산
      '해운대', '광안리', '감천문화마을', '태종대', '용두산공원', '자갈치시장', '국제시장'
    ]);
  }

  /**
   * 🚨 초기화: 의심스러운 패턴들
   */
  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      // 명시적 가상 표현
      /\b(가상|상상|임의|예시|샘플|더미|테스트)\b/i,
      /\b(존재하지\s*않는|없는|가짜|허구)\b/i,
      
      // 플레이스홀더 패턴
      /\b(OO|XX|YY|ZZ|AAA|BBB)\b/,
      /\b(예:\s*|ex:\s*|sample:\s*)/i,
      /\[\s*.*\s*\]/,
      
      // 과도하게 구체적인 숫자
      /\b\d{4}년\s*\d{1,2}월\s*\d{1,2}일\b/,
      /\b\d{1,2}:\d{2}:\d{2}\b/,
      /\b제\s*\d{3,}\s*호실?\b/,
      
      // 모호하거나 일반적인 표현
      /\b(어딘가|무엇인가|그곳|이곳|저곳)\b/,
      /\b(1번|2번|3번).*?(구역|지역|장소)\b/,
      
      // AI가 자주 만드는 패턴
      /\b(AI\s*생성|자동\s*생성|시스템\s*생성)\b/i,
      /\b(임시.*?명칭|가칭|예정)\b/
    ];
  }

  /**
   * 🗺️ 알려진 실제 장소 조회
   */
  private getKnownRealPlaces(locationName: string): string[] {
    const locationMap: Record<string, string[]> = {
      '경복궁': ['광화문', '근정전', '경회루', '향원정', '강녕전', '교태전', '자경전', '흥례문', '수정전'],
      '창덕궁': ['돈화문', '인정전', '선정전', '희정당', '대조전', '비원', '후원', '낙선재'],
      '덕수궁': ['대한문', '중화전', '중화문', '석조전', '즉조당', '함녕전', '중명전'],
      '롯데월드': ['매직아일랜드', '어드벤처', '석촌호수', '롯데타워'],
      '에버랜드': ['글로벌페어', '아메리칸어드벤처', '매직랜드', '유러피안어드벤처', '주토피아'],
      '제주도': ['성산일출봉', '만장굴', '천지연폭포', '정방폭포', '섭지코지', '우도', '한라산'],
      '부산': ['해운대', '광안리', '감천문화마을', '태종대', '용두산공원', '자갈치시장']
    };

    const location = locationName.toLowerCase();
    for (const [key, places] of Object.entries(locationMap)) {
      if (location.includes(key.toLowerCase())) {
        return places;
      }
    }

    return [];
  }

  /**
   * 📊 문자열 유사도 계산
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 📏 레벤시타인 거리 계산
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

/**
 * 🔍 실존성 검증 결과 인터페이스
 */
export interface RealityVerificationResult {
  isReal: boolean;
  confidence: number; // 0-1
  reason: string;
  details: string;
  suggestions?: string[];
  warnings?: string[];
  evidences?: string[];
}

/**
 * 🎯 배치 검증을 위한 헬퍼 함수 (최적화된 버전)
 */
export async function verifyMultipleChapters(
  chapters: Array<{ title: string; content?: any }>,
  locationName: string,
  apiKey: string,
  options: { fastMode?: boolean; skipAI?: boolean } = { fastMode: true }
): Promise<Array<RealityVerificationResult & { chapterTitle: string }>> {
  const preventionSystem = new HallucinationPreventionSystem(apiKey);
  
  // 🚀 기본적으로 빠른 모드 사용 (AI 검증 최소화)
  const results = await Promise.all(
    chapters.map(async (chapter) => {
      const verification = await preventionSystem.verifyChapterReality(
        chapter.title,
        locationName,
        chapter.content,
        options
      );
      
      return {
        ...verification,
        chapterTitle: chapter.title
      };
    })
  );

  return results;
}

/**
 * ⚡ 초고속 검증 (로컬만, AI 없음)
 */
export function quickVerifyMultipleChapters(
  chapters: Array<{ title: string; content?: any }>,
  locationName: string,
  apiKey: string
): Promise<Array<RealityVerificationResult & { chapterTitle: string }>> {
  return verifyMultipleChapters(chapters, locationName, apiKey, { 
    fastMode: true, 
    skipAI: true 
  });
}

/**
 * 🛡️ 간단한 실시간 검증 (빠른 필터링용)
 */
export function quickHallucinationCheck(chapterTitle: string): boolean {
  const criticalPatterns = [
    /\b(가상|임의|예시|테스트)\b/i,
    /\b(OO|XX|YY|ZZ)\b/,
    /\[\s*.*\s*\]/,
    /\b(AI\s*생성|자동\s*생성)\b/i
  ];

  return !criticalPatterns.some(pattern => pattern.test(chapterTitle));
}