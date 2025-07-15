import textToSpeech from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

// 환경 변수 안전 체크
const gcpServiceAccount = process.env.GCP_SERVICE_ACCOUNT;
if (!gcpServiceAccount) {
  console.warn('⚠️ GCP_SERVICE_ACCOUNT 환경 변수가 설정되지 않았습니다. TTS 기능이 비활성화됩니다.');
}

const credentials = gcpServiceAccount ? JSON.parse(gcpServiceAccount) : null;

// credentials가 없으면 null로 초기화 (빌드 시 오류 방지)
const ttsClient = credentials ? new textToSpeech.TextToSpeechClient({ credentials, projectId: process.env.GCP_PROJECT_ID }) : null;
const storage = credentials ? new Storage({ credentials, projectId: process.env.GCP_PROJECT_ID }) : null;
const bucket = storage ? storage.bucket(process.env.GCS_BUCKET!) : null;

// WaveNet 음성 맵 (언어별)
const WAVENET_VOICES: Record<string, string> = {
  'ko-KR': 'ko-KR-Wavenet-A',
  'en-US': 'en-US-Wavenet-D',
  'ja-JP': 'ja-JP-Wavenet-B',
  'zh-CN': 'cmn-CN-Wavenet-A',
  'es-ES': 'es-ES-Wavenet-A',
};

function getAudioFileName(locationName: string, language: string, text: string) {
  const hash = crypto.createHash('md5').update(text).digest('hex');
  return `audio/guides/${locationName}-${language}-${hash}.mp3`;
}

// TTS로 넘기기 전 텍스트에서 ➡️와 그 뒤의 공백을 모두 제거
function cleanTtsText(text: string): string {
  return text.replace(/➡️\s*/g, '');
}

export async function getOrCreateTTSAndUrl(text: string, locationName: string, language = 'ko-KR') {
  // TTS 클라이언트가 초기화되지 않은 경우 오류 반환
  if (!ttsClient || !bucket) {
    throw new Error('TTS 서비스가 설정되지 않았습니다. GCP 환경 변수를 확인해주세요.');
  }

  const langCode = language;
  const fileName = getAudioFileName(locationName, langCode, text);
  const file = bucket.file(fileName);
  const [exists] = await file.exists();
  if (exists) {
    // 이미 존재하면 URL만 반환
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  }
  // 새로 생성
  const cleanedText = cleanTtsText(text);
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text: cleanedText },
    voice: {
      languageCode: langCode,
      name: WAVENET_VOICES[langCode] || undefined,
      ssmlGender: 'NEUTRAL',
    },
    audioConfig: { audioEncoding: 'MP3' },
  });
  if (!response.audioContent) throw new Error('TTS 생성 실패');
  await file.save(response.audioContent as Buffer, {
    contentType: 'audio/mpeg',
    resumable: false,
  });
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// 기존 함수는 deprecated 처리
export async function generateTTSAndUpload(text: string, fileName: string, lang = 'ko-KR') {
  // TTS 클라이언트가 초기화되지 않은 경우 오류 반환
  if (!ttsClient || !bucket) {
    throw new Error('TTS 서비스가 설정되지 않았습니다. GCP 환경 변수를 확인해주세요.');
  }

  // deprecated: getOrCreateTTSAndUrl을 사용하세요
  const cleanedText = cleanTtsText(text);
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text: cleanedText },
    voice: {
      languageCode: lang,
      name: WAVENET_VOICES[lang] || undefined,
      ssmlGender: 'NEUTRAL',
    },
    audioConfig: { audioEncoding: 'MP3' },
  });
  if (!response.audioContent) throw new Error('TTS 생성 실패');
  const file = bucket.file(fileName);
  await file.save(response.audioContent as Buffer, {
    contentType: 'audio/mpeg',
    resumable: false,
  });
  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
} 