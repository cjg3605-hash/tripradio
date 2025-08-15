// src/components/accessibility/SkipToMain.tsx
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

const SkipToMain = () => {
  const { t } = useLanguage();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-black focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
    >
      {t('accessibility.skipToMain') || '메인 콘텐츠로 건너뛰기'}
    </a>
  );
};

export default SkipToMain;