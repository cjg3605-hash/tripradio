import textToSpeech from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT!);

const ttsClient = new textToSpeech.TextToSpeechClient({ credentials, projectId: process.env.GCP_PROJECT_ID });
const storage = new Storage({ credentials, projectId: process.env.GCP_PROJECT_ID });
const bucket = storage.bucket(process.env.GCS_BUCKET!);

function getAudioFileName(locationName: string, language: string, text: string) {
  const hash = crypto.createHash('md5').update(text).digest('hex');
  return `audio/guides/${locationName}-${language}-${hash}.mp3`;
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
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode: langCode, ssmlGender: 'NEUTRAL' },
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
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
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