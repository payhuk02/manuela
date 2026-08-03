import { RichText } from "@/components/RichText";
import { ArrowUpRight } from "lucide-react";

export type NewsCardData = {
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image_url: string | null;
};

type Props = {
  item: NewsCardData;
  readMoreLabel: string;
  href?: string;
};

export const NewsCard = ({ item, readMoreLabel, href = "#" }: Props) => (
  <article className="group bg-card border border-border flex flex-col transition-all duration-500 ease-luxe hover:border-accent hover:shadow-elegant hover:-translate-y-1 overflow-hidden">
    {item.image_url && (
      <img
        src={item.image_url}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="img-crisp w-full aspect-[16/10] object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.03]"
      />
    )}
    <div className="p-8 flex flex-col flex-1">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-accent">{item.category}</span>
        <span className="opacity-40">·</span>
        <span>{item.date}</span>
      </div>
      <h3 className="mt-5 font-serif text-2xl text-primary leading-snug flex-1">{item.title}</h3>
      <RichText html={item.excerpt} className="mt-4 text-sm leading-relaxed" />
      <a href={href} className="mt-6 inline-flex items-center gap-2 text-sm text-primary font-medium group/link">
        <span className="link-underline">{readMoreLabel}</span>
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
      </a>
    </div>
  </article>
);
