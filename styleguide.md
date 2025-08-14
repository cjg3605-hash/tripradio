# Minimal · Modern · Monochrome — Unified Style Guide (Apple HIG Ultra-Detailed v2.0)

> 목적: AI/개발/디자인이 **누락 없이 동일한 룩앤필**을 재현하도록 모든 결정을 수치·토큰·규칙으로 명시한다.

---

## 0. 적용 원칙 (계약)
- **토큰 우선**: 색/폰트/간격/그림자 등 모든 값은 **디자인 토큰 var(--*)만** 사용. 하드코딩 금지.
- **모바일 퍼스트**: 기본은 Mobile, 이후 Tablet/ Desktop에서 점진적 향상.
- **접근성**: WCAG 2.2 **AA 이상**. 텍스트 대비 4.5:1+, 큰 텍스트 3:1+.
- **일관 네이밍**: BEM — `.block__element--modifier` (전부 소문자, 하이픈 사용).
- **감소된 모션 존중**: `prefers-reduced-motion: reduce` 시 모든 애니메이션 비활성화/축소.
- **국제화/RTL**: `dir="rtl"` 지원. 아이콘/정렬/내비게이션 역방향 검증.
- **성능 목표**: LCP < 2.5s, CLS < 0.1, INP < 200ms, CSS < 60KB (gzip), JS < 200KB (gzip).

---

## 1. 디자인 토큰 (Design Tokens)

### 1.1 CSS Custom Properties (출고본)
```css
:root {
  /* GREYSCALE (Monochrome ladder) */
  --gray-0: #ffffff;
  --gray-50: #f9f9f9;
  --gray-100: #f2f2f2;
  --gray-200: #e6e6e6;
  --gray-300: #d4d4d4;
  --gray-400: #a8a8a8;
  --gray-500: #7a7a7a;
  --gray-600: #555555;
  --gray-700: #333333;
  --gray-800: #1f1f1f;
  --gray-900: #0d0d0d;
  --gray-1000:#000000;

  /* ROLE COLORS (semantic uses) */
  --color-bg: var(--gray-0);
  --color-bg-alt: var(--gray-50);
  --color-surface: var(--gray-0);
  --color-border: var(--gray-200);

  --color-text-high: var(--gray-900);
  --color-text-medium: var(--gray-600);
  --color-text-low: rgba(0,0,0,.52);

  /* Interactive (모노톤) */
  --color-primary: var(--gray-1000);
  --color-primary-hover: #2b2b2b;
  --color-primary-active: #000000;
  --color-focus: #1a1a1a; /* outline */
  --color-danger: #d32f2f; /* 최소 포인트 컬러 */
  --color-danger-bg: #fbe9e9;

  /* Overlays & Scrims */
  --overlay-weak: rgba(0,0,0,.04);
  --overlay: rgba(0,0,0,.08);
  --scrim: rgba(0,0,0,.48);
  --backdrop-blur: 8px;

  /* TYPOGRAPHY */
  --font-family-base: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;

  /* Type ramp (desktop/tablet/mobile) */
  --fs-h1-d: 40px; --fs-h1-t: 34px; --fs-h1-m: 28px;
  --fs-h2-d: 32px; --fs-h2-t: 28px; --fs-h2-m: 24px;
  --fs-h3-d: 24px; --fs-h3-t: 22px; --fs-h3-m: 20px;
  --fs-h4-d: 20px; --fs-h4-t: 18px; --fs-h4-m: 18px;
  --fs-h5-d: 18px; --fs-h5-t: 16px; --fs-h5-m: 16px;
  --fs-h6-d: 16px; --fs-h6-t: 15px; --fs-h6-m: 15px;

  --fs-body-l-d: 18px; --fs-body-l-t: 18px; --fs-body-l-m: 16px;
  --fs-body-d: 16px;    --fs-body-t: 16px;    --fs-body-m: 14px;
  --fs-body-s-d: 14px;  --fs-body-s-t: 14px;  --fs-body-s-m: 13px;
  --fs-caption: 12px; --fs-overline: 11px;

  --lh-heading: 1.2;
  --lh-body: 1.5;

  /* SPACING (4px base) */
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;

  /* Radius & Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --border-hairline: 0.5px; /* retina hairline */
  --border-thin: 1px;

  /* Shadows & Elevation */
  --shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 4px 10px rgba(0,0,0,.08);
  --shadow-lg: 0 12px 24px rgba(0,0,0,.12);
  --elev-1: 10;
  --elev-2: 20;
  --elev-3: 30;
  --elev-overlay: 1000;

  /* Motion */
  --ease-standard: cubic-bezier(.4,0,.2,1);
  --ease-emphasized: cubic-bezier(.2,0,0,1);
  --dur-fast: 120ms;
  --dur-md: 200ms;
  --dur-slow: 300ms;
  --motion-distance: 8px;

  /* Opacity */
  --opacity-disabled: .48;
  --opacity-muted: .64;

  /* Container widths */
  --container-sm: 640px;
  --container-md: 960px;
  --container-lg: 1200px;
}

/* Dark Mode mapping */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: var(--gray-1000);
    --color-bg-alt: var(--gray-900);
    --color-surface: var(--gray-900);
    --color-border: #3a3a3a;

    --color-text-high: #fafafa;
    --color-text-medium: #bbbbbb;
    --color-text-low: rgba(255,255,255,.54);

    --color-primary: #ffffff;
    --color-primary-hover: #e5e5e5;
    --color-primary-active: #ffffff;
    --color-focus: #ffffff;

    --overlay-weak: rgba(255,255,255,.06);
    --overlay: rgba(255,255,255,.12);
    --scrim: rgba(0,0,0,.6);
  }
}
```

