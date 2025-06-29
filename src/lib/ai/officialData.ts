import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';
import stringSimilarity from 'string-similarity';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

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

async function saveGoldenRecord(locationName, language, coords, placeId, source) {
  await supabase.from('places').upsert([
    {
      location_name: locationName,
      language,
      coordinates: coords,
      place_id: placeId,
      source,
    }
  ]);
}

export async function getOrCreateGoldenCoordinates(locationName, language) {
  const normLocation = locationName.trim().toLowerCase();
  const normLang = language.trim().toLowerCase();
  // 1. 캐시/DB 조회
  const { data: cached } = await supabase
    .from('places')
    .select('*')
    .eq('location_name', normLocation)
    .eq('language', normLang)
    .single();
  if (cached && cached.coordinates) return cached.coordinates;
  // 2. 공식 API 순차 호출 (구글 → OSM → Wikidata)
  let coords = null;
  let placeId = null;
  let source = null;
  const google = await getGooglePlace(normLocation);
  if (google && google.geometry && google.geometry.location) {
    coords = { lat: google.geometry.location.lat, lng: google.geometry.location.lng };
    placeId = google.place_id;
    source = 'google';
  }
  // OSM, Wikidata 등 추가 폴백 가능
  if (!coords) {
    const osm = await getOSMPlace(normLocation);
    if (osm && osm.lat && osm.lon) {
      coords = { lat: parseFloat(osm.lat), lng: parseFloat(osm.lon) };
      source = 'osm';
    }
  }
  // 3. 검증 (구글/OSM 등 공식 데이터는 생략 가능, AI 등은 반드시 검증)
  if (!coords) throw new Error('좌표를 찾을 수 없습니다.');
  // 4. 골든레코드 저장
  await saveGoldenRecord(normLocation, normLang, coords, placeId, source);
  return coords;
} 