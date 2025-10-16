import svgPaths from "./svg-zyb2w4zos";

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">T</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#000000] content-stretch flex items-center justify-center relative rounded-[10px] shrink-0 size-8" data-name="Background">
      <Container />
    </div>
  );
}

function Component3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Component 3">
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[24px] text-nowrap">
        <p className="leading-[36px] whitespace-pre">TripRadio.AI</p>
      </div>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0" data-name="Link:margin">
      <Component3 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-center justify-start relative shrink-0" data-name="Container">
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
          <path d={svgPaths.p3dcdd780} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Component2() {
  return (
    <div className="box-border content-stretch flex items-center justify-start px-3 py-1.5 relative rounded-3xl shrink-0" data-name="Component 2">
      <Component1 />
    </div>
  );
}

function ButtonMargin() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start justify-start left-[98.54px] pl-2 pr-0 py-0 top-1" data-name="Button:margin">
      <Component2 />
    </div>
  );
}

function Component12() {
  return (
    <div className="relative shrink-0 size-4" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path d={svgPaths.p399eca00} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.pc93b400} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-1 pr-0 py-0 relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">Sign In</p>
      </div>
    </div>
  );
}

function Component4() {
  return (
    <div className="box-border content-stretch flex items-center justify-start px-3 py-1.5 relative rounded-3xl shrink-0" data-name="Component 4">
      <Component12 />
      <Margin />
    </div>
  );
}

function LinkMargin1() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start justify-start left-[146.54px] pl-2 pr-0 py-0 top-0" data-name="Link:margin">
      <Component4 />
    </div>
  );
}

function Component13() {
  return (
    <div className="relative shrink-0 size-4" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p14d10c00} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M1.33333 8H14.6667" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">English</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pl-1 pr-0 py-0 relative shrink-0" data-name="Margin">
      <Container2 />
    </div>
  );
}

function Component5() {
  return (
    <div className="box-border content-stretch flex items-center justify-start px-3 py-1.5 relative rounded-3xl shrink-0" data-name="Component 5">
      <Component13 />
      <Margin1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-start left-0 top-1/2 translate-y-[-50%]" data-name="Container">
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
    <div className="content-stretch flex h-16 items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container4 />
    </div>
  );
}

function Header() {
  return (
    <div className="backdrop-blur-[10px] backdrop-filter bg-[rgba(255,255,255,0.8)] shrink-0 sticky top-0 w-full z-[2]" data-name="Header">
      <div aria-hidden="true" className="absolute border border-[rgba(229,231,235,0.04)] border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start px-[352px] py-px relative w-full">
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex items-center justify-center left-[398.83px] px-[25px] py-[13px] rounded-[9999px] top-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">badge</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-0 right-0 top-[82px]" data-name="Heading 1">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[40px] text-center text-nowrap tracking-[-1px]">
        <p className="leading-[48px] whitespace-pre">Travel to Movie</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-0 right-0 top-[153px]" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[48px] text-center text-nowrap tracking-[-1.2px]">
        <p className="leading-[62.4px] whitespace-pre">Filming Locations</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-16 max-w-[768px] right-16 top-[248.39px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[20px] text-center text-nowrap">
        <p className="leading-[32px] whitespace-pre">Plan a special trip to filming locations of your favorite movies.</p>
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="absolute h-[280.39px] left-[512px] right-[512px] top-16" data-name="Section">
      <BackgroundBorder />
      <Heading1 />
      <Heading2 />
      <Container6 />
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-center justify-start min-h-px min-w-px overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-500 w-full">
        <p className="leading-[normal]">placeholder</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#ffffff] min-h-11 relative rounded-3xl shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center min-h-inherit overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-start justify-center min-h-inherit px-[17px] py-[19px] relative w-full">
          <Container7 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center w-full">
        <p className="leading-[24px]">examples</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col gap-2 items-start justify-start max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <Input />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">genre</p>
      </div>
    </div>
  );
}

function Component6() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">all</p>
      </div>
    </div>
  );
}

function Component14() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">action</p>
      </div>
    </div>
  );
}

function Component15() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">romance</p>
      </div>
    </div>
  );
}

function Component16() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">thriller</p>
      </div>
    </div>
  );
}

function Component17() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">drama</p>
      </div>
    </div>
  );
}

function Component18() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">sf</p>
      </div>
    </div>
  );
}

function Component19() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex flex-col items-center justify-center px-4 py-2 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">animation</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-start flex flex-wrap gap-2 items-start justify-start relative shrink-0" data-name="Container">
      <Component6 />
      <Component14 />
      <Component15 />
      <Component16 />
      <Component17 />
      <Component18 />
      <Component19 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-2 items-center justify-start relative self-stretch shrink-0" data-name="Container">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-wrap gap-0 items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container12 />
    </div>
  );
}

function Section1() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col gap-6 items-center justify-start left-96 p-[24px] right-96 rounded-3xl top-[440.39px]" data-name="Section">
      <Container9 />
      <Container13 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[0.8px] pt-0 px-0 relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[32px] text-nowrap tracking-[-0.8px]">
        <p className="leading-[44.8px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Component20() {
  return (
    <div className="relative shrink-0 size-6" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Component 1">
          <path d="M7.2 9.6L12 14.4L16.8 9.6" id="Vector" stroke="var(--stroke-0, #737373)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
}

function ImageFill() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[42px] items-end justify-center left-0 overflow-clip pl-[82px] pr-[9px] py-[9px] top-0 w-[115px]" data-name="image fill">
      <Component20 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start justify-start left-[17px] overflow-clip pl-0 pr-[4.89px] py-0 top-1/2 translate-y-[-50%]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">popularity</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="bg-[#ffffff] relative rounded-3xl self-stretch shrink-0 w-[115px]" data-name="Options">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <ImageFill />
      <Container14 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex items-start justify-start relative shrink-0" data-name="Container">
      <Options />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading6 />
      <Container15 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2019 · thriller</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading3 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background1 />
      <Container18 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">95%</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Background2 />
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">easy</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder1 />
      <Container21 />
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container20 />
          <Container22 />
        </div>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background3 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading5 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin2 />
      <Container25 />
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background4 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading7 />
      <Container27 />
      <Container28 />
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin3 />
      <Container29 />
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background5 />
    </div>
  );
}

function Heading8() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading8 />
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin4 />
      <Container33 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Container30 />
      <Container34 />
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading4 />
          <Container35 />
        </div>
      </div>
    </div>
  );
}

function Component7() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component8() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-0" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder />
        <Container36 />
        <Component7 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading9() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2021 · drama</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading9 />
      <Container37 />
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background6 />
      <Container38 />
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">98%</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container39 />
      <Background7 />
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder2 />
      <Container41 />
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container40 />
          <Container42 />
        </div>
      </div>
    </div>
  );
}

function Heading10() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background8 />
    </div>
  );
}

function Heading11() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading11 />
      <Container43 />
      <Container44 />
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin5 />
      <Container45 />
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background9 />
    </div>
  );
}

function Heading12() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading12 />
      <Container47 />
      <Container48 />
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin6 />
      <Container49 />
    </div>
  );
}

function Background10() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin7() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background10 />
    </div>
  );
}

function Heading13() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading13 />
      <Container51 />
      <Container52 />
    </div>
  );
}

function Container54() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin7 />
      <Container53 />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container46 />
      <Container50 />
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading10 />
          <Container55 />
        </div>
      </div>
    </div>
  );
}

function Component21() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component22() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-0" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder1 />
        <Container56 />
        <Component21 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background11() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading14() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2019 · romance</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading14 />
      <Container57 />
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background11 />
      <Container58 />
    </div>
  );
}

function Background12() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">92%</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container59 />
      <Background12 />
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-neutral-400 border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">hard</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder3 />
      <Container61 />
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container60 />
          <Container62 />
        </div>
      </div>
    </div>
  );
}

function Heading15() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background13() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin8() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background13 />
    </div>
  );
}

function Heading16() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading16 />
      <Container63 />
      <Container64 />
    </div>
  );
}

function Container66() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin8 />
      <Container65 />
    </div>
  );
}

function Background14() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin9() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background14 />
    </div>
  );
}

function Heading17() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading17 />
      <Container67 />
      <Container68 />
    </div>
  );
}

function Container70() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin9 />
      <Container69 />
    </div>
  );
}

function Background15() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin10() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background15 />
    </div>
  );
}

function Heading18() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading18 />
      <Container71 />
      <Container72 />
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin10 />
      <Container73 />
    </div>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container66 />
      <Container70 />
      <Container74 />
    </div>
  );
}

function Container76() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading15 />
          <Container75 />
        </div>
      </div>
    </div>
  );
}

function Component23() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component24() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-0" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder2 />
        <Container76 />
        <Component23 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background16() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading19() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2016 · fantasy</p>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading19 />
      <Container77 />
    </div>
  );
}

function Container79() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background16 />
      <Container78 />
    </div>
  );
}

function Background17() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">93%</p>
      </div>
    </div>
  );
}

function Container80() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container79 />
      <Background17 />
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">easy</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder4 />
      <Container81 />
    </div>
  );
}

function HorizontalBorder3() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container80 />
          <Container82 />
        </div>
      </div>
    </div>
  );
}

function Heading20() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background18() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin11() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background18 />
    </div>
  );
}

function Heading21() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading21 />
      <Container83 />
      <Container84 />
    </div>
  );
}

function Container86() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin11 />
      <Container85 />
    </div>
  );
}

function Background19() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin12() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background19 />
    </div>
  );
}

function Heading22() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container88() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading22 />
      <Container87 />
      <Container88 />
    </div>
  );
}

function Container90() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin12 />
      <Container89 />
    </div>
  );
}

function Background20() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin13() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background20 />
    </div>
  );
}

function Heading23() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container91() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container92() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container93() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading23 />
      <Container91 />
      <Container92 />
    </div>
  );
}

function Container94() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin13 />
      <Container93 />
    </div>
  );
}

function Container95() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container86 />
      <Container90 />
      <Container94 />
    </div>
  );
}

function Container96() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.99px] items-start justify-start pb-[24.01px] pt-[23px] px-6 relative w-full">
          <Heading20 />
          <Container95 />
        </div>
      </div>
    </div>
  );
}

function Component25() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component26() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[541.34px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[24.99px] pt-px px-px relative w-full">
        <HorizontalBorder3 />
        <Container96 />
        <Component25 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background21() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading24() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2004 · war</p>
      </div>
    </div>
  );
}

function Container98() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading24 />
      <Container97 />
    </div>
  );
}

function Container99() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background21 />
      <Container98 />
    </div>
  );
}

function Background22() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">88%</p>
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container99 />
      <Background22 />
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container102() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder5 />
      <Container101 />
    </div>
  );
}

function HorizontalBorder4() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container100 />
          <Container102 />
        </div>
      </div>
    </div>
  );
}

function Heading25() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background23() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin14() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background23 />
    </div>
  );
}

function Heading26() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container103() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container104() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading26 />
      <Container103 />
      <Container104 />
    </div>
  );
}

function Container106() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin14 />
      <Container105 />
    </div>
  );
}

function Background24() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin15() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background24 />
    </div>
  );
}

function Heading27() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container108() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container109() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading27 />
      <Container107 />
      <Container108 />
    </div>
  );
}

function Container110() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin15 />
      <Container109 />
    </div>
  );
}

function Background25() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin16() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background25 />
    </div>
  );
}

function Heading28() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">name</p>
      </div>
    </div>
  );
}

function Container111() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">area</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">description</p>
      </div>
    </div>
  );
}

function Container113() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading28 />
      <Container111 />
      <Container112 />
    </div>
  );
}

function Container114() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin16 />
      <Container113 />
    </div>
  );
}

function Container115() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container106 />
      <Container110 />
      <Container114 />
    </div>
  );
}

function Container116() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.99px] items-start justify-start pb-[24.01px] pt-[23px] px-6 relative w-full">
          <Heading25 />
          <Container115 />
        </div>
      </div>
    </div>
  );
}

function Component27() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component28() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[541.34px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[24.99px] pt-px px-px relative w-full">
        <HorizontalBorder4 />
        <Container116 />
        <Component27 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background26() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading29() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">미나리</p>
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2020 · drama</p>
      </div>
    </div>
  );
}

function Container118() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading29 />
      <Container117 />
    </div>
  );
}

function Container119() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background26 />
      <Container118 />
    </div>
  );
}

function Background27() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">85%</p>
      </div>
    </div>
  );
}

function Container120() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="content-stretch flex items-start justify-between relative w-full">
          <Container119 />
          <Background27 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder6() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-neutral-400 border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">hard</p>
      </div>
    </div>
  );
}

function Container121() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2개 촬영지</p>
      </div>
    </div>
  );
}

function Container122() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder6 />
      <Container121 />
    </div>
  );
}

function HorizontalBorder5() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container120 />
          <Container122 />
        </div>
      </div>
    </div>
  );
}

function Heading30() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background28() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin17() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background28 />
    </div>
  );
}

function Heading31() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">털사</p>
      </div>
    </div>
  );
}

function Container123() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">오클라호마 주</p>
      </div>
    </div>
  );
}

function Container124() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">이민 가족의 농장</p>
      </div>
    </div>
  );
}

function Container125() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading31 />
      <Container123 />
      <Container124 />
    </div>
  );
}

function Container126() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin17 />
      <Container125 />
    </div>
  );
}

function Background29() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin18() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background29 />
    </div>
  );
}

function Heading32() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">아칸소</p>
      </div>
    </div>
  );
}

function Container127() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">아칸소 주</p>
      </div>
    </div>
  );
}

function Container128() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">주요 배경지</p>
      </div>
    </div>
  );
}

function Container129() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading32 />
      <Container127 />
      <Container128 />
    </div>
  );
}

function Container130() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin18 />
      <Container129 />
    </div>
  );
}

function Container131() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container126 />
      <Container130 />
    </div>
  );
}

function Container132() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.99px] items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading30 />
          <Container131 />
        </div>
      </div>
    </div>
  );
}

function Component29() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component30() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[541.34px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[104.18px] pt-px px-px relative w-full">
        <HorizontalBorder5 />
        <Container132 />
        <Component29 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background30() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading33() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">어벤져스</p>
      </div>
    </div>
  );
}

function Container133() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2012 · action</p>
      </div>
    </div>
  );
}

function Container134() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading33 />
      <Container133 />
    </div>
  );
}

function Container135() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background30 />
      <Container134 />
    </div>
  );
}

function Background31() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">89%</p>
      </div>
    </div>
  );
}

function Container136() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container135 />
      <Background31 />
    </div>
  );
}

function BackgroundBorder7() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container137() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container138() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder7 />
      <Container137 />
    </div>
  );
}

function HorizontalBorder6() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container136 />
          <Container138 />
        </div>
      </div>
    </div>
  );
}

function Heading34() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background32() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin19() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background32 />
    </div>
  );
}

function Heading35() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">스타크 타워</p>
      </div>
    </div>
  );
}

function Container139() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">뉴욕 맨해튼</p>
      </div>
    </div>
  );
}

function Container140() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">아이언맨의 본거지</p>
      </div>
    </div>
  );
}

function Container141() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading35 />
      <Container139 />
      <Container140 />
    </div>
  );
}

function Container142() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin19 />
      <Container141 />
    </div>
  );
}

function Background33() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin20() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background33 />
    </div>
  );
}

function Heading36() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">중앙역</p>
      </div>
    </div>
  );
}

function Container143() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">뉴욕 맨해튼</p>
      </div>
    </div>
  );
}

function Container144() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">최종 결전 장면</p>
      </div>
    </div>
  );
}

function Container145() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading36 />
      <Container143 />
      <Container144 />
    </div>
  );
}

function Container146() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin20 />
      <Container145 />
    </div>
  );
}

function Background34() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin21() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background34 />
    </div>
  );
}

function Heading37() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">타임스퀘어</p>
      </div>
    </div>
  );
}

function Container147() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">뉴욕 맨해튼</p>
      </div>
    </div>
  );
}

function Container148() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">외계인 침공 장면</p>
      </div>
    </div>
  );
}

function Container149() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading37 />
      <Container147 />
      <Container148 />
    </div>
  );
}

function Container150() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin21 />
      <Container149 />
    </div>
  );
}

function Container151() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container142 />
      <Container146 />
      <Container150 />
    </div>
  );
}

function Container152() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading34 />
          <Container151 />
        </div>
      </div>
    </div>
  );
}

function Component31() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component32() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[1082.69px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder6 />
        <Container152 />
        <Component31 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background35() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading38() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">인터스텔라</p>
      </div>
    </div>
  );
}

function Container153() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2014 · s f</p>
      </div>
    </div>
  );
}

function Container154() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading38 />
      <Container153 />
    </div>
  );
}

function Container155() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background35 />
      <Container154 />
    </div>
  );
}

function Background36() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">91%</p>
      </div>
    </div>
  );
}

function Container156() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container155 />
      <Background36 />
    </div>
  );
}

function BackgroundBorder8() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-neutral-400 border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">hard</p>
      </div>
    </div>
  );
}

function Container157() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container158() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder8 />
      <Container157 />
    </div>
  );
}

function HorizontalBorder7() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container156 />
          <Container158 />
        </div>
      </div>
    </div>
  );
}

function Heading39() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background37() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin22() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background37 />
    </div>
  );
}

function Heading40() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">아이슬란드 빙하</p>
      </div>
    </div>
  );
}

function Container159() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">아이슬란드</p>
      </div>
    </div>
  );
}

function Container160() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">얼음 행성 장면</p>
      </div>
    </div>
  );
}

function Container161() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading40 />
      <Container159 />
      <Container160 />
    </div>
  );
}

function Container162() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin22 />
      <Container161 />
    </div>
  );
}

function Background38() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin23() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background38 />
    </div>
  );
}

function Heading41() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">앨버타 평원</p>
      </div>
    </div>
  );
}

function Container163() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캐나다</p>
      </div>
    </div>
  );
}

function Container164() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">옥수수밭 장면</p>
      </div>
    </div>
  );
}

function Container165() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading41 />
      <Container163 />
      <Container164 />
    </div>
  );
}

function Container166() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin23 />
      <Container165 />
    </div>
  );
}

function Background39() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin24() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background39 />
    </div>
  );
}

function Heading42() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">로스앤젤레스</p>
      </div>
    </div>
  );
}

function Container167() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container168() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">NASA 본부</p>
      </div>
    </div>
  );
}

function Container169() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading42 />
      <Container167 />
      <Container168 />
    </div>
  );
}

function Container170() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin24 />
      <Container169 />
    </div>
  );
}

function Container171() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container162 />
      <Container166 />
      <Container170 />
    </div>
  );
}

function Container172() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading39 />
          <Container171 />
        </div>
      </div>
    </div>
  );
}

function Component33() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component34() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[1082.69px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder7 />
        <Container172 />
        <Component33 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background40() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading43() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">라라랜드</p>
      </div>
    </div>
  );
}

function Container173() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2016 · musical</p>
      </div>
    </div>
  );
}

function Container174() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading43 />
      <Container173 />
    </div>
  );
}

function Container175() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background40 />
      <Container174 />
    </div>
  );
}

function Background41() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">87%</p>
      </div>
    </div>
  );
}

function Container176() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container175 />
      <Background41 />
    </div>
  );
}

function BackgroundBorder9() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container177() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container178() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder9 />
      <Container177 />
    </div>
  );
}

function HorizontalBorder8() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container176 />
          <Container178 />
        </div>
      </div>
    </div>
  );
}

function Heading44() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background42() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin25() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background42 />
    </div>
  );
}

function Heading45() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">그리피스 천문대</p>
      </div>
    </div>
  );
}

function Container179() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">로스앤젤레스</p>
      </div>
    </div>
  );
}

function Container180() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">데이트 장면</p>
      </div>
    </div>
  );
}

function Container181() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading45 />
      <Container179 />
      <Container180 />
    </div>
  );
}

function Container182() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin25 />
      <Container181 />
    </div>
  );
}

function Background43() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin26() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background43 />
    </div>
  );
}

function Heading46() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">허모사 비치</p>
      </div>
    </div>
  );
}

function Container183() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container184() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">해변 댄스</p>
      </div>
    </div>
  );
}

function Container185() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading46 />
      <Container183 />
      <Container184 />
    </div>
  );
}

function Container186() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin26 />
      <Container185 />
    </div>
  );
}

function Background44() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin27() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background44 />
    </div>
  );
}

function Heading47() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">선셋 스트립</p>
      </div>
    </div>
  );
}

function Container187() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">할리우드</p>
      </div>
    </div>
  );
}

function Container188() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">재즈클럽</p>
      </div>
    </div>
  );
}

function Container189() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading47 />
      <Container187 />
      <Container188 />
    </div>
  );
}

function Container190() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin27 />
      <Container189 />
    </div>
  );
}

function Container191() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container182 />
      <Container186 />
      <Container190 />
    </div>
  );
}

function Container192() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading44 />
          <Container191 />
        </div>
      </div>
    </div>
  );
}

function Component35() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component36() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[1082.69px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder8 />
        <Container192 />
        <Component35 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background45() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading48() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">토이 스토리</p>
      </div>
    </div>
  );
}

function Container193() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">1995 · animation</p>
      </div>
    </div>
  );
}

function Container194() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading48 />
      <Container193 />
    </div>
  );
}

function Container195() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background45 />
      <Container194 />
    </div>
  );
}

function Background46() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">86%</p>
      </div>
    </div>
  );
}

function Container196() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container195 />
      <Background46 />
    </div>
  );
}

function BackgroundBorder10() {
  return (
    <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">easy</p>
      </div>
    </div>
  );
}

function Container197() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2개 촬영지</p>
      </div>
    </div>
  );
}

function Container198() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder10 />
      <Container197 />
    </div>
  );
}

function HorizontalBorder9() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container196 />
          <Container198 />
        </div>
      </div>
    </div>
  );
}

function Heading49() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background47() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin28() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background47 />
    </div>
  );
}

function Heading50() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">픽사 스튜디오</p>
      </div>
    </div>
  );
}

function Container199() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container200() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">제작사 본사</p>
      </div>
    </div>
  );
}

function Container201() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading50 />
      <Container199 />
      <Container200 />
    </div>
  );
}

function Container202() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin28 />
      <Container201 />
    </div>
  );
}

function Background48() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin29() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background48 />
    </div>
  );
}

function Heading51() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">샌프란시스코</p>
      </div>
    </div>
  );
}

function Container203() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container204() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">도시 배경</p>
      </div>
    </div>
  );
}

function Container205() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading51 />
      <Container203 />
      <Container204 />
    </div>
  );
}

function Container206() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin29 />
      <Container205 />
    </div>
  );
}

function Container207() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container202 />
      <Container206 />
    </div>
  );
}

function Container208() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[23.99px] pt-[23px] px-6 relative w-full">
          <Heading49 />
          <Container207 />
        </div>
      </div>
    </div>
  );
}

function Component37() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component38() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[1624.03px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[104.18px] pt-px px-px relative w-full">
        <HorizontalBorder9 />
        <Container208 />
        <Component37 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background49() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading52() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">겨울왕국</p>
      </div>
    </div>
  );
}

function Container209() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2013 · animation</p>
      </div>
    </div>
  );
}

function Container210() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading52 />
      <Container209 />
    </div>
  );
}

function Container211() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background49 />
      <Container210 />
    </div>
  );
}

function Background50() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">94%</p>
      </div>
    </div>
  );
}

function Container212() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="content-stretch flex items-start justify-between relative w-full">
          <Container211 />
          <Background50 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder11() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container213() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container214() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder11 />
      <Container213 />
    </div>
  );
}

function HorizontalBorder10() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container212 />
          <Container214 />
        </div>
      </div>
    </div>
  );
}

function Heading53() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background51() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin30() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background51 />
    </div>
  );
}

function Heading54() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">할슈타트</p>
      </div>
    </div>
  );
}

function Container215() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">오스트리아</p>
      </div>
    </div>
  );
}

function Container216() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">아렌델 왕국의 모티브</p>
      </div>
    </div>
  );
}

function Container217() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading54 />
      <Container215 />
      <Container216 />
    </div>
  );
}

function Container218() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin30 />
      <Container217 />
    </div>
  );
}

function Background52() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin31() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background52 />
    </div>
  );
}

function Heading55() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">베르겐</p>
      </div>
    </div>
  );
}

function Container219() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">노르웨이</p>
      </div>
    </div>
  );
}

function Container220() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">안나와 엘사의 고향 배경</p>
      </div>
    </div>
  );
}

function Container221() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading55 />
      <Container219 />
      <Container220 />
    </div>
  );
}

function Container222() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin31 />
      <Container221 />
    </div>
  );
}

function Background53() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin32() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background53 />
    </div>
  );
}

function Heading56() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">스톡홀름</p>
      </div>
    </div>
  );
}

function Container223() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">스웨덴</p>
      </div>
    </div>
  );
}

function Container224() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">성 내부 디자인 모티브</p>
      </div>
    </div>
  );
}

function Container225() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading56 />
      <Container223 />
      <Container224 />
    </div>
  );
}

function Container226() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin32 />
      <Container225 />
    </div>
  );
}

function Container227() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container218 />
      <Container222 />
      <Container226 />
    </div>
  );
}

function Container228() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading53 />
          <Container227 />
        </div>
      </div>
    </div>
  );
}

function Component39() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component40() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[1624.03px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder10 />
        <Container228 />
        <Component39 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background54() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading57() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">해리포터: 마법사의 돌</p>
      </div>
    </div>
  );
}

function Container229() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2001 · fantasy</p>
      </div>
    </div>
  );
}

function Container230() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start min-w-[152.38px] pb-[0.01px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading57 />
      <Container229 />
    </div>
  );
}

function Container231() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background54 />
      <Container230 />
    </div>
  );
}

function Background55() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">96%</p>
      </div>
    </div>
  );
}

function Container232() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container231 />
      <Background55 />
    </div>
  );
}

function BackgroundBorder12() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container233() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container234() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder12 />
      <Container233 />
    </div>
  );
}

function HorizontalBorder11() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container232 />
          <Container234 />
        </div>
      </div>
    </div>
  );
}

function Heading58() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background56() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin33() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background56 />
    </div>
  );
}

function Heading59() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">옥스퍼드 대학</p>
      </div>
    </div>
  );
}

function Container235() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">영국 옥스퍼드</p>
      </div>
    </div>
  );
}

function Container236() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">호그와트 내부</p>
      </div>
    </div>
  );
}

function Container237() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading59 />
      <Container235 />
      <Container236 />
    </div>
  );
}

function Container238() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin33 />
      <Container237 />
    </div>
  );
}

function Background57() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin34() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background57 />
    </div>
  );
}

function Heading60() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">앨닉 성</p>
      </div>
    </div>
  );
}

function Container239() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">영국 노섬벌랜드</p>
      </div>
    </div>
  );
}

function Container240() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">호그와트 외관</p>
      </div>
    </div>
  );
}

function Container241() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading60 />
      <Container239 />
      <Container240 />
    </div>
  );
}

function Container242() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin34 />
      <Container241 />
    </div>
  );
}

function Background58() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin35() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background58 />
    </div>
  );
}

function Heading61() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">킹스 크로스역</p>
      </div>
    </div>
  );
}

function Container243() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">런던</p>
      </div>
    </div>
  );
}

function Container244() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">9와 3/4 승강장</p>
      </div>
    </div>
  );
}

function Container245() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading61 />
      <Container243 />
      <Container244 />
    </div>
  );
}

function Container246() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin35 />
      <Container245 />
    </div>
  );
}

function Container247() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container238 />
      <Container242 />
      <Container246 />
    </div>
  );
}

function Container248() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading58 />
          <Container247 />
        </div>
      </div>
    </div>
  );
}

function Component41() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component42() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[1624.03px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder11 />
        <Container248 />
        <Component41 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background59() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading62() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">로마의 휴일</p>
      </div>
    </div>
  );
}

function Container249() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">1953 · romance</p>
      </div>
    </div>
  );
}

function Container250() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading62 />
      <Container249 />
    </div>
  );
}

function Container251() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background59 />
      <Container250 />
    </div>
  );
}

function Background60() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">88%</p>
      </div>
    </div>
  );
}

function Container252() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container251 />
      <Background60 />
    </div>
  );
}

function BackgroundBorder13() {
  return (
    <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">easy</p>
      </div>
    </div>
  );
}

function Container253() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container254() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder13 />
      <Container253 />
    </div>
  );
}

function HorizontalBorder12() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container252 />
          <Container254 />
        </div>
      </div>
    </div>
  );
}

function Heading63() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background61() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin36() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background61 />
    </div>
  );
}

function Heading64() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">트레비 분수</p>
      </div>
    </div>
  );
}

function Container255() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">이탈리아 로마</p>
      </div>
    </div>
  );
}

function Container256() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">동전 던지기 장면</p>
      </div>
    </div>
  );
}

function Container257() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading64 />
      <Container255 />
      <Container256 />
    </div>
  );
}

function Container258() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin36 />
      <Container257 />
    </div>
  );
}

function Background62() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin37() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background62 />
    </div>
  );
}

function Heading65() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">스페인 계단</p>
      </div>
    </div>
  );
}

function Container259() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">이탈리아 로마</p>
      </div>
    </div>
  );
}

function Container260() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">젤라토 먹는 장면</p>
      </div>
    </div>
  );
}

function Container261() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading65 />
      <Container259 />
      <Container260 />
    </div>
  );
}

function Container262() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin37 />
      <Container261 />
    </div>
  );
}

function Background63() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin38() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background63 />
    </div>
  );
}

function Heading66() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">콜로세움</p>
      </div>
    </div>
  );
}

function Container263() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">이탈리아 로마</p>
      </div>
    </div>
  );
}

function Container264() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">관광 장면</p>
      </div>
    </div>
  );
}

function Container265() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading66 />
      <Container263 />
      <Container264 />
    </div>
  );
}

function Container266() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin38 />
      <Container265 />
    </div>
  );
}

function Container267() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container258 />
      <Container262 />
      <Container266 />
    </div>
  );
}

function Container268() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.99px] items-start justify-start pb-[24.01px] pt-[23px] px-6 relative w-full">
          <Heading63 />
          <Container267 />
        </div>
      </div>
    </div>
  );
}

function Component43() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component44() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[2165.37px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[24.99px] pt-px px-px relative w-full">
        <HorizontalBorder12 />
        <Container268 />
        <Component43 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background64() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading67() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">아멜리에</p>
      </div>
    </div>
  );
}

function Container269() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2001 · romance</p>
      </div>
    </div>
  );
}

function Container270() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading67 />
      <Container269 />
    </div>
  );
}

function Container271() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background64 />
      <Container270 />
    </div>
  );
}

function Background65() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">90%</p>
      </div>
    </div>
  );
}

function Container272() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container271 />
      <Background65 />
    </div>
  );
}

function BackgroundBorder14() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container273() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container274() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder14 />
      <Container273 />
    </div>
  );
}

function HorizontalBorder13() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container272 />
          <Container274 />
        </div>
      </div>
    </div>
  );
}

function Heading68() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background66() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin39() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background66 />
    </div>
  );
}

function Heading69() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">몽마르트 언덕</p>
      </div>
    </div>
  );
}

function Container275() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">프랑스 파리</p>
      </div>
    </div>
  );
}

function Container276() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">아멜리의 동네</p>
      </div>
    </div>
  );
}

function Container277() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading69 />
      <Container275 />
      <Container276 />
    </div>
  );
}

function Container278() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin39 />
      <Container277 />
    </div>
  );
}

function Background67() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin40() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background67 />
    </div>
  );
}

function Heading70() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">사크레쾨르</p>
      </div>
    </div>
  );
}

function Container279() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">프랑스 파리</p>
      </div>
    </div>
  );
}

function Container280() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">전망 장면</p>
      </div>
    </div>
  );
}

function Container281() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading70 />
      <Container279 />
      <Container280 />
    </div>
  );
}

function Container282() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin40 />
      <Container281 />
    </div>
  );
}

function Background68() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin41() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background68 />
    </div>
  );
}

function Heading71() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">센강</p>
      </div>
    </div>
  );
}

function Container283() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">프랑스 파리</p>
      </div>
    </div>
  );
}

function Container284() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">로맨틱 산책</p>
      </div>
    </div>
  );
}

function Container285() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading71 />
      <Container283 />
      <Container284 />
    </div>
  );
}

function Container286() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin41 />
      <Container285 />
    </div>
  );
}

function Container287() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container278 />
      <Container282 />
      <Container286 />
    </div>
  );
}

function Container288() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.99px] items-start justify-start pb-[24.01px] pt-[23px] px-6 relative w-full">
          <Heading68 />
          <Container287 />
        </div>
      </div>
    </div>
  );
}

function Component45() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component46() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[2165.37px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[24.99px] pt-px px-px relative w-full">
        <HorizontalBorder13 />
        <Container288 />
        <Component45 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background69() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading72() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">너의 이름은</p>
      </div>
    </div>
  );
}

function Container289() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2016 · animation</p>
      </div>
    </div>
  );
}

function Container290() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading72 />
      <Container289 />
    </div>
  );
}

function Container291() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background69 />
      <Container290 />
    </div>
  );
}

function Background70() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">93%</p>
      </div>
    </div>
  );
}

function Container292() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container291 />
      <Background70 />
    </div>
  );
}

function BackgroundBorder15() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container293() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container294() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder15 />
      <Container293 />
    </div>
  );
}

function HorizontalBorder14() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container292 />
          <Container294 />
        </div>
      </div>
    </div>
  );
}

function Heading73() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background71() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin42() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background71 />
    </div>
  );
}

function Heading74() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">스가 신사</p>
      </div>
    </div>
  );
}

function Container295() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">일본 도쿄</p>
      </div>
    </div>
  );
}

function Container296() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">계단 명장면</p>
      </div>
    </div>
  );
}

function Container297() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading74 />
      <Container295 />
      <Container296 />
    </div>
  );
}

function Container298() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin42 />
      <Container297 />
    </div>
  );
}

function Background72() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin43() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background72 />
    </div>
  );
}

function Heading75() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">히다시</p>
      </div>
    </div>
  );
}

function Container299() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">일본 기후현</p>
      </div>
    </div>
  );
}

function Container300() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">시골 마을 배경</p>
      </div>
    </div>
  );
}

function Container301() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading75 />
      <Container299 />
      <Container300 />
    </div>
  );
}

function Container302() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin43 />
      <Container301 />
    </div>
  );
}

function Background73() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin44() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background73 />
    </div>
  );
}

function Heading76() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">이타모리 호수</p>
      </div>
    </div>
  );
}

function Container303() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">일본 나가노현</p>
      </div>
    </div>
  );
}

function Container304() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">운석호 모티브</p>
      </div>
    </div>
  );
}

function Container305() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading76 />
      <Container303 />
      <Container304 />
    </div>
  );
}

function Container306() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin44 />
      <Container305 />
    </div>
  );
}

function Container307() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container298 />
      <Container302 />
      <Container306 />
    </div>
  );
}

function Container308() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[11.99px] items-start justify-start pb-[24.01px] pt-[23px] px-6 relative w-full">
          <Heading73 />
          <Container307 />
        </div>
      </div>
    </div>
  );
}

function Component47() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component48() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[2165.37px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[24.99px] pt-px px-px relative w-full">
        <HorizontalBorder14 />
        <Container308 />
        <Component47 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background74() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading77() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">센과 치히로의 행방불명</p>
      </div>
    </div>
  );
}

function Container309() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2001 · animation</p>
      </div>
    </div>
  );
}

function Container310() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start min-w-[163.27px] relative shrink-0" data-name="Container">
      <Heading77 />
      <Container309 />
    </div>
  );
}

function Container311() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background74 />
      <Container310 />
    </div>
  );
}

function Background75() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">95%</p>
      </div>
    </div>
  );
}

function Container312() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container311 />
      <Background75 />
    </div>
  );
}

function BackgroundBorder16() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container313() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container314() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder16 />
      <Container313 />
    </div>
  );
}

function HorizontalBorder15() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container312 />
          <Container314 />
        </div>
      </div>
    </div>
  );
}

function Heading78() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background76() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin45() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background76 />
    </div>
  );
}

function Heading79() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">도고 온천</p>
      </div>
    </div>
  );
}

function Container315() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">일본 에히메현</p>
      </div>
    </div>
  );
}

function Container316() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">목욕탕 모티브</p>
      </div>
    </div>
  );
}

function Container317() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading79 />
      <Container315 />
      <Container316 />
    </div>
  );
}

function Container318() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin45 />
      <Container317 />
    </div>
  );
}

function Background77() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin46() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background77 />
    </div>
  );
}

function Heading80() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">지브리 박물관</p>
      </div>
    </div>
  );
}

function Container319() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">일본 도쿄</p>
      </div>
    </div>
  );
}

function Container320() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">제작사 박물관</p>
      </div>
    </div>
  );
}

function Container321() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading80 />
      <Container319 />
      <Container320 />
    </div>
  );
}

function Container322() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin46 />
      <Container321 />
    </div>
  );
}

function Background78() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin47() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background78 />
    </div>
  );
}

function Heading81() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">구마모토 아소산</p>
      </div>
    </div>
  );
}

function Container323() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">일본 구마모토현</p>
      </div>
    </div>
  );
}

function Container324() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">자연 배경</p>
      </div>
    </div>
  );
}

function Container325() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading81 />
      <Container323 />
      <Container324 />
    </div>
  );
}

function Container326() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin47 />
      <Container325 />
    </div>
  );
}

function Container327() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container318 />
      <Container322 />
      <Container326 />
    </div>
  );
}

function Container328() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading78 />
          <Container327 />
        </div>
      </div>
    </div>
  );
}

function Component49() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component50() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[2706.72px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder15 />
        <Container328 />
        <Component49 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background79() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading82() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">와호장룡</p>
      </div>
    </div>
  );
}

function Container329() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2000 · martial-arts</p>
      </div>
    </div>
  );
}

function Container330() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading82 />
      <Container329 />
    </div>
  );
}

function Container331() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background79 />
      <Container330 />
    </div>
  );
}

function Background80() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">84%</p>
      </div>
    </div>
  );
}

function Container332() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="content-stretch flex items-start justify-between relative w-full">
          <Container331 />
          <Background80 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder17() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-neutral-400 border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">hard</p>
      </div>
    </div>
  );
}

function Container333() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container334() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder17 />
      <Container333 />
    </div>
  );
}

function HorizontalBorder16() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container332 />
          <Container334 />
        </div>
      </div>
    </div>
  );
}

function Heading83() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background81() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin48() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background81 />
    </div>
  );
}

function Heading84() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">우당산</p>
      </div>
    </div>
  );
}

function Container335() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">중국 후베이성</p>
      </div>
    </div>
  );
}

function Container336() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">무협 액션 장면</p>
      </div>
    </div>
  );
}

function Container337() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading84 />
      <Container335 />
      <Container336 />
    </div>
  );
}

function Container338() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin48 />
      <Container337 />
    </div>
  );
}

function Background82() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin49() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background82 />
    </div>
  );
}

function Heading85() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">자금성</p>
      </div>
    </div>
  );
}

function Container339() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">중국 베이징</p>
      </div>
    </div>
  );
}

function Container340() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">궁궐 장면</p>
      </div>
    </div>
  );
}

function Container341() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading85 />
      <Container339 />
      <Container340 />
    </div>
  );
}

function Container342() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin49 />
      <Container341 />
    </div>
  );
}

function Background83() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin50() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background83 />
    </div>
  );
}

function Heading86() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">대나무숲</p>
      </div>
    </div>
  );
}

function Container343() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">중국 저장성</p>
      </div>
    </div>
  );
}

function Container344() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">유명한 대나무숲 액션</p>
      </div>
    </div>
  );
}

function Container345() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading86 />
      <Container343 />
      <Container344 />
    </div>
  );
}

function Container346() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin50 />
      <Container345 />
    </div>
  );
}

function Container347() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container338 />
      <Container342 />
      <Container346 />
    </div>
  );
}

function Container348() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading83 />
          <Container347 />
        </div>
      </div>
    </div>
  );
}

function Component51() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component52() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[2706.72px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder16 />
        <Container348 />
        <Component51 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background84() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading87() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">기묘한 이야기</p>
      </div>
    </div>
  );
}

function Container349() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2016 · s f</p>
      </div>
    </div>
  );
}

function Container350() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading87 />
      <Container349 />
    </div>
  );
}

function Container351() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background84 />
      <Container350 />
    </div>
  );
}

function Background85() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">87%</p>
      </div>
    </div>
  );
}

function Container352() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container351 />
      <Background85 />
    </div>
  );
}

function BackgroundBorder18() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-neutral-400 border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">hard</p>
      </div>
    </div>
  );
}

function Container353() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container354() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder18 />
      <Container353 />
    </div>
  );
}

function HorizontalBorder17() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container352 />
          <Container354 />
        </div>
      </div>
    </div>
  );
}

function Heading88() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background86() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin51() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background86 />
    </div>
  );
}

function Heading89() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">호킨스 중학교</p>
      </div>
    </div>
  );
}

function Container355() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">조지아 주</p>
      </div>
    </div>
  );
}

function Container356() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">주인공들의 학교</p>
      </div>
    </div>
  );
}

function Container357() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading89 />
      <Container355 />
      <Container356 />
    </div>
  );
}

function Container358() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin51 />
      <Container357 />
    </div>
  );
}

function Background87() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin52() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background87 />
    </div>
  );
}

function Heading90() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">스타코트 몰</p>
      </div>
    </div>
  );
}

function Container359() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">조지아 주</p>
      </div>
    </div>
  );
}

function Container360() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">시즌3 주요 무대</p>
      </div>
    </div>
  );
}

function Container361() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading90 />
      <Container359 />
      <Container360 />
    </div>
  );
}

function Container362() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin52 />
      <Container361 />
    </div>
  );
}

function Background88() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin53() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background88 />
    </div>
  );
}

function Heading91() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">애틀랜타</p>
      </div>
    </div>
  );
}

function Container363() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">조지아 주</p>
      </div>
    </div>
  );
}

function Container364() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">대부분의 촬영지</p>
      </div>
    </div>
  );
}

function Container365() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading91 />
      <Container363 />
      <Container364 />
    </div>
  );
}

function Container366() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin53 />
      <Container365 />
    </div>
  );
}

function Container367() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container358 />
      <Container362 />
      <Container366 />
    </div>
  );
}

function Container368() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading88 />
          <Container367 />
        </div>
      </div>
    </div>
  );
}

function Component53() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component54() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[2706.72px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder17 />
        <Container368 />
        <Component53 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background89() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading92() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">킹덤</p>
      </div>
    </div>
  );
}

function Container369() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2019 · zombie</p>
      </div>
    </div>
  );
}

function Container370() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading92 />
      <Container369 />
    </div>
  );
}

function Container371() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background89 />
      <Container370 />
    </div>
  );
}

function Background90() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">86%</p>
      </div>
    </div>
  );
}

function Container372() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container371 />
      <Background90 />
    </div>
  );
}

function BackgroundBorder19() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container373() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container374() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder19 />
      <Container373 />
    </div>
  );
}

function HorizontalBorder18() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container372 />
          <Container374 />
        </div>
      </div>
    </div>
  );
}

function Heading93() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background91() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin54() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background91 />
    </div>
  );
}

function Heading94() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">문경새재</p>
      </div>
    </div>
  );
}

function Container375() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">경북 문경시</p>
      </div>
    </div>
  );
}

function Container376() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">조선 궁궐 세트</p>
      </div>
    </div>
  );
}

function Container377() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading94 />
      <Container375 />
      <Container376 />
    </div>
  );
}

function Container378() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin54 />
      <Container377 />
    </div>
  );
}

function Background92() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin55() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background92 />
    </div>
  );
}

function Heading95() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">해인사</p>
      </div>
    </div>
  );
}

function Container379() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">경남 합천군</p>
      </div>
    </div>
  );
}

function Container380() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">사찰 장면</p>
      </div>
    </div>
  );
}

function Container381() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading95 />
      <Container379 />
      <Container380 />
    </div>
  );
}

function Container382() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin55 />
      <Container381 />
    </div>
  );
}

function Background93() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin56() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background93 />
    </div>
  );
}

function Heading96() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">정동진</p>
      </div>
    </div>
  );
}

function Container383() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">강원 강릉시</p>
      </div>
    </div>
  );
}

function Container384() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">해안가 장면</p>
      </div>
    </div>
  );
}

function Container385() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading96 />
      <Container383 />
      <Container384 />
    </div>
  );
}

function Container386() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin56 />
      <Container385 />
    </div>
  );
}

function Container387() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container378 />
      <Container382 />
      <Container386 />
    </div>
  );
}

function Container388() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading93 />
          <Container387 />
        </div>
      </div>
    </div>
  );
}

function Component55() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component56() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[3248.06px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder18 />
        <Container388 />
        <Component55 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background94() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading97() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">존 윅</p>
      </div>
    </div>
  );
}

function Container389() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2014 · action</p>
      </div>
    </div>
  );
}

function Container390() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading97 />
      <Container389 />
    </div>
  );
}

function Container391() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background94 />
      <Container390 />
    </div>
  );
}

function Background95() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">88%</p>
      </div>
    </div>
  );
}

function Container392() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container391 />
      <Background95 />
    </div>
  );
}

