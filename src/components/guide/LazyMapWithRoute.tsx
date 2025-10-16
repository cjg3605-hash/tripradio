// Dynamic import wrapper for MapWithRoute - Performance optimized
import dynamic from 'next/dynamic';

// Lazy load MapWithRoute for better initial bundle size
const MapWithRoute = dynamic(() => import('./MapWithRoute'), {
  ssr: false, // Map components don't need SSR
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
        <span>지도 로딩중...</span>
      </div>
    </div>
  )
});

export default MapWithRoute;