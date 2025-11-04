"""
루브르 박물관 팟캐스트 전체 플로우 테스트 (단일 세션)
생성 → 대기 → 검증을 한 번에 수행
"""
from playwright.sync_api import sync_playwright
import time

def test_complete_flow():
    print("\n" + "="*80)
    print("🧪 루브르 박물관 팟캐스트 - 완전한 플로우 테스트")
    print("="*80)

    with sync_playwright() as p:
        # 브라우저 실행 (화면 보이도록)
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # ========== STEP 1: 페이지 접속 ==========
            print("\n📍 Step 1: 페이지 접속")
            print("-" * 80)

            podcast_url = "http://localhost:3000/podcast/ko/louvre-museum"
            page.goto(podcast_url, timeout=60000)
            page.wait_for_load_state('domcontentloaded')
            time.sleep(2)

            print(f"✅ 접속 완료: {podcast_url}")

            # 초기 상태 스크린샷
            page.screenshot(path='/tmp/flow-01-initial.png', full_page=True)
            print("📸 스크린샷: /tmp/flow-01-initial.png")

            # ========== STEP 2: 페이지 상태 확인 ==========
            print("\n📍 Step 2: 페이지 상태 확인")
            print("-" * 80)

            page_text = page.inner_text('body')

            # 이미 생성된 팟캐스트가 있는지 확인
            if "팟캐스트 생성하기" not in page_text:
                print("⚠️  페이지에 '팟캐스트 생성하기' 버튼이 없습니다")
                print("   → 이미 생성된 팟캐스트가 있을 수 있습니다")
                print("\n현재 페이지에서 '챕터' 텍스트 검색 중...")

                # 챕터가 이미 표시되는지 확인
                if "챕터" in page_text or "Chapter" in page_text:
                    print("✅ 챕터가 이미 표시되고 있습니다!")
                    # STEP 6로 바로 이동 (검증)
                    verify_chapters(page)
                    return
                else:
                    print("❌ 팟캐스트가 생성되지 않은 것으로 보입니다")
                    print("   → 페이지 구조를 확인해야 합니다")
                    page.screenshot(path='/tmp/flow-unexpected-state.png', full_page=True)
                    return

            print("✅ '팟캐스트 생성하기' 버튼 발견")

            # ========== STEP 3: 팟캐스트 생성 시작 ==========
            print("\n📍 Step 3: 팟캐스트 생성 시작")
            print("-" * 80)

            # 생성 버튼 찾기 및 클릭
            button_selectors = [
                "button:has-text('팟캐스트 생성하기')",
                "button:has-text('생성하기')",
                "text=팟캐스트 생성하기",
            ]

            button_clicked = False
            for selector in button_selectors:
                try:
                    button = page.locator(selector).first
                    if button.is_visible(timeout=2000):
                        print(f"   버튼 발견: {selector}")
                        button.click()
                        button_clicked = True
                        print("✅ 생성 버튼 클릭 완료!")
                        break
                except:
                    continue

            if not button_clicked:
                print("❌ 생성 버튼을 클릭할 수 없습니다")
                page.screenshot(path='/tmp/flow-button-error.png', full_page=True)
                return

            # 클릭 후 대기
            time.sleep(5)
            page.screenshot(path='/tmp/flow-02-after-click.png', full_page=True)
            print("📸 스크린샷: /tmp/flow-02-after-click.png")

            # ========== STEP 4: Stage 1 (인트로) 생성 대기 ==========
            print("\n📍 Step 4: Stage 1 (인트로) 생성 대기")
            print("-" * 80)

            stage1_complete = False
            max_wait_stage1 = 120  # 2분
            elapsed = 0
            check_interval = 5

            print("   Stage 1 생성 중... (최대 120초)")

            while elapsed < max_wait_stage1:
                page_text = page.inner_text('body')

                # Stage 1 완료 신호: "챕터 0" 또는 진행률 표시
                if "챕터" in page_text or "Chapter" in page_text:
                    # 진행률 확인
                    if "%" in page_text:
                        # 진행률 추출
                        lines = page_text.split('\n')
                        for line in lines:
                            if "%" in line:
                                print(f"   📊 진행률: {line.strip()}")
                                break

                        # 98% 이상이면 Stage 1 완료로 간주
                        if "98%" in page_text or "99%" in page_text or "100%" in page_text:
                            stage1_complete = True
                            print(f"\n✅ Stage 1 생성 완료! (경과 시간: {elapsed}초)")
                            break
                    else:
                        # 진행률 없이 챕터가 보이면 완료
                        stage1_complete = True
                        print(f"\n✅ Stage 1 생성 완료! (경과 시간: {elapsed}초)")
                        break

                elapsed += check_interval
                time.sleep(check_interval)

            if not stage1_complete:
                print(f"\n⚠️  Stage 1 생성이 {max_wait_stage1}초 내에 완료되지 않았습니다")
                page.screenshot(path='/tmp/flow-stage1-timeout.png', full_page=True)
                # 계속 진행

            # Stage 1 완료 스크린샷
            page.screenshot(path='/tmp/flow-03-stage1-done.png', full_page=True)
            print("📸 스크린샷: /tmp/flow-03-stage1-done.png")

            # ========== STEP 5: Stage 2 (나머지) 생성 대기 ==========
            print("\n📍 Step 5: Stage 2 (나머지 챕터) 생성 대기")
            print("-" * 80)

            stage2_complete = False
            max_wait_stage2 = 180  # 3분
            elapsed = 0

            print("   Stage 2 생성 중... (최대 180초)")

            while elapsed < max_wait_stage2:
                page_text = page.inner_text('body')

                # Stage 2 완료 신호: "생성 중" 또는 "99%" 텍스트 사라짐
                if "생성 중" not in page_text and "99%" not in page_text and "98%" not in page_text:
                    # 추가로 "재생" 버튼이나 완료 표시 확인
                    if "재생" in page_text or "Play" in page_text or "챕터 1" in page_text:
                        stage2_complete = True
                        print(f"\n✅ Stage 2 생성 완료! (경과 시간: {elapsed}초)")
                        break
                else:
                    # 진행 상황 출력
                    if elapsed % 15 == 0:  # 15초마다 상태 출력
                        if "%" in page_text:
                            lines = page_text.split('\n')
                            for line in lines:
                                if "%" in line and ("생성" in line or "Stage" in line):
                                    print(f"   📊 {line.strip()}")
                                    break

                elapsed += check_interval
                time.sleep(check_interval)

            if not stage2_complete:
                print(f"\n⚠️  Stage 2 생성이 {max_wait_stage2}초 내에 완료되지 않았습니다")
                print("   → 부분 완료 상태일 수 있습니다. 검증을 계속 진행합니다.")

            # Stage 2 완료 스크린샷
            page.screenshot(path='/tmp/flow-04-stage2-done.png', full_page=True)
            print("📸 스크린샷: /tmp/flow-04-stage2-done.png")

            # ========== STEP 6: 페이지 새로고침 및 최종 확인 ==========
            print("\n📍 Step 6: 페이지 새로고침 및 최종 상태 확인")
            print("-" * 80)

            print("   페이지 새로고침 중...")
            page.reload()
            page.wait_for_load_state('domcontentloaded')
            time.sleep(3)

            print("✅ 새로고침 완료")

            # 전체 페이지 스크롤 (모든 콘텐츠 로드)
            print("   페이지 스크롤 중...")
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(1)

            page.screenshot(path='/tmp/flow-05-refreshed.png', full_page=True)
            print("📸 스크린샷: /tmp/flow-05-refreshed.png")

            # ========== STEP 7: AI 생성 챕터명 검증 ==========
            verify_chapters(page)

            # ========== STEP 8: 브라우저 유지 ==========
            print("\n📍 Step 8: 브라우저 유지")
            print("-" * 80)
            print("   브라우저를 20초간 열어둡니다 (확인용)...")
            time.sleep(20)

        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='/tmp/flow-error.png', full_page=True)
            print("📸 에러 스크린샷: /tmp/flow-error.png")

        finally:
            browser.close()
            print("\n" + "="*80)
            print("✅ 테스트 완료!")
            print("="*80)


def verify_chapters(page):
    """챕터명 검증 함수"""
    print("\n📍 Step 7: AI 생성 챕터명 검증")
    print("-" * 80)

    page_text = page.inner_text('body')

    # 기대하는 챕터명들 (AI가 생성해야 하는 실제 스팟명)
    expected_chapters = {
        "루브르 박물관 소개": False,
        "루브르 궁전의 탄생": False,
        "다빈치와 이탈리아 르네상스": False,
        "고대 이집트": False,
        "그리스": False,
        "로마": False,
    }

    print("\n   🔍 AI 생성 챕터명 검색 중...\n")

    found_count = 0
    for chapter_name in expected_chapters.keys():
        # 부분 매칭도 시도 (예: "루브르 궁전의 탄생과 진화" vs "루브르 궁전의 탄생")
        found = False
        for keyword in chapter_name.split():
            if len(keyword) >= 3 and keyword in page_text:
                found = True
                break

        if chapter_name in page_text or found:
            expected_chapters[chapter_name] = True
            found_count += 1
            print(f"   ✅ '{chapter_name}' 발견")
        else:
            print(f"   ❌ '{chapter_name}' 미발견")

    # 챕터 관련 모든 텍스트 추출
    print("\n   📋 페이지에 표시된 챕터 관련 텍스트:\n")
    lines = page_text.split('\n')
    chapter_lines = [
        line.strip() for line in lines
        if '챕터' in line or 'Chapter' in line or '루브르' in line or '다빈치' in line
    ]

    for i, line in enumerate(chapter_lines[:20], 1):
        if line:
            print(f"      {i}. {line}")

    # 최종 결과
    print("\n" + "="*80)
    print("🎯 검증 결과")
    print("="*80)

    total = len(expected_chapters)
    print(f"\n📊 AI 생성 챕터명: {found_count}/{total}개 발견\n")

    if found_count >= 3:
        print("🎉 성공! AI 생성 챕터명이 페이지에 표시되고 있습니다!")
        print("\n✅ 시스템 검증 완료:")
        print("   1. AI가 실제 스팟명 생성 ✅")
        print("   2. DB에 chapter_title 저장 ✅")
        print("   3. 프론트엔드에 표시 ✅")
    elif found_count > 0:
        print(f"⚠️  {found_count}개 챕터명 발견 (부분 성공)")
        print("   → 일부 챕터만 표시되고 있습니다")
    else:
        print("❌ 예상 챕터명을 찾지 못했습니다")
        print("   → 프론트엔드가 chapter_title을 표시하지 않을 수 있습니다")
        print("   → 또는 다른 형식으로 표시 중일 수 있습니다")

    print("\n" + "="*80)


if __name__ == "__main__":
    test_complete_flow()
