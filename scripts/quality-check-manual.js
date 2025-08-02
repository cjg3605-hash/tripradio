#!/usr/bin/env ts-node
"use strict";
// 🎯 수동 가이드 품질 검사 도구
// 필요할 때마다 실행하여 DB의 가이드 품질을 확인하고 문제가 있는 데이터 추려내기
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGuideQuality = checkGuideQuality;
exports.inspectSpecificGuide = inspectSpecificGuide;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
// .env.local 파일 로드
(0, dotenv_1.config)({ path: (0, path_1.resolve)(process.cwd(), '.env.local') });
const supabase_js_1 = require("@supabase/supabase-js");
const generative_ai_1 = require("@google/generative-ai");

// Node.js 18+ fetch 지원 확인
const fetch = globalThis.fetch || require('node-fetch');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
// 간단한 품질 체크 함수 (실제 DB 구조에 맞게 수정)
function calculateSimpleQualityScore(guide) {
    let score = 100;
    const issues = [];
    
    // DB content 구조에 따른 검사
    if (guide.content) {
        // guides 테이블의 realTimeGuide 구조 확인 (우선)
        if (guide.content.realTimeGuide) {
            // 실제 guides 테이블 구조 (현재 사용중)
            const rtGuide = guide.content.realTimeGuide;
            if (!rtGuide.chapters || !Array.isArray(rtGuide.chapters)) score -= 25;
            if (rtGuide.chapters && rtGuide.chapters.length < 3) score -= 15;
            
            rtGuide.chapters?.forEach((chapter, index) => {
                if (!chapter.title) score -= 5;
                if (!chapter.narrative || chapter.narrative.length < 100) score -= 5;
                
                // 인트로 챕터 (첫 번째 챕터) 특별 검사
                if (index === 0) {
                    // 인트로 챕터 길이 검사 (1200-1500자 기준)
                    if (!chapter.narrative) {
                        score -= 25; // 인트로 없으면 큰 감점
                    } else {
                        const length = chapter.narrative.length;
                        if (length < 1200) {
                            score -= 15; // 1200자 미만 큰 감점
                        } else if (length > 1500) {
                            score -= 5; // 1500자 초과 소감점 (너무 길어도 문제)
                        }
                    }
                    
                    // 인트로 챕터 인사말 검사
                    if (chapter.narrative) {
                        const greetingPatterns = [
                            /안녕하세요/,
                            /여러분/,
                            /환영합니다/,
                            /반갑습니다/,
                            /함께.*하겠습니다/,
                            /.*함께.*여행/,
                            /.*가이드.*시작/,
                            /.*소개.*드리겠습니다/
                        ];
                        
                        const hasGreeting = greetingPatterns.some(pattern => 
                            pattern.test(chapter.narrative)
                        );
                        
                        if (!hasGreeting) {
                            score -= 10; // 인사말이 없으면 감점
                        }
                    }
                }
            });
            
            // overview 체크
            if (!rtGuide.overview || rtGuide.overview.length < 100) score -= 15;
            
        } else if (guide.content.content && guide.content.content.realTimeGuide) {
            // 중첩된 구조인 경우
            const rtGuide = guide.content.content.realTimeGuide;
            if (!rtGuide.chapters || !Array.isArray(rtGuide.chapters)) score -= 25;
            if (rtGuide.chapters && rtGuide.chapters.length < 3) score -= 15;
            
            rtGuide.chapters?.forEach((chapter, index) => {
                if (!chapter.title) score -= 5;
                if (!chapter.narrative || chapter.narrative.length < 100) score -= 5;
                
                // 인트로 챕터 (첫 번째 챕터) 특별 검사
                if (index === 0) {
                    // 인트로 챕터 길이 검사 (1200-1500자 기준)
                    if (!chapter.narrative) {
                        score -= 25; // 인트로 없으면 큰 감점
                    } else {
                        const length = chapter.narrative.length;
                        if (length < 1200) {
                            score -= 15; // 1200자 미만 큰 감점
                        } else if (length > 1500) {
                            score -= 5; // 1500자 초과 소감점 (너무 길어도 문제)
                        }
                    }
                    
                    // 인트로 챕터 인사말 검사
                    if (chapter.narrative) {
                        const greetingPatterns = [
                            /안녕하세요/,
                            /여러분/,
                            /환영합니다/,
                            /반갑습니다/,
                            /함께.*하겠습니다/,
                            /.*함께.*여행/,
                            /.*가이드.*시작/,
                            /.*소개.*드리겠습니다/
                        ];
                        
                        const hasGreeting = greetingPatterns.some(pattern => 
                            pattern.test(chapter.narrative)
                        );
                        
                        if (!hasGreeting) {
                            score -= 10; // 인사말이 없으면 감점
                        }
                    }
                }
            });
        } else if (guide.content.raw) {
            // guide_versions 테이블의 레거시 원시 JSON 문자열인 경우
            try {
                const jsonContent = JSON.parse(guide.content.content.replace(/```json\n/, '').replace(/\n```$/, ''));
                if (!jsonContent.location) score -= 20;
                if (!jsonContent.overview || jsonContent.overview.length < 100) score -= 15;
                if (!jsonContent.highlights || !Array.isArray(jsonContent.highlights) || jsonContent.highlights.length < 3) score -= 25;
            } catch (e) {
                score -= 50; // JSON 파싱 실패
            }
        } else {
            score -= 30; // 알 수 없는 구조
        }
    } else {
        score -= 50; // 콘텐츠 없음
    }
    
    return Math.max(0, score);
}
// 품질 임계값
const QUALITY_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 75,
    ACCEPTABLE: 60,
    POOR: 40
};
function getQualityStatus(score) {
    if (score >= QUALITY_THRESHOLDS.EXCELLENT)
        return 'excellent';
    if (score >= QUALITY_THRESHOLDS.GOOD)
        return 'good';
    if (score >= QUALITY_THRESHOLDS.ACCEPTABLE)
        return 'acceptable';
    if (score >= QUALITY_THRESHOLDS.POOR)
        return 'poor';
    return 'critical';
}
// 🎯 메인 품질 검사 함수
async function checkGuideQuality() {
    console.log('🎯 가이드 품질 검사 시작...\n');
    try {
        // 1. 실제 사용되는 guides 테이블에서 모든 가이드 조회 (우선)
        const { data: guides, error } = await supabase
            .from('guides')
            .select(`
        id,
        locationname,
        language,
        content,
        updated_at
      `)
            .order('locationname', { ascending: true });
            
        if (error) {
            throw new Error(`가이드 조회 실패: ${error.message}`);
        }
        
        // guides 테이블 데이터를 표준 형식으로 변환
        let allGuides = [];
        if (guides && guides.length > 0) {
            allGuides = guides.map(g => ({
                id: g.id,
                location_name: g.locationname,
                language: g.language || 'ko',
                content: g.content,
                quality_score: null,
                status: 'production',
                updated_at: g.updated_at
            }));
            console.log(`📊 guides 테이블에서 ${guides.length}개 가이드 발견`);
        }
        
        // 추가로 guide_versions 테이블도 확인 (레거시 데이터)
        const { data: guideVersions, error: gvError } = await supabase
            .from('guide_versions')
            .select(`
        id,
        location_name,
        language,
        content,
        quality_score,
        status,
        updated_at
      `)
            .in('status', ['production', 'staging'])
            .order('location_name', { ascending: true });
            
        if (!gvError && guideVersions && guideVersions.length > 0) {
            console.log(`📊 추가로 guide_versions 테이블에서 ${guideVersions.length}개 가이드 발견 (레거시)`);
            allGuides.push(...guideVersions);
        }
        
        if (allGuides.length === 0) {
            console.log('✅ 검사할 가이드가 없습니다.');
            return createEmptyResult();
        }
        
        console.log(`📊 총 검사 대상: ${allGuides.length}개 가이드`);
        
        // 2. 각 가이드 검사
        const results = [];
        const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
        for (let i = 0; i < allGuides.length; i++) {
            const guide = allGuides[i];
            console.log(`🔍 [${i + 1}/${allGuides.length}] ${guide.location_name} (${guide.language}) 검사 중...`);
            try {
                const checkResult = await checkSingleGuide(guide, genAI);
                results.push(checkResult);
                // 진행 상황 표시
                const statusIcon = checkResult.needsAction ? '❌' : '✅';
                console.log(`   ${statusIcon} ${checkResult.qualityScore.toFixed(1)}점 (${checkResult.status})`);
            }
            catch (error) {
                console.error(`   💥 검사 실패: ${error}`);
                results.push({
                    locationName: guide.location_name,
                    language: guide.language,
                    qualityScore: 0,
                    status: 'critical',
                    issues: ['검사 실패'],
                    needsAction: true
                });
            }
            // 잠깐 대기 (API 부하 방지)
            await sleep(500);
        }
        // 3. 결과 분류 및 요약
        const summary = categorizeResults(results);
        // 4. 결과 출력
        printResults(summary);
        return summary;
    }
    catch (error) {
        console.error('❌ 품질 검사 실패:', error);
        throw error;
    }
}
// 개별 가이드 검사
async function checkSingleGuide(guide, genAI) {
    // 기존 품질 점수가 있으면 우선 사용
    if (guide.quality_score && guide.quality_score > 0) {
        const status = getQualityStatus(guide.quality_score);
        return {
            locationName: guide.location_name,
            language: guide.language,
            qualityScore: guide.quality_score,
            status,
            issues: guide.quality_score < 60 ? ['품질 점수가 낮습니다'] : [],
            needsAction: guide.quality_score < 60
        };
    }
    // 간단한 품질 점수 계산 (가이드 객체 자체를 전달)
    const score = calculateSimpleQualityScore(guide);
    const status = getQualityStatus(score);
    const issues = [];
    
    // 실제 DB 구조에 맞는 이슈 체크
    if (!guide.location_name)
        issues.push('위치명 누락');
        
    if (guide.content) {
        if (guide.content.realTimeGuide) {
            // guides 테이블 구조 검사 (우선)
            const rtGuide = guide.content.realTimeGuide;
            if (!rtGuide.chapters || rtGuide.chapters.length < 3) issues.push('챕터 부족');
            if (!rtGuide.overview) issues.push('개요 누락');
            
            // 인트로 챕터 검사
            if (rtGuide.chapters && rtGuide.chapters.length > 0) {
                const introChapter = rtGuide.chapters[0];
                if (!introChapter.narrative) {
                    issues.push('인트로 챕터 누락');
                } else {
                    const length = introChapter.narrative.length;
                    if (length < 1200) {
                        issues.push(`인트로 챕터 길이 부족 (${length}자 < 1200자)`);
                    } else if (length > 1500) {
                        issues.push(`인트로 챕터 너무 길음 (${length}자 > 1500자)`);
                    }
                }
                
                if (introChapter.narrative) {
                    const greetingPatterns = [
                        /안녕하세요/, /여러분/, /환영합니다/, /반갑습니다/,
                        /함께.*하겠습니다/, /.*함께.*여행/, /.*가이드.*시작/, /.*소개.*드리겠습니다/
                    ];
                    
                    const hasGreeting = greetingPatterns.some(pattern => 
                        pattern.test(introChapter.narrative)
                    );
                    
                    if (!hasGreeting) {
                        issues.push('인트로 챕터 인사말 누락');
                    }
                }
            }
        } else if (guide.content.content && guide.content.content.realTimeGuide) {
            // 중첩된 구조화된 가이드 검사
            const rtGuide = guide.content.content.realTimeGuide;
            if (!rtGuide.chapters || rtGuide.chapters.length < 3) issues.push('챕터 부족');
            
            // 인트로 챕터 검사
            if (rtGuide.chapters && rtGuide.chapters.length > 0) {
                const introChapter = rtGuide.chapters[0];
                if (!introChapter.narrative) {
                    issues.push('인트로 챕터 누락');
                } else {
                    const length = introChapter.narrative.length;
                    if (length < 1200) {
                        issues.push(`인트로 챕터 길이 부족 (${length}자 < 1200자)`);
                    } else if (length > 1500) {
                        issues.push(`인트로 챕터 너무 길음 (${length}자 > 1500자)`);
                    }
                }
                
                if (introChapter.narrative) {
                    const greetingPatterns = [
                        /안녕하세요/, /여러분/, /환영합니다/, /반갑습니다/,
                        /함께.*하겠습니다/, /.*함께.*여행/, /.*가이드.*시작/, /.*소개.*드리겠습니다/
                    ];
                    
                    const hasGreeting = greetingPatterns.some(pattern => 
                        pattern.test(introChapter.narrative)
                    );
                    
                    if (!hasGreeting) {
                        issues.push('인트로 챕터 인사말 누락');
                    }
                }
            }
        } else if (guide.content.raw) {
            // guide_versions 테이블 원시 JSON 데이터 검사 (레거시)
            try {
                const jsonContent = JSON.parse(guide.content.content.replace(/```json\n/, '').replace(/\n```$/, ''));
                if (!jsonContent.overview) issues.push('개요 누락');
                if (!jsonContent.highlights || jsonContent.highlights.length < 3) issues.push('하이라이트 부족');
            } catch (e) {
                issues.push('JSON 파싱 실패');
            }
        } else {
            issues.push('알 수 없는 콘텐츠 구조');
        }
    } else {
        issues.push('콘텐츠 없음');
    }
    return {
        locationName: guide.location_name,
        language: guide.language,
        qualityScore: score,
        status,
        issues,
        needsAction: score < 60 || issues.length > 0
    };
    // AI 검증 수행
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite-preview-06-17',
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
        }
    });
    const prompt = `다음 관광 가이드의 품질을 0-100점으로 평가해주세요.

위치: ${guide.location_name}
언어: ${guide.language}

평가 후 다음 JSON 형식으로 응답:
{
  "score": 전체점수,
  "issues": ["문제점1", "문제점2"]
}

내용이 부족하거나 오류가 있으면 낮은 점수를, 완성도가 높고 정확하면 높은 점수를 주세요.`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        const parsed = JSON.parse(text);
        const score = Math.min(100, Math.max(0, parsed.score || 50));
        const status = getQualityStatus(score);
        return {
            locationName: guide.location_name,
            language: guide.language,
            qualityScore: score,
            status,
            issues: parsed.issues || [],
            needsAction: score < QUALITY_THRESHOLDS.ACCEPTABLE
        };
    }
    catch (error) {
        // AI 실패시 기본값
        return {
            locationName: guide.location_name,
            language: guide.language,
            qualityScore: 50,
            status: 'acceptable',
            issues: ['AI 평가 실패'],
            needsAction: false
        };
    }
}
// 결과 분류
function categorizeResults(results) {
    const categorized = {
        totalChecked: results.length,
        excellent: results.filter(r => r.status === 'excellent'),
        good: results.filter(r => r.status === 'good'),
        acceptable: results.filter(r => r.status === 'acceptable'),
        poor: results.filter(r => r.status === 'poor'),
        critical: results.filter(r => r.status === 'critical'),
        summary: {
            excellentCount: 0,
            goodCount: 0,
            acceptableCount: 0,
            poorCount: 0,
            criticalCount: 0,
            avgScore: 0
        }
    };
    categorized.summary = {
        excellentCount: categorized.excellent.length,
        goodCount: categorized.good.length,
        acceptableCount: categorized.acceptable.length,
        poorCount: categorized.poor.length,
        criticalCount: categorized.critical.length,
        avgScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
    };
    return categorized;
}
// 결과 출력
function printResults(summary) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 가이드 품질 검사 결과');
    console.log('='.repeat(60));
    console.log(`총 검사: ${summary.totalChecked}개`);
    console.log(`평균 점수: ${summary.summary.avgScore.toFixed(1)}점\n`);
    // 상태별 분포
    console.log('🎯 품질 분포:');
    console.log(`  🌟 우수 (90+):   ${summary.summary.excellentCount}개 (${(summary.summary.excellentCount / summary.totalChecked * 100).toFixed(1)}%)`);
    console.log(`  ✅ 양호 (75-89): ${summary.summary.goodCount}개 (${(summary.summary.goodCount / summary.totalChecked * 100).toFixed(1)}%)`);
    console.log(`  ⚠️ 허용 (60-74): ${summary.summary.acceptableCount}개 (${(summary.summary.acceptableCount / summary.totalChecked * 100).toFixed(1)}%)`);
    console.log(`  🔴 불량 (40-59): ${summary.summary.poorCount}개 (${(summary.summary.poorCount / summary.totalChecked * 100).toFixed(1)}%)`);
    console.log(`  🚨 심각 (<40):  ${summary.summary.criticalCount}개 (${(summary.summary.criticalCount / summary.totalChecked * 100).toFixed(1)}%)`);
    // 문제가 있는 가이드들
    const problemGuides = [...summary.poor, ...summary.critical];
    if (problemGuides.length > 0) {
        console.log('\n🚨 조치가 필요한 가이드:');
        problemGuides.forEach(guide => {
            const icon = guide.status === 'critical' ? '🚨' : '🔴';
            console.log(`  ${icon} ${guide.locationName} (${guide.language}): ${guide.qualityScore.toFixed(1)}점`);
            if (guide.issues.length > 0) {
                console.log(`     문제: ${guide.issues.slice(0, 2).join(', ')}`);
            }
        });
    }
    else {
        console.log('\n✅ 모든 가이드가 허용 가능한 품질 수준입니다!');
    }
    // 추천사항
    console.log('\n💡 추천사항:');
    if (summary.summary.criticalCount > 0) {
        console.log(`  🚨 ${summary.summary.criticalCount}개 가이드가 즉시 재생성이 필요합니다`);
    }
    if (summary.summary.poorCount > 0) {
        console.log(`  🔴 ${summary.summary.poorCount}개 가이드의 품질 개선이 필요합니다`);
    }
    if (problemGuides.length === 0) {
        console.log('  🎉 현재 모든 가이드가 좋은 상태입니다!');
    }
    const problemRate = (summary.summary.poorCount + summary.summary.criticalCount) / summary.totalChecked * 100;
    if (problemRate > 10) {
        console.log(`  📊 전체의 ${problemRate.toFixed(1)}%가 문제 가이드입니다 - 전반적인 점검이 필요합니다`);
    }
}
// 빈 결과 생성
function createEmptyResult() {
    return {
        totalChecked: 0,
        excellent: [],
        good: [],
        acceptable: [],
        poor: [],
        critical: [],
        summary: {
            excellentCount: 0,
            goodCount: 0,
            acceptableCount: 0,
            poorCount: 0,
            criticalCount: 0,
            avgScore: 0
        }
    };
}
// 대기 함수
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// 🎯 특정 가이드 상세 검사
async function inspectSpecificGuide(locationName, language = 'ko') {
    console.log(`🔍 ${locationName} (${language}) 상세 검사 중...\n`);
    try {
        // guide_versions 테이블에서 먼저 찾기
        let { data: guide, error } = await supabase
            .from('guide_versions')
            .select(`
        id,
        location_name,
        language,
        content,
        quality_score,
        status,
        created_at,
        updated_at
      `)
            .eq('location_name', locationName)
            .eq('language', language)
            .in('status', ['production', 'staging'])
            .limit(1);
            
        // guide_versions에서 찾지 못하면 guides 테이블에서 찾기
        if (error || !guide || guide.length === 0) {
            const { data: guidesTableData, error: guidesError } = await supabase
                .from('guides')
                .select('id, locationname, language, content, updated_at')
                .eq('locationname', locationName)
                .eq('language', language)
                .limit(1);
                
            if (!guidesError && guidesTableData && guidesTableData.length > 0) {
                guide = [{
                    id: guidesTableData[0].id,
                    location_name: guidesTableData[0].locationname,
                    language: guidesTableData[0].language || 'ko',
                    content: guidesTableData[0].content,
                    quality_score: null,
                    status: 'guides_table',
                    created_at: null,
                    updated_at: guidesTableData[0].updated_at
                }];
                error = null;
            }
        }
        
        if (error || !guide || guide.length === 0) {
            console.error('❌ 가이드를 찾을 수 없습니다');
            return;
        }
        
        guide = guide[0]; // 첫 번째 결과 사용
        // 기본 정보
        console.log(`📍 위치: ${guide.location_name}`);
        console.log(`🌐 언어: ${guide.language}`);
        console.log(`📅 생성: ${new Date(guide.created_at).toLocaleString()}`);
        console.log(`📅 수정: ${new Date(guide.updated_at).toLocaleString()}`);
        console.log(`📊 품질 점수: ${guide.quality_score ? guide.quality_score + '점' : 'N/A'}`);
        // 콘텐츠 분석
        if (guide.content && guide.content.realTimeGuide) {
            const chapters = guide.content.realTimeGuide.chapters || [];
            console.log(`📚 챕터 수: ${chapters.length}개`);
            if (chapters.length > 0) {
                console.log('\n📋 챕터 목록:');
                chapters.forEach((chapter, index) => {
                    console.log(`  ${index + 1}. ${chapter.title || '제목 없음'}`);
                    if (chapter.content) {
                        console.log(`     내용: ${chapter.content.length}자`);
                    }
                });
            }
        }
        // 품질 상태
        if (guide.quality_score) {
            const status = getQualityStatus(guide.quality_score);
            const statusEmoji = {
                excellent: '🌟',
                good: '✅',
                acceptable: '⚠️',
                poor: '🔴',
                critical: '🚨'
            };
            console.log(`\n${statusEmoji[status]} 품질 상태: ${status}`);
            if (guide.quality_score < QUALITY_THRESHOLDS.ACCEPTABLE) {
                console.log('💡 권장사항: 품질 개선이 필요합니다');
            }
            else {
                console.log('✅ 품질이 양호합니다');
            }
        }
    }
    catch (error) {
        console.error('❌ 가이드 검사 실패:', error);
    }
}
// 🗑️ 75점 이하 가이드 삭제
async function deleteLowQualityGuides(lowQualityGuides) {
    if (lowQualityGuides.length === 0) {
        console.log('✅ 삭제할 가이드가 없습니다.');
        return;
    }
    
    console.log(`\n⚠️ 다음 ${lowQualityGuides.length}개 가이드를 삭제합니다:`);
    lowQualityGuides.forEach(guide => {
        console.log(`  - ${guide.locationName} (${guide.language}): ${guide.qualityScore}점`);
    });
    
    console.log('\n🚨 주의: 이 작업은 되돌릴 수 없습니다!');
    console.log('계속하려면 5초 후 진행됩니다...');
    
    // 5초 대기
    for (let i = 5; i > 0; i--) {
        process.stdout.write(`\r⏰ ${i}초 남음... (Ctrl+C로 취소)`);
        await sleep(1000);
    }
    console.log('\n');
    
    console.log(`🗑️ ${lowQualityGuides.length}개 가이드 삭제 시작...`);
    
    let deletedCount = 0;
    for (const guide of lowQualityGuides) {
        console.log(`\n🗑️ [삭제] ${guide.locationName} (${guide.language}) - ${guide.qualityScore}점`);
        
        try {
            // guides 테이블에서 해당 가이드 삭제
            const { error: deleteError } = await supabase
                .from('guides')
                .delete()
                .eq('locationname', guide.locationName)
                .eq('language', guide.language);
                
            if (deleteError) {
                console.error(`   ❌ 삭제 실패: ${deleteError.message}`);
                continue;
            }
            
            console.log(`   ✅ 삭제 완료`);
            deletedCount++;
            
        } catch (error) {
            console.error(`   💥 처리 실패: ${error.message}`);
        }
    }
    
    console.log(`\n🎉 삭제 작업 완료! (${deletedCount}/${lowQualityGuides.length}개 성공)`);
}

// 🎯 CLI 진입점
async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🎯 가이드 품질 검사 도구

사용법:
  npm run quality:check                    # 전체 가이드 검사
  npm run quality:check --delete           # 품질검사 후 75점 이하 자동 삭제
  npm run quality:inspect <위치명> [언어]   # 개별 가이드 상세 검사

예시:
  npm run quality:check
  npm run quality:check --delete
  npm run quality:inspect 경복궁 ko
  npm run quality:inspect 덕수궁
    `);
        return;
    }
    // 개별 가이드 검사
    if (args[0] === 'inspect' || args[0] === 'i') {
        if (!args[1]) {
            console.error('❌ 위치명을 입력해주세요');
            console.log('사용법: npm run quality:inspect <위치명> [언어]');
            return;
        }
        const locationName = args[1];
        const language = args[2] || 'ko';
        await inspectSpecificGuide(locationName, language);
        return;
    }
    // 전체 가이드 검사
    try {
        const results = await checkGuideQuality();
        console.log('\n🎉 품질 검사 완료!');
        
        // --delete 또는 --regenerate 플래그가 있으면 75점 이하 가이드 삭제
        if (args.includes('--delete') || args.includes('--regenerate')) {
            const lowQualityGuides = [
                ...results.poor.filter(g => g.qualityScore <= 75),
                ...results.critical
            ];
            
            if (lowQualityGuides.length > 0) {
                console.log(`\n⚠️ 75점 이하 가이드 ${lowQualityGuides.length}개 발견!`);
                console.log('🗑️ 자동 삭제를 시작합니다...');
                
                await deleteLowQualityGuides(lowQualityGuides);
            } else {
                console.log('\n✅ 모든 가이드가 75점 이상입니다!');
            }
        }
    }
    catch (error) {
        console.error('❌ 실행 실패:', error);
        process.exit(1);
    }
}
// 스크립트로 직접 실행될 때만 main 함수 실행
if (require.main === module) {
    main().catch(console.error);
}
