import DOMPurify from "dompurify";

/**
 * Allowed HTML tags and attributes for strict journalistic formatting
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "h2", "h3", "ul", "li", "p", "a", "br"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

/**
 * Universal HTML Sanitizer (DOMPurify client-safe, regex fallback for SSR)
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  if (typeof window !== "undefined" && DOMPurify && typeof DOMPurify.sanitize === "function") {
    return DOMPurify.sanitize(dirtyHtml, SANITIZE_CONFIG);
  }

  // Basic fallback for server environments
  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Sanitizes inline content for paragraphs, headings, and list items
 */
function sanitizeInline(html) {
  if (!html) return "";
  let clean = sanitizeHtml(html);

  // Ensure all anchor links have safe target and rel attributes
  if (typeof window !== "undefined") {
    const temp = document.createElement("div");
    temp.innerHTML = clean;
    const links = temp.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
      // Prevent javascript: hrefs
      if (/^\s*javascript:/i.test(link.getAttribute("href") || "")) {
        link.removeAttribute("href");
      }
    });
    return temp.innerHTML;
  }

  return clean;
}

/**
 * Converts rich text HTML from contentEditable into a structured JSON block schema
 *
 * Schema:
 * {
 *   "version": 1,
 *   "blocks": [
 *     { "type": "heading", "level": 2 | 3, "text": string, "html": string },
 *     { "type": "paragraph", "text": string, "html": string },
 *     { "type": "list", "format": "bullet", "items": [{ "text": string, "html": string }] }
 *   ]
 * }
 */
export function htmlToArticleBlocks(htmlString) {
  if (!htmlString || typeof htmlString !== "string" || !htmlString.trim()) {
    return { version: 1, blocks: [] };
  }

  if (typeof window === "undefined") {
    // If called on server without DOM, wrap into a basic paragraph block
    return {
      version: 1,
      blocks: [
        {
          type: "paragraph",
          text: htmlString.replace(/<[^>]*>?/gm, "").trim(),
          html: sanitizeHtml(htmlString),
        },
      ],
    };
  }

  const cleanHtml = sanitizeHtml(htmlString);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, "text/html");
  const nodes = Array.from(doc.body.childNodes);

  const blocks = [];
  let inlineGroup = [];

  const flushInlineGroup = () => {
    if (inlineGroup.length === 0) return;
    const tempDiv = document.createElement("div");
    inlineGroup.forEach((n) => tempDiv.appendChild(n.cloneNode(true)));
    const text = tempDiv.textContent.trim();
    const html = sanitizeInline(tempDiv.innerHTML);

    if (text || tempDiv.querySelector("a, b, strong, i, em, u")) {
      blocks.push({
        type: "paragraph",
        text,
        html,
      });
    }
    inlineGroup = [];
  };

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim().length > 0) {
        inlineGroup.push(node);
      }
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();

      // Heading 2
      if (tagName === "h2") {
        flushInlineGroup();
        const text = node.textContent.trim();
        if (text) {
          blocks.push({
            type: "heading",
            level: 2,
            text,
            html: sanitizeInline(node.innerHTML),
          });
        }
        continue;
      }

      // Heading 3
      if (tagName === "h3") {
        flushInlineGroup();
        const text = node.textContent.trim();
        if (text) {
          blocks.push({
            type: "heading",
            level: 3,
            text,
            html: sanitizeInline(node.innerHTML),
          });
        }
        continue;
      }

      // Bullet List (UL)
      if (tagName === "ul") {
        flushInlineGroup();
        const liNodes = Array.from(node.querySelectorAll("li"));
        const items = liNodes
          .map((li) => ({
            text: li.textContent.trim(),
            html: sanitizeInline(li.innerHTML),
          }))
          .filter((item) => item.text.length > 0 || item.html.length > 0);

        if (items.length > 0) {
          blocks.push({
            type: "list",
            format: "bullet",
            items,
          });
        }
        continue;
      }

      // Paragraph or Div container
      if (tagName === "p" || tagName === "div") {
        flushInlineGroup();

        // Check for nested block elements (sometimes produced by browsers in contentEditable)
        const nestedBlocks = node.querySelectorAll("h2, h3, ul, p");
        if (nestedBlocks.length > 0) {
          const innerDoc = htmlToArticleBlocks(node.innerHTML);
          blocks.push(...innerDoc.blocks);
        } else {
          const text = node.textContent.trim();
          const html = sanitizeInline(node.innerHTML);
          if (text || node.querySelector("a, b, strong, i, em, u")) {
            blocks.push({
              type: "paragraph",
              text,
              html,
            });
          }
        }
        continue;
      }

      // Inline elements placed directly at root (b, i, u, a, span)
      inlineGroup.push(node);
    }
  }

  flushInlineGroup();

  return {
    version: 1,
    blocks,
  };
}

/**
 * Reconstructs HTML from structured article JSON blocks
 * Used to rehydrate the contentEditable container on initial load or reset.
 */
export function articleBlocksToHtml(blocksDoc) {
  if (!blocksDoc) return "";

  // If passed as raw JSON string, parse it
  let doc = blocksDoc;
  if (typeof blocksDoc === "string") {
    try {
      doc = JSON.parse(blocksDoc);
    } catch {
      // Legacy plain text fallback
      return blocksDoc
        .split("\n\n")
        .map((p) => `<p>${sanitizeHtml(p.trim())}</p>`)
        .join("");
    }
  }

  if (!doc?.blocks || !Array.isArray(doc.blocks)) {
    return "";
  }

  return doc.blocks
    .map((block) => {
      switch (block.type) {
        case "heading": {
          const tag = block.level === 3 ? "h3" : "h2";
          return `<${tag}>${block.html || sanitizeHtml(block.text || "")}</${tag}>`;
        }
        case "list": {
          const items = (block.items || [])
            .map((item) => `<li>${item.html || sanitizeHtml(item.text || "")}</li>`)
            .join("");
          return `<ul>${items}</ul>`;
        }
        case "paragraph":
        default:
          return `<p>${block.html || sanitizeHtml(block.text || "")}</p>`;
      }
    })
    .join("");
}

/**
 * Helper to safely extract raw plain text from article blocks or string
 */
export function extractPlainTextFromBlocks(content) {
  if (!content) return "";

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.blocks && Array.isArray(parsed.blocks)) {
        return extractPlainTextFromBlocks(parsed);
      }
    } catch {
      // It's a standard text string
      return content.replace(/<[^>]*>?/gm, "").trim();
    }
  }

  if (content?.blocks && Array.isArray(content.blocks)) {
    return content.blocks
      .map((b) => {
        if (b.type === "list" && Array.isArray(b.items)) {
          return b.items.map((i) => i.text || "").join(" ");
        }
        return b.text || "";
      })
      .join(" ")
      .trim();
  }

  return "";
}

