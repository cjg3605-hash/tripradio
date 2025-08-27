// Test page to isolate MultiLangGuideClient issues
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Test if the TourContent dynamic import is the problem
const TourContentTest = dynamic(() => import('../guide/[language]/[location]/tour/components/TourContent'), {
  loading: () => <div>Loading TourContent...</div>,
  ssr: false
});

// Simple test data similar to what MultiLangGuideClient receives
const testGuideData = {
  content: {
    overview: {
      title: "경복궁",
      location: "서울 종로구",
      keyFeatures: "조선 법궁 건축",
      background: "조선 왕조의 정궁"
    },
    route: {
      steps: [
        { step: 1, title: "광화문", location: "광화문" },
        { step: 2, title: "근정전", location: "근정전" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "광화문 테스트",
          narrative: "테스트 내용입니다.",
          coordinates: { lat: 37.5758, lng: 126.9766 }
        }
      ]
    },
    metadata: {
      originalLocationName: "경복궁",
      generatedAt: new Date().toISOString(),
      version: "1.0",
      language: "ko"
    }
  }
};

export default function TestMultiLangPage() {
  const [testStep, setTestStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">MultiLang Component Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => setTestStep(1)}
          className={`mr-2 px-4 py-2 rounded ${testStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Step 1: Basic Render
        </button>
        <button 
          onClick={() => setTestStep(2)}
          className={`mr-2 px-4 py-2 rounded ${testStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Step 2: TourContent Dynamic Import
        </button>
      </div>

      {testStep === 1 && (
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Step 1: Basic Component Test</h2>
          <p>Testing if basic React components render without issues...</p>
          <div className="mt-2 p-2 bg-green-100 border border-green-400 rounded">
            <strong>✅ Basic React components working fine</strong>
          </div>
        </div>
      )}

      {testStep === 2 && (
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Step 2: TourContent Dynamic Import Test</h2>
          <p>Testing the dynamic import that&apos;s failing in MultiLangGuideClient...</p>
          <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded">
            <div className="text-sm text-gray-600 mb-2">Attempting TourContent dynamic import:</div>
            {error ? (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <strong>❌ Error occurred:</strong>
                <pre className="mt-2 text-xs overflow-auto">{error}</pre>
              </div>
            ) : (
              <TourContentTest 
                guide={testGuideData.content as any}
                language="ko"
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Test Data Structure:</h3>
        <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
          {JSON.stringify(testGuideData, null, 2)}
        </pre>
      </div>
    </div>
  );
}