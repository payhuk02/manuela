import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpertiseStep } from "@/hooks/useExpertises";
import { useLang } from "@/i18n/LanguageContext";

interface Props {
  steps: ExpertiseStep[];
  expertiseTitle: string;
  formAnchorId?: string;
}

export const MethodologyTimeline = ({ steps, expertiseTitle, formAnchorId = "expertise-contact" }: Props) => {
  const { lang } = useLang();
  const [active, setActive] = useState(0);

  if (!steps.length) return null;

  const T = lang === "fr"
    ? {
        eyebrow: "Méthodologie",
        title: "Notre démarche, étape par étape.",
        microBefore: "Étape",
        microAfter: "sur",
        ctaLabel: `Lancer mon dossier en ${expertiseTitle.toLowerCase()}`,
        keyboard: "Cliquez une étape pour explorer le détail.",
      }
    : {
        eyebrow: "Methodology",
        title: "Our approach, step by step.",
        microBefore: "Step",
        microAfter: "of",
        ctaLabel: `Start my matter in ${expertiseTitle}`,
        keyboard: "Click a step to explore the details.",
      };

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container-luxe">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow text-accent">{T.eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary leading-tight">
            {T.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{T.keyboard}</p>
        </div>

        {/* Timeline rail */}
        <div className="relative">
          {/* Horizontal connector (desktop) */}
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-border" />
          <div
            className="hidden md:block absolute top-6 left-0 h-px bg-accent transition-all duration-500"
            style={{ width: `${((active + 1) / steps.length) * 100}%` }}
          />

          <div className="grid md:grid-cols-4 gap-6 md:gap-4 relative">
            {steps.map((step, idx) => {
              const isActive = idx === active;
              const isDone = idx < active;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActive(idx)}
                  className="text-left group relative focus:outline-none"
                  aria-pressed={isActive}
                  aria-label={`${T.microBefore} ${idx + 1} ${T.microAfter} ${steps.length}: ${step.title}`}
                >
                  <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-0">
                    <div
                      className={`relative z-10 h-12 w-12 shrink-0 rounded-full border flex items-center justify-center font-serif text-lg transition-all duration-300 ${
                        isActive
                          ? "bg-accent text-accent-foreground border-accent shadow-elegant scale-110"
                          : isDone
                            ? "bg-accent/20 border-accent text-accent"
                            : "bg-card border-border text-muted-foreground group-hover:border-accent/60"
                      }`}
                    >
                      {isDone ? <Check className="h-5 w-5" strokeWidth={2} /> : String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="md:mt-6 md:text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                        {T.microBefore} {idx + 1} / {steps.length}
                      </p>
                      <h3
                        className={`mt-1 font-serif text-lg transition-colors ${
                          isActive ? "text-primary" : "text-primary/70 group-hover:text-primary"
                        }`}
                      >
                        {step.title}
                      </h3>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active step detail */}
        <div className="mt-12 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-8 bg-card border border-accent/30 p-8 md:p-10 shadow-soft">
            <p className="eyebrow text-accent">
              {T.microBefore} {active + 1} {T.microAfter} {steps.length}
            </p>
            <h3 className="mt-3 font-serif text-2xl md:text-3xl text-primary">
              {steps[active].title}
            </h3>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              {steps[active].description}
            </p>
          </div>
          <div className="md:col-span-4 md:pl-4">
            <div className="border-l-2 border-accent pl-6 space-y-4">
              <p className="font-serif text-primary text-lg">
                {lang === "fr" ? "Prêt à avancer ?" : "Ready to move forward?"}
              </p>
              <p className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Décrivez-nous votre situation pour démarrer cette première étape."
                  : "Tell us about your situation to start this first step."}
              </p>
              <Button asChild variant="appointment" size="lg" className="w-full h-auto min-h-12 py-3 px-4 whitespace-normal text-center leading-tight text-xs sm:text-sm">
                <a href={`#${formAnchorId}`} className="flex items-center justify-center gap-2">
                  <span className="break-words">{T.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
