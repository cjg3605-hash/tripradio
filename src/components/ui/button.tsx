import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'secondary' | 'ghost' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = 'default', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3',
      lg: 'h-10 px-6',
      icon: 'w-9 h-9'
    };

    const variantClasses = {
      default: `bg-gray-900 text-white border border-gray-800
                hover:bg-gray-800 active:bg-gray-700
                dark:bg-dark-interactive dark:text-dark-text-primary 
                dark:border-dark-border-2 dark:hover:bg-dark-interactive-hover 
                dark:active:bg-dark-interactive-active
                shadow-sm hover:shadow-md dark:shadow-dark-sm dark:hover:shadow-dark-md`,
      secondary: `bg-gray-100 text-gray-900 border border-gray-200
                  hover:bg-gray-200 active:bg-gray-300
                  dark:bg-dark-surface-3 dark:text-dark-text-primary 
                  dark:border-dark-border-2 dark:hover:bg-dark-surface-4
                  dark:active:bg-dark-surface-5`,
      ghost: `bg-transparent text-gray-700 border border-transparent
              hover:bg-gray-50 active:bg-gray-100
              dark:text-dark-text-primary dark:hover:bg-dark-surface-3
              dark:active:bg-dark-surface-4`,
      outline: `bg-transparent text-gray-700 border border-gray-300
                hover:bg-gray-50 active:bg-gray-100
                dark:text-dark-text-primary dark:border-dark-border-2
                dark:hover:bg-dark-surface-3 dark:active:bg-dark-surface-4`
    };
    
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-medium text-sm rounded-lg',
          'transition-all duration-200',
          'disabled:pointer-events-none disabled:opacity-50',
          'focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-dark-border-3',
          'focus-visible:ring-offset-2 focus-visible:outline-none',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        ref={ref}
        type={props.type || 'button'}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };