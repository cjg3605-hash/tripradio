// MultiLangGuideManager를 직접 사용해서 용궁사 가이드 생성
const { createRequire } = require('module');
const require = createRequire(import.meta.url);

// 환경변수 설정 (Next.js 환경 모방)
process.env.NODE_ENV = 'development';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

import { MultiLangGuideManager } from './src/lib/multilang-guide-manager.js';

async function createYonggungsaViaManager() {
  console.log('🎯 MultiLangGuideManager로 용궁사 가이드 생성...');
  
  try {
    const result = await MultiLangGuideManager.generateAndSaveGuide(
      '용궁사',
      'ko', 
      null,
      '부산',
      { region: '기장군', type: 'temple' }
    );
    
    if (result.success) {
      console.log('✅ 생성 및 저장 성공!');
      console.log('📊 데이터:', result.data ? '있음' : '없음');
    } else {
      console.error('❌ 실패:', result.error);
    }
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

createYonggungsaViaManager();