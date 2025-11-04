// src/components/optimization/FontOptimizer.tsx
'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * FontOptimizer: 언어별 폰트 최적화 컴포넌트
 *
 * 주요 기능:
 * - 한국어/일본어/중국어 필요시에만 Pretendard 폰트 로드
 * - 영어/스페인어는 System 폰트 사용
 * - font-display: swap으로 FOUT 최소화
 * - 필요한 weight만 로드
 */
const FontOptimizer = () => {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // 한글/日本語/中文 필요 언어
    const asianLanguages = new Set(['ko', 'ja', 'zh']);
    const isAsianLanguage = asianLanguages.has(currentLanguage);

    if (isAsianLanguage) {
      // Pretendard 폰트 동적 로드
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/fonts/pretendard.css';
      link.media = 'print'; // 초기 로드 우선순위 낮춤
      link.onload = function () {
        this.media = 'all'; // 로드 완료 후 활성화
      };
      link.onerror = function () {
        console.warn('⚠️ Pretendard 폰트 로드 실패, 폴백 적용');
      };
      document.head.appendChild(link);

      // requestIdleCallback으로 낮은 우선순위에서 로드
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const stylesheets = document.querySelectorAll(
            'link[href="/fonts/pretendard.css"]'
          );
          stylesheets.forEach((sheet) => {
            if (sheet && sheet instanceof HTMLLinkElement) {
              sheet.media = 'all'; // 활성화
            }
          });
        });
      }
    } else {
      // 영어/스페인어: 시스템 폰트 사용 (로드 불필요)
      // System fonts (San Francisco, Roboto, 등)는 이미 설치되어 있음
      console.log('🔤 시스템 폰트 사용:', currentLanguage);
    }
  }, [currentLanguage]);

  return null; // 렌더링 없음
};

export default FontOptimizer;
