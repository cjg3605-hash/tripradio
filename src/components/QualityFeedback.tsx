"use client";

import React, { useState } from 'react';

interface QualityFeedbackProps {
  guideId: string;
  locationName: string;
  onFeedbackSubmit: (feedback: QualityFeedback) => void;
}

interface QualityFeedback {
  accuracy: number;        // 1-5점
  expertise: number;       // 1-5점  
  storytelling: number;    // 1-5점
  cultural_respect: number; // 1-5점
  overall_satisfaction: number; // 1-5점
  comments: string;
  improvement_suggestions: string[];
}

const QualityFeedback: React.FC<QualityFeedbackProps> = ({
  guideId,
  locationName, 
  onFeedbackSubmit
}) => {
  const [feedback, setFeedback] = useState<QualityFeedback>({
    accuracy: 5,
    expertise: 5,
    storytelling: 5,
    cultural_respect: 5,
    overall_satisfaction: 5,
    comments: '',
    improvement_suggestions: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleRatingChange = (category: keyof QualityFeedback, value: number) => {
    if (typeof feedback[category] === 'number') {
      setFeedback(prev => ({
        ...prev,
        [category]: value
      }));
    }
  };

  const handleSuggestionToggle = (suggestion: string) => {
    setFeedback(prev => ({
      ...prev,
      improvement_suggestions: prev.improvement_suggestions.includes(suggestion)
        ? prev.improvement_suggestions.filter(s => s !== suggestion)
        : [...prev.improvement_suggestions, suggestion]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // 서버에 피드백 전송
      const response = await fetch('/api/quality-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId,
          locationName,
          feedback,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        onFeedbackSubmit(feedback);
        setShowFeedback(false);
        
        // 성공 알림
        alert('🎉 소중한 피드백 감사합니다! 더 나은 가이드로 발전시키겠습니다.');
      }
    } catch (error) {
      console.error('피드백 제출 실패:', error);
      alert('피드백 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = {
    1: '매우 불만족',
    2: '불만족', 
    3: '보통',
    4: '만족',
    5: '매우 만족'
  };

  const improvementOptions = [
    '더 구체적인 역사적 사실 필요',
    '재미있는 스토리 부족',
    '전문 용어 설명 필요',
    '문화적 배경 설명 부족', 
    '개인적 관심사 반영 부족',
    '실용적 정보 부족',
    '내용이 너무 길어서 지루함',
    '내용이 너무 짧아서 아쉬움'
  ];

  if (!showFeedback) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowFeedback(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          ⭐ 가이드 평가하기
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              🎯 "{locationName}" 가이드 평가
            </h2>
            <button
              onClick={() => setShowFeedback(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* 상세 평가 항목 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">📊 상세 평가 (96% 만족도 목표)</h3>
              
              {/* 사실 정확성 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  🔍 사실 정확성 (역사, 수치, 인명 등)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('accuracy', rating)}
                      className={`px-3 py-2 rounded transition-colors ${
                        feedback.accuracy >= rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {ratingLabels[feedback.accuracy as keyof typeof ratingLabels]}
                </p>
              </div>

              {/* 전문성 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  🎓 전문성 깊이 (전문가 수준의 설명)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('expertise', rating)}
                      className={`px-3 py-2 rounded transition-colors ${
                        feedback.expertise >= rating
                          ? 'bg-blue-400 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {ratingLabels[feedback.expertise as keyof typeof ratingLabels]}
                </p>
              </div>

              {/* 스토리텔링 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  📖 스토리텔링 (흥미롭고 몰입감 있는 설명)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('storytelling', rating)}
                      className={`px-3 py-2 rounded transition-colors ${
                        feedback.storytelling >= rating
                          ? 'bg-green-400 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {ratingLabels[feedback.storytelling as keyof typeof ratingLabels]}
                </p>
              </div>

              {/* 문화적 존중 */}
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  🙏 문화적 존중 (현지 문화에 대한 적절한 표현)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('cultural_respect', rating)}
                      className={`px-3 py-2 rounded transition-colors ${
                        feedback.cultural_respect >= rating
                          ? 'bg-purple-400 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {ratingLabels[feedback.cultural_respect as keyof typeof ratingLabels]}
                </p>
              </div>

              {/* 전체 만족도 */}
              <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <label className="block text-sm font-medium text-red-700 mb-2">
                  🎯 전체 만족도 (종합적 평가)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('overall_satisfaction', rating)}
                      className={`px-4 py-3 rounded-lg transition-colors text-lg ${
                        feedback.overall_satisfaction >= rating
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-sm text-red-600 mt-1 font-medium">
                  {ratingLabels[feedback.overall_satisfaction as keyof typeof ratingLabels]}
                </p>
              </div>
            </div>

            {/* 개선 제안 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">🔧 개선이 필요한 부분</h3>
              <div className="grid grid-cols-2 gap-2">
                {improvementOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => handleSuggestionToggle(option)}
                    className={`p-3 text-left rounded border transition-colors ${
                      feedback.improvement_suggestions.includes(option)
                        ? 'bg-orange-100 border-orange-300 text-orange-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {feedback.improvement_suggestions.includes(option) ? '✓' : '○'} {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 추가 의견 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                💬 추가 의견이나 제안사항
              </label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="더 좋은 가이드를 위한 의견을 자유롭게 작성해주세요..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? '제출 중...' : '🎯 피드백 제출하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityFeedback;