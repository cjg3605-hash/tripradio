import svgPaths from "./svg-lpfxd3mvih";

function Container() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">T</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div
      className="bg-[#000000] box-border content-stretch flex items-center justify-center p-0 relative rounded-[10px] shrink-0 size-8"
      data-name="Background"
    >
      <Container />
    </div>
  );
}

function Component3() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[24px] text-nowrap">
        <p className="block leading-[36px] whitespace-pre">TripRadio.AI</p>
      </div>
    </div>
  );
}

function LinkMargin() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Link:margin"
    >
      <Component3 />
    </div>
  );
}

function Container1() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background />
      <LinkMargin />
    </div>
  );
}

function Component1() {
  return (
    <div className="relative shrink-0 size-4" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path
            d={svgPaths.p3dcdd780}
            id="Vector"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Component2() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start px-3 py-1.5 relative rounded-3xl shrink-0"
      data-name="Component 2"
    >
      <Component1 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[98.54px] pl-2 pr-0 py-0 top-1"
      data-name="Button:margin"
    >
      <Component2 />
    </div>
  );
}

function Component9() {
  return (
    <div className="relative shrink-0 size-4" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path
            d={svgPaths.p399eca00}
            id="Vector"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.pc93b400}
            id="Vector_2"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-1 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Sign In</p>
      </div>
    </div>
  );
}

function Component4() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start px-3 py-1.5 relative rounded-3xl shrink-0"
      data-name="Component 4"
    >
      <Component9 />
      <Margin />
    </div>
  );
}

function LinkMargin1() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[146.54px] pl-2 pr-0 py-0 top-0"
      data-name="Link:margin"
    >
      <Component4 />
    </div>
  );
}

function Component10() {
  return (
    <div className="relative shrink-0 size-4" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path
            d={svgPaths.p39ee6532}
            id="Vector"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p14d10c00}
            id="Vector_2"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d="M1.33333 8H14.6667"
            id="Vector_3"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">English</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-1 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <Container2 />
    </div>
  );
}

function Component5() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start px-3 py-1.5 relative rounded-3xl shrink-0"
      data-name="Component 5"
    >
      <Component10 />
      <Margin1 />
    </div>
  );
}

function Container3() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-0 p-0 top-1/2 translate-y-[-50%]"
      data-name="Container"
    >
      <Component5 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-9 relative shrink-0 w-[250.2px]" data-name="Container">
      <ButtonMargin />
      <LinkMargin1 />
      <Container3 />
    </div>
  );
}

function Container5() {
  return (
    <div
      className="box-border content-stretch flex h-16 items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container1 />
      <Container4 />
    </div>
  );
}

function Header() {
  return (
    <div
      className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.8)] shrink-0 sticky top-0 w-full z-[2]"
      data-name="Header"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(229,231,235,0.04)] border-solid inset-0 pointer-events-none"
      />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start px-[352px] py-px relative w-full">
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div
      className="bg-neutral-100 box-border content-stretch flex items-center justify-center px-3 py-1 relative rounded-[9999px] shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-neutral-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Smart Trip Planner</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 1"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_'Noto_Sans_KR:Bold',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-center tracking-[-2.08px] w-full">
        <p className="leading-[91.52px] text-[83.2px]">
          <span className="font-['Inter:Regular',_'Noto_Sans_KR:Regular',_'Noto_Sans_KR:Bold',_sans-serif] font-normal">{`AI가 만드는 `}</span>
          <span className="font-['Inter:Semi_Bold',_'Noto_Sans_KR:Regular',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold">
            완벽한 여행 계획
          </span>
        </p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start max-w-[672px] p-0 relative shrink-0 w-[672px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[26px] text-center text-neutral-600 text-nowrap">
        <p className="block leading-[41.6px] whitespace-pre">당신의 취향에 맞춘 완벽한 여행 계획</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Background1 />
      <Heading1 />
      <Container6 />
    </div>
  );
}

function Heading2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.91px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[41.6px] text-center tracking-[-1.04px] w-full">
        <p className="block leading-[49.92px]">3분만에 여행 계획 완성</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[31.2px] tracking-[-0.78px] w-full">
        <p className="block leading-[37.44px]">여행 스타일 선택</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center tracking-[-0.4px] w-full">
        <p className="block leading-[19.2px]">Solo Travel</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-600 w-full">
        <p className="block leading-[24px]">Your special time alone</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[7.99px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading4 />
      <Container8 />
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-0 pb-[70.79px] pt-[17px] px-[18px] right-[960px] rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container9 />
    </div>
  );
}

function Container10() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[32px] text-center w-full">
        <p className="block leading-[44.8px]">💕</p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center tracking-[-0.4px] w-full">
        <p className="block leading-[19.2px]">Couple Travel</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-0 pt-px px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-600 w-full">
        <p className="block leading-[24px]">Creating romantic memories</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[7px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container10 />
      <Heading5 />
      <Container11 />
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-[480px] pb-[18px] pt-[17px] px-[18px] right-[480px] rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container12 />
    </div>
  );
}

function Heading6() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center tracking-[-0.4px] w-full">
        <p className="block leading-[19.2px]">Family Travel</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-600 w-full">
        <p className="block leading-[24px]">Together with the whole family</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start pb-0 pt-[51.79px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading6 />
      <Container13 />
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-[960px] p-[18px] right-0 rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container14 />
    </div>
  );
}

function Container15() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_Symbols:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[32px] text-center w-full">
        <p className="block leading-[44.8px]">‍♀️</p>
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center tracking-[-0.4px] w-full">
        <p className="block leading-[19.2px]">Friends Travel</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-0 pt-px px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-600 w-full">
        <p className="block leading-[24px]">Fun times with friends</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[7px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container15 />
      <Heading7 />
      <Container16 />
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-0 pb-[18px] pt-[17px] px-[18px] right-[960px] rounded-[32px] top-[155.98px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container17 />
    </div>
  );
}

function Container18() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[32px] text-center w-full">
        <p className="block leading-[44.8px]">💻</p>
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center tracking-[-0.4px] w-full">
        <p className="block leading-[19.2px]">Workation</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-0 pt-px px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-600 w-full">
        <p className="block leading-[24px]">Perfect balance of work and vacation</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[7px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container18 />
      <Heading8 />
      <Container19 />
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-[480px] pb-[18px] pt-[17px] px-[18px] right-[480px] rounded-[32px] top-[155.98px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border-2 border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container20 />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[295.97px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder />
      <BackgroundBorder1 />
      <BackgroundBorder2 />
      <BackgroundBorder3 />
      <BackgroundBorder4 />
    </div>
  );
}

function Container22() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading3 />
      <Container21 />
    </div>
  );
}

function Heading9() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[31.2px] tracking-[-0.78px] w-full">
        <p className="block leading-[37.44px]">목적지와 기간</p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">목적지</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-clip pb-0.5 pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 w-full">
        <p className="block leading-[normal]">어디로 가실 건가요?</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-start justify-center pb-[13px] pt-[15px] px-[17px] relative w-full">
          <Container23 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
    </div>
  );
}

function Container24() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">출발일</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div
      className="box-border content-stretch flex font-['Inter:Regular',_sans-serif] font-normal gap-px items-start justify-start leading-[0] not-italic px-px py-0 relative self-stretch shrink-0 text-[#000000] text-[16px] text-nowrap"
      data-name="Paragraph"
    >
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="block leading-[24px] text-nowrap whitespace-pre">mm</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="block leading-[24px] text-nowrap whitespace-pre">/</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="block leading-[24px] text-nowrap whitespace-pre">dd</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="block leading-[24px] text-nowrap whitespace-pre">/</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="block leading-[24px] text-nowrap whitespace-pre">yyyy</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div
      className="basis-0 box-border content-stretch flex grow items-start justify-start min-h-px min-w-px overflow-clip p-0 relative shrink-0"
      data-name="Container"
    >
      <Paragraph />
    </div>
  );
}

