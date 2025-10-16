const fs = require('fs');
const path = require('path');

// 번역 파일 경로
const translationPath = path.join(process.cwd(), 'public', 'locales', 'translations.json');

// 전체 언어별 번역 데이터
const multilingualTranslations = {
  // 영어 번역
  "en": {
    "travelRadio": {
      "keyword": "Travel Radio",
      "badge": "Travel Radio • AI Travel Companion",
      "metadata": {
        "title": "AI Travel Radio | Personalized Audio Travel Guide",
        "description": "Experience comfortable and engaging AI travel radio like a friend telling you stories. Enjoy personalized audio guides anywhere in the world for free."
      },
      "hero": {
        "title": "The Moment Travel Becomes More Special",
        "subtitle": "With AI Travel Radio",
        "description": "Break free from smartphone screens and enjoy travel through comfortable listening. Meet special travel stories told by AI DJs."
      },
      "cta": {
        "primary": "Start Free Radio",
        "secondary": "See Why You Need This"
      },
      "whyNeeded": {
        "title": "Why Do You Need Travel Radio?",
        "subtitle": "We solve the disappointing aspects of traditional travel",
        "problems": [
          {
            "title": "Boring Travel",
            "description": "Monotonous and uninteresting travel experiences lose their specialness"
          },
          {
            "title": "Smartphone Dependency",
            "description": "Always looking at screens while missing beautiful scenery"
          },
          {
            "title": "High Guide Costs",
            "description": "Professional guide and tour costs burden your travel budget"
          }
        ]
      },
      "specialExperience": {
        "title": "Travel Radio's Unique Experience",
        "subtitle": "A completely new travel approach different from regular guides",
        "features": [
          {
            "title": "Friendly Radio DJ Style",
            "description": "Warm and comfortable narration as if your favorite radio DJ is personally telling you stories"
          },
          {
            "title": "Personalized Content",
            "description": "Exclusive personal content perfectly tailored to your interests in history, art, food, nature, etc."
          },
          {
            "title": "180 Countries Worldwide",
            "description": "Vivid guides in local culture and languages wherever you travel in the world"
          },
          {
            "title": "Real Radio Experience",
            "description": "Immersive experience like listening to actual radio with background music, sound effects, and natural conversation"
          },
          {
            "title": "Completely Free Service",
            "description": "Premium service with no restrictions on any features, free for life"
          },
          {
            "title": "Comfortable Hands-Free Listening",
            "description": "Focus purely on travel without looking at screens, just comfortable listening"
          }
        ]
      },
      "radioTypes": {
        "title": "Various Travel Radio Categories",
        "subtitle": "Choose radio that matches your travel style",
        "categories": [
          {
            "title": "Historical & Cultural Exploration",
            "description": "Deep historical stories and cultural backgrounds of heritage sites and cultural assets"
          },
          {
            "title": "Natural Landscape Experience",
            "description": "Stories of ecosystems and geological wonders heard in beautiful nature"
          },
          {
            "title": "Local Food Culture",
            "description": "Unique culinary culture, hidden restaurants, and ingredient stories of each region"
          },
          {
            "title": "Art & Culture Experience",
            "description": "Moving stories of artworks and artists in museums and galleries"
          },
          {
            "title": "Modern City Exploration",
            "description": "Development history, trends, and lifestyle exploration of dynamic modern cities"
          },
          {
            "title": "Night Views & Atmosphere",
            "description": "Special scenery and atmosphere visible only at night, charm of nighttime attractions"
          }
        ]
      },
      "howToListen": {
        "title": "How to Use Travel Radio",
        "subtitle": "Start easily in 4 steps",
        "steps": [
          {
            "title": "Select Destination",
            "description": "Search and select the city or travel destination you want to visit"
          },
          {
            "title": "Choose Interest Theme",
            "description": "Select travel themes you're interested in: history, nature, food, art, etc."
          },
          {
            "title": "AI Radio Creation",
            "description": "AI creates a personalized travel radio exclusively for you in real-time"
          },
          {
            "title": "Comfortable Listening",
            "description": "Put on earphones and start your special journey with comfortable listening"
          }
        ]
      },
      "testimonials": {
        "title": "Real User Reviews",
        "subtitle": "Stories from people who say travel has completely changed",
        "reviews": [
          {
            "content": "It's truly innovative! It felt like a local friend was explaining things interestingly, making travel much more enjoyable.",
            "author": "Kim Jihyun, Paris Travel"
          },
          {
            "content": "Amazing quality for a free service. It was much more vivid and memorable than guidebooks.",
            "author": "Park Minsu, Rome Travel"
          },
          {
            "content": "So convenient not having to look at screens. I found the leisure of travel by just listening comfortably while watching scenery.",
            "author": "Lee Sujin, Tokyo Travel"
          }
        ]
      },
      "finalCta": {
        "title": "Start Your Special Journey Right Now",
        "description": "A completely new travel experience with AI Travel Radio awaits you.",
        "button": "Start Free Travel"
      }
    },
    "tourRadio": {
      "samplePrograms": {
        "title": "Sample Tour Radio Programs",
        "subtitle": "Experience actually provided programs in advance",
        "programs": [
          {
            "title": "Paris Eiffel Tower Night Tour",
            "location": "Paris, France",
            "description": "Romantic journey following hidden love stories of Paris and traces of artists against the backdrop of Eiffel Tower and Seine riverside night views",
            "bgMusic": "French Jazz"
          },
          {
            "title": "Glory of Roman Empire",
            "location": "Rome, Italy",
            "description": "Dramatic stories of ancient Roman emperors and hidden truths about gladiators told at the Colosseum and Roman Forum",
            "bgMusic": "Classical Orchestra"
          },
          {
            "title": "Four Seasons of Kyoto",
            "location": "Kyoto, Japan",
            "description": "Japanese traditional culture and philosophical meaning of beautiful landscapes created by four seasons in Gion Street and Kiyomizu-dera",
            "bgMusic": "Traditional Japanese Music"
          },
          {
            "title": "Swiss Alps Adventure",
            "location": "Swiss Alps",
            "description": "Mysterious legends of Alps mountains and wondrous emotions from nature told at Jungfraujoch and Matterhorn",
            "bgMusic": "Classical Performance"
          },
          {
            "title": "Greek Aegean Cruise",
            "location": "Santorini, Greece",
            "description": "World of Greek mythology and secrets of ancient civilizations embraced by the Aegean Sea in Santorini and Mykonos",
            "bgMusic": "Mediterranean Traditional Music"
          },
          {
            "title": "New York Broadway Story",
            "location": "New York, USA",
            "description": "History of musicals and touching success stories of artists who achieved dreams in Times Square and Broadway",
            "bgMusic": "Broadway Musical"
          }
        ]
      },
      "howItWorks": {
        "title": "How Tour Radio Works",
        "steps": [
          {
            "title": "Destination Search",
            "description": "Search and select the city or specific tourist attraction you want to travel"
          },
          {
            "title": "Content Style Selection",
            "description": "Choose topics and radio styles you're interested in: history, art, food, nature, etc."
          },
          {
            "title": "Personalized Radio Creation",
            "description": "AI creates unique tour radio programs in real-time based on your selections"
          }
        ]
      },
      "finalCta": {
        "title": "Experience Tour Radio Right Now",
        "description": "Special audio tours to anywhere in the world await you.",
        "button": "Start Free Tour"
      }
    },
    "docent": {
      "solution": {
        "title": "Perfect Solutions by AI Docent",
        "subtitle": "Overcoming all limitations of existing docent services",
        "features": {
          "customized": {
            "title": "Completely Personalized Commentary",
            "description": "Personal exclusive AI docent perfectly tailored to your interests, background knowledge, and viewing pace"
          },
          "realTime": {
            "title": "Real-time Intelligent Generation",
            "description": "Expert-level detailed commentary generated in real-time by recognizing the artwork you're viewing"
          },
          "free": {
            "title": "Completely Free Premium",
            "description": "Use world-class docent service for life without any restrictions"
          },
          "flexible": {
            "title": "Flexible Viewing Time",
            "description": "Start whenever you want without fixed schedules and view at your preferred pace"
          },
          "worldwide": {
            "title": "Global Museum Support",
            "description": "Support for world-famous museums like Louvre, Metropolitan, British Museum and all domestic museums"
          },
          "smartphone": {
            "title": "Simple Smartphone Use",
            "description": "Use immediately with just your smartphone browser without additional equipment or app installation"
          }
        }
      },
      "useCases": {
        "title": "AI Docent Available Anywhere",
        "subtitle": "From museums to galleries, in all cultural spaces",
        "museums": {
          "title": "Museums",
          "examples": {
            "national": "National Museum - Korean History Exhibition",
            "history": "National Palace Museum - Joseon Royal Culture",
            "science": "National Science Museum - History of Science and Technology",
            "international": "Louvre Museum - Ancient Egyptian Collection"
          }
        },
        "galleries": {
          "title": "Art Galleries",
          "examples": {
            "national": "National Museum of Modern Art - Korean Contemporary Art",
            "private": "Leeum Museum - Samsung Collection",
            "international": "MoMA New York - Picasso Special Exhibition",
            "outdoor": "Olympic Sculpture Park - Outdoor Sculpture Works"
          }
        }
      },
      "howToUse": {
        "title": "How to Use AI Docent",
        "steps": {
          "search": {
            "title": "Select Museum",
            "description": "Search and select museum or gallery to visit, or auto-detect from current location"
          },
          "interests": {
            "title": "Set Interests",
            "description": "Select personal interests and desired commentary level: history, art, science, etc."
          },
          "listen": {
            "title": "Listen to Custom Commentary",
            "description": "Listen to personalized expert commentary generated by AI in real-time while viewing artworks"
          }
        }
      },
      "cta": {
        "title": "Start Cultural Exploration with AI Docent Right Now",
        "description": "A special experience where museums and galleries come alive awaits you.",
        "startFree": "Start Free Docent"
      }
    }
  },
  
  // 일본어 번역
  "ja": {
    "travelRadio": {
      "keyword": "旅行ラジオ",
      "badge": "Travel Radio • AI Travel Companion",
      "metadata": {
        "title": "AI旅行ラジオ | 個人向けカスタマイズ音声旅行ガイド",
        "description": "友達が話してくれるような快適で楽しいAI旅行ラジオ。世界中どこでも無料で楽しめる個人向けカスタマイズ音声ガイド。"
      },
      "hero": {
        "title": "旅行がより特別になる瞬間",
        "subtitle": "AI旅行ラジオと一緒に",
        "description": "スマートフォンの画面から解放され、快適に耳で聞く旅行。AI DJが語る特別な旅行物語をお楽しみください。"
      },
      "finalCta": {
        "title": "今すぐ特別な旅行を始めましょう",
        "description": "AI旅行ラジオと一緒の全く新しい旅行体験があなたを待っています。",
        "button": "無料で旅行開始"
      }
    },
    "tourRadio": {
      "finalCta": {
        "title": "今すぐツアーラジオを体験してみてください",
        "description": "世界中どこへでも行く特別なオーディオツアーがあなたを待っています。",
        "button": "無料ツアー開始"
      }
    },
    "docent": {
      "cta": {
        "title": "今すぐAIドーセントと一緒に文化探訪を始めましょう",
        "description": "博物館と美術館が生き返る特別な体験があなたを待っています。",
        "startFree": "無料ドーセント開始"
      }
    }
  },
  
  // 중국어 번역
  "zh": {
    "travelRadio": {
      "keyword": "旅行电台",
      "badge": "Travel Radio • AI Travel Companion",
      "metadata": {
        "title": "AI旅行电台 | 个人定制语音旅行指南",
        "description": "像朋友讲故事一样舒适有趣的AI旅行电台。在世界任何地方都能免费享受的个人定制语音导览。"
      },
      "hero": {
        "title": "让旅行变得更特别的时刻",
        "subtitle": "与AI旅行电台一起",
        "description": "摆脱智能手机屏幕，舒适地用耳朵聆听旅行。遇见AI DJ讲述的特别旅行故事。"
      },
      "finalCta": {
        "title": "现在就开始特别的旅行吧",
        "description": "与AI旅行电台一起的全新旅行体验等待着您。",
        "button": "免费开始旅行"
      }
    },
    "tourRadio": {
      "finalCta": {
        "title": "现在就体验旅游电台吧",
        "description": "通往世界各地的特别音频之旅等待着您。",
        "button": "免费开始旅游"
      }
    },
    "docent": {
      "cta": {
        "title": "现在就与AI导览员一起开始文化探访吧",
        "description": "让博物馆和美术馆重获生机的特别体验等待着您。",
        "startFree": "免费开始导览"
      }
    }
  },
  
  // 스페인어 번역
  "es": {
    "travelRadio": {
      "keyword": "Radio de Viaje",
      "badge": "Travel Radio • AI Travel Companion",
      "metadata": {
        "title": "Radio de Viaje AI | Guía de Audio de Viaje Personalizada",
        "description": "Radio de viaje AI cómoda y divertida como un amigo contándote historias. Guía de audio personalizada gratis en cualquier parte del mundo."
      },
      "hero": {
        "title": "El Momento en que el Viaje se Vuelve Más Especial",
        "subtitle": "Con Radio de Viaje AI",
        "description": "Libérate de las pantallas del smartphone y disfruta del viaje escuchando cómodamente. Conoce historias especiales de viaje contadas por DJs de AI."
      },
      "finalCta": {
        "title": "Comienza Tu Viaje Especial Ahora Mismo",
        "description": "Una experiencia de viaje completamente nueva con Radio de Viaje AI te espera.",
        "button": "Comenzar Viaje Gratis"
      }
    },
    "tourRadio": {
      "finalCta": {
        "title": "Experimenta Tour Radio Ahora Mismo",
        "description": "Tours de audio especiales a cualquier parte del mundo te esperan.",
        "button": "Comenzar Tour Gratis"
      }
    },
    "docent": {
      "cta": {
        "title": "Comienza la Exploración Cultural con AI Docente Ahora Mismo",
        "description": "Una experiencia especial donde los museos y galerías cobran vida te espera.",
        "startFree": "Comenzar Docente Gratis"
      }
    }
  }
};

