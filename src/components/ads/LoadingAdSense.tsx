// 이 컴포넌트는 애드센스 정책 위반으로 인해 비활성화됨
// 로딩 화면은 "콘텐츠가 없는 화면"에 해당하여 구글 광고 게재 불가

'use client';

interface LoadingAdSenseProps {
  className?: string;
  style?: React.CSSProperties;
  adTest?: boolean;
}

// DEPRECATED: 애드센스 정책 준수를 위해 비활성화
export default function LoadingAdSense({
  className = '',
  style = {},
  adTest = process.env.NODE_ENV === 'development'
}: LoadingAdSenseProps) {
  // 애드센스 정책 준수를 위해 빈 컴포넌트 반환
  console.warn('⚠️ LoadingAdSense 컴포넌트는 애드센스 정책 위반으로 비활성화되었습니다.');
  
  return (
    <div className={`${className} text-center p-4`} style={style}>
      <div className="text-gray-400 text-sm">
        <div className="mb-2">💡 유용한 팁</div>
        <p className="text-xs leading-relaxed">
          AI가 현지 문화와 숨겨진 명소까지<br />
          고려하여 최적의 가이드를 생성합니다.
        </p>
      </div>
    </div>
  );
} 