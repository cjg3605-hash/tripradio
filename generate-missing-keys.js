const fs = require('fs');
const path = require('path');

// translations.json 파일 읽기
const translationsPath = path.join(__dirname, 'public/locales/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// 누락된 키를 위한 템플릿 생성 함수
function generateMissingKeysTemplate() {
  const missingKeys = {
    docent: {
      meta: {
        keyword: "AI 도슨트",
        title: "AI 도슨트 서비스 | 무료 박물관 미술관 해설",
        description: "전문 도슨트 없이도 AI가 실시간으로 박물관과 미술관 해설을 제공합니다. 무료로 체험해보세요.",
        features: {
          customized: "맞춤형 해설",
          realTime: "실시간 생성",
          free: "무료 서비스",
          flexible: "유연한 일정",
          worldwide: "전세계 지원",
          smartphone: "스마트폰 접근"
        }
      },
      hero: {
        badge: "AI Docent Service • Cultural Experience"
      }
    },
    travel: {
      keyword: "AI 여행 가이드",
      metadata: {
        title: "AI 여행 가이드 | 개인 맞춤형 여행 계획",
        description: "AI가 당신만을 위한 여행 가이드를 만들어드립니다. 숨겨진 명소부터 문화 체험까지."
      },
      features: {
        worldwide: "전세계 여행지",
        realtime: "실시간 정보",
        personalized: "개인 맞춤",
        hidden: "숨겨진 명소",
        culture: "문화 체험",
        free: "무료 이용"
      },
      badge: "AI Travel Guide • Personalized Journey",
      hero: {
        title: "AI와 함께하는",
        subtitle: "특별한 여행 경험",
        description: "전 세계 어디든, AI가 당신만을 위한 완벽한 여행 가이드를 실시간으로 만들어드립니다."
      },
      cta: {
        primary: "여행 시작하기",
        secondary: "인기 여행지 보기"
      },
      problems: {
        title: "이런 여행 고민",
        subtitle: "있으시죠?",
        items: [
          {
            title: "어디로 가야 할지 모르겠어요",
            description: "너무 많은 정보 속에서 내게 맞는 여행지를 찾기 어려워요"
          },
          {
            title: "현지 정보가 부족해요",
            description: "가이드북만으로는 생생한 현지 정보를 얻기 힘들어요"
          },
          {
            title: "비용이 너무 많이 들어요",
            description: "개인 가이드나 투어 비용이 예산을 초과해요"
          }
        ]
      },
      solution: {
        title: "AI가 해결해드립니다",
        subtitle: "완벽한 여행 솔루션",
        features: [
          {
            title: "전세계 어디든",
            description: "180개국 이상의 여행 정보와 실시간 업데이트"
          },
          {
            title: "AI 맞춤 추천",
            description: "당신의 취향과 예산에 맞는 완벽한 여행 계획"
          },
          {
            title: "개인 맞춤형",
            description: "나만의 특별한 여행 스타일에 맞춘 가이드"
          },
          {
            title: "숨겨진 보석",
            description: "현지인만 아는 특별한 장소와 체험"
          },
          {
            title: "문화 깊이있게",
            description: "단순 관광을 넘어선 깊이있는 문화 체험"
          },
          {
            title: "무료로 시작",
            description: "부담 없이 언제든 무료로 이용 가능"
          }
        ]
      },
      destinations: {
        title: "인기 여행지",
        subtitle: "AI 추천 TOP 여행지",
        items: [
          {
            name: "일본",
            description: "전통과 현대가 조화로운 매력적인 여행지"
          },
          {
            name: "프랑스",
            description: "로맨틱한 문화와 예술의 나라"
          },
          {
            name: "몰디브",
            description: "환상적인 바다와 휴양지"
          },
          {
            name: "그리스",
            description: "고대 문명과 아름다운 에게해"
          }
        ],
        viewMore: "더 많은 여행지 보기"
      },
      howItWorks: {
        title: "이용 방법",
        steps: [
          {
            title: "목적지 입력",
            description: "가고 싶은 곳을 알려주세요"
          },
          {
            title: "AI 분석",
            description: "취향에 맞는 계획을 AI가 생성합니다"
          },
          {
            title: "여행 시작",
            description: "맞춤형 가이드와 함께 여행을 즐기세요"
          }
        ]
      },
      finalCta: {
        title: "지금 바로 시작하세요",
        description: "당신만의 특별한 여행이 기다리고 있습니다",
        button: "무료 여행 계획하기"
      }
    },
    freeTravel: {
      keyword: "자유여행",
      metadata: {
        title: "AI 자유여행 가이드 | 안전하고 스마트한 혼자 여행",
        description: "AI가 도와주는 안전한 자유여행. 계획부터 현지 가이드까지 모든 것을 지원합니다."
      },
      features: {
        planning: "여행 계획",
        guide: "현지 가이드",
        safety: "안전 지원",
        budget: "예산 관리",
        language: "언어 지원",
        support: "24시간 지원"
      },
      badge: "Free Travel • AI Safety Guide",
      hero: {
        title: "AI와 함께하는",
        subtitle: "안전한 자유여행",
        description: "혼자여도 걱정없이, AI가 당신의 자유여행을 처음부터 끝까지 안전하게 지원합니다."
      },
      cta: {
        primary: "자유여행 계획하기",
        secondary: "안전 가이드 보기"
      },
      challenges: {
        title: "자유여행의 어려움",
        subtitle: "이런 걱정들이 있으시죠?",
        items: [
          {
            title: "여행 계획의 복잡함",
            description: "항공편, 숙소, 일정을 혼자 계획하기 어려워요"
          },
          {
            title: "안전에 대한 우려",
            description: "혼자 여행할 때 안전이 가장 걱정돼요"
          },
          {
            title: "언어 장벽",
            description: "현지 언어를 몰라서 소통이 어려워요"
          },
          {
            title: "예산 관리",
            description: "얼마나 돈이 들지 예상하기 힘들어요"
          },
          {
            title: "숙소 및 교통",
            description: "믿을 만한 숙소와 교통편을 찾기 어려워요"
          },
          {
            title: "응급 상황 대처",
            description: "문제가 생겼을 때 혼자 해결하기 힘들어요"
          }
        ]
      },
      solutions: {
        title: "AI가 모든 걱정을 해결합니다",
        subtitle: "스마트한 자유여행 솔루션",
        features: [
          {
            title: "AI 여행 계획",
            description: "취향과 예산에 맞는 완벽한 여행 일정을 자동 생성"
          },
          {
            title: "실시간 안전 지원",
            description: "24시간 안전 모니터링과 응급상황 대응 가이드"
          },
          {
            title: "실시간 번역",
            description: "현지어 실시간 번역과 문화 매너 가이드"
          },
          {
            title: "스마트 예산 관리",
            description: "실시간 환율과 현지 물가 정보로 예산 최적화"
          },
          {
            title: "검증된 숙소 추천",
            description: "안전하고 합리적인 숙소와 교통편 추천"
          },
          {
            title: "24시간 지원",
            description: "언제든 도움이 필요할 때 AI 어시스턴트 지원"
          }
        ]
      },
      howItWorks: {
        title: "이용 방법",
        steps: [
          {
            title: "여행 정보 입력",
            description: "목적지와 기간, 예산을 알려주세요"
          },
          {
            title: "AI 맞춤 계획",
            description: "AI가 당신만의 완벽한 여행 계획을 생성합니다"
          },
          {
            title: "안전 준비",
            description: "안전 가이드와 응급 연락처를 준비합니다"
          },
          {
            title: "여행 시작",
            description: "AI 지원과 함께 안전한 자유여행을 시작하세요"
          }
        ]
      },
      tips: {
        title: "자유여행 팁",
        subtitle: "성공적인 자유여행을 위한 조언",
        items: [
          {
            title: "철저한 사전 준비",
            description: "목적지 정보, 날씨, 문화를 미리 조사하세요"
          },
          {
            title: "필수 앱 설치",
            description: "지도, 번역, 교통, 숙박 앱을 미리 준비하세요"
          },
          {
            title: "안전 계획 수립",
            description: "응급 연락처와 대사관 정보를 저장하세요"
          },
          {
            title: "예산 여유분",
            description: "예상 예산의 20% 여유분을 준비하세요"
          },
          {
            title: "중요 서류 보관",
            description: "여권, 비자 등 중요 서류의 사본을 보관하세요"
          },
          {
            title: "현지 네트워크",
            description: "현지 한인회나 여행자 커뮤니티에 연결하세요"
          }
        ]
      },
      finalCta: {
        title: "자신감 있는 자유여행을 시작하세요",
        description: "AI와 함께라면 어디든 안전하게 갈 수 있습니다",
        button: "무료 자유여행 계획하기"
      }
    },
    tourRadio: {
      keyword: "투어 라디오",
      metadata: {
        title: "AI 투어 라디오 | 실시간 여행 음성 가이드",
        description: "여행지에서 실시간으로 들려주는 AI 투어 라디오. 스토리텔링과 음악이 함께하는 특별한 여행 경험."
      },
      features: {
        realtime: "실시간 가이드",
        storytelling: "스토리텔링",
        location: "위치 기반",
        music: "배경 음악",
        interactive: "상호작용",
        worldwide: "전세계 지원"
      },
      badge: "Tour Radio • Interactive Storytelling",
      hero: {
        title: "귀로 듣는 여행",
        subtitle: "AI 투어 라디오",
        description: "마치 전문 DJ가 들려주는 것처럼, AI가 여행지의 이야기를 생생하게 들려드립니다."
      },
      cta: {
        primary: "라디오 시작하기",
        secondary: "특징 알아보기"
      },
      problems: {
        title: "기존 가이드의 한계",
        subtitle: "이런 아쉬움들이 있으셨죠?",
        items: [
          {
            title: "지루한 설명",
            description: "딱딱하고 재미없는 해설로 집중하기 어려워요"
          },
          {
            title: "정보 위주의 가이드",
            description: "감정 없는 정보 나열로 감동이 부족해요"
          },
          {
            title: "비싼 가이드 비용",
            description: "전문 가이드 비용이 여행 예산에 부담이 돼요"
          },
          {
            title: "정해진 시간",
            description: "정해진 투어 시간에 맞춰야 해서 불편해요"
          },
          {
            title: "단체 투어의 한계",
            description: "개인 취향과 맞지 않는 획일적인 투어예요"
          },
          {
            title: "언어 장벽",
            description: "외국어 가이드를 이해하기 어려워요"
          }
        ]
      },
      radioFeatures: {
        title: "투어 라디오만의 특별함",
        subtitle: "새로운 여행 경험을 제공합니다",
        features: [
          {
            title: "라디오 스타일 가이드",
            description: "마치 라디오 DJ처럼 재미있고 생동감 있는 해설"
          },
          {
            title: "스토리텔링 중심",
            description: "단순 정보가 아닌 감동적인 이야기로 전달"
          },
          {
            title: "위치 기반 자동 재생",
            description: "GPS 기반으로 해당 장소에서 자동 재생"
          },
          {
            title: "분위기 있는 배경음악",
            description: "장소에 어울리는 배경음악과 함께 몰입감 극대화"
          },
          {
            title: "대화형 인터랙션",
            description: "질문하고 답하는 양방향 소통 가능"
          },
          {
            title: "전세계 여행지 지원",
            description: "180개국 이상의 여행지에서 이용 가능"
          }
        ]
      },
      contentTypes: {
        title: "다양한 컨텐츠",
        subtitle: "당신의 취향에 맞는 라디오를 선택하세요",
        items: [
          {
            title: "역사 & 문화",
            description: "깊이 있는 역사와 문화 이야기"
          },
          {
            title: "현지 생활",
            description: "현지인들의 실제 생활 이야기"
          },
          {
            title: "음식 & 맛집",
            description: "현지 음식과 숨은 맛집 정보"
          },
          {
            title: "미스터리 & 전설",
            description: "신비로운 전설과 재미있는 이야기"
          }
        ]
      },
      howItWorks: {
        title: "이용 방법",
        steps: [
          {
            title: "장소 선택",
            description: "투어하고 싶은 장소를 선택하세요"
          },
          {
            title: "라디오 스타일 선택",
            description: "원하는 스타일의 라디오를 고르세요"
          },
          {
            title: "투어 시작",
            description: "이어폰을 끼고 특별한 투어를 시작하세요"
          }
        ]
      },
      samplePrograms: {
        title: "샘플 프로그램",
        subtitle: "실제 투어 라디오를 미리 들어보세요",
        programs: [
          {
            title: "에펠탑의 비밀",
            location: "파리, 프랑스",
            description: "에펠탑에 숨겨진 놀라운 이야기들",
            bgMusic: "파리지앵 왈츠"
          },
          {
            title: "로마의 검투사",
            location: "로마, 이탈리아", 
            description: "콜로세움에서 펼쳐진 검투사들의 이야기",
            bgMusic: "고대 로마 행진곡"
          },
          {
            title: "벚꽃의 전설",
            location: "교토, 일본",
            description: "일본 벚꽃에 담긴 아름다운 전설",
            bgMusic: "일본 전통 음악"
          },
          {
            title: "알프스의 전설",
            location: "스위스",
            description: "알프스 산맥에 전해져 내려오는 신비한 이야기",
            bgMusic: "알프스 민요"
          },
          {
            title: "바다의 신화",
            location: "산토리니, 그리스",
            description: "에게해에 전해지는 고대 그리스 신화",
            bgMusic: "그리스 전통 음악"
          },
          {
            title: "사막의 이야기",
            location: "사하라, 모로코",
            description: "사하라 사막을 건너온 대상들의 이야기",
            bgMusic: "베르베르 음악"
          }
        ]
      },
      finalCta: {
        title: "새로운 투어 경험을 시작하세요",
        description: "귀로 듣는 특별한 여행이 당신을 기다립니다",
        button: "투어 라디오 시작하기"
      }
    },
    travelRadio: {
      keyword: "트래블 라디오",
      metadata: {
        title: "AI 트래블 라디오 | 개인맞춤 여행 음성 가이드",
        description: "AI가 만드는 개인 맞춤형 트래블 라디오. 실시간으로 당신만을 위한 여행 이야기를 들려드립니다."
      },
      features: {
        realtime: "실시간 생성",
        personalized: "개인 맞춤",
        worldwide: "전세계 지원", 
        authentic: "현지 정보",
        free: "무료 이용",
        comfortable: "편안한 청취"
      },
      badge: "Travel Radio • Personal Journey",
      hero: {
        title: "당신만의",
        subtitle: "트래블 라디오",
        description: "AI가 당신의 여행 스타일과 관심사에 맞춰 실시간으로 개인 맞춤형 여행 라디오를 만들어드립니다."
      },
      cta: {
        primary: "라디오 시작하기",
        secondary: "왜 필요한가요?"
      },
      whyNeeded: {
        title: "왜 트래블 라디오가",
        subtitle: "필요할까요?",
        problems: [
          {
            title: "지루한 이동 시간",
            description: "긴 이동 시간을 의미있게 보낼 방법이 없어요"
          },
          {
            title: "스마트폰 화면 피로",
            description: "여행 중에도 계속 화면을 봐야 해서 눈이 피로해요"
          },
          {
            title: "비싼 데이터 요금",
            description: "해외에서 인터넷 사용하면 데이터 요금이 많이 나와요"
          }
        ]
      },
      specialExperience: {
        title: "특별한 여행 경험",
        subtitle: "트래블 라디오만의 독특함",
        features: [
          {
            title: "개인 DJ 서비스",
            description: "마치 개인 DJ가 있는 것처럼 맞춤형 방송"
          },
          {
            title: "관심사 기반 추천",
            description: "당신의 관심사와 취향에 맞는 콘텐츠 추천"
          },
          {
            title: "전세계 현지 정보",
            description: "180개국 실시간 현지 정보와 문화 소개"
          },
          {
            title: "오프라인 다운로드",
            description: "미리 다운로드하여 오프라인에서도 청취 가능"
          },
          {
            title: "무료 서비스",
            description: "모든 기본 기능을 무료로 이용 가능"
          },
          {
            title: "편안한 청취",
            description: "눈의 피로 없이 편안하게 정보 습득"
          }
        ]
      },
      radioTypes: {
        title: "라디오 카테고리",
        subtitle: "다양한 주제의 라디오를 즐기세요",
        categories: [
          {
            title: "역사 & 문화 라디오",
            description: "각 지역의 깊이 있는 역사와 문화 이야기"
          },
          {
            title: "자연 & 경관 라디오", 
            description: "아름다운 자연과 경관에 대한 감성적인 설명"
          },
          {
            title: "음식 & 요리 라디오",
            description: "현지 음식 문화와 맛집 정보"
          },
          {
            title: "예술 & 건축 라디오",
            description: "유명 건축물과 예술 작품에 대한 해설"
          },
          {
            title: "도시 생활 라디오",
            description: "현지인들의 실제 생활과 도시 문화"
          },
          {
            title: "밤의 여행 라디오",
            description: "야경과 밤 문화에 대한 특별한 이야기"
          }
        ]
      },
      howToListen: {
        title: "청취 방법",
        subtitle: "간단한 4단계로 시작하세요",
        steps: [
          {
            title: "장소 입력",
            description: "현재 위치나 관심 있는 장소를 입력하세요"
          },
          {
            title: "관심사 선택",
            description: "당신의 관심사와 선호하는 라디오 스타일을 선택하세요"
          },
          {
            title: "AI 라디오 생성",
            description: "AI가 당신만을 위한 맞춤 라디오를 실시간으로 생성합니다"
          },
          {
            title: "편안한 청취",
            description: "이어폰을 끼고 편안하게 당신만의 여행 라디오를 즐기세요"
          }
        ]
      },
      testimonials: {
        title: "이용자 후기",
        subtitle: "실제 이용자들의 생생한 경험담",
        reviews: [
          {
            content: "이동 시간이 전혀 지루하지 않아요. 마치 개인 가이드가 옆에서 재미있는 이야기를 들려주는 느낌이에요!",
            author: "여행블로거 김○○님"
          },
          {
            content: "눈이 피로하지 않으면서도 여행지에 대한 깊이 있는 정보를 얻을 수 있어서 정말 좋아요.",
            author: "배낭여행객 이○○님"
          },
          {
            content: "오프라인에서도 들을 수 있어서 해외 데이터 걱정 없이 이용할 수 있는 점이 최고예요.",
            author: "가족여행객 박○○님"
          }
        ]
      },
      finalCta: {
        title: "당신만의 트래블 라디오를 시작하세요",
        description: "AI가 만드는 개인 맞춤형 여행 경험이 기다립니다",
        button: "무료로 시작하기"
      }
    }
  };

  return missingKeys;
}

// 기존 translations에 누락된 키 추가
function addMissingKeys() {
  const missingKeys = generateMissingKeysTemplate();
  
  // 각 언어별로 추가
  Object.keys(missingKeys).forEach(section => {
    if (!translations.ko[section]) {
      translations.ko[section] = {};
    }
    
    // 한국어 추가
    Object.assign(translations.ko[section], missingKeys[section]);
    
    // 다른 언어들도 기본적으로 한국어 버전으로 추가 (나중에 번역 필요)
    ['en', 'ja', 'zh', 'es'].forEach(lang => {
      if (!translations[lang]) {
        translations[lang] = {};
      }
      if (!translations[lang][section]) {
        translations[lang][section] = {};
      }
      
      // 임시로 한국어 버전을 복사 (나중에 실제 번역으로 교체 필요)
      Object.assign(translations[lang][section], missingKeys[section]);
    });
  });

  return translations;
}

// 업데이트된 translations 저장
function saveUpdatedTranslations() {
  const updatedTranslations = addMissingKeys();
  
  // 백업 생성
  const backupPath = path.join(__dirname, `translations-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(translations, null, 2));
  
  // 업데이트된 파일 저장
  fs.writeFileSync(translationsPath, JSON.stringify(updatedTranslations, null, 2));
  
  console.log('✅ 누락된 번역키가 추가되었습니다!');
  console.log(`📁 백업 파일: ${backupPath}`);
  console.log('📝 다음 단계:');
  console.log('1. 영어, 일본어, 중국어, 스페인어 번역 추가');
  console.log('2. 번역 품질 검토');
  console.log('3. 빌드 테스트');
}

saveUpdatedTranslations();