function Component11() {
  return (
    <div className="h-[15px] relative shrink-0 w-4" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 15">
        <g id="Component 1">
          <path d={svgPaths.p9b88a00} fill="var(--fill-0, black)" id="Vector" />
          <g id="Vector_2"></g>
        </g>
      </svg>
    </div>
  );
}

function ImageFill() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start overflow-clip pb-[3px] pt-0.5 px-0.5 relative shrink-0 size-5"
      data-name="image fill"
    >
      <Component11 />
    </div>
  );
}

function Image() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 size-5"
      data-name="Image"
    >
      <ImageFill />
    </div>
  );
}

function Container26() {
  return (
    <div
      className="basis-0 box-border content-stretch flex grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0"
      data-name="Container"
    >
      <Container25 />
      <Image />
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-start justify-center px-[17px] py-[13px] relative w-full">
          <Container26 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
    </div>
  );
}

function Container27() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label1 />
      <Input1 />
    </div>
  );
}

function Label2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">기간</p>
      </div>
    </div>
  );
}

function Component12() {
  return (
    <div className="relative shrink-0 size-6" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Component 1">
          <path
            d="M7.2 9.6L12 14.4L16.8 9.6"
            id="Vector"
            stroke="var(--stroke-0, #737373)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </g>
      </svg>
    </div>
  );
}

function ImageFill1() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col h-[50px] items-end justify-center left-0 overflow-clip pl-[667px] pr-[9px] py-[13px] top-0 w-[700px]"
      data-name="image fill"
    >
      <Component12 />
    </div>
  );
}

function Container28() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[17px] overflow-clip p-0 right-[17px] top-1/2 translate-y-[-50%]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">당일치기</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="bg-[#ffffff] h-[50px] relative rounded-3xl shrink-0 w-full" data-name="Options">
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <ImageFill1 />
      <Container28 />
    </div>
  );
}

function Container29() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label2 />
      <Options />
    </div>
  );
}

function Container30() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container24 />
      <Container27 />
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col gap-[15.99px] grow items-start justify-start min-h-px min-w-px p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <Heading9 />
      <Container30 />
    </div>
  );
}

function Heading10() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[31.2px] tracking-[-0.78px] w-full">
        <p className="block leading-[37.44px]">예산과 선호사항</p>
      </div>
    </div>
  );
}

function Label3() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">예산</p>
      </div>
    </div>
  );
}

function Component13() {
  return (
    <div className="relative shrink-0 size-6" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Component 1">
          <path
            d="M7.2 9.6L12 14.4L16.8 9.6"
            id="Vector"
            stroke="var(--stroke-0, #737373)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </g>
      </svg>
    </div>
  );
}

function ImageFill2() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col h-[50px] items-end justify-center left-0 overflow-clip pl-[667px] pr-[9px] py-[13px] top-0 w-[700px]"
      data-name="image fill"
    >
      <Component13 />
    </div>
  );
}

function Container32() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[17px] overflow-clip p-0 right-[17px] top-1/2 translate-y-[-50%]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">20만원 이하</p>
      </div>
    </div>
  );
}

function Options1() {
  return (
    <div className="bg-[#ffffff] h-[50px] relative rounded-3xl shrink-0 w-full" data-name="Options">
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <ImageFill2 />
      <Container32 />
    </div>
  );
}

function Container33() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label3 />
      <Options1 />
    </div>
  );
}

function Label4() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">관심사</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">맛집 탐방</p>
      </div>
    </div>
  );
}

function Label5() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-0 p-0 right-[354px] top-0"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin2 />
    </div>
  );
}

function Margin3() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">쇼핑</p>
      </div>
    </div>
  );
}

function Label6() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-[354px] p-0 right-0 top-0"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin3 />
    </div>
  );
}

function Margin4() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">역사/문화</p>
      </div>
    </div>
  );
}

function Label7() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-0 p-0 right-[354px] top-8"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin4 />
    </div>
  );
}

function Margin5() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">자연/힐링</p>
      </div>
    </div>
  );
}

function Label8() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-[354px] p-0 right-0 top-8"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin5 />
    </div>
  );
}

function Margin6() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">액티비티</p>
      </div>
    </div>
  );
}

function Label9() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-0 p-0 right-[354px] top-16"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin6 />
    </div>
  );
}

function Margin7() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">사진촬영</p>
      </div>
    </div>
  );
}

function Label10() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-[354px] p-0 right-0 top-16"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin7 />
    </div>
  );
}

function Margin8() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">야경</p>
      </div>
    </div>
  );
}

function Label11() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-0 p-0 right-[354px] top-24"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin8 />
    </div>
  );
}

function Margin9() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">온천/스파</p>
      </div>
    </div>
  );
}

function Label12() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-[354px] p-0 right-0 top-24"
      data-name="Label"
    >
      <div className="bg-[#ffffff] relative rounded-xl shrink-0 size-4" data-name="Input">
        <div
          aria-hidden="true"
          className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <Margin9 />
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[120px] relative shrink-0 w-full" data-name="Container">
      <Label5 />
      <Label6 />
      <Label7 />
      <Label8 />
      <Label9 />
      <Label10 />
      <Label11 />
      <Label12 />
    </div>
  );
}

function Container35() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label4 />
      <Container34 />
    </div>
  );
}

function Container36() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container33 />
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col gap-[15.99px] grow items-start justify-start min-h-px min-w-px p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <Heading10 />
      <Container36 />
    </div>
  );
}

function Container38() {
  return (
    <div
      className="box-border content-stretch flex gap-6 items-start justify-center pb-0 pt-2 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container31 />
      <Container37 />
    </div>
  );
}

function Heading11() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 tracking-[-0.4px] w-full">
        <p className="block leading-[24px]">title</p>
      </div>
    </div>
  );
}

function Component6() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0"
      data-name="Component 6"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">load settings</p>
      </div>
    </div>
  );
}

function Component14() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0"
      data-name="Component 6"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">save settings</p>
      </div>
    </div>
  );
}

function Component15() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0"
      data-name="Component 6"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view saved plans (0plans count)</p>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div
      className="box-border content-start flex flex-wrap gap-3 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component6 />
      <Component14 />
      <Component15 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#ffffff] relative rounded-[32px] shrink-0 w-full" data-name="Background">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[32.99px] px-6 relative w-full">
          <Heading11 />
          <Container39 />
        </div>
      </div>
    </div>
  );
}

function Component7() {
  return (
    <div
      className="bg-[#000000] box-border content-stretch flex items-center justify-center px-8 py-4 relative rounded-[32px] shrink-0"
      data-name="Component 7"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">계획 생성</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-center w-full">
        <p className="block leading-[19.6px]">완성 시간</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[8.01px] items-center justify-start pb-0 pt-px px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component7 />
      <Container40 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-neutral-50 relative rounded-[40px] shrink-0 w-full" data-name="Background">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[23px] items-start justify-start pb-8 pt-[31px] px-8 relative w-full">
          <Heading2 />
          <Container22 />
          <Container38 />
          <Background2 />
          <Container41 />
        </div>
      </div>
    </div>
  );
}

function Heading12() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.91px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-center tracking-[-1.04px] w-full">
        <p className="leading-[49.92px] text-[41.6px]">
          <span className="font-['Inter:Regular',_sans-serif] font-normal">{`title `}</span>
          <span className="font-['Inter:Semi_Bold',_sans-serif] font-semibold">subtitle</span>
        </p>
      </div>
    </div>
  );
}

function Heading13() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🏯 도쿄</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">일본</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading13 />
      <Container42 />
    </div>
  );
}

function Container44() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">80-120만원</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container44 />
      <Container45 />
    </div>
  );
}

