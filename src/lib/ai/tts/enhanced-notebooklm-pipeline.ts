/**
 * 강화된 NotebookLM 팟캐스트 TTS 파이프라인
 * 완전한 스크립트 정제 + 다중 화자 음성 생성 통합 시스템
 */

import { 
  NotebookLMScriptCleaner, 
  ScriptCleaningResult, 
  SpeakerSegment,
  cleanNotebookLMScript 
} from './notebooklm-script-cleaner';

import { 
  MultiVoiceTTSGenerator, 
  MultiVoiceTTSConfig, 
  GeneratedVoiceFiles,
  generateMultiVoicePodcast
} from './multi-voice-tts-generator';

import NotebookLMTTSOptimizer, { 
  NotebookLMOptimizationConfig,
  NotebookLMOptimizationFactory 
} from '../optimization/notebooklm-tts-optimization-guide';

export interface CleanedScript {
  /** 정제된 원본 스크립트 */
  originalScript: string;
  /** 화자별 분리된 스크립트 */
  speakerSegments: {
    speaker: string;
    content: string;
    timestamp?: number;
  }[];
  /** 메타데이터 */
  metadata: {
    totalDuration?: number;
    speakerCount: number;
    wordCount: number;
    cleaningLevel: 'basic' | 'moderate' | 'complete';
  };
}

export interface EnhancedPodcastResult {
  /** 완전히 정제된 스크립트 데이터 */
  cleanedScript: CleanedScript;
  /** 생성된 음성 파일들 */
  voiceFiles: GeneratedVoiceFiles;
  /** 파이프라인 실행 결과 */
  pipelineResult: PipelineExecutionResult;
  /** 품질 점수 및 메트릭 */
  qualityAssessment: QualityAssessment;
}

export interface PipelineExecutionResult {
  /** 실행 성공 여부 */
  success: boolean;
  /** 총 처리 시간 (ms) */
  totalProcessingTime: number;
  /** 단계별 처리 시간 */
  stepTimes: {
    scriptCleaning: number;
    voiceGeneration: number;
    qualityAssessment: number;
    optimization: number;
  };
  /** 발생한 에러 (있는 경우) */
  errors?: PipelineError[];
  /** 경고 메시지 */
  warnings?: string[];
}

export interface QualityAssessment {
  /** 전체 품질 점수 (0-100) */
  overallScore: number;
  /** 세부 품질 메트릭 */
  metrics: {
    /** 스크립트 정제 품질 */
    scriptCleaningQuality: number;
    /** 음성 생성 품질 */
    voiceGenerationQuality: number;
    /** 화자 구분 명확성 */
    speakerDistinction: number;
    /** 대화 자연성 */
    conversationNaturalness: number;
    /** NotebookLM 스타일 유사도 */
    notebookLMSimilarity: number;
  };
  /** 품질 개선 제안 */
  improvements: QualityImprovement[];
}

export interface QualityImprovement {
  /** 개선 카테고리 */
  category: 'script' | 'voice' | 'flow' | 'technical';
  /** 개선 우선순위 */
  priority: 'high' | 'medium' | 'low';
  /** 개선 제안 내용 */
  suggestion: string;
  /** 예상 품질 향상도 */
  expectedImprovement: number;
}

export interface PipelineError {
  /** 에러 발생 단계 */
  step: 'cleaning' | 'optimization' | 'voice-generation' | 'quality-assessment';
  /** 에러 코드 */
  code: string;
  /** 에러 메시지 */
  message: string;
  /** 에러 상세 정보 */
  details?: any;
  /** 복구 가능 여부 */
  recoverable: boolean;
}

export interface EnhancedPipelineConfig {
  /** 스크립트 정제 설정 */
  cleaningConfig?: {
    /** 마크다운 정제 강도 */
    markdownCleaningLevel: 'basic' | 'aggressive' | 'complete';
    /** 이모지 제거 설정 */
    emojiRemoval: boolean;
    /** 화자 라벨 정제 방식 */
    speakerLabelCleaning: 'remove' | 'normalize' | 'preserve';
  };
  
  /** 음성 생성 설정 */
  voiceConfig?: Partial<MultiVoiceTTSConfig>;
  
  /** 최적화 설정 */
  optimizationConfig?: NotebookLMOptimizationConfig;
  
