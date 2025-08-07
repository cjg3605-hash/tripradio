const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test script to understand Gemini 2.5 Flash response format
async function debugGeminiResponse() {
  console.log('🔍 Debugging Gemini 2.5 Flash JSON parsing issues...');
  
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 300,
      topP: 0.9,
      topK: 20
    }
  });

  // Test with the exact same prompt format as the API
  const testPrompts = [
    `'Seoul' 관련 관광지 3개 추천. JSON만: [{"name": "장소명", "location": "도시, 국가", "metadata": {"isOfficial": true, "category": "관광지", "popularity": 8}}]`,
    `Suggest 3 places for 'Tokyo'. JSON only: [{"name": "place name", "location": "city, country", "metadata": {"isOfficial": true, "category": "tourist", "popularity": 8}}]`,
    `STRICT JSON ONLY. No explanation. Return exactly this format: [{"name": "place name", "location": "city, country", "metadata": {"isOfficial": true, "category": "tourist", "popularity": 8}}] for 'Paris' tourism`
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n📤 Test ${i + 1} Prompt:`, prompt);
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      
      console.log(`📥 Raw Response (${text.length} chars):`);
      console.log('═'.repeat(80));
      console.log(text);
      console.log('═'.repeat(80));
      
      // Test current parsing logic
      console.log('\n🔧 Testing current parsing logic...');
      
      let jsonString = text.trim();
      
      // Try to extract JSON array (current logic)
      const arrayMatch = text.match(/\[(.*?)\]/s);
      if (arrayMatch) {
        console.log('✅ Array regex match found');
        jsonString = arrayMatch[0];
      } else {
        console.log('❌ Array regex match failed');
      }
      
      console.log(`📦 Extracted JSON string (${jsonString.length} chars):`);
      console.log('─'.repeat(40));
      console.log(jsonString);
      console.log('─'.repeat(40));
      
      try {
        const parsed = JSON.parse(jsonString);
        console.log('✅ JSON parsing SUCCESS');
        console.log('📊 Parsed data:', JSON.stringify(parsed, null, 2));
        
        if (Array.isArray(parsed)) {
          const suggestions = parsed.filter(item => item.name && item.location).slice(0, 5);
          console.log(`✅ Valid suggestions: ${suggestions.length}`);
        } else {
          console.log('❌ Not an array');
        }
      } catch (parseError) {
        console.log('❌ JSON parsing FAILED:', parseError.message);
        
        // Try enhanced parsing strategies
        console.log('\n🚀 Trying enhanced parsing strategies...');
        
        // Strategy 1: Remove markdown code blocks
        let enhanced1 = text.trim()
          .replace(/```json\s*/, '')
          .replace(/```\s*$/, '')
          .replace(/```\s*/, '');
        
        console.log('Strategy 1 - Remove markdown:', enhanced1.substring(0, 100) + '...');
        
        try {
          const parsed1 = JSON.parse(enhanced1);
          console.log('✅ Strategy 1 SUCCESS');
        } catch (e) {
          console.log('❌ Strategy 1 failed:', e.message);
        }
        
        // Strategy 2: Find JSON object/array bounds
        const jsonStart = Math.max(text.indexOf('['), text.indexOf('{'));
        const jsonEndBracket = text.lastIndexOf(']');
        const jsonEndBrace = text.lastIndexOf('}');
        const jsonEnd = Math.max(jsonEndBracket, jsonEndBrace);
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const enhanced2 = text.substring(jsonStart, jsonEnd + 1);
          console.log('Strategy 2 - Find bounds:', enhanced2.substring(0, 100) + '...');
          
          try {
            const parsed2 = JSON.parse(enhanced2);
            console.log('✅ Strategy 2 SUCCESS');
          } catch (e) {
            console.log('❌ Strategy 2 failed:', e.message);
          }
        }
        
        // Strategy 3: Multiple JSON cleaning attempts
        const cleaningStrategies = [
          // Remove leading/trailing non-JSON text
          text => text.replace(/^[^[\{]*/, '').replace(/[^\]\}]*$/, ''),
          // Remove explanatory text
          text => text.replace(/Here are the suggestions?:?\s*/i, '').replace(/These are the places?:?\s*/i, ''),
          // Remove newlines and extra spaces
          text => text.replace(/\n/g, ' ').replace(/\s+/g, ' '),
          // Fix common JSON issues
          text => text.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
        ];
        
        for (let j = 0; j < cleaningStrategies.length; j++) {
          try {
            const cleaned = cleaningStrategies[j](text.trim());
            const parsed3 = JSON.parse(cleaned);
            console.log(`✅ Strategy 3.${j + 1} SUCCESS`);
            break;
          } catch (e) {
            console.log(`❌ Strategy 3.${j + 1} failed:`, e.message);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ API call failed for test ${i + 1}:`, error.message);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Debugging complete. Check the outputs above to understand the parsing issues.');
}

// Run the debug script
debugGeminiResponse().catch(error => {
  console.error('💥 Debug script failed:', error);
  process.exit(1);
});