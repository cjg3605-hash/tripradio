function Heading1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 1"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[56px] text-center tracking-[-1.4px] w-full">
        <p className="block leading-[67.2px]">For Digital Nomads</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start max-w-[768px] p-0 relative shrink-0 w-[768px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[18px] text-center text-nowrap">
        <p className="block leading-[27px] whitespace-pre">당신의 라이프스타일에 맞는 도시를 찾아보세요</p>
      </div>
    </div>
  );
}

function Section() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-6 items-center justify-start left-[512px] max-w-[896px] p-0 right-[512px] top-[39px]"
      data-name="Section"
    >
      <Heading1 />
      <Container />
    </div>
  );
}

function Heading2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[64px] text-center tracking-[-1.6px] w-full">
        <p className="block leading-[76.8px]">Nomad Living Cost Calculator</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[20px] text-center w-full">
        <p className="block leading-[32px]">Find the city that matches your lifestyle</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[23.99px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading2 />
      <Container1 />
    </div>
  );
}

function Heading3() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[24px] tracking-[-0.6px] w-full">
        <p className="block leading-[36px]">Cost Calculation Settings</p>
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
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">Select City</p>
      </div>
    </div>
  );
}

function Component1() {
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

function ImageFill() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col h-[58px] items-end justify-center left-0 overflow-clip pl-[517px] pr-[9px] py-[17px] top-0 w-[550px]"
      data-name="image fill"
    >
      <Component1 />
    </div>
  );
}

function Container3() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[17px] overflow-clip p-0 right-[17px] top-1/2 translate-y-[-50%]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">리스본, 포르투갈</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="bg-[#ffffff] h-[58px] min-h-11 relative rounded-3xl shrink-0 w-full" data-name="Options">
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <ImageFill />
      <Container3 />
    </div>
  );
}

function Container4() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label />
      <Options />
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
        <p className="block leading-[24px]">Working Days (22days/month)</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pl-[247.33px] pr-[282.67px] py-0 relative w-full">
          <div className="bg-[#555555] relative rounded-[10px] shrink-0 size-5" data-name="Background+Border+Shadow">
            <div
              aria-hidden="true"
              className="absolute border-2 border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div
      className="bg-neutral-200 box-border content-stretch flex h-2 items-center justify-center p-0 relative rounded-3xl shrink-0 w-full"
      data-name="Input"
    >
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[18px] items-start justify-start pb-[7.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label1 />
      <Input />
    </div>
  );
}

function Label2() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">Coworking Usage (10days/month)</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pl-[240.91px] pr-[289.09px] py-0 relative w-full">
          <div className="bg-[#555555] relative rounded-[10px] shrink-0 size-5" data-name="Background+Border+Shadow">
            <div
              aria-hidden="true"
              className="absolute border-2 border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div
      className="bg-neutral-200 box-border content-stretch flex h-2 items-center justify-center p-0 relative rounded-3xl shrink-0 w-full"
      data-name="Input"
    >
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[18px] items-start justify-start pb-[7.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label2 />
      <Input1 />
    </div>
  );
}

function Label3() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">Accommodation Type</p>
      </div>
    </div>
  );
}

function Component2() {
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
      className="absolute box-border content-stretch flex flex-col h-[58px] items-end justify-center left-0 overflow-clip pl-[517px] pr-[9px] py-[17px] top-0 w-[550px]"
      data-name="image fill"
    >
      <Component2 />
    </div>
  );
}

function Container9() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[17px] overflow-clip p-0 right-[17px] top-1/2 translate-y-[-50%]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Apartment/Studio</p>
      </div>
    </div>
  );
}

function Options1() {
  return (
    <div className="bg-[#ffffff] h-[58px] min-h-11 relative rounded-3xl shrink-0 w-full" data-name="Options">
      <div
        aria-hidden="true"
        className="absolute border border-neutral-300 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <ImageFill1 />
      <Container9 />
    </div>
  );
}

function Container10() {
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
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">Dining Out Frequency (15times/week)</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start px-[265px] py-0 relative w-full">
          <div className="bg-[#555555] relative rounded-[10px] shrink-0 size-5" data-name="Background+Border+Shadow">
            <div
              aria-hidden="true"
              className="absolute border-2 border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div
      className="bg-neutral-200 box-border content-stretch flex h-2 items-center justify-center p-0 relative rounded-3xl shrink-0 w-full"
      data-name="Input"
    >
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[18px] items-start justify-start pb-[7.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label4 />
      <Input2 />
    </div>
  );
}

function Label5() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Label"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-700 w-full">
        <p className="block leading-[24px]">Entertainment Level (50%)</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-start pl-[235.55px] pr-[294.45px] py-0 relative w-full">
          <div className="bg-[#555555] relative rounded-[10px] shrink-0 size-5" data-name="Background+Border+Shadow">
            <div
              aria-hidden="true"
              className="absolute border-2 border-[#ffffff] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.1)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div
      className="bg-neutral-200 box-border content-stretch flex h-2 items-center justify-center p-0 relative rounded-3xl shrink-0 w-full"
      data-name="Input"
    >
      <Container13 />
    </div>
  );
}

function Container14() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[18px] items-start justify-start pb-[7.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Label5 />
      <Input3 />
    </div>
  );
}

function Container15() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container4 />
      <Container6 />
      <Container8 />
      <Container10 />
      <Container12 />
      <Container14 />
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-[33px] relative size-full">
          <Heading3 />
          <Container15 />
        </div>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[24px] text-nowrap tracking-[-0.6px]">
        <p className="adjustLetterSpacing block leading-[36px] whitespace-pre">Estimated Monthly Cost</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">리스본, 포르투갈</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] pb-[0.8px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[32px] text-nowrap text-right">
        <p className="block leading-[44.8px] whitespace-pre">$1433/month</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-px pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container19() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading5 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">Accommodation</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">$600</p>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between pb-[9px] pt-[7px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container20 />
      <Container21 />
    </div>
  );
}

function Container22() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">Food</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">$525</p>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between pb-[9px] pt-[7px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container22 />
      <Container23 />
    </div>
  );
}

function Container24() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">Coworking</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">$68</p>
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between pb-[9px] pt-[7px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container24 />
      <Container25 />
    </div>
  );
}

function Container26() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">Transport</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">$40</p>
      </div>
    </div>
  );
}

function HorizontalBorder3() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between pb-[9px] pt-[7px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container28() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">Entertainment</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap">
        <p className="block leading-[25.6px] whitespace-pre">$200</p>
      </div>
    </div>
  );
}

function HorizontalBorder4() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between pb-[9px] pt-[7px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container28 />
      <Container29 />
    </div>
  );
}

function Container30() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <HorizontalBorder />
      <HorizontalBorder1 />
      <HorizontalBorder2 />
      <HorizontalBorder3 />
      <HorizontalBorder4 />
    </div>
  );
}

function Heading4() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 4"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] tracking-[-0.4px] w-full">
        <p className="block leading-[19.2px]">City Information</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] w-full">
        <p className="block leading-[24px]">9.2/10</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-0 p-0 right-[283px] top-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Nomad Score</p>
      </div>
      <Container31 />
    </div>
  );
}

function Container33() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] w-full">
        <p className="block leading-[24px]">95Mbps</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[283px] p-0 right-0 top-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">WiFi Speed</p>
      </div>
      <Container33 />
    </div>
  );
}

function Container35() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] w-full">
        <p className="block leading-[24px]">45locations</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-0 p-0 right-[283px] top-16"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Coworking Spaces</p>
      </div>
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] w-full">
        <p className="block leading-[24px]">90days</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[283px] p-0 right-0 top-16"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Visa-free Stay</p>
      </div>
      <Container37 />
    </div>
  );
}

