"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  asChild?: boolean;
};

const variants = {
  primary:
    "border-transparent bg-brand text-white shadow-soft hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-brand/30",
  secondary:
    "border-gray-300 bg-white text-gray-900 hover:border-brand hover:text-brand active:bg-blue-50 focus-visible:ring-brand/20",
  ghost:
    "border-transparent bg-transparent text-gray-700 hover:bg-white/80 hover:text-gray-950 active:bg-gray-100 focus-visible:ring-gray-200",
};

export function Button({ className, variant = "primary", asChild, children, ...props }: ButtonProps) {
  const classes = clsx(
    "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: clsx((children.props as { className?: string }).className, classes),
    } as { className: string });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
