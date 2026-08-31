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
          "w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground/60 transition-all outline-none focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent disabled:pointer-events-none disabled:opacity-50",
          leftIcon && "pl-9",
          (rightIcon || hasClearButton) && "pr-9",
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
