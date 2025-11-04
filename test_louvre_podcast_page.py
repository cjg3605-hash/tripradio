"""
루브르 박물관 팟캐스트 페이지에서 AI 생성 챕터명 확인
"""
from playwright.sync_api import sync_playwright
import time

def test_louvre_podcast():
    print("\n🧪 루브르 박물관 팟캐스트 페이지 테스트 시작\n")
    print("=" * 70)

    with sync_playwright() as p:
        # 브라우저 실행 (헤드리스 모드)
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. 루브르 박물관 팟캐스트 페이지 접속
        print("\n📍 Step 1: 페이지 접속 중...")
        podcast_url = "http://localhost:3000/podcast/ko/louvre-museum"

        try:
            page.goto(podcast_url, timeout=30000)
            print(f"✅ 페이지 로드 성공: {podcast_url}")
        except Exception as e:
            print(f"❌ 페이지 로드 실패: {e}")
            browser.close()
            return

        # 2. 네트워크가 안정될 때까지 대기
        print("\n📍 Step 2: 페이지 렌더링 대기 중...")
        page.wait_for_load_state('networkidle', timeout=30000)
        time.sleep(2)  # 추가 대기
        print("✅ 페이지 렌더링 완료")

        # 3. 스크린샷 촬영 (전체 페이지)
        print("\n📍 Step 3: 스크린샷 촬영 중...")
        screenshot_path = "/tmp/louvre-podcast-page.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"✅ 스크린샷 저장: {screenshot_path}")

        # 4. 페이지 제목 확인
        print("\n📍 Step 4: 페이지 정보 확인 중...")
        title = page.title()
        print(f"   페이지 제목: {title}")

        # 5. 챕터 요소 찾기
        print("\n📍 Step 5: 챕터 목록 확인 중...")

        # 챕터 관련 요소들 찾기
        chapter_selectors = [
            "h3",  # 챕터 제목이 h3에 있을 가능성
            "h2",  # 또는 h2
            "[class*='chapter']",  # chapter라는 클래스명
            "[class*='Chapter']",
            "[data-chapter]",  # data-chapter 속성
        ]

        found_chapters = []
        for selector in chapter_selectors:
            try:
                elements = page.locator(selector).all()
                if elements:
                    print(f"\n   선택자 '{selector}': {len(elements)}개 요소 발견")
                    for i, elem in enumerate(elements[:5]):  # 처음 5개만
                        try:
                            text = elem.inner_text()
                            if text and len(text) > 5:  # 의미있는 텍스트만
                                print(f"      [{i+1}] {text[:100]}")
                                found_chapters.append(text)
                        except:
                            pass
            except Exception as e:
                pass

        # 6. 페이지 내용에서 특정 텍스트 검색
        print("\n📍 Step 6: 챕터명 텍스트 검색 중...")
        content = page.content()

        # 기대하는 챕터명들
        expected_chapters = [
            "루브르 박물관 소개",
            "루브르 궁전의 탄생과 진화",
            "다빈치와 이탈리아 르네상스"
        ]

        print("\n   예상 챕터명 검색 결과:")
        for chapter in expected_chapters:
            if chapter in content:
                print(f"   ✅ '{chapter}' 발견")
            else:
                print(f"   ❌ '{chapter}' 미발견")

        # 7. 콘솔 로그 확인
        print("\n📍 Step 7: 브라우저 콘솔 로그 확인")
        console_messages = []

        def handle_console(msg):
            console_messages.append(f"[{msg.type}] {msg.text}")

        page.on("console", handle_console)

        # 페이지 새로고침하여 콘솔 로그 캡처
        page.reload()
        page.wait_for_load_state('networkidle', timeout=30000)
        time.sleep(2)

        if console_messages:
            print(f"\n   콘솔 메시지 {len(console_messages)}개:")
            for msg in console_messages[:10]:  # 처음 10개만
                print(f"   {msg}")
        else:
            print("   콘솔 메시지 없음")

        # 8. 최종 스크린샷
        print("\n📍 Step 8: 최종 스크린샷 촬영...")
        final_screenshot = "/tmp/louvre-podcast-final.png"
        page.screenshot(path=final_screenshot, full_page=True)
        print(f"✅ 최종 스크린샷: {final_screenshot}")

        # 9. 결과 요약
        print("\n" + "=" * 70)
        print("🎯 테스트 결과 요약")
        print("=" * 70)
        print(f"\n✅ 페이지 로드: 성공")
        print(f"✅ 스크린샷: {screenshot_path}")
        print(f"✅ 최종 스크린샷: {final_screenshot}")

        if found_chapters:
            print(f"\n📋 발견된 챕터 텍스트 ({len(found_chapters)}개):")
            for i, chapter in enumerate(found_chapters[:10], 1):
                print(f"   {i}. {chapter[:100]}")
        else:
            print("\n⚠️  챕터 요소를 찾지 못했습니다")
            print("   → 페이지 구조를 확인해야 합니다")

        print("\n💡 다음 단계:")
        print("   1. 스크린샷을 확인하여 페이지 상태 파악")
        print("   2. 챕터명이 표시되는지 육안으로 확인")
        print("   3. 필요시 선택자 수정 후 재테스트")

        print("\n" + "=" * 70)

        # 브라우저 닫기
        browser.close()
        print("\n✅ 테스트 완료!")

if __name__ == "__main__":
    test_louvre_podcast()