function Container47() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container43 />
      <Container46 />
    </div>
  );
}

function Container48() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">시부야, 아사쿠사, 긴자</p>
      </div>
    </div>
  );
}

function Container50() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container48 />
      <Container49 />
    </div>
  );
}

function Component16() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background4 />
      <Background5 />
    </div>
  );
}

function Container52() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component16 />
      <Container51 />
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25.01px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container47 />
      <Container50 />
      <Container52 />
    </div>
  );
}

function Heading14() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🍜 오사카</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">일본</p>
      </div>
    </div>
  );
}

function Container54() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading14 />
      <Container53 />
    </div>
  );
}

function Container55() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">2-3일</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">70-100만원</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container55 />
      <Container56 />
    </div>
  );
}

function Container58() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container54 />
          <Container57 />
        </div>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">오사카성, 도톤보리, 유니버설</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container59 />
      <Container60 />
    </div>
  );
}

function Component17() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background6 />
      <Background7 />
    </div>
  );
}

function Container63() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component17 />
          <Container62 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder6() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25.01px] pt-[24.2px] px-[25px] right-[501.34px] rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container58 />
      <Container61 />
      <Container63 />
    </div>
  );
}

function Heading15() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🛕 방콕</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">태국</p>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading15 />
      <Container64 />
    </div>
  );
}

function Container66() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">50-80만원</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container66 />
      <Container67 />
    </div>
  );
}

function Container69() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container65 />
      <Container68 />
    </div>
  );
}

function Container70() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">왓포, 카오산로드, 짜뚜짝</p>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container70 />
      <Container71 />
    </div>
  );
}

function Component18() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background8 />
      <Background9 />
    </div>
  );
}

function Container74() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component18 />
          <Container73 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder7() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25.01px] pt-[24.2px] px-[25px] right-0 rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container69 />
      <Container72 />
      <Container74 />
    </div>
  );
}

function Heading16() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🌆 싱가포르</p>
      </div>
    </div>
  );
}

function Container75() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">싱가포르</p>
      </div>
    </div>
  );
}

function Container76() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading16 />
      <Container75 />
    </div>
  );
}

function Container77() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">100-150만원</p>
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container77 />
      <Container78 />
    </div>
  );
}

function Container80() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container76 />
      <Container79 />
    </div>
  );
}

function Container81() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">마리나베이, 가든스바이더베이, 센토사</p>
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container81 />
      <Container82 />
    </div>
  );
}

function Component19() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background10() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background11() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background10 />
      <Background11 />
    </div>
  );
}

function Container85() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component19 />
      <Container84 />
    </div>
  );
}

function BackgroundBorder8() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-[212.78px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container80 />
      <Container83 />
      <Container85 />
    </div>
  );
}

function Heading17() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 대만</p>
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">대만</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading17 />
      <Container86 />
    </div>
  );
}

function Container88() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">60-90만원</p>
      </div>
    </div>
  );
}

function Container90() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container88 />
      <Container89 />
    </div>
  );
}

function Container91() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container87 />
      <Container90 />
    </div>
  );
}

function Container92() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container93() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">타이베이101, 지우펀, 타로코</p>
      </div>
    </div>
  );
}

function Container94() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container92 />
      <Container93 />
    </div>
  );
}

function Component20() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background12() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background13() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container95() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background12 />
      <Background13 />
    </div>
  );
}

function Container96() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component20 />
          <Container95 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder9() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25px] pt-[24.2px] px-[25px] right-[501.34px] rounded-[32px] top-[212.78px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container91 />
      <Container94 />
      <Container96 />
    </div>
  );
}

function Heading18() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🌃 홍콩</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">홍콩</p>
      </div>
    </div>
  );
}

function Container98() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading18 />
      <Container97 />
    </div>
  );
}

function Container99() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">2-3일</p>
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">80-120만원</p>
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container99 />
      <Container100 />
    </div>
  );
}

function Container102() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container98 />
          <Container101 />
        </div>
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container104() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">빅토리아피크, 심포니오브라이츠, 디즈니랜드</p>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container103 />
      <Container104 />
    </div>
  );
}

function Component21() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background14() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background15() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container106() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background14 />
      <Background15 />
    </div>
  );
}

function Container107() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component21 />
          <Container106 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder10() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25px] pt-[24.2px] px-[25px] right-0 rounded-[32px] top-[212.78px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container102 />
      <Container105 />
      <Container107 />
    </div>
  );
}

function Heading19() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🎰 마카오</p>
      </div>
    </div>
  );
}

function Container108() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">마카오</p>
      </div>
    </div>
  );
}

function Container109() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading19 />
      <Container108 />
    </div>
  );
}

function Container110() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">1-2일</p>
      </div>
    </div>
  );
}

function Container111() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">60-100만원</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "2.27374e-13px" }}
    >
      <Container110 />
      <Container111 />
    </div>
  );
}

function Container113() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container109 />
      <Container112 />
    </div>
  );
}

function Container114() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container115() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">베네시안, 세나도광장, 기아등대</p>
      </div>
    </div>
  );
}

function Container116() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container114 />
      <Container115 />
    </div>
  );
}

function Component22() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background16() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background17() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background16 />
      <Background17 />
    </div>
  );
}

function Container118() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component22 />
      <Container117 />
    </div>
  );
}

function BackgroundBorder11() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-[425.56px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container113 />
      <Container116 />
      <Container118 />
    </div>
  );
}

function Heading20() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🛵 베트남</p>
      </div>
    </div>
  );
}

function Container119() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">베트남</p>
      </div>
    </div>
  );
}

function Container120() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading20 />
      <Container119 />
    </div>
  );
}

function Container121() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">5-7일</p>
      </div>
    </div>
  );
}

function Container122() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">60-90만원</p>
      </div>
    </div>
  );
}

function Container123() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "2.27374e-13px" }}
    >
      <Container121 />
      <Container122 />
    </div>
  );
}

function Container124() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container120 />
      <Container123 />
    </div>
  );
}

function Container125() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container126() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">하롱베이, 호치민, 다낭</p>
      </div>
    </div>
  );
}

function Container127() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container125 />
      <Container126 />
    </div>
  );
}

function Component23() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background18() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background19() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container128() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background18 />
      <Background19 />
    </div>
  );
}

function Container129() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component23 />
          <Container128 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder12() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25px] pt-[24.2px] px-[25px] right-[501.34px] rounded-[32px] top-[425.56px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container124 />
      <Container127 />
      <Container129 />
    </div>
  );
}

function Heading21() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 발리</p>
      </div>
    </div>
  );
}

function Container130() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">인도네시아</p>
      </div>
    </div>
  );
}

function Container131() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading21 />
      <Container130 />
    </div>
  );
}

function Container132() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-5일</p>
      </div>
    </div>
  );
}

function Container133() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">70-110만원</p>
      </div>
    </div>
  );
}

function Container134() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "2.27374e-13px" }}
    >
      <Container132 />
      <Container133 />
    </div>
  );
}

function Container135() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container131 />
      <Container134 />
    </div>
  );
}

function Container136() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container137() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">우붓, 탄디롯, 키타스</p>
      </div>
    </div>
  );
}

function Container138() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container136 />
      <Container137 />
    </div>
  );
}

function Component24() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background20() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background21() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container139() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background20 />
      <Background21 />
    </div>
  );
}

function Container140() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component24 />
          <Container139 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder13() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25px] pt-[24.2px] px-[25px] right-0 rounded-[32px] top-[425.56px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container135 />
      <Container138 />
      <Container140 />
    </div>
  );
}

function Heading22() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 푸켓</p>
      </div>
    </div>
  );
}

function Container141() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">태국</p>
      </div>
    </div>
  );
}

function Container142() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading22 />
      <Container141 />
    </div>
  );
}

function Container143() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-5일</p>
      </div>
    </div>
  );
}

