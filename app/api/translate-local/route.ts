// Microsoft Translator API 연동
import { NextRequest, NextResponse } from 'next/server';

const TRANSLATOR_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';
const TRANSLATOR_KEY = process.env.MICROSOFT_TRANSLATOR_KEY;
const TRANSLATOR_REGION = process.env.MICROSOFT_TRANSLATOR_REGION || 'koreacentral';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'ko' } = await request.json();
    
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: '텍스트와 목표 언어가 필요합니다' },
        { status: 400 }
      );
    }
    
    if (!TRANSLATOR_KEY) {
      console.error('❌ Microsoft Translator API 키가 설정되지 않음');
      return NextResponse.json({
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        originalText: text,
        fallback: true,
        error: 'API 키가 설정되지 않음'
      });
    }
    
    console.log(`🌐 Microsoft Translator 번역 요청: ${text} (${sourceLanguage} → ${targetLanguage})`);
    
    // Microsoft Translator API 호출
    const response = await fetch(
      `${TRANSLATOR_ENDPOINT}/translate?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': TRANSLATOR_KEY,
          'Ocp-Apim-Subscription-Region': TRANSLATOR_REGION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ text }])
      }
    );
    
    if (!response.ok) {
      throw new Error(`Microsoft Translator API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    const translatedText = data[0]?.translations?.[0]?.text;
    
    if (!translatedText) {
      console.warn('⚠️ 번역 결과가 없음, 원본 반환');
      return NextResponse.json({
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        originalText: text,
        fallback: true
      });
    }
    
    console.log(`✅ 번역 완료: ${text} → ${translatedText}`);
    
    return NextResponse.json({
      translatedText,
      sourceLanguage,
      targetLanguage,
      originalText: text,
      fallback: false
    });
    
  } catch (error) {
    console.error('❌ Microsoft Translator 번역 오류:', error);
    
    // 폴백: 원본 텍스트 반환
    const { text = '', targetLanguage = 'en', sourceLanguage = 'ko' } = await request.json().catch(() => ({}));
    
    return NextResponse.json({
      translatedText: text,
      sourceLanguage,
      targetLanguage,
      originalText: text,
      fallback: true,
      error: '번역 API 호출 실패'
    });
  }
}