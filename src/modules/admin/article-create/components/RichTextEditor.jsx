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

const DEFAULT_FORMATS = {
  bold: false,
  italic: false,
  underline: false,
  h2: false,
  h3: false,
  list: false,
  link: false,
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "এখানে সম্পূর্ণ সংবাদ লিখুন...",
  className = "",
  error = false,
}) {
  const editorRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastEmittedValueRef = useRef("");
  const savedSelectionRange = useRef(null);

  const [activeFormats, setActiveFormats] = useState(DEFAULT_FORMATS);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const checkActiveFormats = useCallback(() => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setActiveFormats(DEFAULT_FORMATS);
      return;
    }

    const anchorNode = selection.anchorNode;
    if (!anchorNode || !editorRef.current?.contains(anchorNode)) {
      setActiveFormats(DEFAULT_FORMATS);
      return;
    }

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
        bold: Boolean(document.queryCommandState("bold")),
        italic: Boolean(document.queryCommandState("italic")),
        underline: Boolean(document.queryCommandState("underline")),
        h2,
        h3,
        list,
        link,
      });
    } catch {
      setActiveFormats(DEFAULT_FORMATS);
    }
  }, []);

  const handleContentChange = useCallback(() => {
    if (!editorRef.current || isComposingRef.current) return;
    const rawHtml = editorRef.current.innerHTML;

    const blocksDoc = htmlToArticleBlocks(rawHtml);
    const isEmpty = !blocksDoc.blocks || blocksDoc.blocks.length === 0;
    const jsonString = isEmpty ? "" : JSON.stringify(blocksDoc);

    lastEmittedValueRef.current = jsonString;

    if (onChange) {
      onChange(jsonString, blocksDoc);
    }

    checkActiveFormats();
  }, [onChange, checkActiveFormats]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (!value) {
      if (editorRef.current.innerHTML !== "") {
        editorRef.current.innerHTML = "";
      }
      lastEmittedValueRef.current = "";
      setActiveFormats(DEFAULT_FORMATS);
      return;
    }

    if (value === lastEmittedValueRef.current) {
      return;
    }

    const targetHtml = articleBlocksToHtml(value);
    const currentHtml = editorRef.current.innerHTML;

    if (targetHtml !== currentHtml) {
      editorRef.current.innerHTML = targetHtml;
      lastEmittedValueRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    const handleSelectionChange = () => {
      checkActiveFormats();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [checkActiveFormats]);

  const getCurrentBlock = () => {
    if (typeof window === "undefined") return null;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    let node = selection.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    while (node && node !== editorRef.current) {
      const tag = node.tagName?.toLowerCase();
      if (tag === "h2" || tag === "h3" || tag === "p" || tag === "li" || tag === "div") {
        return { tag, element: node };
      }
      node = node.parentElement;
    }
    return null;
  };

  const executeCommand = (command, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, val);
    handleContentChange();
  };

  const convertBlockToParagraph = (element) => {
    document.execCommand("formatBlock", false, "<p>");
    const current = getCurrentBlock();
    if (current && (current.tag === "h2" || current.tag === "h3") && element) {
      document.execCommand("formatBlock", false, "p");
      const updated = getCurrentBlock();
      if (updated && (updated.tag === "h2" || updated.tag === "h3") && element.parentNode) {
        const p = document.createElement("p");
        p.innerHTML = element.innerHTML || "<br>";
        element.parentNode.replaceChild(p, element);
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(p);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  const toggleH2 = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const block = getCurrentBlock();

    if (block?.tag === "h2" || activeFormats.h2) {
      convertBlockToParagraph(block?.element);
    } else {
      document.execCommand("formatBlock", false, "<h2>");
    }
    handleContentChange();
  };

  const toggleH3 = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const block = getCurrentBlock();

    if (block?.tag === "h3" || activeFormats.h3) {
      convertBlockToParagraph(block?.element);
    } else {
      document.execCommand("formatBlock", false, "<h3>");
    }
    handleContentChange();
  };

  const toggleBulletList = () => {
    executeCommand("insertUnorderedList");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const block = getCurrentBlock();
      if (block && (block.tag === "h2" || block.tag === "h3")) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.collapsed) {
            const checkRange = range.cloneRange();
            checkRange.selectNodeContents(block.element);
            checkRange.setStart(range.endContainer, range.endOffset);
            const isAtEnd = checkRange.toString().length === 0;

            if (isAtEnd) {
              e.preventDefault();
              const p = document.createElement("p");
              p.innerHTML = "<br>";
              if (block.element.nextSibling) {
                block.element.parentNode.insertBefore(p, block.element.nextSibling);
              } else {
                block.element.parentNode.appendChild(p);
              }
              const newRange = document.createRange();
              newRange.setStart(p, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              handleContentChange();
            }
          }
        }
      }
    }
  };

  const saveSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRange.current = range.cloneRange();
        return;
      }
    }
    savedSelectionRange.current = null;
  };

  const restoreSelection = () => {
    if (typeof window === "undefined" || !savedSelectionRange.current) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(savedSelectionRange.current);
  };

  const handleOpenLinkDialog = () => {
    if (activeFormats.link) {
      executeCommand("unlink");
      setShowLinkDialog(false);
      savedSelectionRange.current = null;
      return;
    }

    saveSelection();
    setLinkUrl("");
    setShowLinkDialog(true);
  };

  const closeLinkDialog = () => {
    setShowLinkDialog(false);
    setLinkUrl("");
    savedSelectionRange.current = null;
  };

  const handleApplyLink = (e) => {
    e?.preventDefault();
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      closeLinkDialog();
      return;
    }

    let url = trimmed;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/") && !url.startsWith("mailto:")) {
      url = `https://${url}`;
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }

    const isCollapsed = savedSelectionRange.current ? savedSelectionRange.current.collapsed : true;
    restoreSelection();

    if (isCollapsed) {
      const safeUrl = sanitizeHtml(url);
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`
      );
    } else {
      executeCommand("createLink", url);
      if (editorRef.current) {
        const links = editorRef.current.querySelectorAll("a");
        links.forEach((a) => {
          if (a.getAttribute("href") === url) {
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener noreferrer");
          }
        });
      }
    }

    closeLinkDialog();
    handleContentChange();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedHtml = clipboardData?.getData("text/html");
    const pastedText = clipboardData?.getData("text/plain");

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
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/90 border-b border-slate-200 rounded-t-lg">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand("bold")}
          title="বোল্ড (Ctrl+B)"
          className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
            activeFormats.bold
              ? "bg-slate-200 text-slate-950 font-bold shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand("italic")}
          title="ইটালিক (Ctrl+I)"
          className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
            activeFormats.italic
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => executeCommand("underline")}
          title="আন্ডারলাইন (Ctrl+U)"
          className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
            activeFormats.underline
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Underline className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleH2}
          title="শিরোনাম ২ (H2)"
          className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
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

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleH3}
          title="শিরোনাম ৩ (H3)"
          className={`px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
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

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleBulletList}
          title="বুলেটযুক্ত তালিকা"
          className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
            activeFormats.list
              ? "bg-slate-200 text-slate-950 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleOpenLinkDialog}
          title={activeFormats.link ? "লিংক বাতিল করুন" : "লিংক যুক্ত করুন"}
          className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
            activeFormats.link
              ? "bg-red-100 text-red-700 shadow-xs"
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          {activeFormats.link ? <Unlink className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </button>
      </div>

      {showLinkDialog && (
        <div className="flex items-center gap-2 p-2 bg-slate-100 border-b border-slate-200 animate-slide-in">
          <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="url"
            placeholder="ওয়েবসাইটের সম্পূর্ণ লিংক প্রবেশ করান..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApplyLink(e);
              if (e.key === "Escape") closeLinkDialog();
            }}
            autoFocus
            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs outline-none focus:border-slate-800"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3" /> যোগ করুন
          </button>
          <button
            type="button"
            onClick={closeLinkDialog}
            className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          handleContentChange();
        }}
        onKeyUp={checkActiveFormats}
        onMouseUp={checkActiveFormats}
        onBlur={(e) => {
          if (editorRef.current) {
            const text = editorRef.current.innerText?.trim() || "";
            if (!text && !editorRef.current.querySelector("img, video")) {
              editorRef.current.innerHTML = "";
            }
          }
          if (!editorRef.current?.contains(e.relatedTarget)) {
            setActiveFormats(DEFAULT_FORMATS);
          }
        }}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="min-h-[260px] max-h-[560px] overflow-y-auto p-4 font-serif-bangla text-base text-slate-900 leading-relaxed outline-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-slate-100 [&_h2]:pb-1 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1.5 [&_li]:leading-relaxed [&_a]:text-red-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-red-800"
      />
    </div>
  );
}
