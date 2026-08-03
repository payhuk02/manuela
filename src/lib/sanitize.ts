import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li", "a", "h3", "h4", "blockquote", "img", "video", "source"];
const ALLOWED_ATTR = ["href", "target", "rel", "style", "src", "alt", "title", "loading", "controls", "playsinline", "preload", "width", "height"];

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Détecte un contenu RichText réellement vide.
 * Retire toutes les balises HTML, les espaces insécables, retours et espaces
 * pour vérifier qu'il reste du texte significatif.
 */
export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, "")
    .trim();
  return text.length === 0;
}
