'use client';

import React from 'react';

interface GuideTitleProps {
  locationName: string;
  variant?: 'live' | 'main';
}

export function GuideTitle({ locationName, variant = 'main' }: GuideTitleProps) {
  return (
    <div className="relative h-14 sm:h-16 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold tracking-tight">{locationName}</h1>
      </div>
    </div>
  );
}