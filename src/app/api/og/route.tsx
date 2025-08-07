import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const title = searchParams.get('title') || 'NaviDocent';
  const location = searchParams.get('location') || '';
  const type = searchParams.get('type') || 'guide';
  const lang = searchParams.get('lang') || 'ko';

  // 언어별 텍스트 설정
  const texts = {
    ko: {
      subtitle: 'AI 개인 맞춤형 여행 가이드',
      guide: '가이드',
      location: '위치'
    },
    en: {
      subtitle: 'AI Personalized Travel Guide',
      guide: 'Guide', 
      location: 'Location'
    },
    ja: {
      subtitle: 'AI個人向け旅行ガイド',
      guide: 'ガイド',
      location: '場所'
    },
    zh: {
      subtitle: 'AI个人定制旅行指南',
      guide: '导览',
      location: '地点'
    },
    es: {
      subtitle: 'Guía de Viaje Personalizada con IA',
      guide: 'Guía',
      location: 'Ubicación'
    }
  };

  const t = texts[lang as keyof typeof texts] || texts.ko;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)`,
          }}
        />

        {/* Main Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '900px',
            padding: '80px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '20px',
              letterSpacing: '-2px',
            }}
          >
            NaviDocent
          </div>

          {/* Main Title */}
          <div
            style={{
              fontSize: location ? '64px' : '72px',
              fontWeight: 'bold',
              marginBottom: '24px',
              lineHeight: 1.2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {title}
          </div>

          {/* Location Info */}
          {location && (
            <div
              style={{
                fontSize: '36px',
                fontWeight: '300',
                marginBottom: '32px',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <span style={{ opacity: 0.7 }}>📍</span>
              {location}
            </div>
          )}

          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: '300',
              opacity: 0.8,
              marginBottom: '40px',
              letterSpacing: '1px',
            }}
          >
            {t.subtitle}
          </div>

          {/* Decorative Element */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              opacity: 0.6,
            }}
          >
            <div
              style={{
                width: '60px',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.5)',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.7)',
              }}
            />
            <div
              style={{
                width: '60px',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.5)',
              }}
            />
          </div>
        </div>

        {/* Bottom Brand Line */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '18px',
            opacity: 0.5,
            fontWeight: '300',
            letterSpacing: '2px',
          }}
        >
          AI-POWERED TRAVEL EXPERIENCE
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}