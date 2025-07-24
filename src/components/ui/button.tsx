import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary'
    };
    
    const sizeClasses = {
      default: 'h-10 py-2 px-4',
      xs: 'h-6 px-2 text-xs',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10'
    };

    // Tailwind 기본 색상 클래스들 (WCAG AA 색상 대비 개선)
    const tailwindVariantClasses = {
      default: 'bg-indigo-700 text-white hover:bg-indigo-800 focus:ring-indigo-600 active:bg-indigo-900',
      outline: 'border border-gray-400 bg-white text-gray-800 hover:bg-gray-100 focus:ring-indigo-600 active:bg-gray-200',
      ghost: 'text-gray-800 hover:bg-gray-200 focus:ring-gray-600 active:bg-gray-300',
      destructive: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-600 active:bg-red-900',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-600 active:bg-gray-400',
      link: 'text-indigo-700 hover:text-indigo-800 underline-offset-4 hover:underline focus:ring-indigo-600 active:text-indigo-900'
    };

    const tailwindSizeClasses = {
      default: 'px-4 py-2 text-sm',
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2'
    };
    
    // 접근성 개선된 버튼 클래스 조합
    const classes = cn(
      baseClasses,
      tailwindVariantClasses[variant],
      tailwindSizeClasses[size],
      // 모든 변형에 접근성 포커스 스타일 적용
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      // 비활성화 상태 접근성 개선
      'disabled:cursor-not-allowed disabled:opacity-60',
      // 키보드 활성화 표시 강화
      'focus-visible:ring-2 focus-visible:ring-offset-2',
      className
    );

    if (asChild) {
      // asChild prop이 true인 경우, 자식 요소에 클래스를 적용
      return React.cloneElement(
        React.Children.only(props.children as React.ReactElement),
        { className: classes, ref }
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