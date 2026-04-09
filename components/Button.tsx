"use client";

import React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  asChild?: boolean;
};

const variants = {
  primary: "border-brand bg-brand text-white hover:bg-blue-700 focus:ring-brand",
  secondary: "border-gray-300 bg-white text-gray-900 hover:border-brand hover:text-brand focus:ring-brand",
  ghost: "border-transparent bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
};

export function Button({ className, variant = "primary", asChild, children, ...props }: ButtonProps) {
  const classes = clsx(
    "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
