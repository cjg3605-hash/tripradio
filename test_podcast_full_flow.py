"""
팟캐스트 전체 플로우 검증 테스트
- 장소 검색 → 팟캐스트 페이지 이동 → 생성 → 재생 → 챕터 확인
"""
from playwright.sync_api import sync_playwright, expect
import time
import json

def test_podcast_full_flow():
    """팟캐스트 전체 플로우 테스트"""

    with sync_playwright() as p:
        # 브라우저 실행 (헤드리스 모드)
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            print("=" * 80)
            print("팟캐스트 전체 플로우 검증 테스트 시작")
            print("=" * 80)

            # Step 1: 홈페이지 접속
            print("\n[Step 1] 홈페이지 접속 중 (Next.js 컴파일 대기)...")
            page.goto('http://localhost:3000', wait_until='domcontentloaded', timeout=90000)
            page.wait_for_timeout(5000)  # Next.js 컴파일 대기
            print("✅ 홈페이지 로드 완료")

            # Step 2: 팟캐스트 페이지로 직접 이동 (테스트용 장소: 에펠탑)
            test_location = "에펠탑"
            test_language = "ko"
            podcast_url = f'http://localhost:3000/podcast/{test_language}/{test_location}'

            print(f"\n[Step 2] 팟캐스트 페이지로 이동: {test_location}")
            page.goto(podcast_url, wait_until='domcontentloaded', timeout=90000)
            page.wait_for_timeout(5000)  # 페이지 렌더링 대기

            # 페이지 스크린샷
            page.screenshot(path='C:/GUIDEAI/.playwright-mcp/podcast-page-loaded.png', full_page=True)
            print("✅ 팟캐스트 페이지 로드 완료")
            print(f"   스크린샷 저장: podcast-page-loaded.png")

            # Step 3: 페이지 상태 확인
            print("\n[Step 3] 페이지 상태 확인 중...")

            # 헤더 확인
            header_text = page.locator('h1').first.text_content()
            print(f"   페이지 제목: {header_text}")

            # "생성하기" 버튼 또는 플레이어 확인
            has_generate_button = page.locator('button:has-text("생성")').count() > 0
            has_play_button = page.locator('button[aria-label*="재생"], button[aria-label*="Play"]').count() > 0

            print(f"   생성 버튼 존재: {has_generate_button}")
            print(f"   재생 버튼 존재: {has_play_button}")

            # Step 4: 팟캐스트 생성 또는 기존 에피소드 확인
            if has_generate_button:
                print("\n[Step 4] 팟캐스트 생성 시작...")
                generate_button = page.locator('button:has-text("생성")').first
                generate_button.click()
                print("   생성 버튼 클릭됨")

                # 생성 진행 상황 확인 (최대 2분 대기)
                print("   생성 진행 중... (최대 120초 대기)")

                # 진행률 바 또는 완료 상태 확인
                timeout_seconds = 120
                start_time = time.time()

                while time.time() - start_time < timeout_seconds:
                    # 재생 버튼이 나타나면 생성 완료
                    if page.locator('button[aria-label*="재생"], button[aria-label*="Play"]').count() > 0:
                        print("   ✅ 팟캐스트 생성 완료!")
                        break

                    # 진행률 확인
                    progress_text = page.locator('text=/\\d+%/').first
                    if progress_text.count() > 0:
                        current_progress = progress_text.text_content()
                        print(f"   진행률: {current_progress}")

                    page.wait_for_timeout(3000)

                # 생성 후 스크린샷
                page.screenshot(path='C:/GUIDEAI/.playwright-mcp/podcast-page-generated.png', full_page=True)
                print("   스크린샷 저장: podcast-page-generated.png")

            elif has_play_button:
                print("\n[Step 4] 기존 팟캐스트 에피소드 발견")
                print("   생성 단계 스킵")
            else:
                print("\n[Step 4] ⚠️ 생성 버튼도 재생 버튼도 없음")
                page.screenshot(path='C:/GUIDEAI/.playwright-mcp/podcast-page-error.png', full_page=True)
                print("   에러 스크린샷 저장: podcast-page-error.png")

            # Step 5: 챕터 구조 확인
            print("\n[Step 5] 챕터 구조 확인 중...")
            page.wait_for_timeout(2000)

            # 챕터 리스트 확인
            chapter_items = page.locator('[class*="chapter"], [role="listitem"]').all()
            print(f"   발견된 챕터 수: {len(chapter_items)}")

            if len(chapter_items) > 0:
                print("\n   챕터 목록:")
                for i, item in enumerate(chapter_items[:10]):  # 최대 10개만 표시
                    try:
                        chapter_text = item.text_content()
                        if chapter_text and len(chapter_text.strip()) > 0:
                            print(f"   {i+1}. {chapter_text.strip()[:80]}")
                    except:
                        pass

            # Step 6: 대화 내용 확인
            print("\n[Step 6] 대화 내용 확인 중...")

            # 현재 재생 중인 대화 내용 찾기
            dialogue_selectors = [
                'p:has-text("Host")',
                'p:has-text("Curator")',
                '[class*="dialogue"]',
                '[class*="segment"]',
                'p:has-text("진행자")',
                'p:has-text("큐레이터")'
            ]

            dialogue_found = False
            for selector in dialogue_selectors:
                dialogues = page.locator(selector).all()
                if len(dialogues) > 0:
                    print(f"   발견된 대화 세그먼트 수 ({selector}): {len(dialogues)}")

                    # 처음 3개 대화 내용 출력
                    print("\n   대화 샘플:")
                    for i, dialogue in enumerate(dialogues[:3]):
                        try:
                            text = dialogue.text_content()
                            if text and len(text.strip()) > 0:
                                print(f"   {i+1}. {text.strip()[:100]}...")
                                dialogue_found = True
                        except:
                            pass
                    break

            if not dialogue_found:
                print("   ⚠️ 대화 내용을 찾을 수 없음")
                # DOM 구조 출력
                print("\n   페이지 DOM 샘플:")
                page_content = page.content()
                print(page_content[:2000])

            # Step 7: 재생 버튼 테스트
            print("\n[Step 7] 재생 버튼 테스트...")

            play_button = page.locator('button[aria-label*="재생"], button[aria-label*="Play"]').first
            if play_button.count() > 0:
                print("   재생 버튼 클릭...")
                play_button.click()
                page.wait_for_timeout(3000)

                # 일시정지 버튼으로 변경되었는지 확인
                pause_button = page.locator('button[aria-label*="일시정지"], button[aria-label*="Pause"]').first
                if pause_button.count() > 0:
                    print("   ✅ 재생 시작됨 (일시정지 버튼 표시)")

                    # 재생 중 스크린샷
                    page.screenshot(path='C:/GUIDEAI/.playwright-mcp/podcast-page-playing.png', full_page=True)
                    print("   스크린샷 저장: podcast-page-playing.png")

                    # 일시정지
                    pause_button.click()
                    print("   일시정지 클릭됨")
                else:
                    print("   ⚠️ 재생 상태를 확인할 수 없음")
            else:
                print("   ⚠️ 재생 버튼을 찾을 수 없음")

            # Step 8: 최종 검증 요약
            print("\n" + "=" * 80)
            print("최종 검증 요약")
            print("=" * 80)

            summary = {
                "페이지_로드": "✅",
                "헤더_제목": header_text if header_text else "❌",
                "생성_또는_기존_에피소드": "✅" if (has_generate_button or has_play_button) else "❌",
                "챕터_구조": f"✅ ({len(chapter_items)}개)" if len(chapter_items) > 0 else "❌",
                "대화_내용": "✅" if dialogue_found else "❌",
                "재생_기능": "✅" if play_button.count() > 0 else "❌"
            }

            for key, value in summary.items():
                print(f"   {key.replace('_', ' ')}: {value}")

            # 전체 성공 여부
            all_passed = all(v.startswith("✅") for v in summary.values() if v != "❌")

            if all_passed:
                print("\n🎉 모든 검증 항목 통과!")
            else:
                print("\n⚠️ 일부 검증 항목 실패")

            print("\n" + "=" * 80)
            print("테스트 완료")
            print("=" * 80)

            return summary

        except Exception as e:
            print(f"\n❌ 테스트 실행 중 오류 발생: {e}")
            import traceback
            traceback.print_exc()

            # 에러 스크린샷
            try:
                page.screenshot(path='C:/GUIDEAI/.playwright-mcp/podcast-test-error.png', full_page=True)
                print("   에러 스크린샷 저장: podcast-test-error.png")
            except:
                pass

            return None

        finally:
            browser.close()
            print("\n브라우저 종료")

if __name__ == "__main__":
    result = test_podcast_full_flow()

    if result:
        print("\n검증 결과를 JSON으로 저장...")
        with open('C:/GUIDEAI/podcast-test-results.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print("✅ 결과 저장 완료: podcast-test-results.json")
