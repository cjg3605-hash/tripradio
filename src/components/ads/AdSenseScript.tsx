'use client';

export default function AdSenseScript() {
  // AdSense 스크립트는 개발 환경에서는 로드하지 않음
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  
  if (!publisherId) {
    return null;
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
    />
  );
} 