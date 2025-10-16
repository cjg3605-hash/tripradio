'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'fullwidth' | 'centered' | 'narrow';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * 통일된 반응형 컨테이너 컴포넌트
 * 모든 페이지에서 일관된 레이아웃과 반응형 동작 제공
 */
export function ResponsiveContainer({
  children,
  variant = 'default',
  padding = 'md',
  className
}: ResponsiveContainerProps) {
  const baseClasses = 'w-full mx-auto transition-all duration-300 ease-out';
  
  const variantClasses = {
    default: 'max-w-7xl', // 1280px
    fullwidth: 'max-w-full',
    centered: 'max-w-4xl', // 896px
    narrow: 'max-w-2xl' // 672px
  };
  
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4 sm:px-6',
    md: 'px-4 py-6 sm:px-6 lg:px-8',
    lg: 'px-6 py-8 sm:px-8 lg:px-12',
    xl: 'px-8 py-12 sm:px-12 lg:px-16'
  };

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * 통일된 페이지 헤더 컴포넌트
 */
export function PageHeader({
  title,
  subtitle,
  backButton = false,
  onBack,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('border-b border-gray-200 bg-white/80 backdrop-blur-sm', className)}>
      <ResponsiveContainer>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {backButton && (
              <button
                onClick={onBack}
                className="btn-base p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                aria-label="뒤로 가기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-fluid-2xl font-bold text-black tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-fluid-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  hover?: boolean;
}

/**
 * 통일된 카드 컴포넌트
 */
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  hover = false
}: CardProps) {
  const baseClasses = 'card-base bg-white transition-all duration-300 ease-out';
  
  const variantClasses = {
    default: 'shadow-card border border-gray-200',
    elevated: 'shadow-premium',
    bordered: 'border-2 border-gray-300',
    glass: 'glass border border-white/20'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : '';

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      hoverClasses,
      className
    )}>
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 반응형 그리드 컴포넌트
 */
export function Grid({
  children,
  cols = 1,
  gap = 'md',
  className
}: GridProps) {
  const baseClasses = 'grid';
  
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={cn(
      baseClasses,
      colsClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 반응형 Flex 컴포넌트
 */
export function Flex({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className
}: FlexProps) {
  const baseClasses = 'flex';
  
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };
  
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn(
      baseClasses,
      directionClasses[direction],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'feature' | 'hero';
  className?: string;
}

/**
 * 섹션 컴포넌트
 */
export function Section({
  children,
  title,
  subtitle,
  variant = 'default',
  className
}: SectionProps) {
  const baseClasses = 'space-section';
  
  const variantClasses = {
    default: 'py-12',
    feature: 'py-16 md:py-20',
    hero: 'py-20 md:py-24 lg:py-32'
  };

  return (
    <section className={cn(baseClasses, variantClasses[variant], className)}>
      <ResponsiveContainer>
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-fluid-3xl font-bold text-black mb-4 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-fluid-lg text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </ResponsiveContainer>
    </section>
  );
}

interface StackProps {
  children: React.ReactNode;
  space?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * 수직 스택 컴포넌트
 */
export function Stack({
  children,
  space = 'md',
  className
}: StackProps) {
  const spaceClasses = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
    xl: 'space-y-12'
  };

  return (
    <div className={cn(spaceClasses[space], className)}>
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 빈 상태 컴포넌트
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-fluid-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}

// 반응형 유틸리티 훅
export function useResponsive() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet, isDesktop };
}