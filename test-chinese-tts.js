// 중국어 TTS 모델 직접 테스트 스크립트
require('dotenv').config({ path: '.env.local' });
const https = require('https');

async function testChineseTTS() {
  console.log('🎯 중국어 TTS 모델 직접 테스트 시작...');
  
  // 환경변수 확인
  const serviceAccountJson = process.env.GCP_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    console.error('❌ GCP_SERVICE_ACCOUNT 환경변수가 없습니다');
    return;
  }

  try {
    // 액세스 토큰 획득
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      credentials: JSON.parse(serviceAccountJson),
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log('✅ 액세스 토큰 획득 성공');

    // 중국어 TTS 요청 구성 (ASCII 텍스트로 테스트)
    const requestBody = {
      input: {
        text: "Hello, this is a test for Chinese TTS voice model with Wavenet-D."
      },
      voice: {
        languageCode: 'cmn-CN',
        name: 'cmn-CN-Wavenet-D',
        ssmlGender: 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95,
        pitch: -1.0,
        volumeGainDb: 1.0
      }
    };

    console.log('📤 중국어 TTS API 요청:', {
      voice: requestBody.voice,
      audioConfig: requestBody.audioConfig
    });

    // Google Cloud TTS API 호출 (Node.js 내장 https 사용)
    const data = JSON.stringify(requestBody);
    const options = {
      hostname: 'texttospeech.googleapis.com',
      path: '/v1/text:synthesize',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            console.error('❌ 중국어 TTS API 호출 실패:', {
              status: res.statusCode,
              statusMessage: res.statusMessage,
              error: body
            });
            reject(new Error(`API 호출 실패: ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    
    if (result.audioContent) {
      console.log('✅ 중국어 TTS 생성 성공!', {
        audioSize: result.audioContent.length,
        voice: 'cmn-CN-Neural2-A',
        language: 'cmn-CN'
      });
    } else {
      console.error('❌ 오디오 콘텐츠 없음:', result);
    }

  } catch (error) {
    console.error('❌ 중국어 TTS 테스트 실패:', error.message);
  }
}

testChineseTTS();