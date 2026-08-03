import { useEffect } from "react";
import { useSite } from "@/hooks/SiteDataContext";

function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const SiteThemeInjector = () => {
  const { textOverrides } = useSite();

  useEffect(() => {
    // 1. Appliquer les couleurs
    const primaryHex = textOverrides["theme.color.primary::fr"];
    const accentHex = textOverrides["theme.color.accent::fr"];

    if (primaryHex) {
      const hsl = hexToHsl(primaryHex);
      document.documentElement.style.setProperty('--primary', hsl);
      document.documentElement.style.setProperty('--appointment', hsl);
      document.documentElement.style.setProperty('--ring', hsl);
      
      // Compute a darker shadow-gold version based on primary
      document.documentElement.style.setProperty('--shadow-gold', `0 20px 50px -20px hsl(${hsl} / 0.3)`);
      document.documentElement.style.setProperty('--gradient-gold', `linear-gradient(135deg, hsl(${hsl}) 0%, hsl(${hsl} / 0.7) 100%)`);
    } else {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--appointment');
      document.documentElement.style.removeProperty('--ring');
      document.documentElement.style.removeProperty('--shadow-gold');
      document.documentElement.style.removeProperty('--gradient-gold');
    }

    if (accentHex) {
      const hsl = hexToHsl(accentHex);
      document.documentElement.style.setProperty('--accent', hsl);
    } else {
      document.documentElement.style.removeProperty('--accent');
    }

    // 2. Appliquer le Favicon
    const faviconUrl = textOverrides["theme.favicon::fr"];
    if (faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [textOverrides]);

  return null;
};
