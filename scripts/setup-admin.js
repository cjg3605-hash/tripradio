/**
 * 관리자 계정 설정 스크립트
 * Node.js에서 직접 실행하거나 API를 통해 호출
 */

const { createOrUpdateAdmin } = require('../src/lib/user.ts');

async function setupAdmin() {
  console.log('🔧 관리자 계정 설정을 시작합니다...');
  
  try {
    const adminUser = await createOrUpdateAdmin();
    
    console.log('✅ 관리자 계정 설정이 완료되었습니다!');
    console.log('📧 이메일:', adminUser.email);
    console.log('👤 이름:', adminUser.name);
    console.log('🔑 비밀번호: naviadmin1134');
    console.log('🛡️ 관리자 권한:', adminUser.isAdmin ? '활성화' : '비활성화');
    console.log('🌐 대시보드 URL: http://localhost:3002/admin/dashboard');
    
    console.log('\n📝 로그인 정보:');
    console.log('   이메일: naviadmin@tripradio.shop');
    console.log('   비밀번호: naviadmin1134');
    
  } catch (error) {
    console.error('❌ 관리자 계정 설정 실패:', error.message);
    process.exit(1);
  }
}

// 직접 실행시
if (require.main === module) {
  setupAdmin();
}

module.exports = { setupAdmin };