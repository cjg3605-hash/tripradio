// 브라우저 콘솔에서 실행할 테스트 스크립트
async function testAutocomplete(query = '서울') {
    console.log('🔍 자동완성 테스트 시작:', query);
    
    try {
        const url = `http://localhost:3020/api/locations/search?q=${encodeURIComponent(query)}&lang=ko`;
        console.log('📡 요청 URL:', url);
        
        const response = await fetch(url);
        console.log('📊 응답 상태:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ 응답 데이터:', data);
        console.log('📈 결과 개수:', data.data?.length || 0);
        console.log('📝 결과 목록:', data.data?.map(item => `${item.name} (${item.location})`));
        
        return data;
    } catch (error) {
        console.error('❌ 테스트 실패:', error);
        return null;
    }
}

// 여러 쿼리로 테스트
async function runTests() {
    const queries = ['서울', '파리', '도쿄', 'New York', '에펠탑'];
    
    for (const query of queries) {
        console.log(`\n=== ${query} 테스트 ===`);
        await testAutocomplete(query);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    }
}

// 사용법:
console.log('자동완성 테스트 스크립트 로드됨');
console.log('사용법:');
console.log('testAutocomplete("서울") - 단일 테스트');
console.log('runTests() - 여러 쿼리 테스트');