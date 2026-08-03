// Extends the auto-generated Supabase Database type with custom views
// that aren't picked up by the type generator (e.g. SECURITY INVOKER views).
//
// This file is hand-maintained — keep it in sync with public views you create
// in migrations. The generated `types.ts` is read-only and gets overwritten,
// so we layer our own types on top here.

import type { Database as GeneratedDatabase } from "./types";

type PublicSchema = GeneratedDatabase["public"];

export type TeamMemberPublicRow = {
  id: string;
  name: string;
  role_fr: string;
  role_en: string;
  bio_fr: string;
  bio_en: string;
  presentation_fr: string;
  presentation_en: string;
  photo_url: string | null;
  cv_url: string | null;
  linkedin_url: string | null;
  is_founder: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<PublicSchema, "Views"> & {
    Views: PublicSchema["Views"] & {
      team_members_public: {
        Row: TeamMemberPublicRow;
        Relationships: [];
      };
    };
  };
};
