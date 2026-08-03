import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Share2,
  Link2,
  Mail,
  Check,
  Linkedin,
  Twitter,
  Facebook,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Lang } from "@/i18n/translations";

type Counts = {
  likes_count: number;
  shares_count: number;
  comments_count: number;
  liked: boolean;
};

type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

type Props = {
  articleId: string;
  title: string;
  articleLang?: Lang;
};

const visitorKeyStorage = "article_interaction_visitor_key";
const COMMENT_MAX = 2000;

const getVisitorKey = () => {
  const existing = window.localStorage.getItem(visitorKeyStorage);
  if (existing) return existing;
  const key = crypto.randomUUID().replace(/-/g, "") + Date.now().toString(36);
  window.localStorage.setItem(visitorKeyStorage, key);
  return key;
};

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(n / 1000) + "k";
};

const formatRelative = (iso: string, lang: Lang) => {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const rtf = new Intl.RelativeTimeFormat(lang === "fr" ? "fr-FR" : "en-US", { numeric: "auto" });
  if (sec < 60) return rtf.format(-sec, "second");
  if (min < 60) return rtf.format(-min, "minute");
  if (hr < 24) return rtf.format(-hr, "hour");
  if (day < 30) return rtf.format(-day, "day");
  return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("") || "?";

const avatarPalette = [
  "from-[hsl(222_47%_22%)] to-[hsl(222_47%_13%)]",
  "from-[hsl(41_55%_55%)] to-[hsl(35_55%_42%)]",
  "from-[hsl(226_71%_45%)] to-[hsl(226_71%_30%)]",
  "from-[hsl(180_35%_38%)] to-[hsl(190_40%_25%)]",
  "from-[hsl(15_55%_50%)] to-[hsl(20_55%_38%)]",
];
const paletteFor = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return avatarPalette[h % avatarPalette.length];
};

/* Animated number that tweens between values */
const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const duration = 450;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="tabular-nums">{formatCount(display)}</span>;
};

