import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 outline-none focus:outline-none focus:border-slate-800 focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

