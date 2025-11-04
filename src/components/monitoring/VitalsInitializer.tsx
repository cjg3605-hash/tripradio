/**
 * Web Vitals Initializer Component
 *
 * Client-side component that initializes Web Vitals tracking
 * when the component mounts on the browser
 */

'use client';

import { useEffect } from 'react';
import { initializeVitalsTracking } from '@/lib/monitoring/vitals-client';

export function VitalsInitializer() {
  useEffect(() => {
    // Initialize Web Vitals tracking on client
    initializeVitalsTracking();
  }, []);

  // This component doesn't render anything
  return null;
}