### 1.2 토큰 명명 규칙
- **palette**: `--gray-N` (0–1000, 밝음→어두움)
- **role**: `--color-*` (text, bg, border, primary, focus…)
- **type**: `--fs-*`, `--lh-*`
- **space**: `--space-*` (2xs~2xl)
- **elevation**: `--shadow-*`, `--elev-*`
- **변경 관리**: 토큰 변경 시 **minor** 버전 업, 삭제 시 **deprecated-*** 프리픽스 후 한 릴리즈 유지.

---

## 2. 반응형 그리드 & 레이아웃

### 2.1 Breakpoints
- **Mobile**: ≤ 640px  
- **Tablet**: 641–1024px  
- **Desktop**: ≥ 1025px

### 2.2 컨테이너 & 컬럼
- 12-column grid, **gutter**: `var(--space-lg)`  
- 컨테이너 최대폭: Mobile fluid, Tablet `--container-md`, Desktop `--container-lg`  
- 좌우 패딩: Mobile 16px, Tablet 24px, Desktop 32px  
- **세이프 에어리어**: iOS notch 대응 `padding: env(safe-area-inset-*)`.

### 2.3 수직 리듬
- 기본 라인단위 4px 배수. 섹션 상/하 마진 = `var(--space-2xl)`.
- 인접 컴포넌트 간 기본 간격 = `var(--space-lg)`.

### 2.4 페이지 스켈레톤
```html
<header class="header">…</header>
<nav class="navbar">…</nav>
<main class="main container">…</main>
<footer class="footer">…</footer>
```
- `container`는 중앙 정렬 + 최대폭 + 양옆 패딩.

---

## 3. 타이포그래피 시스템

### 3.1 타입 램프 (Desktop / Tablet / Mobile)
| Level | D | T | M | Weight | LH | 용도 |
|---|---|---|---|---|---|---|
| H1 | 40 | 34 | 28 | 700 | 1.2 | 페이지 타이틀 |
| H2 | 32 | 28 | 24 | 700 | 1.3 | 섹션 타이틀 |
| H3 | 24 | 22 | 20 | 600 | 1.3 | 서브 타이틀 |
| H4 | 20 | 18 | 18 | 600 | 1.4 | 소제목 |
| H5 | 18 | 16 | 16 | 600 | 1.4 | 그룹 라벨 |
| H6 | 16 | 15 | 15 | 600 | 1.4 | 캡션 헤더 |
| Body L | 18 | 18 | 16 | 400 | 1.5 | 강조 본문 |
| Body | 16 | 16 | 14 | 400 | 1.5 | 일반 본문 |
| Body S | 14 | 14 | 13 | 400 | 1.5 | 힌트/라벨 |
| Caption | 12 | 12 | 12 | 400 | 1.4 | 메타 |
| Overline | 11 | 11 | 11 | 600 | 1.2 | 섹션 상단 보조 |

> 본문 최대 줄길이: **65–75ch**, 모바일 35–45ch.