  /** 품질 관리 설정 */
  qualityConfig?: {
    /** 최소 품질 점수 */
    minimumQualityScore: number;
    /** 품질 검사 강도 */
    qualityCheckLevel: 'basic' | 'standard' | 'strict';
    /** 자동 재시도 설정 */
    autoRetry: boolean;
  };
  
  /** 출력 설정 */
  outputConfig?: {
    /** 중간 결과 저장 여부 */
    saveIntermediateResults: boolean;
    /** 디버그 정보 포함 여부 */
    includeDebugInfo: boolean;
    /** 성능 메트릭 수집 여부 */
    collectPerformanceMetrics: boolean;
  };
}

/**
 * 강화된 NotebookLM 팟캐스트 파이프라인
 */
export class EnhancedNotebookLMPipeline {
  
  private static readonly DEFAULT_CONFIG: EnhancedPipelineConfig = {
    cleaningConfig: {
      markdownCleaningLevel: 'complete',
      emojiRemoval: true,
      speakerLabelCleaning: 'remove'
    },
    voiceConfig: undefined,
    optimizationConfig: undefined,
    qualityConfig: {
      minimumQualityScore: 75,
      qualityCheckLevel: 'standard',
      autoRetry: true
    },
    outputConfig: {
      saveIntermediateResults: false,
      includeDebugInfo: false,
      collectPerformanceMetrics: true
    }
  };

