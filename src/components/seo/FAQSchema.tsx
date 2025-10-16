interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  language?: 'ko' | 'en' | 'ja' | 'zh' | 'es';
}

export default function FAQSchema({ faqs, language = 'ko' }: FAQSchemaProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq, index) => ({
      "@type": "Question",
      "@id": `#faq-${index}`,
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    })),
    "inLanguage": language,
    "about": {
      "@type": "Service",
      "name": "TripRadio.AI 여행 오디오가이드",
      "description": "AI-powered personalized travel docent service"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema, null, 2)
      }}
    />
  );
}

// 기본 FAQ 데이터 - 다국어 지원
export const getDefaultFAQs = (language: 'ko' | 'en' | 'ja' | 'zh' | 'es' = 'ko'): FAQItem[] => {
  const faqs = {
    ko: [
      {
        question: "TripRadio.AI는 무료인가요?",
        answer: "네, TripRadio.AI는 완전 무료로 사용할 수 있습니다. AI가 생성하는 개인 맞춤형 여행 오디오가이드를 별도 비용 없이 이용하실 수 있습니다."
      },
      {
        question: "어떤 언어를 지원하나요?",
        answer: "한국어, 영어, 일본어, 중국어, 스페인어 총 5개 언어를 지원합니다."
      },
      {
        question: "가이드는 어떻게 생성되나요?",
        answer: "AI가 사용자의 성향과 선호도를 분석하여 개인 맞춤형 여행 가이드를 실시간으로 생성합니다."
      },
      {
        question: "오프라인에서도 사용할 수 있나요?",
        answer: "생성된 가이드는 오프라인에서도 이용 가능하며, 음성 재생 기능도 지원됩니다."
      },
      {
        question: "즐겨찾기 기능이 있나요?",
        answer: "네, 마음에 드는 가이드를 즐겨찾기에 저장하여 나중에 다시 볼 수 있습니다."
      }
    ],
    en: [
      {
        question: "What is TripRadio.AI?",
        answer: "TripRadio.AI is an AI-powered personalized travel docent service that provides perfect travel experiences with real-time voice guides and multilingual support."
      },
      {
        question: "What languages are supported?",
        answer: "We support 5 languages: Korean, English, Japanese, Chinese, and Spanish."
      },
      {
        question: "How are guides generated?",
        answer: "AI analyzes user preferences and tendencies to generate personalized travel guides in real-time."
      },
      {
        question: "Can it be used offline?",
        answer: "Generated guides are available offline, and voice playback functionality is also supported."
      },
      {
        question: "Is there a bookmark feature?",
        answer: "Yes, you can save favorite guides to bookmarks for later viewing."
      }
    ],
    ja: [
      {
        question: "TripRadio.AIとは何ですか？",
        answer: "TripRadio.AIは、AI駆動型のパーソナライズド旅行ドーセントサービスです。リアルタイム音声ガイドと多言語サポートで完璧な旅行体験を提供します。"
      },
      {
        question: "どの言語がサポートされていますか？",
        answer: "韓国語、英語、日本語、中国語、スペイン語の計5言語をサポートしています。"
      },
      {
        question: "ガイドはどのように生成されますか？",
        answer: "AIがユーザーの好みと傾向を分析し、個人に合わせた旅行ガイドをリアルタイムで生成します。"
      },
      {
        question: "オフラインでも使用できますか？",
        answer: "生成されたガイドはオフラインでも利用可能で、音声再生機能もサポートされています。"
      },
      {
        question: "ブックマーク機能はありますか？",
        answer: "はい、お気に入りのガイドをブックマークに保存して後で見ることができます。"
      }
    ],
    zh: [
      {
        question: "TripRadio.AI是什么？",
        answer: "TripRadio.AI是基于AI的个性化旅行导览服务，通过实时语音导览和多语言支持提供完美的旅行体验。"
      },
      {
        question: "支持哪些语言？",
        answer: "我们支持5种语言：韩语、英语、日语、中文和西班牙语。"
      },
      {
        question: "导览是如何生成的？",
        answer: "AI分析用户的偏好和倾向，实时生成个性化的旅行导览。"
      },
      {
        question: "可以离线使用吗？",
        answer: "生成的导览可以离线使用，也支持语音播放功能。"
      },
      {
        question: "有收藏功能吗？",
        answer: "是的，您可以将喜欢的导览保存到收藏夹中以便稍后查看。"
      }
    ],
    es: [
      {
        question: "¿Qué es TripRadio.AI?",
        answer: "TripRadio.AI es un servicio de guía turístico personalizado basado en IA que proporciona experiencias de viaje perfectas con guías de voz en tiempo real y soporte multiidioma."
      },
      {
        question: "¿Qué idiomas se admiten?",
        answer: "Admitimos 5 idiomas: coreano, inglés, japonés, chino y español."
      },
      {
        question: "¿Cómo se generan las guías?",
        answer: "La IA analiza las preferencias y tendencias del usuario para generar guías de viaje personalizadas en tiempo real."
      },
      {
        question: "¿Se puede usar sin conexión?",
        answer: "Las guías generadas están disponibles sin conexión y también se admite la funcionalidad de reproducción de voz."
      },
      {
        question: "¿Hay una función de marcadores?",
        answer: "Sí, puedes guardar las guías favoritas en marcadores para verlas más tarde."
      }
    ]
  };

  return faqs[language] || faqs.ko;
};