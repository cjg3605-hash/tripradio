#!/usr/bin/env python3
"""
TripRadio.shop Production Website Test Suite
Tests main user flows on the deployed production site
"""

import asyncio
from playwright.sync_api import sync_playwright, expect
from datetime import datetime

class TripRadioTestSuite:
    def __init__(self, base_url="https://tripradio.shop"):
        self.base_url = base_url
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "summary": {}
        }

    def log_result(self, test_name, status, details=""):
        """Log test result"""
        result = {
            "name": test_name,
            "status": status,
            "details": details
        }
        self.results["tests"].append(result)
        print(f"\n{'='*60}")
        print(f"TEST: {test_name}")
        print(f"STATUS: {status}")
        if details:
            print(f"DETAILS: {details}")
        print(f"{'='*60}")

    def run_all_tests(self):
        """Execute all test scenarios"""
        print(f"🚀 Starting TripRadio.shop Test Suite")
        print(f"Target: {self.base_url}")
        print(f"Time: {datetime.now()}\n")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            try:
                # Test 1: Homepage Load & Rendering
                self.test_homepage_load(browser)

                # Test 2: Homepage Elements
                self.test_homepage_elements(browser)

                # Test 3: Search Functionality
                self.test_search_functionality(browser)

                # Test 4: Guide Page Navigation
                self.test_guide_page(browser)

                # Test 5: Podcast Page Navigation
                self.test_podcast_page(browser)

                # Test 6: Multi-language Support
                self.test_multilanguage_support(browser)

                # Test 7: AdSense Elements
                self.test_adsense_elements(browser)

                # Test 8: Mobile Responsiveness
                self.test_mobile_responsiveness(browser)

                # Test 9: Navigation Menu
                self.test_navigation_menu(browser)

                # Test 10: SEO Elements
                self.test_seo_elements(browser)

            finally:
                browser.close()

        self.print_summary()

    def test_homepage_load(self, browser):
        """Test 1: Homepage loads successfully"""
        try:
            page = browser.new_page()
            response = page.goto(self.base_url, wait_until="networkidle")

            if response and response.status == 200:
                # Take screenshot
                page.screenshot(path="/tmp/tripradio-homepage.png", full_page=True)
                self.log_result(
                    "Homepage Load",
                    "✅ PASS",
                    f"Status: {response.status}, URL: {page.url}"
                )
            else:
                self.log_result(
                    "Homepage Load",
                    "❌ FAIL",
                    f"Status: {response.status if response else 'No response'}"
                )
            page.close()
        except Exception as e:
            self.log_result("Homepage Load", "❌ FAIL", str(e))

    def test_homepage_elements(self, browser):
        """Test 2: Key homepage elements exist"""
        try:
            page = browser.new_page()
            page.goto(self.base_url, wait_until="networkidle")

            elements_to_check = {
                "Search Box": "input[placeholder*='location'], input[placeholder*='검색'], input[type='search']",
                "Navigation Menu": "nav, [role='navigation']",
                "Featured Content": "[class*='featured'], [class*='popular'], [class*='hero']",
                "Footer": "footer, [role='contentinfo']"
            }

            found_elements = {}
            for name, selector in elements_to_check.items():
                try:
                    element = page.locator(selector).first
                    if element.is_visible():
                        found_elements[name] = "✅ Found"
                    else:
                        found_elements[name] = "⚠️ Found but hidden"
                except:
                    found_elements[name] = "❌ Not found"

            all_found = all("✅" in v for v in found_elements.values())
            status = "✅ PASS" if all_found else "⚠️ PARTIAL"

            self.log_result(
                "Homepage Elements",
                status,
                "\n".join(f"{k}: {v}" for k, v in found_elements.items())
            )
            page.close()
        except Exception as e:
            self.log_result("Homepage Elements", "❌ FAIL", str(e))

    def test_search_functionality(self, browser):
        """Test 3: Search functionality works"""
        try:
            page = browser.new_page()
            page.goto(self.base_url, wait_until="networkidle")

            # Find and click search box
            search_selectors = [
                "input[placeholder*='location']",
                "input[placeholder*='검색']",
                "input[type='search']",
                "input[placeholder*='Search']"
            ]

            search_found = False
            for selector in search_selectors:
                try:
                    search_box = page.locator(selector).first
                    if search_box.is_visible():
                        search_found = True
                        search_box.click()
                        search_box.type("Eiffel Tower")
                        page.wait_for_timeout(1000)

                        # Take screenshot of search results
                        page.screenshot(path="/tmp/tripradio-search.png", full_page=True)

                        self.log_result(
                            "Search Functionality",
                            "✅ PASS",
                            "Successfully typed 'Eiffel Tower' in search box"
                        )
                        break
                except:
                    continue

            if not search_found:
                self.log_result("Search Functionality", "⚠️ PARTIAL", "Search box not found or not accessible")

            page.close()
        except Exception as e:
            self.log_result("Search Functionality", "❌ FAIL", str(e))

    def test_guide_page(self, browser):
        """Test 4: Guide page navigation and rendering"""
        try:
            page = browser.new_page()

            # Test guide page with a common location
            guide_url = f"{self.base_url}/guide/en/eiffel-tower"
            response = page.goto(guide_url, wait_until="networkidle")

            if response and response.status == 200:
                # Check for guide content
                page.screenshot(path="/tmp/tripradio-guide.png", full_page=True)

                # Check for map and description
                has_content = page.locator("[class*='guide'], article, [role='article']").count() > 0

                status = "✅ PASS" if has_content else "⚠️ PARTIAL"
                self.log_result(
                    "Guide Page Navigation",
                    status,
                    f"Guide page loaded at {guide_url}, Status: {response.status}"
                )
            else:
                self.log_result(
                    "Guide Page Navigation",
                    "❌ FAIL",
                    f"Failed to load guide page, Status: {response.status if response else 'No response'}"
                )
            page.close()
        except Exception as e:
            self.log_result("Guide Page Navigation", "❌ FAIL", str(e))

    def test_podcast_page(self, browser):
        """Test 5: Podcast page and audio player"""
        try:
            page = browser.new_page()

            # Test podcast page
            podcast_url = f"{self.base_url}/podcast/en/eiffel-tower"
            response = page.goto(podcast_url, wait_until="networkidle")

            if response and response.status == 200:
                page.screenshot(path="/tmp/tripradio-podcast.png", full_page=True)

                # Look for audio player
                audio_player_selectors = [
                    "audio",
                    "[role='region'][aria-label*='audio']",
                    "[class*='player']",
                    "button[aria-label*='play'], button[aria-label*='Play']"
                ]

                player_found = False
                for selector in audio_player_selectors:
                    if page.locator(selector).count() > 0:
                        player_found = True
                        break

                status = "✅ PASS" if player_found else "⚠️ PARTIAL"
                self.log_result(
                    "Podcast Page & Audio Player",
                    status,
                    f"Podcast page loaded at {podcast_url}, Audio player found: {player_found}"
                )
            else:
                self.log_result(
                    "Podcast Page & Audio Player",
                    "❌ FAIL",
                    f"Failed to load podcast page, Status: {response.status if response else 'No response'}"
                )
            page.close()
        except Exception as e:
            self.log_result("Podcast Page & Audio Player", "❌ FAIL", str(e))

    def test_multilanguage_support(self, browser):
        """Test 6: Multi-language support (ko, en, ja, zh, es)"""
        try:
            languages = ["ko", "en", "ja", "zh", "es"]
            location = "eiffel-tower"
            results = {}

            for lang in languages:
                try:
                    page = browser.new_page()
                    guide_url = f"{self.base_url}/guide/{lang}/{location}"
                    response = page.goto(guide_url, wait_until="networkidle", timeout=5000)

                    if response and response.status == 200:
                        results[lang] = "✅ Loaded"
                    else:
                        results[lang] = f"❌ Status {response.status if response else 'error'}"
                    page.close()
                except:
                    results[lang] = "❌ Failed"

            all_passed = all("✅" in v for v in results.values())
            status = "✅ PASS" if all_passed else "⚠️ PARTIAL"

            self.log_result(
                "Multi-language Support",
                status,
                "\n".join(f"{k}: {v}" for k, v in results.items())
            )
        except Exception as e:
            self.log_result("Multi-language Support", "❌ FAIL", str(e))

    def test_adsense_elements(self, browser):
        """Test 7: AdSense elements are present"""
        try:
            page = browser.new_page()
            page.goto(self.base_url, wait_until="networkidle")

            # Check for AdSense script and elements
            adsense_checks = {
                "AdSense Script": page.locator("script[src*='adsbygoogle']").count() > 0,
                "Ad Container": page.locator("[class*='adsbygoogle']").count() > 0,
                "Google Ads Meta": page.locator("meta[name='google-adsense-account']").count() > 0
            }

            found_ads = sum(1 for v in adsense_checks.values() if v)

            details = "\n".join(f"{k}: {'✅ Found' if v else '❌ Not found'}" for k, v in adsense_checks.items())
            status = "✅ PASS" if found_ads >= 1 else "⚠️ No AdSense elements"

            self.log_result(
                "AdSense Integration",
                status,
                details
            )
            page.close()
        except Exception as e:
            self.log_result("AdSense Integration", "❌ FAIL", str(e))

    def test_mobile_responsiveness(self, browser):
        """Test 8: Mobile responsiveness"""
        try:
            page = browser.new_page(viewport={"width": 375, "height": 667})
            page.goto(self.base_url, wait_until="networkidle")

            page.screenshot(path="/tmp/tripradio-mobile.png", full_page=True)

            # Check viewport meta tag
            viewport_meta = page.locator("meta[name='viewport']").count()
            has_responsive = viewport_meta > 0

            self.log_result(
                "Mobile Responsiveness",
                "✅ PASS" if has_responsive else "⚠️ PARTIAL",
                f"Mobile viewport: {375}x667px, Viewport meta tag: {'✅ Present' if has_responsive else '❌ Missing'}"
            )
            page.close()
        except Exception as e:
            self.log_result("Mobile Responsiveness", "❌ FAIL", str(e))

    def test_navigation_menu(self, browser):
        """Test 9: Navigation menu functionality"""
        try:
            page = browser.new_page()
            page.goto(self.base_url, wait_until="networkidle")

            # Check for major navigation links
            nav_links = {
                "Guide": f"{self.base_url}/guide",
                "Podcast": f"{self.base_url}/podcast",
                "About": f"{self.base_url}/about"
            }

            navigation_results = {}
            for name, url in nav_links.items():
                try:
                    link = page.locator(f"a[href='{url}'], a[href*='{url.split('/')[-1]}']").first
                    if link.is_visible():
                        navigation_results[name] = "✅ Visible"
                    else:
                        navigation_results[name] = "⚠️ Exists but hidden"
                except:
                    navigation_results[name] = "❌ Not found"

            status = "✅ PASS" if any("✅" in v for v in navigation_results.values()) else "⚠️ PARTIAL"

            self.log_result(
                "Navigation Menu",
                status,
                "\n".join(f"{k}: {v}" for k, v in navigation_results.items())
            )
            page.close()
        except Exception as e:
            self.log_result("Navigation Menu", "❌ FAIL", str(e))

    def test_seo_elements(self, browser):
        """Test 10: SEO elements"""
        try:
            page = browser.new_page()
            page.goto(self.base_url, wait_until="networkidle")

            seo_checks = {
                "Meta Description": page.locator("meta[name='description']").count() > 0,
                "Meta OG Tags": page.locator("meta[property*='og:']").count() > 0,
                "Canonical URL": page.locator("link[rel='canonical']").count() > 0,
                "H1 Tag": page.locator("h1").count() > 0,
                "Robots Meta": page.locator("meta[name='robots']").count() > 0,
                "Structured Data": page.locator("script[type='application/ld+json']").count() > 0
            }

            found_seo = sum(1 for v in seo_checks.values() if v)

            details = "\n".join(f"{k}: {'✅ Present' if v else '❌ Missing'}" for k, v in seo_checks.items())
            status = "✅ PASS" if found_seo >= 4 else "⚠️ PARTIAL"

            self.log_result(
                "SEO Elements",
                status,
                f"Found {found_seo}/{len(seo_checks)} SEO elements\n{details}"
            )
            page.close()
        except Exception as e:
            self.log_result("SEO Elements", "❌ FAIL", str(e))

    def print_summary(self):
        """Print test summary"""
        print(f"\n\n{'='*60}")
        print("📊 TEST SUMMARY")
        print(f"{'='*60}\n")

        total_tests = len(self.results["tests"])
        passed = sum(1 for t in self.results["tests"] if "✅ PASS" in t["status"])
        partial = sum(1 for t in self.results["tests"] if "⚠️" in t["status"])
        failed = sum(1 for t in self.results["tests"] if "❌ FAIL" in t["status"])

        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed:  {passed}")
        print(f"⚠️  Partial: {partial}")
        print(f"❌ Failed:  {failed}")
        print(f"\nSuccess Rate: {(passed/total_tests)*100:.1f}%")

        print(f"\n📸 Screenshots saved to /tmp/:")
        print("  - tripradio-homepage.png")
        print("  - tripradio-search.png")
        print("  - tripradio-guide.png")
        print("  - tripradio-podcast.png")
        print("  - tripradio-mobile.png")

        print(f"\n{'='*60}\n")


if __name__ == "__main__":
    suite = TripRadioTestSuite()
    suite.run_all_tests()
