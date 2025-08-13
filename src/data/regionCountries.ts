// regionCountries.ts - 정적 데이터 분리로 성능 최적화

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  attractions: string[];
  description: string;
}

export interface RegionCountries {
  korea: CountryData[];
  europe: CountryData[];
  asia: CountryData[];
  americas: CountryData[];
}

// 기본 정적 데이터 (번역 없이도 동작)
export const defaultRegionCountries: RegionCountries = {
  korea: [
    { 
      id: 'seoul', 
      name: '서울', 
      flag: '', 
      attractions: ['경복궁', '남산타워', '명동'],
      description: '대한민국의 활기찬 수도'
    },
    { 
      id: 'busan', 
      name: '부산', 
      flag: '', 
      attractions: ['해운대해수욕장', '감천문화마을', '자갈치시장'],
      description: '아름다운 바다와 항구의 도시'
    },
    { 
      id: 'jeju', 
      name: '제주', 
      flag: '', 
      attractions: ['한라산', '성산일출봉', '중문관광단지'],
      description: '환상적인 자연경관의 섬'
    },
    { 
      id: 'gyeongju', 
      name: '경주', 
      flag: '', 
      attractions: ['불국사', '석굴암', '첨성대'],
      description: '신라 천년의 고도'
    }
  ],
  europe: [
    { 
      id: 'france', 
      name: 'France', 
      flag: '🇫🇷', 
      attractions: ['Eiffel Tower', 'Louvre Museum', 'Palace of Versailles'],
      description: 'Romantic Paris and magnificent cultural heritage'
    },
    { 
      id: 'italy', 
      name: 'Italy', 
      flag: '🇮🇹', 
      attractions: ['Colosseum', 'Leaning Tower of Pisa', 'Vatican'],
      description: 'Glory of ancient Rome and Renaissance art'
    },
    { 
      id: 'spain', 
      name: 'Spain', 
      flag: '🇪🇸', 
      attractions: ['Sagrada Familia', 'Alhambra', 'Park Güell'],
      description: 'Gaudí\'s architecture and flamenco passion'
    },
    { 
      id: 'uk', 
      name: 'United Kingdom', 
      flag: '🇬🇧', 
      attractions: ['Big Ben', 'Tower Bridge', 'Buckingham Palace'],
      description: 'Harmonious blend of tradition and modernity'
    },
    { 
      id: 'germany', 
      name: 'Germany', 
      flag: '🇩🇪', 
      attractions: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral'],
      description: 'Fairy-tale castles and deep historical heritage'
    }
  ],
  asia: [
    { 
      id: 'japan', 
      name: 'Japan', 
      flag: '🇯🇵', 
      attractions: ['Mount Fuji', 'Kiyomizu-dera', 'Senso-ji'],
      description: 'Mysterious land where tradition and cutting-edge coexist'
    },
    { 
      id: 'china', 
      name: 'China', 
      flag: '🇨🇳', 
      attractions: ['Great Wall', 'Forbidden City', 'Tiananmen Square'],
      description: 'Great civilization with 5000 years of history'
    },
    { 
      id: 'india', 
      name: 'India', 
      flag: '🇮🇳', 
      attractions: ['Taj Mahal', 'Red Fort', 'Ganges River'],
      description: 'Mystical spirituality and magnificent palaces'
    },
    { 
      id: 'thailand', 
      name: 'Thailand', 
      flag: '🇹🇭', 
      attractions: ['Wat Arun', 'Grand Palace', 'Wat Pho'],
      description: 'Golden temples and the land of smiles'
    },
    { 
      id: 'singapore', 
      name: 'Singapore', 
      flag: '🇸🇬', 
      attractions: ['Marina Bay Sands', 'Gardens by the Bay', 'Merlion'],
      description: 'Future city meets diverse cultures'
    }
  ],
  americas: [
    { 
      id: 'usa', 
      name: 'United States', 
      flag: '🇺🇸', 
      attractions: ['Statue of Liberty', 'Grand Canyon', 'Times Square'],
      description: 'Land of freedom and dreams, infinite possibilities'
    },
    { 
      id: 'canada', 
      name: 'Canada', 
      flag: '🇨🇦', 
      attractions: ['Niagara Falls', 'CN Tower', 'Banff National Park'],
      description: 'Vast nature and clean cities'
    },
    { 
      id: 'brazil', 
      name: 'Brazil', 
      flag: '🇧🇷', 
      attractions: ['Christ the Redeemer', 'Iguazu Falls', 'Maracanã Stadium'],
      description: 'Samba and football, passionate South America'
    },
    { 
      id: 'peru', 
      name: 'Peru', 
      flag: '🇵🇪', 
      attractions: ['Machu Picchu', 'Cusco', 'Nazca Lines'],
      description: 'Mysterious ruins of Inca civilization'
    },
    { 
      id: 'mexico', 
      name: 'Mexico', 
      flag: '🇲🇽', 
      attractions: ['Chichen Itza', 'Teotihuacan', 'Cancun'],
      description: 'Mayan civilization and Caribbean paradise'
    }
  ]
};

// 번역 데이터와 기본 데이터를 병합하는 유틸리티 함수
export function mergeTranslatedCountries(translatedCountries: any, region: keyof RegionCountries): CountryData[] {
  const defaultData = defaultRegionCountries[region];
  
  if (!translatedCountries || typeof translatedCountries !== 'object') {
    return defaultData;
  }
  
  return defaultData.map(country => {
    const translated = translatedCountries[country.id];
    if (translated && typeof translated === 'object') {
      return {
        ...country,
        name: translated.name || country.name,
        attractions: Array.isArray(translated.attractions) ? translated.attractions : country.attractions,
        description: translated.description || country.description
      };
    }
    return country;
  });
}