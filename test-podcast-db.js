/**
 * 팟캐스트 시스템 실제 DB 저장 테스트
 * 한국민속촌으로 실제 팟캐스트를 생성하고 DB에 저장하는 테스트
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const API_BASE_URL = 'http://localhost:3025';

console.log('🧪 팟캐스트 DB 저장 테스트 시작...\n');
console.log('=' .repeat(60));

/**
 * 1. 팟캐스트 에피소드 생성 테스트
 */
async function testPodcastEpisodeCreation() {
  console.log('\n🎙️ 1. 팟캐스트 에피소드 생성 테스트');
  console.log('-'.repeat(40));
  
  const testEpisodeData = {
    locationName: '한국민속촌',
    language: 'ko',
    action: 'init'
  };
  
  try {
    console.log('📍 테스트 데이터:', JSON.stringify(testEpisodeData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/tts/notebooklm/generate-by-chapter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEpisodeData)
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ API 호출 성공');
    console.log('📋 응답:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      const episodeId = result.data?.episodeId;
      if (episodeId) {
        console.log(`🆔 생성된 에피소드 ID: ${episodeId}`);
        console.log(`📊 총 챕터 수: ${result.data.totalChapters}`);
        console.log(`🎯 선택된 페르소나: ${result.data.podcastStructure.selectedPersonas.join(', ')}`);
        return episodeId;
      } else {
        console.log('❌ 응답에 episodeId가 없음');
        return null;
      }
    } else {
      console.log('❌ 에피소드 생성 실패:', result.error || '알 수 없는 오류');
      return null;
    }
    
  } catch (error) {
    console.error('❌ 에피소드 생성 실패:', error.message);
    return null;
  }
}

/**
 * 2. DB에서 에피소드 확인
 */
async function checkEpisodeInDB(episodeId) {
  console.log('\n📊 2. DB 에피소드 확인');
  console.log('-'.repeat(40));
  
  if (!episodeId) {
    console.log('⏭️ 에피소드 ID가 없어 건너뜀');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('id', episodeId)
      .single();
    
    if (error) {
      console.error('❌ DB 조회 실패:', error.message);
      return false;
    }
    
    if (data) {
      console.log('✅ 에피소드 DB 저장 확인');
      console.log(`  - ID: ${data.id}`);
      console.log(`  - 제목: ${data.title}`);
      console.log(`  - 언어: ${data.language}`);
      console.log(`  - 위치: ${data.location_input}`);
      console.log(`  - 상태: ${data.status}`);
      console.log(`  - 생성일: ${data.created_at}`);
      
      return true;
    } else {
      console.log('❌ 에피소드가 DB에서 찾을 수 없음');
      return false;
    }
    
  } catch (error) {
    console.error('❌ DB 확인 실패:', error.message);
    return false;
  }
}

/**
 * 3. 세그먼트 생성 모니터링
 */
async function monitorSegmentGeneration(episodeId, maxWaitTime = 60000) {
  console.log('\n⏱️ 3. 세그먼트 생성 모니터링');
  console.log('-'.repeat(40));
  
  if (!episodeId) {
    console.log('⏭️ 에피소드 ID가 없어 건너뜀');
    return false;
  }
  
  const startTime = Date.now();
  let lastSegmentCount = 0;
  
  console.log(`🕐 최대 ${maxWaitTime/1000}초 동안 세그먼트 생성을 모니터링합니다...`);
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const { data, error } = await supabase
        .from('podcast_segments')
        .select('sequence_number, speaker_type, text_content, audio_url, duration_seconds')
        .eq('episode_id', episodeId)
        .order('sequence_number');
      
      if (error) {
        console.error('❌ 세그먼트 조회 실패:', error.message);
        break;
      }
      
      const currentCount = data ? data.length : 0;
      const completedCount = data ? data.filter(s => s.audio_url).length : 0;
      const textOnlyCount = data ? data.filter(s => s.text_content && !s.audio_url).length : 0;
      
      if (currentCount !== lastSegmentCount) {
        console.log(`📊 진행 상황: ${completedCount}개 오디오 완료, ${textOnlyCount}개 텍스트만, (총 ${currentCount}개)`);
        lastSegmentCount = currentCount;
        
        if (data && data.length > 0) {
          data.forEach((segment, index) => {
            const statusIcon = segment.audio_url ? '✅' : 
                              segment.text_content ? '📝' : '⏳';
            console.log(`  ${statusIcon} 세그먼트 ${segment.sequence_number}: ${segment.speaker_type}${segment.audio_url ? ' (오디오 완료)' : segment.text_content ? ' (텍스트만)' : ''}`);
          });
        }
      }
      
      // 모든 세그먼트가 완료된 경우
      if (completedCount > 0 && completedCount === currentCount) {
        console.log('🎉 모든 세그먼트 생성 완료!');
        return true;
      }
      
      // 텍스트만 있는 경우
      if (textOnlyCount > 0) {
        console.log(`📝 ${textOnlyCount}개 세그먼트가 텍스트까지 생성됨`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
      
    } catch (error) {
      console.error('❌ 모니터링 오류:', error.message);
      break;
    }
  }
  
  console.log('⏰ 모니터링 시간 종료');
  return false;
}

/**
 * 4. 최종 결과 검증
 */
async function verifyFinalResult(episodeId) {
  console.log('\n🔍 4. 최종 결과 검증');
  console.log('-'.repeat(40));
  
  if (!episodeId) {
    console.log('⏭️ 에피소드 ID가 없어 건너뜀');
    return { success: false, details: '에피소드 ID 없음' };
  }
  
  try {
    // 에피소드 정보
    const { data: episode, error: episodeError } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('id', episodeId)
      .single();
    
    if (episodeError) {
      throw new Error(`에피소드 조회 실패: ${episodeError.message}`);
    }
    
    // 세그먼트 정보
    const { data: segments, error: segmentsError } = await supabase
      .from('podcast_segments')
      .select('*')
      .eq('episode_id', episodeId)
      .order('sequence_number');
    
    if (segmentsError) {
      throw new Error(`세그먼트 조회 실패: ${segmentsError.message}`);
    }
    
    const results = {
      episode: {
        id: episode.id,
        title: episode.title,
        status: episode.status,
        language: episode.language,
        location: episode.location_input,
        hasScript: !!episode.tts_script,
        scriptLength: episode.tts_script ? episode.tts_script.length : 0
      },
      segments: {
        total: segments ? segments.length : 0,
        completed: segments ? segments.filter(s => s.audio_url).length : 0,
        textOnly: segments ? segments.filter(s => s.text_content && !s.audio_url).length : 0,
        withAudio: segments ? segments.filter(s => s.audio_url).length : 0
      }
    };
    
    console.log('📊 검증 결과:');
    console.log('🎙️ 에피소드:');
    console.log(`  - ID: ${results.episode.id}`);
    console.log(`  - 제목: ${results.episode.title}`);
    console.log(`  - 상태: ${results.episode.status}`);
    console.log(`  - 언어: ${results.episode.language}`);
    console.log(`  - 위치: ${results.episode.location}`);
    console.log(`  - 스크립트: ${results.episode.hasScript ? '✅' : '❌'} (${results.episode.scriptLength}자)`);
    
    console.log('🎵 세그먼트:');
    console.log(`  - 총 개수: ${results.segments.total}`);
    console.log(`  - 오디오 완료: ${results.segments.completed}`);
    console.log(`  - 텍스트만: ${results.segments.textOnly}`);
    console.log(`  - 오디오 있음: ${results.segments.withAudio}`);
    
    const success = results.episode.hasScript && results.segments.total > 0;
    
    if (success) {
      console.log('✅ 검증 성공: 팟캐스트가 정상적으로 생성되어 DB에 저장되었습니다.');
    } else {
      console.log('❌ 검증 실패: 일부 데이터가 누락되었습니다.');
    }
    
    return { success, details: results };
    
  } catch (error) {
    console.error('❌ 검증 실패:', error.message);
    return { success: false, details: error.message };
  }
}

/**
 * 5. 생성된 스크립트 샘플 확인
 */
async function checkGeneratedScript(episodeId) {
  console.log('\n📝 5. 생성된 스크립트 샘플 확인');
  console.log('-'.repeat(40));
  
  if (!episodeId) {
    console.log('⏭️ 에피소드 ID가 없어 건너뜀');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('tts_script, user_script')
      .eq('id', episodeId)
      .single();
    
    if (error) {
      console.error('❌ 스크립트 조회 실패:', error.message);
      return false;
    }
    
    if (data && data.tts_script) {
      console.log('✅ TTS 스크립트 생성됨');
      console.log(`📏 길이: ${data.tts_script.length}자`);
      
      // 처음 500자 샘플 출력
      const sample = data.tts_script.substring(0, 500);
      console.log('📄 스크립트 샘플:');
      console.log('─'.repeat(50));
      console.log(sample + (data.tts_script.length > 500 ? '...' : ''));
      console.log('─'.repeat(50));
      
      // 화자 레이블 확인
      const hasLabels = sample.includes('male:') || sample.includes('female:') || 
                       sample.includes('Host:') || sample.includes('Curator:');
      console.log(`🏷️ 화자 레이블: ${hasLabels ? '✅' : '❌'}`);
      
      // 대화형 구조 확인
      const isDialogue = sample.split('\n').length > 3;
      console.log(`💬 대화형 구조: ${isDialogue ? '✅' : '❌'}`);
      
      return true;
    } else {
      console.log('❌ TTS 스크립트가 생성되지 않음');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 스크립트 확인 실패:', error.message);
    return false;
  }
}

/**
 * 메인 테스트 실행
 */
async function runCompleteTest() {
  console.log('\n🚀 완전한 DB 저장 테스트 실행');
  console.log('='.repeat(60));
  
  const results = {
    creation: false,
    dbStorage: false,
    monitoring: false,
    verification: null,
    scriptGeneration: false
  };
  
  let episodeId = null;
  
  try {
    // 1. 에피소드 생성
    episodeId = await testPodcastEpisodeCreation();
    results.creation = !!episodeId;
    
    if (episodeId) {
      // 2. DB 저장 확인
      results.dbStorage = await checkEpisodeInDB(episodeId);
      
      // 3. 세그먼트 모니터링
      results.monitoring = await monitorSegmentGeneration(episodeId, 30000); // 30초
      
      // 4. 최종 검증
      results.verification = await verifyFinalResult(episodeId);
      
      // 5. 스크립트 확인
      results.scriptGeneration = await checkGeneratedScript(episodeId);
    }
    
    // 최종 결과 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 최종 테스트 결과');
    console.log('='.repeat(60));
    
    console.log('\n테스트 항목별 결과:');
    console.log(`  1. 에피소드 생성: ${results.creation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  2. DB 저장: ${results.dbStorage ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  3. 세그먼트 모니터링: ${results.monitoring ? '✅ PASS' : '⚠️ PARTIAL'}`);
    console.log(`  4. 최종 검증: ${results.verification?.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  5. 스크립트 생성: ${results.scriptGeneration ? '✅ PASS' : '❌ FAIL'}`);
    
    const passedTests = Object.values(results).filter(r => r === true || (r && r.success)).length;
    const totalTests = 5;
    
    console.log('\n' + '='.repeat(60));
    if (passedTests >= 4) {
      console.log('🎉 테스트 성공! 팟캐스트 시스템이 정상적으로 DB에 저장되고 있습니다.');
      console.log(`📊 ${totalTests}개 중 ${passedTests}개 테스트 통과`);
    } else if (passedTests >= 2) {
      console.log('⚠️ 부분 성공. 기본 기능은 작동하지만 일부 개선이 필요합니다.');
      console.log(`📊 ${totalTests}개 중 ${passedTests}개 테스트 통과`);
    } else {
      console.log('❌ 테스트 실패. 시스템에 문제가 있습니다.');
      console.log(`📊 ${totalTests}개 중 ${passedTests}개 테스트 통과`);
    }
    
    if (episodeId) {
      console.log(`\n🆔 테스트 에피소드 ID: ${episodeId}`);
      console.log('🗑️ 필요시 수동으로 삭제하거나 테스트 데이터로 보관하세요.');
    }
    
    console.log('='.repeat(60));
    
    return results;
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    return results;
  }
}

// 테스트 실행
if (require.main === module) {
  runCompleteTest().catch(error => {
    console.error('❌ 테스트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = { runCompleteTest };