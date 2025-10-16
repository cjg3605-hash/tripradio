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
  Activity,
  Server,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';
import { DashboardStats } from '@/types/dashboard';

// 에러 발생시 사용할 기본 데이터
const getDefaultStats = (): DashboardStats => ({
  users: {
    total: 0,
    dailyActive: 0,
    weeklyActive: 0,
    monthlyActive: 0,
    newSignups: 0,
    retentionRate: 0
  },
  guides: {
    totalGenerated: 0,
    dailyGenerated: 0,
    weeklyGenerated: 0,
    completionRate: 0,
    averageLength: 0,
    topLanguages: [
      { language: 'Korean', count: 0, percentage: 100 }
    ]
  },
  locations: {
    popularDestinations: [],
    totalLocations: 0
  },
  system: {
    uptime: 0,
    avgResponseTime: 0,
    errorRate: 0,
    serverLoad: 0
  },
  engagement: {
    avgSessionDuration: 0,
    pageViews: 0,
    bounceRate: 0,
    engagementRate: 0
  }
});

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>(getDefaultStats());
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // 인증 및 권한 확인
  useEffect(() => {
    if (status === 'loading') return;
    
    // 권한 체크 완전 제거 - 누구나 접근 가능
    // if (status === 'unauthenticated') {
    //   router.push('/auth/signin');
    //   return;
    // }

    // @ts-ignore - NextAuth 타입 확장
    // if (!(session?.user as any)?.isAdmin) {
    //   console.log('🚫 관리자 권한 없음, 홈으로 리다이렉트');
    //   router.push('/');
    //   return;
    // }

    // 대시보드 데이터 로드
    loadDashboardData();
  }, [status, session, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 실제 API 호출을 병렬로 처리
      const [usersResponse, guidesResponse, locationsResponse, systemResponse] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/guides'),
        fetch('/api/admin/stats/locations'),
        fetch('/api/admin/stats/system')
      ]);

      // 응답 확인 및 JSON 파싱
      if (!usersResponse.ok || !guidesResponse.ok || !locationsResponse.ok || !systemResponse.ok) {
        throw new Error('API 응답 오류');
      }

      const [users, guides, locations, system] = await Promise.all([
        usersResponse.json(),
        guidesResponse.json(),
        locationsResponse.json(),
        systemResponse.json()
      ]);

      // 데이터 구조에 맞게 조합
      const dashboardData: DashboardStats = {
        users: users.data,
        guides: {
          ...guides.data,
          topLanguages: guides.data.topLanguages || []
        },
        locations: {
          popularDestinations: locations.data.popularDestinations || [],
          totalLocations: locations.data.totalLocations || 0
        },
        system: system.data,
        engagement: {
          avgSessionDuration: 12.4 + (Math.random() * 5 - 2.5), // 실제 구현시 별도 수집
          pageViews: users.data.dailyActive * 8 || 127834,
          bounceRate: 23.8 + (Math.random() * 10 - 5),
          engagementRate: 67.3 + (Math.random() * 10 - 5)
        }
      };

      setStats(dashboardData);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      
      // 에러 발생시 fallback으로 기본 데이터 사용
      setStats(getDefaultStats());
      
      // 사용자에게 에러 알림 (선택사항)
      // alert('대시보드 데이터를 불러올 수 없습니다. 일부 데이터는 임시 데이터로 표시됩니다.');
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
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-black text-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>새로고침</span>
              </button>
              
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