function Container144() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">60-100만원</p>
      </div>
    </div>
  );
}

function Container145() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container143 />
      <Container144 />
    </div>
  );
}

function Container146() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container142 />
      <Container145 />
    </div>
  );
}

function Container147() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container148() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">파통비치, 피피섬, 빅부다</p>
      </div>
    </div>
  );
}

function Container149() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container147 />
      <Container148 />
    </div>
  );
}

function Component25() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background22() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background23() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container150() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background22 />
      <Background23 />
    </div>
  );
}

function Container151() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component25 />
      <Container150 />
    </div>
  );
}

function BackgroundBorder14() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-[638.34px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container146 />
      <Container149 />
      <Container151 />
    </div>
  );
}

function Heading23() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🗼 파리</p>
      </div>
    </div>
  );
}

function Container152() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">프랑스</p>
      </div>
    </div>
  );
}

function Container153() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading23 />
      <Container152 />
    </div>
  );
}

function Container154() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-5일</p>
      </div>
    </div>
  );
}

function Container155() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">150-200만원</p>
      </div>
    </div>
  );
}

function Container156() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container154 />
      <Container155 />
    </div>
  );
}

function Container157() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container153 />
      <Container156 />
    </div>
  );
}

function Container158() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container159() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">에펠탑, 루브르, 샹젤리제</p>
      </div>
    </div>
  );
}

function Container160() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container158 />
      <Container159 />
    </div>
  );
}

function Component26() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background24() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background25() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container161() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background24 />
      <Background25 />
    </div>
  );
}

function Container162() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component26 />
          <Container161 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder15() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25px] pt-[24.2px] px-[25px] right-[501.34px] rounded-[32px] top-[638.34px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container157 />
      <Container160 />
      <Container162 />
    </div>
  );
}

function Heading24() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🎡 런던</p>
      </div>
    </div>
  );
}

function Container163() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">영국</p>
      </div>
    </div>
  );
}

function Container164() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading24 />
      <Container163 />
    </div>
  );
}

function Container165() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-5일</p>
      </div>
    </div>
  );
}

function Container166() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">150-250만원</p>
      </div>
    </div>
  );
}

function Container167() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container165 />
      <Container166 />
    </div>
  );
}

function Container168() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container164 />
      <Container167 />
    </div>
  );
}

function Container169() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container170() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">빅벤, 버킹엄궁전, 대영박물관</p>
      </div>
    </div>
  );
}

function Container171() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container169 />
      <Container170 />
    </div>
  );
}

function Component27() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background26() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background27() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container172() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background26 />
      <Background27 />
    </div>
  );
}

function Container173() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component27 />
          <Container172 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder16() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25px] pt-[24.2px] px-[25px] right-0 rounded-[32px] top-[638.34px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container168 />
      <Container171 />
      <Container173 />
    </div>
  );
}

function Heading25() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 로마</p>
      </div>
    </div>
  );
}

function Container174() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">이탈리아</p>
      </div>
    </div>
  );
}

function Container175() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Heading25 />
      <Container174 />
    </div>
  );
}

function Container176() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container177() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">120-180만원</p>
      </div>
    </div>
  );
}

function Container178() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container176 />
      <Container177 />
    </div>
  );
}

function Container179() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container175 />
      <Container178 />
    </div>
  );
}

function Container180() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container181() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">콜로세움, 바티칸, 트레비분수</p>
      </div>
    </div>
  );
}

function Container182() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container180 />
      <Container181 />
    </div>
  );
}

function Component28() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background28() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background29() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container183() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background28 />
      <Background29 />
    </div>
  );
}

function Container184() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component28 />
      <Container183 />
    </div>
  );
}

function BackgroundBorder17() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.21px] px-[25px] right-[1002.67px] rounded-[32px] top-[851.12px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container179 />
      <Container182 />
      <Container184 />
    </div>
  );
}

function Heading26() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 바르셀로나</p>
      </div>
    </div>
  );
}

function Container185() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">스페인</p>
      </div>
    </div>
  );
}

function Container186() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Heading26 />
      <Container185 />
    </div>
  );
}

function Container187() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container188() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">100-150만원</p>
      </div>
    </div>
  );
}

function Container189() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container187 />
      <Container188 />
    </div>
  );
}

function Container190() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container186 />
      <Container189 />
    </div>
  );
}

function Container191() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container192() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">사그라다파밀리아, 파크구엘, 람블라스</p>
      </div>
    </div>
  );
}

function Container193() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container191 />
      <Container192 />
    </div>
  );
}

function Component29() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background30() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background31() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container194() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background30 />
      <Background31 />
    </div>
  );
}

function Container195() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component29 />
          <Container194 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder18() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25px] pt-[24.21px] px-[25px] right-[501.34px] rounded-[32px] top-[851.12px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container190 />
      <Container193 />
      <Container195 />
    </div>
  );
}

function Heading27() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🏰 프라하</p>
      </div>
    </div>
  );
}

function Container196() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">체코</p>
      </div>
    </div>
  );
}

function Container197() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Heading27 />
      <Container196 />
    </div>
  );
}

function Container198() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">2-3일</p>
      </div>
    </div>
  );
}

function Container199() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">80-120만원</p>
      </div>
    </div>
  );
}

function Container200() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container198 />
      <Container199 />
    </div>
  );
}

function Container201() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container197 />
          <Container200 />
        </div>
      </div>
    </div>
  );
}

function Container202() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container203() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">프라하성, 구시가지광장, 카를교</p>
      </div>
    </div>
  );
}

function Container204() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container202 />
      <Container203 />
    </div>
  );
}

function Component30() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background32() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background33() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container205() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background32 />
      <Background33 />
    </div>
  );
}

function Container206() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component30 />
          <Container205 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder19() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25px] pt-[24.21px] px-[25px] right-0 rounded-[32px] top-[851.12px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container201 />
      <Container204 />
      <Container206 />
    </div>
  );
}

function Heading28() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🎼 비엔나</p>
      </div>
    </div>
  );
}

function Container207() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">오스트리아</p>
      </div>
    </div>
  );
}

function Container208() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Heading28 />
      <Container207 />
    </div>
  );
}

function Container209() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">2-3일</p>
      </div>
    </div>
  );
}

function Container210() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">100-140만원</p>
      </div>
    </div>
  );
}

function Container211() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container209 />
      <Container210 />
    </div>
  );
}

function Container212() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container208 />
      <Container211 />
    </div>
  );
}

function Container213() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container214() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">쇤브른궁전, 할슈타트, 잘츠부르크</p>
      </div>
    </div>
  );
}

function Container215() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container213 />
      <Container214 />
    </div>
  );
}

function Component31() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background34() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background35() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container216() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background34 />
      <Background35 />
    </div>
  );
}

function Container217() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component31 />
      <Container216 />
    </div>
  );
}

function BackgroundBorder20() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.21px] px-[25px] right-[1002.67px] rounded-[32px] top-[1063.9px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container212 />
      <Container215 />
      <Container217 />
    </div>
  );
}

function Heading29() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🚲 암스테르담</p>
      </div>
    </div>
  );
}

function Container218() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">네덜란드</p>
      </div>
    </div>
  );
}

function Container219() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Heading29 />
      <Container218 />
    </div>
  );
}

function Container220() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">2-3일</p>
      </div>
    </div>
  );
}

function Container221() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">120-160만원</p>
      </div>
    </div>
  );
}

function Container222() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container220 />
      <Container221 />
    </div>
  );
}

function Container223() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container219 />
      <Container222 />
    </div>
  );
}

function Container224() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container225() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">반고흐박물관, 안네프랑크의집, 운하투어</p>
      </div>
    </div>
  );
}

function Container226() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container224 />
      <Container225 />
    </div>
  );
}