function Container39() {
  return (
    <div className="h-28 relative shrink-0 w-full" data-name="Container">
      <Container32 />
      <Container34 />
      <Container36 />
      <Container38 />
    </div>
  );
}

function HorizontalBorder5() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-3 items-start justify-start pb-0 pt-6 px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-neutral-200 border-solid inset-0 pointer-events-none"
      />
      <Heading4 />
      <Container39 />
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div
      className="basis-0 bg-[#ffffff] grow min-h-px min-w-px relative rounded-3xl self-stretch shrink-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start p-[33px] relative size-full">
          <Container19 />
          <Container30 />
          <HorizontalBorder5 />
        </div>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div
      className="box-border content-stretch flex gap-12 items-start justify-center p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <BackgroundBorder />
      <BackgroundBorder1 />
    </div>
  );
}

function Container41() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[63.99px] items-start justify-start max-w-[1280px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container2 />
      <Container40 />
    </div>
  );
}

function Section1() {
  return (
    <div
      className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-0 pb-10 pt-[23px] px-80 right-0 top-[222.19px]"
      data-name="Section"
    >
      <Container41 />
    </div>
  );
}

function Heading6() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[40px] text-center tracking-[-1px] w-full">
        <p className="block leading-[48px]">Popular Nomad Cities</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[20px] text-center w-full">
        <p className="block leading-[32px]">Explore nomad-friendly cities from around the world</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start max-w-[896px] p-0 relative shrink-0 w-[896px]"
      data-name="Container"
    >
      <Heading6 />
      <Container42 />
    </div>
  );
}

function Heading7() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">리스본</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">포르투갈</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading7 />
      <Container44 />
    </div>
  );
}

function Container46() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">Monthly Estimated Cost</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] pb-[0.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[25.6px] whitespace-pre">€1200-2000</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-px pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Container46 />
      <Container47 />
    </div>
  );
}

function Container49() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container45 />
          <Container48 />
        </div>
      </div>
    </div>
  );
}

function Margin() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container50() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Perfect Timezone</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container51() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin1 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Nomad Community</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container52() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin2 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Mild Climate</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container50 />
      <Container51 />
      <Container52 />
    </div>
  );
}

function Container54() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Nomad Score: 9.2/10</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">WiFi Average: 95Mbps</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container54 />
      <Container55 />
    </div>
  );
}

function HorizontalBorder6() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[17px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container56 />
    </div>
  );
}

function Component6() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-4 items-start justify-start left-0 p-[25px] right-[789.34px] rounded-3xl top-0"
      data-name="Component 6"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Container49 />
      <Container53 />
      <HorizontalBorder6 />
    </div>
  );
}

function Heading8() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">베르린</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">독일</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading8 />
      <Container57 />
    </div>
  );
}

function Container59() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">Monthly Estimated Cost</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] pb-[0.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[25.6px] whitespace-pre">€1500-2500</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-px pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Container59 />
      <Container60 />
    </div>
  );
}

function Container62() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container58 />
          <Container61 />
        </div>
      </div>
    </div>
  );
}

function Margin3() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container63() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin3 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Startup Hub</p>
      </div>
    </div>
  );
}

function Margin4() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container64() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin4 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Rich Culture</p>
      </div>
    </div>
  );
}

function Margin5() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container65() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin5 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Beer Paradise</p>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container63 />
      <Container64 />
      <Container65 />
    </div>
  );
}

function Container67() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Nomad Score: 9/10</p>
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">WiFi Average: 88Mbps</p>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container67 />
      <Container68 />
    </div>
  );
}

function HorizontalBorder7() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[17px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container69 />
    </div>
  );
}

function Component8() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-4 items-start justify-start left-[394.66px] p-[25px] right-[394.67px] rounded-3xl top-0"
      data-name="Component 6"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Container62 />
      <Container66 />
      <HorizontalBorder7 />
    </div>
  );
}

function Heading9() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">창구</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">인도네시아</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading9 />
      <Container70 />
    </div>
  );
}

