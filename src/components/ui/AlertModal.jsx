"use client";

import React, { useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "./button";



export function AlertModal({
  isOpen,
  onClose,
  message,
  buttonText = "ঠিক আছে",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150 relative"
        role="alertdialog"
        aria-modal="true"
      >

        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>


        <div className="flex items-start gap-3 pr-6 pt-1">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>


        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8.5 px-4 cursor-pointer"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}

