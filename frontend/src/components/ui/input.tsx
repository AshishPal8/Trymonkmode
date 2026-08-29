"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type,
      leftIcon,
      rightIcon,
      onClear,
      value,
      ...props
    },
    ref
  ) => {
    const hasClearButton = Boolean(onClear && value);

    const inputElement = (
      <input
        ref={ref}
        type={type}
        value={value}
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-xl border border-border bg-muted/50 dark:bg-muted/30 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 transition-all outline-none shadow-2xs hover:border-border/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
          leftIcon && "pl-8.5",
          (rightIcon || hasClearButton) && "pr-8.5",
          className
        )}
        {...props}
      />
    );

    if (!leftIcon && !rightIcon && !hasClearButton && !containerClassName) {
      return inputElement;
    }

    return (
      <div className={cn("relative flex items-center w-full", containerClassName)}>
        {leftIcon && (
          <div className="absolute left-2.5 text-muted-foreground pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        {inputElement}
        {hasClearButton ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            title="Clear text"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          rightIcon && (
            <div className="absolute right-2.5 flex items-center justify-center pointer-events-none">
              {rightIcon}
            </div>
          )
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
