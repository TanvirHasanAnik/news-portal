"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
});

function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [selected, setSelected] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  const handleSelect = (val) => {
    if (value === undefined) {
      setSelected(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: selected, onValueChange: handleSelect }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-start rounded-lg bg-slate-100 p-1 text-slate-500 overflow-x-auto max-w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children, disabled, ...props }) {
  const context = React.useContext(TabsContext);
  const isSelected = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        isSelected
          ? "bg-white text-slate-950 shadow-sm font-semibold"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }) {
  const context = React.useContext(TabsContext);
  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 animate-slide-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