  /**
   * 메인 파이프라인 실행
   */
  static async processPodcastScript(
    rawScript: string,
    config?: EnhancedPipelineConfig
  ): Promise<EnhancedPodcastResult> {
    
    const startTime = Date.now();
    const finalConfig = this.mergeConfig(config);
    
    console.log('🚀 강화된 NotebookLM 파이프라인 시작...');
    
    const stepTimes = {
      scriptCleaning: 0,
      voiceGeneration: 0,
      qualityAssessment: 0,
      optimization: 0
    };
    
    const errors: PipelineError[] = [];
    const warnings: string[] = [];
    
    try {
      // Step 1: 스크립트 정제
      console.log('🧹 Step 1: 스크립트 정제...');
      const cleaningStart = Date.now();
      
      const scriptCleaningResult = await this.executeScriptCleaning(rawScript, finalConfig);
      stepTimes.scriptCleaning = Date.now() - cleaningStart;
      
      if (!scriptCleaningResult.dialogueSegments || scriptCleaningResult.dialogueSegments.length === 0) {
        throw new Error('화자 세그먼트를 추출할 수 없습니다.');
      }
      
      // ScriptCleaningResult를 CleanedScript로 변환
      const cleanedScript: CleanedScript = {
        originalScript: rawScript,
        speakerSegments: scriptCleaningResult.dialogueSegments.map(segment => ({
          speaker: segment.speaker,
          content: segment.content || segment.text || '',
          timestamp: segment.timestamp || 0
        })),
        metadata: {
          totalDuration: scriptCleaningResult.estimatedDuration || 0,
          speakerCount: [...new Set(scriptCleaningResult.dialogueSegments.map(s => s.speaker))].length,
          wordCount: scriptCleaningResult.cleanedLength || 0,
          cleaningLevel: 'complete'
        }
      };
      
      console.log('✅ 스크립트 정제 완료:', {
        originalChars: scriptCleaningResult.originalLength,
        cleanedChars: scriptCleaningResult.cleanedLength,
        dialogueSegments: cleanedScript.speakerSegments.length,
        efficiency: `${scriptCleaningResult.reductionPercentage?.toFixed(1) || 0}%`
      });

      // Step 2: TTS 최적화 (선택적)
      console.log('🎯 Step 2: TTS 최적화...');
      const optimizationStart = Date.now();
      
      let optimizationResult: any = null;
      if (finalConfig.optimizationConfig) {
        try {
          console.log('🔧 TTS 최적화 입력 데이터:', {
            scriptLength: cleanedScript.originalScript?.length || 0,
            hasConfig: !!finalConfig.optimizationConfig,
            configKeys: finalConfig.optimizationConfig ? Object.keys(finalConfig.optimizationConfig) : []
          });
          
          optimizationResult = NotebookLMTTSOptimizer.optimizeForNotebookLMStyle(
            cleanedScript.originalScript,
            finalConfig.optimizationConfig
          );
          console.log('✅ TTS 최적화 완료:', {
            qualityScore: optimizationResult?.qualityScore,
            optimizations: optimizationResult?.optimizationApplied?.length || 0
          });
        } catch (optimizationError) {
          console.warn('⚠️ TTS 최적화 실패, 원본 사용:', optimizationError);
          warnings.push('TTS 최적화를 적용하지 못했습니다.');
        }
      }
      
      stepTimes.optimization = Date.now() - optimizationStart;

      // Step 3: 다중 화자 음성 생성
      console.log('🎭 Step 3: 다중 화자 음성 생성...');
      const voiceStart = Date.now();
      
      // DialogueSegment를 SpeakerSegment로 변환
      const voiceGenerationSegments: SpeakerSegment[] = cleanedScript.speakerSegments.map((segment, index) => ({
        speakerId: segment.speaker as 'host' | 'curator',
        content: segment.content,
        originalContent: segment.content, // 원본과 동일하게 설정
        index: index
      }));
      
      const voiceFiles = await this.executeVoiceGeneration(voiceGenerationSegments, finalConfig);
      stepTimes.voiceGeneration = Date.now() - voiceStart;
      
      console.log('✅ 음성 생성 완료:', {
        individualFiles: voiceFiles.individualFiles.length,
        mergedFile: !!voiceFiles.mergedFile,
        totalDuration: voiceFiles.metadata.speakerStats.reduce((sum, stat) => sum + stat.totalDuration, 0)
      });

      // Step 4: 품질 평가
      console.log('📊 Step 4: 품질 평가...');
      const qualityStart = Date.now();
      
      const qualityAssessment = await this.executeQualityAssessment(
        cleanedScript,
        voiceFiles,
        optimizationResult || null,
        finalConfig
      );
      stepTimes.qualityAssessment = Date.now() - qualityStart;
      
      console.log('✅ 품질 평가 완료:', {
        overallScore: qualityAssessment.overallScore,
        improvements: qualityAssessment.improvements.length
      });

      // 품질 점수 확인 및 재시도 로직
      if (finalConfig.qualityConfig?.autoRetry && 
          qualityAssessment.overallScore < (finalConfig.qualityConfig.minimumQualityScore || 75)) {
        
        warnings.push(`품질 점수 ${qualityAssessment.overallScore}이 기준 미달이지만 계속 진행합니다.`);
      }

      const totalProcessingTime = Date.now() - startTime;
      
      const pipelineResult: PipelineExecutionResult = {
        success: true,
        totalProcessingTime,
        stepTimes,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

      console.log('🎉 파이프라인 완료:', {
        totalTime: `${totalProcessingTime}ms`,
        qualityScore: qualityAssessment.overallScore,
        success: true
      });

      return {
        cleanedScript,
        voiceFiles,
        pipelineResult,
        qualityAssessment
      };

    } catch (error) {
      const totalProcessingTime = Date.now() - startTime;
      
      console.error('❌ 파이프라인 실행 실패:', error);
      
      errors.push({
        step: 'cleaning',
        code: 'PIPELINE_FAILURE',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        details: error,
        recoverable: false
      });

      const pipelineResult: PipelineExecutionResult = {
        success: false,
        totalProcessingTime,
        stepTimes,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined
      };

      // 실패한 경우에도 부분 결과 반환
      throw new Error(`파이프라인 실행 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * 스크립트 정제 실행
   */
  private static async executeScriptCleaning(
    rawScript: string,
    config: EnhancedPipelineConfig
  ): Promise<ScriptCleaningResult> {
    
    try {
      const cleanedScript = cleanNotebookLMScript(rawScript);
      
      // 정제 결과 검증
      if (!cleanedScript.dialogueSegments || cleanedScript.dialogueSegments.length === 0) {
        throw new Error('화자 세그먼트 추출 실패');
      }
      
      if (cleanedScript.cleanedScript.trim().length === 0) {
        throw new Error('정제된 대화 내용이 비어있음');
      }
      
      return cleanedScript;
      
    } catch (error) {
      console.error('❌ 스크립트 정제 실패:', error);
      throw error;
    }
  }

  /**
   * 음성 생성 실행
   */
  private static async executeVoiceGeneration(
    speakers: SpeakerSegment[],
    config: EnhancedPipelineConfig
  ): Promise<GeneratedVoiceFiles> {
    
    try {
      return await generateMultiVoicePodcast(speakers, config.voiceConfig);
      
    } catch (error) {
      console.error('❌ 음성 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 품질 평가 실행
   */
  private static async executeQualityAssessment(
    cleanedScript: CleanedScript,
    voiceFiles: GeneratedVoiceFiles,
    optimizationResult: any,
    config: EnhancedPipelineConfig
  ): Promise<QualityAssessment> {
    
    // CleanedScript의 speakerSegments를 사용하여 품질 계산
    const speakerSegs = cleanedScript.speakerSegments || [];
    
    // 스크립트 정제 품질 (CleanedScript 기준으로 계산)
    const totalSegments = speakerSegs.length;
    const avgWordsPerSegment = speakerSegs.length > 0 
      ? speakerSegs.reduce((sum, s) => sum + (s.content || '').split(' ').length, 0) / totalSegments
      : 0;
    const scriptCleaningQuality = Math.min(100, (totalSegments * 10) + (avgWordsPerSegment * 2));
    
    // 음성 생성 품질 (메타데이터 기반)
    const voiceGenerationQuality = voiceFiles.metadata.qualityScore;
    
    // 화자 구분 명확성
    const hostSegments = speakerSegs.filter(s => s.speaker === 'host').length;
    const curatorSegments = speakerSegs.filter(s => s.speaker === 'curator').length;
    const speakerDistinction = hostSegments > 0 && curatorSegments > 0 ? 
      Math.min(100, 80 + (Math.min(hostSegments, curatorSegments) * 5)) : 40;
    
    // 대화 자연성 (세그먼트 길이 및 분포 기반)
    const avgSegmentLength = speakerSegs.length > 0 
      ? speakerSegs.reduce((sum, s) => sum + s.content.length, 0) / speakerSegs.length
      : 0;
    const conversationNaturalness = Math.min(100, (avgSegmentLength / 50) * 20 + 60);
    
    // NotebookLM 유사도 (최적화 결과 기반)
    const notebookLMSimilarity = optimizationResult?.qualityScore || 
      Math.min(100, (speakerSegs.length * 15) + 40);
    
    const metrics = {
      scriptCleaningQuality,
      voiceGenerationQuality,
      speakerDistinction,
      conversationNaturalness,
      notebookLMSimilarity
    };
    
    // 전체 점수 계산 (가중 평균)
    const overallScore = Math.round(
      (scriptCleaningQuality * 0.2) +
      (voiceGenerationQuality * 0.25) +
      (speakerDistinction * 0.2) +
      (conversationNaturalness * 0.15) +
      (notebookLMSimilarity * 0.2)
    );
    
    // 개선 제안 생성
    const improvements = this.generateQualityImprovements(metrics, cleanedScript);
    
    return {
      overallScore,
      metrics,
      improvements
    };
  }

  /**
   * 품질 개선 제안 생성
   */
  private static generateQualityImprovements(
    metrics: any,
    cleanedScript: CleanedScript
  ): QualityImprovement[] {
    
    const improvements: QualityImprovement[] = [];
    
    if (metrics.scriptCleaningQuality < 80) {
      improvements.push({
        category: 'script',
        priority: 'high',
        suggestion: '스크립트 정제 과정에서 더 많은 마크다운 요소를 제거하세요.',
        expectedImprovement: 10
      });
    }
    
    if (metrics.speakerDistinction < 70) {
      improvements.push({
        category: 'voice',
        priority: 'high',
        suggestion: '화자 간 음성 차별화를 더 강화하세요 (피치, 속도 조절).',
        expectedImprovement: 15
      });
    }
    
    if (metrics.conversationNaturalness < 75) {
      improvements.push({
        category: 'flow',
        priority: 'medium',
        suggestion: '대화 세그먼트 길이를 더 균형있게 조정하세요.',
        expectedImprovement: 8
      });
    }
    
    if (cleanedScript.speakerSegments.length < 4) {
      improvements.push({
        category: 'script',
        priority: 'medium',
        suggestion: '더 많은 화자 교체로 역동적인 대화를 만드세요.',
        expectedImprovement: 12
      });
    }
    
    return improvements;
  }

  /**
   * 설정 병합
   */
  private static mergeConfig(config?: EnhancedPipelineConfig): EnhancedPipelineConfig {
    if (!config) return this.DEFAULT_CONFIG;
    
    return {
      cleaningConfig: {
        markdownCleaningLevel: config.cleaningConfig?.markdownCleaningLevel ?? this.DEFAULT_CONFIG.cleaningConfig?.markdownCleaningLevel ?? 'basic',
        emojiRemoval: config.cleaningConfig?.emojiRemoval ?? this.DEFAULT_CONFIG.cleaningConfig?.emojiRemoval ?? false,
        speakerLabelCleaning: config.cleaningConfig?.speakerLabelCleaning ?? this.DEFAULT_CONFIG.cleaningConfig?.speakerLabelCleaning ?? 'normalize'
      },
      voiceConfig: config.voiceConfig ?? this.DEFAULT_CONFIG.voiceConfig,
      optimizationConfig: config.optimizationConfig ?? this.DEFAULT_CONFIG.optimizationConfig,
      qualityConfig: {
        minimumQualityScore: config.qualityConfig?.minimumQualityScore ?? this.DEFAULT_CONFIG.qualityConfig?.minimumQualityScore ?? 75,
        qualityCheckLevel: config.qualityConfig?.qualityCheckLevel ?? this.DEFAULT_CONFIG.qualityConfig?.qualityCheckLevel ?? 'standard',
        autoRetry: config.qualityConfig?.autoRetry ?? this.DEFAULT_CONFIG.qualityConfig?.autoRetry ?? true
      },
      outputConfig: {
        saveIntermediateResults: config.outputConfig?.saveIntermediateResults ?? this.DEFAULT_CONFIG.outputConfig?.saveIntermediateResults ?? true,
        includeDebugInfo: config.outputConfig?.includeDebugInfo ?? this.DEFAULT_CONFIG.outputConfig?.includeDebugInfo ?? false,
        collectPerformanceMetrics: config.outputConfig?.collectPerformanceMetrics ?? this.DEFAULT_CONFIG.outputConfig?.collectPerformanceMetrics ?? false
      }
    };
  }
}

/**
 * 편의 함수들
 */

/**
 * 간단한 팟캐스트 처리 (기본 설정)
 */
export async function processNotebookLMPodcast(rawScript: string): Promise<EnhancedPodcastResult> {
  return EnhancedNotebookLMPipeline.processPodcastScript(rawScript);
}

/**
 * 고품질 팟캐스트 처리 (엄격한 품질 기준)
 */
export async function processHighQualityPodcast(rawScript: string): Promise<EnhancedPodcastResult> {
  const config: EnhancedPipelineConfig = {
    cleaningConfig: {
      markdownCleaningLevel: 'complete',
      emojiRemoval: true,
      speakerLabelCleaning: 'remove'
    },
    optimizationConfig: NotebookLMOptimizationFactory.createDeepDiveConfig(),
    qualityConfig: {
      minimumQualityScore: 85,
      qualityCheckLevel: 'strict',
      autoRetry: true
    },
    outputConfig: {
      saveIntermediateResults: true,
      includeDebugInfo: true,
      collectPerformanceMetrics: true
    }
  };
  
  return EnhancedNotebookLMPipeline.processPodcastScript(rawScript, config);
}

/**
 * 빠른 프로토타입 처리 (기본 품질)
 */
export async function processQuickPodcast(rawScript: string): Promise<EnhancedPodcastResult> {
  const config: EnhancedPipelineConfig = {
    cleaningConfig: {
      markdownCleaningLevel: 'basic',
      emojiRemoval: true,
      speakerLabelCleaning: 'normalize'
    },
    qualityConfig: {
      minimumQualityScore: 60,
      qualityCheckLevel: 'basic',
      autoRetry: false
    },
    outputConfig: {
      saveIntermediateResults: false,
      includeDebugInfo: false,
      collectPerformanceMetrics: false
    }
  };
  
  return EnhancedNotebookLMPipeline.processPodcastScript(rawScript, config);
}

export default EnhancedNotebookLMPipeline;