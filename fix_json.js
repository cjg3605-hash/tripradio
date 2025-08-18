const fs = require('fs');

// 파일 읽기
const content = fs.readFileSync('public/locales/translations.json', 'utf-8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

// 라인 11095부터 시작하는 tripPlanner 섹션 찾기
let startLine = null;
let endLine = null;

// 라인 11095 확인
console.log('Line 11095:', lines[11094]?.trim());

// 더 정확한 패턴으로 찾기
for (let i = 11090; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('"tripPlanner": {') && startLine === null) {
        startLine = i;
        console.log('Found tripPlanner start at line:', i + 1);
        break;
    }
}

if (startLine !== null) {
    // startLine부터 해당 섹션의 끝을 찾기
    let braceCount = 0;
    let inTripPlanner = false;
    
    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (i === startLine) {
            inTripPlanner = true;
            braceCount = 1; // "tripPlanner": { 에서 시작
            continue;
        }
        
        if (inTripPlanner) {
            // 중괄호 카운트
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            braceCount += openBraces - closeBraces;
            
            if (braceCount === 0 && line.endsWith('},')) {
                endLine = i;
                console.log('Found tripPlanner end at line:', i + 1);
                break;
            }
        }
    }
}

if (startLine !== null && endLine !== null) {
    console.log('Removing lines', startLine + 1, 'to', endLine + 1);
    
    // 섹션 제거
    const newLines = [...lines.slice(0, startLine), ...lines.slice(endLine + 1)];
    
    // 새 파일로 저장
    fs.writeFileSync('public/locales/translations_fixed.json', newLines.join('\n'));
    console.log('Successfully removed tripPlanner section');
    
    // JSON 유효성 검사
    try {
        const testData = JSON.parse(fs.readFileSync('public/locales/translations_fixed.json', 'utf-8'));
        console.log('✅ Fixed JSON is valid!');
        console.log('Top-level keys:', Object.keys(testData));
        
        // ko.tripPlanner 확인
        if (testData.ko && testData.ko.tripPlanner) {
            console.log('✅ ko.tripPlanner exists!');
            if (testData.ko.tripPlanner.form && testData.ko.tripPlanner.form.interestOptions) {
                console.log('✅ ko.tripPlanner.form.interestOptions exists!');
                console.log('food translation:', testData.ko.tripPlanner.form.interestOptions.food);
                console.log('culture translation:', testData.ko.tripPlanner.form.interestOptions.culture);
            }
        } else {
            console.log('❌ ko.tripPlanner still missing');
        }
        
    } catch (error) {
        console.error('❌ Fixed JSON is invalid:', error.message);
    }
} else {
    console.log('Could not find the section to remove');
    console.log('startLine:', startLine, 'endLine:', endLine);
}