### 3.2 구현 규칙 (CSS)
```css
html { font-family: var(--font-family-base); }
h1,h2,h3,h4,h5,h6 { color: var(--color-text-high); margin: 0 0 var(--space-md); }
p,li { color: var(--color-text-medium); }

h1{ font-size:var(--fs-h1-d); line-height:var(--lh-heading); font-weight:700; }
h2{ font-size:var(--fs-h2-d); line-height:1.3; font-weight:700; }
h3{ font-size:var(--fs-h3-d); line-height:1.3; font-weight:600; }
h4{ font-size:var(--fs-h4-d); line-height:1.4; font-weight:600; }
h5{ font-size:var(--fs-h5-d); line-height:1.4; font-weight:600; }
h6{ font-size:var(--fs-h6-d); line-height:1.4; font-weight:600; }

.body--l{ font-size:var(--fs-body-l-d); line-height:var(--lh-body); }
.body{ font-size:var(--fs-body-d); line-height:var(--lh-body); }
.body--s{ font-size:var(--fs-body-s-d); line-height:var(--lh-body); }
.caption{ font-size:var(--fs-caption); line-height:1.4; color:var(--color-text-low); }
.overline{ font-size:var(--fs-overline); text-transform:uppercase; letter-spacing:.04em; color:var(--color-text-medium); }

@media (max-width:1024px){
  h1{font-size:var(--fs-h1-t)} h2{font-size:var(--fs-h2-t)} h3{font-size:var(--fs-h3-t)}
  h4{font-size:var(--fs-h4-t)} h5{font-size:var(--fs-h5-t)} h6{font-size:var(--fs-h6-t)}
  .body--l{font-size:var(--fs-body-l-t)} .body{font-size:var(--fs-body-t)}
  .body--s{font-size:var(--fs-body-s-t)}
}
@media (max-width:640px){
  h1{font-size:var(--fs-h1-m)} h2{font-size:var(--fs-h2-m)} h3{font-size:var(--fs-h3-m)}
  h4{font-size:var(--fs-h4-m)} h5{font-size:var(--fs-h5-m)} h6{font-size:var(--fs-h6-m)}
  .body--l{font-size:var(--fs-body-l-m)} .body{font-size:var(--fs-body-m)}
  .body--s{font-size:var(--fs-body-s-m)}
}

/* 숫자 정렬 */
.num { font-variant-numeric: tabular-nums; }
```

### 3.3 중요도별 톤 규칙
- **Primary(주요)**: `--color-text-high`
- **Secondary(보조)**: `--color-text-medium`
- **Tertiary(부가)**: `--color-text-low`
- 링크: 기본 `--color-text-high` 밑줄 없음, hover 시 밑줄 표시.

---

## 4. 컴포넌트 간격·공백 (Spacing)

| 대상 | 내부 패딩 | 외부 간격(다음 요소) | 내부 요소 간격 |
|---|---|---|---|
| 버튼 그룹 | V 8px / H 16px | 그룹 간 16px | 아이콘↔라벨 8px |
| 카드 | 24px | 24px | 제목↔내용 16px, 내용↔CTA 24px |
| 테이블 | 셀 12px | 상하 40px | 열 간 16px |
| 폼 필드 | 12px | 16px | 레이블↔입력 8px, 에러 4px |
| 모달 | 40px | NA | 제목↔본문 24px, 본문↔버튼 40px |
| 알림 배너 | 16px | 아래 24px | 아이콘↔텍스트 8px |
| 섹션 | NA | 위·아래 64px | 타이틀↔내용 24px |

> 모바일(≤640px)에서는 모든 간격을 **한 단계 축소** (예: 24px→16px).

---

## 5. 아이콘 & 이미지

### 5.1 아이콘
- 유형: **라인 아이콘**, 스트로크 2px, 라운드 조인.
- 사이즈: 16 / 20 / 24 / 32px, **문서 기본 24px**.
- 색: 텍스트 중요도 단계와 동일 매핑.
- 간격: 텍스트와 8px.
- 접근성: 의미 전달 필수 시 `aria-hidden="true"` 제거 + 대체 텍스트 제공.

### 5.2 이미지/일러스트
- 비율: Hero 16:9, Thumb 1:1, Banner 3:1.
- 채도: **모노톤 유지**, 필요 시 1색 포인트만.
- CSS: `object-fit: cover; max-width:100%; height:auto;`
- `<img>`는 `loading="lazy"` + `decoding="async"`, `srcset`/`sizes` 제공.

---

## 6. 상태(States) & 인터랙션

### 6.1 공통
- Hover: 배경/텍스트 **10% 명암 변화** 또는 그림자 한 단계 증가.
- Active: `transform: scale(.98)` + 더 진한 톤.
- Focus: **2px 외곽선** `outline: 2px solid var(--color-focus); outline-offset: 2px;`
- Disabled: `opacity: var(--opacity-disabled); pointer-events: none;`

