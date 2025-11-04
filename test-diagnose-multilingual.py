#!/usr/bin/env python3
"""
TripRadio.shop 다국어 지원 진단 및 성능 분석
각 언어별 페이지 로딩 시간과 네트워크 요청 분석
"""

import time
from playwright.sync_api import sync_playwright

def test_multilingual_performance():
    """다국어 페이지 성능 및 로딩 분석"""

    languages = ["ko", "en", "ja", "zh", "es"]
    location = "eiffel-tower"
    base_url = "https://tripradio.shop"

    print("🌐 TripRadio.shop 다국어 성능 진단")
    print("=" * 70)
    print(f"\n테스트 대상: /guide/[language]/{location}\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        results = {
            "successful": [],
            "failed": [],
            "network_requests": {},
            "performance": {}
        }

        for lang in languages:
            print(f"\n🔍 테스트 중: {lang.upper()}")
            print("-" * 70)

            try:
                page = browser.new_page()

                # 네트워크 요청 추적
                requests = []
                page.on("request", lambda req: requests.append({
                    "url": req.url,
                    "method": req.method,
                    "resource_type": req.resource_type,
                    "timestamp": time.time()
                }))

                url = f"{base_url}/guide/{lang}/{location}"
                print(f"URL: {url}")

                # 성능 측정 시작
                start_time = time.time()

                try:
                    # 5초 타임아웃으로 먼저 시도
                    response = page.goto(url, wait_until="networkidle", timeout=5000)
                    load_time = time.time() - start_time

                    if response:
                        status = response.status
                        print(f"✅ 상태: {status}")
                        print(f"⏱️  로딩 시간: {load_time:.2f}초")
                        print(f"📡 네트워크 요청: {len(requests)}개")

                        # 페이지 콘텐츠 분석
                        title = page.title()
                        h1_count = page.locator("h1").count()

                        print(f"📄 페이지 제목: {title}")
                        print(f"🏷️  H1 태그: {h1_count}개")

                        results["successful"].append({
                            "language": lang,
                            "status": status,
                            "load_time": load_time,
                            "requests": len(requests)
                        })

                except Exception as e:
                    load_time = time.time() - start_time
                    print(f"⏱️  로딩 시간: {load_time:.2f}초 (타임아웃)")
                    print(f"❌ 오류: {str(e)[:100]}")

                    results["failed"].append({
                        "language": lang,
                        "error": str(e),
                        "load_time": load_time,
                        "requests": len(requests)
                    })

                results["network_requests"][lang] = len(requests)
                results["performance"][lang] = load_time

                page.close()

            except Exception as e:
                print(f"❌ 예상치 못한 오류: {str(e)}")

        browser.close()

    # 결과 출력
    print("\n\n" + "=" * 70)
    print("📊 진단 결과 요약")
    print("=" * 70)

    print(f"\n✅ 성공한 페이지: {len(results['successful'])}개")
    for result in results["successful"]:
        print(f"   {result['language'].upper()}: {result['load_time']:.2f}s (HTTP {result['status']})")

    print(f"\n❌ 실패한 페이지: {len(results['failed'])}개")
    for result in results["failed"]:
        print(f"   {result['language'].upper()}: {result['load_time']:.2f}s")

    print(f"\n📡 네트워크 요청 분석:")
    for lang, count in results["network_requests"].items():
        print(f"   {lang.upper()}: {count}개 요청")

    # 성능 비교
    print(f"\n⏱️  로딩 시간 비교:")
    sorted_perf = sorted(results["performance"].items(), key=lambda x: x[1])
    for lang, time_taken in sorted_perf:
        status = "✅" if time_taken < 5 else "⚠️" if time_taken < 10 else "❌"
        print(f"   {status} {lang.upper()}: {time_taken:.2f}초")

    # 권장사항
    print("\n" + "=" * 70)
    print("🔧 진단 및 권장사항")
    print("=" * 70)

    if len(results["failed"]) > 0:
        print("\n⚠️  **다국어 페이지 로딩 지연 감지됨**")
        print("\n원인 분석:")
        print("1. 서버 응답 시간 지연 (일부 언어별 데이터 조회 느림)")
        print("2. 국제화(i18n) 처리 성능 문제")
        print("3. 데이터베이스 쿼리 최적화 필요")

        print("\n📋 개선 방안:")
        print("1. 각 언어별 페이지 캐싱 전략 수립")
        print("2. Supabase 쿼리 성능 프로파일링")
        print("3. location_names JSONB 필드 인덱싱 확인")
        print("4. CDN 캐싱 레이어 추가")
        print("5. 동적 라우팅 페이지 정적 생성 (ISR) 고려")

    else:
        print("\n✅ **모든 다국어 페이지 정상 로딩**")

    # 성능 개선 점수
    avg_time = sum(results["performance"].values()) / len(results["performance"])
    print(f"\n평균 로딩 시간: {avg_time:.2f}초")

    if avg_time < 2:
        print("🚀 성능 등급: **EXCELLENT** (평균 2초 이하)")
    elif avg_time < 4:
        print("✅ 성능 등급: **GOOD** (평균 4초 이하)")
    elif avg_time < 6:
        print("⚠️  성능 등급: **FAIR** (평균 6초 이하)")
    else:
        print("❌ 성능 등급: **POOR** (평균 6초 초과)")

    print("\n" + "=" * 70)

if __name__ == "__main__":
    test_multilingual_performance()
