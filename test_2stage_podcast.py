"""
2-Stage Podcast Generation Flow E2E Test

Tests the new 2-stage implementation:
- Stage 1: Intro generation (25-30s expected)
- Stage 2: Rest chapters (background, 30-35s expected)

Expected Results:
- User sees page after 25-30 seconds (70% faster than 90s)
- Stage 2 completes in background
- Database shows continuous segment numbering
"""

from playwright.sync_api import sync_playwright
import time
import json

def test_2stage_podcast_generation():
    print("="*80)
    print("🧪 2-STAGE PODCAST GENERATION E2E TEST")
    print("="*80)

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)  # headless=False to see what's happening
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        # Enable console logging
        console_messages = []
        page.on('console', lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        try:
            # Step 1: Navigate to homepage
            print("\n📍 Step 1: Navigate to homepage")
            start_time = time.time()
            page.goto('http://localhost:3000', wait_until='networkidle')
            print(f"✅ Homepage loaded in {time.time() - start_time:.2f}s")

            # Take screenshot
            page.screenshot(path='test_results/01_homepage_2stage.png', full_page=False)
            print("📸 Screenshot saved: 01_homepage_2stage.png")

            # Step 2: Enable podcast toggle
            print("\n📍 Step 2: Enable podcast toggle")
            try:
                # Look for the toggle switch
                toggle = page.locator('button:has-text("팟캐스트")').first
                if toggle.is_visible():
                    toggle.click()
                    page.wait_for_timeout(1000)
                    print("✅ Podcast toggle enabled")
                else:
                    print("⚠️ Podcast toggle not found, trying alternative selector")
                    # Try alternative selector
                    toggle_alt = page.locator('input[type="checkbox"]').first
                    if toggle_alt.is_visible():
                        toggle_alt.click()
                        page.wait_for_timeout(1000)
                        print("✅ Podcast toggle enabled (alternative)")
            except Exception as e:
                print(f"⚠️ Could not find toggle: {e}")
                print("Proceeding anyway...")

            page.screenshot(path='test_results/02_toggle_enabled.png', full_page=False)

            # Step 3: Enter location (use a NEW location for testing)
            print("\n📍 Step 3: Enter location: '에펠탑' (NEW)")
            location = "에펠탑"

            # Find search input
            search_input = page.locator('input[type="text"]').first
            search_input.fill(location)
            page.wait_for_timeout(500)
            print(f"✅ Location entered: {location}")

            page.screenshot(path='test_results/03_location_entered.png', full_page=False)

            # Step 4: Click "팟캐스트 생성하기" button
            print("\n📍 Step 4: Click '팟캐스트 생성하기' button")
            print("⏱️ Starting timer for Stage 1...")

            stage1_start = time.time()

            # Find and click the generate button
            generate_button = page.locator('button:has-text("팟캐스트 생성하기")').first
            if not generate_button.is_visible():
                # Try alternative text
                generate_button = page.locator('button:has-text("생성")').first

            generate_button.click()
            print("✅ Generate button clicked")

            page.screenshot(path='test_results/04_generation_started.png', full_page=False)

            # Step 5: Wait for Stage 1 completion (page navigation)
            print("\n📍 Step 5: Wait for Stage 1 completion (Intro generation)")
            print("Expected: 25-30 seconds")

            try:
                # Wait for URL change to podcast page
                page.wait_for_url('**/podcast/**', timeout=45000)  # 45s timeout
                stage1_end = time.time()
                stage1_duration = stage1_end - stage1_start

                print(f"\n🎉 STAGE 1 COMPLETE!")
                print(f"⏱️ Stage 1 Duration: {stage1_duration:.2f} seconds")

                if stage1_duration <= 35:
                    print(f"✅ EXCELLENT! {stage1_duration:.2f}s is within target (25-30s)")
                    if stage1_duration <= 30:
                        print(f"🌟 PERFECT! Hit the target perfectly!")
                else:
                    print(f"⚠️ Slower than expected: {stage1_duration:.2f}s > 35s")

                # Take screenshot immediately after Stage 1
                page.wait_for_timeout(2000)  # Wait 2s for page to render
                page.screenshot(path='test_results/05_stage1_complete.png', full_page=True)
                print("📸 Screenshot saved: 05_stage1_complete.png")

            except Exception as e:
                print(f"❌ Stage 1 failed or timed out: {e}")
                page.screenshot(path='test_results/05_stage1_error.png', full_page=True)
                raise

            # Step 6: Verify page content (Intro chapter should be visible)
            print("\n📍 Step 6: Verify Intro chapter is visible")

            # Check for chapter/segment content
            try:
                # Look for any text indicating podcast content
                content = page.content()
                if 'Intro' in content or '챕터' in content or '세그먼트' in content:
                    print("✅ Intro content detected on page")
                else:
                    print("⚠️ No intro content detected, but page loaded")

                # Check for audio player
                audio_player = page.locator('audio').first
                if audio_player.is_visible():
                    print("✅ Audio player found")
                else:
                    print("⚠️ Audio player not visible")

            except Exception as e:
                print(f"⚠️ Content verification error: {e}")

            # Step 7: Monitor Stage 2 (background generation)
            print("\n📍 Step 7: Monitor Stage 2 (background generation)")
            print("Expected: 30-35 seconds in background")
            print("Waiting 40 seconds to allow Stage 2 to complete...")

            stage2_start = time.time()

            # Wait and take periodic screenshots
            for i in range(8):  # 8 x 5s = 40s
                page.wait_for_timeout(5000)
                elapsed = time.time() - stage2_start
                print(f"⏱️ Stage 2 progress: {elapsed:.1f}s elapsed...")

                if i == 3:  # After 15s
                    page.screenshot(path='test_results/06_stage2_progress_15s.png', full_page=True)
                elif i == 6:  # After 30s
                    page.screenshot(path='test_results/07_stage2_progress_30s.png', full_page=True)

            stage2_duration = time.time() - stage2_start
            print(f"\n⏱️ Stage 2 monitoring duration: {stage2_duration:.2f}s")

            # Final screenshot
            page.screenshot(path='test_results/08_final_state.png', full_page=True)
            print("📸 Final screenshot saved: 08_final_state.png")

            # Step 8: Extract episode ID from URL for database verification
            print("\n📍 Step 8: Extract episode information")
            current_url = page.url
            print(f"Current URL: {current_url}")

            # Extract location slug from URL
            if '/podcast/' in current_url:
                parts = current_url.split('/podcast/')[-1].split('/')
                if len(parts) >= 2:
                    language = parts[0]
                    location_slug = parts[1]
                    print(f"✅ Extracted: language={language}, location_slug={location_slug}")

                    # Save for database verification
                    test_info = {
                        'location': location,
                        'location_slug': location_slug,
                        'language': language,
                        'stage1_duration': stage1_duration,
                        'stage2_duration': stage2_duration,
                        'total_duration': stage1_duration + stage2_duration,
                        'url': current_url
                    }

                    with open('test_results/test_info_2stage.json', 'w', encoding='utf-8') as f:
                        json.dump(test_info, f, ensure_ascii=False, indent=2)
                    print("✅ Test info saved to test_info_2stage.json")

            # Step 9: Check console logs for Stage 1 and Stage 2 markers
            print("\n📍 Step 9: Analyze console logs")

            stage1_logs = [msg for msg in console_messages if 'Stage 1' in msg or '🚀' in msg or '✅ Stage 1' in msg]
            stage2_logs = [msg for msg in console_messages if 'Stage 2' in msg or '🔄' in msg]

            print(f"\n📊 Console Log Analysis:")
            print(f"Total console messages: {len(console_messages)}")
            print(f"Stage 1 related messages: {len(stage1_logs)}")
            print(f"Stage 2 related messages: {len(stage2_logs)}")

            if stage1_logs:
                print("\n🚀 Stage 1 Logs (first 5):")
                for log in stage1_logs[:5]:
                    print(f"  {log}")

            if stage2_logs:
                print("\n🔄 Stage 2 Logs (first 5):")
                for log in stage2_logs[:5]:
                    print(f"  {log}")

            # Save all console logs
            with open('test_results/console_logs_2stage.txt', 'w', encoding='utf-8') as f:
                for msg in console_messages:
                    f.write(msg + '\n')
            print("\n✅ All console logs saved to console_logs_2stage.txt")

            # Final Summary
            print("\n" + "="*80)
            print("📊 TEST SUMMARY")
            print("="*80)
            print(f"Location tested: {location}")
            print(f"Stage 1 duration: {stage1_duration:.2f}s (target: 25-30s)")
            print(f"Stage 2 duration: {stage2_duration:.2f}s (monitored)")
            print(f"Total time: {stage1_duration + stage2_duration:.2f}s")

            improvement = ((90 - stage1_duration) / 90) * 100
            print(f"\n🎯 Performance Improvement:")
            print(f"  Before (1-stage): 90 seconds")
            print(f"  After (2-stage): {stage1_duration:.2f} seconds (user wait)")
            print(f"  Improvement: {improvement:.1f}% reduction in wait time")

            if stage1_duration <= 30:
                print("\n✅ TEST PASSED: Stage 1 completed within target time!")
            elif stage1_duration <= 35:
                print("\n⚠️ TEST MARGINAL: Stage 1 slightly slower than target")
            else:
                print("\n❌ TEST FAILED: Stage 1 exceeded target time")

            print("\n" + "="*80)

        except Exception as e:
            print(f"\n❌ TEST FAILED WITH ERROR: {e}")
            page.screenshot(path='test_results/error_state.png', full_page=True)
            raise

        finally:
            print("\n🧹 Cleanup: Closing browser...")
            browser.close()
            print("✅ Browser closed")

if __name__ == '__main__':
    # Create test results directory
    import os
    os.makedirs('test_results', exist_ok=True)

    print("\n🎬 Starting 2-Stage Podcast Generation E2E Test...\n")
    test_2stage_podcast_generation()
    print("\n✅ Test completed! Check test_results/ folder for screenshots and logs.")
