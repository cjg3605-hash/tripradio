# 🧭 개선된 nextDirection 프롬프트 가이드라인

## 필수 7요소 구조

```json
"nextDirection": "[1.출발점] [2.기준건물/길]을 따라 [3.정확한방향]으로 [4.구체적거리]미터 이동하세요. [5.경로특징] 지나면 [6.도착신호]가 보입니다. [7.소요시간]"
```

## 실제 적용 예시

### ✅ 좋은 예시
```json
"nextDirection": "현재 위치에서 메인 건물 외벽을 따라 북동쪽으로 80미터 이동하세요. 도중에 분수대와 안내판을 지나면 2층 석조 건물 입구가 보입니다. 약 2분 소요"
```

### ❌ 나쁜 예시 
```json
"nextDirection": "다음 장소로 이동하세요"
"nextDirection": "조금 더 가면 나옵니다"
```

## 언어별 상세 템플릿

### 한국어
```
"nextDirection": "현재 위치에서 [기준점: 메인건물/담장/길]을 따라 [방향: 북쪽/남쪽/동쪽/서쪽/북동쪽/북서쪽/남동쪽/남서쪽]으로 정확히 [숫자]미터 직진하세요. 이동 중 [경로특징: 분수대/조형물/표지판/계단] 등을 지나면 [도착신호: 특정건물/간판/입구]가 보입니다. 도보 약 [숫자]분 소요됩니다."
```

### 영어  
```
"nextDirection": "From your current position, follow the [landmark: main building/wall/path] heading [direction: north/south/east/west/northeast/northwest/southeast/southwest] for exactly [number] meters. Along the way, you'll pass [path features: fountain/sculpture/signage/stairs], and you'll know you've arrived when you see [arrival marker: specific building/sign/entrance]. Walking time: approximately [number] minutes."
```

### 중국语
```
"nextDirection": "从当前位置沿着[基准点：主建筑/围墙/道路]向[方向：北/南/东/西/东北/西北/东南/西南]方向行走[数字]米。途中会经过[路径特征：喷泉/雕塑/指示牌/台阶]，看到[到达标志：特定建筑/招牌/入口]就到了。步行约需[数字]分钟。"
```

## 🚨 중요 규칙

1. **절대 필수**: 정확한 방향 (북/남/동/서 등)
2. **절대 필수**: 구체적 거리 (미터 단위)
3. **절대 필수**: 기준점/랜드마크 명시
4. **절대 필수**: 도착 확인 신호
5. **권장**: 소요 시간 (분 단위)
6. **권장**: 경로상 특징물 안내

## 실제 관광지 예시

### 경복궁
```json
"nextDirection": "현재 위치에서 담장을 따라 북쪽으로 120미터 직진하세요. 도중에 수문장 교대식 무대를 지나면 근정문의 붉은 기둥이 보입니다. 도보 약 3분 소요됩니다."
```

### 에펠탑
```json  
"nextDirection": "From the tower base, follow the Seine River embankment eastward for 200 meters. Pass the souvenir stands and stairs, then you'll see the glass pyramid entrance of the museum. Walking time: approximately 4 minutes."
```

### 자금성
```json
"nextDirection": "从午门出发沿着中央石道向北行走150米。经过两侧的红墙和石狮子，看到太和门的金色屋顶就到了。步行约需3分钟。"
```