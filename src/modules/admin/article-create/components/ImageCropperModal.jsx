"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TARGET_ASPECT = 16 / 9; // Strictly locked 16:9 ratio
const MASTER_OUTPUT_WIDTH = 1600;
const MASTER_OUTPUT_HEIGHT = Math.round(MASTER_OUTPUT_WIDTH / TARGET_ASPECT); // 900px

/**
 * ImageCropperModal
 *
 * Built-in 16:9 Upload Cropper for News Master Images.
 * Strictly locks the crop window to 16:9 so all uploaded assets start
 * clean and uniform before being stored in Cloudflare R2 as WebP.
 *
 * @param {Object} props
 * @param {File} props.file - Raw File object to crop
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Dismiss callback
 * @param {Function} props.onCropComplete - Callback receiving the cropped 16:9 WebP File
 * @param {number} [props.currentStep=1] - Multi-file queue progress indicator
 * @param {number} [props.totalSteps=1] - Total files in upload queue
 */
export default function ImageCropperModal({
  file,
  isOpen,
  onClose,
  onCropComplete,
  currentStep = 1,
  totalSteps = 1,
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageMeta, setImageMeta] = useState({ width: 0, height: 0, loaded: false });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Load selected file into object URL
  useEffect(() => {
    if (!file || !isOpen) {
      setImageSrc(null);
      setImageMeta({ width: 0, height: 0, loaded: false });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });

    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        loaded: true,
      });
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isOpen]);

  // Compute crop box viewport dimensions inside container
  const getViewportDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 640, height: 360 };
    const rect = containerRef.current.getBoundingClientRect();
    const maxWidth = Math.min(rect.width - 32, 640);
    const width = Math.max(280, maxWidth);
    const height = Math.round(width / TARGET_ASPECT);
    return { width, height };
  }, []);

  // Compute scale and bounds to guarantee 16:9 crop is always 100% covered (no black voids)
  const getCropMetrics = useCallback(() => {
    if (!imageMeta.loaded) return null;

    const { width: boxW, height: boxH } = getViewportDimensions();
    const isRotated90or270 = rotation % 180 !== 0;
    const naturalW = isRotated90or270 ? imageMeta.height : imageMeta.width;
    const naturalH = isRotated90or270 ? imageMeta.width : imageMeta.height;

    // Minimum scale required to fully cover 16:9 crop box at zoom = 1
    const baseScale = Math.max(boxW / naturalW, boxH / naturalH);
    const currentScale = baseScale * zoom;

    const displayedW = naturalW * currentScale;
    const displayedH = naturalH * currentScale;

    // Maximum pan margins in viewport pixels
    const maxPanX = Math.max(0, (displayedW - boxW) / 2);
    const maxPanY = Math.max(0, (displayedH - boxH) / 2);

    return {
      boxW,
      boxH,
      naturalW,
      naturalH,
      baseScale,
      currentScale,
      displayedW,
      displayedH,
      maxPanX,
      maxPanY,
      isRotated90or270,
    };
  }, [imageMeta, zoom, rotation, getViewportDimensions]);

  // Clamp pan when zoom or rotation changes
  useEffect(() => {
    const metrics = getCropMetrics();
    if (!metrics) return;
    setPan((prev) => ({
      x: Math.max(-metrics.maxPanX, Math.min(metrics.maxPanX, prev.x)),
      y: Math.max(-metrics.maxPanY, Math.min(metrics.maxPanY, prev.y)),
    }));
  }, [zoom, rotation, getCropMetrics]);

  // Pointer drag event handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const metrics = getCropMetrics();
    if (!metrics) return;

    const rawX = e.clientX - dragStart.x;
    const rawY = e.clientY - dragStart.y;

    setPan({
      x: Math.max(-metrics.maxPanX, Math.min(metrics.maxPanX, rawX)),
      y: Math.max(-metrics.maxPanY, Math.min(metrics.maxPanY, rawY)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(3, Math.max(1, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPan({ x: 0, y: 0 });
  };

  // Perform 16:9 crop and export as WebP
  const handleConfirmCrop = async () => {
    if (!imageMeta.loaded || !imageSrc) return;
    setIsProcessing(true);

    try {
      const metrics = getCropMetrics();
      if (!metrics) throw new Error("Crop metrics calculation failed.");

      const { boxW, boxH, displayedW, displayedH, isRotated90or270 } = metrics;

      // Create high-res master output canvas (1600x900)
      const outCanvas = document.createElement("canvas");
      outCanvas.width = MASTER_OUTPUT_WIDTH;
      outCanvas.height = MASTER_OUTPUT_HEIGHT;
      const ctx = outCanvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("Could not acquire canvas 2D context");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ratio from displayed viewport pixels to master output canvas
      const scaleToOutput = MASTER_OUTPUT_WIDTH / boxW;

      // Center of output canvas
      ctx.save();
      ctx.translate(MASTER_OUTPUT_WIDTH / 2, MASTER_OUTPUT_HEIGHT / 2);

      // Apply rotation if any
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      // Draw image shifted by pan offset (scaled to output canvas)
      const drawW = (isRotated90or270 ? displayedH : displayedW) * scaleToOutput;
      const drawH = (isRotated90or270 ? displayedW : displayedH) * scaleToOutput;
      const drawX = (pan.x * scaleToOutput) - (drawW / 2);
      const drawY = (pan.y * scaleToOutput) - (drawH / 2);

      const sourceImg = new Image();
      sourceImg.crossOrigin = "anonymous";
      await new Promise((res, rej) => {
        sourceImg.onload = res;
        sourceImg.onerror = rej;
        sourceImg.src = imageSrc;
      });

      ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Export canvas directly to WebP with 0.82 quality
      outCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }

          const originalName = file.name || "news_image";
          const baseName = originalName.replace(/\.[^/.]+$/, "");
          const webpName = `${baseName}_16x9.webp`;

          const webpFile = new File([blob], webpName, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          setIsProcessing(false);
          onCropComplete(webpFile);
        },
        "image/webp",
        0.82
      );
    } catch (err) {
      console.error("Crop export error:", err);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !file) return null;

  const metrics = getCropMetrics();
  const boxW = metrics?.boxW || 560;
  const boxH = metrics?.boxH || 315;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  ছবি ক্রপার (১৬:৯ লকড)
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                  16:9 Master
                </span>
                {totalSteps > 1 && (
                  <span className="text-xs text-slate-500 font-medium">
                    (ছবি {currentStep} / {totalSteps})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                সব নিউজ মাস্টার ইমেজ ১৬:৯ অনুপাতে ইউনিফর্ম রাখার জন্য ক্রপ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Cropping Canvas Area */}
        <div
          ref={containerRef}
          className="p-4 sm:p-6 bg-slate-900 flex flex-col items-center justify-center overflow-hidden select-none"
        >
          {/* Strict 16:9 Crop Box Frame */}
          <div
            style={{ width: `${boxW}px`, height: `${boxH}px` }}
            className="relative overflow-hidden rounded-lg shadow-2xl border-2 border-indigo-400/80 cursor-grab active:cursor-grabbing bg-slate-950"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* The Image being panned and zoomed */}
            {imageSrc && metrics && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="ক্রপ প্রিভিউ"
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: `${metrics.displayedW}px`,
                  height: `${metrics.displayedH}px`,
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) rotate(${rotation}deg)`,
                  maxWidth: "none",
                  maxHeight: "none",
                  transformOrigin: "center center",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            )}

            {/* Rule-of-Thirds Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/30">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            {/* 16:9 Aspect Badge Overlay */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/20 shadow-xs">
                16:9 LOCKED
              </span>
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md text-white/80 text-[11px] px-2.5 py-0.5 rounded-full border border-white/10">
                মাউস দিয়ে টেনে পজিশন ঠিক করুন
              </span>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Zoom & Transform Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2.5 flex-1 max-w-sm">
              <ZoomOut className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-mono text-slate-600 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="text-xs h-8 px-2.5 gap-1.5"
                title="৯০° ঘড়ির দিকে ঘোরান"
              >
                <RotateCw className="w-3.5 h-3.5" />
                ঘোরান
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs h-8 px-2.5 gap-1.5"
                title="রিসেট"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                রিসেট
              </Button>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="text-xs sm:text-sm h-9"
            >
              বাতিল
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCrop}
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm h-9 gap-1.5 font-semibold"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  প্রসেসিং...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  ১৬:৯ ক্রপ ও কনভার্ট সম্পন্ন করুন
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

