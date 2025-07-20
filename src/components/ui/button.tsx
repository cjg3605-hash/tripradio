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

    // Tailwind 기본 색상 클래스들
    const tailwindVariantClasses = {
      default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      link: 'text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline focus:ring-indigo-500'
    };

    const tailwindSizeClasses = {
      default: 'px-4 py-2 text-sm',
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2'
    };
    
    // 일반적인 버튼 클래스 조합
    const classes = cn(
      baseClasses,
      tailwindVariantClasses[variant],
      tailwindSizeClasses[size],
      variant === 'link' ? '' : 'focus:outline-none focus:ring-2 focus:ring-offset-2',
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
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };