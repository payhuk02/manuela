import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLang } from "@/i18n/LanguageContext";

const Counter = ({ from = 0, to, duration = 2 }: { from?: number, to: number, duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(from, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => Math.round(current));
  
  useEffect(() => {
    if (inView) {
      spring.set(to);
    }
  }, [inView, spring, to]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

import { useText } from "@/hooks/useText";

export const Metrics = () => {
  const { lang } = useLang();
  
  const showMetrics = useText("home.metrics.show", "oui") === "oui";

  // Use dynamic strings for each metric. The `parseInt` safely handles any string value.
  const metrics = [
    { 
      value: parseInt(useText("home.metrics.1.value", "15")) || 0, 
      suffix: useText("home.metrics.1.suffix", "+"), 
      label: useText("home.metrics.1.label", "Années d'expérience") 
    },
    { 
      value: parseInt(useText("home.metrics.2.value", "800")) || 0, 
      suffix: useText("home.metrics.2.suffix", "+"), 
      label: useText("home.metrics.2.label", "Dossiers Plaidés") 
    },
    { 
      value: parseInt(useText("home.metrics.3.value", "95")) || 0, 
      suffix: useText("home.metrics.3.suffix", "%"), 
      label: useText("home.metrics.3.label", "Clients Satisfaits") 
    },
    { 
      value: parseInt(useText("home.metrics.4.value", "3")) || 0, 
      suffix: useText("home.metrics.4.suffix", ""), 
      label: useText("home.metrics.4.label", "Langues Parlées") 
    },
  ];

  if (!showMetrics) return null;

  return (
    <section className="py-24 bg-night text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-night to-night opacity-60" />
      <div className="container-luxe relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {metrics.map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="text-4xl md:text-5xl lg:text-7xl font-serif text-white mb-4 font-bold tracking-tight">
                <Counter to={metric.value} />
                <span className="text-primary group-hover:text-white transition-colors duration-500">{metric.suffix}</span>
              </div>
              <p className="text-xs md:text-sm text-primary-foreground/70 uppercase tracking-[0.2em] font-medium">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
