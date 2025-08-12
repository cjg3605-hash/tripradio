-- 🔍 지역 정보 및 좌표 마이그레이션 상태 확인

-- 1. 전체 가이드 현황
SELECT 
    COUNT(*) as total_guides,
    COUNT(coordinates) as has_coordinates,
    COUNT(location_region) as has_location_region,
    COUNT(country_code) as has_country_code
FROM guides;

-- 2. 마이그레이션 상태별 통계
SELECT 
    CASE 
        WHEN coordinates IS NOT NULL AND location_region IS NOT NULL AND country_code IS NOT NULL THEN 'COMPLETE'
        WHEN coordinates IS NOT NULL AND (location_region IS NULL OR country_code IS NULL) THEN 'COORDINATES_ONLY'
        WHEN coordinates IS NULL AND (location_region IS NOT NULL OR country_code IS NOT NULL) THEN 'REGIONAL_ONLY'
        ELSE 'EMPTY'
    END as migration_status,
    COUNT(*) as count
FROM guides
GROUP BY migration_status
ORDER BY count DESC;

-- 3. 최근 마이그레이션된 가이드 샘플 확인 (지역 정보 포함)
SELECT 
    locationname,
    language,
    location_region,
    country_code,
    CASE 
        WHEN coordinates IS NOT NULL THEN jsonb_array_length(coordinates)
        ELSE 0 
    END as coordinates_count,
    updated_at
FROM guides 
WHERE coordinates IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 10;

-- 4. 국가별 통계
SELECT 
    country_code,
    COUNT(*) as guide_count,
    COUNT(DISTINCT locationname) as unique_locations
FROM guides 
WHERE country_code IS NOT NULL
GROUP BY country_code
ORDER BY guide_count DESC;

-- 5. 지역별 통계 (상위 10개)
SELECT 
    location_region,
    country_code,
    COUNT(*) as guide_count
FROM guides 
WHERE location_region IS NOT NULL
GROUP BY location_region, country_code
ORDER BY guide_count DESC
LIMIT 10;