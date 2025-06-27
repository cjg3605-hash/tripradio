import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const HISTORY_DIR = path.join(process.cwd(), 'saved-guides', 'history');

// 영문명 변환 함수 (다른 파일들과 동일)
const convertToEnglishFileName = (locationName: string): string => {
  const nameMapping: { [key: string]: string } = {
    // 스페인
    '알함브라': 'alhambra',
    '알함브라 궁전': 'alhambra-palace',
    '메스키타': 'mezquita',
    '코르도바 메스키타': 'mezquita-cordoba',
    '코르도바 메스키타-카테드랄': 'mezquita-cordoba',
    '세비야 대성당': 'seville-cathedral',
    '히랄다 탑': 'giralda-tower',
    '사그라다 파밀리아': 'sagrada-familia',
    '구엘 공원': 'park-guell',
    '카사 밀라': 'casa-mila',
    '카사 바트요': 'casa-batllo',
    '몬세라트': 'montserrat',
    '플라멩코': 'flamenco',
    '레알 알카사르': 'real-alcazar',
    
    // 프랑스
    '에펠탑': 'eiffel-tower',
    '루브르 박물관': 'louvre-museum',
    '노트르담 대성당': 'notre-dame-cathedral',
    '베르사유 궁전': 'versailles-palace',
    '샹젤리제': 'champs-elysees',
    '몽마르트': 'montmartre',
    '개선문': 'arc-de-triomphe',
    
    // 이탈리아
    '콜로세움': 'colosseum',
    '바티칸': 'vatican',
    '피사의 사탑': 'leaning-tower-pisa',
    '두오모': 'duomo',
    '베네치아': 'venice',
    '피렌체': 'florence',
    
    // 기타
    '성': 'castle',
    '궁전': 'palace',
    '대성당': 'cathedral',
    '성당': 'church',
    '박물관': 'museum',
    '공원': 'park',
    '광장': 'square',
    '다리': 'bridge',
    '탑': 'tower'
  };

  let englishName = locationName.toLowerCase();
  
  if (nameMapping[locationName]) {
    return nameMapping[locationName];
  }
  
  Object.entries(nameMapping).forEach(([korean, english]) => {
    if (locationName.includes(korean)) {
      englishName = englishName.replace(korean, english);
    }
  });
  
  englishName = englishName
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (/[가-힣]/.test(englishName)) {
    englishName = englishName.replace(/[가-힣]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  
  if (!englishName) {
    englishName = `location-${Date.now()}`;
  }
  
  return englishName;
};

// POST: localStorage 데이터를 파일로 마이그레이션
export async function POST(request: NextRequest) {
  try {
    const { localStorageData } = await request.json();
    
    if (!localStorageData || !Array.isArray(localStorageData)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 데이터 형식입니다.' },
        { status: 400 }
      );
    }
    
    await fs.mkdir(HISTORY_DIR, { recursive: true });
    
    const migrationResults = [];
    
    for (const entry of localStorageData) {
      try {
        const englishName = convertToEnglishFileName(entry.locationName);
        const timestamp = new Date(entry.createdAt).getTime();
        const fileName = `${englishName}-${timestamp}.json`;
        const filePath = path.join(HISTORY_DIR, fileName);
        
        // 파일 데이터 구조 변환
        const fileData = {
          content: entry.guideData,
          metadata: {
            originalLocationName: entry.locationName,
            englishFileName: fileName,
            generatedAt: entry.createdAt,
            migratedAt: new Date().toISOString(),
            version: '1.0',
            originalId: entry.id,
            userProfile: entry.userProfile,
            viewedPages: entry.viewedPages || [],
            completed: entry.completed || false
          }
        };
        
        await fs.writeFile(filePath, JSON.stringify(fileData, null, 2), 'utf-8');
        
        migrationResults.push({
          originalLocation: entry.locationName,
          fileName: fileName,
          success: true
        });
        
        console.log(`✅ 마이그레이션 완료: ${entry.locationName} → ${fileName}`);
        
      } catch (error) {
        console.error(`❌ 마이그레이션 실패: ${entry.locationName}`, error);
        migrationResults.push({
          originalLocation: entry.locationName,
          fileName: null,
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    }
    
    const successCount = migrationResults.filter(r => r.success).length;
    const failureCount = migrationResults.filter(r => !r.success).length;
    
    return NextResponse.json({
      success: true,
      message: `마이그레이션 완료: 성공 ${successCount}개, 실패 ${failureCount}개`,
      results: migrationResults,
      statistics: {
        total: localStorageData.length,
        success: successCount,
        failure: failureCount
      }
    });
    
  } catch (error) {
    console.error('마이그레이션 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '마이그레이션 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET: 마이그레이션 가능한 localStorage 데이터 확인
export async function GET() {
  try {
    // 이 API는 클라이언트에서 localStorage 데이터를 확인하기 위한 정보만 제공
    return NextResponse.json({
      success: true,
      message: 'localStorage 데이터를 POST 방식으로 전송하여 마이그레이션하세요.',
      instructions: {
        step1: 'localStorage에서 navi_guide_history 데이터를 가져오기',
        step2: 'POST /api/migrate-cache로 데이터 전송',
        step3: '마이그레이션 완료 후 localStorage 데이터 삭제 (선택사항)'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류' },
      { status: 500 }
    );
  }
} 