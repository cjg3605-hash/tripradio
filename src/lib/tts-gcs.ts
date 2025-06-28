import textToSpeech from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT!);

const ttsClient = new textToSpeech.TextToSpeechClient({ credentials, projectId: process.env.GCP_PROJECT_ID });
const storage = new Storage({ credentials, projectId: process.env.GCP_PROJECT_ID });
const bucket = storage.bucket(process.env.GCS_BUCKET!);

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