function BackgroundBorder20() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container393() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container394() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder20 />
      <Container393 />
    </div>
  );
}

function HorizontalBorder19() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container392 />
          <Container394 />
        </div>
      </div>
    </div>
  );
}

function Heading98() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background96() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin57() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background96 />
    </div>
  );
}

function Heading99() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">컨티넨탈 호텔</p>
      </div>
    </div>
  );
}

function Container395() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">뉴욕 맨해튼</p>
      </div>
    </div>
  );
}

function Container396() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">킬러들의 호텔</p>
      </div>
    </div>
  );
}

function Container397() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading99 />
      <Container395 />
      <Container396 />
    </div>
  );
}

function Container398() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin57 />
      <Container397 />
    </div>
  );
}

function Background97() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin58() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background97 />
    </div>
  );
}

function Heading100() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">브루클린</p>
      </div>
    </div>
  );
}

function Container399() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">뉴욕</p>
      </div>
    </div>
  );
}

function Container400() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">존 윅의 집</p>
      </div>
    </div>
  );
}

function Container401() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading100 />
      <Container399 />
      <Container400 />
    </div>
  );
}

function Container402() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin58 />
      <Container401 />
    </div>
  );
}

function Background98() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin59() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background98 />
    </div>
  );
}

function Heading101() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">센트럴파크</p>
      </div>
    </div>
  );
}

function Container403() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">뉴욕</p>
      </div>
    </div>
  );
}

function Container404() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">추격 장면</p>
      </div>
    </div>
  );
}

function Container405() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading101 />
      <Container403 />
      <Container404 />
    </div>
  );
}

function Container406() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin59 />
      <Container405 />
    </div>
  );
}

function Container407() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container398 />
      <Container402 />
      <Container406 />
    </div>
  );
}

function Container408() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading98 />
          <Container407 />
        </div>
      </div>
    </div>
  );
}

function Component57() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component58() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[3248.06px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder19 />
        <Container408 />
        <Component57 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background99() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading102() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">미션 임파서블</p>
      </div>
    </div>
  );
}

function Container409() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start mb-[-0.01px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">1996 · action</p>
      </div>
    </div>
  );
}

function Container410() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[0.01px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading102 />
      <Container409 />
    </div>
  );
}

function Container411() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background99 />
      <Container410 />
    </div>
  );
}

function Background100() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">85%</p>
      </div>
    </div>
  );
}

function Container412() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="content-stretch flex items-start justify-between relative w-full">
          <Container411 />
          <Background100 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder21() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-neutral-400 border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">hard</p>
      </div>
    </div>
  );
}

function Container413() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container414() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder21 />
      <Container413 />
    </div>
  );
}

function HorizontalBorder20() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container412 />
          <Container414 />
        </div>
      </div>
    </div>
  );
}

function Heading103() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background101() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin60() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background101 />
    </div>
  );
}

function Heading104() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">버즈 할리파</p>
      </div>
    </div>
  );
}

function Container415() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">UAE 두바이</p>
      </div>
    </div>
  );
}

function Container416() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">톰 크루즈 건물 오르기</p>
      </div>
    </div>
  );
}

function Container417() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading104 />
      <Container415 />
      <Container416 />
    </div>
  );
}

function Container418() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin60 />
      <Container417 />
    </div>
  );
}

function Background102() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin61() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background102 />
    </div>
  );
}

function Heading105() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">시드니 오페라하우스</p>
      </div>
    </div>
  );
}

function Container419() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">호주</p>
      </div>
    </div>
  );
}

function Container420() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">추격 장면</p>
      </div>
    </div>
  );
}

function Container421() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading105 />
      <Container419 />
      <Container420 />
    </div>
  );
}

function Container422() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin61 />
      <Container421 />
    </div>
  );
}

function Background103() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin62() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background103 />
    </div>
  );
}

function Heading106() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">CIA 랭글리</p>
      </div>
    </div>
  );
}

function Container423() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">버지니아</p>
      </div>
    </div>
  );
}

function Container424() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">침투 장면</p>
      </div>
    </div>
  );
}

function Container425() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading106 />
      <Container423 />
      <Container424 />
    </div>
  );
}

function Container426() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin62 />
      <Container425 />
    </div>
  );
}

function Container427() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container418 />
      <Container422 />
      <Container426 />
    </div>
  );
}

function Container428() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading103 />
          <Container427 />
        </div>
      </div>
    </div>
  );
}

function Component59() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component60() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[3248.06px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder20 />
        <Container428 />
        <Component59 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background104() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading107() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">포레스트 검프</p>
      </div>
    </div>
  );
}

function Container429() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">1994 · drama</p>
      </div>
    </div>
  );
}

function Container430() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading107 />
      <Container429 />
    </div>
  );
}

function Container431() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background104 />
      <Container430 />
    </div>
  );
}

function Background105() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">92%</p>
      </div>
    </div>
  );
}

function Container432() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container431 />
      <Background105 />
    </div>
  );
}

function BackgroundBorder22() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container433() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container434() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder22 />
      <Container433 />
    </div>
  );
}

function HorizontalBorder21() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container432 />
          <Container434 />
        </div>
      </div>
    </div>
  );
}

function Heading108() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background106() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin63() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background106 />
    </div>
  );
}

function Heading109() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">새너 광장</p>
      </div>
    </div>
  );
}

function Container435() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">조지아 사바나</p>
      </div>
    </div>
  );
}

function Container436() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">벤치 장면</p>
      </div>
    </div>
  );
}

function Container437() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading109 />
      <Container435 />
      <Container436 />
    </div>
  );
}

function Container438() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin63 />
      <Container437 />
    </div>
  );
}

function Background107() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin64() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background107 />
    </div>
  );
}

function Heading110() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">링컨 메모리얼</p>
      </div>
    </div>
  );
}

function Container439() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">워싱턴 DC</p>
      </div>
    </div>
  );
}

function Container440() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">연설 장면</p>
      </div>
    </div>
  );
}

function Container441() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading110 />
      <Container439 />
      <Container440 />
    </div>
  );
}

function Container442() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin64 />
      <Container441 />
    </div>
  );
}

function Background108() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin65() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background108 />
    </div>
  );
}

function Heading111() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">몬터레이</p>
      </div>
    </div>
  );
}

function Container443() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container444() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">새우잡이</p>
      </div>
    </div>
  );
}

function Container445() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading111 />
      <Container443 />
      <Container444 />
    </div>
  );
}

function Container446() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin65 />
      <Container445 />
    </div>
  );
}

function Container447() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container438 />
      <Container442 />
      <Container446 />
    </div>
  );
}

function Container448() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading108 />
          <Container447 />
        </div>
      </div>
    </div>
  );
}

function Component61() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component62() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[3789.4px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[24.99px] pt-px px-px relative w-full">
        <HorizontalBorder21 />
        <Container448 />
        <Component61 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background109() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading112() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">타이타닉</p>
      </div>
    </div>
  );
}

function Container449() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">1997 · romance</p>
      </div>
    </div>
  );
}

function Container450() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading112 />
      <Container449 />
    </div>
  );
}

function Container451() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background109 />
      <Container450 />
    </div>
  );
}

function Background110() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">94%</p>
      </div>
    </div>
  );
}

function Container452() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="content-stretch flex items-start justify-between relative w-full">
          <Container451 />
          <Background110 />
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder23() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container453() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container454() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder23 />
      <Container453 />
    </div>
  );
}

function HorizontalBorder22() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container452 />
          <Container454 />
        </div>
      </div>
    </div>
  );
}

function Heading113() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background111() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin66() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background111 />
    </div>
  );
}

function Heading114() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">벨파스트</p>
      </div>
    </div>
  );
}

function Container455() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">북아일랜드</p>
      </div>
    </div>
  );
}

function Container456() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">타이타닉 건조소</p>
      </div>
    </div>
  );
}

function Container457() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading114 />
      <Container455 />
      <Container456 />
    </div>
  );
}

function Container458() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin66 />
      <Container457 />
    </div>
  );
}

function Background112() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin67() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background112 />
    </div>
  );
}

function Heading115() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">할리팩스</p>
      </div>
    </div>
  );
}

function Container459() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캐나다</p>
      </div>
    </div>
  );
}

function Container460() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">타이타닉 박물관</p>
      </div>
    </div>
  );
}

function Container461() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading115 />
      <Container459 />
      <Container460 />
    </div>
  );
}

function Container462() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin67 />
      <Container461 />
    </div>
  );
}

function Background113() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin68() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background113 />
    </div>
  );
}

function Heading116() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">로스앤젤레스</p>
      </div>
    </div>
  );
}

function Container463() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container464() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">촬영 스튜디오</p>
      </div>
    </div>
  );
}

function Container465() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading116 />
      <Container463 />
      <Container464 />
    </div>
  );
}

function Container466() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin68 />
      <Container465 />
    </div>
  );
}

function Container467() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container458 />
      <Container462 />
      <Container466 />
    </div>
  );
}

function Container468() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading113 />
          <Container467 />
        </div>
      </div>
    </div>
  );
}

function Component63() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component64() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[3789.4px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[24.99px] pt-px px-px relative w-full">
        <HorizontalBorder22 />
        <Container468 />
        <Component63 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background114() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading117() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">마스크</p>
      </div>
    </div>
  );
}

function Container469() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">1994 · comedy</p>
      </div>
    </div>
  );
}

function Container470() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading117 />
      <Container469 />
    </div>
  );
}

function Container471() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background114 />
      <Container470 />
    </div>
  );
}

function Background115() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">83%</p>
      </div>
    </div>
  );
}

function Container472() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container471 />
      <Background115 />
    </div>
  );
}

function BackgroundBorder24() {
  return (
    <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">easy</p>
      </div>
    </div>
  );
}

function Container473() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2개 촬영지</p>
      </div>
    </div>
  );
}

function Container474() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder24 />
      <Container473 />
    </div>
  );
}

function HorizontalBorder23() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container472 />
          <Container474 />
        </div>
      </div>
    </div>
  );
}

function Heading118() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background116() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin69() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background116 />
    </div>
  );
}

function Heading119() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">로스앤젤레스</p>
      </div>
    </div>
  );
}

function Container475() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container476() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">도시 배경</p>
      </div>
    </div>
  );
}

function Container477() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading119 />
      <Container475 />
      <Container476 />
    </div>
  );
}

function Container478() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin69 />
      <Container477 />
    </div>
  );
}

function Background117() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin70() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background117 />
    </div>
  );
}

function Heading120() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">코코넛 그로브</p>
      </div>
    </div>
  );
}

function Container479() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">플로리다</p>
      </div>
    </div>
  );
}

function Container480() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">나이트클럽</p>
      </div>
    </div>
  );
}

function Container481() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading120 />
      <Container479 />
      <Container480 />
    </div>
  );
}

function Container482() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin70 />
      <Container481 />
    </div>
  );
}

function Container483() {
  return (
    <div className="content-stretch flex flex-col gap-[11.99px] items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container478 />
      <Container482 />
    </div>
  );
}

function Container484() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[23.99px] pt-[23px] px-6 relative w-full">
          <Heading118 />
          <Container483 />
        </div>
      </div>
    </div>
  );
}

function Component65() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component66() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[3789.4px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[104.18px] pt-px px-px relative w-full">
        <HorizontalBorder23 />
        <Container484 />
        <Component65 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background118() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading121() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">겟 아웃</p>
      </div>
    </div>
  );
}

function Container485() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2017 · horror</p>
      </div>
    </div>
  );
}

function Container486() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading121 />
      <Container485 />
    </div>
  );
}

