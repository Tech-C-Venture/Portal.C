"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", disabled, ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-primary text-white shadow-[0_10px_24px_rgba(42,97,179,0.18)] hover:brightness-[0.98] active:brightness-[0.95]",
    outline:
      "border border-border bg-white text-foreground hover:bg-accent1",
    ghost: "bg-transparent text-foreground hover:bg-accent1",
  };

  return (
    <button
      ref={ref}
      className={clsx(base, sizes[size], variants[variant], className)}
      disabled={disabled}
      {...props}
    />
  );
});
