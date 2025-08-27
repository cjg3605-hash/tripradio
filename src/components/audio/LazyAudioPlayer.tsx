// Dynamic import wrapper for Audio Players - Performance optimized
import dynamic from 'next/dynamic';

// Lazy load AdvancedAudioPlayer for better initial bundle size
const AdvancedAudioPlayer = dynamic(() => import('./AdvancedAudioPlayer'), {
  ssr: false, // Audio players don't need SSR
  loading: () => (
    <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center">
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="animate-pulse rounded-full h-8 w-8 bg-gray-300"></div>
        <span>오디오 플레이어 로딩중...</span>
      </div>
    </div>
  )
});

// Lazy load NotebookLM Podcast Player
const NotebookLMPodcastPlayer = dynamic(() => import('./NotebookLMPodcastPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center">
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="animate-pulse rounded-full h-8 w-8 bg-gray-300"></div>
        <span>팟캐스트 플레이어 로딩중...</span>
      </div>
    </div>
  )
});

export { AdvancedAudioPlayer, NotebookLMPodcastPlayer };
export default AdvancedAudioPlayer;