import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base md:text-sm",
        "bg-white dark:bg-dark-surface-2",
        "border-gray-300 dark:border-dark-border-2",
        "text-gray-900 dark:text-dark-text-primary",
        "placeholder:text-gray-500 dark:placeholder:text-dark-text-secondary",
        "transition-all duration-200 outline-none",
        "focus-visible:border-gray-500 dark:focus-visible:border-dark-border-3",
        "focus-visible:ring-2 focus-visible:ring-gray-500/20 dark:focus-visible:ring-dark-border-3/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "disabled:bg-gray-50 dark:disabled:bg-dark-surface-1",
        "selection:bg-gray-500 selection:text-white dark:selection:bg-dark-text-primary dark:selection:text-dark-surface-1",
        // File input styles
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent", 
        "file:text-sm file:font-medium file:text-gray-700 dark:file:text-dark-text-primary",
        // Error states
        "aria-invalid:border-red-500 dark:aria-invalid:border-red-400",
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-400/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };