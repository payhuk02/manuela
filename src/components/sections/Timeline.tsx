import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useLang } from "@/i18n/LanguageContext";

import { useText } from "@/hooks/useText";

export const Timeline = () => {
  const { lang } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const showSection = useText("cabinet.timeline.show", "oui") === "oui";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Collect the 4 dynamic items
  const timelineData = [
    {
      year: useText("cabinet.timeline.1.year", "2018"),
      title: useText("cabinet.timeline.1.title", "Création du Cabinet"),
      description: useText("cabinet.timeline.1.desc", "Fondation du cabinet avec une vision claire : apporter une expertise juridique pointue en droit des affaires et droit pénal.")
    },
    {
      year: useText("cabinet.timeline.2.year", "2020"),
      title: useText("cabinet.timeline.2.title", "Développement International"),
      description: useText("cabinet.timeline.2.desc", "Renforcement de notre réseau de partenaires, marquant le début de l'expertise approfondie en droit OHADA.")
    },
    {
      year: useText("cabinet.timeline.3.year", "2022"),
      title: useText("cabinet.timeline.3.title", "Élargissement des Compétences"),
      description: useText("cabinet.timeline.3.desc", "Intégration du droit de l'immobilier et du droit des étrangers pour offrir un accompagnement global à nos clients.")
    },
    {
      year: useText("cabinet.timeline.4.year", "2024"),
      title: useText("cabinet.timeline.4.title", "Accélération"),
      description: useText("cabinet.timeline.4.desc", "Une équipe qui s'agrandit pour mieux répondre aux enjeux juridiques complexes de notre époque.")
    }
  ];

  if (!showSection) return null;

  return (
    <section className="py-24 md:py-32 bg-background relative" ref={containerRef}>
      <div className="container-luxe max-w-4xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <p className="eyebrow text-accent justify-center">
            {useText("cabinet.timeline.eyebrow", lang === "fr" ? "Frise Chronologique" : "Timeline")}
          </p>
          <h2 className="mt-4 font-serif text-3xl md:text-5xl text-primary">
            {useText("cabinet.timeline.mainTitle", lang === "fr" ? "Notre Parcours" : "Our Journey")}
          </h2>
        </div>

        <div className="relative">
          {/* Ligne verticale de fond */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          
          {/* Ligne verticale de progression */}
          <motion.div 
            className="absolute left-4 md:left-1/2 top-0 w-px bg-primary -translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          <div className="space-y-12 md:space-y-24">
            {timelineData.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.year} className="relative flex flex-col md:flex-row items-start md:items-center justify-between group">
                  {/* Point sur la ligne */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="absolute left-4 md:left-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full -translate-x-1/2 mt-1.5 md:mt-0 z-10 group-hover:bg-primary transition-colors duration-300"
                  />

                  {/* Contenu Gauche / Droite */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`w-full md:w-[45%] pl-12 md:pl-0 ${isEven ? "md:text-right md:pr-12" : "md:order-2 md:pl-12"}`}
                  >
                    <div className="text-4xl md:text-5xl font-serif text-primary/10 font-bold mb-2 group-hover:text-primary transition-colors duration-500">
                      {item.year}
                    </div>
                    <h3 className="text-xl font-serif text-foreground font-bold mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                  
                  {/* Espace Vide pour équilibrer le layout */}
                  <div className={`hidden md:block w-[45%] ${isEven ? "order-2" : ""}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