function Component32() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background36() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background37() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container227() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background36 />
      <Background37 />
    </div>
  );
}

function Container228() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component32 />
          <Container227 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder21() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25px] pt-[24.21px] px-[25px] right-[501.34px] rounded-[32px] top-[1063.9px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container223 />
      <Container226 />
      <Container228 />
    </div>
  );
}

function Heading30() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🧱 베를린</p>
      </div>
    </div>
  );
}

function Container229() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">독일</p>
      </div>
    </div>
  );
}

function Container230() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Heading30 />
      <Container229 />
    </div>
  );
}

function Container231() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container232() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">100-140만원</p>
      </div>
    </div>
  );
}

function Container233() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container231 />
      <Container232 />
    </div>
  );
}

function Container234() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container230 />
      <Container233 />
    </div>
  );
}

function Container235() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container236() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">브란덴부르크문, 동서독경계, 박물관섬</p>
      </div>
    </div>
  );
}

function Container237() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container235 />
      <Container236 />
    </div>
  );
}

function Component33() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background38() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background39() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container238() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background38 />
      <Background39 />
    </div>
  );
}

function Container239() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component33 />
          <Container238 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder22() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25px] pt-[24.21px] px-[25px] right-0 rounded-[32px] top-[1063.9px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container234 />
      <Container237 />
      <Container239 />
    </div>
  );
}

function Heading31() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 취리히</p>
      </div>
    </div>
  );
}

function Container240() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">스위스</p>
      </div>
    </div>
  );
}

function Container241() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading31 />
      <Container240 />
    </div>
  );
}

function Container242() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container243() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">200-300만원</p>
      </div>
    </div>
  );
}

function Container244() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container242 />
      <Container243 />
    </div>
  );
}

function Container245() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container241 />
      <Container244 />
    </div>
  );
}

function Container246() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container247() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">융프라우, 마터호른, 라인폭포</p>
      </div>
    </div>
  );
}

function Container248() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container246 />
      <Container247 />
    </div>
  );
}

function Component34() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background40() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background41() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container249() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background40 />
      <Background41 />
    </div>
  );
}

function Container250() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component34 />
      <Container249 />
    </div>
  );
}

function BackgroundBorder23() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.21px] px-[25px] right-[1002.67px] rounded-[32px] top-[1276.68px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container245 />
      <Container248 />
      <Container250 />
    </div>
  );
}

function Heading32() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🦌 헬싱키</p>
      </div>
    </div>
  );
}

function Container251() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">핀란드</p>
      </div>
    </div>
  );
}

function Container252() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading32 />
      <Container251 />
    </div>
  );
}

function Container253() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">2-3일</p>
      </div>
    </div>
  );
}

function Container254() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">70-100만원</p>
      </div>
    </div>
  );
}

function Container255() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container253 />
      <Container254 />
    </div>
  );
}

function Container256() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container252 />
          <Container255 />
        </div>
      </div>
    </div>
  );
}

function Container257() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container258() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">헬싱키성당, 수오멘린나, 마켓광장</p>
      </div>
    </div>
  );
}

function Container259() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container257 />
      <Container258 />
    </div>
  );
}

function Component35() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background42() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background43() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container260() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background42 />
      <Background43 />
    </div>
  );
}

function Container261() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component35 />
          <Container260 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder24() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25px] pt-[24.21px] px-[25px] right-[501.34px] rounded-[32px] top-[1276.68px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container256 />
      <Container259 />
      <Container261 />
    </div>
  );
}

function Heading33() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🚃 리스본</p>
      </div>
    </div>
  );
}

function Container262() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">포르투갈</p>
      </div>
    </div>
  );
}

function Container263() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading33 />
      <Container262 />
    </div>
  );
}

function Container264() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container265() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">60-80만원</p>
      </div>
    </div>
  );
}

function Container266() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container264 />
      <Container265 />
    </div>
  );
}

function Container267() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container263 />
          <Container266 />
        </div>
      </div>
    </div>
  );
}

function Container268() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container269() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">베렝탑, 알파마, 신트라</p>
      </div>
    </div>
  );
}

function Container270() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container268 />
      <Container269 />
    </div>
  );
}

function Component36() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background44() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background45() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container271() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background44 />
      <Background45 />
    </div>
  );
}

function Container272() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component36 />
          <Container271 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder25() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25px] pt-[24.21px] px-[25px] right-0 rounded-[32px] top-[1276.68px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container267 />
      <Container270 />
      <Container272 />
    </div>
  );
}

function Heading34() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🗽 뉴욕</p>
      </div>
    </div>
  );
}

function Container273() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">미국</p>
      </div>
    </div>
  );
}

function Container274() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading34 />
      <Container273 />
    </div>
  );
}

function Container275() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">5-7일</p>
      </div>
    </div>
  );
}

function Container276() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">150-250만원</p>
      </div>
    </div>
  );
}

function Container277() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container275 />
      <Container276 />
    </div>
  );
}

function Container278() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container274 />
      <Container277 />
    </div>
  );
}

function Container279() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container280() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">자유의여신상, 타임스퀘어, 센트럴파크</p>
      </div>
    </div>
  );
}

function Container281() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container279 />
      <Container280 />
    </div>
  );
}

function Component37() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background46() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background47() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container282() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background46 />
      <Background47 />
    </div>
  );
}

function Container283() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component37 />
      <Container282 />
    </div>
  );
}

function BackgroundBorder26() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25.01px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-[1489.47px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container278 />
      <Container281 />
      <Container283 />
    </div>
  );
}

function Heading35() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🌴 로스앤젤레스</p>
      </div>
    </div>
  );
}

function Container284() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">미국</p>
      </div>
    </div>
  );
}

function Container285() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading35 />
      <Container284 />
    </div>
  );
}

function Container286() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-6일</p>
      </div>
    </div>
  );
}

function Container287() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">120-200만원</p>
      </div>
    </div>
  );
}

function Container288() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container286 />
      <Container287 />
    </div>
  );
}

function Container289() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pl-0 pr-[0.01px] py-0 relative w-full">
          <Container285 />
          <Container288 />
        </div>
      </div>
    </div>
  );
}

function Container290() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container291() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">할리우드, 베니스비치, 디즈니랜드</p>
      </div>
    </div>
  );
}

function Container292() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container290 />
      <Container291 />
    </div>
  );
}

function Component38() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background48() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background49() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container293() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background48 />
      <Background49 />
    </div>
  );
}

function Container294() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component38 />
          <Container293 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder27() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25.01px] pt-[24.2px] px-[25px] right-[501.34px] rounded-[32px] top-[1489.47px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container289 />
      <Container292 />
      <Container294 />
    </div>
  );
}

function Heading36() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🎰 라스베이거스</p>
      </div>
    </div>
  );
}

function Container295() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">미국</p>
      </div>
    </div>
  );
}

function Container296() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading36 />
      <Container295 />
    </div>
  );
}

function Container297() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container298() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">100-150만원</p>
      </div>
    </div>
  );
}

function Container299() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container297 />
      <Container298 />
    </div>
  );
}

function Container300() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container296 />
          <Container299 />
        </div>
      </div>
    </div>
  );
}

function Container301() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container302() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">스트립, 그랜드캐년, 쇼</p>
      </div>
    </div>
  );
}

function Container303() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container301 />
      <Container302 />
    </div>
  );
}

function Component39() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background50() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background51() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container304() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background50 />
      <Background51 />
    </div>
  );
}

function Container305() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component39 />
          <Container304 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder28() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25.01px] pt-[24.2px] px-[25px] right-0 rounded-[32px] top-[1489.47px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container300 />
      <Container303 />
      <Container305 />
    </div>
  );
}

function Heading37() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🌉 샌프란시스코</p>
      </div>
    </div>
  );
}

function Container306() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">미국</p>
      </div>
    </div>
  );
}

