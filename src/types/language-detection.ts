// 언어 감지 시스템 타입 정의

export type LanguageDetectionSource = 'ip' | 'cookie' | 'url' | 'browser' | 'default';

export interface LanguageDetectionResult {
  language: string;
  source: LanguageDetectionSource;
  country?: string;
  confidence: number; // 0-1 사이의 신뢰도
  timestamp: number;
}

export function getDetectionSourceMessage(result: LanguageDetectionResult): string {
  const messages = {
    ip: `지역(${result.country})에 맞는 언어로 설정했습니다`,
    cookie: '이전 설정을 불러왔습니다',
    url: 'URL에서 지정한 언어를 적용했습니다',
    browser: '브라우저 언어 설정에 맞춰 언어를 설정했습니다',
    default: '기본 언어(영어)로 설정했습니다'
  };
  
  return messages[result.source] || '언어가 설정되었습니다';
}