const fs = require('fs');
const path = require('path');

// translations.json 파일 읽기
const translationsPath = path.join(__dirname, 'public/locales/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// 다국어 번역 템플릿
const multilingualTranslations = {
  en: {
    docent: {
      meta: {
        keyword: "AI Docent",
        title: "AI Docent Service | Free Museum & Gallery Guide",
        description: "Experience AI-powered real-time museum and gallery narration without professional guides. Try it for free.",
        features: {
          customized: "Customized Commentary",
          realTime: "Real-time Generation", 
          free: "Free Service",
          flexible: "Flexible Schedule",
          worldwide: "Global Support",
          smartphone: "Smartphone Access"
        }
      },
      hero: {
        badge: "AI Docent Service • Cultural Experience"
      }
    },
    travel: {
      keyword: "AI Travel Guide",
      metadata: {
        title: "AI Travel Guide | Personalized Travel Planning",
        description: "AI creates your personalized travel guide. From hidden gems to cultural experiences."
      },
      features: {
        worldwide: "Global Destinations",
        realtime: "Real-time Information",
        personalized: "Personalized",
        hidden: "Hidden Gems", 
        culture: "Cultural Experience",
        free: "Free to Use"
      },
      badge: "AI Travel Guide • Personalized Journey",
      hero: {
        title: "Travel with AI",
        subtitle: "Extraordinary Journey",
        description: "Anywhere in the world, AI creates the perfect personalized travel guide for you in real-time."
      },
      cta: {
        primary: "Start Your Journey",
        secondary: "Popular Destinations"
      },
      problems: {
        title: "Travel Concerns",
        subtitle: "Sound Familiar?",
        items: [
          {
            title: "Don't know where to go",
            description: "It's hard to find destinations that suit me among too much information"
          },
          {
            title: "Lack of local information", 
            description: "Guidebooks alone can't provide vivid local information"
          },
          {
            title: "Too expensive",
            description: "Personal guide or tour costs exceed the budget"
          }
        ]
      },
      solution: {
        title: "AI Solves Everything",
        subtitle: "Perfect Travel Solution",
        features: [
          {
            title: "Anywhere in the World",
            description: "180+ countries travel information with real-time updates"
          },
          {
            title: "AI Personalized Recommendations",
            description: "Perfect travel plans tailored to your taste and budget"
          },
          {
            title: "Personalized",
            description: "Guide tailored to your unique travel style"
          },
          {
            title: "Hidden Gems",
            description: "Special places and experiences only locals know"
          },
          {
            title: "Deep Cultural Experience",
            description: "In-depth cultural experiences beyond simple sightseeing"
          },
          {
            title: "Start for Free",
            description: "Available for free anytime without burden"
          }
        ]
      },
      destinations: {
        title: "Popular Destinations",
        subtitle: "AI Recommended TOP Destinations",
        items: [
          {
            name: "Japan",
            description: "Charming destination where tradition and modernity harmonize"
          },
          {
            name: "France", 
            description: "Romantic land of culture and art"
          },
          {
            name: "Maldives",
            description: "Fantastic ocean and resort destination"
          },
          {
            name: "Greece",
            description: "Ancient civilization and beautiful Aegean Sea"
          }
        ],
        viewMore: "View More Destinations"
      },
      howItWorks: {
        title: "How It Works",
        steps: [
          {
            title: "Enter Destination",
            description: "Tell us where you want to go"
          },
          {
            title: "AI Analysis", 
            description: "AI creates a plan tailored to your taste"
          },
          {
            title: "Start Journey",
            description: "Enjoy your trip with personalized guide"
          }
        ]
      },
      finalCta: {
        title: "Start Right Now",
        description: "Your special journey awaits",
        button: "Plan Free Trip"
      }
    },
    freeTravel: {
      keyword: "Solo Travel",
      metadata: {
        title: "AI Solo Travel Guide | Safe and Smart Solo Journey",
        description: "Safe solo travel with AI assistance. Support everything from planning to local guidance."
      },
      features: {
        planning: "Trip Planning",
        guide: "Local Guide", 
        safety: "Safety Support",
        budget: "Budget Management",
        language: "Language Support",
        support: "24/7 Support"
      },
      badge: "Free Travel • AI Safety Guide",
      hero: {
        title: "Solo Travel with AI",
        subtitle: "Safe Solo Journey",
        description: "Even alone, no worries. AI supports your solo travel safely from start to finish."
      },
      cta: {
        primary: "Plan Solo Travel",
        secondary: "Safety Guide"
      },
      challenges: {
        title: "Solo Travel Difficulties",
        subtitle: "These worries?",
        items: [
          {
            title: "Complex trip planning",
            description: "Hard to plan flights, accommodation, itinerary alone"
          },
          {
            title: "Safety concerns",
            description: "Safety is the biggest worry when traveling alone"
          },
          {
            title: "Language barriers",
            description: "Difficult communication without knowing local language"
          },
          {
            title: "Budget management",
            description: "Hard to predict how much money will be needed"
          },
          {
            title: "Accommodation & transport",
            description: "Hard to find reliable accommodation and transport"
          },
          {
            title: "Emergency situations",
            description: "Hard to handle problems alone"
          }
        ]
      },
      solutions: {
        title: "AI Solves All Worries",
        subtitle: "Smart Solo Travel Solution",
        features: [
          {
            title: "AI Trip Planning",
            description: "Auto-generate perfect itinerary for your taste and budget"
          },
          {
            title: "Real-time Safety Support",
            description: "24/7 safety monitoring and emergency response guide"
          },
          {
            title: "Real-time Translation",
            description: "Real-time local language translation and cultural manner guide"
          },
          {
            title: "Smart Budget Management",
            description: "Budget optimization with real-time exchange rates and local prices"
          },
          {
            title: "Verified Accommodation",
            description: "Safe and reasonable accommodation and transport recommendations"
          },
          {
            title: "24/7 Support",
            description: "AI assistant support whenever you need help"
          }
        ]
      },
      howItWorks: {
        title: "How to Use",
        steps: [
          {
            title: "Enter Travel Info",
            description: "Tell us destination, duration, and budget"
          },
          {
            title: "AI Custom Plan",
            description: "AI creates your perfect travel plan"
          },
          {
            title: "Safety Preparation",
            description: "Prepare safety guide and emergency contacts"
          },
          {
            title: "Start Journey",
            description: "Start safe solo travel with AI support"
          }
        ]
      },
      tips: {
        title: "Solo Travel Tips",
        subtitle: "Advice for Successful Solo Travel",
        items: [
          {
            title: "Thorough Preparation",
            description: "Research destination info, weather, culture in advance"
          },
          {
            title: "Install Essential Apps",
            description: "Prepare maps, translation, transport, accommodation apps"
          },
          {
            title: "Safety Planning",
            description: "Save emergency contacts and embassy information"
          },
          {
            title: "Budget Buffer",
            description: "Prepare 20% extra budget"
          },
          {
            title: "Important Document Storage",
            description: "Keep copies of passport, visa, important documents"
          },
          {
            title: "Local Network",
            description: "Connect with local Korean community or traveler community"
          }
        ]
      },
      finalCta: {
        title: "Start Confident Solo Travel",
        description: "With AI, you can go anywhere safely",
        button: "Plan Free Solo Travel"
      }
    },
    tourRadio: {
      keyword: "Tour Radio",
      metadata: {
        title: "AI Tour Radio | Real-time Travel Voice Guide",
        description: "AI tour radio that tells you in real-time at travel destinations. Special travel experience with storytelling and music."
      },
      features: {
        realtime: "Real-time Guide",
        storytelling: "Storytelling",
        location: "Location-based",
        music: "Background Music",
        interactive: "Interactive",
        worldwide: "Global Support"
      },
      badge: "Tour Radio • Interactive Storytelling",
      hero: {
        title: "Travel by Listening",
        subtitle: "AI Tour Radio",
        description: "Like a professional DJ, AI vividly tells the stories of travel destinations."
      },
      cta: {
        primary: "Start Radio",
        secondary: "Learn Features"
      },
      problems: {
        title: "Limitations of Existing Guides",
        subtitle: "These disappointments?",
        items: [
          {
            title: "Boring explanations",
            description: "Hard to concentrate on stiff and uninteresting commentary"
          },
          {
            title: "Information-focused guide",
            description: "Lack of emotion with emotionless information listing"
          },
          {
            title: "Expensive guide costs",
            description: "Professional guide costs burden the travel budget"
          },
          {
            title: "Fixed schedule",
            description: "Inconvenient to follow fixed tour schedule"
          },
          {
            title: "Group tour limitations",
            description: "Uniform tours that don't match personal preferences"
          },
          {
            title: "Language barriers",
            description: "Hard to understand foreign language guides"
          }
        ]
      },
      radioFeatures: {
        title: "Tour Radio's Specialness",
        subtitle: "Provides New Travel Experience",
        features: [
          {
            title: "Radio Style Guide",
            description: "Fun and lively commentary like radio DJ"
          },
          {
            title: "Storytelling Focus",
            description: "Delivered as touching stories, not simple information"
          },
          {
            title: "Location-based Auto Play",
            description: "Auto-play based on GPS at relevant locations"
          },
          {
            title: "Atmospheric Background Music",
            description: "Maximize immersion with background music suitable for the place"
          },
          {
            title: "Interactive Communication",
            description: "Two-way communication possible through questions and answers"
          },
          {
            title: "Global Destination Support",
            description: "Available in 180+ countries"
          }
        ]
      },
      contentTypes: {
        title: "Various Content",
        subtitle: "Choose radio that suits your taste",
        items: [
          {
            title: "History & Culture",
            description: "In-depth history and culture stories"
          },
          {
            title: "Local Life",
            description: "Real life stories of locals"
          },
          {
            title: "Food & Restaurants",
            description: "Local food and hidden restaurant information"
          },
          {
            title: "Mystery & Legends",
            description: "Mysterious legends and interesting stories"
          }
        ]
      },
      howItWorks: {
        title: "How to Use",
        steps: [
          {
            title: "Select Location",
            description: "Choose the place you want to tour"
          },
          {
            title: "Choose Radio Style",
            description: "Pick your preferred radio style"
          },
          {
            title: "Start Tour",
            description: "Put on earphones and start your special tour"
          }
        ]
      },
      samplePrograms: {
        title: "Sample Programs",
        subtitle: "Listen to actual tour radio in advance",
        programs: [
          {
            title: "Secrets of Eiffel Tower",
            location: "Paris, France",
            description: "Amazing hidden stories of Eiffel Tower",
            bgMusic: "Parisian Waltz"
          },
          {
            title: "Roman Gladiators",
            location: "Rome, Italy",
            description: "Stories of gladiators in the Colosseum",
            bgMusic: "Ancient Roman March"
          },
          {
            title: "Cherry Blossom Legend",
            location: "Kyoto, Japan",
            description: "Beautiful legend of Japanese cherry blossoms",
            bgMusic: "Traditional Japanese Music"
          },
          {
            title: "Alpine Legend",
            location: "Switzerland",
            description: "Mysterious stories passed down in the Alps",
            bgMusic: "Alpine Folk Song"
          },
          {
            title: "Sea Mythology",
            location: "Santorini, Greece",
            description: "Ancient Greek mythology from the Aegean Sea",
            bgMusic: "Traditional Greek Music"
          },
          {
            title: "Desert Stories",
            location: "Sahara, Morocco",
            description: "Stories of caravans crossing the Sahara",
            bgMusic: "Berber Music"
          }
        ]
      },
      finalCta: {
        title: "Start New Tour Experience",
        description: "Special travel listening experience awaits you",
        button: "Start Tour Radio"
      }
    },
    travelRadio: {
      keyword: "Travel Radio",
      metadata: {
        title: "AI Travel Radio | Personalized Travel Voice Guide",
        description: "Personalized travel radio created by AI. We tell your personalized travel stories in real-time."
      },
      features: {
        realtime: "Real-time Generation",
        personalized: "Personalized",
        worldwide: "Global Support",
        authentic: "Local Information", 
        free: "Free Use",
        comfortable: "Comfortable Listening"
      },
      badge: "Travel Radio • Personal Journey",
      hero: {
        title: "Your Own",
        subtitle: "Travel Radio",
        description: "AI creates personalized travel radio in real-time tailored to your travel style and interests."
      },
      cta: {
        primary: "Start Radio",
        secondary: "Why Needed?"
      },
      whyNeeded: {
        title: "Why Travel Radio",
        subtitle: "Is Needed?",
        problems: [
          {
            title: "Boring travel time",
            description: "No meaningful way to spend long travel time"
          },
          {
            title: "Smartphone screen fatigue",
            description: "Eyes get tired from constantly looking at screen while traveling"
          },
          {
            title: "Expensive data charges",
            description: "High data charges when using internet abroad"
          }
        ]
      },
      specialExperience: {
        title: "Special Travel Experience",
        subtitle: "Travel Radio's Uniqueness",
        features: [
          {
            title: "Personal DJ Service",
            description: "Customized broadcast like having personal DJ"
          },
          {
            title: "Interest-based Recommendations",
            description: "Content recommendations based on your interests and preferences"
          },
          {
            title: "Global Local Information",
            description: "Real-time local information and culture introduction from 180 countries"
          },
          {
            title: "Offline Download",
            description: "Download in advance for offline listening"
          },
          {
            title: "Free Service",
            description: "All basic features available for free"
          },
          {
            title: "Comfortable Listening",
            description: "Comfortable information acquisition without eye fatigue"
          }
        ]
      },
      radioTypes: {
        title: "Radio Categories", 
        subtitle: "Enjoy various themed radio",
        categories: [
          {
            title: "History & Culture Radio",
            description: "In-depth history and culture stories of each region"
          },
          {
            title: "Nature & Scenery Radio",
            description: "Emotional descriptions of beautiful nature and scenery"
          },
          {
            title: "Food & Cooking Radio",
            description: "Local food culture and restaurant information"
          },
          {
            title: "Art & Architecture Radio",
            description: "Commentary on famous buildings and artworks"
          },
          {
            title: "City Life Radio",
            description: "Real life and urban culture of locals"
          },
          {
            title: "Night Travel Radio",
            description: "Special stories about night views and night culture"
          }
        ]
      },
      howToListen: {
        title: "How to Listen",
        subtitle: "Start with simple 4 steps",
        steps: [
          {
            title: "Enter Location",
            description: "Enter your current location or place of interest"
          },
          {
            title: "Select Interests",
            description: "Choose your interests and preferred radio style"
          },
          {
            title: "AI Radio Generation",
            description: "AI generates customized radio for you in real-time"
          },
          {
            title: "Comfortable Listening",
            description: "Put on earphones and enjoy your personalized travel radio comfortably"
          }
        ]
      },
      testimonials: {
        title: "User Reviews",
        subtitle: "Real experiences from actual users",
        reviews: [
          {
            content: "Travel time is never boring. It feels like having personal guide telling interesting stories!",
            author: "Travel Blogger Kim○○"
          },
          {
            content: "Great to get in-depth travel information without eye fatigue.",
            author: "Backpacker Lee○○"
          },
          {
            content: "Best feature is offline listening without worrying about overseas data.",
            author: "Family Traveler Park○○"
          }
        ]
      },
      finalCta: {
        title: "Start Your Own Travel Radio",
        description: "Personalized travel experience created by AI awaits",
        button: "Start for Free"
      }
    }
  },
  ja: {
    docent: {
      meta: {
        keyword: "AIドーセント",
        title: "AIドーセントサービス | 無料の博物館・美術館解説",
        description: "専門ドーセントがいなくても、AIがリアルタイムで博物館と美術館の解説を提供します。無料でお試しください。",
        features: {
          customized: "カスタマイズ解説",
          realTime: "リアルタイム生成",
          free: "無料サービス",
          flexible: "柔軟なスケジュール",
          worldwide: "世界対応",
          smartphone: "スマートフォンアクセス"
        }
      },
      hero: {
        badge: "AIドーセントサービス • 文化体験"
      }
    },
    travel: {
      keyword: "AI旅行ガイド",
      metadata: {
        title: "AI旅行ガイド | 個人向けカスタム旅行プラン",
        description: "AIがあなただけの旅行ガイドを作成します。隠れた名所から文化体験まで。"
      },
      features: {
        worldwide: "世界の旅行先",
        realtime: "リアルタイム情報",
        personalized: "個人向けカスタム",
        hidden: "隠れた名所",
        culture: "文化体験",
        free: "無料利用"
      },
      badge: "AI旅行ガイド • パーソナライズド旅",
      hero: {
        title: "AIと一緒に",
        subtitle: "特別な旅行体験",
        description: "世界のどこでも、AIがあなただけの完璧な旅行ガイドをリアルタイムで作成します。"
      },
      cta: {
        primary: "旅行を始める",
        secondary: "人気旅行先を見る"
      },
      problems: {
        title: "こんな旅行の悩み",
        subtitle: "ありませんか？",
        items: [
          {
            title: "どこに行けばいいかわからない",
            description: "情報が多すぎて自分に合う旅行先を見つけるのが難しい"
          },
          {
            title: "現地情報が不足",
            description: "ガイドブックだけでは生き生きとした現地情報を得にくい"
          },
          {
            title: "費用がかかりすぎる",
            description: "個人ガイドやツアー費用が予算を超える"
          }
        ]
      },
      solution: {
        title: "AIが解決します",
        subtitle: "完璧な旅行ソリューション",
        features: [
          {
            title: "世界どこでも",
            description: "180ヶ国以上の旅行情報とリアルタイムアップデート"
          },
          {
            title: "AIカスタム推薦",
            description: "あなたの好みと予算に合った完璧な旅行プラン"
          },
          {
            title: "個人向けカスタム",
            description: "あなただけの特別な旅行スタイルに合わせたガイド"
          },
          {
            title: "隠れた宝石",
            description: "地元の人だけが知る特別な場所と体験"
          },
          {
            title: "文化を深く",
            description: "単純な観光を超えた深い文化体験"
          },
          {
            title: "無料で開始",
            description: "負担なくいつでも無料で利用可能"
          }
        ]
      },
      destinations: {
        title: "人気旅行先",
        subtitle: "AI推薦TOP旅行先",
        items: [
          {
            name: "日本",
            description: "伝統と現代が調和した魅力的な旅行先"
          },
          {
            name: "フランス",
            description: "ロマンチックな文化と芸術の国"
          },
          {
            name: "モルディブ",
            description: "幻想的な海とリゾート地"
          },
          {
            name: "ギリシャ",
            description: "古代文明と美しいエーゲ海"
          }
        ],
        viewMore: "もっと多くの旅行先を見る"
      },
      howItWorks: {
        title: "利用方法",
        steps: [
          {
            title: "目的地入力",
            description: "行きたい場所を教えてください"
          },
          {
            title: "AI分析",
            description: "好みに合った計画をAIが生成します"
          },
          {
            title: "旅行開始",
            description: "カスタムガイドと一緒に旅行を楽しんでください"
          }
        ]
      },
      finalCta: {
        title: "今すぐ始めましょう",
        description: "あなただけの特別な旅行が待っています",
        button: "無料旅行計画"
      }
    },
    freeTravel: {
      keyword: "一人旅",
      metadata: {
        title: "AI一人旅ガイド | 安全でスマートな一人旅",
        description: "AIが支援する安全な一人旅。計画から現地ガイドまですべてをサポートします。"
      },
      features: {
        planning: "旅行計画",
        guide: "現地ガイド",
        safety: "安全サポート",
        budget: "予算管理",
        language: "言語サポート",
        support: "24時間サポート"
      },
      badge: "一人旅 • AI安全ガイド",
      hero: {
        title: "AIと一緒に",
        subtitle: "安全な一人旅",
        description: "一人でも心配なく、AIがあなたの一人旅を最初から最後まで安全にサポートします。"
      },
      cta: {
        primary: "一人旅計画",
        secondary: "安全ガイドを見る"
      },
      challenges: {
        title: "一人旅の難しさ",
        subtitle: "こんな心配がありますね？",
        items: [
          {
            title: "旅行計画の複雑さ",
            description: "航空便、宿泊、日程を一人で計画するのが難しい"
          },
          {
            title: "安全への懸念",
            description: "一人で旅行する時、安全が最も心配"
          },
          {
            title: "言語の壁",
            description: "現地言語がわからなくてコミュニケーションが困難"
          },
          {
            title: "予算管理",
            description: "どのくらい費用がかかるか予想しにくい"
          },
          {
            title: "宿泊・交通",
            description: "信頼できる宿泊と交通手段を見つけるのが困難"
          },
          {
            title: "緊急時対応",
            description: "問題が生じた時、一人で解決するのが困難"
          }
        ]
      },
      solutions: {
        title: "AIがすべての心配を解決",
        subtitle: "スマートな一人旅ソリューション",
        features: [
          {
            title: "AI旅行計画",
            description: "好みと予算に合った完璧な旅行日程を自動生成"
          },
          {
            title: "リアルタイム安全サポート",
            description: "24時間安全モニタリングと緊急時対応ガイド"
          },
          {
            title: "リアルタイム翻訳",
            description: "現地語リアルタイム翻訳と文化マナーガイド"
          },
          {
            title: "スマート予算管理",
            description: "リアルタイム為替と現地物価情報で予算最適化"
          },
          {
            title: "検証済み宿泊推薦",
            description: "安全で合理的な宿泊と交通手段推薦"
          },
          {
            title: "24時間サポート",
            description: "いつでも助けが必要な時AIアシスタントサポート"
          }
        ]
      },
      howItWorks: {
        title: "利用方法",
        steps: [
          {
            title: "旅行情報入力",
            description: "目的地と期間、予算を教えてください"
          },
          {
            title: "AIカスタム計画",
            description: "AIがあなただけの完璧な旅行計画を生成"
          },
          {
            title: "安全準備",
            description: "安全ガイドと緊急連絡先を準備"
          },
          {
            title: "旅行開始",
            description: "AIサポートと一緒に安全な一人旅を開始"
          }
        ]
      },
      tips: {
        title: "一人旅のコツ",
        subtitle: "成功する一人旅のためのアドバイス",
        items: [
          {
            title: "徹底した事前準備",
            description: "目的地情報、天気、文化を事前に調査"
          },
          {
            title: "必須アプリインストール",
            description: "地図、翻訳、交通、宿泊アプリを事前に準備"
          },
          {
            title: "安全計画立案",
            description: "緊急連絡先と大使館情報を保存"
          },
          {
            title: "予算余裕分",
            description: "予想予算の20%余裕分を準備"
          },
          {
            title: "重要書類保管",
            description: "パスポート、ビザなど重要書類のコピーを保管"
          },
          {
            title: "現地ネットワーク",
            description: "現地韓国人会や旅行者コミュニティに接続"
          }
        ]
      },
      finalCta: {
        title: "自信のある一人旅を始めましょう",
        description: "AIと一緒ならどこでも安全に行けます",
        button: "無料一人旅計画"
      }
    },
    tourRadio: {
      keyword: "ツアーラジオ",
      metadata: {
        title: "AIツアーラジオ | リアルタイム旅行音声ガイド",
        description: "旅行先でリアルタイムに聞かせてくれるAIツアーラジオ。ストーリーテリングと音楽が一緒の特別な旅行体験。"
      },
      features: {
        realtime: "リアルタイムガイド",
        storytelling: "ストーリーテリング",
        location: "位置ベース",
        music: "背景音楽",
        interactive: "相互作用",
        worldwide: "世界対応"
      },
      badge: "ツアーラジオ • インタラクティブストーリーテリング",
      hero: {
        title: "耳で聞く旅行",
        subtitle: "AIツアーラジオ",
        description: "まるで専門DJが聞かせてくれるように、AIが旅行先の話を生き生きと聞かせてくれます。"
      },
      cta: {
        primary: "ラジオ開始",
        secondary: "特徴を知る"
      },
      problems: {
        title: "既存ガイドの限界",
        subtitle: "こんな物足りなさがありましたね？",
        items: [
          {
            title: "つまらない説明",
            description: "固くてつまらない解説で集中しにくい"
          },
          {
            title: "情報中心のガイド",
            description: "感情のない情報羅列で感動が不足"
          },
          {
            title: "高いガイド費用",
            description: "専門ガイド費用が旅行予算に負担"
          },
          {
            title: "決まった時間",
            description: "決まったツアー時間に合わせる必要があって不便"
          },
          {
            title: "団体ツアーの限界",
            description: "個人の好みに合わない画一的なツアー"
          },
          {
            title: "言語の壁",
            description: "外国語ガイドを理解するのが困難"
          }
        ]
      },
      radioFeatures: {
        title: "ツアーラジオだけの特別さ",
        subtitle: "新しい旅行体験を提供",
        features: [
          {
            title: "ラジオスタイルガイド",
            description: "まるでラジオDJのように楽しく生き生きとした解説"
          },
          {
            title: "ストーリーテリング中心",
            description: "単純な情報ではなく感動的な話で伝達"
          },
          {
            title: "位置ベース自動再生",
            description: "GPS基盤で該当場所で自動再生"
          },
          {
            title: "雰囲気のある背景音楽",
            description: "場所に似合う背景音楽と一緒に没入感極大化"
          },
          {
            title: "対話型インタラクション",
            description: "質問して答える双方向コミュニケーション可能"
          },
          {
            title: "世界旅行先サポート",
            description: "180ヶ国以上の旅行先で利用可能"
          }
        ]
      },
      contentTypes: {
        title: "多様なコンテンツ",
        subtitle: "あなたの好みに合うラジオを選択",
        items: [
          {
            title: "歴史・文化",
            description: "深い歴史と文化の話"
          },
          {
            title: "現地生活",
            description: "現地人の実際の生活話"
          },
          {
            title: "食べ物・グルメ",
            description: "現地料理と隠れたグルメ情報"
          },
          {
            title: "ミステリー・伝説",
            description: "神秘的な伝説と面白い話"
          }
        ]
      },
      howItWorks: {
        title: "利用方法",
        steps: [
          {
            title: "場所選択",
            description: "ツアーしたい場所を選択"
          },
          {
            title: "ラジオスタイル選択",
            description: "望むスタイルのラジオを選択"
          },
          {
            title: "ツアー開始",
            description: "イヤホンをつけて特別なツアーを開始"
          }
        ]
      },
      samplePrograms: {
        title: "サンプルプログラム",
        subtitle: "実際のツアーラジオを事前に聞いてみる",
        programs: [
          {
            title: "エッフェル塔の秘密",
            location: "パリ、フランス",
            description: "エッフェル塔に隠された驚くべき話",
            bgMusic: "パリジャンワルツ"
          },
          {
            title: "ローマの剣闘士",
            location: "ローマ、イタリア",
            description: "コロッセウムで繰り広げられた剣闘士の話",
            bgMusic: "古代ローマ行進曲"
          },
          {
            title: "桜の伝説",
            location: "京都、日本",
            description: "日本の桜に込められた美しい伝説",
            bgMusic: "日本伝統音楽"
          },
          {
            title: "アルプスの伝説",
            location: "スイス",
            description: "アルプス山脈に伝わる神秘的な話",
            bgMusic: "アルプス民謡"
          },
          {
            title: "海の神話",
            location: "サントリーニ、ギリシャ",
            description: "エーゲ海に伝わる古代ギリシャ神話",
            bgMusic: "ギリシャ伝統音楽"
          },
          {
            title: "砂漠の話",
            location: "サハラ、モロッコ",
            description: "サハラ砂漠を渡ったキャラバンの話",
            bgMusic: "ベルベル音楽"
          }
        ]
      },
      finalCta: {
        title: "新しいツアー体験を開始",
        description: "耳で聞く特別な旅行があなたを待っています",
        button: "ツアーラジオ開始"
      }
    },
    travelRadio: {
      keyword: "トラベルラジオ",
      metadata: {
        title: "AIトラベルラジオ | 個人カスタム旅行音声ガイド",
        description: "AIが作る個人カスタムトラベルラジオ。リアルタイムであなただけの旅行話を聞かせてくれます。"
      },
      features: {
        realtime: "リアルタイム生成",
        personalized: "個人カスタム",
        worldwide: "世界対応",
        authentic: "現地情報",
        free: "無料利用",
        comfortable: "快適視聴"
      },
      badge: "トラベルラジオ • パーソナルジャーニー",
      hero: {
        title: "あなただけの",
        subtitle: "トラベルラジオ",
        description: "AIがあなたの旅行スタイルと関心事に合わせてリアルタイムで個人カスタム旅行ラジオを作ってくれます。"
      },
      cta: {
        primary: "ラジオ開始",
        secondary: "なぜ必要？"
      },
      whyNeeded: {
        title: "なぜトラベルラジオが",
        subtitle: "必要でしょうか？",
        problems: [
          {
            title: "つまらない移動時間",
            description: "長い移動時間を意味のある時間にする方法がない"
          },
          {
            title: "スマートフォン画面疲労",
            description: "旅行中にも継続して画面を見る必要があって目が疲れる"
          },
          {
            title: "高いデータ料金",
            description: "海外でインターネット使用時データ料金が多くかかる"
          }
        ]
      },
      specialExperience: {
        title: "特別な旅行体験",
        subtitle: "トラベルラジオだけの独特さ",
        features: [
          {
            title: "個人DJサービス",
            description: "まるで個人DJがいるようなカスタム放送"
          },
          {
            title: "関心事ベース推薦",
            description: "あなたの関心事と好みに合うコンテンツ推薦"
          },
          {
            title: "世界現地情報",
            description: "180ヶ国リアルタイム現地情報と文化紹介"
          },
          {
            title: "オフラインダウンロード",
            description: "事前ダウンロードでオフラインでも視聴可能"
          },
          {
            title: "無料サービス",
            description: "すべての基本機能を無料で利用可能"
          },
          {
            title: "快適視聴",
            description: "目の疲労なく快適に情報習得"
          }
        ]
      },
      radioTypes: {
        title: "ラジオカテゴリー",
        subtitle: "多様なテーマのラジオを楽しむ",
        categories: [
          {
            title: "歴史・文化ラジオ",
            description: "各地域の深い歴史と文化の話"
          },
          {
            title: "自然・景観ラジオ",
            description: "美しい自然と景観に対する感性的な説明"
          },
          {
            title: "食べ物・料理ラジオ",
            description: "現地食文化とグルメ情報"
          },
          {
            title: "芸術・建築ラジオ",
            description: "有名建築物と芸術作品に対する解説"
          },
          {
            title: "都市生活ラジオ",
            description: "現地人の実際の生活と都市文化"
          },
          {
            title: "夜の旅行ラジオ",
            description: "夜景と夜文化に対する特別な話"
          }
        ]
      },
      howToListen: {
        title: "視聴方法",
        subtitle: "簡単な4段階で開始",
        steps: [
          {
            title: "場所入力",
            description: "現在位置や関心のある場所を入力"
          },
          {
            title: "関心事選択",
            description: "あなたの関心事と好むラジオスタイルを選択"
          },
          {
            title: "AIラジオ生成",
            description: "AIがあなただけのカスタムラジオをリアルタイムで生成"
          },
          {
            title: "快適視聴",
            description: "イヤホンをつけて快適にあなただけの旅行ラジオを楽しむ"
          }
        ]
      },
      testimonials: {
        title: "利用者後記",
        subtitle: "実際利用者の生き生きとした体験談",
        reviews: [
          {
            content: "移動時間が全然つまらなくないです。まるで個人ガイドが隣で面白い話を聞かせてくれる感じです！",
            author: "旅行ブロガー Kim○○さん"
          },
          {
            content: "目が疲れないで旅行先に対する深い情報を得ることができて本当に良いです。",
            author: "バックパッカー Lee○○さん"
          },
          {
            content: "オフラインでも聞けるので海外データ心配なく利用できる点が最高です。",
            author: "家族旅行客 Park○○さん"
          }
        ]
      },
      finalCta: {
        title: "あなただけのトラベルラジオを開始",
        description: "AIが作る個人カスタム旅行体験が待っています",
        button: "無料で開始"
      }
    }
  },
  zh: {
    docent: {
      meta: {
        keyword: "AI导览员",
        title: "AI导览员服务 | 免费博物馆美术馆解说",
        description: "无需专业导览员，AI实时提供博物馆和美术馆解说。免费体验。",
        features: {
          customized: "定制解说",
          realTime: "实时生成",
          free: "免费服务",
          flexible: "灵活日程",
          worldwide: "全球支持",
          smartphone: "智能手机访问"
        }
      },
      hero: {
        badge: "AI导览员服务 • 文化体验"
      }
    },
    travel: {
      keyword: "AI旅行向导",
      metadata: {
        title: "AI旅行向导 | 个人定制旅行规划",
        description: "AI为您打造专属旅行向导。从隐藏景点到文化体验。"
      },
      features: {
        worldwide: "全球目的地",
        realtime: "实时信息",
        personalized: "个人定制",
        hidden: "隐藏景点",
        culture: "文化体验",
        free: "免费使用"
      },
      badge: "AI旅行向导 • 个性化旅程",
      hero: {
        title: "与AI一起",
        subtitle: "特别的旅行体验",
        description: "无论世界何处，AI都能为您实时打造完美的个人专属旅行向导。"
      },
      cta: {
        primary: "开始旅行",
        secondary: "查看热门目的地"
      },
      problems: {
        title: "这些旅行烦恼",
        subtitle: "您有吗？",
        items: [
          {
            title: "不知道去哪里",
            description: "信息太多，很难找到适合自己的旅行目的地"
          },
          {
            title: "缺乏当地信息",
            description: "仅凭旅游指南很难获得生动的当地信息"
          },
          {
            title: "费用太高",
            description: "私人向导或旅游团费用超出预算"
          }
        ]
      },
      solution: {
        title: "AI为您解决",
        subtitle: "完美旅行解决方案",
        features: [
          {
            title: "世界任何地方",
            description: "180多个国家的旅游信息和实时更新"
          },
          {
            title: "AI定制推荐",
            description: "根据您的喜好和预算制定完美旅行计划"
          },
          {
            title: "个人定制",
            description: "为您独特的旅行风格量身定制的向导"
          },
          {
            title: "隐藏宝石",
            description: "只有当地人知道的特殊地点和体验"
          },
          {
            title: "深度文化",
            description: "超越简单观光的深度文化体验"
          },
          {
            title: "免费开始",
            description: "随时可以无负担免费使用"
          }
        ]
      },
      destinations: {
        title: "热门目的地",
        subtitle: "AI推荐TOP目的地",
        items: [
          {
            name: "日本",
            description: "传统与现代和谐的迷人旅行地"
          },
          {
            name: "法国",
            description: "浪漫的文化与艺术之国"
          },
          {
            name: "马尔代夫",
            description: "梦幻海洋和度假胜地"
          },
          {
            name: "希腊",
            description: "古代文明和美丽的爱琴海"
          }
        ],
        viewMore: "查看更多目的地"
      },
      howItWorks: {
        title: "使用方法",
        steps: [
          {
            title: "输入目的地",
            description: "告诉我们您想去的地方"
          },
          {
            title: "AI分析",
            description: "AI根据您的喜好制定计划"
          },
          {
            title: "开始旅行",
            description: "与定制向导一起享受旅行"
          }
        ]
      },
      finalCta: {
        title: "立即开始",
        description: "您的特殊旅程正在等待",
        button: "免费制定旅行计划"
      }
    },
    freeTravel: {
      keyword: "自由行",
      metadata: {
        title: "AI自由行向导 | 安全智能的独自旅行",
        description: "AI协助的安全自由行。从规划到当地向导，全方位支持。"
      },
      features: {
        planning: "旅行规划",
        guide: "当地向导",
        safety: "安全支持",
        budget: "预算管理",
        language: "语言支持",
        support: "24小时支持"
      },
      badge: "自由行 • AI安全向导",
      hero: {
        title: "与AI一起",
        subtitle: "安全的自由行",
        description: "即使独自一人也无需担心，AI从头到尾安全支持您的自由行。"
      },
      cta: {
        primary: "规划自由行",
        secondary: "查看安全向导"
      },
      challenges: {
        title: "自由行的困难",
        subtitle: "有这些担心吗？",
        items: [
          {
            title: "旅行规划的复杂性",
            description: "独自规划航班、住宿、行程很困难"
          },
          {
            title: "安全担忧",
            description: "独自旅行时安全是最大的担心"
          },
          {
            title: "语言障碍",
            description: "不懂当地语言，沟通困难"
          },
          {
            title: "预算管理",
            description: "很难预估需要多少费用"
          },
          {
            title: "住宿和交通",
            description: "很难找到可靠的住宿和交通工具"
          },
          {
            title: "紧急情况应对",
            description: "出现问题时独自解决困难"
          }
        ]
      },
      solutions: {
        title: "AI解决所有担心",
        subtitle: "智能自由行解决方案",
        features: [
          {
            title: "AI旅行规划",
            description: "根据喜好和预算自动生成完美旅行行程"
          },
          {
            title: "实时安全支持",
            description: "24小时安全监控和紧急情况应对指南"
          },
          {
            title: "实时翻译",
            description: "当地语言实时翻译和文化礼仪指南"
          },
          {
            title: "智能预算管理",
            description: "通过实时汇率和当地物价信息优化预算"
          },
          {
            title: "验证住宿推荐",
            description: "安全合理的住宿和交通工具推荐"
          },
          {
            title: "24小时支持",
            description: "需要帮助时随时提供AI助手支持"
          }
        ]
      },
      howItWorks: {
        title: "使用方法",
        steps: [
          {
            title: "输入旅行信息",
            description: "告诉我们目的地、时间和预算"
          },
          {
            title: "AI定制计划",
            description: "AI为您生成完美的旅行计划"
          },
          {
            title: "安全准备",
            description: "准备安全指南和紧急联系方式"
          },
          {
            title: "开始旅行",
            description: "在AI支持下开始安全的自由行"
          }
        ]
      },
      tips: {
        title: "自由行贴士",
        subtitle: "成功自由行的建议",
        items: [
          {
            title: "充分的事前准备",
            description: "提前调查目的地信息、天气、文化"
          },
          {
            title: "安装必备应用",
            description: "提前准备地图、翻译、交通、住宿应用"
          },
          {
            title: "制定安全计划",
            description: "保存紧急联系方式和领事馆信息"
          },
          {
            title: "预算余量",
            description: "准备预期预算20%的余量"
          },
          {
            title: "重要文件保管",
            description: "保管护照、签证等重要文件的副本"
          },
          {
            title: "当地网络",
            description: "联系当地韩人会或旅行者社区"
          }
        ]
      },
      finalCta: {
        title: "开始自信的自由行",
        description: "与AI同行，您可以安全地去任何地方",
        button: "免费规划自由行"
      }
    },
    tourRadio: {
      keyword: "旅游广播",
      metadata: {
        title: "AI旅游广播 | 实时旅行语音向导",
        description: "在旅行目的地实时播放的AI旅游广播。讲故事和音乐结合的特殊旅行体验。"
      },
      features: {
        realtime: "实时向导",
        storytelling: "讲故事",
        location: "基于位置",
        music: "背景音乐",
        interactive: "互动",
        worldwide: "全球支持"
      },
      badge: "旅游广播 • 互动讲故事",
      hero: {
        title: "用耳朵听的旅行",
        subtitle: "AI旅游广播",
        description: "就像专业DJ一样，AI生动地讲述旅行目的地的故事。"
      },
      cta: {
        primary: "开始广播",
        secondary: "了解特色"
      },
      problems: {
        title: "现有向导的局限",
        subtitle: "有这些遗憾吗？",
        items: [
          {
            title: "无聊的解说",
            description: "死板无趣的解说很难集中注意力"
          },
          {
            title: "以信息为主的向导",
            description: "没有感情的信息罗列缺乏感动"
          },
          {
            title: "昂贵的向导费用",
            description: "专业向导费用对旅行预算造成负担"
          },
          {
            title: "固定时间",
            description: "必须配合固定的旅游时间，不便"
          },
          {
            title: "团体旅游的局限",
            description: "不符合个人喜好的统一旅游"
          },
          {
            title: "语言障碍",
            description: "很难理解外语向导"
          }
        ]
      },
      radioFeatures: {
        title: "旅游广播的特别之处",
        subtitle: "提供全新旅行体验",
        features: [
          {
            title: "广播风格向导",
            description: "像广播DJ一样有趣生动的解说"
          },
          {
            title: "以讲故事为中心",
            description: "不是简单信息，而是通过感人故事传达"
          },
          {
            title: "基于位置的自动播放",
            description: "基于GPS在相应地点自动播放"
          },
          {
            title: "有氛围的背景音乐",
            description: "配合地点的背景音乐最大化沉浸感"
          },
          {
            title: "对话式互动",
            description: "可以通过问答进行双向沟通"
          },
          {
            title: "全球旅行目的地支持",
            description: "在180多个国家的旅行目的地可用"
          }
        ]
      },
      contentTypes: {
        title: "多样内容",
        subtitle: "选择适合您喜好的广播",
        items: [
          {
            title: "历史与文化",
            description: "深度的历史和文化故事"
          },
          {
            title: "当地生活",
            description: "当地人的真实生活故事"
          },
          {
            title: "美食与餐厅",
            description: "当地美食和隐藏餐厅信息"
          },
          {
            title: "神秘与传说",
            description: "神秘传说和有趣故事"
          }
        ]
      },
      howItWorks: {
        title: "使用方法",
        steps: [
          {
            title: "选择地点",
            description: "选择想要旅游的地点"
          },
          {
            title: "选择广播风格",
            description: "选择您喜欢的广播风格"
          },
          {
            title: "开始旅游",
            description: "戴上耳机开始特别的旅游"
          }
        ]
      },
      samplePrograms: {
        title: "示例节目",
        subtitle: "提前听听实际的旅游广播",
        programs: [
          {
            title: "埃菲尔铁塔的秘密",
            location: "法国巴黎",
            description: "埃菲尔铁塔隐藏的惊人故事",
            bgMusic: "巴黎华尔兹"
          },
          {
            title: "罗马的角斗士",
            location: "意大利罗马",
            description: "在斗兽场展开的角斗士故事",
            bgMusic: "古罗马进行曲"
          },
          {
            title: "樱花传说",
            location: "日本京都",
            description: "日本樱花蕴含的美丽传说",
            bgMusic: "日本传统音乐"
          },
          {
            title: "阿尔卑斯传说",
            location: "瑞士",
            description: "阿尔卑斯山脉流传的神秘故事",
            bgMusic: "阿尔卑斯民谣"
          },
          {
            title: "海洋神话",
            location: "希腊圣托里尼",
            description: "爱琴海流传的古希腊神话",
            bgMusic: "希腊传统音乐"
          },
          {
            title: "沙漠的故事",
            location: "摩洛哥撒哈拉",
            description: "穿越撒哈拉沙漠的商队故事",
            bgMusic: "柏柏尔音乐"
          }
        ]
      },
      finalCta: {
        title: "开始全新旅游体验",
        description: "用耳朵听的特别旅行等待着您",
        button: "开始旅游广播"
      }
    },
    travelRadio: {
      keyword: "旅行广播",
      metadata: {
        title: "AI旅行广播 | 个人定制旅行语音向导",
        description: "AI打造的个人定制旅行广播。实时为您讲述专属的旅行故事。"
      },
      features: {
        realtime: "实时生成",
        personalized: "个人定制",
        worldwide: "全球支持",
        authentic: "当地信息",
        free: "免费使用",
        comfortable: "舒适收听"
      },
      badge: "旅行广播 • 个人旅程",
      hero: {
        title: "您专属的",
        subtitle: "旅行广播",
        description: "AI根据您的旅行风格和兴趣实时打造个人定制旅行广播。"
      },
      cta: {
        primary: "开始广播",
        secondary: "为什么需要？"
      },
      whyNeeded: {
        title: "为什么需要",
        subtitle: "旅行广播？",
        problems: [
          {
            title: "无聊的移动时间",
            description: "没有方法让长途移动时间变得有意义"
          },
          {
            title: "智能手机屏幕疲劳",
            description: "旅行中也要不断看屏幕，眼睛疲劳"
          },
          {
            title: "昂贵的数据费用",
            description: "在海外使用互联网时数据费用很高"
          }
        ]
      },
      specialExperience: {
        title: "特殊旅行体验",
        subtitle: "旅行广播的独特性",
        features: [
          {
            title: "个人DJ服务",
            description: "就像有个人DJ一样的定制广播"
          },
          {
            title: "基于兴趣的推荐",
            description: "根据您的兴趣和喜好推荐内容"
          },
          {
            title: "全球当地信息",
            description: "180个国家的实时当地信息和文化介绍"
          },
          {
            title: "离线下载",
            description: "提前下载，离线也可收听"
          },
          {
            title: "免费服务",
            description: "所有基本功能免费使用"
          },
          {
            title: "舒适收听",
            description: "无眼疲劳，舒适获取信息"
          }
        ]
      },
      radioTypes: {
        title: "广播分类",
        subtitle: "享受各种主题的广播",
        categories: [
          {
            title: "历史文化广播",
            description: "各地区深度的历史和文化故事"
          },
          {
            title: "自然景观广播",
            description: "对美丽自然和景观的感性描述"
          },
          {
            title: "美食料理广播",
            description: "当地饮食文化和美食信息"
          },
          {
            title: "艺术建筑广播",
            description: "对著名建筑物和艺术作品的解说"
          },
          {
            title: "城市生活广播",
            description: "当地人的真实生活和城市文化"
          },
          {
            title: "夜间旅行广播",
            description: "关于夜景和夜生活文化的特别故事"
          }
        ]
      },
      howToListen: {
        title: "收听方法",
        subtitle: "简单4步开始",
        steps: [
          {
            title: "输入地点",
            description: "输入当前位置或感兴趣的地点"
          },
          {
            title: "选择兴趣",
            description: "选择您的兴趣和喜欢的广播风格"
          },
          {
            title: "AI广播生成",
            description: "AI实时为您生成定制广播"
          },
          {
            title: "舒适收听",
            description: "戴上耳机舒适地享受您专属的旅行广播"
          }
        ]
      },
      testimonials: {
        title: "用户评价",
        subtitle: "真实用户的生动体验",
        reviews: [
          {
            content: "移动时间一点也不无聊。就像有个人向导在旁边讲有趣故事的感觉！",
            author: "旅游博主 Kim○○"
          },
          {
            content: "眼睛不疲劳，还能获得关于旅行目的地的深度信息，真的很好。",
            author: "背包客 Lee○○"
          },
          {
            content: "可以离线收听，不用担心海外数据费用，这点最棒。",
            author: "家庭游客 Park○○"
          }
        ]
      },
      finalCta: {
        title: "开始您专属的旅行广播",
        description: "AI打造的个人定制旅行体验等待着您",
        button: "免费开始"
      }
    }
  },
  es: {
    docent: {
      meta: {
        keyword: "Docente AI",
        title: "Servicio de Docente AI | Guía Gratuita de Museos y Galerías",
        description: "Experimenta narración en tiempo real de museos y galerías con IA sin guías profesionales. Pruébalo gratis.",
        features: {
          customized: "Comentario Personalizado",
          realTime: "Generación en Tiempo Real",
          free: "Servicio Gratuito",
          flexible: "Horario Flexible",
          worldwide: "Soporte Global",
          smartphone: "Acceso por Smartphone"
        }
      },
      hero: {
        badge: "Servicio de Docente AI • Experiencia Cultural"
      }
    },
    travel: {
      keyword: "Guía de Viaje AI",
      metadata: {
        title: "Guía de Viaje AI | Planificación de Viajes Personalizada",
        description: "La IA crea tu guía de viaje personalizada. Desde gemas ocultas hasta experiencias culturales."
      },
      features: {
        worldwide: "Destinos Globales",
        realtime: "Información en Tiempo Real",
        personalized: "Personalizado",
        hidden: "Gemas Ocultas",
        culture: "Experiencia Cultural",
        free: "Uso Gratuito"
      },
      badge: "Guía de Viaje AI • Viaje Personalizado",
      hero: {
        title: "Viajar con IA",
        subtitle: "Experiencia Extraordinaria",
        description: "En cualquier parte del mundo, la IA crea la guía de viaje personalizada perfecta para ti en tiempo real."
      },
      cta: {
        primary: "Comenzar Viaje",
        secondary: "Destinos Populares"
      },
      problems: {
        title: "Preocupaciones de Viaje",
        subtitle: "¿Te Suenan Familiares?",
        items: [
          {
            title: "No sé a dónde ir",
            description: "Es difícil encontrar destinos que me convengan entre tanta información"
          },
          {
            title: "Falta de información local",
            description: "Solo las guías turísticas no pueden proporcionar información local vívida"
          },
          {
            title: "Demasiado caro",
            description: "Los costos de guía personal o tour exceden el presupuesto"
          }
        ]
      },
      solution: {
        title: "La IA lo Resuelve Todo",
        subtitle: "Solución de Viaje Perfecta",
        features: [
          {
            title: "En Cualquier Parte del Mundo",
            description: "Información de viaje de más de 180 países con actualizaciones en tiempo real"
          },
          {
            title: "Recomendaciones Personalizadas de IA",
            description: "Planes de viaje perfectos adaptados a tu gusto y presupuesto"
          },
          {
            title: "Personalizado",
            description: "Guía adaptada a tu estilo de viaje único"
          },
          {
            title: "Gemas Ocultas",
            description: "Lugares especiales y experiencias que solo conocen los locales"
          },
          {
            title: "Experiencia Cultural Profunda",
            description: "Experiencias culturales profundas más allá del simple turismo"
          },
          {
            title: "Comenzar Gratis",
            description: "Disponible gratis en cualquier momento sin carga"
          }
        ]
      },
      destinations: {
        title: "Destinos Populares",
        subtitle: "Destinos TOP Recomendados por IA",
        items: [
          {
            name: "Japón",
            description: "Destino encantador donde se armonizan tradición y modernidad"
          },
          {
            name: "Francia",
            description: "Tierra romántica de cultura y arte"
          },
          {
            name: "Maldivas",
            description: "Océano fantástico y destino de resort"
          },
          {
            name: "Grecia",
            description: "Civilización antigua y hermoso Mar Egeo"
          }
        ],
        viewMore: "Ver Más Destinos"
      },
      howItWorks: {
        title: "Cómo Funciona",
        steps: [
          {
            title: "Introducir Destino",
            description: "Dinos a dónde quieres ir"
          },
          {
            title: "Análisis de IA",
            description: "La IA crea un plan adaptado a tu gusto"
          },
          {
            title: "Comenzar Viaje",
            description: "Disfruta tu viaje con guía personalizada"
          }
        ]
      },
      finalCta: {
        title: "Comenzar Ahora Mismo",
        description: "Tu viaje especial te espera",
        button: "Planear Viaje Gratis"
      }
    },
    freeTravel: {
      keyword: "Viaje Libre",
      metadata: {
        title: "Guía de Viaje Libre AI | Viaje Solo Seguro e Inteligente",
        description: "Viaje libre seguro con asistencia de IA. Apoyo en todo desde planificación hasta guía local."
      },
      features: {
        planning: "Planificación de Viaje",
        guide: "Guía Local",
        safety: "Apoyo de Seguridad",
        budget: "Gestión de Presupuesto",
        language: "Apoyo de Idioma",
        support: "Apoyo 24/7"
      },
      badge: "Viaje Libre • Guía de Seguridad AI",
      hero: {
        title: "Viaje Solo con IA",
        subtitle: "Viaje Solo Seguro",
        description: "Incluso solo, sin preocupaciones. La IA apoya tu viaje libre de forma segura de principio a fin."
      },
      cta: {
        primary: "Planear Viaje Solo",
        secondary: "Guía de Seguridad"
      },
      challenges: {
        title: "Dificultades del Viaje Solo",
        subtitle: "¿Estas Preocupaciones?",
        items: [
          {
            title: "Complejidad de planificación de viaje",
            description: "Difícil planear vuelos, alojamiento, itinerario solo"
          },
          {
            title: "Preocupaciones de seguridad",
            description: "La seguridad es la mayor preocupación al viajar solo"
          },
          {
            title: "Barreras del idioma",
            description: "Comunicación difícil sin conocer el idioma local"
          },
          {
            title: "Gestión de presupuesto",
            description: "Difícil predecir cuánto dinero se necesitará"
          },
          {
            title: "Alojamiento y transporte",
            description: "Difícil encontrar alojamiento y transporte confiables"
          },
          {
            title: "Situaciones de emergencia",
            description: "Difícil manejar problemas solo"
          }
        ]
      },
      solutions: {
        title: "La IA Resuelve Todas las Preocupaciones",
        subtitle: "Solución de Viaje Solo Inteligente",
        features: [
          {
            title: "Planificación de Viaje AI",
            description: "Auto-generar itinerario perfecto para tu gusto y presupuesto"
          },
          {
            title: "Apoyo de Seguridad en Tiempo Real",
            description: "Monitoreo de seguridad 24/7 y guía de respuesta de emergencia"
          },
          {
            title: "Traducción en Tiempo Real",
            description: "Traducción en tiempo real del idioma local y guía de modales culturales"
          },
          {
            title: "Gestión de Presupuesto Inteligente",
            description: "Optimización de presupuesto con tipos de cambio en tiempo real y precios locales"
          },
          {
            title: "Recomendaciones de Alojamiento Verificado",
            description: "Recomendaciones de alojamiento y transporte seguro y razonable"
          },
          {
            title: "Apoyo 24/7",
            description: "Apoyo de asistente IA cuando necesites ayuda"
          }
        ]
      },
      howItWorks: {
        title: "Cómo Usar",
        steps: [
          {
            title: "Introducir Información de Viaje",
            description: "Dinos destino, duración y presupuesto"
          },
          {
            title: "Plan Personalizado de IA",
            description: "La IA crea tu plan de viaje perfecto"
          },
          {
            title: "Preparación de Seguridad",
            description: "Preparar guía de seguridad y contactos de emergencia"
          },
          {
            title: "Comenzar Viaje",
            description: "Comenzar viaje solo seguro con apoyo de IA"
          }
        ]
      },
      tips: {
        title: "Consejos de Viaje Solo",
        subtitle: "Consejos para Viaje Solo Exitoso",
        items: [
          {
            title: "Preparación Exhaustiva",
            description: "Investigar información del destino, clima, cultura por adelantado"
          },
          {
            title: "Instalar Apps Esenciales",
            description: "Preparar apps de mapas, traducción, transporte, alojamiento por adelantado"
          },
          {
            title: "Planificación de Seguridad",
            description: "Guardar contactos de emergencia e información de embajada"
          },
          {
            title: "Margen de Presupuesto",
            description: "Preparar 20% extra del presupuesto esperado"
          },
          {
            title: "Almacenamiento de Documentos Importantes",
            description: "Mantener copias de pasaporte, visa, documentos importantes"
          },
          {
            title: "Red Local",
            description: "Conectar con comunidad coreana local o comunidad de viajeros"
          }
        ]
      },
      finalCta: {
        title: "Comenzar Viaje Solo Confiado",
        description: "Con IA, puedes ir a cualquier lugar de forma segura",
        button: "Planear Viaje Solo Gratis"
      }
    },
    tourRadio: {
      keyword: "Radio de Tour",
      metadata: {
        title: "Radio de Tour AI | Guía de Voz de Viaje en Tiempo Real",
        description: "Radio de tour AI que te cuenta en tiempo real en destinos de viaje. Experiencia de viaje especial con narración y música."
      },
      features: {
        realtime: "Guía en Tiempo Real",
        storytelling: "Narración",
        location: "Basado en Ubicación",
        music: "Música de Fondo",
        interactive: "Interactivo",
        worldwide: "Soporte Global"
      },
      badge: "Radio de Tour • Narración Interactiva",
      hero: {
        title: "Viajar Escuchando",
        subtitle: "Radio de Tour AI",
        description: "Como un DJ profesional, la IA cuenta vívidamente las historias de destinos de viaje."
      },
      cta: {
        primary: "Comenzar Radio",
        secondary: "Conocer Características"
      },
      problems: {
        title: "Limitaciones de Guías Existentes",
        subtitle: "¿Estas Decepciones?",
        items: [
          {
            title: "Explicaciones aburridas",
            description: "Difícil concentrarse en comentarios rígidos y sin interés"
          },
          {
            title: "Guía centrada en información",
            description: "Falta de emoción con listado de información sin emociones"
          },
          {
            title: "Costos caros de guía",
            description: "Los costos de guía profesional cargan el presupuesto de viaje"
          },
          {
            title: "Horario fijo",
            description: "Inconveniente tener que seguir horario de tour fijo"
          },
          {
            title: "Limitaciones de tour grupal",
            description: "Tours uniformes que no coinciden con preferencias personales"
          },
          {
            title: "Barreras del idioma",
            description: "Difícil entender guías en idiomas extranjeros"
          }
        ]
      },
      radioFeatures: {
        title: "Especialidad del Radio de Tour",
        subtitle: "Proporciona Nueva Experiencia de Viaje",
        features: [
          {
            title: "Guía Estilo Radio",
            description: "Comentario divertido y animado como DJ de radio"
          },
          {
            title: "Enfoque en Narración",
            description: "Entregado como historias conmovedoras, no información simple"
          },
          {
            title: "Reproducción Automática Basada en Ubicación",
            description: "Reproducción automática basada en GPS en ubicaciones relevantes"
          },
          {
            title: "Música de Fondo Atmosférica",
            description: "Maximizar inmersión con música de fondo adecuada para el lugar"
          },
          {
            title: "Comunicación Interactiva",
            description: "Comunicación bidireccional posible a través de preguntas y respuestas"
          },
          {
            title: "Soporte de Destinos Globales",
            description: "Disponible en más de 180 países"
          }
        ]
      },
      contentTypes: {
        title: "Contenido Variado",
        subtitle: "Elige radio que se adapte a tu gusto",
        items: [
          {
            title: "Historia y Cultura",
            description: "Historias profundas de historia y cultura"
          },
          {
            title: "Vida Local",
            description: "Historias de vida real de locales"
          },
          {
            title: "Comida y Restaurantes",
            description: "Información de cultura alimentaria local y restaurantes ocultos"
          },
          {
            title: "Misterio y Leyendas",
            description: "Leyendas misteriosas e historias interesantes"
          }
        ]
      },
      howItWorks: {
        title: "Cómo Usar",
        steps: [
          {
            title: "Seleccionar Ubicación",
            description: "Elige el lugar que quieres recorrer"
          },
          {
            title: "Elegir Estilo de Radio",
            description: "Elige tu estilo de radio preferido"
          },
          {
            title: "Comenzar Tour",
            description: "Ponte auriculares y comienza tu tour especial"
          }
        ]
      },
      samplePrograms: {
        title: "Programas de Muestra",
        subtitle: "Escucha radio de tour real por adelantado",
        programs: [
          {
            title: "Secretos de Torre Eiffel",
            location: "París, Francia",
            description: "Historias asombrosas ocultas de Torre Eiffel",
            bgMusic: "Vals Parisino"
          },
          {
            title: "Gladiadores Romanos",
            location: "Roma, Italia",
            description: "Historias de gladiadores en el Coliseo",
            bgMusic: "Marcha Romana Antigua"
          },
          {
            title: "Leyenda de Flor de Cerezo",
            location: "Kioto, Japón",
            description: "Hermosa leyenda de flores de cerezo japonesas",
            bgMusic: "Música Tradicional Japonesa"
          },
          {
            title: "Leyenda Alpina",
            location: "Suiza",
            description: "Historias misteriosas transmitidas en los Alpes",
            bgMusic: "Canción Popular Alpina"
          },
          {
            title: "Mitología del Mar",
            location: "Santorini, Grecia",
            description: "Mitología griega antigua del Mar Egeo",
            bgMusic: "Música Tradicional Griega"
          },
          {
            title: "Historias del Desierto",
            location: "Sahara, Marruecos",
            description: "Historias de caravanas cruzando el Sahara",
            bgMusic: "Música Bereber"
          }
        ]
      },
      finalCta: {
        title: "Comenzar Nueva Experiencia de Tour",
        description: "Experiencia especial de viaje escuchando te espera",
        button: "Comenzar Radio de Tour"
      }
    },
    travelRadio: {
      keyword: "Radio de Viaje",
      metadata: {
        title: "Radio de Viaje AI | Guía de Voz de Viaje Personalizada",
        description: "Radio de viaje personalizada creada por IA. Te contamos tus historias de viaje personalizadas en tiempo real."
      },
      features: {
        realtime: "Generación en Tiempo Real",
        personalized: "Personalizada",
        worldwide: "Soporte Global",
        authentic: "Información Local",
        free: "Uso Gratuito",
        comfortable: "Escucha Cómoda"
      },
      badge: "Radio de Viaje • Viaje Personal",
      hero: {
        title: "Tu Propia",
        subtitle: "Radio de Viaje",
        description: "La IA crea radio de viaje personalizada en tiempo real adaptada a tu estilo de viaje e intereses."
      },
      cta: {
        primary: "Comenzar Radio",
        secondary: "¿Por Qué Necesario?"
      },
      whyNeeded: {
        title: "¿Por Qué Radio de Viaje",
        subtitle: "Es Necesaria?",
        problems: [
          {
            title: "Tiempo de viaje aburrido",
            description: "No hay forma significativa de pasar tiempo de viaje largo"
          },
          {
            title: "Fatiga de pantalla de smartphone",
            description: "Los ojos se cansan de mirar constantemente la pantalla mientras viajas"
          },
          {
            title: "Cargos de datos caros",
            description: "Cargos altos de datos al usar internet en el extranjero"
          }
        ]
      },
      specialExperience: {
        title: "Experiencia de Viaje Especial",
        subtitle: "Singularidad del Radio de Viaje",
        features: [
          {
            title: "Servicio de DJ Personal",
            description: "Transmisión personalizada como tener DJ personal"
          },
          {
            title: "Recomendaciones Basadas en Intereses",
            description: "Recomendaciones de contenido basadas en tus intereses y preferencias"
          },
          {
            title: "Información Local Global",
            description: "Información local en tiempo real e introducción cultural de 180 países"
          },
          {
            title: "Descarga Offline",
            description: "Descargar por adelantado para escucha offline"
          },
          {
            title: "Servicio Gratuito",
            description: "Todas las características básicas disponibles gratis"
          },
          {
            title: "Escucha Cómoda",
            description: "Adquisición cómoda de información sin fatiga ocular"
          }
        ]
      },
      radioTypes: {
        title: "Categorías de Radio",
        subtitle: "Disfruta radio de varios temas",
        categories: [
          {
            title: "Radio de Historia y Cultura",
            description: "Historias profundas de historia y cultura de cada región"
          },
          {
            title: "Radio de Naturaleza y Paisaje",
            description: "Descripciones emocionales de hermosa naturaleza y paisaje"
          },
          {
            title: "Radio de Comida y Cocina",
            description: "Cultura alimentaria local e información de restaurantes"
          },
          {
            title: "Radio de Arte y Arquitectura",
            description: "Comentario sobre edificios famosos y obras de arte"
          },
          {
            title: "Radio de Vida Urbana",
            description: "Vida real y cultura urbana de locales"
          },
          {
            title: "Radio de Viaje Nocturno",
            description: "Historias especiales sobre vistas nocturnas y cultura nocturna"
          }
        ]
      },
      howToListen: {
        title: "Cómo Escuchar",
        subtitle: "Comenzar con simples 4 pasos",
        steps: [
          {
            title: "Introducir Ubicación",
            description: "Introduce tu ubicación actual o lugar de interés"
          },
          {
            title: "Seleccionar Intereses",
            description: "Elige tus intereses y estilo de radio preferido"
          },
          {
            title: "Generación de Radio AI",
            description: "La IA genera radio personalizada para ti en tiempo real"
          },
          {
            title: "Escucha Cómoda",
            description: "Ponte auriculares y disfruta cómodamente tu radio de viaje personalizada"
          }
        ]
      },
      testimonials: {
        title: "Reseñas de Usuarios",
        subtitle: "Experiencias reales de usuarios actuales",
        reviews: [
          {
            content: "El tiempo de viaje nunca es aburrido. ¡Se siente como tener guía personal contando historias interesantes!",
            author: "Blogger de Viajes Kim○○"
          },
          {
            content: "Genial obtener información profunda del destino de viaje sin fatiga ocular.",
            author: "Mochilero Lee○○"
          },
          {
            content: "La mejor característica es la escucha offline sin preocuparse por datos en el extranjero.",
            author: "Viajero Familiar Park○○"
          }
        ]
      },
      finalCta: {
        title: "Comenzar Tu Propia Radio de Viaje",
        description: "Experiencia de viaje personalizada creada por IA te espera",
        button: "Comenzar Gratis"
      }
    }
  }
};

// 기존 번역에 다국어 버전 추가
function addMultilingualTranslations() {
  // 영어, 일본어, 중국어, 스페인어 번역 추가
  Object.keys(multilingualTranslations).forEach(lang => {
    if (lang !== 'ko') {
      Object.keys(multilingualTranslations[lang]).forEach(section => {
        if (!translations[lang]) {
          translations[lang] = {};
        }
        if (!translations[lang][section]) {
          translations[lang][section] = {};
        }
        
        // 새로운 번역으로 교체
        Object.assign(translations[lang][section], multilingualTranslations[lang][section]);
      });
    }
  });

  return translations;
}

// 업데이트된 translations 저장
function saveMultilingualTranslations() {
  const updatedTranslations = addMultilingualTranslations();
  
  // 백업 생성
  const backupPath = path.join(__dirname, `translations-multilingual-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(translations, null, 2));
  
  // 업데이트된 파일 저장
  fs.writeFileSync(translationsPath, JSON.stringify(updatedTranslations, null, 2));
  
  console.log('✅ 다국어 번역이 완성되었습니다!');
  console.log(`📁 백업 파일: ${backupPath}`);
  console.log('🌐 추가된 언어:');
  console.log('  - 영어 (en): 완전 번역');
  console.log('  - 일본어 (ja): 완전 번역');
  console.log('  - 중국어 (zh): 완전 번역');
  console.log('  - 스페인어 (es): 완전 번역');
  console.log('📝 다음 단계:');
  console.log('1. 번역 품질 검토');
  console.log('2. 최종 빌드 테스트');
  console.log('3. 배포 준비');
}

saveMultilingualTranslations();