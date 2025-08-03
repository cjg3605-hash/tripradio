'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  FileText, 
  Globe, 
  Clock, 
  Activity,
  Server,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';

// 타입 정의
interface DashboardStats {
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

// 모의 데이터 (실제 구현시 API에서 가져옴)
const mockStats: DashboardStats = {
  users: {
    total: 12548,
    dailyActive: 847,
    weeklyActive: 3421,
    monthlyActive: 8932,
    newSignups: 156,
    retentionRate: 73.5
  },
  guides: {
    totalGenerated: 45621,
    dailyGenerated: 312,
    weeklyGenerated: 1987,
    completionRate: 84.2,
    averageLength: 8.5,
    topLanguages: [
      { language: 'Korean', count: 28473, percentage: 62.4 },
      { language: 'English', count: 9124, percentage: 20.0 },
      { language: 'Japanese', count: 4562, percentage: 10.0 },
      { language: 'Chinese', count: 2281, percentage: 5.0 },
      { language: 'Spanish', count: 1181, percentage: 2.6 }
    ]
  },
  locations: {
    popularDestinations: [
      { name: '경복궁', count: 3842, percentage: 8.4 },
      { name: '제주도', count: 3156, percentage: 6.9 },
      { name: '부산', count: 2843, percentage: 6.2 },
      { name: '경주', count: 2567, percentage: 5.6 },
      { name: '서울타워', count: 2234, percentage: 4.9 },
      { name: '인사동', count: 1987, percentage: 4.4 },
      { name: '명동', count: 1823, percentage: 4.0 },
      { name: '홍대', count: 1654, percentage: 3.6 },
      { name: '강남', count: 1432, percentage: 3.1 },
      { name: '대구', count: 1287, percentage: 2.8 }
    ],
    totalLocations: 1247
  },
  system: {
    uptime: 99.7,
    avgResponseTime: 245,
    errorRate: 0.3,
    serverLoad: 34.2
  },
  engagement: {
    avgSessionDuration: 12.4,
    pageViews: 127834,
    bounceRate: 23.8,
    engagementRate: 67.3
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // 인증 및 권한 확인
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // @ts-ignore - NextAuth 타입 확장
    if (!session?.user?.isAdmin) {
      router.push('/');
      return;
    }

    // 대시보드 데이터 로드
    loadDashboardData();
  }, [status, session, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 실제 구현시 여러 API 호출을 병렬로 처리
      // const [users, guides, locations, system] = await Promise.all([
      //   fetch('/api/admin/stats/users').then(r => r.json()),
      //   fetch('/api/admin/stats/guides').then(r => r.json()),
      //   fetch('/api/admin/stats/locations').then(r => r.json()),
      //   fetch('/api/admin/stats/system').then(r => r.json())
      // ]);
      
      // 현재는 모의 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
      setStats(mockStats);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-black transition-colors"
              >
                ← 홈으로
              </button>
              <h1 className="text-xl font-semibold text-black">관리자 대시보드</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-sm"
              >
                <option value="24h">최근 24시간</option>
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-black">
                  {session?.user?.name || '관리자'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 일일 방문자 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">일일 방문자</p>
                <p className="text-2xl font-bold text-black">{formatNumber(stats.users.dailyActive)}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{formatNumber(stats.users.newSignups)} 신규
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 일일 가이드 생성 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">일일 가이드 생성</p>
                <p className="text-2xl font-bold text-black">{formatNumber(stats.guides.dailyGenerated)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  완료율 {formatPercentage(stats.guides.completionRate)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* 시스템 응답시간 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
                <p className="text-2xl font-bold text-black">{stats.system.avgResponseTime}ms</p>
                <p className="text-xs text-green-600 mt-1">
                  ↑ {formatPercentage(stats.system.uptime)} 가동률
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* 사용자 참여도 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">사용자 참여도</p>
                <p className="text-2xl font-bold text-black">{formatPercentage(stats.engagement.engagementRate)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  평균 {stats.engagement.avgSessionDuration}분 세션
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 차트 및 상세 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 인기 관광지 TOP 10 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">인기 관광지 TOP 10</h3>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.locations.popularDestinations.map((location, index) => (
                <div key={location.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{location.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-black">{formatNumber(location.count)}</p>
                    <p className="text-xs text-gray-500">{formatPercentage(location.percentage)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 언어별 가이드 분포 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">언어별 가이드 분포</h3>
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.guides.topLanguages.map((lang) => (
                <div key={lang.language}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                    <span className="text-sm text-gray-600">{formatPercentage(lang.percentage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 시스템 상태 및 성능 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 시스템 성능 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">시스템 성능</h3>
              <Server className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">서버 가동률</span>
                <span className="text-sm font-medium text-green-600">{formatPercentage(stats.system.uptime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">평균 응답시간</span>
                <span className="text-sm font-medium text-black">{stats.system.avgResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">에러율</span>
                <span className="text-sm font-medium text-red-600">{formatPercentage(stats.system.errorRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">서버 부하</span>
                <span className="text-sm font-medium text-orange-600">{formatPercentage(stats.system.serverLoad)}</span>
              </div>
            </div>
          </div>

          {/* 사용자 통계 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">사용자 통계</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">총 사용자</span>
                <span className="text-sm font-medium text-black">{formatNumber(stats.users.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">주간 활성 사용자</span>
                <span className="text-sm font-medium text-black">{formatNumber(stats.users.weeklyActive)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">월간 활성 사용자</span>
                <span className="text-sm font-medium text-black">{formatNumber(stats.users.monthlyActive)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">사용자 유지율</span>
                <span className="text-sm font-medium text-green-600">{formatPercentage(stats.users.retentionRate)}</span>
              </div>
            </div>
          </div>

          {/* 콘텐츠 통계 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">콘텐츠 통계</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">총 생성 가이드</span>
                <span className="text-sm font-medium text-black">{formatNumber(stats.guides.totalGenerated)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">주간 생성량</span>
                <span className="text-sm font-medium text-black">{formatNumber(stats.guides.weeklyGenerated)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">평균 가이드 길이</span>
                <span className="text-sm font-medium text-black">{stats.guides.averageLength}분</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">등록된 관광지</span>
                <span className="text-sm font-medium text-black">{formatNumber(stats.locations.totalLocations)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}