#!/usr/bin/env node
// scripts/check-indexing-status.js
// 색인 요청 상태 확인 및 잘못된 URL 정리 도구

const { Pool } = require('pg');

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * 최근 색인 요청 상태 조회
 */
async function checkRecentIndexingStatus(days = 7) {
  console.log(`📊 최근 ${days}일간 색인 요청 상태 조회\n`);
  
  try {
    // 전체 통계
    const overallStats = await pool.query(`
      SELECT 
        search_engine,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'success') as successful_requests,
        COUNT(*) FILTER (WHERE status = 'error') as failed_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'success')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          2
        ) as success_rate_percent
      FROM indexing_requests 
      WHERE requested_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY search_engine
      ORDER BY search_engine;
    `);

    console.log('📈 전체 통계:');
    if (overallStats.rows.length > 0) {
      overallStats.rows.forEach(row => {
        console.log(`   ${row.search_engine.toUpperCase()}:`);
        console.log(`     총 요청: ${row.total_requests}개`);
        console.log(`     성공: ${row.successful_requests}개`);
        console.log(`     실패: ${row.failed_requests}개`);
        console.log(`     대기: ${row.pending_requests}개`);
        console.log(`     성공률: ${row.success_rate_percent}%\n`);
      });
    } else {
      console.log('   최근 색인 요청이 없습니다.\n');
    }

    // 일별 통계
    const dailyStats = await pool.query(`
      SELECT 
        DATE(requested_at) as request_date,
        search_engine,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'success') as successful_requests,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'success')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          2
        ) as success_rate_percent
      FROM indexing_requests
      WHERE requested_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(requested_at), search_engine
      ORDER BY request_date DESC, search_engine;
    `);

    console.log('📅 일별 통계:');
    if (dailyStats.rows.length > 0) {
      dailyStats.rows.forEach(row => {
        console.log(`   ${row.request_date}: ${row.search_engine.toUpperCase()} - ${row.total_requests}건 (성공률: ${row.success_rate_percent}%)`);
      });
      console.log('');
    }

    return {
      overall: overallStats.rows,
      daily: dailyStats.rows
    };

  } catch (error) {
    console.error('❌ 상태 조회 실패:', error.message);
    return null;
  }
}

/**
 * 실패한 색인 요청 분석
 */
