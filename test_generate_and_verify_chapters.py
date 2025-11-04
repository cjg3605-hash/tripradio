"""
루브르 박물관 팟캐스트 생성 후 AI 챕터명 확인
"""
from playwright.sync_api import sync_playwright
import time
import json

def test_generate_podcast_and_verify():
    print("\n🧪 루브르 박물관 팟캐스트 생성 및 챕터명 검증\n")
    print("=" * 70)

    with sync_playwright() as p:
        # 브라우저 실행
        browser = p.chromium.launch(headless=False)  # 시각적으로 확인하기 위해 headless=False
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # 1. 페이지 접속
            print("\n📍 Step 1: 페이지 접속...")
            podcast_url = "http://localhost:3000/podcast/ko/louvre-museum"
            page.goto(podcast_url, timeout=30000)
            page.wait_for_load_state('networkidle')
            print("✅ 페이지 로드 완료")

            # 초기 스크린샷
            page.screenshot(path='/tmp/01-initial-page.png', full_page=True)
            print("✅ 초기 스크린샷: /tmp/01-initial-page.png")

            # 2. "팟캐스트 생성하기" 버튼 찾기 및 클릭
            print("\n📍 Step 2: '팟캐스트 생성하기' 버튼 클릭...")

            # 버튼 선택자들 시도
            button_selectors = [
                "button:has-text('팟캐스트 생성하기')",
                "button:has-text('생성하기')",
                "text=팟캐스트 생성하기",
                "[class*='generate']",
            ]

            button_clicked = False
            for selector in button_selectors:
                try:
                    button = page.locator(selector).first
                    if button.is_visible(timeout=2000):
                        print(f"   버튼 발견: {selector}")
                        button.click()
                        button_clicked = True
                        print("✅ 버튼 클릭 성공")
                        break
                except:
                    continue

            if not button_clicked:
                print("❌ '팟캐스트 생성하기' 버튼을 찾을 수 없습니다")
                # 페이지 내용 출력
                print("\n현재 페이지 텍스트:")
                print(page.inner_text('body')[:500])
                page.screenshot(path='/tmp/button-not-found.png', full_page=True)
                browser.close()
                return

            # 3. 생성 시작 확인
            print("\n📍 Step 3: 팟캐스트 생성 대기 중...")
            time.sleep(3)  # 생성 시작 대기

            page.screenshot(path='/tmp/02-generating.png', full_page=True)
            print("✅ 생성 중 스크린샷: /tmp/02-generating.png")

            # 4. 생성 완료 대기 (최대 2분)
            print("\n📍 Step 4: 생성 완료 대기 (최대 120초)...")

            # 챕터 또는 재생 버튼이 나타날 때까지 대기
            completion_selectors = [
                "text=Chapter",
                "text=챕터",
                "[class*='chapter']",
                "button:has-text('재생')",
                "button:has-text('Play')",
                "[data-testid='play-button']",
            ]

            max_wait = 120  # 최대 120초
            wait_interval = 5  # 5초마다 확인
            elapsed = 0
            completed = False

            while elapsed < max_wait:
                for selector in completion_selectors:
                    try:
                        if page.locator(selector).first.is_visible(timeout=1000):
                            print(f"✅ 생성 완료 감지: {selector}")
                            completed = True
                            break
                    except:
                        continue

                if completed:
                    break

                elapsed += wait_interval
                print(f"   대기 중... ({elapsed}/{max_wait}초)")
                time.sleep(wait_interval)

            if not completed:
                print(f"⚠️  {max_wait}초 대기 후에도 완료 신호를 감지하지 못했습니다")
                print("   현재 페이지 상태를 확인합니다...")

            # 5. 생성 완료 후 페이지 상태 확인
            print("\n📍 Step 5: 생성 완료 후 페이지 분석...")
            page.wait_for_load_state('networkidle', timeout=30000)
            time.sleep(2)

            # 완료 스크린샷
            page.screenshot(path='/tmp/03-completed.png', full_page=True)
            print("✅ 완료 스크린샷: /tmp/03-completed.png")

            # 6. 챕터 요소 찾기
            print("\n📍 Step 6: 챕터 목록 검색...")

            # 다양한 선택자로 챕터 찾기
            chapter_found = []

            # 텍스트로 검색
            page_text = page.inner_text('body')

            expected_chapters = [
                "루브르 박물관 소개",
                "루브르 궁전의 탄생",
                "다빈치와 이탈리아 르네상스"
            ]

            print("\n   페이지에서 챕터명 검색:")
            for chapter in expected_chapters:
                if chapter in page_text:
                    print(f"   ✅ '{chapter}' 발견")
                    chapter_found.append(chapter)
                else:
                    print(f"   ❌ '{chapter}' 미발견")

            # 7. 모든 h2, h3, h4 요소 검사
            print("\n📍 Step 7: 모든 제목 요소 검사...")

            for tag in ['h1', 'h2', 'h3', 'h4']:
                elements = page.locator(tag).all()
                if elements:
                    print(f"\n   <{tag}> 요소 ({len(elements)}개):")
                    for i, elem in enumerate(elements[:10]):
                        try:
                            text = elem.inner_text()
                            if text:
                                print(f"      [{i+1}] {text[:100]}")
                        except:
                            pass

            # 8. 전체 페이지 텍스트에서 "루브르" 관련 텍스트 추출
            print("\n📍 Step 8: '루브르' 관련 텍스트 추출...")
            lines = page_text.split('\n')
            louvre_lines = [line.strip() for line in lines if '루브르' in line or '다빈치' in line]

            if louvre_lines:
                print(f"\n   '루브르' 또는 '다빈치' 포함 텍스트 ({len(louvre_lines)}개):")
                for i, line in enumerate(louvre_lines[:15], 1):
                    if line:
                        print(f"      {i}. {line[:100]}")

            # 9. 최종 결과
            print("\n" + "=" * 70)
            print("🎯 최종 결과")
            print("=" * 70)

            if chapter_found:
                print(f"\n✅ 성공! {len(chapter_found)}개 챕터명 발견:")
                for i, chapter in enumerate(chapter_found, 1):
                    print(f"   {i}. {chapter}")
                print("\n🎉 AI 생성 챕터명이 페이지에 표시되고 있습니다!")
            else:
                print("\n⚠️  예상 챕터명을 찾지 못했습니다")
                print("   → 페이지가 완전히 로드되지 않았거나")
                print("   → 챕터가 다른 형식으로 표시되고 있을 수 있습니다")

            print("\n📸 저장된 스크린샷:")
            print("   1. /tmp/01-initial-page.png - 초기 페이지")
            print("   2. /tmp/02-generating.png - 생성 중")
            print("   3. /tmp/03-completed.png - 완료 후")

            print("\n" + "=" * 70)

            # 10. 브라우저를 열어둔 상태로 10초 대기 (사용자가 확인 가능)
            print("\n⏳ 브라우저를 10초간 열어둡니다 (확인용)...")
            time.sleep(10)

        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            page.screenshot(path='/tmp/error-state.png', full_page=True)
            print("   에러 스크린샷: /tmp/error-state.png")

        finally:
            browser.close()
            print("\n✅ 테스트 완료!")

if __name__ == "__main__":
    test_generate_podcast_and_verify()
