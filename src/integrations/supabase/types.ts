export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_settings: {
        Row: {
          api_key: string | null
          button_color: string
          button_icon_color: string
          enabled: boolean
          id: string
          max_messages_per_conversation: number
          model: string
          provider: string
          system_prompt_en: string
          system_prompt_fr: string
          updated_at: string
          updated_by: string | null
          welcome_message_en: string
          welcome_message_fr: string
        }
        Insert: {
          api_key?: string | null
          button_color?: string
          button_icon_color?: string
          enabled?: boolean
          id?: string
          max_messages_per_conversation?: number
          model?: string
          provider?: string
          system_prompt_en?: string
          system_prompt_fr?: string
          updated_at?: string
          updated_by?: string | null
          welcome_message_en?: string
          welcome_message_fr?: string
        }
        Update: {
          api_key?: string | null
          button_color?: string
          button_icon_color?: string
          enabled?: boolean
          id?: string
          max_messages_per_conversation?: number
          model?: string
          provider?: string
          system_prompt_en?: string
          system_prompt_fr?: string
          updated_at?: string
          updated_by?: string | null
          welcome_message_en?: string
          welcome_message_fr?: string
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          article_id: string
          author_email: string
          author_name: string
          body: string
          created_at: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          article_id: string
          author_email: string
          author_name: string
          body: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          author_email?: string
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article_interaction_counts"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          visitor_key: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          visitor_key: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          visitor_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article_interaction_counts"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_shares: {
        Row: {
          article_id: string
          created_at: string
          id: string
          platform: string
          visitor_key: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          platform?: string
          visitor_key?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          platform?: string
          visitor_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_shares_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "article_interaction_counts"
            referencedColumns: ["article_id"]
          },
          {
            foreignKeyName: "article_shares_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_email: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_email?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_email?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          lang: string
          message_count: number
          status: string
          updated_at: string
          user_agent: string | null
          visitor_email: string | null
          visitor_key: string
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lang?: string
          message_count?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          visitor_email?: string | null
          visitor_key: string
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lang?: string
          message_count?: number
          status?: string
          updated_at?: string
          user_agent?: string | null
          visitor_email?: string | null
          visitor_key?: string
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_info: {
        Row: {
          address: string | null
          appointment_url: string | null
          cabinet_name_en: string | null
          cabinet_name_fr: string | null
          email: string | null
          hours_en: string | null
          hours_fr: string | null
          id: string
          linkedin_url: string | null
          phone: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          appointment_url?: string | null
          cabinet_name_en?: string | null
          cabinet_name_fr?: string | null
          email?: string | null
          hours_en?: string | null
          hours_fr?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          appointment_url?: string | null
          cabinet_name_en?: string | null
          cabinet_name_fr?: string | null
          email?: string | null
          hours_en?: string | null
          hours_fr?: string | null
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          expertise_slug: string | null
          id: string
          lang: string
          message: string
          name: string
          phone: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expertise_slug?: string | null
          id?: string
          lang?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expertise_slug?: string | null
          id?: string
          lang?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      editorial_ai_settings: {
        Row: {
          api_key: string | null
          article_max_words: number
          article_min_words: number
          brand_keywords: string[]
          created_at: string
          enabled: boolean
          firm_context: string
          id: string
          max_retries: number
          model: string
          news_max_words: number
          news_min_words: number
          provider: string
          request_timeout_ms: number
          seo_desc_max: number
          seo_desc_min: number
          seo_title_max: number
          seo_title_min: number
          system_prompt_en: string
          system_prompt_fr: string
          target_audience: string
          temperature: number
          tone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          api_key?: string | null
          article_max_words?: number
          article_min_words?: number
          brand_keywords?: string[]
          created_at?: string
          enabled?: boolean
          firm_context?: string
          id?: string
          max_retries?: number
          model?: string
          news_max_words?: number
          news_min_words?: number
          provider?: string
          request_timeout_ms?: number
          seo_desc_max?: number
          seo_desc_min?: number
          seo_title_max?: number
          seo_title_min?: number
          system_prompt_en?: string
          system_prompt_fr?: string
          target_audience?: string
          temperature?: number
          tone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          api_key?: string | null
          article_max_words?: number
          article_min_words?: number
          brand_keywords?: string[]
          created_at?: string
          enabled?: boolean
          firm_context?: string
          id?: string
          max_retries?: number
          model?: string
          news_max_words?: number
          news_min_words?: number
          provider?: string
          request_timeout_ms?: number
          seo_desc_max?: number
          seo_desc_min?: number
          seo_title_max?: number
          seo_title_min?: number
          system_prompt_en?: string
          system_prompt_fr?: string
          target_audience?: string
          temperature?: number
          tone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      expertises: {
        Row: {
          approach: string
          conclusion: string
          created_at: string
          faq: Json
          icon: string
          id: string
          image_url: string | null
          intro: string
          methodology: Json
          og_image_url: string | null
          published: boolean
          sections: Json
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          tagline: string
          title: string
          updated_at: string
        }
        Insert: {
          approach?: string
          conclusion?: string
          created_at?: string
          faq?: Json
          icon?: string
          id?: string
          image_url?: string | null
          intro?: string
          methodology?: Json
          og_image_url?: string | null
          published?: boolean
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          tagline?: string
          title?: string
          updated_at?: string
        }
        Update: {
          approach?: string
          conclusion?: string
          created_at?: string
          faq?: Json
          icon?: string
          id?: string
          image_url?: string | null
          intro?: string
          methodology?: Json
          og_image_url?: string | null
          published?: boolean
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          tagline?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      founder_profile_items: {
        Row: {
          category: string
          color: string
          created_at: string
          icon: string
          id: string
          meta: string
          published: boolean
          sort_order: number
          subtitle_en: string
          subtitle_fr: string
          title_en: string
          title_fr: string
          updated_at: string
        }
        Insert: {
          category: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          meta?: string
          published?: boolean
          sort_order?: number
          subtitle_en?: string
          subtitle_fr?: string
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          meta?: string
          published?: boolean
          sort_order?: number
          subtitle_en?: string
          subtitle_fr?: string
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          city: string
          content_en: string
          content_fr: string
          country: string
          country_code: string
          created_at: string
          expertise_slug: string | null
          h1_en: string
          h1_fr: string
          id: string
          image_url: string | null
          intro_en: string
          intro_fr: string
          meta_description_en: string
          meta_description_fr: string
          published: boolean
          slug: string
          sort_order: number
          title_en: string
          title_fr: string
          updated_at: string
        }
        Insert: {
          city?: string
          content_en?: string
          content_fr?: string
          country?: string
          country_code?: string
          created_at?: string
          expertise_slug?: string | null
          h1_en?: string
          h1_fr?: string
          id?: string
          image_url?: string | null
          intro_en?: string
          intro_fr?: string
          meta_description_en?: string
          meta_description_fr?: string
          published?: boolean
          slug: string
          sort_order?: number
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Update: {
          city?: string
          content_en?: string
          content_fr?: string
          country?: string
          country_code?: string
          created_at?: string
          expertise_slug?: string | null
          h1_en?: string
          h1_fr?: string
          id?: string
          image_url?: string | null
          intro_en?: string
          intro_fr?: string
          meta_description_en?: string
          meta_description_fr?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          body: string
          category: string
          content_type: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          images: Json
          lang: string
          og_image_url: string | null
          published: boolean
          published_date: string
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          category?: string
          content_type?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          images?: Json
          lang?: string
          og_image_url?: string | null
          published?: boolean
          published_date?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          content_type?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          images?: Json
          lang?: string
          og_image_url?: string | null
          published?: boolean
          published_date?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          id: string
          key: string
          lang: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          lang: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          lang?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio_en: string
          bio_fr: string
          created_at: string
          cv_url: string | null
          email: string | null
          id: string
          is_founder: boolean
          linkedin_url: string | null
          name: string
          office_address: string | null
          phone: string | null
          photo_url: string | null
          presentation_en: string
          presentation_fr: string
          published: boolean
          role_en: string
          role_fr: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio_en?: string
          bio_fr?: string
          created_at?: string
          cv_url?: string | null
          email?: string | null
          id?: string
          is_founder?: boolean
          linkedin_url?: string | null
          name?: string
          office_address?: string | null
          phone?: string | null
          photo_url?: string | null
          presentation_en?: string
          presentation_fr?: string
          published?: boolean
          role_en?: string
          role_fr?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio_en?: string
          bio_fr?: string
          created_at?: string
          cv_url?: string | null
          email?: string | null
          id?: string
          is_founder?: boolean
          linkedin_url?: string | null
          name?: string
          office_address?: string | null
          phone?: string | null
          photo_url?: string | null
          presentation_en?: string
          presentation_fr?: string
          published?: boolean
          role_en?: string
          role_fr?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      article_interaction_counts: {
        Row: {
          article_id: string | null
          comments_count: number | null
          likes_count: number | null
          shares_count: number | null
        }
        Relationships: []
      }
      team_members_public: {
        Row: {
          bio_en: string | null
          bio_fr: string | null
          created_at: string | null
          cv_url: string | null
          id: string | null
          is_founder: boolean | null
          linkedin_url: string | null
          name: string | null
          photo_url: string | null
          presentation_en: string | null
          presentation_fr: string | null
          published: boolean | null
          role_en: string | null
          role_fr: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          bio_en?: string | null
          bio_fr?: string | null
          created_at?: string | null
          cv_url?: string | null
          id?: string | null
          is_founder?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          presentation_en?: string | null
          presentation_fr?: string | null
          published?: boolean | null
          role_en?: string | null
          role_fr?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          bio_en?: string | null
          bio_fr?: string | null
          created_at?: string | null
          cv_url?: string | null
          id?: string | null
          is_founder?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          presentation_en?: string | null
          presentation_fr?: string | null
          published?: boolean | null
          role_en?: string | null
          role_fr?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      attach_visitor_info: {
        Args: {
          _conversation_id: string
          _email?: string
          _name?: string
          _phone?: string
          _visitor_key: string
        }
        Returns: undefined
      }
      get_article_comments: {
        Args: { _article_id: string }
        Returns: {
          author_name: string
          body: string
          created_at: string
          id: string
        }[]
      }
      get_article_interactions: {
        Args: { _article_id: string; _visitor_key?: string }
        Returns: {
          comments_count: number
          liked: boolean
          likes_count: number
          shares_count: number
        }[]
      }
      get_chatbot_public_settings: {
        Args: never
        Returns: {
          button_color: string
          button_icon_color: string
          enabled: boolean
          welcome_message_en: string
          welcome_message_fr: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      record_article_share: {
        Args: { _article_id: string; _platform?: string; _visitor_key?: string }
        Returns: number
      }
      set_article_like: {
        Args: { _article_id: string; _liked: boolean; _visitor_key: string }
        Returns: {
          liked: boolean
          likes_count: number
        }[]
      }
      slugify: { Args: { _input: string }; Returns: string }
      submit_article_comment: {
        Args: {
          _article_id: string
          _author_email: string
          _author_name: string
          _body: string
        }
        Returns: string
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
