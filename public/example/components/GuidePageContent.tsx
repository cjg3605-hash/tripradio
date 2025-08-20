import { GuideHeader } from "./GuideHeader";
import { GuideMobilePlayer } from "./GuideMobilePlayer";
import { GuideContent } from "./GuideContent";

interface GuidePageContentProps {
  onBackToHome: () => void;
  destination: string;
}

export function GuidePageContent({ onBackToHome, destination }: GuidePageContentProps) {
  return (
    <div className="min-h-screen bg-white">
      <GuideHeader onBackToHome={onBackToHome} />
      
      {/* Mobile-First Layout */}
      <main className="relative">
        {/* Sticky Mobile Player */}
        <GuideMobilePlayer destination={destination} />
        
        {/* Scrollable Content */}
        <GuideContent destination={destination} />
      </main>
    </div>
  );
}