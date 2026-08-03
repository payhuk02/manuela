import {
  Briefcase,
  Building2,
  Globe2,
  Scale,
  Flame,
  Landmark,
  AlertTriangle,
  Gavel,
  type LucideIcon,
} from "lucide-react";

export const EXPERTISE_ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  Building2,
  Globe2,
  Scale,
  Flame,
  Landmark,
  AlertTriangle,
  Gavel,
};

export const EXPERTISE_ICON_NAMES = Object.keys(EXPERTISE_ICON_MAP);

export const getExpertiseIcon = (name: string): LucideIcon =>
  EXPERTISE_ICON_MAP[name] ?? Briefcase;
