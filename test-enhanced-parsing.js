// Comprehensive test suite for enhanced Gemini 2.5 Flash JSON parsing
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import the enhanced parsing functions (simulate them for testing)
function extractJsonFromGeminiResponse(rawResponse) {
  // Strategy 1: Remove common Gemini response patterns
  let cleaned = rawResponse.trim()
    // Remove markdown code blocks
    .replace(/```json\s*/gi, '')
    .replace(/```\s*$/g, '')
    .replace(/```[\s\S]*?```/g, '')
    // Remove common explanation patterns
    .replace(/^[\s\S]*?(?=\[|\{)/i, '') // Remove text before first JSON
    .replace(/(?<=\]|\})[\s\S]*$/i, '') // Remove text after last JSON
    // Remove common Gemini prefixes
    .replace(/^(Here are the suggestions?:?|These are the places?:?|Suggestions?:?)\s*/gi, '')
    .replace(/^(다음은 추천 장소들입니다|추천 관광지|제안사항)\s*:?\s*/gi, '')
    // Remove newlines within JSON structure (but preserve in strings)
    .replace(/\n(?=\s*[\"}\],])/g, ' ')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Strategy 2: Find JSON array bounds with bracket matching
  const arrayStart = cleaned.indexOf('[');
  if (arrayStart >= 0) {
    let bracketCount = 0;
    let arrayEnd = -1;
    let inString = false;
    let escapeNext = false;
    
    for (let i = arrayStart; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '[') bracketCount++;
        else if (char === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            arrayEnd = i;
            break;
          }
        }
      }
    }
    
    if (arrayEnd > arrayStart) {
      cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
    }
  }

  // Strategy 3: Handle object array (if somehow an object was returned)
  const objectStart = cleaned.indexOf('{');
  if (objectStart >= 0 && arrayStart < 0) {
    // Wrap single object in array
    let braceCount = 0;
    let objectEnd = -1;
    let inString = false;
    let escapeNext = false;
    
    for (let i = objectStart; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            objectEnd = i;
            break;
          }
        }
      }
    }
    
    if (objectEnd > objectStart) {
      const singleObject = cleaned.substring(objectStart, objectEnd + 1);
      cleaned = `[${singleObject}]`; // Wrap in array
    }
  }

  // Strategy 4: Fix common JSON syntax issues
  cleaned = cleaned
    // Fix trailing commas
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    // Fix unescaped quotes in strings (basic attempt)
    .replace(/"([^"]*?)"([^":,\]\}\s])([^"]*?)"/g, '"$1\\"$2$3"')
    // Ensure proper string quoting for keys
    .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
    .trim();

  // Validate that we have something that looks like JSON
  if (!cleaned || (!cleaned.startsWith('[') && !cleaned.startsWith('{'))) {
    return null;
  }

  return cleaned;
}

function validateAndSanitizeSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) {
    return [];
  }

  return suggestions
    .filter(item => {
      return item && 
        typeof item === 'object' && 
        typeof item.name === 'string' && 
        typeof item.location === 'string' &&
        item.name.trim().length > 0 &&
        item.location.trim().length > 0;
    })
    .map(item => {
      return {
        name: String(item.name).trim(),
        location: String(item.location).trim(),
        metadata: {
          isOfficial: Boolean(item.metadata?.isOfficial ?? true),
          category: String(item.metadata?.category || 'tourist'),
          popularity: Math.max(1, Math.min(10, Number(item.metadata?.popularity) || 8))
        }
      };
    })
    .slice(0, 5);
}

