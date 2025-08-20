import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3',
      lg: 'h-10 px-6',
      icon: 'w-9 h-9'
    };
    
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-medium text-sm',
          'bg-black text-white',
          'hover:bg-black/90',
          'transition-all duration-200',
          'disabled:pointer-events-none',
          sizeClasses[size],
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