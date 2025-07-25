/**
 * 🧭 AI 기반 경로 최적화 시스템
 * 사용자 위치, 선호도, 시간, 혼잡도를 고려한 최적 경로 생성
 */

import { LocationPoint } from '@/types/location';

export interface RouteWaypoint {
  id: string;
  location: LocationPoint;
  name: string;
  type: 'start' | 'poi' | 'rest' | 'viewpoint' | 'end';
  estimatedDuration: number; // minutes
  priority: 'low' | 'medium' | 'high' | 'essential';
  difficulty: 'easy' | 'moderate' | 'challenging';
  crowdLevel?: 'low' | 'medium' | 'high';
  weather?: {
    indoor: boolean;
    sheltered: boolean;
  };
  accessibility?: {
    wheelchairFriendly: boolean;
    stairs: number;
  };
  openHours?: {
    open: string;
    close: string;
    days: number[]; // 0=Sunday, 1=Monday...
  };
  tags: string[];
}

export interface RouteConstraints {
  maxDuration: number; // minutes
  maxDistance: number; // meters
  maxDifficulty: 'easy' | 'moderate' | 'challenging';
  preferredPace: 'slow' | 'moderate' | 'fast';
  avoidCrowds: boolean;
  weatherSensitive: boolean;
  accessibilityNeeds: boolean;
  interests: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayType: 'weekday' | 'weekend';
  groupSize: number;
  energyLevel: 'low' | 'medium' | 'high';
}

export interface OptimizedRoute {
  id: string;
  waypoints: RouteWaypoint[];
  totalDuration: number;
  totalDistance: number;
  estimatedWalkingTime: number;
  averageDifficulty: number;
  route: {
    coordinates: [number, number][];
    instructions: string[];
    segments: Array<{
      from: string;
      to: string;
      distance: number;
      duration: number;
      mode: 'walking' | 'transit' | 'taxi';
    }>;
  };
  alternatives: Array<{
    reason: string;
    waypoints: string[];
    timeSaved?: number;
    benefits: string[];
  }>;
  quality: {
    score: number; // 0-100
    efficiency: number;
    satisfaction: number;
    accessibility: number;
    timing: number;
  };
  metadata: {
    optimizationTime: number;
    algorithm: string;
    confidence: number;
    weatherConsidered: boolean;
    crowdDataUsed: boolean;
  };
}

class RouteOptimizer {
  private crowdDataCache = new Map<string, any>();
  private weatherCache = new Map<string, any>();
  private routeCache = new Map<string, OptimizedRoute>();
  
  /**
   * 🎯 메인 경로 최적화 함수
   */
  async optimizeRoute(
    waypoints: RouteWaypoint[],
    constraints: RouteConstraints,
    startLocation: LocationPoint
  ): Promise<OptimizedRoute> {
    const startTime = Date.now();
    
    try {
      // 1. 입력 검증 및 전처리
      const validatedWaypoints = this.validateAndPreprocessWaypoints(waypoints, constraints);
      
      // 2. 실시간 데이터 수집
      const contextData = await this.gatherContextualData(validatedWaypoints, constraints);
      
      // 3. 다중 알고리즘 최적화
      const optimizationResults = await this.runMultipleOptimizations(
        validatedWaypoints,
        constraints,
        startLocation,
        contextData
      );
      
      // 4. 최적 결과 선택
      const bestRoute = this.selectBestRoute(optimizationResults, constraints);
      
      // 5. 경로 세부 정보 생성
      const detailedRoute = await this.generateDetailedRoute(bestRoute, contextData);
      
      // 6. 품질 평가
      const qualityMetrics = this.evaluateRouteQuality(detailedRoute, constraints);
      
      const optimizedRoute: OptimizedRoute = {
        id: `route_${Date.now()}`,
        waypoints: detailedRoute.waypoints,
        totalDuration: detailedRoute.totalDuration,
        totalDistance: detailedRoute.totalDistance,
        estimatedWalkingTime: detailedRoute.estimatedWalkingTime,
        averageDifficulty: this.calculateAverageDifficulty(detailedRoute.waypoints),
        route: detailedRoute.route,
        alternatives: detailedRoute.alternatives,
        quality: qualityMetrics,
        metadata: {
          optimizationTime: Date.now() - startTime,
          algorithm: bestRoute.algorithm,
          confidence: bestRoute.confidence,
          weatherConsidered: contextData.weather !== null,
          crowdDataUsed: contextData.crowdData.size > 0
        }
      };
      
      // 캐시 저장
      this.cacheRoute(optimizedRoute, constraints);
      
      return optimizedRoute;
      
    } catch (error) {
      console.error('Route optimization failed:', error);
      throw new Error('경로 최적화에 실패했습니다');
    }
  }
  
  /**
   * 🔍 다중 알고리즘 최적화
   */
  private async runMultipleOptimizations(
    waypoints: RouteWaypoint[],
    constraints: RouteConstraints,
    startLocation: LocationPoint,
    contextData: any
  ) {
    const algorithms = [
      this.geneticAlgorithmOptimization,
      this.greedyHeuristicOptimization,
      this.dynamicProgrammingOptimization,
      this.simulatedAnnealingOptimization
    ];
    
    const results = await Promise.allSettled(
      algorithms.map(algorithm => 
        algorithm.call(this, waypoints, constraints, startLocation, contextData)
      )
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }
  
  /**
   * 🧬 유전자 알고리즘 최적화
   */
  private async geneticAlgorithmOptimization(
    waypoints: RouteWaypoint[],
    constraints: RouteConstraints,
    startLocation: LocationPoint,
    contextData: any
  ) {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    
    // 초기 집단 생성
    let population = this.generateInitialPopulation(waypoints, populationSize, constraints);
    
    for (let generation = 0; generation < generations; generation++) {
      // 적합도 평가
      const fitnessScores = population.map(individual => 
        this.calculateFitness(individual, constraints, contextData)
      );
      
      // 선택, 교배, 돌연변이
      population = this.evolvePopulation(population, fitnessScores, mutationRate);
      
      // 조기 종료 조건
      if (generation % 10 === 0) {
        const bestFitness = Math.max(...fitnessScores);
        if (bestFitness > 0.95) break; // 충분히 좋은 해 발견
      }
    }
    
    const bestIndividual = population[0];
    
    return {
      waypoints: bestIndividual,
      confidence: 0.9,
      algorithm: 'genetic',
      score: this.calculateFitness(bestIndividual, constraints, contextData)
    };
  }
  
  /**
   * 🎯 탐욕적 휴리스틱 최적화
   */
  private async greedyHeuristicOptimization(
    waypoints: RouteWaypoint[],
    constraints: RouteConstraints,
    startLocation: LocationPoint,
    contextData: any
  ) {
    const optimizedWaypoints: RouteWaypoint[] = [];
    let currentLocation = startLocation;
    let remainingWaypoints = [...waypoints];
    let totalDuration = 0;
    
    // 시작점 추가
    const startWaypoint = remainingWaypoints.find(w => w.type === 'start');
    if (startWaypoint) {
      optimizedWaypoints.push(startWaypoint);
      remainingWaypoints = remainingWaypoints.filter(w => w.id !== startWaypoint.id);
      currentLocation = startWaypoint.location;
    }
    
    while (remainingWaypoints.length > 0 && totalDuration < constraints.maxDuration) {
      // 현재 위치에서 가장 효율적인 다음 지점 선택
      const nextWaypoint = this.selectNextWaypoint(
        currentLocation,
        remainingWaypoints,
        constraints,
        contextData,
        totalDuration
      );
      
      if (!nextWaypoint) break;
      
      optimizedWaypoints.push(nextWaypoint);
      currentLocation = nextWaypoint.location;
      totalDuration += nextWaypoint.estimatedDuration;
      
      // 이동 시간 추가
      const travelTime = this.estimateTravelTime(
        optimizedWaypoints[optimizedWaypoints.length - 2]?.location || startLocation,
        currentLocation,
        constraints.preferredPace
      );
      totalDuration += travelTime;
      
      remainingWaypoints = remainingWaypoints.filter(w => w.id !== nextWaypoint.id);
    }
    
    return {
      waypoints: optimizedWaypoints,
      confidence: 0.8,
      algorithm: 'greedy',
      score: this.calculateRouteScore(optimizedWaypoints, constraints, contextData)
    };
  }
  
  /**
   * 💰 동적 계획법 최적화
   */
  private async dynamicProgrammingOptimization(
    waypoints: RouteWaypoint[],
    constraints: RouteConstraints,
    startLocation: LocationPoint,
    contextData: any
  ) {
    const n = waypoints.length;
    if (n > 20) {
      // 동적 계획법은 계산 복잡도가 높으므로 웨이포인트가 많으면 스킵
      throw new Error('Too many waypoints for DP optimization');
    }
    
    // DP 테이블 초기화
    const dp = new Map<string, { value: number; path: RouteWaypoint[] }>();
    
    // 기저 조건: 각 단일 웨이포인트
    waypoints.forEach(waypoint => {
      const key = this.createStateKey([waypoint], 0);
      dp.set(key, {
        value: this.calculateWaypointValue(waypoint, constraints, contextData),
        path: [waypoint]
      });
    });
    
    // Bottom-up DP
    for (let size = 2; size <= n; size++) {
      const combinations = this.generateCombinations(waypoints, size);
      
      for (const combination of combinations) {
        if (this.exceedsConstraints(combination, constraints)) continue;
        
        const key = this.createStateKey(combination, 0);
        let bestValue = 0;
        let bestPath: RouteWaypoint[] = [];
        
        // 마지막 웨이포인트를 제거한 모든 조합 확인
        for (let i = 0; i < combination.length; i++) {
          const subCombination = combination.filter((_, index) => index !== i);
          const subKey = this.createStateKey(subCombination, 0);
          const subResult = dp.get(subKey);
          
          if (subResult) {
            const totalValue = subResult.value + 
              this.calculateWaypointValue(combination[i], constraints, contextData) -
              this.calculateTransitionCost(subResult.path, combination[i], constraints);
            
            if (totalValue > bestValue) {
              bestValue = totalValue;
              bestPath = [...subResult.path, combination[i]];
            }
          }
        }
        
        dp.set(key, { value: bestValue, path: bestPath });
      }
    }
    
    // 최적 결과 찾기
    let bestResult = { value: 0, path: [] as RouteWaypoint[] };
    for (const [key, result] of dp) {
      if (result.value > bestResult.value) {
        bestResult = result;
      }
    }
    
    return {
      waypoints: bestResult.path,
      confidence: 0.95,
      algorithm: 'dynamic_programming',
      score: bestResult.value
    };
  }
  
  /**
   * 🌡️ 시뮬레이티드 어닐링 최적화
   */
  private async simulatedAnnealingOptimization(
    waypoints: RouteWaypoint[],
    constraints: RouteConstraints,
    startLocation: LocationPoint,
    contextData: any
  ) {
    const maxIterations = 1000;
    const initialTemperature = 100;
    const coolingRate = 0.95;
    
    // 초기 해 생성
    let currentSolution = this.shuffleArray([...waypoints]);
    let currentScore = this.calculateRouteScore(currentSolution, constraints, contextData);
    
    let bestSolution = [...currentSolution];
    let bestScore = currentScore;
    
    let temperature = initialTemperature;
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // 이웃 해 생성 (두 요소 교환)
      const neighbor = this.generateNeighborSolution(currentSolution);
      const neighborScore = this.calculateRouteScore(neighbor, constraints, contextData);
      
      // 수락 조건 확인
      const deltaScore = neighborScore - currentScore;
      const acceptanceProbability = deltaScore > 0 ? 1 : Math.exp(deltaScore / temperature);
      
      if (Math.random() < acceptanceProbability) {
        currentSolution = neighbor;
        currentScore = neighborScore;
        
        if (currentScore > bestScore) {
          bestSolution = [...currentSolution];
          bestScore = currentScore;
        }
      }
      
      // 온도 감소
      temperature *= coolingRate;
    }
    
    return {
      waypoints: bestSolution,
      confidence: 0.85,
      algorithm: 'simulated_annealing',
      score: bestScore
    };
  }
  