async function analyzeFailedRequests() {
  console.log('🔍 실패한 색인 요청 분석\n');
  
  try {
    // 실패 원인별 통계
    const failureStats = await pool.query(`
      SELECT 
        CASE 
          WHEN error_message LIKE '%Quota exceeded%' THEN 'Quota Exceeded'
          WHEN error_message LIKE '%not found%' THEN 'URL Not Found'
          WHEN error_message LIKE '%Invalid URL%' THEN 'Invalid URL'
          WHEN error_message LIKE '%Permission denied%' THEN 'Permission Denied'
          ELSE 'Other'
        END as error_type,
        COUNT(*) as count,
        ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM indexing_requests WHERE status = 'error') * 100, 2) as percentage
      FROM indexing_requests 
      WHERE status = 'error'
        AND requested_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY error_type
      ORDER BY count DESC;
    `);

    console.log('📊 실패 원인별 통계:');
    if (failureStats.rows.length > 0) {
      failureStats.rows.forEach(row => {
        console.log(`   ${row.error_type}: ${row.count}건 (${row.percentage}%)`);
      });
      console.log('');
    }

    // 최근 실패한 URL들
    const recentFailures = await pool.query(`
      SELECT 
        url,
        location_name,
        language,
        error_message,
        requested_at,
        retry_count
      FROM indexing_requests 
      WHERE status = 'error'
        AND requested_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY requested_at DESC
      LIMIT 20;
    `);

    console.log('🚨 최근 실패한 URL (최대 20개):');
    if (recentFailures.rows.length > 0) {
      recentFailures.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.location_name} (${row.language})`);
        console.log(`      URL: ${row.url}`);
        console.log(`      오류: ${row.error_message?.substring(0, 100)}...`);
        console.log(`      시도 횟수: ${row.retry_count}`);
        console.log(`      요청 시간: ${row.requested_at}\n`);
      });
    } else {
      console.log('   최근 실패한 요청이 없습니다.\n');
    }

    return {
      failures: failureStats.rows,
      recentFailures: recentFailures.rows
    };

  } catch (error) {
    console.error('❌ 실패 분석 실패:', error.message);
    return null;
  }
}

/**
 * 잘못된 URL 패턴 식별
 */
async function identifyBadUrls() {
  console.log('🔍 잘못된 URL 패턴 식별\n');
  
  try {
    // 의심스러운 URL 패턴들
    const suspiciousUrls = await pool.query(`
      SELECT 
        url,
        location_name,
        language,
        status,
        error_message,
        COUNT(*) as occurrence_count
      FROM indexing_requests 
      WHERE 
        (url LIKE '%localhost%' OR 
         url LIKE '%undefined%' OR 
         url LIKE '%null%' OR 
         url NOT LIKE 'https://%' OR
         LENGTH(url) > 500 OR
         url LIKE '%///%' OR
         url LIKE '%?%&%&%')
        AND requested_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY url, location_name, language, status, error_message
      ORDER BY occurrence_count DESC, url;
    `);

    console.log('⚠️ 의심스러운 URL 패턴:');
    if (suspiciousUrls.rows.length > 0) {
      suspiciousUrls.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.location_name} (${row.language}) - ${row.occurrence_count}회`);
        console.log(`      URL: ${row.url}`);
        console.log(`      상태: ${row.status}`);
        if (row.error_message) {
          console.log(`      오류: ${row.error_message.substring(0, 100)}...`);
        }
        console.log('');
      });
    } else {
      console.log('   의심스러운 URL이 발견되지 않았습니다.\n');
    }

    // 중복 URL 확인
    const duplicateUrls = await pool.query(`
      SELECT 
        url,
        COUNT(*) as duplicate_count,
        string_agg(DISTINCT location_name, ', ') as locations,
        string_agg(DISTINCT language, ', ') as languages
      FROM indexing_requests 
      WHERE requested_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY url
      HAVING COUNT(*) > 5
      ORDER BY duplicate_count DESC
      LIMIT 10;
    `);

    console.log('🔄 중복이 많은 URL (5회 이상):');
    if (duplicateUrls.rows.length > 0) {
      duplicateUrls.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.duplicate_count}회 중복`);
        console.log(`      URL: ${row.url}`);
        console.log(`      위치: ${row.locations}`);
        console.log(`      언어: ${row.languages}\n`);
      });
    } else {
      console.log('   과도한 중복 URL이 없습니다.\n');
    }

    return {
      suspicious: suspiciousUrls.rows,
      duplicates: duplicateUrls.rows
    };

  } catch (error) {
    console.error('❌ 잘못된 URL 식별 실패:', error.message);
    return null;
  }
}

/**
 * 잘못된 URL 정리
 */
async function cleanupBadUrls(dryRun = true) {
  console.log(`🧹 잘못된 URL 정리 ${dryRun ? '(테스트 모드)' : '(실제 삭제)'}\n`);
  
  try {
    // 삭제할 URL 패턴 정의
    const deleteQuery = `
      SELECT id, url, location_name, language, status 
      FROM indexing_requests 
      WHERE 
        url LIKE '%localhost%' OR 
        url LIKE '%undefined%' OR 
        url LIKE '%null%' OR 
        url NOT LIKE 'https://%' OR
        LENGTH(url) > 500 OR
        url LIKE '%///%'
      ORDER BY requested_at DESC;
    `;

    const badUrls = await pool.query(deleteQuery);

    console.log(`📋 삭제 대상 URL: ${badUrls.rows.length}개`);
    
    if (badUrls.rows.length > 0) {
      badUrls.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ID ${row.id}: ${row.location_name} (${row.language})`);
        console.log(`      URL: ${row.url}`);
        console.log(`      상태: ${row.status}\n`);
      });

      if (!dryRun) {
        // 실제 삭제 실행
        const deleteResult = await pool.query(`
          DELETE FROM indexing_requests 
          WHERE 
            url LIKE '%localhost%' OR 
            url LIKE '%undefined%' OR 
            url LIKE '%null%' OR 
            url NOT LIKE 'https://%' OR
            LENGTH(url) > 500 OR
            url LIKE '%///%';
        `);

        console.log(`✅ ${deleteResult.rowCount}개 URL 삭제 완료`);
      } else {
        console.log('🧪 테스트 모드: 실제 삭제되지 않았습니다.');
        console.log('   실제 삭제하려면: node scripts/check-indexing-status.js cleanup-execute');
      }
    } else {
      console.log('✅ 삭제할 잘못된 URL이 없습니다.');
    }

    return badUrls.rows.length;

  } catch (error) {
    console.error('❌ URL 정리 실패:', error.message);
    return null;
  }
}

