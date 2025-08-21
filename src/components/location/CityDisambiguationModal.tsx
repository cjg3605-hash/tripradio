'use client';

import React, { useEffect, useState } from 'react';
import { CityOption } from '@/lib/location/city-disambiguation';

interface CityDisambiguationModalProps {
  isOpen: boolean;
  query: string;
  options: CityOption[];
  onSelect: (cityId: string) => void;
  onCancel: () => void;
}

export default function CityDisambiguationModal({
  isOpen,
  query,
  options,
  onSelect,
  onCancel
}: CityDisambiguationModalProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  // 모달이 열릴 때 가장 인구가 많은 도시를 기본 선택
  useEffect(() => {
    if (isOpen && options.length > 0) {
      setSelectedCityId(options[0].id);
    }
  }, [isOpen, options]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedCityId) {
      onSelect(selectedCityId);
    }
  };

  const formatPopulation = (population?: number) => {
    if (!population) return '';
    return population.toLocaleString() + '명';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            여러 도시가 발견되었습니다
          </h2>
          <p className="text-gray-600">
            &ldquo;<span className="font-medium">{query}</span>&rdquo;와 일치하는 도시가 여러 개 있습니다.<br />
            원하시는 도시를 선택해주세요.
          </p>
        </div>

        {/* 도시 선택 옵션 */}
        <div className="p-6 space-y-3">
          {options.map((city) => (
            <label
              key={city.id}
              className={`block p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedCityId === city.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="city"
                value={city.id}
                checked={selectedCityId === city.id}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="sr-only"
              />
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    {city.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {city.country} • {city.region}
                    {city.population && (
                      <span className="ml-2">인구: {formatPopulation(city.population)}</span>
                    )}
                  </div>
                  {city.description && (
                    <div className="text-sm text-gray-500">
                      {city.description}
                    </div>
                  )}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 flex-shrink-0 ${
                  selectedCityId === city.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedCityId === city.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* 버튼 */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCityId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            선택
          </button>
        </div>
      </div>
    </div>
  );
}