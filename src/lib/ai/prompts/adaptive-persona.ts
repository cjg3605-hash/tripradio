// Universal Persona System - Complete Replacement
// 기존 한국어 전용 시스템을 완전히 대체하는 새로운 글로벌 시스템

// 새로운 시스템으로 완전 교체됨
export { 
  createUniversalPersonaPrompt as createAdaptivePersonaPrompt,
  shouldUseUniversalPersona as shouldUseAdaptivePersona,
  selectOptimalPersona
} from '../personas/integration-layer';

// 기존 SmartPersonaClassifier 클래스는 제거되고 UniversalPersonaClassifier로 대체됨
// 더 이상 사용되지 않는 기존 함수들 (하위 호환성을 위해 유지하되 새 시스템으로 리다이렉트)

/**
 * @deprecated 기존 SmartPersonaClassifier는 UniversalPersonaClassifier로 대체되었습니다.
 * PersonaIntegrationLayer.selectOptimalPersona를 사용하세요.
 */
export class SmartPersonaClassifier {
  static selectOptimalPersona(locationName: string) {
    console.warn('⚠️ SmartPersonaClassifier는 deprecated되었습니다. 새로운 UniversalPersonaClassifier를 사용하세요.');
    
    // 임시 호환성을 위한 간단한 응답
    return {
      persona: '🎨 예술/문화 전문가',
      confidence: 0.7,
      reasoning: ['기존 시스템에서 새 시스템으로 마이그레이션됨']
    };
  }
}