import { GuideInfoCards } from "./GuideInfoCards";
import { GuideTrackList } from "./GuideTrackList";
import { GuideBottomActions } from "./GuideBottomActions";

interface GuideContentProps {
  destination: string;
}

export function GuideContent({ destination }: GuideContentProps) {
  return (
    <div className="px-4 pb-24 pt-6 space-y-6 max-w-4xl mx-auto">
      {/* Key Information Cards */}
      <GuideInfoCards destination={destination} />
      
      {/* Track List */}
      <GuideTrackList destination={destination} />
      
      {/* Bottom Actions */}
      <GuideBottomActions />
    </div>
  );
}