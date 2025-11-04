const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/audio/ChapterBasedPodcastGenerator.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. usePodcastVersion import 추가
if (!content.includes('usePodcastVersion')) {
  content = content.replace(
    'import { useLanguage } from \'@/contexts/LanguageContext\';',
    `import { useLanguage } from '@/contexts/LanguageContext';
import { usePodcastVersion } from '@/contexts/PodcastVersionContext';`
  );
  console.log('✅ usePodcastVersion import 추가됨');
}

// 2. useLanguage 다음에 usePodcastVersion hook 추가
if (!content.includes('const { version, setStats } = usePodcastVersion()')) {
  content = content.replace(
    'const { t, currentLanguage } = useLanguage();',
    `const { t, currentLanguage } = useLanguage();
  const { version, setStats } = usePodcastVersion();`
  );
  console.log('✅ usePodcastVersion hook 호출 추가됨');
}

// 3. generateFullPodcast 함수 수정
const generateFullPodcastV2 = `
  // V2 통합 생성 (한 번의 API 호출)
  const generateFullPodcastV2 = async () => {
    const startTime = performance.now();
    console.log('🚀 V2 통합 팟캐스트 생성 시작 (단일 API 호출)');

    try {
      setGenerationProgress(10);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch('/api/tts/notebooklm/generate-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName,
          language: language || currentLanguage
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(\`V2 API 오류: \${response.statusText}\`);
      }

      const result = await response.json();
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      if (!result.success) {
        throw new Error(result.error || 'V2 생성 실패');
      }

      console.log('✅ V2 생성 완료:', result.data);

      // 통계 저장
      const stats = {
        generationTime: Math.round(totalTime),
        apiCalls: 1,
        segments: result.data.segments || 0,
        version: 'v2'
      };
      setStats(stats);

      // 데이터 로드
      if (result.data.episodes && result.data.episodes.length > 0) {
        const episodeData = result.data.episodes[0];
        setEpisodeId(episodeData.id);

        // 챕터 정보 설정
        const chapterInfos = (episodeData.chapters || []).map((chapter, idx) => ({
          index: idx,
          title: chapter.title || \`챕터 \${idx}\`,
          description: \`\${chapter.segmentCount || 0}개 세그먼트\`,
          estimatedDuration: chapter.totalDuration || 0,
          estimatedSegments: chapter.segmentCount || 0,
          status: 'completed'
        }));

        setChapters(chapterInfos);
        setIsInitialized(true);
        setChapter0Completed(true);

        // 세그먼트 로드
        if (episodeData.chapters && episodeData.chapters[0]?.files) {
          const segments = episodeData.chapters[0].files.map((file) => ({
            sequenceNumber: file.sequenceNumber,
            speaker: file.speakerType,
            duration: file.duration,
            fileName: \`segment-\${file.sequenceNumber}.mp3\`,
            filePath: file.audioUrl
          }));
          setAllSegments(segments);
        }
      }

      setGenerationProgress(100);
      if (onGenerationComplete) {
        onGenerationComplete(result.data);
      }
    } catch (error) {
      console.error('❌ V2 생성 실패:', error);
      throw error;
    }
  };
`;

// generateFullPodcast 함수 앞에 V2 함수 추가
if (!content.includes('const generateFullPodcastV2')) {
  const insertPos = content.indexOf('  // 전체 생성 프로세스\n  const generateFullPodcast');
  if (insertPos !== -1) {
    content = content.substring(0, insertPos) + generateFullPodcastV2 + '\n' + content.substring(insertPos);
    console.log('✅ generateFullPodcastV2 함수 추가됨');
  }
}

// generateFullPodcast 함수의 try 블록 앞에 V2 체크 추가
const v2Check = `      // V2 선택시 통합 방식 사용
      if (version === 'v2') {
        await generateFullPodcastV2();
        return;
      }

      `;

if (!content.includes('if (version === \'v2\')')) {
  const tryPos = content.indexOf('    try {\n      // 1단계: 초기화');
  if (tryPos !== -1) {
    content = content.substring(0, tryPos + 11) + v2Check + content.substring(tryPos + 11);
    console.log('✅ V2 버전 체크 추가됨');
  }
}

// V1 완료 시 통계 저장 추가
const v1Stats = `
      // V1 통계 저장
      setStats({
        generationTime: 0,
        apiCalls: 7,
        version: 'v1'
      });`;

const finalizePos = content.indexOf('      console.log(\'🎉 전체 팟캐스트 생성 완료!\');');
if (finalizePos !== -1 && !content.includes('// V1 통계 저장')) {
  const afterConsoleLog = content.indexOf('\n', finalizePos) + 1;
  content = content.substring(0, afterConsoleLog) + v1Stats + content.substring(afterConsoleLog);
  console.log('✅ V1 통계 저장 코드 추가됨');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ ChapterBasedPodcastGenerator.tsx 패치 완료!');
