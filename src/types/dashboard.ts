// 대시보드 관련 타입 정의
export interface DashboardStats {
  users: {
    total: number;
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
    newSignups: number;
    retentionRate: number;
  };
  guides: {
    totalGenerated: number;
    dailyGenerated: number;
    weeklyGenerated: number;
    completionRate: number;
    averageLength: number;
    topLanguages: Array<{ language: string; count: number; percentage: number }>;
  };
  locations: {
    popularDestinations: Array<{ name: string; count: number; percentage: number }>;
    totalLocations: number;
  };
  system: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    serverLoad: number;
  };
  engagement: {
    avgSessionDuration: number;
    pageViews: number;
    bounceRate: number;
    engagementRate: number;
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 통계 관련 기본 타입들
export interface TrendData {
  date: string;
  count: number;
}

export interface LanguageStats {
  language: string;
  count: number;
  percentage: number;
}

export interface LocationStats {
  name: string;
  count: number;
  percentage: number;
  trend?: string;
}