import { useEffect, useRef, useState } from "react";
import { useText } from "@/hooks/useText";
import { ResponsiveImage, type ResponsivePicture } from "@/components/ResponsiveImage";
/* eslint-disable import/no-unresolved */
import imgAffaires from "@/assets/expertise-affaires.jpg?responsive";
import imgBancaire from "@/assets/expertise-bancaire.jpg?responsive";
import imgSurendettement from "@/assets/expertise-surendettement.jpg?responsive";
import imgOhada from "@/assets/expertise-ohada.jpg?responsive";
import imgImmobilier from "@/assets/expertise-immobilier.jpg?responsive";
import imgPenal from "@/assets/expertise-penal.jpg?responsive";
import imgEtrangers from "@/assets/expertise-etrangers.jpg?responsive";
import imgPetrolier from "@/assets/expertise-petrolier.jpg?responsive";
import imgTravail from "@/assets/expertise-travail.png?responsive";
import imgDommage from "@/assets/expertise-dommage.png?responsive";
import imgFamille from "@/assets/expertise-famille.png?responsive";
import imgAdmin from "@/assets/expertise-administratif.png?responsive";
import imgPalaisDeJusticeParis from "@/assets/palais-de-justice-paris.jpg?responsive";
import imgCabinetVangahPic from "@/assets/hero-cabinet-diabate.jpg?responsive";
/* eslint-enable import/no-unresolved */

const cabinetPicture = imgCabinetVangahPic as unknown as ResponsivePicture;
const palaisDeJusticeParis = imgPalaisDeJusticeParis as unknown as ResponsivePicture;
const picAffaires = imgAffaires as unknown as ResponsivePicture;
const picBancaire = imgBancaire as unknown as ResponsivePicture;
const picSurendettement = imgSurendettement as unknown as ResponsivePicture;
const picOhada = imgOhada as unknown as ResponsivePicture;
const picImmobilier = imgImmobilier as unknown as ResponsivePicture;
const picPenal = imgPenal as unknown as ResponsivePicture;
const picEtrangers = imgEtrangers as unknown as ResponsivePicture;
const picPetrolier = imgPetrolier as unknown as ResponsivePicture;
const picTravail = imgTravail as unknown as ResponsivePicture;
const picDommage = imgDommage as unknown as ResponsivePicture;
const picFamille = imgFamille as unknown as ResponsivePicture;
const picAdmin = imgAdmin as unknown as ResponsivePicture;

type SizeKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const EYEBROW_SIZE_CLASS: Record<SizeKey, string> = {
  xs: "text-[10px] tracking-[0.25em]",
  sm: "text-xs tracking-[0.25em]",
  md: "text-sm tracking-[0.3em]",
  lg: "text-base tracking-[0.3em]",
  xl: "text-lg tracking-[0.3em]",
  "2xl": "text-xl tracking-[0.3em]",
};

const TITLE_SIZE_CLASS: Record<SizeKey, string> = {
  xs: "text-2xl md:text-3xl lg:text-4xl",
  sm: "text-3xl md:text-4xl lg:text-5xl",
  md: "text-5xl md:text-7xl lg:text-8xl",
  lg: "text-6xl md:text-8xl lg:text-9xl",
  xl: "text-7xl md:text-9xl lg:text-[10rem]",
  "2xl": "text-8xl md:text-[10rem] lg:text-[12rem]",
};

const normalizeSize = (v: string, fallback: SizeKey = "md"): SizeKey =>
  (["xs", "sm", "md", "lg", "xl", "2xl"].includes(v) ? (v as SizeKey) : fallback);

type Slide = {
  image: string | null;
  picture?: ResponsivePicture;
  eyebrow: string;
  title: string;
  accent: string;
  colorEyebrow: string;
  colorTitle: string;
  colorAccent: string;
  sizeEyebrow: SizeKey;
  sizeTitle: SizeKey;
};

export const Hero = () => {
  const eyebrow = useText("hero.eyebrow", "Conseil & Contentieux");
  const heroTitleLine1 = useText("hero.titleLine1", "CABINET");
  const heroTitleLine2 = useText("hero.titleLine2", "Manuela DIABATE");
  const customHeroImage = useText("hero.image", "");
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [videoEnded, setVideoEnded] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  // The ink video is now permanently skipped
  const [skipVideo, setSkipVideo] = useState(true);
  // Stratégie de préchargement progressive :
  // - "metadata" au mount → ne télécharge que les métadonnées (quelques Ko),
  //   ce qui libère la bande passante pour le LCP (texte + image carrousel).
  // - "auto" dès que le Hero est proche du viewport (IntersectionObserver
  //   avec rootMargin large) → bascule en téléchargement complet pour
  //   permettre le démarrage immédiat de la lecture.
  const [videoPreload, setVideoPreload] = useState<"metadata" | "auto">("metadata");


  const FADE_DURATION = 2;
  // Voile sombre désactivé : on laisse les images du carrousel pleinement visibles.
  const OVERLAY_MIN = 0;

  // Hooks called unconditionally at the top level (Rules of Hooks).
  const s1Eyebrow = useText("hero.s1.eyebrow", "CABINET\nManuela DIABATE");
  const s1Title = useText("hero.s1.title", "Avocate au");
  const s1Accent = useText("hero.s1.accent", "Barreau");
  const s2Eyebrow = useText("hero.s2.eyebrow", "Expertise");
  const s2Title = useText("hero.s2.title", "Droit des");
  const s2Accent = useText("hero.s2.accent", "affaires");
  const s3Eyebrow = useText("hero.s3.eyebrow", "Protection");
  const s3Title = useText("hero.s3.title", "Droit du");
  const s3Accent = useText("hero.s3.accent", "travail");
  const s4Eyebrow = useText("hero.s4.eyebrow", "Assistance");
  const s4Title = useText("hero.s4.title", "Dommage");
  const s4Accent = useText("hero.s4.accent", "corporel");
  const s5Eyebrow = useText("hero.s5.eyebrow", "Accompagnement");
  const s5Title = useText("hero.s5.title", "Droit de la");
  const s5Accent = useText("hero.s5.accent", "famille");
  const s6Eyebrow = useText("hero.s6.eyebrow", "Défense");
  const s6Title = useText("hero.s6.title", "Droit");
  const s6Accent = useText("hero.s6.accent", "administratif");
  const s7Eyebrow = useText("hero.s7.eyebrow", "Protection");
  const s7Title = useText("hero.s7.title", "Droit des");
  const s7Accent = useText("hero.s7.accent", "étrangers");
  const s8Eyebrow = useText("hero.s8.eyebrow", "Investissement");
  const s8Title = useText("hero.s8.title", "Droit");
  const s8Accent = useText("hero.s8.accent", "immobilier");
  const s9Eyebrow = useText("hero.s9.eyebrow", "Afrique");
  const s9Title = useText("hero.s9.title", "Droit");
  const s9Accent = useText("hero.s9.accent", "OHADA");

  // Custom slide images uploaded from admin (overrides default responsive bundles).
  const s1Img = useText("hero.s1.image", "");
  const s2Img = useText("hero.s2.image", "");
  const s3Img = useText("hero.s3.image", "");
  const s4Img = useText("hero.s4.image", "");
  const s5Img = useText("hero.s5.image", "");
  const s6Img = useText("hero.s6.image", "");
  const s7Img = useText("hero.s7.image", "");
  const s8Img = useText("hero.s8.image", "");
  const s9Img = useText("hero.s9.image", "");

  // Couleurs par slide (configurables depuis l'admin). Defaults : doré + ivoire.
  const GOLD = "#d4af37";
  const IVORY = "#ffffff";
  const c1e = useText("hero.s1.color.eyebrow", GOLD);
  const c1t = useText("hero.s1.color.title", IVORY);
  const c1a = useText("hero.s1.color.accent", GOLD);
  const c2e = useText("hero.s2.color.eyebrow", GOLD);
  const c2t = useText("hero.s2.color.title", IVORY);
  const c2a = useText("hero.s2.color.accent", GOLD);
  const c3e = useText("hero.s3.color.eyebrow", GOLD);
  const c3t = useText("hero.s3.color.title", IVORY);
  const c3a = useText("hero.s3.color.accent", GOLD);
  const c4e = useText("hero.s4.color.eyebrow", GOLD);
  const c4t = useText("hero.s4.color.title", IVORY);
  const c4a = useText("hero.s4.color.accent", GOLD);
  const c5e = useText("hero.s5.color.eyebrow", GOLD);
  const c5t = useText("hero.s5.color.title", IVORY);
  const c5a = useText("hero.s5.color.accent", GOLD);
  const c6e = useText("hero.s6.color.eyebrow", GOLD);
  const c6t = useText("hero.s6.color.title", IVORY);
  const c6a = useText("hero.s6.color.accent", GOLD);
  const c7e = useText("hero.s7.color.eyebrow", GOLD);
  const c7t = useText("hero.s7.color.title", IVORY);
  const c7a = useText("hero.s7.color.accent", GOLD);
  const c8e = useText("hero.s8.color.eyebrow", GOLD);
  const c8t = useText("hero.s8.color.title", IVORY);
  const c8a = useText("hero.s8.color.accent", GOLD);
  const c9e = useText("hero.s9.color.eyebrow", GOLD);
  const c9t = useText("hero.s9.color.title", IVORY);
  const c9a = useText("hero.s9.color.accent", GOLD);

  // Tailles d'écriture par slide (configurables depuis l'admin).
  const sz1e = normalizeSize(useText("hero.s1.size.eyebrow", "md"));
  const sz1t = normalizeSize(useText("hero.s1.size.title", "md"));
  const sz2e = normalizeSize(useText("hero.s2.size.eyebrow", "md"));
  const sz2t = normalizeSize(useText("hero.s2.size.title", "md"));
  const sz3e = normalizeSize(useText("hero.s3.size.eyebrow", "md"));
  const sz3t = normalizeSize(useText("hero.s3.size.title", "md"));
  const sz4e = normalizeSize(useText("hero.s4.size.eyebrow", "md"));
  const sz4t = normalizeSize(useText("hero.s4.size.title", "md"));
  const sz5e = normalizeSize(useText("hero.s5.size.eyebrow", "md"));
  const sz5t = normalizeSize(useText("hero.s5.size.title", "md"));
  const sz6e = normalizeSize(useText("hero.s6.size.eyebrow", "md"));
  const sz6t = normalizeSize(useText("hero.s6.size.title", "md"));
  const sz7e = normalizeSize(useText("hero.s7.size.eyebrow", "md"));
  const sz7t = normalizeSize(useText("hero.s7.size.title", "md"));
  const sz8e = normalizeSize(useText("hero.s8.size.eyebrow", "md"));
  const sz8t = normalizeSize(useText("hero.s8.size.title", "md"));
  const sz9e = normalizeSize(useText("hero.s9.size.eyebrow", "md"));
  const sz9t = normalizeSize(useText("hero.s9.size.title", "md"));

  // Slides : présentation puis les domaines d'expertise.
  // Si l'admin a uploadé une image personnalisée pour un slide, on l'utilise
  // (via `image` simple) ; sinon on garde le bundle responsive d'origine.
  const slides: Slide[] = [
    { image: s1Img || null, picture: s1Img ? undefined : palaisDeJusticeParis, eyebrow: s1Eyebrow, title: s1Title, accent: s1Accent, colorEyebrow: c1e, colorTitle: c1t, colorAccent: c1a, sizeEyebrow: sz1e, sizeTitle: sz1t },
    { image: s2Img || null, picture: s2Img ? undefined : picAffaires, eyebrow: s2Eyebrow, title: s2Title, accent: s2Accent, colorEyebrow: c2e, colorTitle: c2t, colorAccent: c2a, sizeEyebrow: sz2e, sizeTitle: sz2t },
    { image: s3Img || null, picture: s3Img ? undefined : picTravail, eyebrow: s3Eyebrow, title: s3Title, accent: s3Accent, colorEyebrow: c3e, colorTitle: c3t, colorAccent: c3a, sizeEyebrow: sz3e, sizeTitle: sz3t },
    { image: s4Img || null, picture: s4Img ? undefined : picDommage, eyebrow: s4Eyebrow, title: s4Title, accent: s4Accent, colorEyebrow: c4e, colorTitle: c4t, colorAccent: c4a, sizeEyebrow: sz4e, sizeTitle: sz4t },
    { image: s5Img || null, picture: s5Img ? undefined : picFamille, eyebrow: s5Eyebrow, title: s5Title, accent: s5Accent, colorEyebrow: c5e, colorTitle: c5t, colorAccent: c5a, sizeEyebrow: sz5e, sizeTitle: sz5t },
    { image: s6Img || null, picture: s6Img ? undefined : picAdmin, eyebrow: s6Eyebrow, title: s6Title, accent: s6Accent, colorEyebrow: c6e, colorTitle: c6t, colorAccent: c6a, sizeEyebrow: sz6e, sizeTitle: sz6t },
    { image: s7Img || null, picture: s7Img ? undefined : picEtrangers, eyebrow: s7Eyebrow, title: s7Title, accent: s7Accent, colorEyebrow: c7e, colorTitle: c7t, colorAccent: c7a, sizeEyebrow: sz7e, sizeTitle: sz7t },
    { image: s8Img || null, picture: s8Img ? undefined : picImmobilier, eyebrow: s8Eyebrow, title: s8Title, accent: s8Accent, colorEyebrow: c8e, colorTitle: c8t, colorAccent: c8a, sizeEyebrow: sz8e, sizeTitle: sz8t },
    { image: s9Img || null, picture: s9Img ? undefined : picOhada, eyebrow: s9Eyebrow, title: s9Title, accent: s9Accent, colorEyebrow: c9e, colorTitle: c9t, colorAccent: c9a, sizeEyebrow: sz9e, sizeTitle: sz9t },
  ];

  const handleEnded = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.pause();
      if (Number.isFinite(v.duration)) {
        v.currentTime = Math.max(0, v.duration - 0.05);
      }
    } catch {
      /* noop */
    }
    setOverlayOpacity(OVERLAY_MIN);
    setVideoEnded(true);
  };

  // Detect reduced motion / save-data: in that case, skip the video entirely
  // and reveal the carousel right away.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn: any = (navigator as any).connection;
    const saveData = !!conn?.saveData;
    if (mql.matches || saveData) {
      setSkipVideo(true);
      setOverlayOpacity(OVERLAY_MIN);
      setVideoEnded(true);
    }
  }, []);

  // Préchargement progressif : on bascule de "metadata" à "auto" dès que
  // le Hero est proche du viewport (rootMargin large pour anticiper).
  // Sur la home, le Hero est déjà visible → bascule quasi-immédiate sans
  // bloquer le rendu initial. Sur d'autres pages où ce composant serait
  // monté plus bas, l'IO évite tout téléchargement inutile.
  useEffect(() => {
    if (skipVideo) return;
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVideoPreload("auto");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVideoPreload("auto");
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [skipVideo]);


  useEffect(() => {
    if (skipVideo) return;
    const v = videoRef.current;
    if (!v) return;

    let fadeStart = Number.POSITIVE_INFINITY;
    let fadeEnd = Number.POSITIVE_INFINITY;

    const computeWindow = () => {
      if (!Number.isFinite(v.duration) || v.duration <= 0) return;
      fadeEnd = v.duration;
      fadeStart = Math.max(0, fadeEnd - FADE_DURATION);
    };

    const onTime = () => {
      if (!Number.isFinite(fadeStart)) return;
      const t = v.currentTime;
      if (t <= fadeStart) {
        setOverlayOpacity(1);
      } else {
        const k = Math.min(1, (t - fadeStart) / (fadeEnd - fadeStart));
        setOverlayOpacity(1 - (1 - OVERLAY_MIN) * k);
      }
    };

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => { /* noop */ });
    };

    if (v.readyState >= 1) computeWindow();
    v.addEventListener("loadedmetadata", computeWindow);
    v.addEventListener("durationchange", computeWindow);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("canplay", tryPlay);
    tryPlay();

    return () => {
      v.removeEventListener("loadedmetadata", computeWindow);
      v.removeEventListener("durationchange", computeWindow);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("canplay", tryPlay);
    };
  }, [skipVideo]);

  // Carrousel : démarre une fois la vidéo terminée, change de slide toutes les 5s.
  useEffect(() => {
    if (!videoEnded) return;
    const id = window.setInterval(() => {
      setActiveSlide((s) => (s + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [videoEnded, slides.length]);

  // Message de bienvenue retiré : le carrousel apparaît directement après l'animation d'encre.

  const current = slides[activeSlide];

  return (
    <section ref={sectionRef} id="top" className="relative min-h-[100svh] flex items-center overflow-hidden bg-primary">
      <div className="absolute inset-0">
        {customHeroImage && (
          <img
            src={customHeroImage}
            alt="Maître MANUELA VANGAH — CABINET Manuela DIABATE"
            className="h-full w-full object-cover"
            loading="eager"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ fetchpriority: "high" } as any)}
          />
        )}

        {/* Carrousel d'images en arrière-plan (visible après la vidéo). */}
        {slides.map((s, i) => {
          const visible = videoEnded && i === activeSlide;
          const wrapperClass =
            `absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${visible ? "animate-ken-burns origin-center" : ""}`;
          const wrapperStyle = { opacity: visible ? 1 : 0 } as const;
          if (s.picture) {
            return (
              <div key={`pic-${i}`} className={wrapperClass} style={wrapperStyle} aria-hidden="true">
                <ResponsiveImage
                  data={s.picture}
                  alt={s.title ? `Illustration pour ${s.title}` : "Cabinet Manuela DIABATE"}
                  sizes="100vw"
                  loading={i === 0 ? "eager" : "lazy"}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ fetchPriority: i === 0 ? "high" : "low" } as any)}
                  className="absolute inset-0 h-full w-full object-cover [filter:saturate(1.08)_contrast(1.05)] [image-rendering:auto]"
                  pictureClassName="absolute inset-0 h-full w-full"
                />
              </div>
            );
          }
          return (
            <img
              key={`${s.image}-${i}`}
              src={s.image ?? undefined}
              alt={s.title ? `Illustration pour ${s.title}` : "Cabinet Manuela DIABATE"}
              aria-hidden="true"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ fetchpriority: i === 0 ? "high" : "low" } as any)}
              className={`${wrapperClass} object-cover [filter:saturate(1.08)_contrast(1.05)]`}
              style={wrapperStyle}
            />
          );
        })}


        {/* Voile sombre supprimé : aucune ombre/overlay sur le hero. */}

      </div>

      <div className="container-luxe relative z-10 pt-28 pb-20">
        <div key={activeSlide} className="max-w-3xl">
          <p className={`eyebrow mt-12 animate-fade-in whitespace-pre-line font-bold ${EYEBROW_SIZE_CLASS[current.sizeEyebrow]}`} style={{ color: current.colorEyebrow }}>{current.eyebrow}</p>
          <h1 className={`mt-6 font-serif leading-[1.05] animate-fade-up ${TITLE_SIZE_CLASS[current.sizeTitle]}`} style={{ color: current.colorTitle }}>
            {current.title}
            {current.accent ? (<><br /><span style={{ color: current.colorAccent }}>{current.accent}</span></>) : null}
          </h1>
        </div>

        {/* Indicateurs du carrousel masqués. */}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-accent to-transparent" />
      </div>
    </section>
  );
};
