import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  title: string;
  directionsHref: string;
  directionsLabel: string;
  loadingLabel?: string;
  className?: string;
  iframeClassName?: string;
};

export const LazyMap = ({
  src,
  title,
  directionsHref,
  directionsLabel,
  loadingLabel = "Chargement de la carte…",
  className,
  iframeClassName = "w-full h-[320px] md:h-[420px]",
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Lazy-load iframe only when scrolled near viewport
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-muted/40", className)}
    >
      {/* Skeleton placeholder */}
      <div
        aria-hidden={loaded}
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <Skeleton className="absolute inset-0 rounded-none" />
        {/* Faux map grid lines for visual cue */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
              <div className="relative grid place-items-center h-10 w-10 rounded-full bg-background border border-border shadow-soft">
                <MapPin className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
              <Loader2 className="h-3 w-3 animate-spin" />
              {loadingLabel}
            </div>
          </div>
        </div>
      </div>

      {inView && (
        <iframe
          title={title}
          src={src}
          className={cn(
            "border-0 block transition-opacity duration-700",
            iframeClassName,
            loaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
        />
      )}

      {/* Reserve height when iframe not yet mounted */}
      {!inView && <div className={iframeClassName} aria-hidden />}

      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-background/95 backdrop-blur px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-primary border border-border shadow-soft hover:bg-background transition z-10"
      >
        <MapPin className="h-3 w-3" />
        {directionsLabel}
      </a>
    </div>
  );
};