function Container72() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">Monthly Estimated Cost</p>
      </div>
    </div>
  );
}

function Container73() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] pb-[0.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[25.6px] whitespace-pre">$800-1500</p>
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-px pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Container72 />
      <Container73 />
    </div>
  );
}

function Container75() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pl-0 pr-[0.01px] py-0 relative w-full">
          <Container71 />
          <Container74 />
        </div>
      </div>
    </div>
  );
}

function Margin6() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container76() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin6 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Low Cost Living</p>
      </div>
    </div>
  );
}

function Margin7() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container77() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin7 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Beach Life</p>
      </div>
    </div>
  );
}

function Margin8() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container78() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin8 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Surfing Paradise</p>
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container76 />
      <Container77 />
      <Container78 />
    </div>
  );
}

function Container80() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Nomad Score: 8.8/10</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">WiFi Average: 50Mbps</p>
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container80 />
      <Container81 />
    </div>
  );
}

function HorizontalBorder8() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[17px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container82 />
    </div>
  );
}

function Component9() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-4 items-start justify-start left-[789.33px] p-[25px] right-[0.01px] rounded-3xl top-0"
      data-name="Component 6"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Container75 />
      <Container79 />
      <HorizontalBorder8 />
    </div>
  );
}

function Heading10() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">치앙마이</p>
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">태국</p>
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading10 />
      <Container83 />
    </div>
  );
}

function Container85() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">Monthly Estimated Cost</p>
      </div>
    </div>
  );
}

function Container86() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] pb-[0.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[25.6px] whitespace-pre">$600-1200</p>
      </div>
    </div>
  );
}

function Container87() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-px pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Container85 />
      <Container86 />
    </div>
  );
}

function Container88() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container84 />
          <Container87 />
        </div>
      </div>
    </div>
  );
}

function Margin9() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container89() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin9 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Ultra Low Cost</p>
      </div>
    </div>
  );
}

function Margin10() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container90() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin10 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Delicious Food</p>
      </div>
    </div>
  );
}

function Margin11() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container91() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin11 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Friendly People</p>
      </div>
    </div>
  );
}

function Container92() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container89 />
      <Container90 />
      <Container91 />
    </div>
  );
}

function Container93() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Nomad Score: 8.5/10</p>
      </div>
    </div>
  );
}

function Container94() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">WiFi Average: 45Mbps</p>
      </div>
    </div>
  );
}

function Container95() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex items-start justify-between p-0 relative w-full">
          <Container93 />
          <Container94 />
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder9() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[17px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container95 />
    </div>
  );
}

function Component10() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-4 items-start justify-start left-0 p-[25px] right-[789.34px] rounded-3xl top-[294.59px]"
      data-name="Component 6"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Container88 />
      <Container92 />
      <HorizontalBorder9 />
    </div>
  );
}

function Heading11() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">호치민</p>
      </div>
    </div>
  );
}

function Container96() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">베트남</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading11 />
      <Container96 />
    </div>
  );
}

function Container98() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">Monthly Estimated Cost</p>
      </div>
    </div>
  );
}

function Container99() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] pb-[0.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[25.6px] whitespace-pre">$700-1300</p>
      </div>
    </div>
  );
}

function Container100() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-px pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Container98 />
      <Container99 />
    </div>
  );
}

function Container101() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between p-0 relative w-full">
          <Container97 />
          <Container100 />
        </div>
      </div>
    </div>
  );
}

function Margin12() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container102() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin12 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Affordable Cost</p>
      </div>
    </div>
  );
}

function Margin13() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container103() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin13 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Vibrant City</p>
      </div>
    </div>
  );
}

function Margin14() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container104() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin14 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Delicious Food</p>
      </div>
    </div>
  );
}

function Container105() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container102 />
      <Container103 />
      <Container104 />
    </div>
  );
}

function Container106() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Nomad Score: 8.3/10</p>
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">WiFi Average: 55Mbps</p>
      </div>
    </div>
  );
}

