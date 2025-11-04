"""
2-Stage Podcast Generation - Real Test with NEW Location
Uses a location that definitely doesn't exist in DB yet
"""

from playwright.sync_api import sync_playwright
import time
import json
import random

def test_2stage_new_location():
    print("="*80)
    print("🧪 2-STAGE PODCAST - NEW LOCATION TEST")
    print("="*80)

    # Generate a unique location that definitely won't exist
    timestamp = int(time.time())
    location = f"테스트장소{timestamp}"  # Unique test location
    language = "ko"

    print(f"\n📍 Test Location: {location}")
    print(f"This is a UNIQUE location that doesn't exist in DB")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # Track console logs
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        try:
            print(f"\n⏱️ STARTING STAGE 1 TIMER...")
            stage1_start = time.time()

            # Navigate to podcast page
            url = f'http://localhost:3000/podcast/{language}/{location}'
            print(f"Navigating to: {url}")
            page.goto(url)

            print("\n⏳ Waiting for Stage 1 (Intro) generation...")
            print("Expected: 25-30 seconds")

            # Wait and monitor
            max_wait = 90  # 90 second max
            check_interval = 3
            elapsed = 0
            stage1_found = False

            while elapsed < max_wait:
                page.wait_for_timeout(check_interval * 1000)
                elapsed += check_interval

                # Check for Stage 1 completion indicators
                content = page.content()

                # Look for intro chapter or segment content
                if any(keyword in content for keyword in ['Intro', '소개', 'Host', 'Curator', '세그먼트']):
                    stage1_end = time.time()
                    stage1_duration = stage1_end - stage1_start
                    stage1_found = True

                    print(f"\n🎉 STAGE 1 DETECTED!")
                    print(f"⏱️ Duration: {stage1_duration:.2f}s")

                    if stage1_duration <= 35:
                        print(f"✅ SUCCESS! Within target (25-30s)")
                    else:
                        print(f"⚠️ Slower than target: {stage1_duration:.2f}s")

                    page.screenshot(path='test_results/new_stage1_complete.png', full_page=True)
                    break

                # Progress updates
                if elapsed % 10 == 0:
                    print(f"⏱️ {elapsed}s... still waiting")
                    if elapsed == 30:
                        page.screenshot(path='test_results/new_at_30s.png', full_page=True)

            if not stage1_found:
                print(f"\n❌ Stage 1 not detected after {max_wait}s")
                stage1_duration = elapsed
                page.screenshot(path='test_results/new_stage1_timeout.png', full_page=True)

            # Monitor Stage 2
            print(f"\n⏱️ Monitoring Stage 2 (background)...")
            print("Waiting 45 seconds...")

            for i in range(9):  # 9 x 5s = 45s
                page.wait_for_timeout(5000)
                if i % 2 == 0:
                    print(f"Stage 2: {(i+1)*5}s elapsed...")

            page.screenshot(path='test_results/new_final_state.png', full_page=True)

            # Analyze console logs
            print(f"\n📊 Console Analysis:")
            stage1_logs = [l for l in console_logs if 'Stage 1' in l or '🚀' in l]
            stage2_logs = [l for l in console_logs if 'Stage 2' in l or '🔄' in l]

            print(f"Total logs: {len(console_logs)}")
            print(f"Stage 1 logs: {len(stage1_logs)}")
            print(f"Stage 2 logs: {len(stage2_logs)}")

            if stage1_logs:
                print("\n🚀 Stage 1 Logs (first 5):")
                for log in stage1_logs[:5]:
                    print(f"  {log[:100]}")

            if stage2_logs:
                print("\n🔄 Stage 2 Logs (first 5):")
                for log in stage2_logs[:5]:
                    print(f"  {log[:100]}")

            # Save results
            results = {
                'location': location,
                'language': language,
                'url': page.url,
                'stage1_duration': stage1_duration if stage1_found else None,
                'stage1_success': stage1_found,
                'console_logs_count': len(console_logs),
                'timestamp': timestamp
            }

            with open('test_results/new_location_results.json', 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)

            # Summary
            print("\n" + "="*80)
            print("📊 SUMMARY")
            print("="*80)
            print(f"Location: {location}")
            print(f"Stage 1: {'✅ Success' if stage1_found else '❌ Failed'}")
            if stage1_found:
                print(f"Duration: {stage1_duration:.2f}s")
                improvement = ((90 - stage1_duration) / 90) * 100
                print(f"Improvement: {improvement:.1f}% faster than 90s")
            print("="*80)

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='test_results/new_error.png', full_page=True)

        finally:
            browser.close()
            print("\n✅ Test complete")

if __name__ == '__main__':
    import os
    os.makedirs('test_results', exist_ok=True)
    test_2stage_new_location()
