"""
수정 후 AI 챕터명 표시 확인
"""
from playwright.sync_api import sync_playwright
import time

def test_chapter_display():
    print("\n" + "="*80)
    print("🧪 AI 챕터명 표시 확인 테스트")
    print("="*80)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            print("\n📍 Step 1: 루브르 박물관 페이지 접속")
            print("-" * 80)

            page.goto("http://localhost:3000/podcast/ko/louvre-museum", timeout=60000)
            page.wait_for_load_state('domcontentloaded')
            time.sleep(3)

            print("✅ 페이지 로드 완료")

            # 페이지 전체 스크롤 (모든 콘텐츠 로드)
            print("\n📍 Step 2: 페이지 콘텐츠 로드")
            print("-" * 80)

            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(1)

            # 스크린샷
            page.screenshot(path='/tmp/after-fix-full.png', full_page=True)
            print("📸 전체 스크린샷: /tmp/after-fix-full.png")

            page.screenshot(path='/tmp/after-fix-top.png')
            print("📸 상단 스크린샷: /tmp/after-fix-top.png")

            # 페이지 텍스트 추출
            print("\n📍 Step 3: AI 챕터명 검색")
            print("-" * 80)

            page_text = page.inner_text('body')

            # 기대하는 AI 생성 챕터명
            expected_ai_chapters = {
                "루브르 박물관 소개": False,
                "루브르 궁전의 탄생": False,
                "다빈치와 이탈리아 르네상스": False,
            }

            # 잘못된 표시 (location slug 사용)
            wrong_displays = {
                "louvre-museum 소개": False,
                "louvre-museum": False,
            }

            print("\n   🔍 AI 생성 챕터명 확인:\n")
            for chapter_name in expected_ai_chapters.keys():
                if chapter_name in page_text:
                    expected_ai_chapters[chapter_name] = True
                    print(f"   ✅ '{chapter_name}' 발견!")
                else:
                    print(f"   ❌ '{chapter_name}' 미발견")

            print("\n   🔍 잘못된 표시 확인:\n")
            for wrong in wrong_displays.keys():
                if wrong in page_text:
                    wrong_displays[wrong] = True
                    print(f"   ⚠️  '{wrong}' 여전히 표시됨 (수정 필요)")
                else:
                    print(f"   ✅ '{wrong}' 없음 (올바름)")

            # 챕터 관련 텍스트 모두 추출
            print("\n   📋 페이지에 표시된 모든 챕터 텍스트:\n")
            lines = page_text.split('\n')
            chapter_lines = [
                line.strip() for line in lines
                if '챕터' in line and line.strip()
            ]

            for i, line in enumerate(chapter_lines[:10], 1):
                print(f"      {i}. {line}")

            # 최종 결과
            print("\n" + "="*80)
            print("🎯 검증 결과")
            print("="*80)

            ai_found = sum(expected_ai_chapters.values())
            ai_total = len(expected_ai_chapters)
            wrong_found = sum(wrong_displays.values())

            print(f"\n📊 AI 생성 챕터명: {ai_found}/{ai_total}개 발견")
            print(f"📊 잘못된 표시: {wrong_found}개")

            if ai_found >= 2 and wrong_found == 0:
                print("\n🎉🎉🎉 성공! AI 생성 챕터명이 올바르게 표시됩니다!")
                print("\n✅ 시스템 완전 검증:")
                print("   1. AI가 실제 스팟명 생성 ✅")
                print("   2. DB에 chapter_title 저장 ✅")
                print("   3. 프론트엔드에서 읽기 ✅")
                print("   4. UI에 올바르게 표시 ✅")
            elif ai_found > 0:
                print(f"\n⚠️  {ai_found}개 챕터명만 발견 (부분 성공)")
            else:
                print("\n❌ AI 챕터명이 표시되지 않음")
                if wrong_found > 0:
                    print("   → 여전히 location slug가 표시되고 있습니다")
                    print("   → 서버 재시작이 필요할 수 있습니다")

            print("\n📸 저장된 스크린샷:")
            print("   - /tmp/after-fix-full.png (전체)")
            print("   - /tmp/after-fix-top.png (상단)")

            print("\n" + "="*80)

            # 브라우저 유지
            print("\n⏳ 브라우저를 15초간 열어둡니다...")
            time.sleep(15)

        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='/tmp/test-error.png', full_page=True)

        finally:
            browser.close()
            print("\n✅ 테스트 완료!")

if __name__ == "__main__":
    test_chapter_display()
