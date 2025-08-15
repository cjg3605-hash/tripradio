// src/components/optimization/ImagePreloader.tsx
'use client';

import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

const ImagePreloader = ({ images, priority = false }: ImagePreloaderProps) => {
  useEffect(() => {
    if (!priority) {
      // Non-priority images: preload after initial page load
      const timer = setTimeout(() => {
        images.forEach((src) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        });
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Priority images: preload immediately
      images.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
      
      // Return empty cleanup function for priority case
      return () => {};
    }
  }, [images, priority]);

  return null;
};

export default ImagePreloader;