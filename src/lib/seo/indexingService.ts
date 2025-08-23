// src/lib/seo/indexingService.ts
// 자동 색인 요청 서비스 - Google Indexing API & Naver Search Advisor 연동

import { google } from 'googleapis';

export interface IndexingRequest {
  url: string;
  status: 'pending' | 'success' | 'error';
  searchEngine: 'google' | 'naver' | 'bing';
  requestedAt: Date;
  processedAt?: Date;
  errorMessage?: string;
}

export interface IndexingResult {
  success: boolean;
  successfulUrls: string[];
  failedUrls: { url: string; error: string }[];
  totalRequested: number;
  successRate: number;
}

export class IndexingService {
  private static instance: IndexingService;
  private googleAuth: any;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): IndexingService {
    if (!IndexingService.instance) {
      IndexingService.instance = new IndexingService();
    }
    return IndexingService.instance;
  }

  // Google 인증 초기화
  private async initializeGoogleAuth(): Promise<void> {
    try {
      const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        console.warn('⚠️ Google Service Account Key가 설정되지 않았습니다.');
        return;
      }

      // Base64로 인코딩된 키 디코딩 (환경 변수에서)
      const keyData = JSON.parse(
        Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
      );

      this.googleAuth = new google.auth.GoogleAuth({
        credentials: keyData,
        scopes: ['https://www.googleapis.com/auth/indexing']
      });

      this.isInitialized = true;
      console.log('✅ Google Indexing API 인증 초기화 완료');

    } catch (error) {
      console.error('❌ Google 인증 초기화 실패:', error);
      this.isInitialized = false;
    }
  }

  // 새로운 가이드에 대한 5개 언어 URL 생성 (번역된 장소명 사용)
  generateGuideUrls(locationName: string): string[] {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
    const languages = ['ko', 'en', 'ja', 'zh', 'es'] as const;
    
    // 번역 모듈 동적 import (optional)
    try {
      const { generateLocalizedGuideUrls } = require('./locationTranslation');
      const localizedUrls = generateLocalizedGuideUrls(locationName);
      return localizedUrls.map(item => item.url);
    } catch (error) {
      console.log('📝 번역 모듈 없음, 기본 방식 사용:', error);
      
      // 올바른 URL 패턴 생성
      const urls: string[] = [];
      
      // 🚀 새로운 URL 구조: /guide/[language]/[location] - 정규화된 도메인 사용
      languages.forEach(lang => {
        urls.push(`${baseUrl}/guide/${lang}/${encodeURIComponent(locationName)}`);
      });
      
      return urls;
    }
  }

  // 랜딩 페이지 URL 생성
  generateLandingPageUrls(): string[] {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
    const languages = ['ko', 'en', 'ja', 'zh', 'es'] as const;
    
    const landingPages = [
      '', // 홈페이지
      'destinations', 
      'docent',
      'travel-radio',
      'tour-radio',
      'audio-guide',
      'free-travel',
      'visa-checker',
      'trip-planner',
      'film-locations',
      'nomad-calculator'
    ];
    
    const urls: string[] = [];
    
    // 각 랜딩 페이지별 다국어 URL 생성
    landingPages.forEach(page => {
      languages.forEach(lang => {
        if (page === '') {
          // 홈페이지
          if (lang === 'ko') {
            urls.push(baseUrl);
          } else {
            urls.push(`${baseUrl}?lang=${lang}`);
          }
        } else {
          // 다른 페이지들
          if (lang === 'ko') {
            urls.push(`${baseUrl}/${page}`);
          } else {
            urls.push(`${baseUrl}/${page}?lang=${lang}`);
          }
        }
      });
    });
    
    return urls;
  }

  // Google Indexing API로 단일 URL 색인 요청
  private async requestGoogleIndexing(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initializeGoogleAuth();
      }

      if (!this.isInitialized) {
        return { success: false, error: 'Google 인증이 초기화되지 않았습니다.' };
      }

      const indexing = google.indexing({ version: 'v3', auth: this.googleAuth });

      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED'
        }
      });

      console.log(`✅ Google 색인 요청 성공: ${url}`);
      return { success: true };

    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
      console.error(`❌ Google 색인 요청 실패: ${url} - ${errorMessage}`);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Naver Search Advisor API 색인 요청 (향후 구현)
  private async requestNaverIndexing(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Naver Search Advisor는 REST API가 제한적이므로
      // 현재는 로깅만 하고 수동 등록 안내
      console.log(`📝 Naver 수동 등록 필요: ${url}`);
      console.log('   👉 https://searchadvisor.naver.com/console/request');
      
      return { 
        success: true, // 수동 등록 안내이므로 성공으로 처리
        error: 'manual_registration_required' 
      };

    } catch (error: any) {
      console.error(`❌ Naver 색인 처리 실패: ${url}`, error);
      return { 
        success: false, 
        error: error?.message || 'Naver indexing failed' 
      };
    }
  }

  // 배치 색인 요청 - 새 가이드 생성 시 호출
  async requestIndexingForNewGuide(locationName: string): Promise<IndexingResult> {
    const urls = this.generateGuideUrls(locationName);
    const results: IndexingResult = {
      success: false,
      successfulUrls: [],
      failedUrls: [],
      totalRequested: urls.length,
      successRate: 0
    };

    console.log(`🚀 새 가이드 색인 요청 시작: ${locationName} (${urls.length}개 URL)`);

    // Google 색인 요청 (병렬 처리)
    const googlePromises = urls.map(async (url) => {
      const result = await this.requestGoogleIndexing(url);
      
      if (result.success) {
        results.successfulUrls.push(url);
      } else {
        results.failedUrls.push({ url, error: result.error || 'Unknown error' });
      }

      // 색인 요청 기록 저장 (향후 데이터베이스 구현)
      await this.logIndexingRequest({
        url,
        status: result.success ? 'success' : 'error',
        searchEngine: 'google',
        requestedAt: new Date(),
        processedAt: new Date(),
        errorMessage: result.error
      });

      return result;
    });

    // 모든 Google 요청 완료 대기
    await Promise.all(googlePromises);

    // Naver 색인 요청 (현재는 로깅만)
    for (const url of urls) {
      const naverResult = await this.requestNaverIndexing(url);
      
      await this.logIndexingRequest({
        url,
        status: naverResult.success ? 'success' : 'error',
        searchEngine: 'naver',
        requestedAt: new Date(),
        processedAt: new Date(),
        errorMessage: naverResult.error
      });
    }

    // 성공률 계산
    results.successRate = results.successfulUrls.length / results.totalRequested;
    results.success = results.successRate > 0.5; // 50% 이상 성공하면 전체적으로 성공

    console.log(`✅ 색인 요청 완료: ${locationName}`);
    console.log(`   성공: ${results.successfulUrls.length}/${results.totalRequested} (${(results.successRate * 100).toFixed(1)}%)`);
    
    if (results.failedUrls.length > 0) {
      console.log(`   실패한 URL: ${results.failedUrls.length}개`);
      results.failedUrls.forEach(({ url, error }) => {
        console.log(`     - ${url}: ${error}`);
      });
    }

    return results;
  }

  // 정적 페이지들에 대한 색인 요청
  async requestIndexingForStaticPages(urls: string[]): Promise<IndexingResult> {
    const results: IndexingResult = {
      success: false,
      successfulUrls: [],
      failedUrls: [],
      totalRequested: urls.length,
      successRate: 0
    };

    console.log(`🚀 정적 페이지 색인 요청 시작: ${urls.length}개 URL`);

    // Google 색인 요청 (병렬 처리)
    const googlePromises = urls.map(async (url) => {
      const result = await this.requestGoogleIndexing(url);
      
      if (result.success) {
        results.successfulUrls.push(url);
      } else {
        results.failedUrls.push({ url, error: result.error || 'Unknown error' });
      }

      // 색인 요청 기록 저장
      await this.logIndexingRequest({
        url,
        status: result.success ? 'success' : 'error',
        searchEngine: 'google',
        requestedAt: new Date(),
        processedAt: new Date(),
        errorMessage: result.error
      });

      return result;
    });

    // 모든 Google 요청 완료 대기
    await Promise.all(googlePromises);

    // 성공률 계산
    results.successRate = results.successfulUrls.length / results.totalRequested;
    results.success = results.successRate > 0.5;

    console.log(`✅ 정적 페이지 색인 요청 완료`);
    console.log(`   성공: ${results.successfulUrls.length}/${results.totalRequested} (${(results.successRate * 100).toFixed(1)}%)`);
    
    if (results.failedUrls.length > 0) {
      console.log(`   실패한 URL: ${results.failedUrls.length}개`);
      results.failedUrls.forEach(({ url, error }) => {
        console.log(`     - ${url}: ${error}`);
      });
    }

    return results;
  }

  // 기존 가이드 재색인 요청
  async requestReindexing(locationName: string): Promise<IndexingResult> {
    console.log(`🔄 기존 가이드 재색인 요청: ${locationName}`);
    return this.requestIndexingForNewGuide(locationName);
  }

  // 특정 URL 색인 요청
  async requestSingleUrlIndexing(url: string): Promise<{ success: boolean; error?: string }> {
    console.log(`🎯 단일 URL 색인 요청: ${url}`);
    
    const googleResult = await this.requestGoogleIndexing(url);
    const naverResult = await this.requestNaverIndexing(url);

    // 로그 기록
    await Promise.all([
      this.logIndexingRequest({
        url,
        status: googleResult.success ? 'success' : 'error',
        searchEngine: 'google',
        requestedAt: new Date(),
        processedAt: new Date(),
        errorMessage: googleResult.error
      }),
      this.logIndexingRequest({
        url,
        status: naverResult.success ? 'success' : 'error',
        searchEngine: 'naver',
        requestedAt: new Date(),
        processedAt: new Date(),
        errorMessage: naverResult.error
      })
    ]);

    return googleResult; // Google 결과를 기준으로 반환
  }

  // 색인 요청 로그 기록 (현재는 콘솔, 향후 데이터베이스)
  private async logIndexingRequest(request: IndexingRequest): Promise<void> {
    try {
      // 향후 데이터베이스 구현 예정
      // await supabase.from('indexing_requests').insert(request);
      
      // 현재는 상세 로그만 기록
      const logMessage = `📊 [${request.searchEngine.toUpperCase()}] ${request.url} - ${request.status}`;
      if (request.errorMessage && request.errorMessage !== 'manual_registration_required') {
        console.log(`${logMessage} (오류: ${request.errorMessage})`);
      } else if (request.status === 'success') {
        console.log(`${logMessage} ✅`);
      }

    } catch (error) {
      console.error('❌ 색인 요청 로그 기록 실패:', error);
    }
  }

  // 주간 색인 상태 리포트 생성
  generateWeeklyReport(): void {
    console.log('📊 주간 색인 리포트 생성 (향후 구현)');
    // 향후 데이터베이스에서 통계 조회하여 리포트 생성
  }

  // 실패한 URL 재시도
  async retryFailedUrls(): Promise<void> {
    console.log('🔄 실패한 URL 재시도 (향후 구현)');
    // 향후 데이터베이스에서 실패한 요청들을 조회하여 재시도
  }
}

// 싱글톤 인스턴스 export
export const indexingService = IndexingService.getInstance();

// 유틸리티 함수들
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function extractLocationFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    if (pathParts[1] === 'guide' && pathParts[2]) {
      return decodeURIComponent(pathParts[2]);
    }
    
    return null;
  } catch {
    return null;
  }
}

// 설정 검증 함수
export function validateIndexingConfiguration(): {
  isValid: boolean;
  missingConfig: string[];
  recommendations: string[];
} {
  const missing: string[] = [];
  const recommendations: string[] = [];

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    missing.push('GOOGLE_SERVICE_ACCOUNT_KEY');
    recommendations.push('Google Cloud Console에서 서비스 계정 키를 생성하고 Base64로 인코딩하여 환경 변수에 설정하세요.');
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    missing.push('NEXT_PUBLIC_BASE_URL');
    recommendations.push('사이트의 기본 URL을 환경 변수에 설정하세요. (예: https://navidocent.com)');
  }

  return {
    isValid: missing.length === 0,
    missingConfig: missing,
    recommendations
  };
}