// Test cases simulating various Gemini response formats
const testCases = [
  {
    name: "Perfect JSON Array",
    response: `[{"name": "Eiffel Tower", "location": "Paris, France", "metadata": {"isOfficial": true, "category": "landmark", "popularity": 9}}, {"name": "Louvre Museum", "location": "Paris, France", "metadata": {"isOfficial": true, "category": "museum", "popularity": 8}}]`,
    expectedCount: 2
  },
  {
    name: "JSON with Markdown Code Blocks",
    response: `Here are some suggestions for Paris:

\`\`\`json
[{"name": "Notre Dame", "location": "Paris, France", "metadata": {"isOfficial": true, "category": "cathedral", "popularity": 8}}, {"name": "Arc de Triomphe", "location": "Paris, France", "metadata": {"isOfficial": true, "category": "monument", "popularity": 7}}]
\`\`\`

These are all wonderful places to visit!`,
    expectedCount: 2
  },
  {
    name: "JSON with Explanatory Text",
    response: `Based on your query about Tokyo, here are my top recommendations:

[{"name": "Tokyo Tower", "location": "Tokyo, Japan", "metadata": {"isOfficial": true, "category": "tower", "popularity": 8}}, {"name": "Shibuya Crossing", "location": "Tokyo, Japan", "metadata": {"isOfficial": true, "category": "landmark", "popularity": 9}}]

I hope you find these suggestions helpful for your trip planning!`,
    expectedCount: 2
  },
  {
    name: "Single Object (should be wrapped in array)",
    response: `{"name": "Mount Fuji", "location": "Japan", "metadata": {"isOfficial": true, "category": "mountain", "popularity": 10}}`,
    expectedCount: 1
  },
  {
    name: "JSON with Trailing Comma",
    response: `[{"name": "Kyoto", "location": "Japan", "metadata": {"isOfficial": true, "category": "city", "popularity": 9}}, {"name": "Osaka", "location": "Japan", "metadata": {"isOfficial": true, "category": "city", "popularity": 8}},]`,
    expectedCount: 2
  },
  {
    name: "Malformed JSON with Mixed Content",
    response: `Here are some places in Seoul:
    
1. Gyeongbokgung Palace - A historic royal palace
2. Myeongdong - Shopping district  
3. Hongdae - Entertainment area

[{"name": "Gangnam", "location": "Seoul, South Korea", "metadata": {"isOfficial": true, "category": "district", "popularity": 7}}]

Additional suggestions available upon request.`,
    expectedCount: 1
  },
  {
    name: "Complete Failure Case (No JSON)",
    response: `I'm sorry, but I cannot provide specific tourist recommendations for that location. Please try a different search query.`,
    expectedCount: 0
  },
  {
    name: "Korean Response with JSON",
    response: `다음은 서울 추천 관광지입니다:

[{"name": "경복궁", "location": "서울, 대한민국", "metadata": {"isOfficial": true, "category": "궁궐", "popularity": 9}}, {"name": "남산타워", "location": "서울, 대한민국", "metadata": {"isOfficial": true, "category": "전망대", "popularity": 8}}]

좋은 여행 되세요!`,
    expectedCount: 2
  }
];

async function runComprehensiveTests() {
  console.log('🧪 Starting Comprehensive Enhanced JSON Parsing Tests');
  console.log('=' * 80);
  
  let totalTests = testCases.length;
  let passedTests = 0;
  let failedTests = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 Test ${i + 1}: ${testCase.name}`);
    console.log(`📄 Input length: ${testCase.response.length} characters`);
    
    try {
      // Step 1: Extract JSON
      const extractedJson = extractJsonFromGeminiResponse(testCase.response);
      
      if (testCase.expectedCount === 0) {
        // Expect failure
        if (extractedJson === null) {
          console.log('✅ Expected failure - correctly identified no valid JSON');
          passedTests++;
          continue;
        } else {
          console.log('❌ Expected failure but found JSON:', extractedJson);
          failedTests.push({ test: testCase.name, reason: 'Expected no JSON but found some' });
          continue;
        }
      }
      
      if (!extractedJson) {
        console.log('❌ JSON extraction failed');
        failedTests.push({ test: testCase.name, reason: 'JSON extraction failed' });
        continue;
      }
      
      console.log(`🔍 Extracted JSON (${extractedJson.length} chars):`, extractedJson.substring(0, 100) + '...');
      
      // Step 2: Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(extractedJson);
      } catch (parseError) {
        console.log('❌ JSON parsing failed:', parseError.message);
        failedTests.push({ test: testCase.name, reason: `JSON parsing failed: ${parseError.message}` });
        continue;
      }
      
      // Step 3: Validate and sanitize
      const suggestions = validateAndSanitizeSuggestions(parsed);
      
      console.log(`📊 Result: ${suggestions.length} valid suggestions`);
      
      if (suggestions.length === testCase.expectedCount) {
        console.log('✅ Test PASSED');
        passedTests++;
      } else {
        console.log(`❌ Test FAILED - Expected ${testCase.expectedCount}, got ${suggestions.length}`);
        failedTests.push({ 
          test: testCase.name, 
          reason: `Count mismatch: expected ${testCase.expectedCount}, got ${suggestions.length}` 
        });
      }
      
      // Show parsed suggestions
      if (suggestions.length > 0) {
        suggestions.forEach((suggestion, idx) => {
          console.log(`   ${idx + 1}. ${suggestion.name} (${suggestion.location}) - ${suggestion.metadata.category}`);
        });
      }
      
    } catch (error) {
      console.log('💥 Test crashed:', error.message);
      failedTests.push({ test: testCase.name, reason: `Crashed: ${error.message}` });
    }
  }
  
  // Summary
  console.log('\n' + '=' * 80);
  console.log('📈 TEST SUMMARY');
  console.log('=' * 80);
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failedTests.length}/${totalTests}`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach((failure, idx) => {
      console.log(`   ${idx + 1}. ${failure.test}: ${failure.reason}`);
    });
  } else {
    console.log('\n🎉 ALL TESTS PASSED! Enhanced parsing is working correctly.');
  }
  
  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: passedTests / totalTests
  };
}

