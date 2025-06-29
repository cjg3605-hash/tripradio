import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';
import stringSimilarity from 'string-similarity';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 공식명 리스트 (서비스에 맞게 확장)
const OFFICIAL_NAMES = [
  'cathedral of seville',
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
  return bestMatch.rating > 0.7 ? bestMatch.target : input;
}

// 1. Google Places API
export async function getGooglePlace(locationName: string) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
  const params = {
    input: locationName,
    inputtype: 'textquery',
    fields: 'geometry,place_id,name',
    key: GOOGLE_API_KEY,
  };
  const res = await axios.get(url, { params });
  return res.data.candidates[0];
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
  // 1. DB 캐시 조회
  const { data: cached } = await supabase
    .from('places')
    .select('*')
    .eq('location_name', normLocation)
    .eq('language', normLang)
    .single();
  if (cached && cached.coordinates) return cached.coordinates;
  // 2. 공식명 유사어 매칭
  const bestMatchName = getBestMatchName(normLocation);
  // 3. 공식 API 호출 (구글 등)
  const google = await getGooglePlace(bestMatchName);
  let coords = null, placeId = null, source = null;
  if (google && google.geometry && google.geometry.location) {
    coords = { lat: google.geometry.location.lat, lng: google.geometry.location.lng };
    placeId = google.place_id;
    source = 'google';
  }
  // ... OSM, Wikidata 등 폴백 추가 가능
  // 4. 좌표 검증 (역지오코딩 + 유사도)
  let validation = 'ok', validation_score = 1;
  if (coords) {
    const address = await reverseGeocode(coords.lat, coords.lng);
    const sim = stringSimilarity.compareTwoStrings(address.trim().toLowerCase(), normLocation);
    validation = sim > 0.7 ? 'ok' : 'review';
    validation_score = sim;
    if (validation === 'review') {
      console.warn(`[좌표 검증 실패] ${locationName} (${language}) → ${address} (score: ${sim})`);
    }
  }
  if (!coords) throw new Error('좌표를 찾을 수 없습니다.');
  await saveGoldenRecord(normLocation, normLang, coords, placeId, source, validation, validation_score);
  return coords;
} 