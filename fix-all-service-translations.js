const fs = require('fs');
const path = require('path');

// translations.json 파일 읽기
const translationsPath = path.join(__dirname, 'public/locales/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// 모든 서비스 페이지들의 누락된 번역 키들
const allServiceTranslations = {
  ko: {
    // AI 여행 계획 (ai-travel 페이지용)
    aiTravel: {
      meta: {
        keyword: "AI 여행 계획",
        title: "AI 여행 계획 | 똑똑한 여행 플래너",
        description: "AI가 도와주는 스마트한 여행 계획. 개인 맞춤형 일정부터 예산 관리까지 모든 것을 AI가 처리합니다."
      },
      hero: {
        badge: "AI Travel Planning • Smart Journey",
        title: "AI가 계획하는",
        subtitle: "완벽한 여행",
        description: "복잡한 여행 계획, 이제 AI에게 맡기세요. 당신의 취향과 예산을 고려한 최적의 여행 계획을 제공합니다."
      },
      aiFeatures: {
        intelligentContent: {
          title: "지능형 콘텐츠",
          description: "AI가 수집한 최신 정보로 구성된 믿을 수 있는 여행 가이드"
        },
        personalization: {
          title: "개인 맞춤화",
          description: "당신의 여행 스타일과 선호도를 학습하여 최적화된 추천"
        },
        locationRecognition: {
          title: "위치 인식",
          description: "현재 위치를 기반으로 실시간 맞춤형 정보 제공"
        },
        voiceSynthesis: {
          title: "음성 합성",
          description: "자연스러운 음성으로 편안하게 듣는 여행 가이드"
        },
        dataIntegration: {
          title: "데이터 통합",
          description: "다양한 소스의 여행 정보를 실시간으로 통합하여 제공"
        },
        continuousLearning: {
          title: "지속적 학습",
          description: "사용자 피드백을 통해 계속 발전하는 AI 시스템"
        }
      }
    },

    // 노마드 계산기 (nomad-calculator 페이지용)
    nomadCalculator: {
      meta: {
        keyword: "노마드 계산기",
        title: "디지털 노마드 계산기 | 생활비 비교",
        description: "전 세계 도시의 디지털 노마드 생활비를 비교하고 최적의 거주지를 찾아보세요."
      },
      hero: {
        title: "디지털 노마드를 위한",
        subtitle: "생활비 계산기",
        description: "전 세계 인기 노마드 도시들의 실제 생활비를 비교하여 최적의 거주지를 찾아보세요."
      },
      cities: {
        lisbon: {
          name: "리스본",
          country: "포르투갈",
          highlights: {
            timezone: "완벽한 시간대",
            community: "노마드 커뮤니티",
            weather: "온화한 기후"
          }
        },
        berlin: {
          name: "베를린",
          country: "독일",
          highlights: {
            startup: "스타트업 허브",
            culture: "풍부한 문화",
            beer: "맥주 천국"
          }
        },
        canggu: {
          name: "창구",
          country: "인도네시아",
          highlights: {
            lowCost: "저렴한 생활비",
            beach: "해변 생활",
            surfing: "서핑 천국"
          }
        },
        chiangmai: {
          name: "치앙마이",
          country: "태국",
          highlights: {
            ultraLowCost: "초저가 생활비",
            temple: "사원과 문화",
            food: "맛있는 음식"
          }
        }
      }
    },

    // 영화 촬영지 (film-locations 페이지용)  
    filmLocations: {
      meta: {
        keyword: "영화 촬영지",
        title: "영화 촬영지 여행 | 영화 속 그 장소로",
        description: "좋아하는 영화의 촬영지를 직접 방문해보세요. 영화 속 장면을 현실에서 경험할 수 있습니다."
      },
      hero: {
        title: "영화 속 그 장소로",
        subtitle: "떠나는 여행",
        description: "좋아하는 영화의 촬영지를 찾아 떠나는 특별한 여행을 계획해보세요."
      }
    },

    // 비자 체커 (visa-checker 페이지용)
    visaChecker: {
      meta: {
        keyword: "비자 체커",
        title: "비자 체커 | 여행 전 비자 요건 확인",
        description: "전 세계 여행지의 비자 요건을 쉽고 빠르게 확인하세요. 무비자, 도착비자, 사전비자 정보를 제공합니다."
      },
      hero: {
        title: "여행 전 필수",
        subtitle: "비자 요건 체크",
        description: "목적지별 비자 요건을 미리 확인하여 안전하고 준비된 여행을 떠나세요."
      }
    }
  },
  
  en: {
    aiTravel: {
      meta: {
        keyword: "AI Travel Planning",
        title: "AI Travel Planning | Smart Travel Planner",
        description: "Smart travel planning with AI assistance. From personalized itineraries to budget management, AI handles everything."
      },
      hero: {
        badge: "AI Travel Planning • Smart Journey",
        title: "AI-Planned",
        subtitle: "Perfect Travel",
        description: "Leave complex travel planning to AI. We provide optimal travel plans considering your preferences and budget."
      },
      aiFeatures: {
        intelligentContent: {
          title: "Intelligent Content",
          description: "Reliable travel guides composed of latest information collected by AI"
        },
        personalization: {
          title: "Personalization",
          description: "Optimized recommendations by learning your travel style and preferences"
        },
        locationRecognition: {
          title: "Location Recognition",
          description: "Real-time customized information based on current location"
        },
        voiceSynthesis: {
          title: "Voice Synthesis",
          description: "Comfortable travel guide listening with natural voice"
        },
        dataIntegration: {
          title: "Data Integration",
          description: "Real-time integration of travel information from various sources"
        },
        continuousLearning: {
          title: "Continuous Learning",
          description: "AI system that continuously evolves through user feedback"
        }
      }
    },

    nomadCalculator: {
      meta: {
        keyword: "Nomad Calculator",
        title: "Digital Nomad Calculator | Cost of Living Comparison",
        description: "Compare cost of living for digital nomads worldwide and find the optimal place to live."
      },
      hero: {
        title: "For Digital Nomads",
        subtitle: "Cost of Living Calculator",
        description: "Compare actual living costs in popular nomad cities worldwide to find your optimal residence."
      },
      cities: {
        lisbon: {
          name: "Lisbon",
          country: "Portugal",
          highlights: {
            timezone: "Perfect Timezone",
            community: "Nomad Community",
            weather: "Mild Climate"
          }
        },
        berlin: {
          name: "Berlin",
          country: "Germany",
          highlights: {
            startup: "Startup Hub",
            culture: "Rich Culture",
            beer: "Beer Paradise"
          }
        },
        canggu: {
          name: "Canggu",
          country: "Indonesia",
          highlights: {
            lowCost: "Low Cost Living",
            beach: "Beach Life",
            surfing: "Surfing Paradise"
          }
        },
        chiangmai: {
          name: "Chiang Mai",
          country: "Thailand",
          highlights: {
            ultraLowCost: "Ultra Low Cost",
            temple: "Temples & Culture",
            food: "Delicious Food"
          }
        }
      }
    },

    filmLocations: {
      meta: {
        keyword: "Film Locations",
        title: "Film Location Travel | Visit Movie Scenes",
        description: "Visit filming locations of your favorite movies. Experience movie scenes in real life."
      },
      hero: {
        title: "Travel to Movie",
        subtitle: "Filming Locations",
        description: "Plan a special trip to filming locations of your favorite movies."
      }
    },

    visaChecker: {
      meta: {
        keyword: "Visa Checker",
        title: "Visa Checker | Check Visa Requirements",
        description: "Easily and quickly check visa requirements for destinations worldwide. Provides visa-free, visa on arrival, and pre-visa information."
      },
      hero: {
        title: "Essential Before Travel",
        subtitle: "Visa Requirements Check",
        description: "Check visa requirements by destination in advance for safe and prepared travel."
      }
    }
  },

  ja: {
    aiTravel: {
      meta: {
        keyword: "AI旅行計画",
        title: "AI旅行計画 | スマート旅行プランナー",
        description: "AIが支援するスマートな旅行計画。個人向けカスタム日程から予算管理まで、AIがすべて処理します。"
      },
      hero: {
        badge: "AI旅行計画 • スマートジャーニー",
        title: "AIが計画する",
        subtitle: "完璧な旅行",
        description: "複雑な旅行計画は、今AIにお任せください。あなたの好みと予算を考慮した最適な旅行計画を提供します。"
      },
      aiFeatures: {
        intelligentContent: {
          title: "知能型コンテンツ",
          description: "AIが収集した最新情報で構成された信頼できる旅行ガイド"
        },
        personalization: {
          title: "個人向けカスタム化",
          description: "あなたの旅行スタイルと好みを学習して最適化された推薦"
        },
        locationRecognition: {
          title: "位置認識",
          description: "現在位置を基盤にリアルタイムカスタム情報提供"
        },
        voiceSynthesis: {
          title: "音声合成",
          description: "自然な音声で快適に聞く旅行ガイド"
        },
        dataIntegration: {
          title: "データ統合",
          description: "様々なソースの旅行情報をリアルタイムで統合して提供"
        },
        continuousLearning: {
          title: "持続的学習",
          description: "ユーザーフィードバックを通じて継続的に発展するAIシステム"
        }
      }
    },

    nomadCalculator: {
      meta: {
        keyword: "ノマド計算機",
        title: "デジタルノマド計算機 | 生活費比較",
        description: "世界中のデジタルノマド生活費を比較して最適な居住地を見つけてください。"
      },
      hero: {
        title: "デジタルノマドのための",
        subtitle: "生活費計算機",
        description: "世界の人気ノマド都市の実際の生活費を比較して最適な居住地を見つけてください。"
      },
      cities: {
        lisbon: {
          name: "リスボン",
          country: "ポルトガル",
          highlights: {
            timezone: "完璧なタイムゾーン",
            community: "ノマドコミュニティ",
            weather: "温暖な気候"
          }
        },
        berlin: {
          name: "ベルリン",
          country: "ドイツ",
          highlights: {
            startup: "スタートアップハブ",
            culture: "豊富な文化",
            beer: "ビール天国"
          }
        },
        canggu: {
          name: "チャングー",
          country: "インドネシア",
          highlights: {
            lowCost: "安い生活費",
            beach: "ビーチ生活",
            surfing: "サーフィン天国"
          }
        },
        chiangmai: {
          name: "チェンマイ",
          country: "タイ",
          highlights: {
            ultraLowCost: "超低価格生活費",
            temple: "寺院と文化",
            food: "美味しい料理"
          }
        }
      }
    },

    filmLocations: {
      meta: {
        keyword: "映画撮影地",
        title: "映画撮影地旅行 | 映画の中のその場所へ",
        description: "好きな映画の撮影地を直接訪問してみてください。映画の中の場面を現実で体験できます。"
      },
      hero: {
        title: "映画の中のその場所へ",
        subtitle: "出かける旅行",
        description: "好きな映画の撮影地を訪ねる特別な旅行を計画してみてください。"
      }
    },

    visaChecker: {
      meta: {
        keyword: "ビザチェッカー",
        title: "ビザチェッカー | 旅行前ビザ要件確認",
        description: "世界中の旅行先のビザ要件を簡単かつ迅速に確認してください。無ビザ、到着ビザ、事前ビザ情報を提供します。"
      },
      hero: {
        title: "旅行前必須",
        subtitle: "ビザ要件チェック",
        description: "目的地別ビザ要件を事前に確認して安全で準備された旅行に出発してください。"
      }
    }
  },

  zh: {
    aiTravel: {
      meta: {
        keyword: "AI旅行规划",
        title: "AI旅行规划 | 智能旅行计划师",
        description: "AI辅助的智能旅行规划。从个性化行程到预算管理，AI处理一切。"
      },
      hero: {
        badge: "AI旅行规划 • 智能旅程",
        title: "AI规划的",
        subtitle: "完美旅行",
        description: "将复杂的旅行规划交给AI。我们提供考虑您的喜好和预算的最优旅行计划。"
      },
      aiFeatures: {
        intelligentContent: {
          title: "智能内容",
          description: "由AI收集的最新信息组成的可靠旅行指南"
        },
        personalization: {
          title: "个性化",
          description: "通过学习您的旅行风格和偏好提供优化推荐"
        },
        locationRecognition: {
          title: "位置识别",
          description: "基于当前位置的实时定制信息提供"
        },
        voiceSynthesis: {
          title: "语音合成",
          description: "用自然语音舒适聆听的旅行指南"
        },
        dataIntegration: {
          title: "数据整合",
          description: "实时整合来自各种来源的旅行信息"
        },
        continuousLearning: {
          title: "持续学习",
          description: "通过用户反馈持续发展的AI系统"
        }
      }
    },

    nomadCalculator: {
      meta: {
        keyword: "数字游民计算器",
        title: "数字游民计算器 | 生活费比较",
        description: "比较全球数字游民生活费，找到最佳居住地。"
      },
      hero: {
        title: "为数字游民",
        subtitle: "生活费计算器",
        description: "比较全球热门游民城市的实际生活费，找到您的最佳居住地。"
      },
      cities: {
        lisbon: {
          name: "里斯本",
          country: "葡萄牙",
          highlights: {
            timezone: "完美时区",
            community: "游民社区",
            weather: "温和气候"
          }
        },
        berlin: {
          name: "柏林",
          country: "德国",
          highlights: {
            startup: "创业中心",
            culture: "丰富文化",
            beer: "啤酒天堂"
          }
        },
        canggu: {
          name: "沧古",
          country: "印度尼西亚",
          highlights: {
            lowCost: "低生活费",
            beach: "海滩生活",
            surfing: "冲浪天堂"
          }
        },
        chiangmai: {
          name: "清迈",
          country: "泰国",
          highlights: {
            ultraLowCost: "超低生活费",
            temple: "寺庙与文化",
            food: "美味食物"
          }
        }
      }
    },

    filmLocations: {
      meta: {
        keyword: "电影拍摄地",
        title: "电影拍摄地旅行 | 前往电影中的那个地方",
        description: "亲自访问您喜爱电影的拍摄地。在现实中体验电影场景。"
      },
      hero: {
        title: "前往电影中的那个地方",
        subtitle: "的旅行",
        description: "计划一次寻访您喜爱电影拍摄地的特别旅行。"
      }
    },

    visaChecker: {
      meta: {
        keyword: "签证检查器",
        title: "签证检查器 | 旅行前签证要求确认",
        description: "轻松快速地检查全球旅行目的地的签证要求。提供免签、落地签、预签证信息。"
      },
      hero: {
        title: "旅行前必备",
        subtitle: "签证要求检查",
        description: "提前确认目的地签证要求，进行安全且有准备的旅行。"
      }
    }
  },

  es: {
    aiTravel: {
      meta: {
        keyword: "Planificación de Viaje AI",
        title: "Planificación de Viaje AI | Planificador de Viaje Inteligente",
        description: "Planificación de viaje inteligente con asistencia de IA. Desde itinerarios personalizados hasta gestión de presupuesto, la IA maneja todo."
      },
      hero: {
        badge: "Planificación de Viaje AI • Viaje Inteligente",
        title: "Viaje Planificado",
        subtitle: "por IA Perfecta",
        description: "Deja la planificación compleja de viajes a la IA. Proporcionamos planes de viaje óptimos considerando tus preferencias y presupuesto."
      },
      aiFeatures: {
        intelligentContent: {
          title: "Contenido Inteligente",
          description: "Guías de viaje confiables compuestas de información más reciente recopilada por IA"
        },
        personalization: {
          title: "Personalización",
          description: "Recomendaciones optimizadas aprendiendo tu estilo de viaje y preferencias"
        },
        locationRecognition: {
          title: "Reconocimiento de Ubicación",
          description: "Información personalizada en tiempo real basada en ubicación actual"
        },
        voiceSynthesis: {
          title: "Síntesis de Voz",
          description: "Guía de viaje cómoda de escuchar con voz natural"
        },
        dataIntegration: {
          title: "Integración de Datos",
          description: "Integración en tiempo real de información de viaje de varias fuentes"
        },
        continuousLearning: {
          title: "Aprendizaje Continuo",
          description: "Sistema de IA que evoluciona continuamente a través de retroalimentación del usuario"
        }
      }
    },

    nomadCalculator: {
      meta: {
        keyword: "Calculadora Nómada",
        title: "Calculadora Nómada Digital | Comparación de Costo de Vida",
        description: "Compara el costo de vida para nómadas digitales mundialmente y encuentra el lugar óptimo para vivir."
      },
      hero: {
        title: "Para Nómadas Digitales",
        subtitle: "Calculadora de Costo de Vida",
        description: "Compara costos reales de vida en ciudades nómadas populares mundialmente para encontrar tu residencia óptima."
      },
      cities: {
        lisbon: {
          name: "Lisboa",
          country: "Portugal",
          highlights: {
            timezone: "Zona Horaria Perfecta",
            community: "Comunidad Nómada",
            weather: "Clima Suave"
          }
        },
        berlin: {
          name: "Berlín",
          country: "Alemania",
          highlights: {
            startup: "Centro de Startups",
            culture: "Cultura Rica",
            beer: "Paraíso de Cerveza"
          }
        },
        canggu: {
          name: "Canggu",
          country: "Indonesia",
          highlights: {
            lowCost: "Vida de Bajo Costo",
            beach: "Vida de Playa",
            surfing: "Paraíso de Surf"
          }
        },
        chiangmai: {
          name: "Chiang Mai",
          country: "Tailandia",
          highlights: {
            ultraLowCost: "Costo Ultra Bajo",
            temple: "Templos y Cultura",
            food: "Comida Deliciosa"
          }
        }
      }
    },

    filmLocations: {
      meta: {
        keyword: "Locaciones de Películas",
        title: "Viaje a Locaciones de Películas | Visita Escenas de Películas",
        description: "Visita locaciones de filmación de tus películas favoritas. Experimenta escenas de películas en la vida real."
      },
      hero: {
        title: "Viajar a Locaciones",
        subtitle: "de Filmación de Películas",
        description: "Planifica un viaje especial a locaciones de filmación de tus películas favoritas."
      }
    },

    visaChecker: {
      meta: {
        keyword: "Verificador de Visa",
        title: "Verificador de Visa | Verificar Requisitos de Visa",
        description: "Verifica fácil y rápidamente requisitos de visa para destinos mundiales. Proporciona información de libre de visa, visa al llegar y pre-visa."
      },
      hero: {
        title: "Esencial Antes del Viaje",
        subtitle: "Verificación de Requisitos de Visa",
        description: "Verifica requisitos de visa por destino con anticipación para viaje seguro y preparado."
      }
    }
  }
};

// 기존 번역에 새로운 번역 추가
function addAllServiceTranslations() {
  Object.keys(allServiceTranslations).forEach(lang => {
    if (!translations[lang]) {
      translations[lang] = {};
    }
    
    Object.keys(allServiceTranslations[lang]).forEach(service => {
      translations[lang][service] = allServiceTranslations[lang][service];
    });
  });

  return translations;
}

// 업데이트된 translations 저장
function saveAllServiceTranslations() {
  const updatedTranslations = addAllServiceTranslations();
  
  // 백업 생성
  const backupPath = path.join(__dirname, `translations-all-services-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(translations, null, 2));
  
  // 업데이트된 파일 저장
  fs.writeFileSync(translationsPath, JSON.stringify(updatedTranslations, null, 2));
  
  console.log('✅ 모든 서비스 페이지 번역이 추가되었습니다!');
  console.log(`📁 백업 파일: ${backupPath}`);
  console.log('📝 추가된 서비스들:');
  console.log('  - aiTravel: AI 여행 계획 페이지');
  console.log('  - nomadCalculator: 노마드 계산기 페이지');
  console.log('  - filmLocations: 영화 촬영지 페이지');
  console.log('  - visaChecker: 비자 체커 페이지');
  console.log('🌐 각 서비스는 5개 언어 완전 지원 (한국어, 영어, 일본어, 중국어, 스페인어)');
  console.log('📝 다음 단계:');
  console.log('1. 빌드 테스트');
  console.log('2. 각 서비스 페이지 접속 테스트');
  console.log('3. 추가 번역 키 필요 시 보완');
}

saveAllServiceTranslations();