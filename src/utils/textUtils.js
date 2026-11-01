export function extractSummaryFromContent(content, maxLen = 250) {
  if (!content) return "";
  let text = "";

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.blocks && Array.isArray(parsed.blocks)) {
        text = parsed.blocks
          .map((b) => {
            if (b.type === "list" && Array.isArray(b.items)) {
              return b.items.map((i) => i.text || "").join(" ");
            }
            return b.text || "";
          })
          .filter(Boolean)
          .join(" ");
      } else {
        text = content.replace(/<[^>]*>?/gm, "");
      }
    } catch {
      text = content.replace(/<[^>]*>?/gm, "");
    }
  } else if (content?.blocks && Array.isArray(content.blocks)) {
    text = content.blocks
      .map((b) => {
        if (b.type === "list" && Array.isArray(b.items)) {
          return b.items.map((i) => i.text || "").join(" ");
        }
        return b.text || "";
      })
      .filter(Boolean)
      .join(" ");
  }

  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim();
}

