import { useMemo } from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
};

/**
 * Renders sanitized HTML produced by the admin rich editor.
 * Falls back gracefully for plain-text legacy content.
 */
export const RichText = ({ html, className }: Props) => {
  const safe = useMemo(() => {
    if (!html) return "";
    // If content is plain text (no tags), wrap it so styles still apply.
    const looksLikeHtml = /<[a-z][\s\S]*>/i.test(html);
    return sanitizeHtml(looksLikeHtml ? html : `<p>${html.replace(/\n/g, "<br/>")}</p>`);
  }, [html]);

  if (!safe) return null;
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
        "prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground",
        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
        "prose-img:my-4 prose-img:w-full prose-img:rounded-md prose-video:my-4 prose-video:w-full prose-video:rounded-md",
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};
