import DOMPurify from "dompurify";



const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "h2", "h3", "ul", "li", "p", "a", "br"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};



export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  if (typeof window !== "undefined" && DOMPurify && typeof DOMPurify.sanitize === "function") {
    return DOMPurify.sanitize(dirtyHtml, SANITIZE_CONFIG);
  }


  return dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}



function sanitizeInline(html) {
  if (!html) return "";
  let clean = sanitizeHtml(html);


  if (typeof window !== "undefined") {
    const temp = document.createElement("div");
    temp.innerHTML = clean;
    const links = temp.querySelectorAll("a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");

      if (/^\s*javascript:/i.test(link.getAttribute("href") || "")) {
        link.removeAttribute("href");
      }
    });
    return temp.innerHTML;
  }

  return clean;
}



export function htmlToArticleBlocks(htmlString) {
  if (!htmlString || typeof htmlString !== "string" || !htmlString.trim()) {
    return { version: 1, blocks: [] };
  }

  if (typeof window === "undefined") {

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


      if (tagName === "p" || tagName === "div") {
        flushInlineGroup();


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


      inlineGroup.push(node);
    }
  }

  flushInlineGroup();

  return {
    version: 1,
    blocks,
  };
}



export function articleBlocksToHtml(blocksDoc) {
  if (!blocksDoc) return "";


  let doc = blocksDoc;
  if (typeof blocksDoc === "string") {
    try {
      doc = JSON.parse(blocksDoc);
    } catch {

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



export function extractPlainTextFromBlocks(content) {
  if (!content) return "";

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.blocks && Array.isArray(parsed.blocks)) {
        return extractPlainTextFromBlocks(parsed);
      }
    } catch {

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

