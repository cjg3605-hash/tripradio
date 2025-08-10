import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';
import stringSimilarity from 'string-similarity';
// 🚀 Enhanced Location Service 통합
import { enhancedLocationService, LocationInput } from '@/lib/coordinates/enhanced-location-service';

// 통합된 Google API 키 사용
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

// 공식명 리스트 (서비스에 맞게 확장)
const OFFICIAL_NAMES = [
  'royal alcázar of seville',
  'real alcázar de sevilla',
  'alcazar of seville',
  'alcázar of seville',
  'alcazar de sevilla',
  'palacio gótico',
  'patio de banderas',
  'patio del león',
  'salón de embajadores',
  'patio de las doncellas',
  'gardens',
  'cathedral of seville',
  'catedral de sevilla',
  'giralda tower',
  'patio de los naranjos',
  'main altar',
  'tomb of christopher columbus',
  'royal chapel',
  'interior of the cathedral',
  // ... 필요시 추가 ...
];

function getBestMatchName(input) {
  const { bestMatch } = stringSimilarity.findBestMatch(input, OFFICIAL_NAMES);
  return bestMatch.rating > 0.5 ? bestMatch.target : input;
}

// 1. Google Places API (영어 검색 추가)
export async function getGooglePlace(locationName: string) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
  const params = {
    input: locationName,
    inputtype: 'textquery',
    fields: 'geometry,place_id,name,formatted_address',
    key: GOOGLE_API_KEY,
  };
  
  try {
    // 1차: 원본 검색어로 검색
    let res = await axios.get(url, { params });
    let candidate = res.data.candidates?.[0];
    
    // 2차: 실패시 영어로 재검색
    if (!candidate && locationName) {
      console.log(`🔄 영어 재검색: ${locationName}`);
      
      const englishLocationName = convertLocationToEnglish(locationName);
      console.log(`🔍 영어 검색어: ${englishLocationName}`);
      
      const englishParams = { ...params, input: englishLocationName };
      const englishRes = await axios.get(url, { params: englishParams });
      candidate = englishRes.data.candidates?.[0];
      
      if (candidate) {
        console.log(`✅ 영어 검색 성공: ${candidate.name}`);
      }
    }
    
    return candidate;
  } catch (error) {
    console.error('Google Places API 오류:', error);
    return null;
  }
}

/**
 * 간단한 영어 변환 함수
 */
function convertLocationToEnglish(locationName: string): string {
  let english = locationName;
  
  // 한국어 → 영어
  english = english
    .replace(/역/g, ' Station')
    .replace(/(\d+)번\s*출구/g, 'Exit $1')
    .replace(/출구/g, 'Exit')
    .replace(/입구/g, 'Entrance')
    .replace(/매표소/g, 'Ticket Office')
    .replace(/센터/g, 'Center')
    .replace(/공원/g, 'Park')
    .replace(/박물관/g, 'Museum')
    .replace(/궁/g, 'Palace')
    .replace(/시장/g, 'Market')
    .replace(/다리/g, 'Bridge');
    
  // 일본어 → 영어
  english = english
    .replace(/駅/g, ' Station')
    .replace(/(\d+)番出口/g, 'Exit $1')
    .replace(/出口/g, 'Exit');
    
  // 중국어 → 영어  
  english = english
    .replace(/车站|地铁站/g, ' Station')
    .replace(/(\d+)号出口/g, 'Exit $1')
    .replace(/出口/g, 'Exit');
  
  return english.trim();
}

// 2. Google Geocoding API
export async function getGoogleGeocode(locationName: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json`;
  const params = {
    address: locationName,
    key: GOOGLE_API_KEY,
  };
  const res = await axios.get(url, { params });
  return res.data.results[0];
}

// 3. OSM Overpass API
export async function getOSMPlace(locationName: string) {
  const query = `[out:json];node["name"="${locationName}"];out body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await axios.get(url);
  return res.data.elements[0];
}

// 4. Wikidata SPARQL
export async function getWikidataPlace(locationName: string) {
  const endpoint = 'https://query.wikidata.org/sparql';
  const query = `
    SELECT ?item ?itemLabel ?coord WHERE {
      ?item rdfs:label "${locationName}"@ko;
            wdt:P625 ?coord.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],ko,en". }
    } LIMIT 1
  `;
  const res = await axios.get(endpoint, {
    params: { query, format: 'json' },
    headers: { 'Accept': 'application/sparql-results+json' }
  });
  return res.data.results.bindings[0];
}

// 5. 통합: 우선순위대로 공식 데이터 반환
export async function getBestOfficialPlace(locationName: string) {
  // 1. Google Places
  const google = await getGooglePlace(locationName);
  if (google) return { source: 'google', ...google };
  // 2. Geocoding
  const geocode = await getGoogleGeocode(locationName);
  if (geocode) return { source: 'geocode', ...geocode };
  // 3. OSM
  const osm = await getOSMPlace(locationName);
  if (osm) return { source: 'osm', ...osm };
  // 4. Wikidata
  const wiki = await getWikidataPlace(locationName);
  if (wiki) return { source: 'wikidata', ...wiki };
  return null;
}

