-- guides 테이블에 location_region, country_code 컬럼 추가
-- 동일한 장소명의 다른 지역/나라 구분을 위한 스키마 확장

-- 1. location_region 컬럼 추가 (지역/도시 정보)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' AND column_name = 'location_region'
    ) THEN
        ALTER TABLE guides ADD COLUMN location_region TEXT;
        RAISE NOTICE 'location_region TEXT 컬럼이 guides 테이블에 추가되었습니다.';
    ELSE
        RAISE NOTICE 'location_region 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 2. country_code 컬럼 추가 (국가 코드)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' AND column_name = 'country_code'
    ) THEN
        ALTER TABLE guides ADD COLUMN country_code VARCHAR(3);
        RAISE NOTICE 'country_code VARCHAR(3) 컬럼이 guides 테이블에 추가되었습니다.';
    ELSE
        RAISE NOTICE 'country_code 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 3. 기존 UNIQUE 제약조건 제거 (안전하게)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'guides_location_language_unique' 
        AND table_name = 'guides'
    ) THEN
        ALTER TABLE guides DROP CONSTRAINT guides_location_language_unique;
        RAISE NOTICE '기존 guides_location_language_unique 제약조건을 제거했습니다.';
    END IF;
END $$;

-- 4. 새로운 UNIQUE 제약조건 추가 (지역 정보 포함)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'guides_location_region_language_unique' 
        AND table_name = 'guides'
    ) THEN
        ALTER TABLE guides ADD CONSTRAINT guides_location_region_language_unique 
        UNIQUE (locationname, location_region, country_code, language);
        RAISE NOTICE '새로운 guides_location_region_language_unique 제약조건을 추가했습니다.';
    ELSE
        RAISE NOTICE 'guides_location_region_language_unique 제약조건이 이미 존재합니다.';
    END IF;
END $$;

-- 5. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_guides_location_region ON guides(locationname, location_region);
CREATE INDEX IF NOT EXISTS idx_guides_country_code ON guides(country_code);
CREATE INDEX IF NOT EXISTS idx_guides_region_country ON guides(location_region, country_code);

-- 6. 기존 데이터 업데이트 (한국 지역으로 기본 설정)
-- 기존 데이터는 대부분 한국 관광지로 추정
UPDATE guides 
SET 
    location_region = CASE 
        WHEN locationname LIKE '%서울%' OR locationname LIKE '%seoul%' THEN '서울특별시'
        WHEN locationname LIKE '%부산%' OR locationname LIKE '%busan%' THEN '부산광역시'
        WHEN locationname LIKE '%제주%' OR locationname LIKE '%jeju%' THEN '제주특별자치도'
        WHEN locationname LIKE '%경주%' OR locationname LIKE '%gyeongju%' THEN '경상북도'
        WHEN locationname LIKE '%인천%' OR locationname LIKE '%incheon%' THEN '인천광역시'
        WHEN locationname LIKE '%대전%' OR locationname LIKE '%daejeon%' THEN '대전광역시'
        WHEN locationname LIKE '%대구%' OR locationname LIKE '%daegu%' THEN '대구광역시'
        WHEN locationname LIKE '%광주%' OR locationname LIKE '%gwangju%' THEN '광주광역시'
        WHEN locationname LIKE '%울산%' OR locationname LIKE '%ulsan%' THEN '울산광역시'
        -- 해외 주요 관광지
        WHEN locationname LIKE '%paris%' OR locationname LIKE '%파리%' OR locationname LIKE '%에펠%' OR locationname LIKE '%루브르%' THEN '파리'
        WHEN locationname LIKE '%london%' OR locationname LIKE '%런던%' OR locationname LIKE '%빅벤%' THEN '런던'
        WHEN locationname LIKE '%rome%' OR locationname LIKE '%로마%' OR locationname LIKE '%콜로세움%' THEN '로마'
        WHEN locationname LIKE '%new york%' OR locationname LIKE '%뉴욕%' OR locationname LIKE '%자유의 여신%' THEN '뉴욕'
        WHEN locationname LIKE '%tokyo%' OR locationname LIKE '%도쿄%' OR locationname LIKE '%동경%' THEN '도쿄'
        WHEN locationname LIKE '%beijing%' OR locationname LIKE '%베이징%' OR locationname LIKE '%북경%' THEN '베이징'
        ELSE '미분류'
    END,
    country_code = CASE
        -- 한국 지역들
        WHEN locationname LIKE '%서울%' OR locationname LIKE '%seoul%' 
             OR locationname LIKE '%부산%' OR locationname LIKE '%busan%'
             OR locationname LIKE '%제주%' OR locationname LIKE '%jeju%'
             OR locationname LIKE '%경주%' OR locationname LIKE '%gyeongju%'
             OR locationname LIKE '%인천%' OR locationname LIKE '%incheon%'
             OR locationname LIKE '%대전%' OR locationname LIKE '%daejeon%'
             OR locationname LIKE '%대구%' OR locationname LIKE '%daegu%'
             OR locationname LIKE '%광주%' OR locationname LIKE '%gwangju%'
             OR locationname LIKE '%울산%' OR locationname LIKE '%ulsan%'
             OR locationname LIKE '%경복궁%' OR locationname LIKE '%창덕궁%'
             OR locationname LIKE '%불국사%' OR locationname LIKE '%석굴암%' THEN 'KR'
        -- 프랑스
        WHEN locationname LIKE '%paris%' OR locationname LIKE '%파리%' 
             OR locationname LIKE '%에펠%' OR locationname LIKE '%루브르%' 
             OR locationname LIKE '%베르사유%' THEN 'FR'
        -- 영국
        WHEN locationname LIKE '%london%' OR locationname LIKE '%런던%' 
             OR locationname LIKE '%빅벤%' OR locationname LIKE '%타워%브리지%' THEN 'GB'
        -- 이탈리아
        WHEN locationname LIKE '%rome%' OR locationname LIKE '%로마%' 
             OR locationname LIKE '%콜로세움%' OR locationname LIKE '%바티칸%' THEN 'IT'
        -- 미국
        WHEN locationname LIKE '%new york%' OR locationname LIKE '%뉴욕%' 
             OR locationname LIKE '%자유의 여신%' OR locationname LIKE '%타임스%스퀘어%' THEN 'US'
        -- 일본
        WHEN locationname LIKE '%tokyo%' OR locationname LIKE '%도쿄%' 
             OR locationname LIKE '%동경%' THEN 'JP'
        -- 중국
        WHEN locationname LIKE '%beijing%' OR locationname LIKE '%베이징%' 
             OR locationname LIKE '%북경%' THEN 'CN'
        ELSE 'KR' -- 기본값으로 한국 설정
    END
WHERE location_region IS NULL AND country_code IS NULL;

-- 7. 업데이트된 데이터 확인
SELECT 
    locationname,
    location_region,
    country_code,
    language,
    COUNT(*) as count
FROM guides 
WHERE location_region IS NOT NULL OR country_code IS NOT NULL
GROUP BY locationname, location_region, country_code, language
ORDER BY count DESC, locationname;

-- 8. 성공 메시지
SELECT 'guides 테이블 지역 구분 스키마 확장 완료! 🌍' as status;

-- 9. 테이블 구조 확인 (선택사항)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'guides' 
-- ORDER BY ordinal_position;