import { useState, useMemo } from "react";
import { ArrowLeft, Search, Film, MapPin, Star, Clock, Users, Play, Camera, Award, Globe, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface FilmLocationPageProps {
  onBackToHome: () => void;
  onDestinationClick: (destination: string) => void;
}

interface FilmLocation {
  id: string;
  title: string;
  titleKo: string;
  year: number;
  genre: string;
  director: string;
  location: string;
  locationKo: string;
  country: string;
  region: string;
  description: string;
  filmDescription: string;
  visitInfo: string;
  imageUrl: string;
  rating: number;
  duration: string;
  popularRank?: number;
  scenes: string[];
  tips: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export function FilmLocationPage({ onBackToHome, onDestinationClick }: FilmLocationPageProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<FilmLocation | null>(null);
  const [activeTab, setActiveTab] = useState<string>('popular');
  
  const locationsPerPage = 9;

  const filmLocations: FilmLocation[] = [
    // 인기 영화 촬영지
    {
      id: 'gyeongbokgung-kingdom',
      title: 'Kingdom',
      titleKo: '킹덤',
      year: 2019,
      genre: 'Historical Drama',
      director: '김성훈',
      location: 'Gyeongbokgung Palace',
      locationKo: '경복궁',
      country: 'South Korea',
      region: 'Asia',
      description: '조선시대 좀비 스릴러의 웅장한 배경이 된 경복궁은 600여 년의 역사를 간직한 조선 왕조의 법궁입니다.',
      filmDescription: '넷플릭스 오리지널 시리즈 킹덤에서 조선 왕궁의 웅장함과 긴장감 넘치는 궁중 정치를 완벽하게 담아낸 촬영지입니다.',
      visitInfo: '지하철 3호선 경복궁역 5번 출구에서 도보 5분. 관람시간: 09:00-18:00 (계절별 상이)',
      imageUrl: 'https://images.unsplash.com/photo-1625551922738-3fb390d041dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdib2tndW5nJTIwcGFsYWNlJTIwc2VvdWwlMjBrb3JlYSUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc1NTg2OTM0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.2,
      duration: '2시간',
      popularRank: 1,
      scenes: ['근정전에서의 조정 장면', '경회루 좀비 추격전', '궁궐 담장 액션 시퀀스'],
      tips: ['수문장 교대식 시간에 맞춰 방문', '한복 체험으로 드라마 주인공 기분', '야간 개장일에는 더욱 분위기 있음'],
      coordinates: { lat: 37.5788, lng: 126.9770 }
    },
    {
      id: 'gamcheon-parasite',
      title: 'Parasite',
      titleKo: '기생충',
      year: 2019,
      genre: 'Thriller',
      director: '봉준호',
      location: 'Gamcheon Culture Village',
      locationKo: '감천문화마을',
      country: 'South Korea',
      region: 'Asia',
      description: '아카데미 4관왕을 수상한 기생충의 상징적인 계단 장면이 촬영된 부산의 마추픽추로 불리는 알록달록한 마을입니다.',
      filmDescription: '사회 계층을 상징하는 긴 계단과 좁은 골목길이 영화의 핵심 메시지를 시각적으로 완벽하게 표현한 촬영지입니다.',
      visitInfo: '부산 지하철 1호선 토성역에서 마을버스 2-2번 이용. 운영시간: 09:00-18:00',
      imageUrl: 'https://images.unsplash.com/photo-1709497701757-3a1caf6600dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGdhbWNoZW9uJTIwdmlsbGFnZSUyMGNvbG9yZnVsJTIwaG91c2VzfGVufDF8fHx8MTc1NTg2OTM0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.8,
      duration: '3시간',
      popularRank: 2,
      scenes: ['김기택 가족의 반지하 집 주변', '계단 오르내리는 상징적 장면', '비 오는 날 대피 장면'],
      tips: ['이른 아침이나 늦은 오후가 사진 찍기 좋음', '마을 지도를 받고 스탬프 투어 참여', '포토존에서 영화 포스터 재현 가능'],
      coordinates: { lat: 35.0974, lng: 129.0102 }
    },
    {
      id: 'tokyo-lost-in-translation',
      title: 'Lost in Translation',
      titleKo: '사랑도 통역이 되나요?',
      year: 2003,
      genre: 'Drama',
      director: '소피아 코폴라',
      location: 'Shibuya Crossing, Tokyo',
      locationKo: '도쿄 시부야 교차로',
      country: 'Japan',
      region: 'Asia',
      description: '세계에서 가장 바쁜 교차로에서 펼쳐지는 고독과 연결의 이야기가 담긴 현대 도쿄의 상징적 장소입니다.',
      filmDescription: '빌 머레이와 스칼렛 요한슨이 도쿄의 화려함 속에서 느끼는 소외감을 완벽하게 표현한 상징적인 촬영지입니다.',
      visitInfo: 'JR 야마노테선 시부야역 하치코 출구에서 바로. 24시간 관람 가능하나 오후 6-8시가 가장 붐빔',
      imageUrl: 'https://images.unsplash.com/photo-1709654971337-b8f1937b2d01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMHNoaWJ1eWElMjBjcm9zc2luZyUyMG5pZ2h0JTIwbGlnaHRzfGVufDF8fHx8MTc1NTg2OTM0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.7,
      duration: '2시간',
      popularRank: 3,
      scenes: ['시부야 교차로 인파 속 장면', '파크 하얏트 호텔 바 시퀀스', '네온사인 거리 산책'],
      tips: ['스카이에서 교차로 전경 감상', '해질녘 네온사인이 켜질 때가 베스트', '하치코 동상에서 기념사진'],
      coordinates: { lat: 35.6598, lng: 139.7006 }
    },
    {
      id: 'paris-amelie',
      title: 'Amélie',
      titleKo: '아멜리에',
      year: 2001,
      genre: 'Romance Comedy',
      director: '장 피에르 주네',
      location: 'Montmartre, Paris',
      locationKo: '파리 몽마르트',
      country: 'France',
      region: 'Europe',
      description: '파리의 로맨틱한 매력을 한 폭의 그림처럼 담아낸 몽마르트 언덕의 아기자기한 골목길과 카페들입니다.',
      filmDescription: '오드리 토투의 사랑스러운 연기와 함께 파리의 낭만을 완벽하게 담아낸 컬러풀한 영화의 무대입니다.',
      visitInfo: '지하철 12호선 Abbesses역 하차. 카페 데 뒤 물랭, 사크레쾨르 대성당 필수 방문',
      imageUrl: 'https://images.unsplash.com/photo-1708619272903-31f8f52a967a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyJTIwdmludGFnZSUyMGZpbG18ZW58MXx8fHwxNzU1ODY5MzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.1,
      duration: '반나절',
      popularRank: 4,
      scenes: ['카페 데 뒤 물랭에서의 일상', '몽마르트 계단 오르내리기', '사크레쾨르 앞 광장'],
      tips: ['아침 일찍 방문하면 관광객이 적음', '카페에서 크레페와 와인 맛보기', '거리 화가들의 초상화 그리기 체험'],
      coordinates: { lat: 48.8867, lng: 2.3431 }
    },
    {
      id: 'newyork-spider-man',
      title: 'Spider-Man',
      titleKo: '스파이더맨',
      year: 2002,
      genre: 'Superhero',
      director: '샘 레이미',
      location: 'Times Square, New York',
      locationKo: '뉴욕 타임스퀘어',
      country: 'United States',
      region: 'North America',
      description: '세계의 교차로라 불리는 타임스퀘어에서 펼쳐지는 스파이더맨의 역동적인 액션 시퀀스들의 무대입니다.',
      filmDescription: '토비 맥과이어의 스파이더맨이 뉴욕 시내를 종횡무진 누비며 펼치는 스펙터클한 액션의 중심지입니다.',
      visitInfo: '지하철 N, Q, R, W, S, 1, 2, 3, 7호선 Times Sq-42 St역. 24시간 접근 가능',
      imageUrl: 'https://images.unsplash.com/photo-1572537082960-0a911922f2de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2VudHJhbCUyMHBhcmslMjBtYW5oYXR0YW4lMjBza3lsaW5lfGVufDF8fHx8MTc1NTg2OTgwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.5,
      duration: '3시간',
      popularRank: 5,
      scenes: ['빌딩 사이 웹스윙 액션', '타임스퀘어 상공 전투', '브로드웨이 극장가 추격전'],
      tips: ['토슈 전망대에서 도시 전경 감상', '브로드웨이 뮤지컬 관람', '야경이 더욱 아름다운 밤 방문 추천'],
      coordinates: { lat: 40.7580, lng: -73.9855 }
    },

    // 한국 영화들 추가
    {
      id: 'busan-train-to-busan',
      title: 'Train to Busan',
      titleKo: '부산행',
      year: 2016,
      genre: 'Zombie Horror',
      director: '연상호',
      location: 'Busan Station',
      locationKo: '부산역',
      country: 'South Korea',
      region: 'Asia',
      description: '전 세계적으로 인정받은 좀비 영화의 목적지이자 클라이맥스가 펼쳐진 부산의 관문입니다.',
      filmDescription: '생존을 위한 필사적인 여행의 종착지로, 희망과 절망이 교차하는 감동적인 엔딩의 무대입니다.',
      visitInfo: 'KTX, SRT 부산역 하차. 주변 용두산공원, 차이나타운, 국제시장 연계 관광 가능',
      imageUrl: 'https://images.unsplash.com/photo-1709497701757-3a1caf6600dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNhbiUyMGdhbWNoZW9uJTIwdmlsbGFnZSUyMGNvbG9yZnVsJTIwaG91c2VzfGVufDF8fHx8MTc1NTg2OTM0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.9,
      duration: '2시간',
      popularRank: 6,
      scenes: ['부산역 도착 시퀀스', '역사 내부 긴장감 넘치는 장면', '플랫폼에서의 마지막 전투'],
      tips: ['영화 속 열차 노선 따라 여행하기', '부산 KTX역과 구 부산역 구분하기', '주변 먹거리 골목 탐방'],
      coordinates: { lat: 35.1155, lng: 129.0425 }
    },
    {
      id: 'seoul-oldboy',
      title: 'Oldboy',
      titleKo: '올드보이',
      year: 2003,
      genre: 'Thriller',
      director: '박찬욱',
      location: 'Wangsimni Area, Seoul',
      locationKo: '서울 왕십리',
      country: 'South Korea',
      region: 'Asia',
      description: '복수와 감금의 이야기가 펼쳐진 도시적이고 어두운 분위기의 서울 동부 지역입니다.',
      filmDescription: '칸 영화제 황금종려상을 수상한 걸작에서 주인공의 복수가 시작되는 상징적인 공간입니다.',
      visitInfo: '지하철 2, 5호선 왕십리역. 성수동, 한양대 일대 도보 탐방 가능',
      imageUrl: 'https://images.unsplash.com/photo-1625551922738-3fb390d041dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdib2tndW5nJTIwcGFsYWNlJTIwc2VvdWwlMjBrb3JlYSUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc1NTg2OTM0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.8,
      duration: '2시간',
      popularRank: 7,
      scenes: ['복도 한 컷 액션 장면', '옥상에서의 대화', '음식점에서의 만남'],
      tips: ['영화 속 촬영지 투어 프로그램 참여', '성수동 카페 거리 탐방', '한강 산책로 연계 코스'],
      coordinates: { lat: 37.5608, lng: 127.0378 }
    },
    {
      id: 'jeju-decision-to-leave',
      title: 'Decision to Leave',
      titleKo: '헤어질 결심',
      year: 2022,
      genre: 'Romance Thriller',
      director: '박찬욱',
      location: 'Jeju Island',
      locationKo: '제주도',
      country: 'South Korea',
      region: 'Asia',
      description: '칸 영화제 감독상을 수상한 헤어질 결심의 아름답고 신비로운 배경이 된 제주도의 절경들입니다.',
      filmDescription: '영화 후반부의 숨막히는 절벽과 바다 장면들이 제주도의 원시적 아름다움과 완벽하게 어우러진 촬영지입니다.',
      visitInfo: '제주국제공항에서 렌터카 이용 권장. 주요 촬영지는 성산일출봉, 우도, 중문 해안가',
      imageUrl: 'https://images.unsplash.com/photo-1661680392074-f0a9a86facb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZWp1JTIwaXNsYW5kJTIwaGFsbGFzYW4lMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NTU4NjkzNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.9,
      duration: '1일',
      popularRank: 8,
      scenes: ['성산일출봉에서의 대화 장면', '우도 해안가 추격전', '한라산 숲속 미스터리'],
      tips: ['일출 시간에 맞춰 성산일출봉 방문', '우도는 전기자전거로 둘러보기', '날씨 변화가 심하니 여벌 옷 준비'],
      coordinates: { lat: 33.3846, lng: 126.5535 }
    },
    {
      id: 'seoul-burning',
      title: 'Burning',
      titleKo: '버닝',
      year: 2018,
      genre: 'Mystery Drama',
      director: '이창동',
      location: 'Paju, Gyeonggi',
      locationKo: '경기도 파주',
      country: 'South Korea',
      region: 'Asia',
      description: '칸 영화제에서 극찬받은 미스터리 드라마의 배경이 된 한국의 농촌과 도시 경계 지역입니다.',
      filmDescription: '현대 한국 사회의 계층 갈등과 청춘의 불안을 상징하는 공간으로 완벽하게 활용된 촬영지입니다.',
      visitInfo: '자유로 이용하여 파주 방면. 헤이리 예술마을, 출판단지와 연계 관광 가능',
      imageUrl: 'https://images.unsplash.com/photo-1625551922738-3fb390d041dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneWVvbmdib2tndW5nJTIwcGFsYWNlJTIwc2VvdWwlMjBrb3JlYSUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc1NTg2OTM0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.6,
      duration: '반나절',
      scenes: ['농장에서의 작업 장면', '한강 유역 드라이브', '비닐하우스 화재 시퀀스'],
      tips: ['헤이리 예술마을에서 독립영화관 관람', '북한 접경지역 긴장감 느끼기', '출판단지에서 문화 체험'],
      coordinates: { lat: 37.7609, lng: 126.7802 }
    },

    // 일본 영화들
    {
      id: 'kyoto-memoirs-geisha',
      title: 'Memoirs of a Geisha',
      titleKo: '게이샤의 추억',
      year: 2005,
      genre: 'Historical Drama',
      director: '롭 마샬',
      location: 'Gion District, Kyoto',
      locationKo: '교토 기온',
      country: 'Japan',
      region: 'Asia',
      description: '전통 일본의 아름다움이 그대로 보존된 기온 지구는 게이샤 문화의 중심지입니다.',
      filmDescription: '일본 전통 문화의 정수를 담은 영화에서 게이샤들의 우아한 삶이 펼쳐지는 아름다운 무대입니다.',
      visitInfo: 'JR 교토역에서 시내버스 206번 기온 정류장. 저녁 시간대 게이샤 목격 가능성 높음',
      imageUrl: 'https://images.unsplash.com/photo-1599802223693-38a5ba334667?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxreW90byUyMGphcGFuJTIwdGVtcGxlJTIwdHJhZGl0aW9uYWwlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzU1ODY5ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.4,
      duration: '반나절',
      scenes: ['한눈에 반한 다리 장면', '찻집에서의 게이샤 공연', '벚꽃 아래 산책'],
      tips: ['오후 5-7시 게이샤 출근 시간 노려보기', '하나미코지 거리 전통 찻집 체험', '기모노 렌탈로 분위기 만끽'],
      coordinates: { lat: 35.0036, lng: 135.7778 }
    },
    {
      id: 'tokyo-your-name',
      title: 'Your Name',
      titleKo: '너의 이름은',
      year: 2016,
      genre: 'Animation Romance',
      director: '신카이 마코토',
      location: 'Suga Shrine, Tokyo',
      locationKo: '도쿄 스가 신사',
      country: 'Japan',
      region: 'Asia',
      description: '전 세계적으로 사랑받은 애니메이션의 성지가 된 도쿄의 작은 신사로, 영화 속 계단으로 유명합니다.',
      filmDescription: '시공간을 초월한 사랑 이야기에서 두 주인공이 마침내 만나는 운명적인 장소입니다.',
      visitInfo: 'JR 신주쿠역에서 도보 15분. 총 40계단으로 이루어진 신사 입구 계단이 포토존',
      imageUrl: 'https://images.unsplash.com/photo-1709654971337-b8f1937b2d01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMHNoaWJ1eWElMjBjcm9zc2luZyUyMG5pZ2h0JTIwbGlnaHRzfGVufDF8fHx8MTc1NTg2OTM0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.0,
      duration: '1시간',
      scenes: ['유명한 계단에서의 재회', '신사 경내 에마 달기', '주변 주택가 풍경'],
      tips: ['황혼 시간대 방문이 가장 아름다움', '영화 속 구도로 사진 촬영', '에마에 소원 적어보기'],
      coordinates: { lat: 35.6895, lng: 139.7006 }
    },
    {
      id: 'nara-spirited-away',
      title: 'Spirited Away',
      titleKo: '센과 치히로의 행방불명',
      year: 2001,
      genre: 'Animation Fantasy',
      director: '미야자키 하야오',
      location: 'Dogo Onsen, Ehime',
      locationKo: '도고온천, 에히메',
      country: 'Japan',
      region: 'Asia',
      description: '지브리 애니메이션의 모티브가 된 일본 최고(最古)의 온천으로, 3000년의 역사를 자랑합니다.',
      filmDescription: '신들의 목욕탕으로 등장하는 환상적인 온천 세계의 모델이 된 실제 온천 료칸입니다.',
      visitInfo: '마츠야마 공항에서 리무진버스로 40분. 도고온천 본관은 오전 6시부터 오후 11시까지 운영',
      imageUrl: 'https://images.unsplash.com/photo-1591233244187-ffd622c51fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5na29rJTIwdGhhaWxhbmQlMjB0ZW1wbGUlMjBnb2xkZW4lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzU1ODY5ODA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.3,
      duration: '3시간',
      scenes: ['본관 건물 외관', '목욕탕 내부 신비로운 분위기', '주변 상점가 골목'],
      tips: ['저녁 시간 조명이 켜질 때 방문', '실제 온천 체험하기', '지브리 굿즈샵에서 기념품 구매'],
      coordinates: { lat: 33.8516, lng: 132.7866 }
    },

    // 유럽 영화들
    {
      id: 'london-notting-hill',
      title: 'Notting Hill',
      titleKo: '노팅 힐',
      year: 1999,
      genre: 'Romance Comedy',
      director: '로저 미첼',
      location: 'Notting Hill, London',
      locationKo: '런던 노팅힐',
      country: 'United Kingdom',
      region: 'Europe',
      description: '휴 그랜트와 줄리아 로버츠의 로맨틱 코미디가 펼쳐진 런던의 가장 매력적인 동네 노팅힐입니다.',
      filmDescription: '평범한 서점 주인과 할리우드 스타의 사랑 이야기가 아름다운 런던의 빅토리아 시대 건축물을 배경으로 펼쳐집니다.',
      visitInfo: '지하철 Central, Circle, District, Hammersmith & City선 Notting Hill Gate역. 포토벨로 마켓은 토요일이 가장 활기참',
      imageUrl: 'https://images.unsplash.com/photo-1740175571075-a0ba0327cf36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBiaWclMjBiZW4lMjBhcmNoaXRlY3R1cmUlMjBjbGFzc2ljfGVufDF8fHx8MTc1NTg2OTM1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.3,
      duration: '반나절',
      popularRank: 9,
      scenes: ['Travel Book Shop 서점', '포토벨로 로드 산책', '블루 도어 하우스'],
      tips: ['주말 포토벨로 마켓 구경', '컬러풀한 집들 사진 촬영', '영국식 애프터눈 티 체험'],
      coordinates: { lat: 51.5152, lng: -0.1961 }
    },
    {
      id: 'rome-gladiator',
      title: 'Gladiator',
      titleKo: '글래디에이터',
      year: 2000,
      genre: 'Historical Action',
      director: '리들리 스콧',
      location: 'Colosseum, Rome',
      locationKo: '로마 콜로세움',
      country: 'Italy',
      region: 'Europe',
      description: '고대 로마의 영광을 보여주는 대표적인 원형 경기장으로, 2000년의 역사를 간직한 세계유산입니다.',
      filmDescription: '러셀 크로우가 검투사 막시무스로 분하여 복수의 검을 휘두르는 웅장한 전투의 무대입니다.',
      visitInfo: '지하철 B선 Colosseo역 하차. 사전 예약 필수, 오전 8:30-일몰 1시간 전까지 개방',
      imageUrl: 'https://images.unsplash.com/photo-1706884027668-4b2a1a9701ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwY29sb3NzZXVtJTIwaXRhbHklMjBhcmNoaXRlY3R1cmUlMjBhbmNpZW50fGVufDF8fHx8MTc1NTg2OTc5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.1,
      duration: '3시간',
      popularRank: 10,
      scenes: ['아레나 입장 장면', '검투사 전투 시퀀스', '황제석에서의 대화'],
      tips: ['로마패스로 줄서기 없이 입장', '지하층 투어로 검투사 대기실 관람', '포로 로마노와 팔라티노 언덕 연계 관광'],
      coordinates: { lat: 41.8902, lng: 12.4922 }
    },
    {
      id: 'venice-casino-royale',
      title: 'Casino Royale',
      titleKo: '카지노 로얄',
      year: 2006,
      genre: 'Action Thriller',
      director: '마틴 캠벨',
      location: 'Venice, Italy',
      locationKo: '베니스, 이탈리아',
      country: 'Italy',
      region: 'Europe',
      description: '물 위에 떠 있는 환상적인 도시 베니스는 제임스 본드의 스타일리시한 액션이 펼쳐진 무대입니다.',
      filmDescription: '다니엘 크레이그의 첫 번째 007 영화에서 로맨스와 액션이 절묘하게 조화를 이루는 아름다운 촬영지입니다.',
      visitInfo: '마르코 폴로 공항에서 수상버스로 1시간. 산 마르코 광장, 리알토 다리는 필수 관광지',
      imageUrl: 'https://images.unsplash.com/photo-1749682205597-dafcc3cad407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZW5pY2UlMjBpdGFseSUyMGNhbmFsJTIwZ29uZG9sYSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTU4Njk4MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.7,
      duration: '1일',
      scenes: ['산 마르코 광장에서의 추격전', '운하에서의 액션 시퀀스', '호텔 다니엘리 로맨스 장면'],
      tips: ['곤돌라 투어로 영화 속 장면 재현', '카페 플로리안에서 에스프레소', '숙박은 본토보다 섬 내부 추천'],
      coordinates: { lat: 45.4408, lng: 12.3155 }
    },
    {
      id: 'santorini-mamma-mia',
      title: 'Mamma Mia!',
      titleKo: '맘마 미아!',
      year: 2008,
      genre: 'Musical',
      director: '필리다 로이드',
      location: 'Santorini, Greece',
      locationKo: '그리스 산토리니',
      country: 'Greece',
      region: 'Europe',
      description: 'ABBA의 음악과 함께 펼쳐지는 그리스 산토리니의 눈부신 하얀 건물과 에게해의 푸른 바다입니다.',
      filmDescription: '메릴 스트립과 아만다 사이프리드가 ABBA의 명곡들과 함께 선사하는 뮤지컬의 꿈같은 배경입니다.',
      visitInfo: '아테네에서 항공편 또는 페리 이용. 이아 마을의 일몰이 특히 유명함',
      imageUrl: 'https://images.unsplash.com/photo-1633909198480-85595aa21285?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjB3aGl0ZSUyMGJsdWUlMjBidWlsZGluZ3N8ZW58MXx8fHwxNzU1ODY5MzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.8,
      duration: '2일',
      scenes: ['이아 마을 하얀 건물들', '칼데라 절벽 웨딩 시퀀스', '에게해 보트 씬'],
      tips: ['일몰 2시간 전 이아 도착 권장', '블루 돔 교회에서 사진 촬영', '와이너리 투어 체험'],
      coordinates: { lat: 36.3932, lng: 25.4615 }
    },
    {
      id: 'scotland-braveheart',
      title: 'Braveheart',
      titleKo: '브레이브하트',
      year: 1995,
      genre: 'Historical Drama',
      director: '멜 깁슨',
      location: 'Scottish Highlands',
      locationKo: '스코틀랜드 하이랜드',
      country: 'United Kingdom',
      region: 'Europe',
      description: '스코틀랜드의 웅장한 하이랜드 지역은 윌리엄 월레스의 자유를 향한 투쟁의 무대입니다.',
      filmDescription: '멜 깁슨이 연출하고 주연한 역사 대서사시에서 스코틀랜드의 거친 자연미가 완벽하게 담긴 촬영지입니다.',
      visitInfo: '에든버러에서 렌터카로 북쪽 2시간. 글렌코, 로몬드 호수 등이 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1690936307985-af4bd6abc5d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY290bGFuZCUyMGhpZ2hsYW5kcyUyMGNhc3RsZSUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NTU4Njk4MDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.9,
      duration: '2일',
      scenes: ['스털링 전투 장면', '하이랜드 초원에서의 연설', '글렌코 계곡 추격전'],
      tips: ['가을 시즌이 가장 아름다움', '하이랜드 게임 시즌에 맞춰 방문', '위스키 증류소 투어 연계'],
      coordinates: { lat: 56.7967, lng: -4.2026 }
    },
    {
      id: 'iceland-interstellar',
      title: 'Interstellar',
      titleKo: '인터스텔라',
      year: 2014,
      genre: 'Sci-Fi Drama',
      director: '크리스토퍼 놀란',
      location: 'Iceland',
      locationKo: '아이슬란드',
      country: 'Iceland',
      region: 'Europe',
      description: '외계 행성의 모습을 연출하기 위해 선택된 아이슬란드의 초현실적인 자연 풍경들입니다.',
      filmDescription: '크리스토퍼 놀란의 SF 걸작에서 미지의 행성 Mann을 표현하기 위해 활용된 빙하와 화산 지대입니다.',
      visitInfo: '레이캬비크 공항에서 렌터카 필수. 바트나요쿨 국립공원, 요쿨살론 빙하호수 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1681834418277-b01c30279693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VsYW5kJTIwbm9ydGhlcm4lMjBsaWdodHMlMjBhdXJvcmElMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzU1ODY5ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.2,
      duration: '3일',
      scenes: ['Mann 행성 얼음 동굴', '빙하 위에서의 액션', '오로라 아래 우주선'],
      tips: ['겨울 시즌 오로라 관측', '빙하 하이킹 투어 참여', '온천에서 몸 녹이기'],
      coordinates: { lat: 64.1466, lng: -21.9426 }
    },

    // 북미 영화들 추가
    {
      id: 'newyork-avengers',
      title: 'The Avengers',
      titleKo: '어벤져스',
      year: 2012,
      genre: 'Superhero Action',
      director: '조스 웨던',
      location: 'New York City',
      locationKo: '뉴욕시',
      country: 'United States',
      region: 'North America',
      description: '슈퍼히어로들이 외계 침공군과 맞서 싸우는 최종 결전지로 선택된 미국의 대표 도시입니다.',
      filmDescription: '마블 시네마틱 유니버스의 첫 번째 팀업 영화에서 어벤져스의 전설적인 뉴욕 전투가 펼쳐진 무대입니다.',
      visitInfo: '맨해튼 미드타운. 크라이슬러 빌딩, 그랜드 센트럴역, 타임스퀘어가 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1572537082960-0a911922f2de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2VudHJhbCUyMHBhcmslMjBtYW5oYXR0YW4lMjBza3lsaW5lfGVufDF8fHx8MTc1NTg2OTgwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.6,
      duration: '1일',
      scenes: ['크라이슬러 빌딩 주변 공중전', '그랜드 센트럴역 전투', '스타크 타워 결전'],
      tips: ['엠파이어 스테이트 빌딩에서 도시 조망', '마블 굿즈샵에서 기념품 구매', '헬리콥터 투어로 영화 속 시점 체험'],
      coordinates: { lat: 40.7484, lng: -73.9857 }
    },
    {
      id: 'hawaii-jurassic-park',
      title: 'Jurassic Park',
      titleKo: '쥬라기 공원',
      year: 1993,
      genre: 'Adventure Sci-Fi',
      director: '스티븐 스필버그',
      location: 'Kauai Island, Hawaii',
      locationKo: '하와이 카우아이섬',
      country: 'United States',
      region: 'North America',
      description: '선사시대의 신비로운 분위기를 연출한 하와이의 가장 자연스러운 섬으로, 공룡들의 낙원이 재현되었습니다.',
      filmDescription: '스필버그의 공룡 블록버스터에서 이슬라 누블라 섬으로 설정된 실제 촬영지로, 열대 우림과 폭포가 인상적입니다.',
      visitInfo: '호놀룰루에서 국내선으로 30분. 렌터카 또는 헬리콥터 투어로 접근 가능',
      imageUrl: 'https://images.unsplash.com/photo-1654293662212-141334d75b76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWklMjBiZWFjaCUyMHRyb3BpY2FsJTIwaXNsYW5kJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzU1ODY5ODAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.8,
      duration: '2일',
      scenes: ['헬리콥터 착륙 장면의 폭포', '브라키오사우루스 등장 평원', '벨로시랩터 추격전 정글'],
      tips: ['나 팔리 코스트 헬리콥터 투어 필수', '하나레이 베이에서 서핑 체험', '하와이안 바비큐 맛보기'],
      coordinates: { lat: 22.0964, lng: -159.5261 }
    },
    {
      id: 'sanfrancisco-matrix',
      title: 'The Matrix',
      titleKo: '매트릭스',
      year: 1999,
      genre: 'Sci-Fi Action',
      director: '워쇼스키 자매',
      location: 'San Francisco, California',
      locationKo: '샌프란시스코, 캘리포니아',
      country: 'United States',
      region: 'North America',
      description: '사이버펑크의 세계관을 현실에 구현한 샌프란시스코의 미래적 도시 풍경입니다.',
      filmDescription: '키아누 리브스의 네오가 현실과 가상의 경계를 넘나드는 혁신적인 액션 영화의 배경이 된 미래 도시입니다.',
      visitInfo: '샌프란시스코 국제공항에서 BART로 시내 진입. 파이낸셜 디스트릭트가 주요 촬영 구역',
      imageUrl: 'https://images.unsplash.com/photo-1572537082960-0a911922f2de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2VudHJhbCUyMHBhcmslMjBtYW5oYXR0YW4lMjBza3lsaW5lfGVufDF8fHx8MTc1NTg2OTgwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.9,
      duration: '반나절',
      scenes: ['시내 빌딩 옥상 액션', '다운타운 추격전', '지하철역 전투'],
      tips: ['골든 게이트 브릿지 전망대 방문', '케이블카로 시내 이동', '픽셀 아트 갤러리 관람'],
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    {
      id: 'chicago-dark-knight',
      title: 'The Dark Knight',
      titleKo: '다크 나이트',
      year: 2008,
      genre: 'Superhero Thriller',
      director: '크리스토퍼 놀란',
      location: 'Chicago, Illinois',
      locationKo: '시카고, 일리노이',
      country: 'United States',
      region: 'North America',
      description: '고담시의 모델이 된 시카고의 어두운 도시 풍경이 배트맨의 완벽한 배경이 되었습니다.',
      filmDescription: '히스 레저의 조커와 크리스찬 베일의 배트맨이 펼치는 선악의 대결이 시카고의 밤하늘을 배경으로 펼쳐집니다.',
      visitInfo: '오헤어 공항에서 시내까지 지하철 블루라인. 루프 지역이 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1572537082960-0a911922f2de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2VudHJhbCUyMHBhcmslMjBtYW5oYXR0YW4lMjBza3lsaW5lfGVufDF8fHx8MTc1NTg2OTgwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.4,
      duration: '1일',
      scenes: ['시청에서의 폭발 씬', '라살가 터널 추격전', '시어스 타워 야경'],
      tips: ['밀레니엄 파크에서 도시 스카이라인 감상', '시카고 스타일 딥디시 피자 맛보기', '건축 투어 보트 탑승'],
      coordinates: { lat: 41.8781, lng: -87.6298 }
    },

    // 아시아 기타 국가들
    {
      id: 'bangkok-hangover',
      title: 'The Hangover Part II',
      titleKo: '행오버 2',
      year: 2011,
      genre: 'Comedy',
      director: '토드 필립스',
      location: 'Bangkok, Thailand',
      locationKo: '방콕, 태국',
      country: 'Thailand',
      region: 'Asia',
      description: '혼돈과 웃음이 가득한 방콕의 밤문화와 사원들이 어우러진 동남아시아의 대표 관광 도시입니다.',
      filmDescription: '라스베이거스를 넘어서는 더욱 강렬한 모험이 펼쳐지는 방콕의 다채로운 모습을 담은 코미디의 무대입니다.',
      visitInfo: '수완나품 공항에서 시내까지 공항철도 30분. 왓 아룬, 왓 포, 카오산 로드가 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1591233244187-ffd622c51fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5na29rJTIwdGhhaWxhbmQlMjB0ZW1wbGUlMjBnb2xkZW4lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzU1ODY5ODA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 7.8,
      duration: '1일',
      scenes: ['카오산 로드 밤거리', '왓 아룬 사원 액션', '수상시장 보트 추격'],
      tips: ['태국 마사지와 스파 체험', '툭툭 타고 시내 이동', '패드타이와 망고 스티키 라이스 맛보기'],
      coordinates: { lat: 13.7563, lng: 100.5018 }
    },
    {
      id: 'mumbai-slumdog',
      title: 'Slumdog Millionaire',
      titleKo: '슬럼독 밀리어네어',
      year: 2008,
      genre: 'Drama Romance',
      director: '대니 보일',
      location: 'Mumbai, India',
      locationKo: '뭄바이, 인도',
      country: 'India',
      region: 'Asia',
      description: '인도의 경제 수도 뭄바이의 극명한 대비를 보여주는 슬럼가와 현대적 도시 풍경입니다.',
      filmDescription: '아카데미 8개 부문 수상작에서 인도 청년의 꿈과 사랑이 펼쳐지는 생생한 뭄바이의 모습을 담았습니다.',
      visitInfo: '차트라파티 시바지 국제공항에서 시내까지 택시로 1시간. 다라비 슬럼, 차트라파티 시바지역이 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1591233244187-ffd622c51fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5na29rJTIwdGhhaWxhbmQlMjB0ZW1wbGUlMjBnb2xkZW4lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzU1ODY5ODA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.7,
      duration: '1일',
      scenes: ['다라비 슬럼 추격전', '차트라파티 시바지역 댄스', '타지마할 호텔 로맨스'],
      tips: ['슬럼 투어는 전문 가이드와 함께', '볼리우드 영화 관람', '인도 커리와 난 맛보기'],
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    {
      id: 'singapore-crazy-rich',
      title: 'Crazy Rich Asians',
      titleKo: '크레이지 리치 아시안',
      year: 2018,
      genre: 'Romance Comedy',
      director: '존 추',
      location: 'Singapore',
      locationKo: '싱가포르',
      country: 'Singapore',
      region: 'Asia',
      description: '동남아시아의 금융 허브 싱가포르의 화려하고 모던한 도시 풍경과 럭셔리 라이프스타일입니다.',
      filmDescription: '아시아계 미국인들의 로맨스 코미디에서 싱가포르 상류층의 화려한 삶과 전통이 어우러진 촬영지입니다.',
      visitInfo: '창이 공항에서 시내까지 지하철로 1시간. 마리나 베이 샌즈, 가든스 바이 더 베이가 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1591233244187-ffd622c51fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5na29rJTIwdGhhaWxhbmQlMjB0ZW1wbGUlMjBnb2xkZW4lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzU1ODY5ODA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.2,
      duration: '1일',
      scenes: ['마리나 베이 샌즈 인피니티 풀', '가든스 바이 더 베이 야경', '래플스 호텔 웨딩'],
      tips: ['인피니티 풀은 투숙객만 이용 가능', '호커센터에서 현지 음식 체험', '야간 가든스 바이 더 베이 쇼 관람'],
      coordinates: { lat: 1.3521, lng: 103.8198 }
    },

    // 아프리카 및 중동
    {
      id: 'morocco-gladiator',
      title: 'Lawrence of Arabia',
      titleKo: '아라비아의 로렌스',
      year: 1962,
      genre: 'Historical Epic',
      director: '데이비드 린',
      location: 'Sahara Desert, Morocco',
      locationKo: '사하라 사막, 모로코',
      country: 'Morocco',
      region: 'Africa',
      description: '무한히 펼쳐진 사하라 사막의 웅장한 모래 언덕과 오아시스가 만들어내는 신비로운 풍경입니다.',
      filmDescription: '피터 오툴의 T.E. 로렌스가 아랍 독립을 위해 투쟁하는 대서사시의 배경이 된 광활한 사막입니다.',
      visitInfo: '마라케시에서 사막 투어 3일 코스. 메르주가 사구에서 낙타 트레킹과 사막 캠핑 가능',
      imageUrl: 'https://images.unsplash.com/photo-1667143297021-a452e55fdfa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3JvY2NvJTIwZGVzZXJ0JTIwc2FoYXJhJTIwbWFycmFrZWNofGVufDF8fHx8MTc1NTg2OTgwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 9.0,
      duration: '3일',
      scenes: ['사막 횡단 장면', '오아시스에서의 만남', '사구 위에서의 연설'],
      tips: ['일출/일몰 시간 사막 트레킹', '베르베르 전통 텐트 숙박', '별 관측과 사막 음악 감상'],
      coordinates: { lat: 31.0361, lng: -4.0000 }
    },

    // 더 많은 영화들 추가...
    {
      id: 'prague-mission-impossible',
      title: 'Mission: Impossible',
      titleKo: '미션 임파서블',
      year: 1996,
      genre: 'Action Thriller',
      director: '브라이언 드 팔마',
      location: 'Prague, Czech Republic',
      locationKo: '프라하, 체코',
      country: 'Czech Republic',
      region: 'Europe',
      description: '중세의 아름다움이 그대로 보존된 프라하는 첩보 액션 영화의 완벽한 배경이 되었습니다.',
      filmDescription: '톰 크루즈의 이든 헌트가 CIA 침투 작전을 펼치는 랑리 CIA 본부로 설정된 중유럽의 보석같은 도시입니다.',
      visitInfo: '바츨라프 하벨 공항에서 시내까지 버스로 45분. 구시가 광장, 프라하 성이 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1740175571075-a0ba0327cf36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBiaWclMjBiZW4lMjBhcmNoaXRlY3R1cmUlMjBjbGFzc2ljfGVufDF8fHx8MTc1NTg2OTM1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.4,
      duration: '1일',
      scenes: ['CIA 랑리 본부 침투 (실제로는 프라하 국립도서관)', '구시가 광장 추격전', '몰다우 강변 액션'],
      tips: ['천문시계 정시 공연 관람', '체코 맥주와 굴라시 맛보기', '야경이 아름다운 저녁 시간 방문'],
      coordinates: { lat: 50.0755, lng: 14.4378 }
    },
    {
      id: 'vienna-before-sunrise',
      title: 'Before Sunrise',
      titleKo: '비포 선라이즈',
      year: 1995,
      genre: 'Romance Drama',
      director: '리차드 링클레이터',
      location: 'Vienna, Austria',
      locationKo: '빈, 오스트리아',
      country: 'Austria',
      region: 'Europe',
      description: '로맨틱한 유럽 도시 빈의 아름다운 거리와 카페들이 사랑에 빠진 두 청춘의 배경이 되었습니다.',
      filmDescription: '이든 호크와 줄리 델피가 하룻밤 동안 빈을 걸으며 나누는 철학적이고 로맨틱한 대화의 무대입니다.',
      visitInfo: '빈 국제공항에서 CAT 공항특급으로 16분. 내성, 프라터 공원, 도나우 강변이 주요 촬영지',
      imageUrl: 'https://images.unsplash.com/photo-1740175571075-a0ba0327cf36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBiaWclMjBiZW4lMjBhcmNoaXRlY3R1cmUlMjBjbGFzc2ljfGVufDF8fHx8MTc1NTg2OTM1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.6,
      duration: '1일',
      scenes: ['프라터 공원 관람차', '도나우 강변 산책', '빈 내성 카페'],
      tips: ['카페 문화 체험하기', '잘츠부르크까지 기차 여행', '모차르트 콘서트 관람'],
      coordinates: { lat: 48.2082, lng: 16.3738 }
    },
    {
      id: 'berlin-run-lola-run',
      title: 'Run Lola Run',
      titleKo: '롤라 런',
      year: 1998,
      genre: 'Thriller',
      director: '톰 티크베어',
      location: 'Berlin, Germany',
      locationKo: '베를린, 독일',
      country: 'Germany',
      region: 'Europe',
      description: '통일 후 베를린의 역동적인 도시 풍경이 20분간의 숨막히는 질주와 함께 펼쳐집니다.',
      filmDescription: '붉은 머리의 롤라가 남자친구를 구하기 위해 베를린 시내를 전력질주하는 실험적 영화의 무대입니다.',
      visitInfo: '베를린 브란덴부르크 공항에서 시내까지 공항특급으로 30분. 미테 지구가 주요 촬영 구역',
      imageUrl: 'https://images.unsplash.com/photo-1740175571075-a0ba0327cf36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBiaWclMjBiZW4lMjBhcmNoaXRlY3R1cmUlMjBjbGFzc2ljfGVufDF8fHx8MTc1NTg2OTM1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 8.1,
      duration: '반나절',
      scenes: ['브란덴부르크 문 근처 달리기', '오버바움 다리 건너기', '알렉산더 광장 인파'],
      tips: ['베를린 장벽 기념관 방문', '커리부어스트와 독일 맥주', '이스트 사이드 갤러리 벽화 감상'],
      coordinates: { lat: 52.5200, lng: 13.4050 }
    }
  ];

  const regions = ['popular', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Africa'];
  const genres = ['all', 'drama', 'romance', 'thriller', 'action', 'musical', 'comedy', 'animation', 'historical', 'superhero', 'sci-fi'];

  const getLocationsByTab = (tab: string) => {
    if (tab === 'popular') {
      return filmLocations.filter(location => location.popularRank && location.popularRank <= 10);
    }
    return filmLocations.filter(location => location.region === tab);
  };

  const filteredLocations = useMemo(() => {
    let filtered = searchQuery ? filmLocations : getLocationsByTab(activeTab);

    if (searchQuery) {
      filtered = filtered.filter(location => 
        location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.titleKo.includes(searchQuery) ||
        location.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.locationKo.includes(searchQuery)
      );
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(location => location.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    return filtered.sort((a, b) => {
      if (a.popularRank && b.popularRank) {
        return a.popularRank - b.popularRank;
      }
      if (a.popularRank && !b.popularRank) return -1;
      if (!a.popularRank && b.popularRank) return 1;
      return b.rating - a.rating;
    });
  }, [searchQuery, selectedGenre, activeTab]);

  const totalPages = Math.ceil(filteredLocations.length / locationsPerPage);
  const currentLocations = filteredLocations.slice(
    (currentPage - 1) * locationsPerPage,
    currentPage * locationsPerPage
  );

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const handleExploreLocation = (locationKo: string) => {
    onDestinationClick(locationKo);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-gray-400 hover:text-white" 
              onClick={onBackToHome}
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Go Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold">T</span>
              </div>
              <h1 className="text-xl font-bold text-white hidden sm:block">TripRadio.AI</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-sm text-gray-400 hover:text-white">English</Button>
              <Button variant="ghost" size="sm" className="text-sm text-gray-400 hover:text-white">History</Button>
              <Button variant="ghost" size="sm" className="text-sm text-gray-400 hover:text-white">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Film Strip Effect */}
      <section className="relative py-20 overflow-hidden">
        {/* Film Strip Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="absolute top-0 left-0 w-full h-8 bg-black border-b-2 border-white opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-full h-8 bg-black border-t-2 border-white opacity-20"></div>
          
          {/* Film Perforations */}
          <div className="absolute left-4 top-0 bottom-0 w-4 bg-black">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="w-3 h-3 bg-white rounded-full my-4 opacity-30"></div>
            ))}
          </div>
          <div className="absolute right-4 top-0 bottom-0 w-4 bg-black">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="w-3 h-3 bg-white rounded-full my-4 opacity-30"></div>
            ))}
          </div>
        </div>

        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571847140471-1d7766e825ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMGNpbmVtYSUyMGZpbG0lMjByZWVsJTIwdmludGFnZXxlbnwxfHx8fDE3NTU4NjkzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Cinema film reel"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
            <Film className="w-4 h-4" />
            <span>Cinema Locations</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="block mb-2">영화 속 그 장소로</span>
            <span className="block text-yellow-400">떠나는 여행</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            세계적인 명작들이 탄생한 실제 촬영지를 직접 체험하고, 영화 속 주인공이 되어보세요
          </p>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="영화 제목이나 촬영지를 검색하세요 (예: 기생충, 파리, Tokyo)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetPagination();
                }}
                className="pl-12 pr-4 py-3 text-lg rounded-full border-gray-600 bg-black/50 backdrop-blur-md text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/30"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    resetPagination();
                  }}
                  className="px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-black/50 backdrop-blur-md text-white"
                >
                  <option value="all">모든 장르</option>
                  <option value="drama">드라마</option>
                  <option value="romance">로맨스</option>
                  <option value="thriller">스릴러</option>
                  <option value="action">액션</option>
                  <option value="musical">뮤지컬</option>
                  <option value="comedy">코미디</option>
                  <option value="animation">애니메이션</option>
                  <option value="historical">사극</option>
                  <option value="superhero">슈퍼히어로</option>
                  <option value="sci-fi">SF</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            resetPagination();
            setSearchQuery('');
          }}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-1 bg-gray-900">
              <TabsTrigger value="popular" className="text-xs sm:text-sm py-2 text-gray-300 data-[state=active]:text-yellow-400">인기작품</TabsTrigger>
              <TabsTrigger value="Asia" className="text-xs sm:text-sm py-2 text-gray-300 data-[state=active]:text-yellow-400">아시아</TabsTrigger>
              <TabsTrigger value="Europe" className="text-xs sm:text-sm py-2 text-gray-300 data-[state=active]:text-yellow-400">유럽</TabsTrigger>
              <TabsTrigger value="North America" className="text-xs sm:text-sm py-2 text-gray-300 data-[state=active]:text-yellow-400">북미</TabsTrigger>
              <TabsTrigger value="South America" className="text-xs sm:text-sm py-2 text-gray-300 data-[state=active]:text-yellow-400">남미</TabsTrigger>
              <TabsTrigger value="Oceania" className="text-xs sm:text-sm py-2 text-gray-300 data-[state=active]:text-yellow-400">오세아니아</TabsTrigger>
              <TabsTrigger value="Africa" className="text-xs sm:text-sm py-2 text-gray-300 data-[state=active]:text-yellow-400">아프리카</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {searchQuery ? `'${searchQuery}' 검색 결과` : `${activeTab === 'popular' ? '인기 영화 촬영지' : activeTab} 촬영지`} ({filteredLocations.length}개)
              </h2>
              <p className="text-gray-400 mt-1">
                실제 촬영지를 방문해서 영화 속 장면을 재현해보세요
              </p>
            </div>

            {totalPages > 1 && (
              <div className="text-sm text-gray-500">
                페이지 {currentPage} / {totalPages}
              </div>
            )}
          </div>

          {/* Film Locations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentLocations.map((location) => (
              <Card 
                key={location.id}
                className={`bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300 cursor-pointer overflow-hidden ${
                  selectedLocation?.id === location.id ? 'ring-2 ring-yellow-400' : ''
                }`}
                onClick={() => setSelectedLocation(selectedLocation?.id === location.id ? null : location)}
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={location.imageUrl}
                    alt={location.location}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Film Strip Effect on Image */}
                  <div className="absolute top-2 left-2 right-2 h-1 bg-white/20 flex space-x-1">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="w-2 h-1 bg-white/30 rounded-full"></div>
                    ))}
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    {location.popularRank && location.popularRank <= 10 && (
                      <Badge className="bg-yellow-400 text-black text-xs font-bold">
                        #{location.popularRank}
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{location.rating}</span>
                      <Clock className="w-4 h-4 text-gray-300 ml-2" />
                      <span className="text-gray-300 text-sm">{location.duration}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{location.titleKo}</h3>
                    <p className="text-gray-300 text-sm">{location.title} ({location.year})</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">{location.locationKo}</p>
                        <p className="text-gray-400 text-sm">{location.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">감독</span>
                      <span className="text-sm text-white">{location.director}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">장르</span>
                      <Badge className="bg-gray-800 text-gray-300 text-xs">
                        {location.genre}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mt-4 line-clamp-2">
                    {location.description}
                  </p>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExploreLocation(location.locationKo);
                    }}
                    className="w-full mt-4 bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    이 장소 가이드 보기
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-400">다른 검색어를 시도하거나 필터를 변경해보세요</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                이전
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 p-0 ${
                      currentPage === pageNum 
                        ? 'bg-yellow-400 text-black' 
                        : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                다음
              </Button>
            </div>
          )}

          {/* Selected Location Details */}
          {selectedLocation && (
            <Card className="mt-12 p-8 bg-gray-900 border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={selectedLocation.imageUrl}
                        alt={selectedLocation.location}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Film className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedLocation.titleKo}</h2>
                    <p className="text-xl text-gray-300">{selectedLocation.title} ({selectedLocation.year})</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">{selectedLocation.rating}</span>
                      </div>
                      <Badge className="bg-gray-800 text-gray-300">
                        {selectedLocation.genre}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedLocation(null)} className="text-gray-400 hover:text-white">
                  ✕
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <MapPin className="w-5 h-5 text-yellow-400 mr-2" />
                      촬영지 정보
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">위치</span>
                          <span className="text-white font-medium">{selectedLocation.locationKo}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">국가</span>
                          <span className="text-white font-medium">{selectedLocation.country}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">감독</span>
                          <span className="text-white font-medium">{selectedLocation.director}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">관람 소요시간</span>
                          <span className="text-white font-medium">{selectedLocation.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <Camera className="w-5 h-5 text-yellow-400 mr-2" />
                      주요 촬영 장면
                    </h3>
                    <ul className="space-y-2">
                      {selectedLocation.scenes.map((scene, index) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                          <Play className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <span className="text-gray-300">{scene}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <Film className="w-5 h-5 text-yellow-400 mr-2" />
                      영화 속 이야기
                    </h3>
                    <p className="text-gray-300 leading-relaxed p-4 bg-gray-800 rounded-lg">
                      {selectedLocation.filmDescription}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <Globe className="w-5 h-5 text-yellow-400 mr-2" />
                      방문 팁
                    </h3>
                    <ul className="space-y-2">
                      {selectedLocation.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                          <Award className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <span className="text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Navigation className="w-5 h-5 text-yellow-400 mr-2" />
                  방문 안내
                </h3>
                <div className="p-4 bg-blue-900/30 rounded-lg border-l-4 border-blue-400">
                  <p className="text-blue-200">{selectedLocation.visitInfo}</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-300">{selectedLocation.description}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleExploreLocation(selectedLocation.locationKo)}
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500 transition-colors py-3"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  {selectedLocation.locationKo} 가이드 보기
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 py-3"
                >
                  <Users className="w-5 h-5 mr-2" />
                  여행 일정에 추가
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Film className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            영화 속 감동을 현실에서 만나보세요
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            촬영지 탐방을 마쳤다면, TripRadio.AI와 함께 완벽한 여행을 계획해보세요
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">영화 촬영지 탐방</h3>
              <p className="text-sm text-gray-300">
                전 세계 유명 영화들의 실제 촬영지를 찾아 특별한 추억을 만드세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">상세 가이드 제공</h3>
              <p className="text-sm text-gray-300">
                AI가 각 촬영지의 상세한 정보와 최적의 여행 루트를 제공합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-medium text-white mb-2">실시간 오디오 가이드</h3>
              <p className="text-sm text-gray-300">
                현지에서 영화 속 장면과 비하인드 스토리를 실시간으로 들어보세요
              </p>
            </div>
          </div>

          <Button
            onClick={onBackToHome}
            className="bg-yellow-400 text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-yellow-500 transition-colors"
          >
            통합 여행 서비스 시작하기
          </Button>
        </div>
      </section>
    </div>
  );
}