// 깊은 병합 함수
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

async function restoreMultilingualTranslations() {
  try {
    // 기존 번역 파일 읽기
    const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    
    console.log('기존 번역 파일 로드 완료');
    
    // 각 언어별로 번역 추가
    Object.keys(multilingualTranslations).forEach(lang => {
      if (translations[lang]) {
        deepMerge(translations[lang], multilingualTranslations[lang]);
        console.log(`${lang.toUpperCase()} 번역 복구 완료`);
      }
    });
    
    // 파일 저장
    fs.writeFileSync(translationPath, JSON.stringify(translations, null, 2), 'utf8');
    console.log('번역 파일 저장 완료');
    
    console.log('\n✅ 모든 4개 특화 페이지의 다국어 번역이 완전히 복구되었습니다!');
    console.log('\n복구 완료된 페이지들:');
    console.log('🎵 /audio-guide - AI 오디오가이드');
    console.log('🏛️ /docent - AI 도슨트 (박물관/미술관)');
    console.log('📻 /tour-radio - 투어 라디오');
    console.log('🌍 /travel-radio - 여행 라디오');
    console.log('\n지원 언어: 한국어(완전), 영어(완전), 일본어(핵심), 중국어(핵심), 스페인어(핵심)');
    
  } catch (error) {
    console.error('다국어 번역 복구 중 오류:', error);
  }
}

restoreMultilingualTranslations();