### 6.2 모션
- 허용 속성: **opacity, transform** 위주. layout/reflow 유발 속성 금지.
- 지속시간: 빠름 120ms, 보통 200ms, 느림 300ms.
- 이징: `--ease-standard`, 중요 강조 `--ease-emphasized`.
- `@media (prefers-reduced-motion: reduce)` → 모션 제거/즉시 상태 전환.

---

## 7. 핵심 컴포넌트 규격 (Markup + 규칙)

### 7.1 버튼 (Primary / Secondary / Ghost / Destructive)
```html
<button class="btn btn--primary" type="button">Label</button>
<button class="btn btn--secondary">Label</button>
<button class="btn btn--ghost">Label</button>
<button class="btn btn--danger" aria-describedby="delHelp">Delete</button>
<small id="delHelp" class="sr-only">Deletes item permanently</small>
```
```css
.btn{
  display:inline-flex; align-items:center; gap:var(--space-xs);
  padding:var(--space-xs) var(--space-md);
  border-radius:var(--radius-md);
  border: var(--border-thin) solid transparent;
  font-weight:600; font-size:var(--fs-h6-d); line-height:1.2;
  background: var(--color-primary); color: var(--color-bg);
  transition: background var(--dur-md) var(--ease-standard), transform var(--dur-fast);
}
.btn:hover{ background: var(--color-primary-hover); }
.btn:active{ background: var(--color-primary-active); transform: scale(.98); }
.btn:focus-visible{ outline:2px solid var(--color-focus); outline-offset:2px; }
.btn[disabled]{ opacity:var(--opacity-disabled); pointer-events:none; }

.btn--secondary{ background: var(--color-bg); color: var(--color-text-high); border-color: var(--color-border); }
.btn--ghost{ background: transparent; color: var(--color-text-high); border-color: transparent; }
.btn--danger{ background: var(--color-danger); color:#fff; }
```
- 접근성: `aria-pressed`(토글), `type` 명시, 아이콘 전용 버튼은 `aria-label` 필수.

### 7.2 텍스트 입력/선택
```html
<label class="field">
  <span class="field__label">Email</span>
  <input class="field__control" type="email" placeholder="you@example.com" aria-describedby="emailHelp">
  <small id="emailHelp" class="field__help">We'll never share your email.</small>
</label>
```
```css
.field{ display:block; margin-bottom:var(--space-md); }
.field__label{ display:block; margin-bottom:var(--space-xs); color:var(--color-text-medium); font-size:var(--fs-body-s-d); }
.field__control{
  width:100%; padding: var(--space-sm) var(--space-md);
  border: var(--border-thin) solid var(--color-border);
  border-radius: var(--radius-md); background: var(--color-bg);
  color: var(--color-text-high); font-size: var(--fs-body-d);
}
.field__control::placeholder{ color: var(--color-text-low); }
.field__control:focus{ outline:2px solid var(--color-focus); outline-offset:2px; }
.field--error .field__control{ border-color: var(--color-danger); background: var(--color-danger-bg); }
.field__help{ color: var(--color-text-low); margin-top: var(--space-2xs); }
.field__error{ color: var(--color-danger); margin-top: var(--space-2xs); font-size: var(--fs-body-s-d); }
```
- 검증: 오류 시 **텍스트 메시지+색상** 둘 다. `aria-invalid="true"` + `aria-describedby`로 오류 연결.

### 7.3 체크박스/라디오/스위치
- 키 입력: Space/Enter 토글, Tab 포커스.
- 최소 터치 타깃: **44×44px**.
- 라디오 그룹엔 `role="radiogroup"`+라벨 제공.

### 7.4 탭 (Tabs)
```html
<div class="tabs" role="tablist" aria-label="Content tabs">
  <button class="tabs__tab tabs__tab--active" role="tab" aria-selected="true" aria-controls="p1" id="t1">Overview</button>
  <button class="tabs__tab" role="tab" aria-selected="false" aria-controls="p2" id="t2">Details</button>
</div>
<section id="p1" role="tabpanel" aria-labelledby="t1">…</section>
<section id="p2" role="tabpanel" aria-labelledby="t2" hidden>…</section>
```
- 키보드: 좌/우 화살표로 탭 이동, Home/End 점프.

