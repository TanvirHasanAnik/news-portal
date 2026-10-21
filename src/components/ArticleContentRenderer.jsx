import React from "react";
import { sanitizeHtml } from "@/lib/editor/articleBlockParser";

/**
 * ArticleContentRenderer
 *
 * Safely renders structured article content blocks stored as JSON in Cloudflare D1 / SQLite.
 * Maps each block type to its semantic HTML tag and sanitizes inline markup via DOMPurify.
 *
 * Supported Blocks:
 * - heading (level: 2 | 3)
 * - paragraph
 * - list (bullet format)
 */
export default function ArticleContentRenderer({ content, className = "" }) {
  if (!content) return null;

  let parsedDoc = null;

  // Handle both raw JSON strings, JSON objects, and legacy plain text strings
  if (typeof content === "string") {
    try {
      parsedDoc = JSON.parse(content);
    } catch {
      // Legacy plain text format fallback
      parsedDoc = null;
    }
  } else if (typeof content === "object" && content !== null) {
    parsedDoc = content;
  }

  // 1. Structured JSON Block Rendering
  if (parsedDoc?.blocks && Array.isArray(parsedDoc.blocks)) {
    return (
      <div className={`space-y-4 font-serif-bangla text-base sm:text-lg leading-relaxed text-slate-800 ${className}`}>
        {parsedDoc.blocks.map((block, index) => {
          switch (block.type) {
            case "heading": {
              const cleanHtml = sanitizeHtml(block.html || block.text || "");
              if (block.level === 3) {
                return (
                  <h3
                    key={index}
                    className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-2 tracking-tight"
                    dangerouslySetInnerHTML={{ __html: cleanHtml }}
                  />
                );
              }
              return (
                <h2
                  key={index}
                  className="text-2xl sm:text-3xl font-bold text-slate-950 mt-8 mb-3 pb-1 border-b border-slate-100 tracking-tight"
                  dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
              );
            }

            case "list": {
              return (
                <ul
                  key={index}
                  className="list-disc pl-6 space-y-2 my-4 text-slate-800 marker:text-red-600"
                >
                  {(block.items || []).map((item, itemIdx) => {
                    const cleanHtml = sanitizeHtml(item.html || item.text || "");
                    return (
                      <li
                        key={itemIdx}
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: cleanHtml }}
                      />
                    );
                  })}
                </ul>
              );
            }

            case "paragraph":
            default: {
              const cleanHtml = sanitizeHtml(block.html || block.text || "");
              return (
                <p
                  key={index}
                  className="leading-relaxed text-slate-800 [&_a]:text-red-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-red-800"
                  dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
              );
            }
          }
        })}
      </div>
    );
  }

  // 2. Legacy Plain Text Fallback (split by \n\n)
  if (typeof content === "string") {
    const paragraphs = content.trim().split("\n\n").filter(Boolean);
    return (
      <div className={`space-y-4 font-serif-bangla text-base sm:text-lg leading-relaxed text-slate-800 ${className}`}>
        {paragraphs.map((p, idx) => (
          <p key={idx} className="leading-relaxed text-slate-800">
            {p}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

