# Minimal · Modern · Monochrome — Apple HIG Enhanced Style Guide

## 1. 디자인 철학
- **Minimal**: 불필요한 장식 배제, 필수 요소만 배치.
- **Modern**: 깔끔한 타이포그래피, 반응형 레이아웃, 여백 중심의 디자인.
- **Monochrome**: 흑백과 그레이스케일 기반, 포인트 컬러 최소화.
- **Apple HIG 반영**: 직관성, 일관성, 깊이감 있는 간결함.

---

## 2. 디자인 토큰 (Design Tokens)
```json
{
  "color.bg": "#FFFFFF",
  "color.bg-secondary": "#F8F8F8",
  "color.text": "#000000",
  "color.text-secondary": "#555555",
  "color.accent": "#007AFF",
  "color.border": "#E5E5E5",
  "color.error": "#FF3B30",

  "spacing.xs": "4px",
  "spacing.sm": "8px",
  "spacing.md": "16px",
  "spacing.lg": "24px",
  "spacing.xl": "40px",

  "font.family": "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
  "font.heading-weight": "600",
  "font.body-weight": "400",
  "font.caption-weight": "300",

  "radius.sm": "4px",
  "radius.md": "8px",
  "radius.lg": "12px",

  "shadow.sm": "0 1px 3px rgba(0,0,0,0.1)",
  "shadow.md": "0 4px 6px rgba(0,0,0,0.1)",
  "shadow.lg": "0 10px 20px rgba(0,0,0,0.15)"
}
```

---

## 3. 타이포그래피 시스템
- **Base font size**: 16px
- **Responsive scaling**: `clamp()` 활용
- **Line length**: 본문 65~75자, 모바일 35~45자
- **Weights**: Heading(600–700), Body(400), Caption(300–400)
- **Apple HIG 스타일**:
  - 여백을 통한 계층 구조 전달
  - Heading과 Body의 대비 명확
  - 부드러운 줄 간격(Line-height: 1.5~1.6)

---

## 4. 그리드 & 레이아웃
- **12-column grid**
- **Gutter**: 16px (모바일), 24px (데스크톱)
- **Breakpoints**:  
  - sm ≤640px  
  - md ≤1024px  
  - lg ≤1440px  
  - xl ≥1440px
- Apple HIG 권장: 레이아웃 요소 간 여백을 넓게 두고, 시각적 호흡 제공.

---

## 5. UI 컴포넌트 스타일

### 버튼
```css
.btn {
  font-family: var(--font-family);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: background-color 0.2s ease-in-out;
}
.btn--primary {
  background-color: var(--color-accent);
  color: white;
}
.btn--primary:hover {
  background-color: #005FCC;
}
.btn--secondary {
  background-color: var(--color.bg-secondary);
  color: var(--color.text);
}
```

### 카드
- 모서리 둥글게, 그림자 최소.
- 내부 여백 넉넉히 (`spacing.lg`).

### 표
- 행 간격 넓게.
- 헤더는 반투명 회색 배경.
- 모바일에서는 카드 형태로 변환.

### 폼 & 입력창
- Border: `1px solid var(--color-border)`
- Focus 시 Accent 색상 적용.
- Placeholder 색은 연한 회색.

### 모달
- Fade-in + scale-up (0.3s)
- 바디 스크롤 잠금

### 알림 배너
- 색상 대비 확실히
- 닫기 버튼은 우측 상단에 고정

---

## 6. 상태 규칙
- Hover: 미묘한 색상·그림자 변화
- Focus: 시각적 테두리 강조
- Disabled: 투명도 0.4 + 커서 기본

---

## 7. 이미지 & 미디어
- Aspect ratio 유지
- Lazy loading
- SVG 아이콘 우선
- Apple HIG 반영: 이미지와 텍스트의 비율 조화

---

## 8. 다크모드 대응
- 배경: #121212
- 텍스트: #EAEAEA
- Border: #333333

---

## 9. 애니메이션 & 인터랙션
- 버튼 hover: 0.2s ease-in-out
- 모달 등장: 0.3s fade + scale
- 페이지 전환: 0.3s fade
- Apple HIG 스타일: 자연스럽고 방해되지 않는 전환

---

## 10. 페이지 제작 체크리스트
- [ ] 시맨틱 태그 사용
- [ ] 이미지 alt 태그 필수
- [ ] 모바일 가독성 테스트
- [ ] 웹폰트 최적화 (`font-display: swap`)
- [ ] 다국어 줄바꿈 테스트
- [ ] 폼 에러 메시지 시각 + 텍스트 제공

---

## 11. AI 프롬프트 (페이지 생성 명령)
```
다음 스타일 가이드를 준수하여 HTML/CSS를 생성하라.
스타일은 미니멀·모던·모노크롬 기반이며 Apple HIG 원칙을 반영한다.
모든 컴포넌트는 디자인 토큰과 반응형 규칙을 따른다.
타이포, 여백, 인터랙션, 접근성을 포함하고
버튼, 카드, 표, 폼, 모달, 알림배너 예시를 동일한 스타일로 구현한다.

- 모든 CSS 값은 반드시 상단에 정의된 디자인 토큰을 var(--token-name) 형태로 호출한다.
- HTML 마크업 구조는 각 컴포넌트별 표준 예시를 그대로 따른다.
- 여백, 폰트 크기, 라인 높이는 px 단위로 구체적으로 지정하며 Apple HIG 철학에 맞춘다.
- 반응형은 Mobile-first 방식으로 구현하고, 지정한 브레이크포인트에서만 스타일을 변경한다.
- 다크모드는 prefers-color-scheme: dark 미디어쿼리로 구현한다.
- 스타일과 컴포넌트 명명법은 BEM 규칙을 따른다.

```
```