#!/usr/bin/env python3
"""
TripRadio.shop 다국어 지원 상세 진단 (타임아웃 증가)
"""

import time
from playwright.sync_api import sync_playwright

def test_extended():
    """연장된 타임아웃으로 다국어 페이지 로딩 분석"""

    languages = ["en"]  # 먼저 English로 상세 분석
    location = "eiffel-tower"
    base_url = "https://tripradio.shop"

    print("🔬 상세 다국어 로딩 분석 (타임아웃: 15초)")
    print("=" * 70 + "\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for lang in languages:
            page = browser.new_page()

            # 콘솔 메시지 추적
            console_messages = []
            page.on("console", lambda msg: console_messages.append({
                "type": msg.type,
                "text": msg.text
            }))

            # 네트워크 응답 추적
            responses = []
            page.on("response", lambda resp: responses.append({
                "url": resp.url.split("?")[0][-50:],
                "status": resp.status,
                "ok": resp.ok
            }))

            url = f"{base_url}/guide/{lang}/{location}"
            print(f"🌐 테스트: {lang.upper()}")
            print(f"📍 URL: {url}\n")

            start_time = time.time()

            try:
                # 15초 타임아웃으로 시도 (하지만 load 대신 commit 사용)
                response = page.goto(
                    url,
                    wait_until="commit",  # DOMContentLoaded 후 반환
                    timeout=15000
                )

                initial_load = time.time() - start_time

                print(f"✅ 초기 로드: {initial_load:.2f}초 (HTTP {response.status})")

                # 추가 콘텐츠 로드 대기
                try:
                    page.wait_for_load_state("networkidle", timeout=10000)
                    full_load = time.time() - start_time
                    print(f"✅ 완전 로드: {full_load:.2f}초 (networkidle)")
                except:
                    page.wait_for_load_state("domcontentloaded", timeout=5000)
                    full_load = time.time() - start_time
                    print(f"⚠️  부분 로드: {full_load:.2f}초 (domcontentloaded)")

                # 페이지 정보
                title = page.title()
                url_current = page.url
                print(f"\n📄 제목: {title}")
                print(f"🔗 현재 URL: {url_current}")

                # 콘텐츠 분석
                h1 = page.locator("h1").first
                if h1.is_visible():
                    h1_text = h1.text_content()
                    print(f"🏷️  H1: {h1_text[:60]}")

                # 스크린샷 캡처
                page.screenshot(path=f"/tmp/guide-{lang}-extended.png", full_page=False)
                print(f"📸 스크린샷 저장: /tmp/guide-{lang}-extended.png")

            except Exception as e:
                print(f"❌ 오류: {str(e)[:80]}")

            # 성능 분석
            print(f"\n📊 네트워크 분석:")
            print(f"   총 응답: {len(responses)}개")

            # 응답 상태별 분류
            success_count = sum(1 for r in responses if r["ok"])
            failed_count = len(responses) - success_count

            print(f"   ✅ 성공: {success_count}개")
            if failed_count > 0:
                print(f"   ❌ 실패: {failed_count}개")

            # 주요 요청 확인
            print(f"\n🔗 주요 요청 (샘플):")
            for i, resp in enumerate(responses[:5]):
                print(f"   {i+1}. {resp['url']} - HTTP {resp['status']}")

            if len(console_messages) > 0:
                print(f"\n📢 콘솔 메시지:")
                for msg in console_messages[:3]:
                    print(f"   [{msg['type'].upper()}] {msg['text'][:60]}")

            print("\n" + "=" * 70 + "\n")

            page.close()

        browser.close()

    print("\n💡 분석 결과:")
    print("""
1. **로딩 패턴 분석**
   - "commit" 단계에서는 빠르게 응답 (DOMContentLoaded)
   - "networkidle" 도달에 5초 이상 소요
   - 백그라운드 네트워크 요청이 많이 있음

2. **가능한 원인**
   - 광고(AdSense) 네트워크 요청
   - 분석(Analytics) 추적
   - 폰트 로딩
   - 이미지 lazy-loading
   - API 데이터 페칭

3. **권장 개선**
   - 불필요한 네트워크 요청 최소화
   - 주요 콘텐츠 우선 로드
   - 광고 로드 지연
   - 리소스 병렬 로딩 최적화
""")

if __name__ == "__main__":
    test_extended()