function Container487() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background118 />
      <Container486 />
    </div>
  );
}

function Background119() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">86%</p>
      </div>
    </div>
  );
}

function Container488() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container487 />
      <Background119 />
    </div>
  );
}

function BackgroundBorder25() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container489() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2개 촬영지</p>
      </div>
    </div>
  );
}

function Container490() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder25 />
      <Container489 />
    </div>
  );
}

function HorizontalBorder24() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container488 />
          <Container490 />
        </div>
      </div>
    </div>
  );
}

function Heading122() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background120() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin71() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background120 />
    </div>
  );
}

function Heading123() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">앨라바마</p>
      </div>
    </div>
  );
}

function Container491() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">앨라바마 주</p>
      </div>
    </div>
  );
}

function Container492() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">저택 촬영지</p>
      </div>
    </div>
  );
}

function Container493() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading123 />
      <Container491 />
      <Container492 />
    </div>
  );
}

function Container494() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin71 />
      <Container493 />
    </div>
  );
}

function Background121() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin72() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background121 />
    </div>
  );
}

function Heading124() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">모바일</p>
      </div>
    </div>
  );
}

function Container495() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">앨라바마 주</p>
      </div>
    </div>
  );
}

function Container496() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">마을 배경</p>
      </div>
    </div>
  );
}

function Container497() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading124 />
      <Container495 />
      <Container496 />
    </div>
  );
}

function Container498() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin72 />
      <Container497 />
    </div>
  );
}

function Container499() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container494 />
      <Container498 />
    </div>
  );
}

function Container500() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[23.99px] pt-[23px] px-6 relative w-full">
          <Heading122 />
          <Container499 />
        </div>
      </div>
    </div>
  );
}

function Component67() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component68() {
  return (
    <div className="absolute bg-[#ffffff] left-0 right-[784px] rounded-3xl top-[4330.75px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[104.19px] pt-px px-px relative w-full">
        <HorizontalBorder24 />
        <Container500 />
        <Component67 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background122() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading125() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">듄</p>
      </div>
    </div>
  );
}

function Container501() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2021 · s f</p>
      </div>
    </div>
  );
}

function Container502() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading125 />
      <Container501 />
    </div>
  );
}

function Container503() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background122 />
      <Container502 />
    </div>
  );
}

function Background123() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">88%</p>
      </div>
    </div>
  );
}

function Container504() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container503 />
      <Background123 />
    </div>
  );
}

function BackgroundBorder26() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-neutral-400 border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">hard</p>
      </div>
    </div>
  );
}

function Container505() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">3개 촬영지</p>
      </div>
    </div>
  );
}

function Container506() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder26 />
      <Container505 />
    </div>
  );
}

function HorizontalBorder25() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container504 />
          <Container506 />
        </div>
      </div>
    </div>
  );
}

function Heading126() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background124() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin73() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background124 />
    </div>
  );
}

function Heading127() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">와디럼</p>
      </div>
    </div>
  );
}

function Container507() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">요단</p>
      </div>
    </div>
  );
}

function Container508() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">사막 행성</p>
      </div>
    </div>
  );
}

function Container509() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading127 />
      <Container507 />
      <Container508 />
    </div>
  );
}

function Container510() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin73 />
      <Container509 />
    </div>
  );
}

function Background125() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin74() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background125 />
    </div>
  );
}

function Heading128() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">아부다비</p>
      </div>
    </div>
  );
}

function Container511() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">UAE</p>
      </div>
    </div>
  );
}

function Container512() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">미래 도시</p>
      </div>
    </div>
  );
}

function Container513() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading128 />
      <Container511 />
      <Container512 />
    </div>
  );
}

function Container514() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin74 />
      <Container513 />
    </div>
  );
}

function Background126() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.29px] pt-[1.71px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">3</p>
      </div>
    </div>
  );
}

function Margin75() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background126 />
    </div>
  );
}

function Heading129() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">노르웨이</p>
      </div>
    </div>
  );
}

function Container515() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">노르웨이</p>
      </div>
    </div>
  );
}

function Container516() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[4.01px] px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">얼음 행성</p>
      </div>
    </div>
  );
}

function Container517() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading129 />
      <Container515 />
      <Container516 />
    </div>
  );
}

function Container518() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin75 />
      <Container517 />
    </div>
  );
}

function Container519() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container510 />
      <Container514 />
      <Container518 />
    </div>
  );
}

function Container520() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-6 pt-[23px] px-6 relative w-full">
          <Heading126 />
          <Container519 />
        </div>
      </div>
    </div>
  );
}

function Component69() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component70() {
  return (
    <div className="absolute bg-[#ffffff] left-[392px] right-[392px] rounded-3xl top-[4330.75px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[25px] pt-px px-px relative w-full">
        <HorizontalBorder25 />
        <Container520 />
        <Component69 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Background127() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading130() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">탑건: 매버릭</p>
      </div>
    </div>
  );
}

function Container521() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container" style={{ marginBottom: "-6.03961e-14px" }}>
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2022 · action</p>
      </div>
    </div>
  );
}

function Container522() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading130 />
      <Container521 />
    </div>
  );
}

function Container523() {
  return (
    <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0" data-name="Container">
      <Background127 />
      <Container522 />
    </div>
  );
}

function Background128() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-end justify-start px-3 py-1 relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap text-right">
        <p className="leading-[19.6px] whitespace-pre">91%</p>
      </div>
    </div>
  );
}

function Container524() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container523 />
      <Background128 />
    </div>
  );
}

function BackgroundBorder27() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-start justify-start px-[13px] py-[5px] relative rounded-3xl shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#555555] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">normal</p>
      </div>
    </div>
  );
}

function Container525() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">2개 촬영지</p>
      </div>
    </div>
  );
}

function Container526() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder27 />
      <Container525 />
    </div>
  );
}

function HorizontalBorder26() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[25px] pt-6 px-6 relative w-full">
          <Container524 />
          <Container526 />
        </div>
      </div>
    </div>
  );
}

function Heading131() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[19.2px]">main locations</p>
      </div>
    </div>
  );
}

function Background129() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">1</p>
      </div>
    </div>
  );
}

function Margin76() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background129 />
    </div>
  );
}

function Heading132() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">샌디에이고</p>
      </div>
    </div>
  );
}

function Container527() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">캘리포니아</p>
      </div>
    </div>
  );
}

function Container528() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">해군 기지</p>
      </div>
    </div>
  );
}

function Container529() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading132 />
      <Container527 />
      <Container528 />
    </div>
  );
}

function Container530() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin76 />
      <Container529 />
    </div>
  );
}

function Background130() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center pb-[2.3px] pt-[1.7px] px-0 relative rounded-[9999px] shrink-0 size-6" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">2</p>
      </div>
    </div>
  );
}

function Margin77() {
  return (
    <div className="box-border content-stretch flex flex-col h-[26px] items-start justify-start pb-0 pt-0.5 px-0 relative shrink-0 w-6" data-name="Margin">
      <Background130 />
    </div>
  );
}

function Heading133() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 5">
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="leading-[24px]">모뉴먼트 밸리</p>
      </div>
    </div>
  );
}

function Container531() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] w-full">
        <p className="leading-[19.6px]">유타/아리조나</p>
      </div>
    </div>
  );
}

function Container532() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-500 w-full">
        <p className="leading-[19.6px]">비행 훈련</p>
      </div>
    </div>
  );
}

function Container533() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="Container">
      <Heading133 />
      <Container531 />
      <Container532 />
    </div>
  );
}

function Container534() {
  return (
    <div className="content-stretch flex gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Margin77 />
      <Container533 />
    </div>
  );
}

function Container535() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Container530 />
      <Container534 />
    </div>
  );
}

function Container536() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-[23.99px] pt-[23px] px-6 relative w-full">
          <Heading131 />
          <Container535 />
        </div>
      </div>
    </div>
  );
}

function Component71() {
  return (
    <div className="bg-[#000000] box-border content-stretch flex items-center justify-center min-h-11 px-4 py-3 relative rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[318px]" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">detail guide</p>
      </div>
    </div>
  );
}

function Component72() {
  return (
    <div className="absolute bg-[#ffffff] left-[784px] right-0 rounded-3xl top-[4330.75px]" data-name="Component 8">
      <div className="box-border content-stretch flex flex-col items-center justify-start overflow-clip pb-[104.19px] pt-px px-px relative w-full">
        <HorizontalBorder26 />
        <Container536 />
        <Component71 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Container537() {
  return (
    <div className="h-[4848.09px] relative shrink-0 w-full" data-name="Container">
      <Component8 />
      <Component22 />
      <Component24 />
      <Component26 />
      <Component28 />
      <Component30 />
      <Component32 />
      <Component34 />
      <Component36 />
      <Component38 />
      <Component40 />
      <Component42 />
      <Component44 />
      <Component46 />
      <Component48 />
      <Component50 />
      <Component52 />
      <Component54 />
      <Component56 />
      <Component58 />
      <Component60 />
      <Component62 />
      <Component64 />
      <Component66 />
      <Component68 />
      <Component70 />
      <Component72 />
    </div>
  );
}

function Component73() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-center justify-center px-8 py-3 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center text-nowrap">
        <p className="leading-[25.6px] whitespace-pre">load more</p>
      </div>
    </div>
  );
}

function Container538() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-start pb-0 pt-4 px-0 relative shrink-0 w-full" data-name="Container">
      <Component73 />
    </div>
  );
}

function Section2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-8 items-start justify-start left-96 max-w-[1152px] right-96 top-[705.39px]" data-name="Section">
      <Container16 />
      <Container537 />
      <Container538 />
    </div>
  );
}

function Heading134() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[48px] text-center tracking-[-1.2px] w-full">
        <p className="leading-[62.4px]">title</p>
      </div>
    </div>
  );
}

function Container539() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center w-full">
        <p className="leading-[27.2px]">subtitle</p>
      </div>
    </div>
  );
}

function Container540() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start justify-start max-w-[896px] relative shrink-0 w-[896px]" data-name="Container">
      <Heading134 />
      <Container539 />
    </div>
  );
}

function Background131() {
  return (
    <div className="absolute bg-neutral-100 content-stretch flex items-center justify-center left-1/2 rounded-3xl size-12 top-[25px] translate-x-[-50%]" data-name="Background">
      <div className="rounded-[9999px] shrink-0 size-6" data-name="Rectangle" />
    </div>
  );
}

