import { MapPin } from "lucide-react";
import { Button } from "./ui/button";

interface Attraction {
  name: string;
}

interface DestinationCardProps {
  name: string;
  description: string;
  isPopular?: boolean;
  attractions: Attraction[];
}

export function DestinationCard({ 
  name, 
  description, 
  isPopular = false, 
  attractions 
}: DestinationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="relative h-24 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
        {isPopular && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-medium rounded-full border border-white/30">
              POPULAR
            </span>
          </div>
        )}
        <h3 className="text-white text-xl font-bold">{name}</h3>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-6">{description}</p>

        {/* Attractions */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-black uppercase tracking-wide">
            Top Attractions
          </h4>
          <div className="space-y-2">
            {attractions.map((attraction, index) => (
              <div key={index} className="flex items-center space-x-3 group/item">
                <div className="w-1.5 h-1.5 bg-black rounded-full group-hover/item:scale-125 transition-transform" />
                <span className="text-sm text-gray-700 group-hover/item:text-black transition-colors">
                  {attraction.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">명소를 클릭하세요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}