function Container307() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading37 />
      <Container306 />
    </div>
  );
}

function Container308() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container309() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">120-180만원</p>
      </div>
    </div>
  );
}

function Container310() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container308 />
      <Container309 />
    </div>
  );
}

function Container311() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container307 />
      <Container310 />
    </div>
  );
}

function Container312() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container313() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">골든게이트, 알카트라즈, 피셔맨스워프</p>
      </div>
    </div>
  );
}

function Container314() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container312 />
      <Container313 />
    </div>
  );
}

function Component40() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background52() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background53() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container315() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background52 />
      <Background53 />
    </div>
  );
}

function Container316() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component40 />
      <Container315 />
    </div>
  );
}

function BackgroundBorder29() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25.01px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-[1702.25px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container311 />
      <Container314 />
      <Container316 />
    </div>
  );
}

function Heading38() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🍁 토론토</p>
      </div>
    </div>
  );
}

function Container317() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">캐나다</p>
      </div>
    </div>
  );
}

function Container318() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading38 />
      <Container317 />
    </div>
  );
}

function Container319() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container320() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">80-120만원</p>
      </div>
    </div>
  );
}

function Container321() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container319 />
      <Container320 />
    </div>
  );
}

function Container322() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container318 />
      <Container321 />
    </div>
  );
}

function Container323() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container324() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">CN타워, 나이아가라, 디스틸러리</p>
      </div>
    </div>
  );
}

function Container325() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container323 />
      <Container324 />
    </div>
  );
}

function Component41() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background54() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background55() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container326() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background54 />
      <Background55 />
    </div>
  );
}

function Container327() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component41 />
          <Container326 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder30() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25.01px] pt-[24.2px] px-[25px] right-[501.34px] rounded-[32px] top-[1702.25px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container322 />
      <Container325 />
      <Container327 />
    </div>
  );
}

function Heading39() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">⛰️ 밴쿠버</p>
      </div>
    </div>
  );
}

function Container328() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">캐나다</p>
      </div>
    </div>
  );
}

function Container329() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading39 />
      <Container328 />
    </div>
  );
}

function Container330() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">3-4일</p>
      </div>
    </div>
  );
}

function Container331() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">80-120만원</p>
      </div>
    </div>
  );
}

function Container332() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container330 />
      <Container331 />
    </div>
  );
}

function Container333() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container329 />
          <Container332 />
        </div>
      </div>
    </div>
  );
}

function Container334() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container335() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">스탠리파크, 그라우스마운틴, 그랜빌아일랜드</p>
      </div>
    </div>
  );
}

function Container336() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-1 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container334 />
      <Container335 />
    </div>
  );
}

function Component42() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background56() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background57() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container337() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background56 />
      <Background57 />
    </div>
  );
}

function Container338() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-1 px-0 relative w-full">
          <Component42 />
          <Container337 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder31() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25.01px] pt-[24.2px] px-[25px] right-0 rounded-[32px] top-[1702.25px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container333 />
      <Container336 />
      <Container338 />
    </div>
  );
}

function Heading40() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
      style={{ marginBottom: "-4.01457e-13px" }}
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">🌮 멕시코시티</p>
      </div>
    </div>
  );
}

function Container339() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
      style={{ marginBottom: "-4.01457e-13px" }}
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">멕시코</p>
      </div>
    </div>
  );
}

function Container340() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading40 />
      <Container339 />
    </div>
  );
}

function Container341() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-5일</p>
      </div>
    </div>
  );
}

function Container342() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">60-90만원</p>
      </div>
    </div>
  );
}

function Container343() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container341 />
      <Container342 />
    </div>
  );
}

function Container344() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container340 />
      <Container343 />
    </div>
  );
}

function Container345() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container346() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">테오티우아칸, 소칼로, 프리다칼로박물관</p>
      </div>
    </div>
  );
}

function Container347() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container345 />
      <Container346 />
    </div>
  );
}

function Component43() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background58() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background59() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container348() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background58 />
      <Background59 />
    </div>
  );
}

function Container349() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component43 />
      <Container348 />
    </div>
  );
}

function BackgroundBorder32() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-[1915.03px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container344 />
      <Container347 />
      <Container349 />
    </div>
  );
}

function Heading41() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
      style={{ marginBottom: "-4.01457e-13px" }}
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 칸쿤</p>
      </div>
    </div>
  );
}

function Container350() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
      style={{ marginBottom: "-4.01457e-13px" }}
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">멕시코</p>
      </div>
    </div>
  );
}

function Container351() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading41 />
      <Container350 />
    </div>
  );
}

function Container352() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">5-7일</p>
      </div>
    </div>
  );
}

function Container353() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">80-120만원</p>
      </div>
    </div>
  );
}

function Container354() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container352 />
      <Container353 />
    </div>
  );
}

function Container355() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container351 />
      <Container354 />
    </div>
  );
}

function Container356() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container357() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">치첸이트사, 코즈멜, 마야유적</p>
      </div>
    </div>
  );
}

function Container358() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container356 />
      <Container357 />
    </div>
  );
}

function Component44() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background60() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background61() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container359() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background60 />
      <Background61 />
    </div>
  );
}

function Container360() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component44 />
          <Container359 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder33() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[501.33px] pb-[25px] pt-[24.2px] px-[25px] right-[501.34px] rounded-[32px] top-[1915.03px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container355 />
      <Container358 />
      <Container360 />
    </div>
  );
}

function Heading42() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
      style={{ marginBottom: "-4.01457e-13px" }}
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">💃 부에노스아이레스</p>
      </div>
    </div>
  );
}

function Container361() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
      style={{ marginBottom: "-4.01457e-13px" }}
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">아르헨티나</p>
      </div>
    </div>
  );
}

function Container362() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading42 />
      <Container361 />
    </div>
  );
}

function Container363() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-5일</p>
      </div>
    </div>
  );
}

function Container364() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">70-100만원</p>
      </div>
    </div>
  );
}

function Container365() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container363 />
      <Container364 />
    </div>
  );
}

function Container366() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container362 />
      <Container365 />
    </div>
  );
}

function Container367() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container368() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">탱고, 라보카, 레콜레타</p>
      </div>
    </div>
  );
}

function Container369() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container367 />
      <Container368 />
    </div>
  );
}

function Component45() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background62() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background63() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container370() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background62 />
      <Background63 />
    </div>
  );
}

function Container371() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative w-full">
          <Component45 />
          <Container370 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder34() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-[1002.66px] pb-[25px] pt-[24.2px] px-[25px] right-0 rounded-[32px] top-[1915.03px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container366 />
      <Container369 />
      <Container371 />
    </div>
  );
}

function Heading43() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">️ 리우데자네이루</p>
      </div>
    </div>
  );
}

function Container372() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">브라질</p>
      </div>
    </div>
  );
}

function Container373() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start min-w-[117.14px] p-0 relative shrink-0"
      data-name="Container"
      style={{ gap: "5.32907e-14px" }}
    >
      <Heading43 />
      <Container372 />
    </div>
  );
}

function Container374() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">4-6일</p>
      </div>
    </div>
  );
}

function Container375() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[19.6px] whitespace-pre">80-120만원</p>
      </div>
    </div>
  );
}

function Container376() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Container374 />
      <Container375 />
    </div>
  );
}

function Container377() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container373 />
      <Container376 />
    </div>
  );
}

function Container378() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="block leading-[19.6px]">main attractions</p>
      </div>
    </div>
  );
}

function Container379() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">예수상, 코파카바나, 슈가로프</p>
      </div>
    </div>
  );
}

function Container380() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[4.01px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container378 />
      <Container379 />
    </div>
  );
}

function Component46() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Component 3"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">view guide</p>
      </div>
    </div>
  );
}

function Background64() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">nomad</p>
      </div>
    </div>
  );
}

function Background65() {
  return (
    <div
      className="bg-green-100 box-border content-stretch flex flex-col items-start justify-start px-2 py-1 relative rounded-xl self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-green-800 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">visa</p>
      </div>
    </div>
  );
}

function Container381() {
  return (
    <div
      className="box-border content-stretch flex gap-[7.99px] items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Background64 />
      <Background65 />
    </div>
  );
}

function Container382() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between pb-0 pt-[4.01px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Component46 />
      <Container381 />
    </div>
  );
}

function BackgroundBorder35() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-3 items-start justify-start left-0 pb-[25px] pt-[24.2px] px-[25px] right-[1002.67px] rounded-[32px] top-[2127.81px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Container377 />
      <Container380 />
      <Container382 />
    </div>
  );
}

function Container383() {
  return (
    <div className="h-[2324.59px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder5 />
      <BackgroundBorder6 />
      <BackgroundBorder7 />
      <BackgroundBorder8 />
      <BackgroundBorder9 />
      <BackgroundBorder10 />
      <BackgroundBorder11 />
      <BackgroundBorder12 />
      <BackgroundBorder13 />
      <BackgroundBorder14 />
      <BackgroundBorder15 />
      <BackgroundBorder16 />
      <BackgroundBorder17 />
      <BackgroundBorder18 />
      <BackgroundBorder19 />
      <BackgroundBorder20 />
      <BackgroundBorder21 />
      <BackgroundBorder22 />
      <BackgroundBorder23 />
      <BackgroundBorder24 />
      <BackgroundBorder25 />
      <BackgroundBorder26 />
      <BackgroundBorder27 />
      <BackgroundBorder28 />
      <BackgroundBorder29 />
      <BackgroundBorder30 />
      <BackgroundBorder31 />
      <BackgroundBorder32 />
      <BackgroundBorder33 />
      <BackgroundBorder34 />
      <BackgroundBorder35 />
    </div>
  );
}

function Container384() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-8 items-start justify-start pb-0 pt-[39px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading12 />
      <Container383 />
    </div>
  );
}

function Heading44() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.91px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-center tracking-[-1.04px] w-full">
        <p className="leading-[49.92px] text-[41.6px]">
          <span className="font-['Inter:Regular',_sans-serif] font-normal">{`title `}</span>
          <span className="font-['Inter:Semi_Bold',_sans-serif] font-semibold">subtitle</span>
        </p>
      </div>
    </div>
  );
}

function Container385() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[24px] text-nowrap">
        <p className="block leading-[36px] whitespace-pre">🎯</p>
      </div>
    </div>
  );
}

function Background66() {
  return (
    <div
      className="absolute bg-[#000000] box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Container385 />
    </div>
  );
}

function Heading45() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[88px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container386() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[116.18px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder36() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[165.19px] left-0 right-[1008px] rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Background66 />
      <Heading45 />
      <Container386 />
    </div>
  );
}

function Container387() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[24px] text-nowrap">
        <p className="block leading-[36px] whitespace-pre">⚡</p>
      </div>
    </div>
  );
}

function Background67() {
  return (
    <div
      className="absolute bg-[#000000] box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Container387 />
    </div>
  );
}

function Heading46() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[88px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container388() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[116.18px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder37() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[165.19px] left-[504px] right-[504px] rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Background67 />
      <Heading46 />
      <Container388 />
    </div>
  );
}

function Container389() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[24px] text-nowrap">
        <p className="block leading-[36px] whitespace-pre">📍</p>
      </div>
    </div>
  );
}

function Background68() {
  return (
    <div
      className="absolute bg-[#000000] box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Container389 />
    </div>
  );
}

function Heading47() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[88px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container390() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[116.18px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder38() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[165.19px] left-[1008px] right-0 rounded-[32px] top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Background68 />
      <Heading47 />
      <Container390 />
    </div>
  );
}

function Container391() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[24px] text-nowrap">
        <p className="block leading-[36px] whitespace-pre">💰</p>
      </div>
    </div>
  );
}

function Background69() {
  return (
    <div
      className="absolute bg-[#000000] box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Container391 />
    </div>
  );
}

function Heading48() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[88px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container392() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[116.19px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder39() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[165.19px] left-0 right-[1008px] rounded-[32px] top-[189.18px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Background69 />
      <Heading48 />
      <Container392 />
    </div>
  );
}

function Container393() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[24px] text-nowrap">
        <p className="block leading-[36px] whitespace-pre">📱</p>
      </div>
    </div>
  );
}

function Background70() {
  return (
    <div
      className="absolute bg-[#000000] box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Container393 />
    </div>
  );
}

function Heading49() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[88px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container394() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[116.19px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder40() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[165.19px] left-[504px] right-[504px] rounded-[32px] top-[189.18px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Background70 />
      <Heading49 />
      <Container394 />
    </div>
  );
}

function Container395() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[24px] text-nowrap">
        <p className="block leading-[36px] whitespace-pre">🎧</p>
      </div>
    </div>
  );
}

function Background71() {
  return (
    <div
      className="absolute bg-[#000000] box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Container395 />
    </div>
  );
}

function Heading50() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[88px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container396() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[116.19px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder41() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[165.19px] left-[1008px] right-0 rounded-[32px] top-[189.18px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
      <Background71 />
      <Heading50 />
      <Container396 />
    </div>
  );
}

function Container397() {
  return (
    <div className="h-[354.38px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder36 />
      <BackgroundBorder37 />
      <BackgroundBorder38 />
      <BackgroundBorder39 />
      <BackgroundBorder40 />
      <BackgroundBorder41 />
    </div>
  );
}

function Container398() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-8 items-start justify-start pb-0 pt-[39px] px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading44 />
      <Container397 />
    </div>
  );
}

function Container399() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Container">
      <div className="max-w-inherit relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start max-w-inherit pb-24 pt-8 px-6 relative w-full">
          <Container7 />
          <Background3 />
          <Container384 />
          <Container398 />
        </div>
      </div>
    </div>
  );
}

function Background72() {
  return (
    <div className="bg-[#ffffff] relative shrink-0 w-full" data-name="Background">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start px-48 py-0 relative w-full">
          <Container399 />
        </div>
      </div>
    </div>
  );
}

function Heading51() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_'Noto_Sans_KR:Bold',_sans-serif] font-normal justify-center leading-[68.64px] not-italic relative shrink-0 text-[#ffffff] text-[0px] text-[62.4px] text-center tracking-[-1.56px] w-full">
        <p className="mb-0">
          <span className="font-['Inter:Regular',_'Noto_Sans_KR:Regular',_'Noto_Sans_KR:Bold',_sans-serif] font-normal">{`여행 계획과 함께하는 `}</span>
          <span className="font-['Inter:Semi_Bold',_'Noto_Sans_KR:Regular',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold">
            AI 오
          </span>
        </p>
        <p className="block font-['Inter:Semi_Bold',_'Noto_Sans_KR:Regular',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold">
          디오 가이드
        </p>
      </div>
    </div>
  );
}

function Container400() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[41.6px] not-italic relative shrink-0 text-[26px] text-center text-neutral-300 w-full">
        <p className="block mb-0">생성된 여행 계획에 따라 각 장소에서 자동으로 맞춤형 오디오 가이</p>
        <p className="block">드가 제공됩니다</p>
      </div>
    </div>
  );
}

function Container401() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[32px] text-center text-nowrap">
        <p className="block leading-[44.8px] whitespace-pre">🎧</p>
      </div>
    </div>
  );
}

function Background73() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex items-center justify-center left-1/2 pb-[9.61px] pt-[8.59px] px-0 rounded-[9999px] size-16 top-0 translate-x-[-50%]"
      data-name="Background"
    >
      <Container401 />
    </div>
  );
}

function Heading52() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 right-0 top-[79px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">자동 재생</p>
      </div>
    </div>
  );
}

