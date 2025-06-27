"use strict";(()=>{var e={};e.id=517,e.ids=[517],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},42117:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>x,patchFetch:()=>f,requestAsyncStorage:()=>m,routeModule:()=>p,serverHooks:()=>g,staticGenerationAsyncStorage:()=>d});var s={};a.r(s),a.d(s,{GET:()=>u});var n=a(49303),o=a(88716),r=a(60670),i=a(87070);let c=new(a(11258)).$D("AIzaSyBX31RqKOdt98m5cDOJft-3EIcJyPg6C5c"),l=new Map;async function u(e){try{let{searchParams:t}=new URL(e.url),a=t.get("q"),s=t.get("lang")||"ko";if(!a||a.length<2)return i.NextResponse.json({success:!0,suggestions:[]});let n=`${a.toLowerCase()}-${s}`,o=l.get(n);if(o&&Date.now()-o.timestamp<18e5)return i.NextResponse.json({success:!0,suggestions:o.suggestions});let r=c.getGenerativeModel({model:"gemini-1.5-flash",generationConfig:{temperature:.3,topK:10,topP:.7,maxOutputTokens:512,candidateCount:1}}),u=function(e,t){let a={ko:`"${e}"와 관련된 유명한 관광명소 5개를 JSON 배열로만 답하세요.

중요 지시사항:
1. 검색어 자체가 명소명이라면 반드시 첫 번째로 포함하세요
2. 같은 도시/지역의 다른 주요 명소들을 포함하세요
3. 유사한 유형의 명소들을 포함하세요

형식: [{"name":"명소명","location":"국가, 도시"}]
예: [{"name":"세비야 대성당","location":"스페인, 세비야"}]
모든 답변을 한국어로 작성하세요.`,en:`Suggest 5 famous tourist attractions related to "${e}" in JSON array format only.

Important instructions:
1. If the search term is already an attraction name, include it as the first result
2. Include other major attractions in the same city/region
3. Include similar types of attractions

Format: [{"name":"attraction name","location":"country, city"}]
Example: [{"name":"Seville Cathedral","location":"Spain, Seville"}]
Write all responses in English.`,ja:`"${e}"に関連する有名な観光地5つをJSON配列形式のみで答えてください。

重要な指示:
1. 検索語が既に観光地名の場合、最初の結果として含めてください
2. 同じ都市/地域の他の主要な観光地を含めてください
3. 似たタイプの観光地を含めてください

形式: [{"name":"観光地名","location":"国、都市"}]
例: [{"name":"セビリア大聖堂","location":"スペイン、セビリア"}]
すべての回答を日本語で書いてください。`,zh:`请提供5个与"${e}"相关的著名旅游景点，仅用JSON数组格式回答。

重要指示:
1. 如果搜索词本身就是景点名称，请将其作为第一个结果
2. 包含同一城市/地区的其他主要景点
3. 包含类似类型的景点

格式: [{"name":"景点名称","location":"国家, 城市"}]
例如: [{"name":"塞维利亚大教堂","location":"西班牙, 塞维利亚"}]
请用中文回答所有内容。`,es:`Sugiere 5 atracciones tur\xedsticas famosas relacionadas con "${e}" solo en formato de array JSON.

Instrucciones importantes:
1. Si el t\xe9rmino de b\xfasqueda ya es un nombre de atracci\xf3n, incl\xfayelo como primer resultado
2. Incluye otras atracciones principales en la misma ciudad/regi\xf3n
3. Incluye atracciones de tipo similar

Formato: [{"name":"nombre de la atracci\xf3n","location":"pa\xeds, ciudad"}]
Ejemplo: [{"name":"Catedral de Sevilla","location":"Espa\xf1a, Sevilla"}]
Escribe todas las respuestas en espa\xf1ol.`};return a[t]||a.ko}(a,s),p=(await r.generateContent(u)).response.text().match(/\[[\s\S]*?\]/);if(!p)return i.NextResponse.json({success:!0,suggestions:[]});let m=JSON.parse(p[0]),d=Array.isArray(m)?m.slice(0,5):[];return l.set(n,{suggestions:d,timestamp:Date.now()}),i.NextResponse.json({success:!0,suggestions:d})}catch(e){return i.NextResponse.json({success:!0,suggestions:[]})}}let p=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/locations/search/route",pathname:"/api/locations/search",filename:"route",bundlePath:"app/api/locations/search/route"},resolvedPagePath:"C:\\guideai\\src\\app\\api\\locations\\search\\route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:m,staticGenerationAsyncStorage:d,serverHooks:g}=p,x="/api/locations/search/route";function f(){return(0,r.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:d})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),s=t.X(0,[380,972,258],()=>a(42117));module.exports=s})();