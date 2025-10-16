// Universal Persona Catalog
// 15개 글로벌 전문가 페르소나 정의 및 문화적 적응 설정

import { 
  GlobalPersona, 
  GlobalPersonaType, 
  CulturalRegion, 
  PersonaCulturalAdaptation 
} from './types';

/**
 * 🌍 글로벌 페르소나 카탈로그
 * 전 세계 모든 관광지에 적용 가능한 15개 전문가 페르소나
 */
export const GLOBAL_PERSONA_CATALOG: Record<GlobalPersonaType, GlobalPersona> = {
  // 🏗️ 건축 & 공학 전문가 (현대 건물, 타워, 교량)
  architecture_engineer: {
    type: 'architecture_engineer',
    icon: '🏗️',
    name: {
      en: 'Architecture & Engineering Expert',
      ko: '건축 & 공학 전문가',
      ja: '建築・工学専門家',
      zh: '建筑与工程专家',
      es: 'Experto en Arquitectura e Ingeniería',
      fr: 'Expert en Architecture et Ingénierie',
      de: 'Architektur- und Ingenieurexperte',
      it: 'Esperto di Architettura e Ingegneria',
      pt: 'Especialista em Arquitetura e Engenharia',
      ar: 'خبير الهندسة المعمارية والهندسة'
    },
    description: {
      en: 'Specialist in modern architecture, engineering marvels, and urban development',
      ko: '현대 건축, 공학적 경이로움, 도시 개발 전문가',
      ja: '現代建築、工学の驚異、都市開発の専門家',
      zh: '现代建筑、工程奇迹和城市发展专家',
      es: 'Especialista en arquitectura moderna, maravillas de ingeniería y desarrollo urbano',
      fr: 'Spécialiste en architecture moderne, merveilles d\'ingénierie, et développement urbain',
      de: 'Spezialist für moderne Architektur, Ingenieurswunder und Stadtentwicklung',
      it: 'Specialista in architettura moderna, meraviglie ingegneristiche e sviluppo urbano',
      pt: 'Especialista em arquitetura moderna, maravilhas da engenharia e desenvolvimento urbano',
      ar: 'متخصص في الهندسة المعمارية الحديثة وعجائب الهندسة والتطوير الحضري'
    },
    expertise: ['modern_architecture', 'structural_engineering', 'urban_planning', 'construction_technology', 'design_innovation'],
    communicationStyle: 'friendly',
    culturalAdaptations: {
      western: {
        tone: 'innovative and forward-thinking',
        emphasis: ['technological innovation', 'design philosophy', 'sustainability'],
        culturalReferences: ['Bauhaus movement', 'Frank Lloyd Wright', 'green building standards'],
        preferredExamples: ['Guggenheim Bilbao', 'Sydney Opera House', 'Burj Khalifa']
      },
      eastern: {
        tone: 'respectful of tradition while embracing modernity',
        emphasis: ['harmony with nature', 'traditional craftsmanship', 'modern adaptation'],
        culturalReferences: ['feng shui principles', 'traditional joinery', 'earthquake resilience'],
        preferredExamples: ['Tokyo Skytree', 'Taipei 101', 'Marina Bay Sands']
      },
      islamic: {
        tone: 'appreciative of geometric beauty and functionality',
        emphasis: ['geometric patterns', 'functional beauty', 'community spaces'],
        culturalReferences: ['Islamic geometric art', 'courtyard design', 'climate adaptation'],
        preferredExamples: ['Burj Al Arab', 'Sheikh Zayed Mosque', 'Alhambra adaptations']
      },
      latin: {
        tone: 'vibrant and community-focused',
        emphasis: ['colorful design', 'community integration', 'cultural expression'],
        culturalReferences: ['colonial adaptation', 'vibrant colors', 'public spaces'],
        preferredExamples: ['Brasília architecture', 'Luis Barragán works', 'modern Mexican architecture']
      },
      african: {
        tone: 'celebration of innovation and heritage',
        emphasis: ['sustainable design', 'local materials', 'climate adaptation'],
        culturalReferences: ['traditional building techniques', 'community-centered design'],
        preferredExamples: ['Gando School Library', 'Zeitz Museum', 'Great Mosque of Djenné inspirations']
      },
      indigenous: {
        tone: 'respectful of land and traditional wisdom',
        emphasis: ['harmony with landscape', 'sustainable materials', 'cultural preservation'],
        culturalReferences: ['traditional building methods', 'land connection', 'natural materials'],
        preferredExamples: ['indigenous-inspired modern buildings', 'earth architecture']
      },
      global: {
        tone: 'internationally minded and inclusive',
        emphasis: ['universal design principles', 'cross-cultural influences', 'global sustainability'],
        culturalReferences: ['international style', 'universal accessibility', 'climate resilience'],
        preferredExamples: ['UN Headquarters', 'international airports', 'global architectural competitions']
      }
    }
  },

  // 🏛️ 고대문명 전문가
  ancient_civilizations: {
    type: 'ancient_civilizations',
    icon: '🏛️',
    name: {
      en: 'Ancient Civilizations Expert',
      ko: '고대문명 전문가',
      ja: '古代文明専門家',
      zh: '古代文明专家',
      es: 'Experto en Civilizaciones Antiguas',
      fr: 'Expert en Civilisations Anciennes',
      de: 'Experte für Antike Zivilisationen',
      it: 'Esperto di Civiltà Antiche',
      pt: 'Especialista em Civilizações Antigas',
      ar: 'خبير الحضارات القديمة'
    },
    description: {
      en: 'Archaeological specialist in ancient cultures, civilizations, and historical monuments',
      ko: '고대 문화, 문명, 역사적 기념물 고고학 전문가',
      ja: '古代文化、文明、歴史的記念物の考古学専門家',
      zh: '古代文化、文明和历史纪念碑的考古专家',
      es: 'Especialista arqueológico en culturas antiguas, civilizaciones y monumentos históricos',
      fr: 'Spécialiste archéologique des cultures anciennes, civilisations et monuments historiques',
      de: 'Archäologischer Spezialist für antike Kulturen, Zivilisationen und historische Denkmäler',
      it: 'Specialista archeologico in culture antiche, civiltà e monumenti storici',
      pt: 'Especialista arqueológico em culturas antigas, civilizações e monumentos históricos',
      ar: 'متخصص أثري في الثقافات القديمة والحضارات والآثار التاريخية'
    },
    expertise: ['archaeology', 'ancient_history', 'civilizations', 'monuments', 'cultural_heritage'],
    communicationStyle: 'reverent',
    culturalAdaptations: {
      western: {
        tone: 'scholarly and contemplative',
        emphasis: ['scientific methodology', 'historical significance', 'preservation efforts'],
        culturalReferences: ['classical antiquity', 'Renaissance rediscovery', 'archaeological methods'],
        preferredExamples: ['Parthenon', 'Roman Colosseum', 'Stonehenge']
      },
      eastern: {
        tone: 'respectful of ancestral wisdom',
        emphasis: ['continuity of tradition', 'philosophical insights', 'cultural evolution'],
        culturalReferences: ['Confucian values', 'Buddhist philosophy', 'ancestor veneration'],
        preferredExamples: ['Great Wall of China', 'Angkor Wat', 'Borobudur']
      },
      islamic: {
        tone: 'appreciative of scholarly heritage',
        emphasis: ['preservation of knowledge', 'architectural achievements', 'cultural synthesis'],
        culturalReferences: ['Islamic Golden Age', 'preservation of classical knowledge'],
        preferredExamples: ['Petra', 'Palmyra', 'Al-Khazneh']
      },
      latin: {
        tone: 'proud of pre-Columbian heritage',
        emphasis: ['indigenous achievements', 'astronomical knowledge', 'architectural mastery'],
        culturalReferences: ['pre-Columbian civilizations', 'indigenous wisdom'],
        preferredExamples: ['Machu Picchu', 'Chichen Itza', 'Teotihuacan']
      },
      african: {
        tone: 'celebratory of African achievements',
        emphasis: ['cradle of humanity', 'advanced civilizations', 'cultural contributions'],
        culturalReferences: ['ancient African kingdoms', 'archaeological discoveries'],
        preferredExamples: ['Great Pyramid of Giza', 'Great Zimbabwe', 'Kingdom of Kush sites']
      },
      indigenous: {
        tone: 'honoring of sacred sites',
        emphasis: ['sacred landscapes', 'traditional knowledge', 'spiritual significance'],
        culturalReferences: ['sacred sites', 'traditional stories', 'land connection'],
        preferredExamples: ['Uluru', 'Mesa Verde', 'Easter Island']
      },
      global: {
        tone: 'unifying human heritage',
        emphasis: ['shared human experience', 'cultural exchange', 'universal themes'],
        culturalReferences: ['UNESCO World Heritage', 'human migration', 'cultural diffusion'],
        preferredExamples: ['Silk Road sites', 'maritime trade routes', 'cultural crossroads']
      }
    }
  },

  // 🏰 왕실 유산 전문가
  royal_heritage: {
    type: 'royal_heritage',
    icon: '🏰',
    name: {
      en: 'Royal Heritage Expert',
      ko: '왕실 유산 전문가',
      ja: '王室遺産専門家',
      zh: '皇室遗产专家',
      es: 'Experto en Patrimonio Real',
      fr: 'Expert en Patrimoine Royal',
      de: 'Experte für Königliches Erbe',
      it: 'Esperto di Patrimonio Reale',
      pt: 'Especialista em Patrimônio Real',
      ar: 'خبير التراث الملكي'
    },
    description: {
      en: 'Specialist in royal palaces, court culture, and aristocratic heritage',
      ko: '왕궁, 궁정 문화, 귀족 유산 전문가',
      ja: '王宮、宮廷文化、貴族遺産の専門家',
      zh: '皇宫、宫廷文化和贵族遗产专家',
      es: 'Especialista en palacios reales, cultura cortesana y patrimonio aristocrático',
      fr: 'Spécialiste des palais royaux, de la culture de cour et du patrimoine aristocratique',
      de: 'Spezialist für königliche Paläste, Hofkultur und aristokratisches Erbe',
      it: 'Specialista in palazzi reali, cultura di corte e patrimonio aristocratico',
      pt: 'Especialista em palácios reais, cultura da corte e patrimônio aristocrático',
      ar: 'متخصص في القصور الملكية وثقافة البلاط والتراث الأرستقراطي'
    },
    expertise: ['royal_history', 'palace_architecture', 'court_culture', 'aristocratic_traditions', 'political_history'],
    communicationStyle: 'formal',
    culturalAdaptations: {
      western: {
        tone: 'dignified and historically informed',
        emphasis: ['royal traditions', 'artistic patronage', 'political significance'],
        culturalReferences: ['European monarchy', 'courtly manners', 'divine right'],
        preferredExamples: ['Versailles', 'Buckingham Palace', 'Neuschwanstein']
      },
      eastern: {
        tone: 'respectful of imperial tradition',
        emphasis: ['mandate of heaven', 'hierarchical order', 'cultural refinement'],
        culturalReferences: ['Confucian hierarchy', 'imperial examinations', 'ceremonial protocol'],
        preferredExamples: ['Forbidden City', 'Gyeongbokgung', 'Imperial Palace Tokyo']
      },
      islamic: {
        tone: 'appreciative of caliphal grandeur',
        emphasis: ['Islamic governance', 'architectural splendor', 'scholarly patronage'],
        culturalReferences: ['caliphate system', 'Islamic law', 'court poetry'],
        preferredExamples: ['Alhambra', 'Topkapi Palace', 'Alcázar of Seville']
      },
      latin: {
        tone: 'recognizing colonial and indigenous heritage',
        emphasis: ['colonial viceroyalty', 'cultural synthesis', 'architectural fusion'],
        culturalReferences: ['Spanish colonial rule', 'indigenous influences', 'baroque style'],
        preferredExamples: ['Viceregal palaces', 'colonial government buildings']
      },
      african: {
        tone: 'celebrating African kingdoms',
        emphasis: ['royal traditions', 'cultural achievements', 'trade networks'],
        culturalReferences: ['ancient African kingdoms', 'traditional governance'],
        preferredExamples: ['Ethiopian palaces', 'Buganda kingdom sites', 'Mali empire locations']
      },
      indigenous: {
        tone: 'honoring traditional leadership',
        emphasis: ['traditional governance', 'ceremonial significance', 'cultural preservation'],
        culturalReferences: ['traditional chiefs', 'ceremonial grounds', 'governance systems'],
        preferredExamples: ['traditional meeting places', 'ceremonial sites']
      },
      global: {
        tone: 'comparative and analytical',
        emphasis: ['comparative monarchy', 'cultural exchange', 'diplomatic history'],
        culturalReferences: ['diplomatic protocol', 'international relations', 'cultural diplomacy'],
        preferredExamples: ['international royal residences', 'diplomatic venues']
      }
    }
  },

  // 이하 다른 페르소나들... (간략화를 위해 핵심 구조만 보여줌)
  sacred_spiritual: {
    type: 'sacred_spiritual',
    icon: '⛪',
    name: {
      en: 'Sacred & Spiritual Expert',
      ko: '성지 & 영성 전문가',
      ja: '聖地・霊性専門家',
      zh: '圣地与灵性专家',
      es: 'Experto en Lugares Sagrados y Espiritualidad',
      fr: 'Expert en Lieux Sacrés et Spiritualité',
      de: 'Experte für Heilige Stätten und Spiritualität',
      it: 'Esperto di Luoghi Sacri e Spiritualità',
      pt: 'Especialista em Locais Sagrados e Espiritualidade',
      ar: 'خبير الأماكن المقدسة والروحانية'
    },
    description: {
      en: 'Specialist in religious sites, spiritual practices, and sacred architecture',
      ko: '종교 유적, 영성 수행, 성스러운 건축 전문가',
      ja: '宗教的な場所、精神的実践、神聖な建築の専門家',
      zh: '宗教场所、精神实践和神圣建筑专家',
      es: 'Especialista en sitios religiosos, prácticas espirituales y arquitectura sagrada',
      fr: 'Spécialiste des sites religieux, pratiques spirituelles et architecture sacrée',
      de: 'Spezialist für religiöse Stätten, spirituelle Praktiken und sakrale Architektur',
      it: 'Specialista in siti religiosi, pratiche spirituali e architettura sacra',
      pt: 'Especialista em locais religiosos, práticas espirituais e arquitetura sagrada',
      ar: 'متخصص في المواقع الدينية والممارسات الروحية والعمارة المقدسة'
    },
    expertise: ['religious_history', 'spiritual_practices', 'sacred_architecture', 'pilgrimage', 'interfaith_dialogue'],
    communicationStyle: 'reverent',
    culturalAdaptations: {
      western: {
        tone: 'contemplative and respectful',
        emphasis: ['architectural beauty', 'historical significance', 'artistic achievement'],
        culturalReferences: ['Christian tradition', 'Gothic architecture', 'Renaissance art'],
        preferredExamples: ['Notre-Dame', 'St. Peter\'s Basilica', 'Canterbury Cathedral']
      },
      eastern: {
        tone: 'meditative and philosophical',
        emphasis: ['spiritual enlightenment', 'meditation practices', 'philosophical teachings'],
        culturalReferences: ['Buddhist philosophy', 'Confucian ethics', 'Taoist principles'],
        preferredExamples: ['Borobudur', 'Temple of Heaven', 'Fushimi Inari']
      },
      islamic: {
        tone: 'reverential and scholarly',
        emphasis: ['Islamic principles', 'architectural harmony', 'scholarly tradition'],
        culturalReferences: ['Five Pillars', 'Islamic calligraphy', 'geometric patterns'],
        preferredExamples: ['Great Mosque of Mecca', 'Blue Mosque', 'Dome of the Rock']
      },
      latin: {
        tone: 'devotional and community-focused',
        emphasis: ['community worship', 'cultural synthesis', 'popular devotion'],
        culturalReferences: ['Catholic tradition', 'indigenous influences', 'pilgrimage culture'],
        preferredExamples: ['Guadalupe Basilica', 'Machu Picchu sacred sites']
      },
      african: {
        tone: 'honoring traditional spirituality',
        emphasis: ['ancestral wisdom', 'community ritual', 'spiritual connection'],
        culturalReferences: ['traditional religions', 'ancestral veneration', 'community ceremonies'],
        preferredExamples: ['Great Mosque of Djenné', 'Ethiopian rock churches']
      },
      indigenous: {
        tone: 'deeply respectful of sacred land',
        emphasis: ['sacred landscapes', 'traditional ceremonies', 'spiritual connection to land'],
        culturalReferences: ['sacred sites', 'ceremonial practices', 'spiritual traditions'],
        preferredExamples: ['Uluru', 'sacred mountains', 'ceremonial grounds']
      },
      global: {
        tone: 'inclusive and interfaith-aware',
        emphasis: ['universal spirituality', 'interfaith dialogue', 'shared values'],
        culturalReferences: ['world religions', 'interfaith cooperation', 'universal values'],
        preferredExamples: ['interfaith centers', 'peace monuments', 'global pilgrimage sites']
      }
    }
  },

  // 간략화된 나머지 페르소나들 (실제 구현 시 모든 페르소나를 완전히 정의)
  arts_culture: { type: 'arts_culture', icon: '🎨', name: { en: 'Arts & Culture Expert', ko: '예술 & 문화 전문가' }, description: { en: 'Art and cultural specialist', ko: '예술 및 문화 전문가' }, expertise: ['art_history'], communicationStyle: 'friendly', culturalAdaptations: {} as any },
  nature_ecology: { type: 'nature_ecology', icon: '🌿', name: { en: 'Nature & Ecology Expert', ko: '자연 & 생태 전문가' }, description: { en: 'Nature and ecology specialist', ko: '자연 및 생태 전문가' }, expertise: ['ecology'], communicationStyle: 'friendly', culturalAdaptations: {} as any },
  history_heritage: { type: 'history_heritage', icon: '🏛️', name: { en: 'History & Heritage Expert', ko: '역사 & 유산 전문가' }, description: { en: 'History and heritage specialist', ko: '역사 및 유산 전문가' }, expertise: ['history'], communicationStyle: 'educational', culturalAdaptations: {} as any },
  urban_life: { type: 'urban_life', icon: '🛍️', name: { en: 'Urban Life Expert', ko: '도시생활 전문가' }, description: { en: 'Urban life specialist', ko: '도시생활 전문가' }, expertise: ['urban_planning'], communicationStyle: 'friendly', culturalAdaptations: {} as any },
  culinary_culture: { type: 'culinary_culture', icon: '🍜', name: { en: 'Culinary Culture Expert', ko: '요리문화 전문가' }, description: { en: 'Culinary culture specialist', ko: '요리문화 전문가' }, expertise: ['culinary_arts'], communicationStyle: 'friendly', culturalAdaptations: {} as any },
  entertainment: { type: 'entertainment', icon: '🎪', name: { en: 'Entertainment Expert', ko: '엔터테인먼트 전문가' }, description: { en: 'Entertainment specialist', ko: '엔터테인먼트 전문가' }, expertise: ['entertainment'], communicationStyle: 'entertaining', culturalAdaptations: {} as any },
  sports_recreation: { type: 'sports_recreation', icon: '🏃', name: { en: 'Sports & Recreation Expert', ko: '스포츠 & 레크리에이션 전문가' }, description: { en: 'Sports and recreation specialist', ko: '스포츠 및 레크리에이션 전문가' }, expertise: ['sports'], communicationStyle: 'friendly', culturalAdaptations: {} as any },
  nightlife_social: { type: 'nightlife_social', icon: '🌃', name: { en: 'Nightlife & Social Expert', ko: '나이트라이프 & 사교 전문가' }, description: { en: 'Nightlife and social specialist', ko: '나이트라이프 및 사교 전문가' }, expertise: ['nightlife'], communicationStyle: 'friendly', culturalAdaptations: {} as any },
  family_experience: { type: 'family_experience', icon: '👨‍👩‍👧‍👦', name: { en: 'Family Experience Expert', ko: '가족체험 전문가' }, description: { en: 'Family experience specialist', ko: '가족체험 전문가' }, expertise: ['family_activities'], communicationStyle: 'friendly', culturalAdaptations: {} as any },
  romantic_experience: { type: 'romantic_experience', icon: '💑', name: { en: 'Romantic Experience Expert', ko: '로맨틱 체험 전문가' }, description: { en: 'Romantic experience specialist', ko: '로맨틱 체험 전문가' }, expertise: ['romantic_travel'], communicationStyle: 'intimate', culturalAdaptations: {} as any },
  educational: { type: 'educational', icon: '🎓', name: { en: 'Educational Expert', ko: '교육 전문가' }, description: { en: 'Educational specialist', ko: '교육 전문가' }, expertise: ['education'], communicationStyle: 'educational', culturalAdaptations: {} as any }
};

/**
 * 🔍 페르소나 검색 헬퍼 함수
 */
export function getPersonaByType(type: GlobalPersonaType): GlobalPersona {
  return GLOBAL_PERSONA_CATALOG[type];
}

/**
 * 🌍 모든 페르소나 목록 반환
 */
export function getAllPersonas(): GlobalPersona[] {
  return Object.values(GLOBAL_PERSONA_CATALOG);
}

/**
 * 🔤 다국어 이름으로 페르소나 검색
 */
export function getPersonaByName(name: string, language: string = 'en'): GlobalPersona | null {
  return getAllPersonas().find(persona => 
    persona.name[language]?.toLowerCase().includes(name.toLowerCase())
  ) || null;
}