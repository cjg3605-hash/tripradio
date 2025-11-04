"""
팟캐스트 V2 생성/파싱 문제 진단 스크립트
실제 페이지 동작을 테스트하여 DB 경로, API 호출, 파싱 문제를 정확히 분석
"""

from playwright.sync_api import sync_playwright
import json
import time

def test_podcast_generation():
    """팟캐스트 생성 및 파싱 문제 진단"""

    with sync_playwright() as p:
        print("🔍 팟캐스트 V2 문제 진단 시작...")

        # 브라우저 실행 (헤드리스 모드)
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 네트워크 요청 모니터링
        api_calls = []

        def log_request(request):
            if '/api/' in request.url:
                api_calls.append({
                    'method': request.method,
                    'url': request.url,
                    'timestamp': time.time()
                })
                print(f"📡 API 요청: {request.method} {request.url}")

        def log_response(response):
            if '/api/' in response.url:
                try:
                    body = response.body()
                    print(f"📥 API 응답: {response.status} {response.url}")
                    if response.status != 200:
                        print(f"   ⚠️ 에러 상태: {response.status}")
                    if len(body) < 5000:  # 작은 응답만 출력
                        try:
                            data = json.loads(body)
                            print(f"   📊 응답 데이터: {json.dumps(data, ensure_ascii=False, indent=2)[:500]}...")
                        except:
                            print(f"   📄 응답 (텍스트): {body.decode('utf-8')[:500]}")
                except Exception as e:
                    print(f"   ⚠️ 응답 읽기 실패: {e}")

        page.on('request', log_request)
        page.on('response', log_response)

        # 콘솔 로그 캡처
        console_logs = []

        def log_console(msg):
            log_entry = f"[{msg.type}] {msg.text}"
            console_logs.append(log_entry)
            if 'error' in msg.type.lower() or '❌' in msg.text or '⚠️' in msg.text:
                print(f"🖥️  {log_entry}")

        page.on('console', log_console)

        try:
            # 1. 팟캐스트 페이지 접속 (테스트용 간단한 위치)
            test_location = "콜로세움"  # 이미 존재하는 데이터로 테스트
            test_language = "ko"

            print(f"\n1️⃣  팟캐스트 페이지 접속: {test_location} ({test_language})")
            url = f"http://localhost:3000/podcast/{test_language}/{test_location}"
            print(f"   URL: {url}")

            page.goto(url, wait_until='networkidle', timeout=30000)
            print("   ✅ 페이지 로드 완료")

            # 스크린샷 저장
            page.screenshot(path='C:/GUIDEAI/test-podcast-initial.png', full_page=True)
            print("   📸 초기 스크린샷 저장: test-podcast-initial.png")

            # 2. 페이지 상태 확인
            time.sleep(2)  # UI 렌더링 대기

            # "생성" 버튼이 있는지 확인
            generate_button = page.locator('button:has-text("생성")')
            if generate_button.count() > 0:
                print("\n2️⃣  기존 팟캐스트 없음 - 생성 버튼 발견")
                print("   ⚠️ 이미 생성된 팟캐스트가 없거나 조회 실패")
            else:
                print("\n2️⃣  기존 팟캐스트 존재 또는 로딩 중")

            # Play/Pause 버튼 확인
            play_button = page.locator('button[aria-label*="play"], button[aria-label*="재생"]')
            if play_button.count() > 0:
                print("   ✅ 재생 버튼 발견 - 팟캐스트가 로드됨")
            else:
                print("   ⚠️ 재생 버튼 없음 - 팟캐스트 로드 실패")

            # 3. GET API 호출 결과 분석
            print("\n3️⃣  GET API 호출 분석")
            get_calls = [call for call in api_calls if call['method'] == 'GET' and 'generate' in call['url']]
            if get_calls:
                print(f"   ✅ GET 요청 {len(get_calls)}개 발견")
                for call in get_calls:
                    print(f"      - {call['url']}")
            else:
                print("   ⚠️ GET 요청 없음 - API 호출이 발생하지 않음")

            # 4. 콘솔 에러 확인
            print("\n4️⃣  콘솔 에러 확인")
            error_logs = [log for log in console_logs if 'error' in log.lower() or '❌' in log]
            if error_logs:
                print(f"   ⚠️ {len(error_logs)}개 에러 발견:")
                for log in error_logs[:10]:  # 최대 10개만 출력
                    print(f"      {log}")
            else:
                print("   ✅ 콘솔 에러 없음")

            # 5. 중요 로그 추출
            print("\n5️⃣  중요 로그 추출 (DB 조회 관련)")
            db_logs = [log for log in console_logs if '세그먼트' in log or 'DB' in log or 'episode' in log.lower()]
            if db_logs:
                print(f"   📊 DB 관련 로그 {len(db_logs)}개:")
                for log in db_logs[:15]:
                    print(f"      {log}")

            # 6. 페이지 HTML 구조 확인
            print("\n6️⃣  페이지 HTML 구조 확인")

            # 에러 메시지가 있는지 확인
            error_elements = page.locator('text=/실패|오류|에러|Error/i').all()
            if error_elements:
                print(f"   ⚠️ 에러 메시지 발견: {len(error_elements)}개")
                for elem in error_elements[:3]:
                    try:
                        print(f"      - {elem.text_content()[:100]}")
                    except:
                        pass

            # 로딩 중 표시가 있는지 확인
            loading_elements = page.locator('text=/생성 중|로딩|Loading/i').all()
            if loading_elements:
                print(f"   🔄 로딩 표시 발견: {len(loading_elements)}개")

            # 7. 추가 대기 후 재확인
            print("\n7️⃣  5초 대기 후 상태 재확인...")
            time.sleep(5)

            page.screenshot(path='C:/GUIDEAI/test-podcast-after-wait.png', full_page=True)
            print("   📸 대기 후 스크린샷 저장: test-podcast-after-wait.png")

            # 최종 상태 확인
            final_play_button = page.locator('button[aria-label*="play"], button[aria-label*="재생"]')
            if final_play_button.count() > 0:
                print("   ✅ 최종 확인: 재생 버튼 존재 - 팟캐스트 로드 성공")
            else:
                final_generate_button = page.locator('button:has-text("생성")')
                if final_generate_button.count() > 0:
                    print("   ⚠️ 최종 확인: 여전히 생성 버튼만 존재 - 조회 실패 의심")
                else:
                    print("   ⚠️ 최종 확인: 알 수 없는 상태")

            # 8. API 호출 요약
            print("\n8️⃣  API 호출 요약")
            print(f"   총 API 호출: {len(api_calls)}개")
            for call in api_calls:
                print(f"      - {call['method']} {call['url']}")

            print("\n" + "="*60)
            print("🎯 진단 완료")
            print("="*60)

            # 결과 저장
            result = {
                'test_location': test_location,
                'test_language': test_language,
                'api_calls': api_calls,
                'console_errors': error_logs,
                'db_logs': db_logs,
                'has_play_button': final_play_button.count() > 0,
                'has_generate_button': page.locator('button:has-text("생성")').count() > 0
            }

            with open('C:/GUIDEAI/test-podcast-v2-result.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

            print("\n📊 결과 파일 저장: test-podcast-v2-result.json")

        except Exception as e:
            print(f"\n❌ 테스트 중 오류 발생: {e}")
            page.screenshot(path='C:/GUIDEAI/test-podcast-error.png', full_page=True)
            print("   📸 에러 스크린샷 저장: test-podcast-error.png")
            raise

        finally:
            browser.close()
            print("\n🔚 브라우저 종료")

if __name__ == "__main__":
    test_podcast_generation()
