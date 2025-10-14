'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface ChapterInfo {
  chapterIndex: number;
  title: string;
  description: string;
  segmentCount: number;
  estimatedDuration: number; // 초 단위
  contentFocus: string[];
}

interface ChapterListProps {
  chapters: ChapterInfo[];
  currentChapterIndex?: number;
  onChapterSelect?: (chapterIndex: number) => void;
  className?: string;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapterIndex = 0,
  onChapterSelect,
  className = ''
}) => {

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          챕터 목록
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          총 {chapters.length}개 챕터
        </span>
      </div>
      
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div
            key={chapter.chapterIndex}
            onClick={() => onChapterSelect?.(chapter.chapterIndex)}
            className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              currentChapterIndex === chapter.chapterIndex
                ? 'bg-black dark:bg-purple-600 text-white border-black dark:border-purple-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-medium ${
                currentChapterIndex === chapter.chapterIndex
                  ? 'text-white'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {/* 🎯 챕터 제목을 그대로 표시 (중복 제거 없이) */}
                {chapter.title}
              </span>
              
              {currentChapterIndex === chapter.chapterIndex && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {chapters.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">아직 챕터가 생성되지 않았습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ChapterList;