### 7.5 카드
```html
<article class="card">
  <h3 class="card__title">Title</h3>
  <p class="card__body body">…</p>
  <div class="card__actions"><button class="btn btn--secondary">Action</button></div>
</article>
```
```css
.card{ background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:var(--space-lg); box-shadow:var(--shadow-sm); }
.card__title{ margin:0 0 var(--space-md); }
.card__actions{ margin-top:var(--space-lg); display:flex; gap:var(--space-md); }
```

### 7.6 테이블 (반응형, 소팅)
- 좁은 뷰포트: **카드형 스택** 전환 권장.
```css
.table{ width:100%; border-collapse:collapse; }
.table th,.table td{ padding:var(--space-sm); border-bottom:1px solid var(--color-border); text-align:left; }
.table th{ color:var(--color-text-high); font-weight:600; }
@media (max-width:640px){
  .table{ display:block; }
  .table thead{ display:none; }
  .table tr{ display:block; border:1px solid var(--color-border); border-radius:var(--radius-md); margin-bottom:var(--space-md); }
  .table td{ display:flex; justify-content:space-between; gap:var(--space-md); }
  .table td::before{ content: attr(data-label); font-weight:600; color:var(--color-text-medium); }
}
```

### 7.7 모달/다이얼로그
```html
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modTitle">
  <div class="modal__overlay"></div>
  <div class="modal__panel">
    <h2 id="modTitle">Confirm</h2>
    <p class="body">Are you sure?</p>
    <div class="modal__actions">
      <button class="btn btn--secondary">Cancel</button>
      <button class="btn">Confirm</button>
    </div>
  </div>
</div>
```
```css
.modal{ position:fixed; inset:0; z-index:var(--elev-overlay); display:grid; place-items:center; }
.modal__overlay{ position:absolute; inset:0; background:var(--scrim); backdrop-filter: blur(var(--backdrop-blur)); }
.modal__panel{ position:relative; background:var(--color-surface); border:1px solid var(--color-border);
  border-radius:var(--radius-lg); padding:var(--space-xl); box-shadow:var(--shadow-lg); width:min(600px, 92vw); }
.modal__actions{ display:flex; gap:var(--space-md); justify-content:flex-end; margin-top:var(--space-xl); }
@media (prefers-reduced-motion:no-preference){ .modal__panel{ transform: translateY(8px); animation: modalIn var(--dur-slow) var(--ease-standard) forwards; } }
@keyframes modalIn{ to{ transform:none; opacity:1; } }
```
- 포커스 트랩 필수, ESC 닫기 허용, 열리면 첫 포커스 요소로 이동.

### 7.8 드롭다운/메뉴/툴팁/토스트/아코디언/페이지네이션
- 메뉴: `role="menu"`, 항목 `role="menuitem"`, Up/Down 이동.
- 툴팁: `aria-describedby`로 연결, hover/focus에만 표시.
- 토스트: 우상단, 그림자 `--shadow-md`, z-index `--elev-overlay`.
- 아코디언: 버튼은 `aria-expanded`, 패널 `aria-controls`/`hidden` 토글.
- 페이지네이션: 현재 페이지 `aria-current="page"`.

> 각 컴포넌트 간격/패딩은 **표 4번** 규칙 따른다.

---

## 8. 내비게이션 & 구조

### 8.1 헤더/내비
- 헤더 높이: 64px, 스크롤 시 그림자 `--shadow-sm`.
- 로고 좌, 내비 우. 모바일: 햄버거 → 드로어.
- Skip link 제공: 페이지 최상단 `<a href="#main" class="skip">Skip to content</a>`

### 8.2 브레드크럼
- 구분자 `/`, 마지막 항목 `aria-current="page"`.

---

## 9. 접근성(A11y) 규정
- 키보드 탭 순서 논리적 유지, 포커스 스타일 항상 가시적.
- 모든 인터랙티브 요소 최소 **44×44px**.
- 비텍스트 콘텐츠는 대체 텍스트 제공.
- 컨트라스트: 본문 4.5:1+, 큰 텍스트(≥24px or 18px bold) 3:1+.
- 실시간 변동 UI(토스트 등)는 **라이브 영역** 사용: `role="status"`, `aria-live="polite"`.

---

## 10. 국제화(I18N) & RTL
- 텍스트는 길이 변화(영/한/독) 대비. 버튼은 **min-width** 지양, **padding 기반**.
- 숫자/날짜는 로케일 포맷터 사용. 단위는 국제 표기(예: 1 000,00 vs 1,000.00) 고려.
- RTL: `<html dir="rtl">`일 때 화살표/아이콘 방향 포함 좌우 전환. 마진/패딩은 `logical` 속성(예: `margin-inline`).

---

## 11. 퍼포먼스 & 품질
- **폰트**: 시스템 폰트 우선, 웹폰트 사용 시 `font-display: swap`, 서브셋/프리로드.
- **이미지**: WebP/AVIF 우선, `srcset/sizes`, 크기 정확 지정해 CLS 0에 근접.
- **CSS/JS**: 불필요한 애니메이션/라이브러리 금지, 코드 스플리팅.
- **캐시**: 정적자원 `immutable` + 해시.
- **메트릭**: LCP/CLS/INP 목표 상단 명시(0장).

---

## 12. 유틸리티(선택)
```css
.u-flex{display:flex}.u-center{display:grid;place-items:center}
.u-gap-xs{gap:var(--space-xs)} .u-gap-md{gap:var(--space-md)}
.u-mb-xs{margin-bottom:var(--space-xs)} .u-mb-md{margin-bottom:var(--space-md)} .u-mb-lg{margin-bottom:var(--space-lg)}
.u-p-md{padding:var(--space-md)} .u-p-lg{padding:var(--space-lg)}
```

---

## 13. 페이지 제작 체크리스트 (자체검증)
1) 토큰만 사용했나? (임의 값 0)  
2) 타이포 램프/반응형 수치 정확 반영?  
3) 간격 표(4번) 그대로 적용?  
4) 컨트라스트/포커스/키보드 네비 확인?  
5) 모바일→태블릿→데스크톱 순으로 상향?  
6) 다크모드 변수/맵핑 정상?  
7) 컴포넌트 마크업/BEM 준수?  
8) 이미지 최적화 + 레이지로드?  
9) 모션 `transform/opacity`만 사용? `reduce` 대응?  
10) RTL/긴 텍스트/다국어 깨짐 없음?

---

## 14. 금지 규칙
- 하드코딩 색/폰트/간격/그림자 사용 금지.
- px/rem 혼용 금지(본 가이드는 px+var 고정).
- 링크 밑줄 임의 제거 후 접근성 대안 미제공 금지.
- focus 스타일 제거 금지.
- 표시만 있고 의미 없는 아이콘(스크린리더 혼란) 금지.

---

## 15. AI 전용 프롬프트 (Strict • Self-Audit 포함)
```
역할: 당신은 HTML/CSS UI 엔지니어입니다. 아래 가이드라인을 100% 준수하여 결과를 생성합니다.

출력 요구:
- 완전한 HTML + CSS (한 파일 기준 예시 가능)
- 모든 수치/색상/간격/그림자는 var(--*) 토큰만 사용
- 컴포넌트 마크업은 본 문서 예시와 동일한 BEM 클래스 사용
- 모바일 퍼스트 + 지정 브레이크포인트에만 스타일 변경
- 다크모드, 접근성, 키보드 네비, 포커스, reduce-motion 완비

필수 구현 목록:
- 페이지 스켈레톤(header/nav/main/footer)
- 버튼(Primary/Secondary/Ghost/Danger) 상태(Hover/Active/Focus/Disabled)
- 입력 필드(Label/Help/Error/Validation, aria 연결)
- 카드(타이틀/바디/액션)
- 테이블(모바일 카드형 전환)
- 모달(포커스 트랩, ESC, 오버레이)
- 알림/토스트(aria-live)
- 탭/아코디언 중 1개 이상 (키보드 이동 포함)
- 이미지 최적화 속성(lazy, decoding, sizes/srcset 예시)

금지:
1) 토큰 외 임의 값 사용, 2) 포커스 스타일 제거, 3) 레이아웃 강제 애니메이션,
4) 임의 폰트/색상/간격 추가, 5) 스켈레톤 이탈 클래스명

Self-Audit 체크리스트(출력 하단에 주석으로 함께 제출):
- [ ] 토큰만 사용했는가
- [ ] 타이포 램프/반응형 값 일치
- [ ] 간격표 준수
- [ ] 대비/포커스/키보드/터치 타깃 확인
- [ ] 다크모드/리듀스드 모션 적용
- [ ] RTL 문서에서도 구조 유지
```

---

## 16. 변경 이력 & 거버넌스
- v2.0 (현재): Ultra-Detailed 최초 배포 — 토큰, 컴포넌트, 접근성, 성능, 국제화, 프롬프트 강화 포함.
- 변경 프로세스: 제안(PR) → 디자인/프론트 리뷰 → 토큰/문서 동시 업데이트 → 버전 태깅(semver).