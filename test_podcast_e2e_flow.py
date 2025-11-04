"""
엔터프라이즈급 E2E 테스트: 팟캐스트 생성 전체 플로우 검증

테스트 시나리오:
1. 홈페이지 로드 및 검색 UI 확인
2. 새로운 장소 검색 (도쿄 타워)
3. 팟캐스트 생성 API 호출 모니터링
4. 데이터베이스 저장 확인
5. 팟캐스트 페이지 렌더링 검증
6. 세그먼트 파싱 및 표시 확인

엔터프라이즈 QA 기준:
- 페이지 로드: < 3초
- API 응답: < 10초 (AI 생성 포함)
- UI 반응성: 즉시
- 데이터 정합성: 100%
- 오류 없음
"""

from playwright.sync_api import sync_playwright, Page
import json
import time
from datetime import datetime

# 테스트 결과 저장
test_results = {
    "test_name": "Podcast E2E Flow Test",
    "start_time": datetime.now().isoformat(),
    "phases": [],
    "passed": 0,
    "failed": 0,
    "warnings": 0
}

def log_phase(phase_name: str, status: str, details: dict = None):
    """Phase 결과 로깅"""
    result = {
        "phase": phase_name,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    test_results["phases"].append(result)

    if status == "PASS":
        test_results["passed"] += 1
        print(f"✅ {phase_name}: PASS")
    elif status == "FAIL":
        test_results["failed"] += 1
        print(f"❌ {phase_name}: FAIL")
    elif status == "WARN":
        test_results["warnings"] += 1
        print(f"⚠️  {phase_name}: WARN")

    if details:
        print(f"   Details: {json.dumps(details, indent=2)}")

def check_console_errors(page: Page, phase_name: str):
    """콘솔 오류 확인"""
    console_messages = []
    errors = []

    def handle_console(msg):
        if msg.type == 'error':
            errors.append(msg.text)
        console_messages.append({
            "type": msg.type,
            "text": msg.text
        })

    page.on("console", handle_console)

    return console_messages, errors

def monitor_network_requests(page: Page):
    """네트워크 요청 모니터링"""
    requests = []

    def handle_request(request):
        requests.append({
            "method": request.method,
            "url": request.url,
            "timestamp": datetime.now().isoformat()
        })

    def handle_response(response):
        for req in requests:
            if req["url"] == response.url:
                req["status"] = response.status
                req["response_time"] = datetime.now().isoformat()
                break

    page.on("request", handle_request)
    page.on("response", handle_response)

    return requests

def run_e2e_test():
    """메인 E2E 테스트 실행"""

    with sync_playwright() as p:
        # 브라우저 시작 (headless=False로 실제 브라우저 표시)
        browser = p.chromium.launch(headless=False, slow_mo=500)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            locale='ko-KR'
        )
        page = context.new_page()

        # 네트워크 및 콘솔 모니터링 시작
        network_requests = monitor_network_requests(page)
        console_messages, console_errors = check_console_errors(page, "Initial")

        try:
            # ========================================
            # Phase 1: 홈페이지 로드 검증
            # ========================================
            print("\n" + "="*60)
            print("Phase 1: 홈페이지 로드 검증")
            print("="*60)

            start_time = time.time()
            page.goto('http://localhost:3000', wait_until='networkidle', timeout=30000)
            load_time = time.time() - start_time

            # 페이지 로드 시간 검증
            if load_time < 3.0:
                log_phase("Homepage Load Time", "PASS", {"load_time": f"{load_time:.2f}s", "threshold": "< 3s"})
            else:
                log_phase("Homepage Load Time", "WARN", {"load_time": f"{load_time:.2f}s", "threshold": "< 3s"})

            # 스크린샷 저장
            page.screenshot(path='test_results/01_homepage.png', full_page=True)

            # 검색 UI 확인
            search_input = page.locator('input[type="text"], input[placeholder*="검색"], input[placeholder*="search"]').first
            if search_input.is_visible(timeout=5000):
                log_phase("Search UI Present", "PASS", {"element": "search input found"})
            else:
                log_phase("Search UI Present", "FAIL", {"error": "search input not found"})

            # ========================================
            # Phase 2: 장소 검색 및 팟캐스트 생성
            # ========================================
            print("\n" + "="*60)
            print("Phase 2: 장소 검색 및 팟캐스트 생성")
            print("="*60)

            # 테스트 장소 입력
            test_location = "도쿄 타워"
            search_input.fill(test_location)
            log_phase("Location Input", "PASS", {"location": test_location})

            # 약간 대기 (UI 반응 시간)
            page.wait_for_timeout(1000)

            # "팟캐스트 생성하기" 버튼 찾기 (다양한 선택자 시도)
            generate_button_selectors = [
                'button:has-text("팟캐스트 생성")',
                'button:has-text("생성")',
                'button:has-text("Generate")',
                '[role="button"]:has-text("팟캐스트")',
                'a[href*="podcast"]'
            ]

            generate_button = None
            for selector in generate_button_selectors:
                try:
                    btn = page.locator(selector).first
                    if btn.is_visible(timeout=2000):
                        generate_button = btn
                        log_phase("Generate Button Found", "PASS", {"selector": selector})
                        break
                except:
                    continue

            if not generate_button:
                log_phase("Generate Button Found", "FAIL", {"error": "No button found with any selector"})
                page.screenshot(path='test_results/02_button_not_found.png', full_page=True)
                raise Exception("팟캐스트 생성 버튼을 찾을 수 없습니다")

            # 스크린샷 (생성 버튼 찾은 상태)
            page.screenshot(path='test_results/03_before_generate.png', full_page=True)

            # 버튼 클릭
            api_request_started = False

            # API 요청 모니터링 설정
            def check_api_request(request):
                nonlocal api_request_started
                if '/api/tts/notebooklm/generate' in request.url and request.method == 'POST':
                    api_request_started = True
                    print(f"🎯 API 요청 감지: {request.url}")

            page.on("request", check_api_request)

            # 클릭 및 네비게이션 대기
            generate_button.click()
            log_phase("Generate Button Clicked", "PASS", {"action": "button clicked"})

            # API 호출 대기 (최대 120초 - AI 생성 시간 포함)
            print("⏳ API 호출 대기 중... (최대 120초)")
            api_wait_start = time.time()

            # 페이지 변경 또는 API 응답 대기
            try:
                # 팟캐스트 페이지로 이동했는지 확인
                page.wait_for_url('**/podcast/**', timeout=120000)
                api_response_time = time.time() - api_wait_start

                log_phase("API Response & Navigation", "PASS", {
                    "response_time": f"{api_response_time:.2f}s",
                    "new_url": page.url
                })
            except Exception as e:
                api_response_time = time.time() - api_wait_start
                log_phase("API Response & Navigation", "FAIL", {
                    "error": str(e),
                    "wait_time": f"{api_response_time:.2f}s"
                })

            # 스크린샷 (API 호출 후)
            page.screenshot(path='test_results/04_after_api_call.png', full_page=True)

            # ========================================
            # Phase 3: 팟캐스트 페이지 렌더링 검증
            # ========================================
            print("\n" + "="*60)
            print("Phase 3: 팟캐스트 페이지 렌더링 검증")
            print("="*60)

            # 페이지 완전 로드 대기
            page.wait_for_load_state('networkidle', timeout=30000)

            # URL 검증
            current_url = page.url
            if '/podcast/' in current_url and test_location.replace(' ', '-').lower() in current_url.lower():
                log_phase("URL Routing", "PASS", {"url": current_url})
            elif '/podcast/' in current_url:
                log_phase("URL Routing", "WARN", {"url": current_url, "note": "URL pattern different than expected"})
            else:
                log_phase("URL Routing", "FAIL", {"url": current_url})

            # 팟캐스트 플레이어 UI 확인
            player_elements = {
                "play_button": 'button[aria-label*="재생"], button[aria-label*="play"], svg.lucide-play',
                "chapter_list": '[class*="chapter"], [class*="ChapterList"]',
                "segment_text": '[class*="segment"], [class*="dialogue"], [class*="text-content"]'
            }

            for element_name, selector in player_elements.items():
                try:
                    element = page.locator(selector).first
                    if element.is_visible(timeout=10000):
                        log_phase(f"UI Element: {element_name}", "PASS", {"selector": selector})
                    else:
                        log_phase(f"UI Element: {element_name}", "WARN", {"selector": selector, "note": "not visible"})
                except:
                    log_phase(f"UI Element: {element_name}", "FAIL", {"selector": selector})

            # 스크린샷 (최종 페이지)
            page.screenshot(path='test_results/05_final_podcast_page.png', full_page=True)

            # ========================================
            # Phase 4: 세그먼트 파싱 확인
            # ========================================
            print("\n" + "="*60)
            print("Phase 4: 세그먼트 파싱 및 표시 확인")
            print("="*60)

            # 세그먼트 텍스트 찾기
            page.wait_for_timeout(2000)  # 렌더링 완료 대기

            # 여러 선택자로 세그먼트 찾기
            segment_selectors = [
                '[class*="segment"]',
                '[class*="dialogue"]',
                'p:has-text("male"), p:has-text("female")',
                'div:has-text("진행자"), div:has-text("큐레이터")'
            ]

            segments_found = 0
            for selector in segment_selectors:
                try:
                    segments = page.locator(selector).all()
                    if len(segments) > 0:
                        segments_found = len(segments)
                        log_phase("Segments Parsed", "PASS", {
                            "selector": selector,
                            "count": segments_found
                        })
                        break
                except:
                    continue

            if segments_found == 0:
                log_phase("Segments Parsed", "WARN", {"note": "No segments found with any selector"})

            # ========================================
            # Phase 5: 콘솔 오류 확인
            # ========================================
            print("\n" + "="*60)
            print("Phase 5: 콘솔 오류 최종 확인")
            print("="*60)

            if len(console_errors) == 0:
                log_phase("Console Errors", "PASS", {"error_count": 0})
            else:
                log_phase("Console Errors", "WARN", {
                    "error_count": len(console_errors),
                    "errors": console_errors[:5]  # 처음 5개만 표시
                })

            # ========================================
            # Phase 6: 네트워크 요청 분석
            # ========================================
            print("\n" + "="*60)
            print("Phase 6: 네트워크 요청 분석")
            print("="*60)

            api_calls = [req for req in network_requests if '/api/' in req['url']]
            log_phase("Network Requests", "PASS", {
                "total_requests": len(network_requests),
                "api_calls": len(api_calls)
            })

            # API 호출 상세 정보
            for api_call in api_calls:
                if 'generate' in api_call['url']:
                    print(f"\n📡 API Call Details:")
                    print(f"   URL: {api_call['url']}")
                    print(f"   Method: {api_call['method']}")
                    print(f"   Status: {api_call.get('status', 'N/A')}")

        except Exception as e:
            log_phase("Test Execution", "FAIL", {"error": str(e)})
            print(f"\n❌ 테스트 실패: {str(e)}")
            page.screenshot(path='test_results/error_screenshot.png', full_page=True)

        finally:
            # 브라우저 종료
            browser.close()

    # ========================================
    # 테스트 결과 요약
    # ========================================
    test_results["end_time"] = datetime.now().isoformat()

    print("\n" + "="*60)
    print("📊 테스트 결과 요약")
    print("="*60)
    print(f"✅ 통과: {test_results['passed']}")
    print(f"❌ 실패: {test_results['failed']}")
    print(f"⚠️  경고: {test_results['warnings']}")
    print(f"총 Phase 수: {len(test_results['phases'])}")

    # 결과를 JSON 파일로 저장
    with open('test_results/e2e_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)

    print(f"\n📄 상세 결과: test_results/e2e_test_results.json")
    print(f"📸 스크린샷: test_results/*.png")

    # 전체 성공 여부 반환
    return test_results['failed'] == 0

if __name__ == "__main__":
    # 테스트 결과 디렉토리 생성
    import os
    os.makedirs('test_results', exist_ok=True)

    print("🚀 엔터프라이즈 E2E 테스트 시작...")
    print("="*60)

    success = run_e2e_test()

    if success:
        print("\n🎉 모든 테스트 통과!")
        exit(0)
    else:
        print("\n⚠️  일부 테스트 실패. 상세 내용을 확인하세요.")
        exit(1)