function Container402() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 right-0 top-[107.19px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-neutral-300 text-nowrap whitespace-pre">
        <p className="block mb-0">목적지에 도착하면 자동으로 해당</p>
        <p className="block">장소의 가이드가 시작됩니다</p>
      </div>
    </div>
  );
}

function Container403() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative self-stretch shrink-0" data-name="Container">
      <Background73 />
      <Heading52 />
      <Container402 />
    </div>
  );
}

function Container404() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[32px] text-center text-nowrap">
        <p className="block leading-[44.8px] whitespace-pre">🎯</p>
      </div>
    </div>
  );
}

function Background74() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex items-center justify-center left-1/2 pb-[9.61px] pt-[8.59px] px-0 rounded-[9999px] size-16 top-0 translate-x-[-50%]"
      data-name="Background"
    >
      <Container404 />
    </div>
  );
}

function Heading53() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 right-0 top-[79px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">개인 맞춤형</p>
      </div>
    </div>
  );
}

function Container405() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 right-0 top-[107.19px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-neutral-300 text-nowrap whitespace-pre">
        <p className="block mb-0">당신의 관심사와 여행 스타일에</p>
        <p className="block">맞춰 개인화된 설명을 제공합니다</p>
      </div>
    </div>
  );
}

function Container406() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative self-stretch shrink-0" data-name="Container">
      <Background74 />
      <Heading53 />
      <Container405 />
    </div>
  );
}

function Container407() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[32px] text-center text-nowrap">
        <p className="block leading-[44.8px] whitespace-pre">🔄</p>
      </div>
    </div>
  );
}

function Background75() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex items-center justify-center left-1/2 pb-[9.61px] pt-[8.59px] px-0 rounded-[9999px] size-16 top-0 translate-x-[-50%]"
      data-name="Background"
    >
      <Container407 />
    </div>
  );
}

function Heading54() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 right-0 top-[79px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="adjustLetterSpacing block leading-[19.2px] whitespace-pre">실시간 업데이트</p>
      </div>
    </div>
  );
}

function Container408() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-0 p-0 right-0 top-[107.19px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[16px] text-center text-neutral-300 text-nowrap whitespace-pre">
        <p className="block mb-0">여행 중 계획 변경 시 즉시 새로운</p>
        <p className="block">가이드 정보로 업데이트됩니다</p>
      </div>
    </div>
  );
}

function Container409() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative self-stretch shrink-0" data-name="Container">
      <Background75 />
      <Heading54 />
      <Container408 />
    </div>
  );
}

function Container410() {
  return (
    <div
      className="box-border content-stretch flex gap-6 items-start justify-center px-0 py-[8.7px] relative shrink-0 w-full"
      data-name="Container"
    >
      <Container403 />
      <Container406 />
      <Container409 />
    </div>
  );
}

function Component8() {
  return (
    <div
      className="bg-[#ffffff] box-border content-stretch flex items-center justify-center px-6 py-3 relative rounded-3xl shrink-0"
      data-name="Component 8"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">통합 서비스 체험하기</p>
      </div>
    </div>
  );
}

function Container411() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[23.3px] items-center justify-start max-w-[768px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading51 />
      <Container400 />
      <Container410 />
      <Component8 />
    </div>
  );
}

function Section() {
  return (
    <div className="bg-[#000000] relative shrink-0 w-full" data-name="Section">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pb-16 pt-[62.82px] px-[576px] relative w-full">
          <Container411 />
        </div>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div
      className="bg-neutral-50 box-border content-stretch flex flex-col items-start justify-start min-h-[1200px] p-0 relative shrink-0 w-full z-[1]"
      data-name="Main"
    >
      <Background72 />
      <Section />
    </div>
  );
}

function Component47() {
  return (
    <div className="relative shrink-0 size-5" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Component 1">
          <path
            d={svgPaths.p2110f1c0}
            id="Vector"
            stroke="var(--stroke-0, #4F46E5)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d="M2.5 2.5V6.66667H6.66667"
            id="Vector_2"
            stroke="var(--stroke-0, #4F46E5)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.pc8ce200}
            id="Vector_3"
            stroke="var(--stroke-0, #4F46E5)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Heading55() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-neutral-900 text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">Search History</p>
      </div>
    </div>
  );
}

function Container412() {
  return (
    <div
      className="box-border content-stretch flex gap-2 items-center justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Component47 />
      <Heading55 />
    </div>
  );
}

function Component48() {
  return (
    <div className="relative shrink-0 size-5" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Component 1">
          <path
            d="M15 5L5 15"
            id="Vector"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d="M5 5L15 15"
            id="Vector_2"
            stroke="var(--stroke-0, black)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Component49() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-[8px] relative rounded-3xl shrink-0"
      data-name="Component 2"
    >
      <Component48 />
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none"
      />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-[17px] pt-4 px-4 relative w-full">
          <Container412 />
          <Component49 />
        </div>
      </div>
    </div>
  );
}

function Container413() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-clip p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 w-full">
        <p className="block leading-[normal]">Search in history</p>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-start justify-center pl-[41px] pr-[17px] py-[11px] relative w-full">
          <Container413 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
    </div>
  );
}

function Component50() {
  return (
    <div className="absolute left-3 size-4 top-1/2 translate-y-[-50%]" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path
            d="M14 14L11.1067 11.1067"
            id="Vector"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
          <path
            d={svgPaths.p107a080}
            id="Vector_2"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.33333"
          />
        </g>
      </svg>
    </div>
  );
}

function Container414() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Input2 />
      <Component50 />
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none"
      />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pb-[17px] pt-4 px-4 relative w-full">
          <Container414 />
        </div>
      </div>
    </div>
  );
}

function Component51() {
  return (
    <div className="absolute left-1/2 size-12 top-4 translate-x-[-50%]" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Component 1">
          <path
            d={svgPaths.p1c2f3080}
            id="Vector"
            stroke="var(--stroke-0, #D4D4D4)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d="M6 6V16H16"
            id="Vector_2"
            stroke="var(--stroke-0, #D4D4D4)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d="M24 14V24L32 28"
            id="Vector_3"
            stroke="var(--stroke-0, #D4D4D4)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

function Container415() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-4 p-0 right-4 top-[71px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-500 text-nowrap">
        <p className="block leading-[27.2px] whitespace-pre">No search history</p>
      </div>
    </div>
  );
}

function Container416() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-center justify-start left-4 p-0 right-4 top-[103.19px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-400 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Search places</p>
      </div>
    </div>
  );
}

function Container417() {
  return (
    <div className="h-[143.19px] relative shrink-0 w-full" data-name="Container">
      <Component51 />
      <Container415 />
      <Container416 />
    </div>
  );
}

function Container418() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-auto p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container417 />
    </div>
  );
}

function Container419() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <HorizontalBorder />
      <HorizontalBorder1 />
      <Container418 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col h-[1200px] items-start justify-start left-[1920px] max-w-[1728px] overflow-clip p-0 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-0 w-80 z-[3]"
      data-name="Background+Shadow"
    >
      <Container419 />
    </div>
  );
}

function Component1920WLight() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col isolate items-start justify-start left-[100px] min-h-[1200px] p-0 right-[100px] top-[100px]"
      data-name="1920w light"
    >
      <BackgroundShadow />
      <Header />
      <Main />
    </div>
  );
}

export default function NavidocentComEnglishUsByHtmlToDesignFreeVersion20082025222722Gmt9() {
  return (
    <div
      className="bg-[#444444] relative rounded-sm size-full"
      data-name="navidocent.com (English-US) by html.to.design ❤️ FREE version - 20/08/2025, 22:27:22 GMT+9"
    >
      <div className="overflow-clip relative size-full">
        <Component1920WLight />
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-sm"
      />
    </div>
  );
}