function Container108() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex items-start justify-between p-0 relative w-full">
          <Container106 />
          <Container107 />
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder10() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[17px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container108 />
    </div>
  );
}

function Component11() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-4 items-start justify-start left-[394.66px] p-[25px] right-[394.67px] rounded-3xl top-[294.59px]"
      data-name="Component 6"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Container101 />
      <Container105 />
      <HorizontalBorder10 />
    </div>
  );
}

function Heading12() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_'Noto_Sans_KR:Regular',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">멕시코시티</p>
      </div>
    </div>
  );
}

function Container109() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_'Noto_Sans_KR:Regular',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">멕시코</p>
      </div>
    </div>
  );
}

function Container110() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative shrink-0"
      data-name="Container"
    >
      <Heading12 />
      <Container109 />
    </div>
  );
}

function Container111() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-neutral-500 text-nowrap text-right">
        <p className="block leading-[24px] whitespace-pre">Monthly Estimated Cost</p>
      </div>
    </div>
  );
}

function Container112() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-end justify-start mb-[-1px] pb-[0.59px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[16px] text-nowrap text-right">
        <p className="block leading-[25.6px] whitespace-pre">$900-1600</p>
      </div>
    </div>
  );
}

function Container113() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-px pt-0 px-0 relative shrink-0"
      data-name="Container"
    >
      <Container111 />
      <Container112 />
    </div>
  );
}

function Container114() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex items-center justify-between pl-0 pr-[0.01px] py-0 relative w-full">
          <Container110 />
          <Container113 />
        </div>
      </div>
    </div>
  );
}

function Margin15() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container115() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin15 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Rich Culture</p>
      </div>
    </div>
  );
}

function Margin16() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container116() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin16 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Delicious Food</p>
      </div>
    </div>
  );
}

function Margin17() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-1 items-start justify-start pl-0 pr-2 py-0 relative shrink-0 w-3"
      data-name="Margin"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-1" data-name="Background" />
    </div>
  );
}

function Container117() {
  return (
    <div
      className="box-border content-stretch flex items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Margin17 />
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">{`Art & Design`}</p>
      </div>
    </div>
  );
}

function Container118() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container115 />
      <Container116 />
      <Container117 />
    </div>
  );
}

function Container119() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">Nomad Score: 8.4/10</p>
      </div>
    </div>
  );
}

function Container120() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-0 relative self-stretch shrink-0"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] max-h-[19.6px] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-neutral-500 text-nowrap">
        <p className="block leading-[19.6px] whitespace-pre">WiFi Average: 65Mbps</p>
      </div>
    </div>
  );
}

function Container121() {
  return (
    <div
      className="box-border content-stretch flex items-start justify-between p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Container119 />
      <Container120 />
    </div>
  );
}

function HorizontalBorder11() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start pb-0 pt-[17px] px-0 relative shrink-0 w-full"
      data-name="HorizontalBorder"
    >
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px_0px] border-neutral-100 border-solid inset-0 pointer-events-none"
      />
      <Container121 />
    </div>
  );
}

function Component12() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col gap-4 items-start justify-start left-[789.33px] p-[25px] right-[0.01px] rounded-3xl top-[294.59px]"
      data-name="Component 6"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Container114 />
      <Container118 />
      <HorizontalBorder11 />
    </div>
  );
}

function Container122() {
  return (
    <div className="h-[557.19px] max-w-[1152px] relative shrink-0 w-[1152px]" data-name="Container">
      <Component6 />
      <Component8 />
      <Component9 />
      <Component10 />
      <Component11 />
      <Component12 />
    </div>
  );
}

function Container123() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center max-w-inherit relative size-full">
        <div className="box-border content-stretch flex flex-col gap-12 items-center justify-start max-w-inherit px-6 py-0 relative w-full">
          <Container43 />
          <Container122 />
        </div>
      </div>
    </div>
  );
}

function Section2() {
  return (
    <div
      className="absolute bg-[#ffffff] box-border content-stretch flex flex-col items-start justify-start left-0 px-48 py-16 right-0 top-[1139.36px]"
      data-name="Section"
    >
      <Container123 />
    </div>
  );
}

function Heading13() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[40px] text-center tracking-[-1px] w-full">
        <p className="block leading-[48px]">Nomad Living Tips</p>
      </div>
    </div>
  );
}

function Container124() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[20px] text-center w-full">
        <p className="block leading-[32px]">Practical advice for successful digital nomad life</p>
      </div>
    </div>
  );
}

function Container125() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start max-w-[896px] p-0 relative shrink-0 w-[896px]"
      data-name="Container"
    >
      <Heading13 />
      <Container124 />
    </div>
  );
}

function Background() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <div className="bg-neutral-400 rounded-[9999px] shrink-0 size-6" data-name="Background" />
    </div>
  );
}

function Heading14() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[89px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">Budget Planning</p>
      </div>
    </div>
  );
}

function Container126() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[133px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[24px] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap whitespace-pre">
        <p className="block mb-0">Keep 20-30% buffer on your calculated</p>
        <p className="block mb-0">budget for unexpected expenses.</p>
        <p className="block mb-0">Consider exchange rate fluctuations,</p>
        <p className="block">medical costs, and emergency situations.</p>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[254px] left-0 right-[789.34px] rounded-3xl top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Background />
      <Heading14 />
      <Container126 />
    </div>
  );
}

function Background1() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <div className="rounded-lg shrink-0 size-6" data-name="Rectangle" />
    </div>
  );
}

function Heading15() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[89px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">Local Networking</p>
      </div>
    </div>
  );
}

function Container127() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[133px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[24px] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap whitespace-pre">
        <p className="block mb-0">Network with other nomads and</p>
        <p className="block mb-0">participate in local communities. Utilize</p>
        <p className="block mb-0">Facebook groups, Meetup, and</p>
        <p className="block">coworking space events.</p>
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[254px] left-[394.66px] right-[394.67px] rounded-3xl top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Background1 />
      <Heading15 />
      <Container127 />
    </div>
  );
}

function Background2() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <div className="bg-neutral-600 h-6 rounded-lg shrink-0 w-4" data-name="Background" />
    </div>
  );
}

function Heading16() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[89px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container128() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[133px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[254px] left-[789.33px] right-[0.01px] rounded-3xl top-0"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Background2 />
      <Heading16 />
      <Container128 />
    </div>
  );
}

function Background3() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <div className="relative rounded-[9999px] shrink-0 size-6" data-name="Border">
        <div
          aria-hidden="true"
          className="absolute border-2 border-neutral-500 border-solid inset-0 pointer-events-none rounded-[9999px]"
        />
      </div>
    </div>
  );
}

function Heading17() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[89px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container129() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[133px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[182px] left-0 right-[789.34px] rounded-3xl top-[286px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Background3 />
      <Heading17 />
      <Container129 />
    </div>
  );
}

function Margin18() {
  return (
    <div
      className="box-border content-stretch flex flex-col h-3 items-start justify-start pl-0 pr-1 py-0 relative shrink-0 w-4"
      data-name="Margin"
    >
      <div className="bg-neutral-600 rounded-[9999px] shrink-0 size-3" data-name="Background" />
    </div>
  );
}

function Background4() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Margin18 />
      <div className="bg-neutral-600 rounded-[9999px] shrink-0 size-3" data-name="Background" />
    </div>
  );
}

function Heading18() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[89px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container130() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[133px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder6() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[182px] left-[394.66px] right-[394.67px] rounded-3xl top-[286px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Background4 />
      <Heading18 />
      <Container130 />
    </div>
  );
}

function Border() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-6" data-name="Border">
      <div
        aria-hidden="true"
        className="absolute border-2 border-neutral-500 border-solid inset-0 pointer-events-none rounded-[9999px]"
      />
    </div>
  );
}

function Background5() {
  return (
    <div
      className="absolute bg-neutral-100 box-border content-stretch flex items-center justify-center left-[25px] p-0 rounded-3xl size-12 top-[25px]"
      data-name="Background"
    >
      <Border />
    </div>
  );
}

function Heading19() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[89px]"
      data-name="Heading 3"
    >
      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[20px] text-nowrap tracking-[-0.5px]">
        <p className="adjustLetterSpacing block leading-[32px] whitespace-pre">title</p>
      </div>
    </div>
  );
}

function Container131() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col items-start justify-start left-[25px] p-0 right-[25px] top-[133px]"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#555555] text-[16px] text-nowrap">
        <p className="block leading-[24px] whitespace-pre">description</p>
      </div>
    </div>
  );
}

function BackgroundBorder7() {
  return (
    <div
      className="absolute bg-[#ffffff] h-[182px] left-[789.33px] right-[0.01px] rounded-3xl top-[286px]"
      data-name="Background+Border"
    >
      <div
        aria-hidden="true"
        className="absolute border border-neutral-200 border-solid inset-0 pointer-events-none rounded-3xl"
      />
      <Background5 />
      <Heading19 />
      <Container131 />
    </div>
  );
}

function Container132() {
  return (
    <div className="h-[468px] max-w-[1152px] relative shrink-0 w-[1152px]" data-name="Container">
      <BackgroundBorder2 />
      <BackgroundBorder3 />
      <BackgroundBorder4 />
      <BackgroundBorder5 />
      <BackgroundBorder6 />
      <BackgroundBorder7 />
    </div>
  );
}

function Container133() {
  return (
    <div className="max-w-[1536px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center max-w-inherit relative size-full">
        <div className="box-border content-stretch flex flex-col gap-12 items-center justify-start max-w-inherit px-6 py-0 relative w-full">
          <Container125 />
          <Container132 />
        </div>
      </div>
    </div>
  );
}

function Section3() {
  return (
    <div
      className="absolute bg-[#f8f8f8] box-border content-stretch flex flex-col items-start justify-start left-0 px-48 py-16 right-0 top-[1968.55px]"
      data-name="Section"
    >
      <Container133 />
    </div>
  );
}

function Heading20() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-[0.8px] pt-0 px-0 relative shrink-0 w-full"
      data-name="Heading 2"
    >
      <div className="flex flex-col font-['Inter:Light',_sans-serif] font-light justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[64px] text-center tracking-[-1.6px] w-full">
        <p className="block leading-[76.8px]">title</p>
      </div>
    </div>
  );
}

function Container134() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-center justify-start pb-6 pt-0 px-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-neutral-300 w-full">
        <p className="block leading-[36px]">description</p>
      </div>
    </div>
  );
}

function Component7() {
  return (
    <div
      className="bg-[#ffffff] min-h-11 relative rounded-3xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0 w-full"
      data-name="Component 7"
    >
      <div className="flex flex-row items-center justify-center min-h-inherit overflow-clip relative size-full">
        <div className="box-border content-stretch flex items-center justify-center min-h-inherit px-10 py-4 relative w-full">
          <div className="basis-0 flex flex-col font-['Inter:Medium',_sans-serif] font-medium grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#000000] text-[0px] text-center">
            <p className="block leading-[25.6px] text-[16px]">button</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container135() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-6 items-start justify-start max-w-[768px] p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Heading20 />
      <Container134 />
      <Component7 />
    </div>
  );
}

function Section4() {
  return (
    <div
      className="absolute bg-neutral-900 box-border content-stretch flex flex-col items-start justify-start left-0 pb-16 pt-[63px] px-[576px] right-0 top-[2708.55px]"
      data-name="Section"
    >
      <Container135 />
    </div>
  );
}

export default function Main() {
  return (
    <div className="bg-[#ffffff] relative size-full" data-name="Main">
      <Section />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
}