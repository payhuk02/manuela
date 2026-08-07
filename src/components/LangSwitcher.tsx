import { ChevronDown } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "fr" as const, label: "Français", short: "FR" },
  { code: "en" as const, label: "English", short: "EN" },
];

export const LangSwitcher = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const { lang, setLang } = useLang();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const triggerStyle =
    variant === "dark"
      ? "border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground hover:border-primary-foreground/25"
      : "border-primary/10 bg-primary/5 text-primary hover:border-primary/25";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.15em] backdrop-blur-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          triggerStyle
        )}
        aria-label="Choisir la langue"
      >
        {current.short}
        <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[9rem]">
        {LANGUAGES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => setLang(item.code)}
            className={cn(
              "cursor-pointer text-xs tracking-wide",
              lang === item.code && "font-semibold text-primary"
            )}
          >
            {item.short} — {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
