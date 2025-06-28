import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

interface FileGuideEntry {
  id: string;
  locationName: string;
  guideData: any;
  userProfile?: any;
  createdAt: string;
  expiresAt: string;
  viewedPages: string[];
  completed: boolean;
}

const STORAGE_CONFIG = {
  baseDir: path.join(process.cwd(), 'saved-guides'),
  historyDir: path.join(process.cwd(), 'saved-guides', 'history'),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
  maxFiles: 1000
};

const HISTORY_DIR = path.join(process.cwd(), 'saved-guides', 'history');

export const runtime = 'nodejs'; // 런타임을 Node.js로 명시

// 디렉토리 확인 및 생성
async function ensureDirectories() {
  if (!existsSync(STORAGE_CONFIG.baseDir)) {
    mkdirSync(STORAGE_CONFIG.baseDir, { recursive: true });
  }
  
  if (!existsSync(STORAGE_CONFIG.historyDir)) {
    mkdirSync(STORAGE_CONFIG.historyDir, { recursive: true });
  }
}

// 영문명 변환 함수 (generate-guide와 동일)
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
  
  // 매핑된 이름이 있으면 사용
  if (nameMapping[locationName]) {
    return nameMapping[locationName];
  }
  
  // 부분 매칭으로 변환
  Object.entries(nameMapping).forEach(([korean, english]) => {
    if (locationName.includes(korean)) {
      englishName = englishName.replace(korean, english);
    }
  });
  
  // 특수문자 제거 및 공백을 하이픈으로 변환
  englishName = englishName
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // 한글이 남아있으면 로마자 변환 (간단한 방식)
  if (/[가-힣]/.test(englishName)) {
    englishName = englishName.replace(/[가-힣]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  
  // 빈 문자열이면 타임스탬프 사용
  if (!englishName) {
    englishName = `location-${Date.now()}`;
  }
  
  return englishName;
};

// 가이드 히스토리 조회
async function getGuideHistory(): Promise<FileGuideEntry[]> {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(STORAGE_CONFIG.historyDir);
    const guides: FileGuideEntry[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(STORAGE_CONFIG.historyDir, file);
        
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const guide: FileGuideEntry = JSON.parse(content);

          // 만료 확인
          if (new Date(guide.expiresAt) >= new Date()) {
            guides.push(guide);
          } else {
            // 만료된 파일 삭제
            await fs.unlink(filePath);
            console.log(`🗑️ 만료된 파일 삭제: ${file}`);
          }
        } catch (parseError) {
          console.error(`⚠️ 파일 파싱 오류: ${file}`, parseError);
        }
      }
    }

    // 생성일 기준 최신순 정렬
    guides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return guides;
  } catch (error) {
    console.error('❌ 가이드 히스토리 조회 실패:', error);
    return [];
  }
}

// 가이드 삭제
async function deleteGuideFile(guideId: string): Promise<boolean> {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(STORAGE_CONFIG.historyDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(STORAGE_CONFIG.historyDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const guide: FileGuideEntry = JSON.parse(content);

        if (guide.id === guideId) {
          await fs.unlink(filePath);
          console.log(`🗑️ 가이드 파일 삭제 완료: ${file}`);
          return true;
        }
      }
    }

    return false;

  } catch (error) {
    console.error('❌ 가이드 삭제 실패:', error);
    return false;
  }
}

// 저장 정보 조회
async function getStorageInfo() {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(STORAGE_CONFIG.historyDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    let totalSize = 0;
    const locations = new Set<string>();
    let oldestFile = '';
    let newestFile = '';
    let oldestTime = Infinity;
    let newestTime = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(STORAGE_CONFIG.historyDir, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;

      try {
        const content = await fs.readFile(filePath, 'utf8');
        const guide: FileGuideEntry = JSON.parse(content);
        locations.add(guide.locationName);

        const createdTime = new Date(guide.createdAt).getTime();
        if (createdTime < oldestTime) {
          oldestTime = createdTime;
          oldestFile = guide.locationName;
        }
        if (createdTime > newestTime) {
          newestTime = createdTime;
          newestFile = guide.locationName;
        }
      } catch (parseError) {
        // 파싱 오류 무시
      }
    }

    const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      totalFiles: jsonFiles.length,
      totalSize: formatSize(totalSize),
      locations: Array.from(locations),
      oldestFile,
      newestFile
    };

  } catch (error) {
    console.error('❌ 저장소 정보 조회 실패:', error);
    return {
      totalFiles: 0,
      totalSize: '0 B',
      locations: [],
      oldestFile: '',
      newestFile: ''
    };
  }
}

// GET: 히스토리 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 여기서는 모든 사용자의 최근 50개 히스토리를 가져옵니다.
    // 만약 로그인한 사용자의 히스토리만 보여주려면 where 조건에 userId를 추가합니다.
    const guides = await prisma.guideHistory.findMany({
      orderBy: {
        generatedAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        originalLocationName: true,
        language: true,
        generatedAt: true,
        // 필요하다면 guideData의 일부를 가져와 preivew를 만들 수 있습니다.
        // 여기서는 예시로 간단한 정보를 반환합니다.
      }
    });

    const formattedGuides = guides.map(guide => ({
        fileName: guide.id, // 고유 식별자로 fileName을 대체
        locationName: guide.originalLocationName,
        generatedAt: guide.generatedAt.toISOString(),
        preview: `A tour guide for ${guide.originalLocationName} in ${guide.language}.`, // 간단한 미리보기
        language: guide.language
    }));

    return NextResponse.json({ success: true, guides: formattedGuides });
  } catch (error) {
    console.error('Failed to fetch guide history:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch guide history' }, { status: 500 });
  }
}

// DELETE: 가이드 삭제
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await req.json(); // 이제 fileName 대신 id를 받음

        if (!id) {
            return NextResponse.json({ success: false, error: 'Guide ID is required' }, { status: 400 });
        }
        
        // 사용자가 자신의 히스토리만 삭제할 수 있도록 검증 (선택적이지만 권장)
        const guideToDelete = await prisma.guideHistory.findUnique({
            where: { id },
        });

        if (!guideToDelete || guideToDelete.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Not found or not authorized' }, { status: 404 });
        }

        await prisma.guideHistory.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'History item deleted' });
    } catch (error) {
        console.error('Failed to delete guide history:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete guide history' }, { status: 500 });
    }
} 