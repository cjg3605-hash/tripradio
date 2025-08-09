import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    // 통합 디자인 시스템 기반 버튼 클래스
    const baseClasses = [
      'btn-base',
      'font-sans font-medium',
      'border-0 outline-none',
      'transition-all duration-300 ease-out',
      'touch-target',
      'gpu-layer',
      'select-none'
    ].join(' ');
    
    // 디자인 시스템 변형 클래스
    const variantClasses = {
      default: [
        'bg-black text-white',
        'hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5',
        'active:bg-gray-900 active:translate-y-0',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      ].join(' '),
      
      outline: [
        'bg-white text-black border-2 border-gray-300',
        'hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm hover:-translate-y-0.5',
        'active:bg-gray-100 active:border-gray-500 active:translate-y-0',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      ].join(' '),
      
      ghost: [
        'bg-transparent text-gray-800',
        'hover:bg-gray-100 hover:text-black hover:-translate-y-0.5',
        'active:bg-gray-200 active:translate-y-0',
        'focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
      ].join(' '),
      
      destructive: [
        'bg-red-500 text-white',
        'hover:bg-red-600 hover:shadow-md hover:-translate-y-0.5',
        'active:bg-red-700 active:translate-y-0',
        'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
      ].join(' '),
      
      secondary: [
        'bg-gray-200 text-gray-900',
        'hover:bg-gray-300 hover:text-black hover:shadow-sm hover:-translate-y-0.5',
        'active:bg-gray-400 active:translate-y-0',
        'focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
      ].join(' '),
      
      link: [
        'bg-transparent text-blue-600 underline-offset-4',
        'hover:text-blue-700 hover:underline',
        'active:text-blue-800',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      ].join(' ')
    };
    
    // 디자인 시스템 크기 클래스
    const sizeClasses = {
      xs: 'px-3 py-1.5 text-xs min-h-8',
      sm: 'px-4 py-2 text-sm min-h-10',
      default: 'px-6 py-3 text-base min-h-11',
      lg: 'px-8 py-4 text-lg min-h-12',
      icon: 'p-2.5 min-w-11 min-h-11'
    };
    
    // 통합 클래스 조합
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      // 비활성화 상태 스타일링
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
      className
    );

    if (asChild) {
      // asChild prop이 true인 경우, 자식 요소에 클래스를 적용
      return React.cloneElement(
        React.Children.only(props.children as React.ReactElement),
        { className: classes, ref } as any
      );
    }
    
    return (
      <button
        className={classes}
        ref={ref}
        // 접근성 속성 기본값 설정
        type={props.type || 'button'}
        role={props.role || 'button'}
        aria-disabled={props.disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };