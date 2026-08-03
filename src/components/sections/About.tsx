import { Briefcase, Building2, Globe2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AppointmentButton } from "@/components/AppointmentButton";
import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";


const domains = [
  { icon: Briefcase, key: "about.domain1", fallback: "Droit des affaires" },
  { icon: Building2, key: "about.domain2", fallback: "Droit immobilier" },
  { icon: Globe2, key: "about.domain3", fallback: "Droit des étrangers" },
];

export const About = () => {
  const { t } = useLang();
  const eyebrow = useText("about.eyebrow", "Présentation");
  const portraitSrc = useText("about.portrait", "");
  const subtitle = useText(
    "hero.subtitle",
    "Conseil & Contentieux — Expertise France & Afrique."
  );
  const ctaPrimary = useText("hero.cta", t.hero.cta);
  const ctaSecondary = useText("hero.ctaSecondary", t.nav.contact);
  const titlePrefix = useText("about.titlePrefix", "Maître MANUELA");
  const titleAccent = useText("about.titleAccent", "VANGAH");
  const p1 = useText("about.p1", t.about.presentation.p1);
  const p2 = useText("about.p2", t.about.presentation.p2);
  const p3 = useText("about.p3", t.about.presentation.p3);
  const p4 = useText("about.p4", t.about.presentation.p4);
  const p5 = useText("about.p5", t.about.presentation.p5);
  const interventionLabel = useText("about.intervention", "Il intervient notamment en");
  const d1 = useText(domains[0].key, domains[0].fallback);
  const d2 = useText(domains[1].key, domains[1].fallback);
  const d3 = useText(domains[2].key, domains[2].fallback);
  const labels = [d1, d2, d3];

  // Use a custom portrait from the CMS if provided, otherwise fall back to the
  // optimized, AI-enhanced responsive bundle shipped with the site.
  const useCmsPortrait = Boolean(portraitSrc);

  return (
    <section id="about" className="py-28 md:py-36 bg-background">
      <div className="container-luxe grid gap-12 lg:gap-16 items-start lg:grid-cols-12">
        <div className="lg:col-span-6 flex justify-center lg:justify-start">
          <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto lg:mx-0 group">
            {/* Halo doré diffus */}
            <div
              aria-hidden
              className="absolute -inset-10 -z-20 rounded-[2.5rem] opacity-60 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, hsl(var(--accent) / 0.30), transparent 70%)",
              }}
            />
            {/* Cadre or décalé */}
            <div className="absolute -inset-4 border border-accent/40 rounded-3xl -z-10 translate-x-4 translate-y-4" />
            {/* Ombre douce sous la photo */}
            <div
              aria-hidden
              className="absolute inset-x-8 -bottom-6 h-12 -z-10 rounded-full blur-2xl bg-primary/40"
            />
            <img
              src={useCmsPortrait ? portraitSrc : ""}
              sizes="(min-width: 1280px) 560px, (min-width: 1024px) 480px, (min-width: 640px) 420px, 92vw"
              alt="Portrait de Maître Manuela DIABATE, avocat expert en droit des affaires"
              loading="lazy"
              decoding="async"
              width={848}
              height={1264}
              className="w-full aspect-[3/4] sm:aspect-[2/3] object-cover object-top rounded-3xl ring-1 ring-accent/30 shadow-[0_30px_60px_-20px_hsl(var(--primary)/0.45),0_18px_40px_-25px_hsl(var(--accent)/0.35)] transition-transform duration-700 ease-luxe group-hover:-translate-y-1"
            />
          </div>
        </div>

        <div className="lg:col-span-6">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-6 font-serif font-bold text-4xl md:text-5xl leading-[1.1] text-appointment dark:text-accent">
            {titlePrefix} <span className="font-bold">{titleAccent}</span>
          </h2>
          <div className="gold-divider mt-8" />

          <div className="mt-10 space-y-5 text-muted-foreground font-medium leading-relaxed text-justify">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-foreground first-letter:float-left first-letter:text-6xl first-letter:font-serif first-letter:text-accent first-letter:mr-3 first-letter:-mt-2 first-letter:font-bold">
                {p1}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p>{p2}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p>{p3}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p>{p4}</p>
              <p className="mt-5">{p5}</p>
            </motion.div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/60 text-center">
            <p className="text-base md:text-lg font-bold leading-relaxed max-w-xl mx-auto text-appointment dark:text-accent">
              {subtitle}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <AppointmentButton
                label={ctaPrimary}
                className="font-bold rounded-full bg-appointment hover:bg-appointment/90 text-white border-transparent"
              />
              <Button asChild variant="outline" size="lg" className="font-semibold rounded-full">
                <a href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  {ctaSecondary}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