function Heading135() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[88px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container541() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[116.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder28() {
  return (
    <div className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Background131 />
      <Heading135 />
      <Container541 />
    </div>
  );
}

function Background132() {
  return (
    <div className="absolute bg-neutral-100 content-stretch flex items-center justify-center left-1/2 rounded-3xl size-12 top-[25px] translate-x-[-50%]" data-name="Background">
      <div className="bg-neutral-600 h-4 rounded-lg shrink-0 w-6" data-name="Background" />
    </div>
  );
}

function Heading136() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[88px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container542() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[116.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder29() {
  return (
    <div className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Background132 />
      <Heading136 />
      <Container542 />
    </div>
  );
}

function Background133() {
  return (
    <div className="absolute bg-neutral-100 content-stretch flex items-center justify-center left-1/2 rounded-3xl size-12 top-[25px] translate-x-[-50%]" data-name="Background">
      <div className="rounded-3xl shrink-0 size-6" data-name="Rectangle" />
    </div>
  );
}

function Heading137() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[88px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container543() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[116.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder30() {
  return (
    <div className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Background133 />
      <Heading137 />
      <Container543 />
    </div>
  );
}

function Background134() {
  return (
    <div className="absolute bg-neutral-100 content-stretch flex items-center justify-center left-1/2 rounded-3xl size-12 top-[25px] translate-x-[-50%]" data-name="Background">
      <div className="relative rounded-[9999px] shrink-0 size-5" data-name="Border">
        <div aria-hidden="true" className="absolute border-2 border-neutral-500 border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Heading138() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[88px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container544() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-[25px] right-[25px] top-[116.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder31() {
  return (
    <div className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Background134 />
      <Heading138 />
      <Container544 />
    </div>
  );
}

function Container545() {
  return (
    <div className="content-stretch flex gap-6 items-start justify-center max-w-[1152px] relative shrink-0 w-[1152px]" data-name="Container">
      <BackgroundBorder28 />
      <BackgroundBorder29 />
      <BackgroundBorder30 />
      <BackgroundBorder31 />
    </div>
  );
}

function Container546() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center max-w-inherit relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[47.99px] items-center justify-start max-w-inherit px-6 py-0 relative w-full">
          <Container540 />
          <Container545 />
        </div>
      </div>
    </div>
  );
}

function Section3() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-0 pb-16 pt-[63px] px-48 right-0 top-[5792.88px]" data-name="Section">
      <Container546 />
    </div>
  );
}

function Heading139() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[32px] text-center tracking-[-0.8px] w-full">
        <p className="leading-[44.8px]">title</p>
      </div>
    </div>
  );
}

function Background135() {
  return (
    <div className="bg-neutral-200 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-600 rounded-xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading140() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] text-[16px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container547() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[0px] text-nowrap">
        <p className="leading-[24px] text-[16px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container548() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-neutral-500 text-nowrap">
        <p className="leading-[19.6px] text-[14px] whitespace-pre">count</p>
      </div>
    </div>
  );
}

function Container549() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading140 />
      <Container547 />
      <Container548 />
    </div>
  );
}

function Container550() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background135 />
      <Container549 />
    </div>
  );
}

function Component9() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-0 pb-[25px] pt-6 px-[25px] right-[784px] rounded-3xl top-0" data-name="Component 9">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Container550 />
    </div>
  );
}

function Background136() {
  return (
    <div className="bg-neutral-200 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-700 h-4 rounded-lg shrink-0 w-6" data-name="Background" />
    </div>
  );
}

function Heading141() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] text-[16px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container551() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[0px] text-nowrap">
        <p className="leading-[24px] text-[16px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container552() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-neutral-500 text-nowrap">
        <p className="leading-[19.6px] text-[14px] whitespace-pre">count</p>
      </div>
    </div>
  );
}

function Container553() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading141 />
      <Container551 />
      <Container552 />
    </div>
  );
}

function Container554() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background136 />
      <Container553 />
    </div>
  );
}

function Component74() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-[392px] pb-[25px] pt-6 px-[25px] right-[392px] rounded-3xl top-0" data-name="Component 9">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Container554 />
    </div>
  );
}

function Background137() {
  return (
    <div className="bg-neutral-200 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="rounded-[9999px] shrink-0 size-6" data-name="Rectangle" />
    </div>
  );
}

function Heading142() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] text-[16px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container555() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[0px] text-nowrap">
        <p className="leading-[24px] text-[16px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container556() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-neutral-500 text-nowrap">
        <p className="leading-[19.6px] text-[14px] whitespace-pre">count</p>
      </div>
    </div>
  );
}

function Container557() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading142 />
      <Container555 />
      <Container556 />
    </div>
  );
}

function Container558() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background137 />
      <Container557 />
    </div>
  );
}

function Component75() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-[784px] pb-[25px] pt-6 px-[25px] right-0 rounded-3xl top-0" data-name="Component 9">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Container558 />
    </div>
  );
}

function Background138() {
  return (
    <div className="bg-neutral-200 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="flex h-[26.802px] items-center justify-center relative shrink-0 w-[20.64px]">
        <div className="flex-none rotate-[12deg]">
          <div className="bg-neutral-600 h-6 w-4" data-name="Background" />
        </div>
      </div>
    </div>
  );
}

function Heading143() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] text-[16px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container559() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[0px] text-nowrap">
        <p className="leading-[24px] text-[16px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container560() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-neutral-500 text-nowrap">
        <p className="leading-[19.6px] text-[14px] whitespace-pre">count</p>
      </div>
    </div>
  );
}

function Container561() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading143 />
      <Container559 />
      <Container560 />
    </div>
  );
}

function Container562() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background138 />
      <Container561 />
    </div>
  );
}

function Component76() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-0 pb-[25px] pt-6 px-[25px] right-[784px] rounded-3xl top-[140.78px]" data-name="Component 9">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Container562 />
    </div>
  );
}

function Background139() {
  return <div className="bg-neutral-700 h-6 rounded-tl-[24px] rounded-tr-[24px] shrink-0 w-8" data-name="Background" />;
}

function Background140() {
  return (
    <div className="bg-neutral-200 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <Background139 />
    </div>
  );
}

function Heading144() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] text-[16px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container563() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[0px] text-nowrap">
        <p className="leading-[24px] text-[16px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container564() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-neutral-500 text-nowrap">
        <p className="leading-[19.6px] text-[14px] whitespace-pre">count</p>
      </div>
    </div>
  );
}

function Container565() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading144 />
      <Container563 />
      <Container564 />
    </div>
  );
}

function Container566() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background140 />
      <Container565 />
    </div>
  );
}

function Component77() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-[392px] pb-[25px] pt-6 px-[25px] right-[392px] rounded-3xl top-[140.78px]" data-name="Component 9">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Container566 />
    </div>
  );
}

function Background141() {
  return (
    <div className="bg-neutral-200 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-600 rounded-[9999px] shrink-0 size-4" data-name="Background" />
    </div>
  );
}

function Heading145() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] text-[16px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container567() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[0px] text-nowrap">
        <p className="leading-[24px] text-[16px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container568() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-1 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[0px] text-neutral-500 text-nowrap">
        <p className="leading-[19.6px] text-[14px] whitespace-pre">count</p>
      </div>
    </div>
  );
}

function Container569() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Container">
      <Heading145 />
      <Container567 />
      <Container568 />
    </div>
  );
}

function Container570() {
  return (
    <div className="content-stretch flex gap-4 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background141 />
      <Container569 />
    </div>
  );
}

function Component78() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-[784px] pb-[25px] pt-6 px-[25px] right-0 rounded-3xl top-[140.78px]" data-name="Component 9">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <Container570 />
    </div>
  );
}

function Container571() {
  return (
    <div className="h-[257.56px] relative shrink-0 w-full" data-name="Container">
      <Component9 />
      <Component74 />
      <Component75 />
      <Component76 />
      <Component77 />
      <Component78 />
    </div>
  );
}

function Container572() {
  return (
    <div className="content-stretch flex flex-col gap-8 items-start justify-start max-w-[1152px] relative shrink-0 w-full" data-name="Container">
      <Heading139 />
      <Container571 />
    </div>
  );
}

function Section4() {
  return (
    <div className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-0 pb-16 pt-[63px] px-96 right-0 top-[6239.64px]" data-name="Section">
      <Container572 />
    </div>
  );
}

function Heading146() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[48px] text-center tracking-[-1.2px] w-full">
        <p className="leading-[62.4px]">title</p>
      </div>
    </div>
  );
}

function Container573() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center w-full">
        <p className="leading-[27.2px]">subtitle</p>
      </div>
    </div>
  );
}

function Container574() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start justify-start max-w-[896px] relative shrink-0 w-[896px]" data-name="Container">
      <Heading146 />
      <Container573 />
    </div>
  );
}

function Background142() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="rounded-xl shrink-0 size-6" data-name="Rectangle" />
    </div>
  );
}

function Heading147() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-center tracking-[-0.5px] w-full">
        <p className="leading-[32px]">title</p>
      </div>
    </div>
  );
}

function Container575() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background142 />
      <Heading147 />
    </div>
  );
}

function Container576() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center w-full">
        <p className="leading-[24px]">description</p>
      </div>
    </div>
  );
}

function Background143() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex items-start justify-center px-3 py-[2.5px] relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">badge</p>
      </div>
    </div>
  );
}

function Container577() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-start pb-[0.59px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <Background143 />
    </div>
  );
}

function Component10() {
  return (
    <div className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Component 10">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[25px] relative size-full">
          <Container575 />
          <Container576 />
          <Container577 />
        </div>
      </div>
    </div>
  );
}

function Background144() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="bg-neutral-600 h-6 rounded-lg shrink-0 w-5" data-name="Background" />
    </div>
  );
}

function Heading148() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-center tracking-[-0.5px] w-full">
        <p className="leading-[32px]">title</p>
      </div>
    </div>
  );
}

function Container578() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background144 />
      <Heading148 />
    </div>
  );
}

function Container579() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center w-full">
        <p className="leading-[24px]">description</p>
      </div>
    </div>
  );
}

function Background145() {
  return (
    <div className="bg-neutral-200 box-border content-stretch flex items-start justify-center px-3 py-[2.5px] relative rounded-3xl shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-neutral-800 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">badge</p>
      </div>
    </div>
  );
}

function Container580() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-start pb-[0.59px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <Background145 />
    </div>
  );
}

function Component79() {
  return (
    <div className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Component 10">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[25px] relative size-full">
          <Container578 />
          <Container579 />
          <Container580 />
        </div>
      </div>
    </div>
  );
}

function Background146() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-3xl shrink-0 size-12" data-name="Background">
      <div className="h-4 rounded-xl shrink-0 w-6" data-name="Rectangle" />
    </div>
  );
}

function Heading149() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-center tracking-[-0.5px] w-full">
        <p className="leading-[32px]">title</p>
      </div>
    </div>
  );
}

function Container581() {
  return (
    <div className="content-stretch flex flex-col gap-3 items-center justify-start relative shrink-0 w-full" data-name="Container">
      <Background146 />
      <Heading149 />
    </div>
  );
}

function Container582() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-center w-full">
        <p className="leading-[24px]">description</p>
      </div>
    </div>
  );
}

function Component80() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex flex-col items-center justify-center px-3 py-1 relative rounded-3xl shrink-0" data-name="Component 6">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[14px] text-center text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">check saved</p>
      </div>
    </div>
  );
}

function Container583() {
  return (
    <div className="content-stretch flex items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Component80 />
    </div>
  );
}

function BackgroundBorder32() {
  return (
    <div className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-[25px] relative size-full">
          <Container581 />
          <Container582 />
          <Container583 />
        </div>
      </div>
    </div>
  );
}

function Container584() {
  return (
    <div className="content-stretch flex gap-8 items-start justify-center max-w-[1024px] relative shrink-0 w-[1024px]" data-name="Container">
      <Component10 />
      <Component79 />
      <BackgroundBorder32 />
    </div>
  );
}

function Heading150() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[24px] text-center tracking-[-0.6px] w-full">
        <p className="leading-[36px]">title</p>
      </div>
    </div>
  );
}

function Background147() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-xl shrink-0 size-8" data-name="Background">
      <div className="bg-neutral-600 rounded-xl shrink-0 size-4" data-name="Background" />
    </div>
  );
}

function Heading151() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container585() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[2.5px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container586() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[3.09px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading151 />
      <Container585 />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-600 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">cost</p>
      </div>
    </div>
  );
}

function Component11() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex gap-4 items-center justify-start left-0 pb-4 pt-[15px] px-4 right-[723px] rounded-3xl top-0" data-name="Component 11">
      <Background147 />
      <Container586 />
    </div>
  );
}

