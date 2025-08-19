export function Footer() {
  const footerSections = [
    {
      title: "주요 서비스",
      links: [
        "오디오가이드",
        "AI 도슨트",
        "투어라디오",
        "여행라디오"
      ]
    },
    {
      title: "여행 도구",
      links: [
        "AI 여행 계획",
        "노마드 계산기",
        "영화 촬영지",
        "비자 체커"
      ]
    },
    {
      title: "법적 정보",
      links: [
        "개인정보 처리방침",
        "이용약관",
        "서비스 소개",
        "문의하기"
      ]
    },
    {
      title: "고객지원",
      links: [
        "텔레그램 채널",
        "지원시간: 평일 9시-18시"
      ]
    }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <h3 className="text-xl font-bold text-black">TripRadio.AI</h3>
            </div>
            <p className="text-gray-600 mb-4 max-w-sm">
              AI 기반 개인화 여행 가이드 서비스
            </p>
            <p className="text-sm text-gray-500">
              © 2024 TripRadio.AI. All rights reserved.
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h4 className="font-semibold text-black mb-4 text-sm uppercase tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-black transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-black transition-colors">
                광고 수익 공지
              </a>
              <a href="#" className="hover:text-black transition-colors underline">
                개인정보 처리방침
              </a>
              <span>AdSense 정책</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}