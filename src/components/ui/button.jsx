import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-slate-900 text-white shadow hover:bg-slate-800 active:scale-[0.98]",
    destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98]",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98]",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-slate-900 underline-offset-4 hover:underline",
    primary: "bg-red-600 text-white shadow hover:bg-red-700 active:scale-[0.98]",
  },
  size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8 text-base",
    icon: "h-9 w-9",
  },
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", type = "button", disabled, children, ...props }, ref) => {
    const variantClass = buttonVariants.variant[variant] || buttonVariants.variant.default;
    const sizeClass = buttonVariants.size[size] || buttonVariants.size.default;

    return (
      <button
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantClass,
          sizeClass,
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