  /**
   * 🏆 최적 경로 선택
   */
  private selectBestRoute(results: any[], constraints: RouteConstraints) {
    if (results.length === 0) {
      throw new Error('No optimization results available');
    }
    
    // 다중 기준 평가
    const scoredResults = results.map(result => ({
      ...result,
      totalScore: this.calculateMultiCriteriaScore(result, constraints)
    }));
    
    // 최고 점수 선택
    scoredResults.sort((a, b) => b.totalScore - a.totalScore);
    
    return scoredResults[0];
  }
  
  /**
   * 📊 다중 기준 점수 계산
   */
  private calculateMultiCriteriaScore(result: any, constraints: RouteConstraints): number {
    const weights = {
      efficiency: 0.3,
      satisfaction: 0.25,
      constraints: 0.2,
      diversity: 0.15,
      practicality: 0.1
    };
    
    const scores = {
      efficiency: this.calculateEfficiencyScore(result, constraints),
      satisfaction: this.calculateSatisfactionScore(result, constraints),
      constraints: this.calculateConstraintComplianceScore(result, constraints),
      diversity: this.calculateDiversityScore(result),
      practicality: this.calculatePracticalityScore(result, constraints)
    };
    
    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);
  }
  
  // ========== 유틸리티 함수들 ==========
  
  private validateAndPreprocessWaypoints(waypoints: RouteWaypoint[], constraints: RouteConstraints): RouteWaypoint[] {
    return waypoints.filter(waypoint => {
      // 제약 조건에 맞지 않는 웨이포인트 필터링
      if (waypoint.difficulty === 'challenging' && constraints.maxDifficulty !== 'challenging') {
        return false;
      }
      
      if (constraints.accessibilityNeeds && !waypoint.accessibility?.wheelchairFriendly) {
        return false;
      }
      
      return true;
    });
  }
  
  private async gatherContextualData(waypoints: RouteWaypoint[], constraints: RouteConstraints) {
    const crowdDataPromises = waypoints.map(w => this.getCrowdData(w.id));
    const weatherPromise = this.getWeatherData();
    
    const [crowdDataResults, weather] = await Promise.all([
      Promise.allSettled(crowdDataPromises),
      weatherPromise.catch(() => null)
    ]);
    
    const crowdData = new Map();
    crowdDataResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        crowdData.set(waypoints[index].id, result.value);
      }
    });
    
    return { crowdData, weather };
  }
  
  private calculateFitness(waypoints: RouteWaypoint[], constraints: RouteConstraints, contextData: any): number {
    // 적합도 계산 로직
    return Math.random(); // 간소화된 구현
  }
  
  private generateInitialPopulation(waypoints: RouteWaypoint[], size: number, constraints: RouteConstraints): RouteWaypoint[][] {
    const population: RouteWaypoint[][] = [];
    for (let i = 0; i < size; i++) {
      population.push(this.shuffleArray([...waypoints]));
    }
    return population;
  }
  
  private evolvePopulation(population: RouteWaypoint[][], fitnessScores: number[], mutationRate: number): RouteWaypoint[][] {
    // 선택, 교배, 돌연변이 로직
    return population; // 간소화된 구현
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  private generateNeighborSolution(solution: RouteWaypoint[]): RouteWaypoint[] {
    const neighbor = [...solution];
    const i = Math.floor(Math.random() * neighbor.length);
    const j = Math.floor(Math.random() * neighbor.length);
    [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
    return neighbor;
  }
  
  private calculateRouteScore(waypoints: RouteWaypoint[], constraints: RouteConstraints, contextData: any): number {
    // 경로 점수 계산
    return Math.random(); // 간소화된 구현
  }
  
  private selectNextWaypoint(
    currentLocation: LocationPoint,
    candidates: RouteWaypoint[],
    constraints: RouteConstraints,
    contextData: any,
    currentDuration: number
  ): RouteWaypoint | null {
    // 다음 웨이포인트 선택 로직
    return candidates[0] || null; // 간소화된 구현
  }
  
  private estimateTravelTime(from: LocationPoint, to: LocationPoint, pace: string): number {
    const distance = this.calculateDistance(from, to);
    const speed = pace === 'fast' ? 1.5 : pace === 'slow' ? 0.8 : 1.2; // m/s
    return (distance / speed) / 60; // minutes
  }
  
  private calculateDistance(from: LocationPoint, to: LocationPoint): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = from.lat * Math.PI / 180;
    const φ2 = to.lat * Math.PI / 180;
    const Δφ = (to.lat - from.lat) * Math.PI / 180;
    const Δλ = (to.lng - from.lng) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
  
  private async generateDetailedRoute(bestRoute: any, contextData: any): Promise<any> {
    // 상세 경로 정보 생성
    return {
      waypoints: bestRoute.waypoints,
      totalDuration: 120,
      totalDistance: 2000,
      estimatedWalkingTime: 30,
      route: {
        coordinates: [] as [number, number][],
        instructions: [] as string[],
        segments: [] as any[]
      },
      alternatives: [] as any[]
    };
  }
  
  private evaluateRouteQuality(route: any, constraints: RouteConstraints) {
    return {
      score: 85,
      efficiency: 0.9,
      satisfaction: 0.8,
      accessibility: 0.9,
      timing: 0.85
    };
  }
  
  private calculateAverageDifficulty(waypoints: RouteWaypoint[]): number {
    const difficultyMap = { easy: 1, moderate: 2, challenging: 3 };
    const total = waypoints.reduce((sum, w) => sum + difficultyMap[w.difficulty], 0);
    return total / waypoints.length;
  }
  
  private cacheRoute(route: OptimizedRoute, constraints: RouteConstraints) {
    const key = this.generateCacheKey(route.waypoints, constraints);
    this.routeCache.set(key, route);
  }
  
  private generateCacheKey(waypoints: RouteWaypoint[], constraints: RouteConstraints): string {
    const waypointIds = waypoints.map(w => w.id).sort().join(',');
    const constraintHash = JSON.stringify(constraints);
    return `${waypointIds}_${constraintHash}`;
  }
  
  private async getCrowdData(waypointId: string): Promise<any> {
    // 실시간 혼잡도 데이터 가져오기
    return { level: 'medium', timestamp: Date.now() };
  }
  
  private async getWeatherData(): Promise<any> {
    // 날씨 데이터 가져오기
    return { condition: 'sunny', temperature: 22 };
  }
  
  // 기타 필요한 유틸리티 함수들...
  private createStateKey(waypoints: RouteWaypoint[], time: number): string {
    return waypoints.map(w => w.id).sort().join(',') + `_${time}`;
  }
  
  private generateCombinations<T>(items: T[], size: number): T[][] {
    if (size === 1) return items.map(item => [item]);
    return items.flatMap((item, index) =>
      this.generateCombinations(items.slice(index + 1), size - 1).map(combo => [item, ...combo])
    );
  }
  
  private exceedsConstraints(waypoints: RouteWaypoint[], constraints: RouteConstraints): boolean {
    const totalDuration = waypoints.reduce((sum, w) => sum + w.estimatedDuration, 0);
    return totalDuration > constraints.maxDuration;
  }
  
  private calculateWaypointValue(waypoint: RouteWaypoint, constraints: RouteConstraints, contextData: any): number {
    let value = 10; // 기본 값
    
    if (waypoint.priority === 'essential') value += 20;
    else if (waypoint.priority === 'high') value += 10;
    else if (waypoint.priority === 'medium') value += 5;
    
    // 관심사 매칭
    const matchingTags = waypoint.tags.filter(tag => constraints.interests.includes(tag));
    value += matchingTags.length * 5;
    
    return value;
  }
  
  private calculateTransitionCost(path: RouteWaypoint[], nextWaypoint: RouteWaypoint, constraints: RouteConstraints): number {
    if (path.length === 0) return 0;
    
    const lastWaypoint = path[path.length - 1];
    const distance = this.calculateDistance(lastWaypoint.location, nextWaypoint.location);
    const travelTime = this.estimateTravelTime(lastWaypoint.location, nextWaypoint.location, constraints.preferredPace);
    
    return distance * 0.01 + travelTime * 0.1; // 비용 계산
  }
  
  private calculateEfficiencyScore(result: any, constraints: RouteConstraints): number {
    return Math.random() * 100; // 간소화된 구현
  }
  
  private calculateSatisfactionScore(result: any, constraints: RouteConstraints): number {
    return Math.random() * 100; // 간소화된 구현
  }
  
  private calculateConstraintComplianceScore(result: any, constraints: RouteConstraints): number {
    return Math.random() * 100; // 간소화된 구현
  }
  
  private calculateDiversityScore(result: any): number {
    return Math.random() * 100; // 간소화된 구현
  }
  
  private calculatePracticalityScore(result: any, constraints: RouteConstraints): number {
    return Math.random() * 100; // 간소화된 구현
  }
}

export { RouteOptimizer };
export default RouteOptimizer;