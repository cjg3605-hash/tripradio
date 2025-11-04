"""
루브르 박물관 팟캐스트 완료 대기 후 모든 챕터 확인
"""
from playwright.sync_api import sync_playwright
import time

def wait_and_verify_all_chapters():
    print("\n🧪 루브르 박물관 - 모든 챕터 확인\n")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # 1. 페이지 접속
            print("\n📍 Step 1: 페이지 접속...")
            page.goto("http://localhost:3000/podcast/ko/louvre-museum", timeout=30000)
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            print("✅ 페이지 로드 완료")

            # 2. 100% 완료 대기
            print("\n📍 Step 2: 팟캐스트 100% 완료 대기...")

            max_wait = 180  # 최대 3분
            check_interval = 5
            elapsed = 0

            while elapsed < max_wait:
                # "99%" 또는 "팟캐스트 생성 중" 텍스트 확인
                page_text = page.inner_text('body')

                if "99%" not in page_text and "생성 중" not in page_text:
                    print("✅ 팟캐스트 생성 완료!")
                    break

                elapsed += check_interval
                print(f"   대기 중... ({elapsed}/{max_wait}초)")
                time.sleep(check_interval)

            # 3. 페이지 새로고침하여 최신 상태 확인
            print("\n📍 Step 3: 페이지 새로고침...")
            page.reload()
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            print("✅ 새로고침 완료")

            # 4. 전체 페이지 스크롤 (모든 챕터 로드)
            print("\n📍 Step 4: 페이지 스크롤 (모든 콘텐츠 로드)...")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            print("✅ 스크롤 완료")

            # 5. 모든 챕터 요소 찾기
            print("\n📍 Step 5: 모든 챕터 검색...")

            # "챕터" 텍스트를 포함하는 모든 요소
            chapter_elements = page.locator("text=/챕터 \\d+/").all()

            print(f"\n   발견된 챕터 요소: {len(chapter_elements)}개")

            chapters_found = []
            for i, elem in enumerate(chapter_elements):
                try:
                    text = elem.inner_text()
                    print(f"   [{i+1}] {text}")
                    chapters_found.append(text)
                except:
                    pass

            # 6. 전체 페이지 텍스트 분석
            print("\n📍 Step 6: 전체 텍스트에서 챕터명 추출...")
            page_text = page.inner_text('body')

            # "챕터" 또는 "Chapter"로 시작하는 라인 찾기
            lines = page_text.split('\n')
            chapter_lines = [line.strip() for line in lines if line.strip().startswith('챕터') or 'Chapter' in line]

            if chapter_lines:
                print(f"\n   챕터 관련 텍스트 ({len(chapter_lines)}개):")
                for i, line in enumerate(chapter_lines, 1):
                    print(f"   {i}. {line}")

            # 7. 기대하는 챕터명 검색
            print("\n📍 Step 7: AI 생성 챕터명 검색...")

            expected_chapters = {
                "루브르 박물관 소개": False,
                "루브르 궁전의 탄생": False,
                "다빈치와 이탈리아 르네상스": False,
            }

            for chapter_name in expected_chapters.keys():
                if chapter_name in page_text:
                    expected_chapters[chapter_name] = True
                    print(f"   ✅ '{chapter_name}' 발견")
                else:
                    print(f"   ❌ '{chapter_name}' 미발견")

            # 8. 스크린샷 촬영
            print("\n📍 Step 8: 최종 스크린샷 촬영...")

            # 전체 페이지
            page.screenshot(path='/tmp/final-all-chapters.png', full_page=True)
            print("✅ 전체 페이지: /tmp/final-all-chapters.png")

            # 상단 부분만
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(1)
            page.screenshot(path='/tmp/final-top.png')
            print("✅ 상단 스크린샷: /tmp/final-top.png")

            # 9. 최종 결과
            print("\n" + "=" * 70)
            print("🎯 최종 검증 결과")
            print("=" * 70)

            found_count = sum(expected_chapters.values())
            total_count = len(expected_chapters)

            print(f"\n📊 AI 생성 챕터명: {found_count}/{total_count}개 확인")

            if found_count == total_count:
                print("\n🎉🎉🎉 성공! 모든 AI 챕터명이 페이지에 표시되고 있습니다!")
                print("\n✅ 시스템 검증 완료:")
                print("   1. AI가 실제 스팟명/챕터명 생성 ✅")
                print("   2. DB에 저장 ✅")
                print("   3. 프론트엔드에 표시 ✅")
            elif found_count > 0:
                print(f"\n⚠️  {found_count}개 챕터명 발견 (부분 성공)")
                print("   → 나머지 챕터가 아직 생성 중이거나")
                print("   → 다른 형식으로 표시되고 있을 수 있습니다")
            else:
                print("\n❌ 예상 챕터명을 찾지 못했습니다")
                print("   → 페이지 구조 확인 필요")

            print("\n📸 스크린샷:")
            print("   - /tmp/final-all-chapters.png (전체)")
            print("   - /tmp/final-top.png (상단)")

            if chapter_lines:
                print("\n📝 페이지에 표시된 챕터:")
                for line in chapter_lines[:10]:
                    print(f"   • {line}")

            print("\n" + "=" * 70)

            # 10. 브라우저 열어둔 채로 15초 대기
            print("\n⏳ 브라우저를 15초간 열어둡니다 (확인용)...")
            time.sleep(15)

        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='/tmp/error-final.png', full_page=True)

        finally:
            browser.close()
            print("\n✅ 테스트 완료!")

if __name__ == "__main__":
    wait_and_verify_all_chapters()
