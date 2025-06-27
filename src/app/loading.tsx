export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6">
          {/* 여기에 나비 가이드 로고를 넣으세요 */}
          <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">🦋</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">나비 가이드</h1>
        <p className="text-gray-500">여행 가이드를 준비 중입니다...</p>
      </div>
    </div>
  );
}