function Background148() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-xl shrink-0 size-8" data-name="Background">
      <div className="bg-neutral-700 h-3 rounded-lg shrink-0 w-4" data-name="Background" />
    </div>
  );
}

function Heading152() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container587() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[2.5px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container588() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[3.09px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading152 />
      <Container587 />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-600 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">cost</p>
      </div>
    </div>
  );
}

function Component81() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex gap-4 items-center justify-start left-[723px] pb-4 pt-[15px] px-4 right-0 rounded-3xl top-0" data-name="Component 11">
      <Background148 />
      <Container588 />
    </div>
  );
}

function Background149() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-xl shrink-0 size-8" data-name="Background">
      <div className="flex h-[18.145px] items-center justify-center relative shrink-0 w-[15.064px]">
        <div className="flex-none rotate-[12deg]">
          <div className="bg-neutral-600 h-4 w-3" data-name="Background" />
        </div>
      </div>
    </div>
  );
}

function Heading153() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container589() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[2.5px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container590() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[3.09px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading153 />
      <Container589 />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-600 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">cost</p>
      </div>
    </div>
  );
}

function Component82() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex gap-4 items-center justify-start left-0 pb-4 pt-[15px] px-4 right-[723px] rounded-3xl top-[124.78px]" data-name="Component 11">
      <Background149 />
      <Container590 />
    </div>
  );
}

function Background150() {
  return (
    <div className="bg-neutral-100 content-stretch flex items-center justify-center relative rounded-xl shrink-0 size-8" data-name="Background">
      <div className="rounded-[9999px] shrink-0 size-4" data-name="Rectangle" />
    </div>
  );
}

function Heading154() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container591() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[2.5px] pt-0 px-0 relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Container592() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start pb-[3.09px] pt-0 px-0 relative shrink-0" data-name="Container">
      <Heading154 />
      <Container591 />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-blue-600 text-nowrap">
        <p className="leading-[19.6px] whitespace-pre">cost</p>
      </div>
    </div>
  );
}

function Component83() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex gap-4 items-center justify-start left-[723px] pb-4 pt-[15px] px-4 right-0 rounded-3xl top-[124.78px]" data-name="Component 11">
      <Background150 />
      <Container592 />
    </div>
  );
}

function Container593() {
  return (
    <div className="h-[225.56px] relative shrink-0 w-full" data-name="Container">
      <Component11 />
      <Component81 />
      <Component82 />
      <Component83 />
    </div>
  );
}

function BackgroundBorder33() {
  return (
    <div className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#f8f8f8] border-solid inset-0 pointer-events-none rounded-3xl" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-[33px] relative w-full">
          <Heading150 />
          <Container593 />
        </div>
      </div>
    </div>
  );
}

function Container594() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center max-w-inherit relative size-full">
        <div className="box-border content-stretch flex flex-col gap-12 items-center justify-start max-w-inherit px-6 py-0 relative w-full">
          <Container574 />
          <Container584 />
          <BackgroundBorder33 />
        </div>
      </div>
    </div>
  );
}

function Section5() {
  return (
    <div className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-0 pb-16 pt-[63px] px-48 right-0 top-[6702px]" data-name="Section">
      <Container594 />
    </div>
  );
}

function Heading155() {
  return (
    <div className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[64px] text-center tracking-[-1.6px] w-full">
        <p className="leading-[76.8px]">title</p>
      </div>
    </div>
  );
}

function Container595() {
  return (
    <div className="content-stretch flex flex-col items-center justify-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-neutral-300 w-full">
        <p className="leading-[36px]">description</p>
      </div>
    </div>
  );
}

function Background151() {
  return (
    <div className="absolute bg-neutral-700 content-stretch flex items-center justify-center left-1/2 rounded-3xl size-12 top-6 translate-x-[-50%]" data-name="Background">
      <div className="bg-neutral-300 rounded-3xl shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading156() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-6 right-6 top-[83px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container596() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-6 right-6 top-[111.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-300 text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Background152() {
  return (
    <div className="basis-0 bg-[#007aff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background">
      <Background151 />
      <Heading156 />
      <Container596 />
    </div>
  );
}

function Background153() {
  return (
    <div className="absolute bg-neutral-700 content-stretch flex items-center justify-center left-1/2 rounded-3xl size-12 top-6 translate-x-[-50%]" data-name="Background">
      <div className="relative rounded-[9999px] shrink-0 size-6" data-name="Border">
        <div aria-hidden="true" className="absolute border-2 border-[#555555] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function Heading157() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-6 right-6 top-[83px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container597() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-6 right-6 top-[111.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-300 text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Background154() {
  return (
    <div className="basis-0 bg-[#007aff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background">
      <Background153 />
      <Heading157 />
      <Container597 />
    </div>
  );
}

function Background155() {
  return (
    <div className="absolute bg-neutral-700 content-stretch flex items-center justify-center left-1/2 rounded-3xl size-12 top-6 translate-x-[-50%]" data-name="Background">
      <div className="bg-neutral-400 rounded-xl shrink-0 size-5" data-name="Background" />
    </div>
  );
}

function Heading158() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-6 right-6 top-[83px]" data-name="Heading 3">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap tracking-[-0.4px]">
        <p className="leading-[19.2px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container598() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-6 right-6 top-[111.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-300 text-nowrap">
        <p className="leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function Background156() {
  return (
    <div className="basis-0 bg-[#007aff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0" data-name="Background">
      <Background155 />
      <Heading158 />
      <Container598 />
    </div>
  );
}

function Container599() {
  return (
    <div className="box-border content-stretch flex gap-6 items-start justify-center pb-6 pt-2 px-0 relative shrink-0 w-full" data-name="Container">
      <Background152 />
      <Background154 />
      <Background156 />
    </div>
  );
}

function Component84() {
  return (
    <div className="bg-[#ffffff] box-border content-stretch flex items-start justify-center overflow-clip px-10 py-4 relative rounded-3xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0" data-name="Component 7">
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="leading-[25.6px] whitespace-pre">cta</p>
      </div>
    </div>
  );
}

function Container600() {
  return (
    <div className="content-stretch flex flex-col gap-6 items-center justify-start max-w-[768px] relative shrink-0 w-full" data-name="Container">
      <Heading155 />
      <Container595 />
      <Container599 />
      <Component84 />
    </div>
  );
}

function Section6() {
  return (
    <div className="absolute bg-[#007aff] box-border content-stretch flex flex-col items-start justify-start left-0 pb-16 pt-[63px] px-[576px] right-0 top-[7608.73px]" data-name="Section">
      <Container600 />
    </div>
  );
}

function Main() {
  return (
    <div className="absolute bg-[#ffffff] h-[8170.31px] left-0 min-h-[1200px] right-0 top-0" data-name="Main">
      <Section />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="h-[8170.31px] relative shrink-0 w-full z-[1]">
      <Main />
    </div>
  );
}

function Component85() {
  return (
    <div className="relative shrink-0 size-5" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Component 1">
          <path d={svgPaths.p2110f1c0} id="Vector" stroke="var(--stroke-0, #4F46E5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M2.5 2.5V6.66667H6.66667" id="Vector_2" stroke="var(--stroke-0, #4F46E5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.pc8ce200} id="Vector_3" stroke="var(--stroke-0, #4F46E5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Heading159() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-neutral-900 text-nowrap tracking-[-0.5px]">
        <p className="leading-[32px] whitespace-pre">Search History</p>
      </div>
    </div>
  );
}

function Container601() {
  return (
    <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0" data-name="Container">
      <Component85 />
      <Heading159 />
    </div>
  );
}

function Component86() {
  return (
    <div className="relative shrink-0 size-5" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Component 1">
          <path d="M15 5L5 15" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M5 5L15 15" id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Component87() {
  return (
    <div className="box-border content-stretch flex flex-col items-start justify-start p-[8px] relative rounded-3xl shrink-0" data-name="Component 2">
      <Component86 />
    </div>
  );
}

function HorizontalBorder27() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pb-[17px] pt-4 px-4 relative w-full">
          <Container601 />
          <Component87 />
        </div>
      </div>
    </div>
  );
}

function Container602() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-clip relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 w-full">
        <p className="leading-[normal]">Search in history</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[#ffffff] relative rounded-3xl shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-start justify-center pl-[41px] pr-[17px] py-[11px] relative w-full">
          <Container602 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl" />
    </div>
  );
}

function Component88() {
  return (
    <div className="absolute left-3 size-4 top-1/2 translate-y-[-50%]" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path d="M14 14L11.1067 11.1067" id="Vector" stroke="var(--stroke-0, #A3A3A3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p107a080} id="Vector_2" stroke="var(--stroke-0, #A3A3A3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container603() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <Input1 />
      <Component88 />
    </div>
  );
}

function HorizontalBorder28() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-neutral-200 border-solid inset-0 pointer-events-none" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pb-[17px] pt-4 px-4 relative w-full">
          <Container603 />
        </div>
      </div>
    </div>
  );
}

function Component89() {
  return (
    <div className="absolute left-1/2 size-12 top-4 translate-x-[-50%]" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Component 1">
          <path d={svgPaths.p1c2f3080} id="Vector" stroke="var(--stroke-0, #D4D4D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d="M6 6V16H16" id="Vector_2" stroke="var(--stroke-0, #D4D4D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d="M24 14V24L32 28" id="Vector_3" stroke="var(--stroke-0, #D4D4D4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Container604() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-4 right-4 top-[71px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-500 text-nowrap">
        <p className="leading-[27.2px] whitespace-pre">No search history</p>
      </div>
    </div>
  );
}

function Container605() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-start left-4 right-4 top-[103.19px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-400 text-nowrap">
        <p className="leading-[24px] whitespace-pre">Search places</p>
      </div>
    </div>
  );
}

function Container606() {
  return (
    <div className="h-[143.19px] relative shrink-0 w-full" data-name="Container">
      <Component89 />
      <Container604 />
      <Container605 />
    </div>
  );
}

function Container607() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-auto relative shrink-0 w-full" data-name="Container">
      <Container606 />
    </div>
  );
}

function Container608() {
  return (
    <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-full" data-name="Container">
      <HorizontalBorder27 />
      <HorizontalBorder28 />
      <Container607 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="absolute bg-[#ffffff] box-border content-stretch flex flex-col h-[1200px] items-start justify-start left-[1920px] max-w-[1728px] overflow-clip shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-0 w-80 z-[3]" data-name="Background+Shadow">
      <Container608 />
    </div>
  );
}

function Component1920WLight() {
  return (
    <div className="absolute bg-[#ffffff] box-border content-stretch flex flex-col isolate items-start justify-start left-[100px] min-h-[1200px] pb-[300px] pt-0 px-0 right-[100px] top-[100px]" data-name="1920w light">
      <BackgroundShadow />
      <Header />
      <Frame1 />
    </div>
  );
}

function NavidocentComEnglishUsByHtmlToDesignFreeVersion22082025222254Gmt9() {
  return (
    <div className="absolute bg-[#444444] h-[8736.31px] left-0 rounded-sm top-0 w-[2120px]" data-name="tripradio.shop (English-US) by html.to.design ❤️ FREE version - 22/08/2025, 22:22:54 GMT+9">
      <div className="h-[8736.31px] overflow-clip relative w-[2120px]">
        <Component1920WLight />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-sm" />
    </div>
  );
}

export default function Frame2() {
  return (
    <div className="relative size-full">
      <NavidocentComEnglishUsByHtmlToDesignFreeVersion22082025222254Gmt9 />
    </div>
  );
}