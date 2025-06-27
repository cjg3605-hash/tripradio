"use strict";(()=>{var e={};e.id=877,e.ids=[877],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},41865:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>h,requestAsyncStorage:()=>c,routeModule:()=>p,serverHooks:()=>g,staticGenerationAsyncStorage:()=>l});var a={};r.r(a),r.d(a,{POST:()=>d});var i=r(49303),s=r(88716),n=r(60670),o=r(87070),u=r(11258);async function d(e){try{let t="AIzaSyBX31RqKOdt98m5cDOJft-3EIcJyPg6C5c";if(!t)return o.NextResponse.json({error:"GEMINI_API_KEY가 설정되지 않았습니다."},{status:500});let{location:r,userPreferences:a}=await e.json();if(!r)return o.NextResponse.json({error:"location이 필요합니다."},{status:400});let i=new u.$D(t).getGenerativeModel({model:"gemini-1.5-flash"}),s=`다음 관광지에 대한 상세한 가이드를 작성해주세요:
    
위치: ${r}
사용자 선호사항: ${JSON.stringify(a)}

다음 형식으로 응답해주세요:
{
  "location": "${r}",
  "overview": "관광지 개요",
  "history": "역사적 배경",
  "highlights": ["주요 볼거리1", "주요 볼거리2", "주요 볼거리3"],
  "tips": ["팁1", "팁2", "팁3"],
  "estimatedTime": "예상 소요시간",
  "bestTime": "방문하기 좋은 시간"
}

JSON 형식으로만 응답해주세요.`,n=await i.generateContent(s),d=(await n.response).text();try{let e=JSON.parse(d);return o.NextResponse.json({success:!0,data:e})}catch(e){return o.NextResponse.json({success:!0,data:{location:r,content:d,raw:!0}})}}catch(e){return o.NextResponse.json({error:"가이드 생성 중 오류가 발생했습니다.",details:e.message},{status:500})}}let p=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/ai/generate-detailed-guide/route",pathname:"/api/ai/generate-detailed-guide",filename:"route",bundlePath:"app/api/ai/generate-detailed-guide/route"},resolvedPagePath:"C:\\guideai\\src\\app\\api\\ai\\generate-detailed-guide\\route.ts",nextConfigOutput:"standalone",userland:a}),{requestAsyncStorage:c,staticGenerationAsyncStorage:l,serverHooks:g}=p,m="/api/ai/generate-detailed-guide/route";function h(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:l})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[380,972,258],()=>r(41865));module.exports=a})();