import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        night: "hsl(var(--night))",
        status: {
          live: "hsl(var(--status-live))",
          "live-foreground": "hsl(var(--status-live-foreground))",
          draft: "hsl(var(--status-draft))",
          "draft-foreground": "hsl(var(--status-draft-foreground))",
        },
        whatsapp: {
          DEFAULT: "hsl(var(--whatsapp))",
          foreground: "hsl(var(--whatsapp-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
        },
        appointment: {
          DEFAULT: "hsl(var(--appointment))",
          foreground: "hsl(var(--appointment-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "float": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        "ink-rise": {
          "0%":   { opacity: "0",    transform: "translate(-50%, 30%) scale(0.25) rotate(0deg)",   filter: "blur(50px)" },
          "20%":  { opacity: "0.95", transform: "translate(-50%, -10%) scale(1.1) rotate(4deg)",   filter: "blur(20px)" },
          "45%":  { opacity: "0.9",  transform: "translate(-50%, -55%) scale(1.8) rotate(-3deg)",  filter: "blur(28px)" },
          "70%":  { opacity: "0.55", transform: "translate(-50%, -75%) scale(2.4) rotate(2deg)",   filter: "blur(40px)" },
          "100%": { opacity: "0.18", transform: "translate(-50%, -50%) scale(2.6) rotate(0deg)",   filter: "blur(55px)" },
        },
        "ink-rise-slow": {
          "0%":   { opacity: "0",    transform: "translate(-50%, 40%) scale(0.3) rotate(0deg)",    filter: "blur(60px)" },
          "30%":  { opacity: "0.7",  transform: "translate(-50%, -20%) scale(1.4) rotate(-6deg)",  filter: "blur(28px)" },
          "60%":  { opacity: "0.55", transform: "translate(-50%, -65%) scale(2.2) rotate(5deg)",   filter: "blur(45px)" },
          "100%": { opacity: "0.12", transform: "translate(-50%, -50%) scale(2.9) rotate(0deg)",   filter: "blur(70px)" },
        },
        "ink-splash": {
          "0%":   { opacity: "0",    transform: "translate(-50%, 60%) scaleY(0.4) scaleX(0.8)",    filter: "blur(30px)" },
          "25%":  { opacity: "0.9",  transform: "translate(-50%, -20%) scaleY(1.6) scaleX(1.1)",   filter: "blur(18px)" },
          "60%":  { opacity: "0.5",  transform: "translate(-50%, -90%) scaleY(2.2) scaleX(1.4)",   filter: "blur(35px)" },
          "100%": { opacity: "0",    transform: "translate(-50%, -120%) scaleY(2.6) scaleX(1.6)",  filter: "blur(50px)" },
        },
        "welcome-rise": {
          "0%":   { opacity: "0", transform: "translateY(40px) scale(0.92)", filter: "blur(12px)" },
          "60%":  { opacity: "1", transform: "translateY(0) scale(1)",       filter: "blur(0)" },
          "85%":  { opacity: "1", transform: "translateY(0) scale(1)",       filter: "blur(0)" },
          "100%": { opacity: "0", transform: "translateY(-20px) scale(1.04)",filter: "blur(8px)" },
        },
        "welcome-shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "welcome-line": {
          "0%":   { transform: "scaleX(0)", opacity: "0" },
          "30%":  { transform: "scaleX(1)", opacity: "1" },
          "75%":  { transform: "scaleX(1)", opacity: "1" },
          "100%": { transform: "scaleX(0)", opacity: "0" },
        },
        "btn-sweep": {
          "0%":   { transform: "translateX(-120%) skewX(-20deg)" },
          "50%":  { transform: "translateX(120%) skewX(-20deg)" },
          "100%": { transform: "translateX(-120%) skewX(-20deg)" },
        },
        "marquee": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 1.2s ease-out both",
        "float": "float 4s ease-in-out infinite",
        "ink-rise": "ink-rise 3.2s cubic-bezier(0.22,1,0.36,1) forwards",
        "ink-rise-slow": "ink-rise-slow 3.8s cubic-bezier(0.22,1,0.36,1) forwards",
        "ink-splash": "ink-splash 2.8s cubic-bezier(0.16,1,0.3,1) forwards",
        "welcome-rise": "welcome-rise 4.5s cubic-bezier(0.22,1,0.36,1) forwards",
        "welcome-shimmer": "welcome-shimmer 3.5s linear infinite",
        "welcome-line": "welcome-line 4.5s cubic-bezier(0.22,1,0.36,1) forwards",
        "btn-sweep": "btn-sweep 3.5s cubic-bezier(0.4,0,0.2,1) infinite",
        "marquee": "marquee 50s linear infinite",
        "ken-burns": "ken-burns 15s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;
