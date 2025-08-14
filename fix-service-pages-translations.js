const fs = require('fs');
const path = require('path');

// translations.json 파일 읽기
const translationsPath = path.join(__dirname, 'public/locales/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// 누락된 서비스 페이지 번역 키들
const serviceTranslations = {
  ko: {
    audioGuide: {
      meta: {
        keyword: "AI 오디오가이드",
        title: "AI 오디오가이드 | 무료 음성 여행 안내",
        description: "AI가 제공하는 개인 맞춤형 오디오가이드로 전 세계 여행지를 더 깊이 경험하세요. 무료로 이용 가능합니다."
      },
      hero: {
        badge: "AI Audio Guide • Smart Travel",
        title: "AI와 함께하는",
        titleBold: "스마트 오디오가이드",
        description: "전 세계 어디서든 AI가 실시간으로 생성하는 개인 맞춤형 오디오가이드를 경험하세요.",
        startFree: "무료로 시작하기",
        exploreFeatures: "기능 알아보기"
      },
      features: {
        title: "오디오가이드의",
        titleBold: "새로운 경험",
        aiRealTime: {
          title: "AI 실시간 생성",
          description: "현재 위치와 관심사에 맞춰 AI가 실시간으로 맞춤형 해설을 생성합니다."
        },
        personalized: {
          title: "개인 맞춤형",
          description: "당신의 여행 스타일과 관심분야에 완벽하게 맞춘 개인 전용 가이드입니다."
        },
        worldwide: {
          title: "전세계 지원",
          description: "180개국 이상의 여행지에서 현지 정보와 문화를 생생하게 들려드립니다."
        },
        free: {
          title: "완전 무료",
          description: "모든 기본 기능을 무료로 이용하실 수 있습니다. 부담 없이 시작하세요."
        },
        multiLanguage: {
          title: "다국어 지원",
          description: "한국어, 영어, 일본어, 중국어 등 다양한 언어로 오디오가이드를 제공합니다."
        },
        offline: {
          title: "오프라인 지원",
          description: "미리 다운로드하여 인터넷 없이도 오디오가이드를 즐길 수 있습니다."
        }
      },
      comparison: {
        title: "기존 가이드와",
        titleBold: "무엇이 다른가요?",
        existing: {
          title: "기존 오디오가이드",
          items: [
            "정해진 스크립트로 획일적인 해설",
            "개인 취향을 고려하지 않는 일방적 정보",
            "제한적인 언어와 지역 지원",
            "높은 이용 비용과 복잡한 절차",
            "인터넷 연결 필수로 불편함"
          ]
        },
        tripRadio: {
          title: "TripRadio AI 오디오가이드",
          items: [
            "AI가 실시간으로 생성하는 맞춤형 해설",
            "개인 관심사와 여행 스타일 반영",
            "전세계 180개국 다국어 지원",
            "완전 무료로 부담 없는 이용",
            "오프라인 다운로드로 언제든 청취"
          ]
        }
      },
      cta: {
        title: "지금 바로 AI 오디오가이드를 경험해보세요",
        description: "무료로 전 세계 어디든 떠나는 특별한 여행이 시작됩니다.",
        startFree: "무료로 시작하기"
      }
    }
  },
  en: {
    audioGuide: {
      meta: {
        keyword: "AI Audio Guide",
        title: "AI Audio Guide | Free Voice Travel Guide",
        description: "Experience destinations deeper with AI-powered personalized audio guides. Available worldwide for free."
      },
      hero: {
        badge: "AI Audio Guide • Smart Travel",
        title: "Travel with AI",
        titleBold: "Smart Audio Guide",
        description: "Experience personalized audio guides generated in real-time by AI anywhere in the world.",
        startFree: "Start for Free",
        exploreFeatures: "Explore Features"
      },
      features: {
        title: "New Experience of",
        titleBold: "Audio Guide",
        aiRealTime: {
          title: "AI Real-time Generation",
          description: "AI generates customized commentary in real-time based on your location and interests."
        },
        personalized: {
          title: "Personalized",
          description: "Your personal guide perfectly tailored to your travel style and interests."
        },
        worldwide: {
          title: "Global Support",
          description: "Vivid local information and culture from over 180 countries worldwide."
        },
        free: {
          title: "Completely Free",
          description: "All basic features are available for free. Start without any burden."
        },
        multiLanguage: {
          title: "Multi-language Support",
          description: "Audio guides available in various languages including Korean, English, Japanese, and Chinese."
        },
        offline: {
          title: "Offline Support",
          description: "Download in advance and enjoy audio guides without internet connection."
        }
      },
      comparison: {
        title: "What Makes It",
        titleBold: "Different?",
        existing: {
          title: "Traditional Audio Guide",
          items: [
            "Uniform commentary with fixed scripts",
            "One-way information without personal consideration",
            "Limited language and regional support",
            "High usage costs and complex procedures",
            "Internet connection required causing inconvenience"
          ]
        },
        tripRadio: {
          title: "TripRadio AI Audio Guide",
          items: [
            "Customized commentary generated in real-time by AI",
            "Reflects personal interests and travel style",
            "Multi-language support for 180 countries worldwide",
            "Completely free with no burden",
            "Offline download for anytime listening"
          ]
        }
      },
      cta: {
        title: "Experience AI Audio Guide Right Now",
        description: "A special journey to anywhere in the world starts for free.",
        startFree: "Start for Free"
      }
    }
  },
  ja: {
    audioGuide: {
      meta: {
        keyword: "AIオーディオガイド",
        title: "AIオーディオガイド | 無料音声旅行案内",
        description: "AIが提供する個人向けカスタムオーディオガイドで世界中の旅行先をより深く体験してください。無料で利用可能です。"
      },
      hero: {
        badge: "AIオーディオガイド • スマート旅行",
        title: "AIと一緒に",
        titleBold: "スマートオーディオガイド",
        description: "世界のどこでもAIがリアルタイムで生成する個人向けカスタムオーディオガイドを体験してください。",
        startFree: "無料で開始",
        exploreFeatures: "機能を知る"
      },
      features: {
        title: "オーディオガイドの",
        titleBold: "新しい体験",
        aiRealTime: {
          title: "AIリアルタイム生成",
          description: "現在位置と関心事に合わせてAIがリアルタイムでカスタム解説を生成します。"
        },
        personalized: {
          title: "個人向けカスタム",
          description: "あなたの旅行スタイルと関心分野に完璧に合わせた個人専用ガイドです。"
        },
        worldwide: {
          title: "世界対応",
          description: "180ヶ国以上の旅行先で現地情報と文化を生き生きとお伝えします。"
        },
        free: {
          title: "完全無料",
          description: "すべての基本機能を無料でご利用いただけます。負担なく開始してください。"
        },
        multiLanguage: {
          title: "多言語対応",
          description: "韓国語、英語、日本語、中国語など様々な言語でオーディオガイドを提供します。"
        },
        offline: {
          title: "オフライン対応",
          description: "事前にダウンロードしてインターネットなしでもオーディオガイドを楽しめます。"
        }
      },
      comparison: {
        title: "既存ガイドと",
        titleBold: "何が違うのですか？",
        existing: {
          title: "既存オーディオガイド",
          items: [
            "決まったスクリプトで画一的な解説",
            "個人の好みを考慮しない一方的な情報",
            "限定的な言語と地域サポート",
            "高い利用費用と複雑な手続き",
            "インターネット接続必須で不便"
          ]
        },
        tripRadio: {
          title: "TripRadio AIオーディオガイド",
          items: [
            "AIがリアルタイムで生成するカスタム解説",
            "個人の関心事と旅行スタイル反映",
            "世界180ヶ国多言語サポート",
            "完全無料で負担のない利用",
            "オフラインダウンロードでいつでも視聴"
          ]
        }
      },
      cta: {
        title: "今すぐAIオーディオガイドを体験してみてください",
        description: "無料で世界のどこへでも出かける特別な旅が始まります。",
        startFree: "無料で開始"
      }
    }
  },
  zh: {
    audioGuide: {
      meta: {
        keyword: "AI语音导览",
        title: "AI语音导览 | 免费语音旅行指南",
        description: "通过AI提供的个人定制语音导览，更深入地体验全球旅行目的地。免费使用。"
      },
      hero: {
        badge: "AI语音导览 • 智能旅行",
        title: "与AI一起",
        titleBold: "智能语音导览",
        description: "在世界任何地方体验AI实时生成的个人定制语音导览。",
        startFree: "免费开始",
        exploreFeatures: "了解功能"
      },
      features: {
        title: "语音导览的",
        titleBold: "全新体验",
        aiRealTime: {
          title: "AI实时生成",
          description: "AI根据您的位置和兴趣实时生成定制解说。"
        },
        personalized: {
          title: "个人定制",
          description: "完美适配您的旅行风格和兴趣领域的个人专属导游。"
        },
        worldwide: {
          title: "全球支持",
          description: "来自180多个国家的生动当地信息和文化介绍。"
        },
        free: {
          title: "完全免费",
          description: "所有基本功能免费使用。无负担开始。"
        },
        multiLanguage: {
          title: "多语言支持",
          description: "提供韩语、英语、日语、中文等多种语言的语音导览。"
        },
        offline: {
          title: "离线支持",
          description: "提前下载，即使没有网络也能享受语音导览。"
        }
      },
      comparison: {
        title: "与现有导览",
        titleBold: "有什么不同？",
        existing: {
          title: "传统语音导览",
          items: [
            "固定脚本的统一解说",
            "不考虑个人喜好的单向信息",
            "有限的语言和地区支持",
            "高昂的使用费用和复杂程序",
            "必须联网造成不便"
          ]
        },
        tripRadio: {
          title: "TripRadio AI语音导览",
          items: [
            "AI实时生成的定制解说",
            "反映个人兴趣和旅行风格",
            "全球180个国家多语言支持",
            "完全免费无负担使用",
            "离线下载随时收听"
          ]
        }
      },
      cta: {
        title: "立即体验AI语音导览",
        description: "免费前往世界任何地方的特殊旅程即将开始。",
        startFree: "免费开始"
      }
    }
  },
  es: {
    audioGuide: {
      meta: {
        keyword: "Guía de Audio AI",
        title: "Guía de Audio AI | Guía de Viaje de Voz Gratuita",
        description: "Experimenta destinos más profundamente con guías de audio personalizadas impulsadas por IA. Disponible mundialmente gratis."
      },
      hero: {
        badge: "Guía de Audio AI • Viaje Inteligente",
        title: "Viajar con IA",
        titleBold: "Guía de Audio Inteligente",
        description: "Experimenta guías de audio personalizadas generadas en tiempo real por IA en cualquier parte del mundo.",
        startFree: "Comenzar Gratis",
        exploreFeatures: "Explorar Características"
      },
      features: {
        title: "Nueva Experiencia de",
        titleBold: "Guía de Audio",
        aiRealTime: {
          title: "Generación en Tiempo Real de IA",
          description: "La IA genera comentarios personalizados en tiempo real basados en tu ubicación e intereses."
        },
        personalized: {
          title: "Personalizada",
          description: "Tu guía personal perfectamente adaptada a tu estilo de viaje e intereses."
        },
        worldwide: {
          title: "Soporte Global",
          description: "Información local vívida y cultura de más de 180 países mundialmente."
        },
        free: {
          title: "Completamente Gratis",
          description: "Todas las características básicas están disponibles gratis. Comienza sin ninguna carga."
        },
        multiLanguage: {
          title: "Soporte Multi-idioma",
          description: "Guías de audio disponibles en varios idiomas incluyendo coreano, inglés, japonés y chino."
        },
        offline: {
          title: "Soporte Sin Conexión",
          description: "Descarga por adelantado y disfruta guías de audio sin conexión a internet."
        }
      },
      comparison: {
        title: "¿Qué Lo Hace",
        titleBold: "Diferente?",
        existing: {
          title: "Guía de Audio Tradicional",
          items: [
            "Comentario uniforme con guiones fijos",
            "Información unidireccional sin consideración personal",
            "Soporte limitado de idioma y regional",
            "Altos costos de uso y procedimientos complejos",
            "Conexión a internet requerida causando inconvenientes"
          ]
        },
        tripRadio: {
          title: "Guía de Audio TripRadio AI",
          items: [
            "Comentario personalizado generado en tiempo real por IA",
            "Refleja intereses personales y estilo de viaje",
            "Soporte multi-idioma para 180 países mundialmente",
            "Completamente gratis sin carga",
            "Descarga sin conexión para escuchar en cualquier momento"
          ]
        }
      },
      cta: {
        title: "Experimenta la Guía de Audio AI Ahora Mismo",
        description: "Un viaje especial a cualquier parte del mundo comienza gratis.",
        startFree: "Comenzar Gratis"
      }
    }
  }
};

// 기존 번역에 새로운 번역 추가
function addServiceTranslations() {
  Object.keys(serviceTranslations).forEach(lang => {
    if (!translations[lang]) {
      translations[lang] = {};
    }
    
    Object.keys(serviceTranslations[lang]).forEach(service => {
      translations[lang][service] = serviceTranslations[lang][service];
    });
  });

  return translations;
}

// 업데이트된 translations 저장
function saveServiceTranslations() {
  const updatedTranslations = addServiceTranslations();
  
  // 백업 생성
  const backupPath = path.join(__dirname, `translations-services-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(translations, null, 2));
  
  // 업데이트된 파일 저장
  fs.writeFileSync(translationsPath, JSON.stringify(updatedTranslations, null, 2));
  
  console.log('✅ 서비스 페이지 번역이 추가되었습니다!');
  console.log(`📁 백업 파일: ${backupPath}`);
  console.log('📝 추가된 서비스:');
  console.log('  - audioGuide: 오디오가이드 페이지 번역 (5개 언어)');
  console.log('📝 다음 단계:');
  console.log('1. 다른 서비스 페이지들의 번역 추가');
  console.log('2. 빌드 테스트');
  console.log('3. 페이지 접속 테스트');
}

saveServiceTranslations();