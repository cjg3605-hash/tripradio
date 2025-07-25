const { chromium } = require('playwright');

async function testAuthentication() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔐 Starting authentication test...');
    
    // Navigate to the login page directly
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click login button
    const loginButton = await page.locator('button:has-text("로그인")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'auth-login-page.png', 
      fullPage: true 
    });
    console.log('📸 Login page screenshot saved');
    
    // Test Google login button
    console.log('📍 Step 2: Testing Google login...');
    const googleLoginButton = page.locator('button:has-text("Google")').first();
    
    if (await googleLoginButton.isVisible()) {
      console.log('✅ Found Google login button');
      
      // Click Google login - this will likely redirect to Google's OAuth
      await googleLoginButton.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot after Google login attempt
      await page.screenshot({ 
        path: 'google-login-attempt.png', 
        fullPage: true 
      });
      console.log('📸 Google login attempt screenshot saved');
      
      // Check if we're redirected to Google or get an error
      const currentUrl = page.url();
      console.log(`📍 Current URL after Google login: ${currentUrl}`);
      
      if (currentUrl.includes('accounts.google.com')) {
        console.log('✅ Successfully redirected to Google OAuth');
        // Go back to continue testing other features
        await page.goBack();
        await page.waitForLoadState('networkidle');
      } else if (currentUrl.includes('error') || currentUrl.includes('callback')) {
        console.log('⚠️ Google login returned an error or callback');
      }
    }
    
    // Test signup flow
    console.log('📍 Step 3: Testing signup flow...');
    await page.goto('http://localhost:3000/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // Click on signup link/button
    const signupLink = page.locator('button:has-text("회원가입")').first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of signup form
      await page.screenshot({ 
        path: 'signup-form.png', 
        fullPage: true 
      });
      console.log('📸 Signup form screenshot saved');
      
      // Test signup form fields
      const nameInput = page.locator('input[name="name"]').first();
      const emailInput = page.locator('input[name="email"]').first();
      const passwordInput = page.locator('input[name="password"]').first();
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]').first();
      
      if (await nameInput.isVisible()) {
        console.log('✅ Found name input field');
        await nameInput.fill('Test User');
      }
      
      if (await emailInput.isVisible()) {
        console.log('✅ Found email input field');
        await emailInput.fill('test@example.com');
      }
      
      if (await passwordInput.isVisible()) {
        console.log('✅ Found password input field');
        await passwordInput.fill('testpassword123');
      }
      
      if (await confirmPasswordInput.isVisible()) {
        console.log('✅ Found confirm password input field');
        await confirmPasswordInput.fill('testpassword123');
      }
      
      // Take screenshot with filled signup form
      await page.screenshot({ 
        path: 'signup-form-filled.png', 
        fullPage: true 
      });
      console.log('📸 Filled signup form screenshot saved');
      
      // Try to submit (this will likely require email verification)
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        console.log('✅ Found submit button');
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot after submission
        await page.screenshot({ 
          path: 'signup-submission.png', 
          fullPage: true 
        });
        console.log('📸 Signup submission screenshot saved');
        
        // Check if we get email verification step
        const verificationStep = page.locator('text=인증 코드').first();
        if (await verificationStep.isVisible()) {
          console.log('✅ Email verification step appeared');
        }
      }
    }
    
    // Test responsive design (mobile view)
    console.log('📍 Step 4: Testing mobile responsive...');
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone size
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'mobile-homepage.png', 
      fullPage: true 
    });
    console.log('📸 Mobile homepage screenshot saved');
    
    // Test mobile login
    const mobileLoginButton = page.locator('button:has-text("로그인")').first();
    if (await mobileLoginButton.isVisible()) {
      await mobileLoginButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'mobile-login-page.png', 
        fullPage: true 
      });
      console.log('📸 Mobile login page screenshot saved');
    }
    
    console.log('✅ Authentication test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during authentication testing:', error);
    await page.screenshot({ 
      path: 'auth-error-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Authentication error screenshot saved');
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testAuthentication().catch(console.error);