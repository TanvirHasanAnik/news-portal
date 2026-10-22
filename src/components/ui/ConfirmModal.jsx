"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

/**
 * Reusable clean confirmation prompt (Yes / No).
 * Only displays the question, Yes / No buttons, and a close button.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmText = "হ্যাঁ",
  cancelText = "না",
  confirmVariant = "default",
  isLoading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="বন্ধ করুন"
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Question Message */}
        <p className="text-sm font-semibold text-slate-800 pr-6 pt-1 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons: Yes / No */}
        <div className="flex justify-end items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs h-8.5 px-3.5 text-slate-600 border-slate-200 cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs h-8.5 px-4 cursor-pointer"
          >
            {isLoading ? "প্রক্রিয়াধীন..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