// Test the enhanced prompt format
function testEnhancedPrompts() {
  console.log('\n🎯 Testing Enhanced Prompt Formats');
  console.log('=' * 50);
  
  const enhancedPrompts = {
    ko: `❗ CRITICAL: 오직 유효한 JSON 배열만 응답하세요. 설명, 마크다운, 추가 텍스트 절대 금지.

'Tokyo' 관련 관광지 3개 추천:

RESPONSE FORMAT (EXACT):
[{"name": "장소명", "location": "도시, 국가", "metadata": {"isOfficial": true, "category": "관광지", "popularity": 8}}, {"name": "장소명2", "location": "도시2, 국가", "metadata": {"isOfficial": true, "category": "관광지", "popularity": 7}}, {"name": "장소명3", "location": "도시3, 국가", "metadata": {"isOfficial": true, "category": "관광지", "popularity": 6}}]

🚨 JSON 배열만 출력. 다른 텍스트, 설명, 코드 블록 없이 순수 JSON만.`,

    en: `❗ CRITICAL: Return ONLY valid JSON array. No explanations, markdown, or additional text.

Suggest 3 places for 'Seoul':

RESPONSE FORMAT (EXACT):
[{"name": "place name", "location": "city, country", "metadata": {"isOfficial": true, "category": "tourist", "popularity": 8}}, {"name": "place name 2", "location": "city 2, country", "metadata": {"isOfficial": true, "category": "tourist", "popularity": 7}}, {"name": "place name 3", "location": "city 3, country", "metadata": {"isOfficial": true, "category": "tourist", "popularity": 6}}]

🚨 JSON array only. No other text, explanations, or code blocks.`
  };
  
  Object.entries(enhancedPrompts).forEach(([lang, prompt]) => {
    console.log(`\n📝 ${lang.toUpperCase()} Enhanced Prompt (${prompt.length} chars):`);
    console.log('─' * 40);
    console.log(prompt.substring(0, 200) + '...');
    console.log('─' * 40);
    
    // Check for critical elements
    const hasStrictInstruction = prompt.includes('CRITICAL') || prompt.includes('절대');
    const hasFormatExample = prompt.includes('RESPONSE FORMAT');
    const hasProhibitions = prompt.includes('No other text') || prompt.includes('다른 텍스트');
    const hasEmoji = prompt.includes('🚨');
    
    console.log('✅ Prompt Analysis:');
    console.log(`   - Strict instruction: ${hasStrictInstruction ? '✅' : '❌'}`);
    console.log(`   - Format example: ${hasFormatExample ? '✅' : '❌'}`);
    console.log(`   - Clear prohibitions: ${hasProhibitions ? '✅' : '❌'}`);
    console.log(`   - Visual emphasis: ${hasEmoji ? '✅' : '❌'}`);
  });
}

// Run all tests
async function main() {
  console.log('🔧 Enhanced Gemini 2.5 Flash JSON Parsing Validation Suite');
  console.log('This suite tests the improved parsing logic without making API calls.\n');
  
  // Test enhanced prompts
  testEnhancedPrompts();
  
  // Test parsing logic
  const results = await runComprehensiveTests();
  
  console.log('\n🎯 FINAL ASSESSMENT:');
  if (results.successRate >= 0.8) {
    console.log('✅ Enhanced parsing system is READY for production');
    console.log('   - Robust JSON extraction with multiple strategies');
    console.log('   - Comprehensive response preprocessing');
    console.log('   - Strong fallback mechanisms');
    console.log('   - Enhanced prompt engineering');
  } else {
    console.log('⚠️ Enhanced parsing system needs MORE WORK');
    console.log(`   - Success rate: ${(results.successRate * 100).toFixed(1)}% (target: 80%+)`);
    console.log('   - Review failed test cases and improve logic');
  }
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runComprehensiveTests,
  testEnhancedPrompts,
  extractJsonFromGeminiResponse,
  validateAndSanitizeSuggestions
};