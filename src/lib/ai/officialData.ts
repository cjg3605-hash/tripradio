import axios from 'axios';

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