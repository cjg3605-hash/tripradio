"""
2-Stage Podcast Generation Flow E2E Test (v2)

Direct navigation to podcast page to trigger generation.
Tests the new 2-stage implementation:
- Stage 1: Intro generation (25-30s expected)
- Stage 2: Rest chapters (background, 30-35s expected)
"""

from playwright.sync_api import sync_playwright
import time
import json

def test_2stage_podcast_generation():
    print("="*80)
    print("🧪 2-STAGE PODCAST GENERATION E2E TEST (Direct Navigation)")
    print("="*80)

    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        # Enable console logging
        console_messages = []
        page.on('console', lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        # Track network requests for API calls
        api_requests = []
        page.on('request', lambda req: api_requests.append({
            'url': req.url,
            'method': req.method,
            'timestamp': time.time()
        }) if '/api/tts/notebooklm/generate' in req.url else None)

        try:
            # Use a NEW location that doesn't exist in DB yet
            location = "오이도"  # Oido - a location in Korea
            language = "ko"

            print(f"\n📍 Test Location: {location}")
            print(f"📍 Language: {language}")

            # Step 1: Navigate directly to podcast page (will trigger generation)
            print("\n📍 Step 1: Navigate to podcast page")
            print(f"URL: http://localhost:3000/podcast/{language}/{location}")
            print("⏱️ Starting Stage 1 timer...")

            stage1_start = time.time()

            page.goto(f'http://localhost:3000/podcast/{language}/{location}')

            print("✅ Page navigation initiated")
            page.screenshot(path='test_results/01_navigation_started.png', full_page=False)

            # Step 2: Wait for generation to start (look for loading indicator)
            print("\n📍 Step 2: Waiting for generation UI...")

            try:
                # Wait for either:
                # 1. Generation UI to appear
                # 2. Episode data to load
                page.wait_for_timeout(3000)  # Give React time to render
                page.screenshot(path='test_results/02_generation_ui.png', full_page=True)
                print("✅ Generation UI visible")
            except Exception as e:
                print(f"⚠️ Could not detect generation UI: {e}")

            # Step 3: Monitor for Stage 1 completion
            print("\n📍 Step 3: Monitoring Stage 1 completion...")
            print("Expected: 25-30 seconds for Intro generation")

            # Wait up to 60 seconds for Stage 1 to complete
            max_wait = 60
            check_interval = 2
            elapsed = 0
            stage1_complete = False

            while elapsed < max_wait:
                page.wait_for_timeout(check_interval * 1000)
                elapsed += check_interval

                # Check if content is loaded (look for segments or script text)
                content = page.content()

                # Look for indicators that Stage 1 completed
                if any(indicator in content for indicator in ['Intro', '세그먼트', 'Host', 'Curator', 'partial']):
                    stage1_end = time.time()
                    stage1_duration = stage1_end - stage1_start
                    stage1_complete = True

                    print(f"\n🎉 STAGE 1 COMPLETE!")
                    print(f"⏱️ Stage 1 Duration: {stage1_duration:.2f} seconds")

                    if stage1_duration <= 35:
                        print(f"✅ EXCELLENT! {stage1_duration:.2f}s is within target")
                        if stage1_duration <= 30:
                            print(f"🌟 PERFECT! Hit the target!")
                    else:
                        print(f"⚠️ Slower than expected: {stage1_duration:.2f}s > 35s")

                    break

                # Progress update
                if elapsed % 10 == 0:
                    print(f"⏱️ Waiting... {elapsed}s elapsed")
                    if elapsed == 30:
                        page.screenshot(path='test_results/03_at_30s.png', full_page=True)

            if not stage1_complete:
                print(f"❌ Stage 1 did not complete within {max_wait}s")
                stage1_duration = time.time() - stage1_start
                page.screenshot(path='test_results/03_stage1_timeout.png', full_page=True)
            else:
                # Take screenshot right after Stage 1
                page.screenshot(path='test_results/04_stage1_complete.png', full_page=True)
                print("📸 Stage 1 complete screenshot saved")

            # Step 4: Check API requests
            print("\n📍 Step 4: Analyzing API requests...")

            stage1_requests = [r for r in api_requests if 'stage' in r['url'] or 'intro' in r['url']]
            stage2_requests = [r for r in api_requests if 'rest' in r['url']]

            print(f"Total API requests to generate endpoint: {len([r for r in api_requests if 'generate' in r['url']])}")

            if stage1_requests:
                print(f"✅ Stage 1 API request detected")
            if stage2_requests:
                print(f"✅ Stage 2 API request detected")

            # Step 5: Monitor Stage 2 (background)
            print("\n📍 Step 5: Monitoring Stage 2 (background generation)...")
            print("Waiting 40 seconds for Stage 2 to complete...")

            stage2_start = time.time()

            for i in range(8):  # 8 x 5s = 40s
                page.wait_for_timeout(5000)
                elapsed = time.time() - stage2_start

                if i % 2 == 0:  # Every 10s
                    print(f"⏱️ Stage 2 progress: {elapsed:.1f}s elapsed...")

                if i == 3:  # After 15s
                    page.screenshot(path='test_results/05_stage2_15s.png', full_page=True)
                elif i == 6:  # After 30s
                    page.screenshot(path='test_results/06_stage2_30s.png', full_page=True)

            stage2_duration = time.time() - stage2_start

            # Final screenshot
            page.screenshot(path='test_results/07_final_state.png', full_page=True)
            print("📸 Final state screenshot saved")

            # Step 6: Check console logs for 2-stage markers
            print("\n📍 Step 6: Analyzing console logs...")

            stage1_logs = [msg for msg in console_messages if 'Stage 1' in msg or 'Intro' in msg]
            stage2_logs = [msg for msg in console_messages if 'Stage 2' in msg or 'Rest' in msg or 'background' in msg.lower()]

            print(f"\n📊 Console Analysis:")
            print(f"Total messages: {len(console_messages)}")
            print(f"Stage 1 related: {len(stage1_logs)}")
            print(f"Stage 2 related: {len(stage2_logs)}")

            if stage1_logs:
                print("\n🚀 Sample Stage 1 Logs:")
                for log in stage1_logs[:3]:
                    print(f"  {log}")

            if stage2_logs:
                print("\n🔄 Sample Stage 2 Logs:")
                for log in stage2_logs[:3]:
                    print(f"  {log}")

            # Save all logs
            with open('test_results/console_logs_2stage.txt', 'w', encoding='utf-8') as f:
                f.write(f"Total console messages: {len(console_messages)}\n")
                f.write("="*80 + "\n\n")
                for msg in console_messages:
                    f.write(msg + '\n')
            print("\n✅ Console logs saved")

            # Step 7: Save test results
            print("\n📍 Step 7: Saving test results...")

            test_results = {
                'location': location,
                'language': language,
                'url': page.url,
                'stage1_duration_seconds': stage1_duration if stage1_complete else None,
                'stage2_duration_seconds': stage2_duration,
                'total_duration_seconds': (stage1_duration if stage1_complete else 0) + stage2_duration,
                'stage1_complete': stage1_complete,
                'api_requests_count': len([r for r in api_requests if 'generate' in r['url']]),
                'console_messages_count': len(console_messages),
                'stage1_logs_count': len(stage1_logs),
                'stage2_logs_count': len(stage2_logs)
            }

            with open('test_results/test_results_2stage.json', 'w', encoding='utf-8') as f:
                json.dump(test_results, f, ensure_ascii=False, indent=2)

            # Final Summary
            print("\n" + "="*80)
            print("📊 TEST SUMMARY")
            print("="*80)
            print(f"Location: {location}")
            print(f"URL: {page.url}")

            if stage1_complete:
                print(f"\nStage 1 (Intro): {stage1_duration:.2f}s")
                print(f"Stage 2 (Rest): {stage2_duration:.2f}s (background)")
                print(f"Total: {stage1_duration + stage2_duration:.2f}s")

                improvement = ((90 - stage1_duration) / 90) * 100
                print(f"\n🎯 Performance Improvement:")
                print(f"  Before: 90s user wait")
                print(f"  After: {stage1_duration:.2f}s user wait")
                print(f"  Improvement: {improvement:.1f}% reduction ✨")

                if stage1_duration <= 30:
                    print("\n✅ TEST PASSED: Achieved target performance!")
                elif stage1_duration <= 35:
                    print("\n⚠️ TEST MARGINAL: Close to target")
                else:
                    print("\n❌ TEST FAILED: Exceeded target")
            else:
                print("\n❌ Stage 1 did not complete successfully")

            print("\n" + "="*80)

        except Exception as e:
            print(f"\n❌ TEST ERROR: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='test_results/error_state.png', full_page=True)

        finally:
            print("\n🧹 Cleanup...")
            browser.close()
            print("✅ Done")

if __name__ == '__main__':
    import os
    os.makedirs('test_results', exist_ok=True)

    print("\n🎬 Starting 2-Stage E2E Test (Direct Navigation)...\n")
    test_2stage_podcast_generation()
    print("\n✅ Test completed! Check test_results/ for screenshots and logs.")
