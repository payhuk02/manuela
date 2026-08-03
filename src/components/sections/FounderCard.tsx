import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Play } from "lucide-react";
// eslint-disable-next-line import/no-unresolved
import founderImage from "@/assets/hero-cabinet-diabate.jpg?responsive";

import { useText } from "@/hooks/useText";
import { useLogo } from "@/hooks/useLogos";

export const FounderCard = () => {
  const { lang } = useLang();
  
  const showSection = useText("home.founderQuote.show", "oui") === "oui";
  const eyebrow = useText("home.founderQuote.eyebrow", "Le mot de l'avocate");
  const quote = useText("home.founderQuote.quote", "\"La justice n'est pas une simple procédure, c'est un droit fondamental. Notre mission est de vous accompagner avec humanité et détermination pour le faire valoir.\"");
  const name = useText("home.founderQuote.name", "Maître Manuela DIABATE");
  const role = useText("home.founderQuote.role", "Avocate au Barreau de Paris");
  
  // Custom image from LogosAdmin, or fallback
  const customImage = useLogo("founder_quote_image");
  const finalImage = customImage || ((founderImage as any)?.src || founderImage);

  if (!showSection) return null;

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="container-luxe max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-sm overflow-hidden shadow-elegant group">
              <img 
                src={finalImage} 
                alt={name} 
                className="w-full h-full object-cover filter saturate-110 transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
              
              <button 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-500"
                aria-label="Voir la vidéo de présentation"
              >
                <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center shadow-gold transition-colors">
                  <Play className="w-5 h-5 ml-1" fill="currentColor" />
                </div>
              </button>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {eyebrow && <p className="eyebrow text-accent mb-6">{eyebrow}</p>}
            <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl italic leading-[1.3] text-primary whitespace-pre-line">
              {quote}
            </blockquote>
            <div className="mt-12 flex items-center gap-6">
              <div className="h-px w-16 bg-gradient-to-r from-accent to-transparent" />
              <div>
                <p className="font-bold tracking-widest uppercase text-sm text-foreground">{name}</p>
                <p className="text-muted-foreground text-sm mt-1">{role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