// === 골든레코드 자동화 유틸리티 ===
async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=ko`;
  const res = await axios.get(url);
  if (res.data.results && res.data.results.length > 0) {
    return res.data.results[0].formatted_address || '';
  }
  return '';
}

async function validateCoordinates(coords, originalName) {
  const address = await reverseGeocode(coords.lat, coords.lng);
  const sim = stringSimilarity.compareTwoStrings(
    address.trim().toLowerCase(),
    originalName.trim().toLowerCase()
  );
  return sim > 0.7;
}

async function saveGoldenRecord(locationName, language, coords, placeId, source, validation, validation_score) {
  await supabase.from('places').upsert([
    {
      location_name: locationName,
      language,
      coordinates: coords,
      place_id: placeId,
      source,
      validation,
      validation_score,
    }
  ]);
}

export async function getOrCreateGoldenCoordinates(locationName, language) {
  const normLocation = locationName.trim().toLowerCase();
  const normLang = language.trim().toLowerCase();
  
  try {
    // 1. DB 캐시 조회 (기존 유지)
    const { data: cached } = await supabase
      .from('places')
      .select('*')
      .eq('location_name', normLocation)
      .eq('language', normLang)
      .single();
    if (cached && cached.coordinates) {
      console.log(`✅ DB 캐시 적중: ${locationName}`);
      return cached.coordinates;
    }

    // 2. 🎯 Enhanced Location Service 사용
    console.log(`🚀 Enhanced Location Service 시작: ${locationName}`);
    
    const locationInput: LocationInput = {
      query: locationName,
      language: normLang,
      context: '', // 필요시 추가 컨텍스트
    };

    const result = await enhancedLocationService.findLocation(locationInput);
    
    if (result.error) {
      throw new Error(result.error);
    }

    // 3. 결과 검증
    if (result.accuracy === 'low' || result.confidence < 0.5) {
      console.warn(`⚠️ 낮은 정확도: ${locationName} (accuracy: ${result.accuracy}, confidence: ${result.confidence})`);
    }

    // 4. DB에 저장 (Enhanced 결과)
    const coords = result.coordinates;
    const validation = result.accuracy === 'high' ? 'ok' : result.accuracy === 'medium' ? 'review' : 'fail';
    const validation_score = result.quality.consensusScore;
    
    await saveGoldenRecord(
      normLocation, 
      normLang, 
      coords, 
      result.metadata.address, // placeId 대신 주소 사용
      result.sources.join(','), // 여러 소스 정보
      validation, 
      validation_score
    );

    console.log(`✅ Enhanced 좌표 반환: ${result.metadata.officialName} (${result.accuracy})`);
    console.log(`📍 좌표: ${coords.lat}, ${coords.lng}`);
    console.log(`🔍 소스: ${result.sources.join(', ')}`);
    console.log(`⚡ 처리시간: ${result.metadata.processingTimeMs}ms`);
    
    return coords;

  } catch (error) {
    console.error(`❌ Enhanced Location Service 실패: ${locationName}`, error);
    
    // 폴백: 기존 방식 사용
    console.log(`🔄 기존 방식으로 폴백: ${locationName}`);
    return await getOrCreateGoldenCoordinatesLegacy(locationName, language);
  }
}

// 기존 방식 백업 (폴백용)
async function getOrCreateGoldenCoordinatesLegacy(locationName, language) {
  const normLocation = locationName.trim().toLowerCase();
  const normLang = language.trim().toLowerCase();
  
  // 기존 로직 유지
  const bestMatchName = getBestMatchName(normLocation);
  console.log('[Legacy 좌표 fetch] input:', normLocation, 'bestMatch:', bestMatchName, 'language:', normLang);
  
  const google = await getGooglePlace(bestMatchName);
  let coords: { lat: number; lng: number } | null = null;
  let placeId: string | null = null;
  let source: string | null = null;
  
  if (google && google.geometry && google.geometry.location) {
    coords = { lat: google.geometry.location.lat, lng: google.geometry.location.lng };
    placeId = google.place_id;
    source = 'google';
  }
  
  let validation = 'ok', validation_score = 1;
  if (coords) {
    const address = await reverseGeocode(coords.lat, coords.lng);
    const sim = stringSimilarity.compareTwoStrings(address.trim().toLowerCase(), normLocation);
    validation = sim > 0.7 ? 'ok' : 'review';
    validation_score = sim;
    if (validation === 'review') {
      console.warn(`[Legacy 좌표 검증 실패] ${locationName} (${language}) → ${address} (score: ${sim})`);
    }
  }
  
  if (!coords) {
    validation = 'fail';
    validation_score = 0;
    await saveGoldenRecord(normLocation, normLang, null, null, null, validation, validation_score);
    console.error(`[Legacy 좌표 fetch 완전 실패] ${locationName} (${language})`);
    throw new Error('좌표를 찾을 수 없습니다.');
  }
  
  await saveGoldenRecord(normLocation, normLang, coords, placeId, source, validation, validation_score);
  return coords;
} 