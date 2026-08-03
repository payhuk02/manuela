import {
  Scale,
  Lock,
  Target,
  Award,
  ShieldCheck,
  Gem,
  Crown,
  Compass,
  Star,
  Handshake,
  Eye,
  Feather,
  type LucideIcon,
} from "lucide-react";

export const VALUE_ICON_MAP: Record<string, LucideIcon> = {
  Scale,
  Lock,
  Target,
  Award,
  ShieldCheck,
  Gem,
  Crown,
  Compass,
  Star,
  Handshake,
  Eye,
  Feather,
};

export const VALUE_ICON_OPTIONS = Object.keys(VALUE_ICON_MAP).map((name) => ({
  value: name,
  label: name,
}));

export const getValueIcon = (name: string): LucideIcon =>
  VALUE_ICON_MAP[name] ?? Scale;
