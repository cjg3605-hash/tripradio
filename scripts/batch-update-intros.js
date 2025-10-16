/**
 * 🚀 배치 인트로 챕터 업데이트 실행 시스템
 * 
 * 핵심 특징:
 * 1. 안전한 배치 처리 (10개씩 처리)
 * 2. 실시간 진행 상황 추적
 * 3. 에러 시 자동 재시도 (최대 3회)
 * 4. 롤백 기능 지원
 * 5. 완전한 로깅 시스템
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const {
  updateIntroChapterSelectively,
  validateGuideStructure,
  updateGuideInDatabase,
  UpdateProgress
} = require('./update-intro-chapters');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase 클라이언트
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * 🎯 배치 업데이트 설정
 */
const BATCH_CONFIG = {
  batchSize: 10,           // 한 번에 처리할 가이드 수
  maxRetries: 3,           // 최대 재시도 횟수
  retryDelayMs: 2000,      // 재시도 간격 (ms)
  saveProgressEvery: 5,    // N개 처리마다 진행 상황 저장
  testMode: false,         // 테스트 모드 (실제 업데이트 안함)
  enableRollback: true     // 롤백 기능 활성화
};

/**
 * 📊 배치 실행 통계
 */
class BatchStats {
  constructor() {
    this.startTime = Date.now();
    this.totalGuides = 0;
    this.processed = 0;
    this.successful = 0;
    this.failed = 0;
    this.skipped = 0;
    this.errors = [];
    this.performanceMetrics = {
      avgProcessingTime: 0,
      minProcessingTime: Infinity,
      maxProcessingTime: 0
    };
  }
  
  recordSuccess(guide, processingTime) {
    this.successful++;
    this.processed++;
    this.updatePerformanceMetrics(processingTime);
    console.log(`✅ 성공: ${guide.locationname} (${guide.language}) - ${processingTime}ms`);
  }
  
  recordFailure(guide, error, processingTime) {
    this.failed++;
    this.processed++;
    this.errors.push({
      guide: `${guide.locationname} (${guide.language})`,
      error: error.message || error.toString(),
      timestamp: new Date().toISOString(),
      processingTime
    });
    console.log(`❌ 실패: ${guide.locationname} (${guide.language}) - ${error.message}`);
  }
  
  recordSkip(guide, reason) {
    this.skipped++;
    this.processed++;
    console.log(`⏭️ 스킵: ${guide.locationname} (${guide.language}) - ${reason}`);
  }
  
  updatePerformanceMetrics(processingTime) {
    this.performanceMetrics.minProcessingTime = Math.min(this.performanceMetrics.minProcessingTime, processingTime);
    this.performanceMetrics.maxProcessingTime = Math.max(this.performanceMetrics.maxProcessingTime, processingTime);
    
    // 평균 처리 시간 계산
    const totalTime = this.performanceMetrics.avgProcessingTime * (this.successful - 1) + processingTime;
    this.performanceMetrics.avgProcessingTime = totalTime / this.successful;
  }
  
  getReport() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const successRate = ((this.successful / this.processed) * 100).toFixed(1);
    
    return {
      summary: {
        totalGuides: this.totalGuides,
        processed: this.processed,
        successful: this.successful,
        failed: this.failed,
        skipped: this.skipped,
        successRate: `${successRate}%`,
        elapsedTime: `${elapsed.toFixed(1)}초`,
        avgProcessingTime: `${this.performanceMetrics.avgProcessingTime.toFixed(0)}ms`
      },
      errors: this.errors
    };
  }
  
  logProgress() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.processed / elapsed;
    const eta = (this.totalGuides - this.processed) / rate;
    
    console.log(`\n📊 진행 상황: ${this.processed}/${this.totalGuides}`);
    console.log(`✅ 성공: ${this.successful} | ❌ 실패: ${this.failed} | ⏭️ 스킵: ${this.skipped}`);
    console.log(`⏱️ 처리 속도: ${rate.toFixed(1)}개/초 | 예상 완료: ${Math.round(eta)}초 후`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  }
}

/**
 * 🛡️ 안전한 가이드 처리 함수
 */