export const ArticleInteractions = ({ articleId, title, articleLang }: Props) => {
  const { lang } = useLang();
  const displayLang = articleLang ?? lang;
  const [visitorKey, setVisitorKey] = useState("");
  const [counts, setCounts] = useState<Counts>({ likes_count: 0, shares_count: 0, comments_count: 0, liked: false });
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [likeBurst, setLikeBurst] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", body: "" });

  const labels = useMemo(
    () =>
      displayLang === "fr"
        ? {
            like: "J'aime",
            liked: "Aimé",
            share: "Partager",
            shareOn: "Partager sur",
            copyLink: "Copier le lien",
            linkCopied: "Lien copié",
            comments: "Commentaires",
            joinConversation: "Rejoindre la conversation",
            joinDesc: "Votre commentaire sera publié après modération.",
            noComments: "Soyez le premier à commenter cet article.",
            name: "Votre nom",
            email: "Votre email",
            comment: "Votre commentaire…",
            submit: "Publier",
            sending: "Envoi…",
            pending: "Merci ! Votre commentaire sera publié après validation.",
            error: "Une erreur est survenue. Veuillez réessayer.",
            invalid: "Veuillez renseigner un nom, un email valide et un commentaire.",
            characters: "caractères",
            byEmail: "Par email",
            successTitle: "Commentaire envoyé",
            successDesc: "Il sera visible après validation par notre équipe.",
            postAnother: "Écrire un autre commentaire",
          }
        : {
            like: "Like",
            liked: "Liked",
            share: "Share",
            shareOn: "Share on",
            copyLink: "Copy link",
            linkCopied: "Link copied",
            comments: "Comments",
            joinConversation: "Join the conversation",
            joinDesc: "Your comment will be published after moderation.",
            noComments: "Be the first to comment on this article.",
            name: "Your name",
            email: "Your email",
            comment: "Your comment…",
            submit: "Publish",
            sending: "Sending…",
            pending: "Thank you! Your comment will be published after approval.",
            error: "Something went wrong. Please try again.",
            invalid: "Please enter a name, a valid email and a comment.",
            characters: "characters",
            byEmail: "By email",
            successTitle: "Comment sent",
            successDesc: "It will appear after our team reviews it.",
            postAnother: "Write another comment",
          },
    [displayLang],
  );

  useEffect(() => {
    const key = getVisitorKey();
    setVisitorKey(key);
    Promise.all([
      (supabase as any).rpc("get_article_interactions", { _article_id: articleId, _visitor_key: key }),
      (supabase as any).rpc("get_article_comments", { _article_id: articleId }),
    ]).then(([interactions, articleComments]) => {
      const row = interactions.data?.[0];
      if (row) setCounts(row);
      setComments(articleComments.data ?? []);
      setLoading(false);
    });
  }, [articleId]);

  const toggleLike = async () => {
    const nextLiked = !counts.liked;
    if (nextLiked) setLikeBurst((n) => n + 1);
    setCounts((current) => ({
      ...current,
      liked: nextLiked,
      likes_count: Math.max(0, current.likes_count + (nextLiked ? 1 : -1)),
    }));
    const { data, error } = await (supabase as any).rpc("set_article_like", {
      _article_id: articleId,
      _visitor_key: visitorKey,
      _liked: nextLiked,
    });
    if (error) {
      setCounts((current) => ({
        ...current,
        liked: !nextLiked,
        likes_count: Math.max(0, current.likes_count + (nextLiked ? -1 : 1)),
      }));
      toast({ title: labels.error, variant: "destructive" });
      return;
    }
    if (data?.[0]) setCounts((current) => ({ ...current, likes_count: data[0].likes_count, liked: data[0].liked }));
  };

  const recordShare = async (platform: string) => {
    const { data } = await (supabase as any).rpc("record_article_share", {
      _article_id: articleId,
      _platform: platform,
      _visitor_key: visitorKey,
    });
    if (typeof data === "number") setCounts((current) => ({ ...current, shares_count: data }));
  };

  const shareTo = async (platform: string) => {
    const url = window.location.href;
    const text = title;
    const encoded = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    let target = "";
    switch (platform) {
      case "linkedin":
        target = `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
        break;
      case "twitter":
        target = `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedText}`;
        break;
      case "facebook":
        target = `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
        break;
      case "whatsapp":
        target = `https://api.whatsapp.com/send?text=${encodedText}%20${encoded}`;
        break;
      case "email":
        target = `mailto:?subject=${encodedText}&body=${encoded}`;
        break;
      case "native":
        if (navigator.share) {
          await navigator.share({ title, url }).catch(() => undefined);
          await recordShare("native");
          setShareOpen(false);
        }
        return;
      case "copy_link":
      default:
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
        toast({ title: labels.linkCopied });
        await recordShare("copy_link");
        setTimeout(() => setLinkCopied(false), 2200);
        return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
    await recordShare(platform);
    setShareOpen(false);
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const body = form.body.trim();
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || body.length < 3) {
      toast({ title: labels.invalid, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await (supabase as any).rpc("submit_article_comment", {
      _article_id: articleId,
      _author_name: name,
      _author_email: email,
      _body: body,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: labels.error, variant: "destructive" });
      return;
    }
    setForm({ name: "", email: "", body: "" });
    setSubmitted(true);
    toast({ title: labels.pending });
  };

  const charsLeft = COMMENT_MAX - form.body.length;
  const overLimit = charsLeft < 0;

  return (
    <section className="mt-16 border-t border-border pt-10">
      {/* === Toolbar === */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Like button with heart burst */}
        <button
          type="button"
          onClick={toggleLike}
          disabled={loading || !visitorKey}
          aria-pressed={counts.liked}
          className={cn(
            "group relative inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            counts.liked
              ? "border-accent bg-accent/10 text-accent shadow-[0_4px_20px_-8px_hsl(var(--accent)/0.5)]"
              : "border-border bg-card text-foreground hover:border-accent/50 hover:bg-accent/5 hover:text-accent",
          )}
        >
          <span className="relative inline-flex">
            <Heart
              className={cn(
                "h-4 w-4 transition-all duration-300",
                counts.liked ? "fill-accent stroke-accent scale-110" : "scale-100 group-hover:scale-110",
              )}
            />
            {/* Burst particles */}
            {likeBurst > 0 && (
              <span key={likeBurst} className="pointer-events-none absolute inset-0" aria-hidden>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-accent"
                    style={{
                      animation: `like-burst 700ms ease-out forwards`,
                      transform: `rotate(${i * 60}deg) translateY(-2px)`,
                    }}
                  />
                ))}
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent"
                  style={{ animation: "like-ring 600ms ease-out forwards" }}
                />
              </span>
            )}
          </span>
          <span>{counts.liked ? labels.liked : labels.like}</span>
          <span
            className={cn(
              "ml-1 inline-flex min-w-[1.5rem] justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold transition-colors",
              counts.liked ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            <AnimatedNumber value={counts.likes_count} />
          </span>
        </button>

        {/* Share popover */}
        <Popover open={shareOpen} onOpenChange={setShareOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={loading || !visitorKey}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              <span>{labels.share}</span>
              <span className="ml-1 inline-flex min-w-[1.5rem] justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                <AnimatedNumber value={counts.shares_count} />
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 rounded-xl border-border/60 p-3 shadow-xl">
            <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {labels.shareOn}
            </p>
            <div className="grid grid-cols-4 gap-2">
              <ShareTile
                onClick={() => shareTo("linkedin")}
                label="LinkedIn"
                icon={<Linkedin className="h-5 w-5" />}
                color="text-[#0a66c2]"
              />
              <ShareTile
                onClick={() => shareTo("twitter")}
                label="X"
                icon={<Twitter className="h-5 w-5" />}
                color="text-foreground"
              />
              <ShareTile
                onClick={() => shareTo("facebook")}
                label="Facebook"
                icon={<Facebook className="h-5 w-5" />}
                color="text-[#1877f2]"
              />
              <ShareTile
                onClick={() => shareTo("whatsapp")}
                label="WhatsApp"
                icon={<MessageSquare className="h-5 w-5" />}
                color="text-[#25d366]"
              />
            </div>
            <div className="my-3 h-px bg-border" />
            <button
              type="button"
              onClick={() => shareTo("email")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{labels.byEmail}</span>
            </button>
            <button
              type="button"
              onClick={() => shareTo("copy_link")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {linkCopied ? (
                <Check className="h-4 w-4 text-[hsl(var(--status-live))]" />
              ) : (
                <Link2 className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{linkCopied ? labels.linkCopied : labels.copyLink}</span>
            </button>
          </PopoverContent>
        </Popover>

        {/* Comments counter pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3.5 py-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <AnimatedNumber value={counts.comments_count} />
          <span className="hidden sm:inline">{labels.comments.toLowerCase()}</span>
        </div>
      </div>

      {/* === Comments + form === */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.85fr]">
        {/* Comments list */}
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-2xl text-primary">{labels.comments}</h2>
            <span className="text-sm text-muted-foreground">({counts.comments_count})</span>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <CommentSkeleton />
            ) : comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">{labels.noComments}</p>
              </div>
            ) : (
              comments.map((comment, idx) => (
                <article
                  key={comment.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-md"
                  style={{ animation: `fade-up 500ms ${idx * 60}ms ease-out backwards` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white shadow-sm",
                        paletteFor(comment.author_name),
                      )}
                    >
                      {initials(comment.author_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <strong className="text-sm font-semibold text-primary">{comment.author_name}</strong>
                        <span className="text-xs text-muted-foreground">
                          · {formatRelative(comment.created_at, displayLang)}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </article>
              ))
            )}
          </div>
        </div>

        {/* Comment form */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="border-b border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 px-6 py-5">
              <h3 className="font-serif text-xl text-primary">{labels.joinConversation}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{labels.joinDesc}</p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--status-live))]/10">
                  <Check className="h-7 w-7 text-[hsl(var(--status-live))]" />
                </span>
                <h4 className="mt-4 font-serif text-lg text-primary">{labels.successTitle}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{labels.successDesc}</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  {labels.postAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={submitComment} className="space-y-3 p-6">
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={labels.name}
                  maxLength={100}
                  required
                  className="h-11 rounded-lg border-border/60 bg-background"
                />
                <Input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder={labels.email}
                  type="email"
                  maxLength={255}
                  required
                  className="h-11 rounded-lg border-border/60 bg-background"
                />
                <div className="space-y-1.5">
                  <Textarea
                    value={form.body}
                    onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                    placeholder={labels.comment}
                    maxLength={COMMENT_MAX}
                    required
                    className="min-h-32 rounded-lg border-border/60 bg-background"
                  />
                  <div className="flex justify-end">
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        overLimit
                          ? "text-destructive"
                          : charsLeft < 100
                            ? "text-accent"
                            : "text-muted-foreground",
                      )}
                    >
                      {charsLeft} {labels.characters}
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={submitting || overLimit}
                  className="w-full h-11 rounded-lg"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {labels.sending}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {labels.submit}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const ShareTile = ({
  onClick,
  label,
  icon,
  color,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 transition-all hover:bg-muted"
    aria-label={label}
  >
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-transform group-hover:scale-110",
        color,
      )}
    >
      {icon}
    </span>
    <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
  </button>
);

const CommentSkeleton = () => (
  <div className="space-y-4">
    {[0, 1, 2].map((i) => (
      <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
