// AI Workflow Testing Script
const { DataIntegrationOrchestrator } = require('./src/lib/data-sources/orchestrator/data-orchestrator.ts');

async function testWorkflow() {
  console.log('🔍 Testing AI Workflow End-to-End...\n');
  
  try {
    // 1. Test Data Source Integration
    console.log('1️⃣ Testing Data Source Integration...');
    const orchestrator = DataIntegrationOrchestrator.getInstance();
    
    const testLocation = '경복궁';
    console.log(`   Testing location: ${testLocation}`);
    
    const dataResult = await orchestrator.integrateLocationData(
      testLocation,
      undefined,
      {
        dataSources: ['unesco', 'wikidata', 'government', 'google_places'],
        includeReviews: true,
        includeImages: true,
        language: 'ko'
      }
    );
    
    console.log('   Data Integration Result:');
    console.log(`   - Success: ${dataResult.success}`);
    console.log(`   - Sources: ${dataResult.sources?.join(', ') || 'None'}`);
    console.log(`   - Errors: ${dataResult.errors?.length || 0}`);
    
    if (dataResult.data) {
      console.log(`   - Confidence: ${dataResult.data.confidence}`);
      console.log(`   - Location: ${dataResult.data.location?.name || 'Unknown'}`);
      console.log(`   - Basic Info: ${dataResult.data.basicInfo?.description ? 'Available' : 'Missing'}`);
    }
    
    // 2. Test Fact Verification 
    console.log('\n2️⃣ Testing Fact Verification...');
    
    const mockAIResponse = {
      overview: "경복궁은 1395년에 건립된 조선왕조의 대표적인 궁궐입니다.",
      detailedStops: [
        {
          name: "근정전",
          coordinates: { lat: 37.5796, lng: 126.9770 },
          content: "조선시대 정전으로 사용된 중요한 건물입니다."
        }
      ]
    };
    
    // Import verification function
    const { verifyWithExternalData } = require('./src/lib/ai/validation/accuracy-validator.ts');
    
    const verificationResult = verifyWithExternalData(
      mockAIResponse,
      testLocation,
      dataResult.data
    );
    
    console.log('   Verification Result:');
    console.log(`   - Fact Verified: ${verificationResult.isFactVerified}`);
    console.log(`   - Confidence Score: ${verificationResult.confidenceScore}`);
    console.log(`   - Data Sources: ${verificationResult.dataSourceCount}`);
    console.log(`   - Method: ${verificationResult.verificationMethod}`);
    console.log(`   - Conflicts: ${verificationResult.conflicts.length > 0 ? verificationResult.conflicts.join(', ') : 'None'}`);
    
    // 3. Test Health Check
    console.log('\n3️⃣ Testing Service Health...');
    const healthStatus = await orchestrator.healthCheck();
    
    console.log('   Service Health Status:');
    Object.entries(healthStatus).forEach(([service, healthy]) => {
      console.log(`   - ${service}: ${healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    });
    
    // 4. Test Performance Metrics
    console.log('\n4️⃣ Performance Metrics...');
    const metrics = orchestrator.getMetrics();
    
    console.log('   Performance Metrics:');
    console.log(`   - Response Time: ${metrics.responseTime}ms`);
    console.log(`   - Throughput: ${metrics.throughput.toFixed(2)} req/s`);
    console.log(`   - Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
    console.log(`   - Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`   - Data Quality: ${(metrics.dataQuality * 100).toFixed(1)}%`);
    console.log(`   - Uptime: ${metrics.uptime.toFixed(1)}%`);
    
    console.log('\n✅ Workflow test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Workflow test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testWorkflow().then(() => {
  console.log('\n🎯 Test execution finished.');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});