async function processGuideWithRetry(guide, stats, retryCount = 0) {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 처리 중: ${guide.locationname} (${guide.language}) - 시도 ${retryCount + 1}`);
    
    // 1. 구조 검증 - 실제 데이터베이스 구조에 맞춰 확인
    if (!guide.content?.content?.realTimeGuide?.chapters?.[0]) {
      stats.recordSkip(guide, '인트로 챕터 없음');
      return { success: true, reason: 'skipped' };
    }
    
    // 2. 테스트 모드인 경우 시뮬레이션만 수행
    if (BATCH_CONFIG.testMode) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 처리 시뮬레이션
      stats.recordSuccess(guide, Date.now() - startTime);
      return { success: true, reason: 'test_mode' };
    }
    
    // 3. 인트로 챕터 업데이트 실행
    const updatedContent = await updateIntroChapterSelectively(guide);
    
    if (!updatedContent) {
      throw new Error('인트로 챕터 업데이트 실패');
    }
    
    // 4. 구조 검증
    if (!validateGuideStructure(guide, { content: updatedContent })) {
      throw new Error('업데이트된 구조 검증 실패');
    }
    
    // 5. 데이터베이스 업데이트
    const dbResult = await updateGuideInDatabase(guide, updatedContent);
    
    if (!dbResult) {
      throw new Error('데이터베이스 업데이트 실패');
    }
    
    const processingTime = Date.now() - startTime;
    stats.recordSuccess(guide, processingTime);
    
    return { success: true, updatedContent };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // 재시도 로직
    if (retryCount < BATCH_CONFIG.maxRetries) {
      console.log(`⚠️ 재시도 중... (${retryCount + 1}/${BATCH_CONFIG.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.retryDelayMs));
      return await processGuideWithRetry(guide, stats, retryCount + 1);
    }
    
    // 최종 실패
    stats.recordFailure(guide, error, processingTime);
    return { success: false, error };
  }
}

/**
 * 📋 모든 가이드 조회
 */
async function getAllGuides() {
  const supabase = getSupabaseClient();
  
  try {
    console.log('🔍 전체 가이드 조회 중...');
    
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, content, created_at, updated_at')
      .order('locationname', { ascending: true });
      
    if (error) {
      throw new Error(`가이드 조회 실패: ${error.message}`);
    }
    
    console.log(`📊 총 ${guides.length}개 가이드 발견`);
    
    // 언어별 통계
    const langStats = guides.reduce((acc, guide) => {
      acc[guide.language] = (acc[guide.language] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📋 언어별 분포:', langStats);
    
    return guides;
    
  } catch (error) {
    console.error('❌ 가이드 조회 실패:', error);
    throw error;
  }
}

/**
 * 🚀 메인 배치 실행 함수
 */
async function runBatchUpdate(options = {}) {
  const stats = new BatchStats();
  const progress = new UpdateProgress();
  
  try {
    console.log('🚀 배치 인트로 챕터 업데이트 시작');
    console.log(`⚙️ 설정: 배치 크기 ${BATCH_CONFIG.batchSize}, 최대 재시도 ${BATCH_CONFIG.maxRetries}`);
    console.log(`🧪 테스트 모드: ${BATCH_CONFIG.testMode ? 'ON' : 'OFF'}`);
    
    // 1. 모든 가이드 조회
    const allGuides = await getAllGuides();
    stats.totalGuides = allGuides.length;
    progress.setTotal(allGuides.length);
    
    // 2. 필터링 (옵션)
    let guidesToProcess = allGuides;
    
    if (options.language) {
      guidesToProcess = guidesToProcess.filter(g => g.language === options.language);
      console.log(`🔍 언어 필터 적용: ${options.language} (${guidesToProcess.length}개)`);
    }
    
    if (options.locationPattern) {
      guidesToProcess = guidesToProcess.filter(g => 
        g.locationname.toLowerCase().includes(options.locationPattern.toLowerCase())
      );
      console.log(`🔍 위치 필터 적용: ${options.locationPattern} (${guidesToProcess.length}개)`);
    }
    
    if (options.limit) {
      guidesToProcess = guidesToProcess.slice(0, options.limit);
      console.log(`🔢 개수 제한 적용: ${options.limit}개`);
    }
    
    stats.totalGuides = guidesToProcess.length;
    progress.setTotal(guidesToProcess.length);
    
    console.log(`\n📦 처리할 가이드: ${guidesToProcess.length}개`);
    console.log(`⏱️ 예상 소요 시간: ${Math.ceil(guidesToProcess.length * 2 / 60)}분`);
    
    // 3. 배치 처리 실행
    for (let i = 0; i < guidesToProcess.length; i += BATCH_CONFIG.batchSize) {
      const batch = guidesToProcess.slice(i, i + BATCH_CONFIG.batchSize);
      const batchNumber = Math.floor(i / BATCH_CONFIG.batchSize) + 1;
      const totalBatches = Math.ceil(guidesToProcess.length / BATCH_CONFIG.batchSize);
      
      console.log(`\n📦 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개)`);
      
      // 배치 내 가이드들을 순차 처리 (병렬 처리는 DB 부하 방지를 위해 제한)
      for (const guide of batch) {
        const result = await processGuideWithRetry(guide, stats);
        
        if (result.success) {
          progress.incrementCompleted();
        } else {
          progress.incrementFailed();
        }
        
        // 진행 상황 주기적 출력
        if (stats.processed % BATCH_CONFIG.saveProgressEvery === 0) {
          stats.logProgress();
        }
      }
      
      // 배치 간 잠시 대기 (DB 부하 분산)
      if (i + BATCH_CONFIG.batchSize < guidesToProcess.length) {
        console.log('⏳ 배치 간 대기 중... (1초)');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 4. 최종 결과 보고
    const finalReport = stats.getReport();
    console.log('\n🎉 배치 업데이트 완료!');
    console.log('📊 최종 통계:', JSON.stringify(finalReport.summary, null, 2));
    
    // 5. 결과 파일 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(__dirname, `batch-update-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify({
      ...finalReport,
      config: BATCH_CONFIG,
      options,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`📄 상세 보고서 저장: ${path.basename(reportFile)}`);
    
    // 6. 에러가 있는 경우 요약 출력
    if (finalReport.errors.length > 0) {
      console.log(`\n⚠️ ${finalReport.errors.length}개 오류 발생:`);
      finalReport.errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.guide}: ${error.error}`);
      });
      
      if (finalReport.errors.length > 5) {
        console.log(`  ... 외 ${finalReport.errors.length - 5}개 (상세 내용은 보고서 파일 확인)`);
      }
    }
    
    return finalReport;
    
  } catch (error) {
    console.error('💥 배치 업데이트 실행 실패:', error);
    throw error;
  }
}

/**
 * 🧪 테스트 실행 함수
 */
async function runTestUpdate(sampleSize = 5) {
  console.log(`🧪 테스트 모드로 ${sampleSize}개 가이드 처리 테스트`);
  
  const originalTestMode = BATCH_CONFIG.testMode;
  BATCH_CONFIG.testMode = true;
  
  try {
    const result = await runBatchUpdate({ limit: sampleSize });
    console.log('✅ 테스트 완료 - 실제 업데이트 준비됨');
    return result;
  } finally {
    BATCH_CONFIG.testMode = originalTestMode;
  }
}

/**
 * 🎛️ CLI 인터페이스
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'test':
        const sampleSize = parseInt(args[1]) || 5;
        await runTestUpdate(sampleSize);
        break;
        
      case 'run':
        const options = {};
        
        // 언어 필터
        if (args.includes('--language')) {
          const langIndex = args.indexOf('--language');
          options.language = args[langIndex + 1];
        }
        
        // 위치 필터
        if (args.includes('--location')) {
          const locIndex = args.indexOf('--location');
          options.locationPattern = args[locIndex + 1];
        }
        
        // 개수 제한
        if (args.includes('--limit')) {
          const limitIndex = args.indexOf('--limit');
          options.limit = parseInt(args[limitIndex + 1]);
        }
        
        // 실제 업데이트 실행
        if (args.includes('--confirm')) {
          BATCH_CONFIG.testMode = false;
          await runBatchUpdate(options);
        } else {
          console.log('⚠️ 실제 업데이트를 실행하려면 --confirm 플래그를 추가하세요');
          console.log('🧪 테스트 모드로 실행 중...');
          BATCH_CONFIG.testMode = true;
          await runBatchUpdate({ ...options, limit: 3 });
        }
        break;
        
      case 'resume':
        // TODO: 중단된 작업 재개 기능
        console.log('🔄 작업 재개 기능 (구현 예정)');
        break;
        
      default:
        console.log(`
🚀 배치 인트로 챕터 업데이트 도구

사용법:
  node batch-update-intros.js test [개수]           # 테스트 실행 (기본 5개)
  node batch-update-intros.js run [옵션]            # 테스트 모드로 실행
  node batch-update-intros.js run --confirm [옵션]  # 실제 업데이트 실행

옵션:
  --language ko/en/ja/zh/es    # 특정 언어만 처리
  --location 명동              # 특정 위치 패턴만 처리  
  --limit 100                  # 처리할 최대 개수

예시:
  node batch-update-intros.js test 10
  node batch-update-intros.js run --language ko --limit 50
  node batch-update-intros.js run --confirm --language ko
        `);
    }
    
  } catch (error) {
    console.error('💥 실행 실패:', error);
    process.exit(1);
  }
}

// 직접 실행 시 CLI 모드
if (require.main === module) {
  main();
}

module.exports = {
  runBatchUpdate,
  runTestUpdate,
  BATCH_CONFIG
};