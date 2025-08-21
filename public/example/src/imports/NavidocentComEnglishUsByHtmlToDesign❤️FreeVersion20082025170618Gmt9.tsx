import svgPaths from "./svg-lpg89bl61u";

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

function Component10() {
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
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[0px] text-nowrap">
        <p className="block leading-[24px] text-[16px] whitespace-pre">Sign In</p>
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
      <Component10 />
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

function Component11() {
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
      <Component11 />
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

function Component12() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-4" data-name="Component 1">
      <div className="absolute bottom-[20.83%] left-[20.83%] right-1/2 top-[20.83%]" data-name="Vector">
        <div
          className="absolute inset-[-7.14%_-14.29%]"
          style={{ "--stroke-0": "rgba(163, 163, 163, 1)" } as React.CSSProperties}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 11">
            <path
              d={svgPaths.p13fc740}
              id="Vector"
              stroke="var(--stroke-0, #A3A3A3)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.33333"
            />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
        <div
          className="absolute inset-[-0.67px_-7.14%]"
          style={{ "--stroke-0": "rgba(163, 163, 163, 1)" } as React.CSSProperties}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
            <path
              d="M10.3333 1H1"
              id="Vector"
              stroke="var(--stroke-0, #A3A3A3)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.33333"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-center overflow-clip p-0 relative shrink-0 size-4"
      data-name="SVG"
    >
      <Component12 />
    </div>
  );
}

function SvgMargin() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-4 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-6"
      data-name="SVG:margin"
    >
      <Svg />
    </div>
  );
}

function Component6() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-start left-8 p-0 top-6"
      data-name="Component 6"
    >
      <SvgMargin />
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-400 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Go Back</p>
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div
      className="bg-[#000000] box-border content-stretch flex items-center justify-center p-0 relative rounded-[40px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 size-16"
      data-name="Background+Shadow"
    >
      <div className="bg-[#ffffff] rounded-3xl shrink-0 size-8" data-name="Background" />
    </div>
  );
}

function Heading1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Heading 1"
    >
      <div className="flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[32px] text-center text-neutral-900 tracking-[-0.8px] w-full">
        <p className="block leading-[44.8px]">Welcome to DocentTour AI</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-[23px] items-center justify-start left-8 p-0 right-8 top-20"
      data-name="Container"
    >
      <BackgroundShadow />
      <Heading1 />
    </div>
  );
}

function Label() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">Email</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-clip p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 w-full">
        <p className="block leading-[normal]">Enter your email</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#ffffff] relative rounded-[32px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-start justify-center pl-[41px] pr-[17px] py-[15px] relative w-full">
          <Container7 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
    </div>
  );
}

function Component13() {
  return (
    <div className="relative shrink-0 size-5" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Component 1">
          <path
            d={svgPaths.p24d83580}
            id="Vector"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.pd919a80}
            id="Vector_2"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div
      className="absolute bottom-0 box-border content-stretch flex items-center justify-start left-0 pl-3 pr-0 py-[15px] top-0 w-8"
      data-name="Container"
    >
      <Component13 />
    </div>
  );
}

function Container9() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Input />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label />
      <Container9 />
    </div>
  );
}

function Label1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">Password</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-clip p-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 w-full">
        <p className="block leading-[normal]">Enter your password</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-[#ffffff] relative rounded-[32px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-start justify-center pl-[41px] pr-[49px] py-[15px] relative w-full">
          <Container11 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-[32px]"
      />
    </div>
  );
}

function Component14() {
  return (
    <div className="relative shrink-0 size-5" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Component 1">
          <path
            d={svgPaths.p2566d000}
            id="Vector"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.p1bf79e00}
            id="Vector_2"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div
      className="absolute bottom-0 box-border content-stretch flex items-center justify-start left-0 pl-3 pr-0 py-[15px] top-0 w-8"
      data-name="Container"
    >
      <Component14 />
    </div>
  );
}

function Component15() {
  return (
    <div className="relative shrink-0 size-5" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Component 1">
          <path
            d={svgPaths.p338f2df0}
            id="Vector"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
          <path
            d={svgPaths.p3b27f100}
            id="Vector_2"
            stroke="var(--stroke-0, #A3A3A3)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.66667"
          />
        </g>
      </svg>
    </div>
  );
}

function Component16() {
  return (
    <div
      className="absolute bottom-0 box-border content-stretch flex items-center justify-start pl-0 pr-3 py-[15px] right-0 top-0"
      data-name="Component 2"
    >
      <Component15 />
    </div>
  );
}

function Container13() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Input1 />
      <Container12 />
      <Component16 />
    </div>
  );
}

function Container14() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label1 />
      <Container13 />
    </div>
  );
}

function Container15() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.59px] pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-center text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">Sign In</p>
      </div>
    </div>
  );
}

function Component17() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-4" data-name="Component 1">
      <div className="absolute bottom-1/2 left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
        <div
          className="absolute inset-[-0.67px_-7.14%]"
          style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
            <path
              d="M1 1H10.3333"
              id="Vector"
              stroke="var(--stroke-0, white)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.33333"
            />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[20.83%] left-1/2 right-[20.83%] top-[20.83%]" data-name="Vector">
        <div
          className="absolute inset-[-7.14%_-14.29%]"
          style={{ "--stroke-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 11">
            <path
              d={svgPaths.p9a1af80}
              id="Vector"
              stroke="var(--stroke-0, white)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.33333"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-0 relative shrink-0 size-4"
      data-name="SVG"
    >
      <Component17 />
    </div>
  );
}

function SvgMargin1() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-4 items-start justify-start pl-2 pr-0 py-0 relative shrink-0 w-6"
      data-name="SVG:margin"
    >
      <Svg1 />
    </div>
  );
}

function Component7() {
  return (
    <div className="bg-[#000000] relative rounded-[32px] shrink-0 w-full" data-name="Component 7">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div
          className="box-border content-stretch flex items-center justify-center pb-3 pt-[11px] px-4 relative w-full"
          style={{ gap: "8.52651e-14px" }}
        >
          <Container15 />
          <SvgMargin1 />
        </div>
      </div>
    </div>
  );
}

function Form() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-start justify-start left-8 p-0 right-8 top-8"
      data-name="Form"
    >
      <Container10 />
      <Container14 />
      <Component7 />
    </div>
  );
}

function Component18() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-5" data-name="Component 1">
      <div className="absolute bottom-[15.25%] left-1/2 right-[6%] top-[41.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 9">
          <path d={svgPaths.p137aff80} fill="var(--fill-0, #4285F4)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[58.75%_19.67%_4.17%_9.08%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 8">
          <path d={svgPaths.p2aa894c0} fill="var(--fill-0, #34A853)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[29.46%_75.67%_29.46%_4.17%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 9">
          <path d={svgPaths.p301b8170} fill="var(--fill-0, #FBBC05)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[4.17%_19.33%_58.71%_9.08%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 8">
          <path d={svgPaths.p3d326350} fill="var(--fill-0, #EA4335)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-center overflow-clip p-0 relative shrink-0 size-5"
      data-name="SVG"
    >
      <Component18 />
    </div>
  );
}

function SvgMargin2() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-5 items-start justify-start pl-0 pr-3 py-0 relative shrink-0 w-8"
      data-name="SVG:margin"
    >
      <Svg2 />
    </div>
  );
}

function Component8() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex items-center justify-center left-8 px-4 py-3 right-8 rounded-[32px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] top-[357.59px]"
      data-name="Component 8"
    >
      <SvgMargin2 />
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-700 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Login with Google</p>
      </div>
    </div>
  );
}

function Component9() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-center p-0 relative shrink-0"
      data-name="Component 9"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Sign Up</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div
      className="absolute box-border content-stretch flex items-start justify-center left-8 p-0 right-8 top-[429.59px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-neutral-600 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">{`Don't have an account? `}</p>
      </div>
      <Component9 />
    </div>
  );
}

function Container17() {
  return (
    <div
      className="absolute box-border content-stretch flex inset-0 items-center justify-center px-0 py-[11.5px]"
      data-name="Container"
    >
      <div className="basis-0 grow h-px min-h-px min-w-px relative shrink-0" data-name="Horizontal Divider">
        <div
          aria-hidden="true"
          className="absolute border-[1px_0px_0px] border-neutral-200 border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div
      className="bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start px-4 py-0 relative self-stretch shrink-0"
      data-name="Background"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Or continue with</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-center p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Background1 />
    </div>
  );
}

function Container19() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-8 p-0 right-8 top-[309.59px]"
      data-name="Container"
    >
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[485.59px] relative shrink-0 w-full" data-name="Container">
      <Form />
      <Component8 />
      <Container16 />
      <Container19 />
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div
      className="absolute bg-[#ffffff] left-8 right-8 rounded-[40px] top-[244.8px]"
      data-name="Background+Border+Shadow"
    >
      <div className="box-border content-stretch flex flex-col items-start justify-start overflow-clip pb-px pt-[17px] px-px relative w-full">
        <Container20 />
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
      />
    </div>
  );
}

function Component19() {
  return (
    <div className="relative shrink-0 size-4" data-name="Component 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Component 1">
          <path
            d={svgPaths.p37f49070}
            id="Vector"
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

function Margin2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pl-2 pr-0 py-0 relative shrink-0"
      data-name="Margin"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-400 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Protected by 256-bit SSL encryption</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div
      className="absolute box-border content-stretch flex items-center justify-center left-8 p-0 right-8 top-[772.39px]"
      data-name="Container"
    >
      <Component19 />
      <Margin2 />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[815.98px] max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <Component6 />
      <Container6 />
      <BackgroundBorderShadow />
      <Container21 />
    </div>
  );
}

function Main() {
  return (
    <div
      className="bg-[#ffffff] box-border content-stretch flex items-center justify-center min-h-[1200px] overflow-clip pb-[192.02px] pt-48 px-0 relative shrink-0 w-full z-[1]"
      data-name="Main"
    >
      <div
        className="absolute inset-0 opacity-[0.02]"
        data-name="Gradient"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 1920 1200\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(260.22 0 0 162.63 -87040 -54400)\\\'><stop stop-color=\\\'rgba(0,0,0,0.1)\\\' offset=\\\'0.015372\\\'/><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'0.015372\\\'/></radialGradient></defs></svg>')",
        }}
      />
      <Container22 />
    </div>
  );
}

function Component20() {
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

function Heading2() {
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

function Container23() {
  return (
    <div
      className="box-border content-stretch flex gap-2 items-center justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Component20 />
      <Heading2 />
    </div>
  );
}

function Component21() {
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

function Component22() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-[8px] relative rounded-3xl shrink-0"
      data-name="Component 2"
    >
      <Component21 />
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
          <Container23 />
          <Component22 />
        </div>
      </div>
    </div>
  );
}

function Container24() {
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
          <Container24 />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
    </div>
  );
}

function Component23() {
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

function Container25() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Input2 />
      <Component23 />
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
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function Component24() {
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

function Container26() {
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

function Container27() {
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

function Container28() {
  return (
    <div className="h-[143.19px] relative shrink-0 w-full" data-name="Container">
      <Component24 />
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div
      className="basis-0 box-border content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px overflow-auto p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container28 />
    </div>
  );
}

function Container30() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <HorizontalBorder />
      <HorizontalBorder1 />
      <Container29 />
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-[1920px] max-w-[1728px] overflow-clip p-0 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-0 w-80 z-[3]"
      data-name="Background+Shadow"
    >
      <Container30 />
    </div>
  );
}

function Component1920WLight() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col isolate items-start justify-start left-[100px] min-h-[1200px] pb-[110px] pt-0 px-0 right-[100px] top-[100px]"
      data-name="1920w light"
    >
      <BackgroundShadow1 />
      <Header />
      <Main />
    </div>
  );
}

export default function NavidocentComEnglishUsByHtmlToDesignFreeVersion20082025170618Gmt9() {
  return (
    <div
      className="bg-[#444444] relative rounded-sm size-full"
      data-name="navidocent.com (English-US) by html.to.design ❤️ FREE version - 20/08/2025, 17:06:18 GMT+9"
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