/**
 * Google Search Console에서 실제 색인 상태 확인 (API 호출)
 */
async function checkActualIndexingStatus(sampleUrls = []) {
  console.log('🔍 Google Search Console 실제 색인 상태 확인\n');
  
  // 샘플 URL이 없으면 데이터베이스에서 최근 성공한 URL들 가져오기
  if (sampleUrls.length === 0) {
    try {
      const recentSuccess = await pool.query(`
        SELECT DISTINCT url 
        FROM indexing_requests 
        WHERE status = 'success' 
          AND requested_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY requested_at DESC 
        LIMIT 10;
      `);
      
      sampleUrls = recentSuccess.rows.map(row => row.url);
    } catch (error) {
      console.log('⚠️ 샘플 URL 조회 실패:', error.message);
      return null;
    }
  }

  if (sampleUrls.length === 0) {
    console.log('⚠️ 확인할 URL이 없습니다.');
    return null;
  }

  console.log(`📋 확인할 URL: ${sampleUrls.length}개`);
  
  // Google Search Console API를 통한 실제 색인 상태 확인
  // 여기서는 실제 API 호출 대신 구조만 제공
  console.log('💡 실제 색인 상태 확인을 위해서는 Google Search Console API 연동이 필요합니다.');
  console.log('   현재는 데이터베이스의 요청 상태만 확인 가능합니다.');
  
  return sampleUrls;
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  console.log('🔍 색인 상태 확인 및 URL 정리 도구\n');
  
  try {
    switch (command) {
      case 'status':
        await checkRecentIndexingStatus();
        break;
        
      case 'analyze-failures':
        await analyzeFailedRequests();
        break;
        
      case 'identify-bad-urls':
        await identifyBadUrls();
        break;
        
      case 'cleanup-dry-run':
        await cleanupBadUrls(true);
        break;
        
      case 'cleanup-execute':
        console.log('⚠️ 실제 삭제를 진행합니다. 계속하시겠습니까? (y/N)');
        // 실제 구현에서는 사용자 입력 받기
        await cleanupBadUrls(false);
        break;
        
      case 'check-actual':
        await checkActualIndexingStatus();
        break;
        
      case 'full-report':
        console.log('📊 전체 색인 상태 보고서 생성\n');
        await checkRecentIndexingStatus();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        await analyzeFailedRequests();
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        await identifyBadUrls();
        break;
        
      case 'help':
      default:
        console.log('📖 사용법:');
        console.log('   node scripts/check-indexing-status.js <command>');
        console.log('');
        console.log('📋 명령어:');
        console.log('   status              - 최근 색인 요청 상태 조회');
        console.log('   analyze-failures    - 실패한 색인 요청 분석');
        console.log('   identify-bad-urls   - 잘못된 URL 패턴 식별');
        console.log('   cleanup-dry-run     - 잘못된 URL 정리 (테스트)');
        console.log('   cleanup-execute     - 잘못된 URL 정리 (실제 삭제)');
        console.log('   check-actual        - Google Search Console 실제 상태 확인');
        console.log('   full-report         - 전체 보고서 생성');
        console.log('   help                - 도움말');
        console.log('');
        console.log('💡 권장 순서:');
        console.log('   1. node scripts/check-indexing-status.js full-report');
        console.log('   2. node scripts/check-indexing-status.js cleanup-dry-run');
        console.log('   3. node scripts/check-indexing-status.js cleanup-execute (필요시)');
        break;
    }
    
  } catch (error) {
    console.error('❌ 실행 실패:', error.message);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = {
  checkRecentIndexingStatus,
  analyzeFailedRequests,
  identifyBadUrls,
  cleanupBadUrls,
  checkActualIndexingStatus
};