"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  Link2,
  Unlink,
  Check,
  X,
} from "lucide-react";
import {
  htmlToArticleBlocks,
  articleBlocksToHtml,
  sanitizeHtml,
} from "@/lib/editor/articleBlockParser";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "এখানে সম্পূর্ণ সংবাদ লিখুন...",
  className = "",
  error = false,
}) {
  const editorRef = useRef(null);
  const isUpdatingFromProps = useRef(false);
  const savedSelectionRange = useRef(null);

  // Active formatting state for toolbar highlights
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    h2: false,
    h3: false,
    list: false,
    link: false,
  });

  // Link dialog state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  /**
   * Updates toolbar active button states based on current selection
   */
  const checkActiveFormats = useCallback(() => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const anchorNode = selection.anchorNode;
    if (!anchorNode || !editorRef.current?.contains(anchorNode)) return;

    let h2 = false;
    let h3 = false;
    let list = false;
    let link = false;

    let current = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;

    while (current && current !== editorRef.current) {
      const tag = current.tagName?.toLowerCase();
      if (tag === "h2") h2 = true;
      if (tag === "h3") h3 = true;
      if (tag === "ul" || tag === "li") list = true;
      if (tag === "a") link = true;
      current = current.parentElement;
    }

    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        h2,
        h3,
        list,
        link,
      });
    } catch {
      // Fallback if queryCommandState is unavailable
    }
  }, []);

  /**
   * Serializes current innerHTML to JSON blocks and invokes parent onChange
   */
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    const rawHtml = editorRef.current.innerHTML;

    // Convert to JSON block schema
    const blocksDoc = htmlToArticleBlocks(rawHtml);
    const jsonString = JSON.stringify(blocksDoc);

    if (onChange) {
      onChange(jsonString, blocksDoc);
    }

    checkActiveFormats();
  }, [onChange, checkActiveFormats]);

  /**
   * Sync external value changes (e.g. form reset or initial load)
   */
  useEffect(() => {
    if (!editorRef.current) return;

    // Handle empty / reset state
    if (!value) {
      if (editorRef.current.innerHTML !== "") {
        editorRef.current.innerHTML = "";
      }
      return;
    }

    // Convert value (JSON or HTML) to editor HTML
    const targetHtml = articleBlocksToHtml(value);
    const currentHtml = editorRef.current.innerHTML;

    // Avoid overwriting and disrupting active user typing
    if (targetHtml !== currentHtml && !editorRef.current.contains(document.activeElement)) {
      isUpdatingFromProps.current = true;
      editorRef.current.innerHTML = targetHtml;
      isUpdatingFromProps.current = false;
    }
  }, [value]);

  /**
   * Listen for selection changes to update toolbar active states
   */
  useEffect(() => {
    const handleSelectionChange = () => {
      checkActiveFormats();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [checkActiveFormats]);

  /**
   * Safe command execution wrapper
   */
  const executeCommand = (command, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, val);
    handleContentChange();
  };

  /**
   * Heading 2 toggle
   */
  const toggleH2 = () => {
    if (activeFormats.h2) {
      executeCommand("formatBlock", "<p>");
    } else {
      executeCommand("formatBlock", "<h2>");
    }
  };

  /**
   * Heading 3 toggle
   */
  const toggleH3 = () => {
    if (activeFormats.h3) {
      executeCommand("formatBlock", "<p>");
    } else {
      executeCommand("formatBlock", "<h3>");
    }
  };

  /**
   * Bullet list toggle
   */
  const toggleBulletList = () => {
    executeCommand("insertUnorderedList");
  };

  /**
   * Saves current cursor/selection range before dialog opens
   */
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  /**
   * Restores saved selection range
   */
  const restoreSelection = () => {
    if (savedSelectionRange.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRange.current);
    }
  };

  /**
   * Hyperlink dialog opener
   */
  const handleOpenLinkDialog = () => {
    if (activeFormats.link) {
      // If already on a link, simply unlink
      executeCommand("unlink");
      setShowLinkDialog(false);
      return;
    }

    saveSelection();
    setLinkUrl("");
    setShowLinkDialog(true);
  };

  /**
   * Insert sanitized link
   */
  const handleApplyLink = (e) => {
    e?.preventDefault();
    if (!linkUrl.trim()) {
      setShowLinkDialog(false);
      return;
    }

    let url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      url = `https://${url}`;
    }

    restoreSelection();
    executeCommand("createLink", url);

    // Ensure target="_blank" on the newly created link
    if (editorRef.current) {
      const links = editorRef.current.querySelectorAll("a");
      links.forEach((a) => {
        if (a.getAttribute("href") === url) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        }
      });
    }

    setShowLinkDialog(false);
    setLinkUrl("");
    handleContentChange();
  };

  /**
   * Strict paste sanitization:
   * Strips all inline styles, font sizes, colors, and disallowed tags.
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedHtml = clipboardData.getData("text/html");
    const pastedText = clipboardData.getData("text/plain");

    if (pastedHtml) {
      const cleanHtml = sanitizeHtml(pastedHtml);
      document.execCommand("insertHTML", false, cleanHtml);
    } else if (pastedText) {
      document.execCommand("insertText", false, pastedText);
    }

    handleContentChange();
  };

  return (
    <div
      className={`rounded-lg border bg-white transition-colors ${
        error
          ? "border-red-500 focus-within:border-red-600 ring-1 ring-red-500/20"
          : "border-slate-300 focus-within:border-slate-800"
      } ${className}`}
    >
      {/* 1. Restricted Minimal Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/90 border-b border-slate-200 rounded-t-lg">
        {/* Bold */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          title="বোল্ড (Ctrl+B)"
          className={`p-1.5 rounded text-sm transition-colors ${
            activeFormats.bold
              ? "bg-slate-200 text-slate-950 font-bold shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          title="ইটালিক (Ctrl+I)"
          className={`p-1.5 rounded text-sm transition-colors ${
            activeFormats.italic
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          title="আন্ডারলাইন (Ctrl+U)"
          className={`p-1.5 rounded text-sm transition-colors ${
            activeFormats.underline
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Underline className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        {/* Heading 2 */}
        <button
          type="button"
          onClick={toggleH2}
          title="শিরোনাম ২ (H2)"
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
            activeFormats.h2
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-0.5">
            <Heading2 className="w-3.5 h-3.5" />
            <span>H2</span>
          </div>
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={toggleH3}
          title="শিরোনাম ৩ (H3)"
          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
            activeFormats.h3
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-0.5">
            <Heading3 className="w-3.5 h-3.5" />
            <span>H3</span>
          </div>
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        {/* Bulleted List */}
        <button
          type="button"
          onClick={toggleBulletList}
          title="বুলেটযুক্ত তালিকা"
          className={`p-1.5 rounded text-sm transition-colors ${
            activeFormats.list
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <List className="w-4 h-4" />
        </button>

        {/* Hyperlink */}
        <button
          type="button"
          onClick={handleOpenLinkDialog}
          title={activeFormats.link ? "লিংক বাতিল করুন" : "লিংক যুক্ত করুন"}
          className={`p-1.5 rounded text-sm transition-colors ${
            activeFormats.link
              ? "bg-red-100 text-red-700 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          {activeFormats.link ? <Unlink className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </button>

        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400 font-medium px-1">
          <span>WYSIWYG</span>
        </div>
      </div>

      {/* 2. Inline Link Inserter Bar */}
      {showLinkDialog && (
        <div className="flex items-center gap-2 p-2 bg-slate-100 border-b border-slate-200 animate-slide-in">
          <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="url"
            placeholder="লিংক URL লিখুন (যেমন: https://example.com)..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApplyLink(e);
              if (e.key === "Escape") setShowLinkDialog(false);
            }}
            autoFocus
            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs outline-none focus:border-slate-800"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> যোগ করুন
          </button>
          <button
            type="button"
            onClick={() => setShowLinkDialog(false)}
            className="p-1 text-slate-500 hover:text-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Native contentEditable Main Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onKeyUp={checkActiveFormats}
        onMouseUp={checkActiveFormats}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="min-h-[260px] max-h-[560px] overflow-y-auto p-4 font-serif-bangla text-base text-slate-900 leading-relaxed outline-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-slate-100 [&_h2]:pb-1 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1.5 [&_li]:leading-relaxed [&_a]:text-red-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-red-800"
      />
    </div>
  );
}

