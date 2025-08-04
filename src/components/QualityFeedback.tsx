"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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
        alert(t('feedback.submitSuccess') || '🎉 소중한 피드백 감사합니다! 더 나은 가이드로 발전시키겠습니다.');
      }
    } catch (error) {
      console.error('피드백 제출 실패:', error);
      alert(t('feedback.submitFailed') || '피드백 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = {
    1: t('feedback.ratings.1') || '매우 불만족',
    2: t('feedback.ratings.2') || '불만족', 
    3: t('feedback.ratings.3') || '보통',
    4: t('feedback.ratings.4') || '만족',
    5: t('feedback.ratings.5') || '매우 만족'
  };

  const improvementOptions: string[] = [
    (t('feedback.improvements.moreHistoricalFacts') as string) || '더 구체적인 역사적 사실 필요',
    (t('feedback.improvements.moreStories') as string) || '재미있는 스토리 부족',
    (t('feedback.improvements.explainTerms') as string) || '전문 용어 설명 필요',
    (t('feedback.improvements.culturalBackground') as string) || '문화적 배경 설명 부족', 
    (t('feedback.improvements.personalInterests') as string) || '개인적 관심사 반영 부족',
    (t('feedback.improvements.practicalInfo') as string) || '실용적 정보 부족',
    (t('feedback.improvements.tooLong') as string) || '내용이 너무 길어서 지루함',
    (t('feedback.improvements.tooShort') as string) || '내용이 너무 짧아서 아쉬움'
  ];

  if (!showFeedback) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowFeedback(true)}
          type="button"
          aria-label={(t('feedback.openButtonAria') as string) || "가이드 품질 평가 상자 열기"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span aria-hidden="true">⭐</span> {(t('feedback.rateGuide') as string) || '가이드 평가하기'}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 
              id="feedback-title"
              className="text-2xl font-bold text-gray-800"
            >
              <span aria-hidden="true">🎯</span> {(t('feedback.modalTitle') as string) || `"${locationName}" 가이드 평가`}
            </h2>
            <button
              onClick={() => setShowFeedback(false)}
              type="button"
              aria-label={(t('feedback.closeButtonAria') as string) || "평가 상자 닫기"}
              className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* 상세 평가 항목 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">📊 {(t('feedback.detailedEvaluation') as string) || '상세 평가 (96% 만족도 목표)'}</h3>
              
              {/* 사실 정확성 */}
              <fieldset className="border rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-600 mb-2">
                  <span aria-hidden="true">🔍</span> {(t('feedback.categories.accuracy') as string) || '사실 정확성 (역사, 수치, 인명 등)'}
                </legend>
                <div className="flex gap-2" role="radiogroup" aria-labelledby="accuracy-label">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('accuracy', rating)}
                      type="button"
                      role="radio"
                      aria-checked={feedback.accuracy === rating}
                      aria-label={`${(t('feedback.categories.accuracy') as string) || '사실 정확성'} ${rating}${(t('feedback.points') as string) || '점'}`}
                      className={`px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                        feedback.accuracy >= rating
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span aria-hidden="true">⭐</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1" aria-live="polite">
                  {ratingLabels[feedback.accuracy as keyof typeof ratingLabels]}
                </p>
              </fieldset>

              {/* 전문성 */}
              <fieldset className="border rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-600 mb-2">
                  <span aria-hidden="true">🎓</span> {(t('feedback.categories.expertise') as string) || '전문성 깊이 (전문가 수준의 설명)'}
                </legend>
                <div className="flex gap-2" role="radiogroup">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('expertise', rating)}
                      type="button"
                      role="radio"
                      aria-checked={feedback.expertise === rating}
                      aria-label={`${(t('feedback.categories.expertise') as string) || '전문성'} ${rating}${(t('feedback.points') as string) || '점'}`}
                      className={`px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        feedback.expertise >= rating
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span aria-hidden="true">⭐</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1" aria-live="polite">
                  {ratingLabels[feedback.expertise as keyof typeof ratingLabels]}
                </p>
              </fieldset>

              {/* 스토리텔링 */}
              <fieldset className="border rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-600 mb-2">
                  <span aria-hidden="true">📖</span> {(t('feedback.categories.storytelling') as string) || '스토리텔링 (흥미롭고 몰입감 있는 설명)'}
                </legend>
                <div className="flex gap-2" role="radiogroup">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('storytelling', rating)}
                      type="button"
                      role="radio"
                      aria-checked={feedback.storytelling === rating}
                      aria-label={`${(t('feedback.categories.storytelling') as string) || '스토리텔링'} ${rating}${(t('feedback.points') as string) || '점'}`}
                      className={`px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        feedback.storytelling >= rating
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span aria-hidden="true">⭐</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1" aria-live="polite">
                  {ratingLabels[feedback.storytelling as keyof typeof ratingLabels]}
                </p>
              </fieldset>

              {/* 문화적 존중 */}
              <fieldset className="border rounded-lg p-4">
                <legend className="text-sm font-medium text-gray-600 mb-2">
                  <span aria-hidden="true">🙏</span> {(t('feedback.categories.culturalRespect') as string) || '문화적 존중 (현지 문화에 대한 적절한 표현)'}
                </legend>
                <div className="flex gap-2" role="radiogroup">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('cultural_respect', rating)}
                      type="button"
                      role="radio"
                      aria-checked={feedback.cultural_respect === rating}
                      aria-label={`${(t('feedback.categories.culturalRespect') as string) || '문화적 존중'} ${rating}${(t('feedback.points') as string) || '점'}`}
                      className={`px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        feedback.cultural_respect >= rating
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span aria-hidden="true">⭐</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1" aria-live="polite">
                  {ratingLabels[feedback.cultural_respect as keyof typeof ratingLabels]}
                </p>
              </fieldset>

              {/* 전체 만족도 */}
              <fieldset className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <legend className="text-sm font-medium text-red-700 mb-2">
                  <span aria-hidden="true">🎯</span> {(t('feedback.categories.overallSatisfaction') as string) || '전체 만족도 (종합적 평가)'}
                </legend>
                <div className="flex gap-2" role="radiogroup">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange('overall_satisfaction', rating)}
                      type="button"
                      role="radio"
                      aria-checked={feedback.overall_satisfaction === rating}
                      aria-label={`${(t('feedback.categories.overallSatisfaction') as string) || '전체 만족도'} ${rating}${(t('feedback.points') as string) || '점'}`}
                      className={`px-4 py-3 rounded-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        feedback.overall_satisfaction >= rating
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span aria-hidden="true">⭐</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-red-600 mt-1 font-medium" aria-live="polite">
                  {ratingLabels[feedback.overall_satisfaction as keyof typeof ratingLabels]}
                </p>
              </fieldset>
            </div>

            {/* 개선 제안 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">🔧 {(t('feedback.improvementNeeded') as string) || '개선이 필요한 부분'}</h3>
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
              <label 
                htmlFor="comments-textarea"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                <span aria-hidden="true">💬</span> {(t('feedback.additionalComments') as string) || '추가 의견이나 제안사항'}
              </label>
              <textarea
                id="comments-textarea"
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                placeholder={(t('feedback.commentsPlaceholder') as string) || '더 좋은 가이드를 위한 의견을 자유롭게 작성해주세요...'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                rows={3}
                aria-describedby="comments-help"
              />
              <div id="comments-help" className="sr-only">
                {(t('feedback.commentsHelp') as string) || '가이드 개선을 위한 자유로운 의견을 작성해주세요'}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowFeedback(false)}
                type="button"
                aria-label={(t('feedback.cancelButtonAria') as string) || '평가 취소하기'}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {(t('feedback.cancelButton') as string) || '취소'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                type="submit"
                aria-label={isSubmitting ? ((t('feedback.submittingAria') as string) || '피드백 제출 중') : ((t('feedback.submitButtonAria') as string) || '피드백 제출하기')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? ((t('feedback.submitting') as string) || '제출 중...') : (<><span aria-hidden="true">🎯</span> {(t('feedback.submitButton') as string) || '피드백 제출하기'}</>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityFeedback;