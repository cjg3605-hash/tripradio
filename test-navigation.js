const { chromium } = require('playwright');

async function testNavigation() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting navigation test...');
    
    // Navigate to the homepage
    console.log('📍 Step 1: Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'homepage-initial.png', 
      fullPage: true 
    });
    console.log('📸 Homepage screenshot saved as homepage-initial.png');
    
    // Look for the login button (로그인)
    console.log('📍 Step 2: Looking for login button...');
    
    // Try to find login button in header - both desktop and mobile versions
    const loginSelectors = [
      'button:has-text("로그인")',
      'text=로그인',
      '[href*="signin"]',
      'a:has-text("로그인")'
    ];
    
    let loginButton = null;
    for (const selector of loginSelectors) {
      try {
        loginButton = await page.locator(selector).first();
        if (await loginButton.isVisible()) {
          console.log(`✅ Found login button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Selector "${selector}" not found or not visible`);
      }
    }
    
    if (!loginButton || !(await loginButton.isVisible())) {
      console.log('⚠️ Login button not found in header. Checking if user is already logged in...');
      
      // Check for profile dropdown (user is already logged in)
      const profileSelectors = [
        'button:has(svg.lucide-user)',
        '[data-testid="profile-button"]',
        'button:has-text("마이페이지")',
        'button:has([alt="프로필"])'
      ];
      
      let profileButton = null;
      for (const selector of profileSelectors) {
        try {
          profileButton = await page.locator(selector).first();
          if (await profileButton.isVisible()) {
            console.log(`✅ Found profile button (user already logged in): ${selector}`);
            
            // Test the profile dropdown
            console.log('📍 Step 3: Testing profile dropdown...');
            await profileButton.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot of dropdown
            await page.screenshot({ 
              path: 'profile-dropdown.png', 
              fullPage: true 
            });
            console.log('📸 Profile dropdown screenshot saved as profile-dropdown.png');
            
            // Look for 마이페이지 option
            const mypageOption = page.locator('text=마이페이지').first();
            if (await mypageOption.isVisible()) {
              console.log('✅ Found 마이페이지 option in dropdown');
              
              // Click on 마이페이지
              await mypageOption.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(2000);
              
              // Take screenshot of mypage
              await page.screenshot({ 
                path: 'mypage-screenshot.png', 
                fullPage: true 
              });
              console.log('📸 MyPage screenshot saved as mypage-screenshot.png');
              console.log('✅ Successfully navigated to MyPage');
              
              // Go back to homepage to test logout
              await page.goto('http://localhost:3000');
              await page.waitForLoadState('networkidle');
              
              // Test logout
              const profileBtn = await page.locator('button:has(svg.lucide-user)').first();
              if (await profileBtn.isVisible()) {
                await profileBtn.click();
                await page.waitForTimeout(1000);
                
                const logoutOption = page.locator('text=로그아웃').first();
                if (await logoutOption.isVisible()) {
                  console.log('✅ Found 로그아웃 option in dropdown');
                  await page.screenshot({ 
                    path: 'logout-dropdown.png', 
                    fullPage: true 
                  });
                  console.log('📸 Logout dropdown screenshot saved as logout-dropdown.png');
                  
                  await logoutOption.click();
                  await page.waitForLoadState('networkidle');
                  await page.waitForTimeout(2000);
                  
                  console.log('✅ Successfully clicked logout');
                }
              }
            }
            
            // Look for 로그아웃 option
            const logoutOption = page.locator('text=로그아웃').first();
            if (await logoutOption.isVisible()) {
              console.log('✅ Found 로그아웃 option in dropdown');
            }
            
            return;
          }
        } catch (e) {
          console.log(`❌ Profile selector "${selector}" not found`);
        }
      }
      
      console.log('⚠️ Neither login button nor profile button found. Taking final screenshot...');
      await page.screenshot({ 
        path: 'final-state.png', 
        fullPage: true 
      });
      return;
    }
    
    // Click the login button
    console.log('📍 Step 3: Clicking login button...');
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'login-page.png', 
      fullPage: true 
    });
    console.log('📸 Login page screenshot saved as login-page.png');
    
    // Analyze login options
    console.log('📍 Step 4: Analyzing login options...');
    
    // Check for Google login button
    const googleLogin = page.locator('text=Google').first();
    if (await googleLogin.isVisible()) {
      console.log('✅ Found Google login option');
    }
    
    // Check for email/password form
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      console.log('✅ Found email/password login form');
      
      // Try to simulate login (with test data if available)
      console.log('📍 Step 5: Testing login form...');
      
      // Fill in test credentials (these likely won't work but we can test the form)
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword');
      
      // Take screenshot with filled form
      await page.screenshot({ 
        path: 'login-form-filled.png',
        fullPage: true 
      });
      console.log('📸 Login form filled screenshot saved as login-form-filled.png');
    }
    
    // Check for signup option
    const signupButton = page.locator('text=회원가입').first();
    if (await signupButton.isVisible()) {
      console.log('✅ Found signup option');
    }
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ 
      path: 'error-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot saved as error-screenshot.png');
  } finally {
    await page.waitForTimeout(3000); // Keep browser open for observation
    await browser.close();
  }
}

testNavigation().catch(console.error);