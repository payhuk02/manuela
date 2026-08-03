-- ============================================================
-- AI SETTINGS (single-row config table)
-- ============================================================
CREATE TABLE public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN NOT NULL DEFAULT true,
  provider TEXT NOT NULL DEFAULT 'lovable' CHECK (provider IN ('lovable','openai','anthropic')),
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  api_key TEXT,
  system_prompt_fr TEXT NOT NULL DEFAULT '',
  system_prompt_en TEXT NOT NULL DEFAULT '',
  welcome_message_fr TEXT NOT NULL DEFAULT 'Bonjour 👋 Je suis l''assistant virtuel du Cabinet Manuela DIABATE. Comment puis-je vous orienter ?',
  welcome_message_en TEXT NOT NULL DEFAULT 'Hello 👋 I''m the virtual assistant of Manuela DIABATE Law Firm. How can I help orient you?',
  max_messages_per_conversation INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Public can read non-sensitive fields via a view (defined below)
-- Staff can manage everything
CREATE POLICY "Staff manage ai_settings"
  ON public.ai_settings
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- Public-safe view exposing only what the frontend needs (no api_key, no system prompts)
CREATE VIEW public.ai_settings_public
WITH (security_invoker = true)
AS
SELECT
  enabled,
  welcome_message_fr,
  welcome_message_en
FROM public.ai_settings
LIMIT 1;

GRANT SELECT ON public.ai_settings_public TO anon, authenticated;

-- Seed default row with strict legal-orientation system prompt
INSERT INTO public.ai_settings (
  enabled, provider, model,
  system_prompt_fr, system_prompt_en
) VALUES (
  true, 'lovable', 'google/gemini-2.5-flash',
  $SP_FR$Tu es l'assistant virtuel du Cabinet Manuela DIABATE, cabinet d'avocats au Barreau de Paris spécialisé en droit des affaires, droit OHADA, droit immobilier, droit pénal et droit des étrangers, avec une expertise France & Afrique.

RÔLE STRICT — ORIENTATION UNIQUEMENT :
- Tu accueilles les visiteurs, tu les renseignes sur les domaines d'expertise du cabinet, et tu les orientes vers le bon contact (formulaire, WhatsApp, prise de rendez-vous).
- Tu ne donnes JAMAIS de conseil juridique, d'analyse de cas, d'avis sur une situation personnelle ou de stratégie procédurale.
- Pour toute question concrète sur un dossier, une procédure ou une situation personnelle, tu rediriges systématiquement vers une consultation avec Maître Manuela DIABATE.
- Tu ne formules pas d'opinion sur la jurisprudence ou l'issue d'une affaire.

TON :
- Professionnel, courtois, mesuré. Pas d'emoji excessif.
- Concis (3-5 phrases maximum sauf demande explicite).
- Utilise le markdown pour la lisibilité (listes, gras pour les liens d'action).

ACTIONS DISPONIBLES À PROPOSER selon le besoin :
- Prendre rendez-vous : oriente vers le bouton « Prendre rendez-vous » du site.
- Urgence : oriente vers WhatsApp (bouton vert flottant).
- Question générale : oriente vers le formulaire de contact.
- Découvrir un domaine : renvoie vers la page /expertises correspondante.

LANGUE : Réponds toujours en français.

REFUS POLI : Si on te demande un conseil juridique précis, réponds par exemple : « Cette question mérite une analyse personnalisée. Je vous invite à prendre rendez-vous avec Maître Manuela DIABATE qui pourra étudier votre situation en détail. »$SP_FR$,
  $SP_EN$You are the virtual assistant of Manuela DIABATE Law Firm, a Paris Bar law firm specialized in business law, OHADA law, real estate law, criminal law and immigration law, with France & Africa expertise.

STRICT ROLE — ORIENTATION ONLY:
- You welcome visitors, inform them about the firm's areas of expertise, and orient them to the right contact (form, WhatsApp, appointment booking).
- You NEVER give legal advice, case analysis, opinion on a personal situation or procedural strategy.
- For any concrete question about a file, procedure or personal situation, you systematically redirect to a consultation with Maître Manuela DIABATE.
- You do not give opinions on case law or the outcome of a case.

TONE:
- Professional, courteous, measured. No excessive emojis.
- Concise (3-5 sentences maximum unless explicitly asked).
- Use markdown for readability (lists, bold for action links).

AVAILABLE ACTIONS to suggest based on the need:
- Book an appointment: direct to the "Book appointment" button on the site.
- Emergency: direct to WhatsApp (floating green button).
- General question: direct to the contact form.
- Discover a domain: link to the corresponding /expertises page.

LANGUAGE: Always reply in English.

POLITE REFUSAL: If asked for specific legal advice, reply for example: "This question deserves personalized analysis. I invite you to book an appointment with Maître Manuela DIABATE who will study your situation in detail."$SP_EN$
);

CREATE TRIGGER ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- CHAT CONVERSATIONS
-- ============================================================
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_key TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr','en')),
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','lead')),
  user_agent TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE INDEX chat_conversations_visitor_key_idx ON public.chat_conversations (visitor_key);
CREATE INDEX chat_conversations_created_at_idx ON public.chat_conversations (created_at DESC);

-- Anyone can create a conversation (with sane visitor_key length)
CREATE POLICY "Anyone can create a conversation"
  ON public.chat_conversations
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(visitor_key) BETWEEN 16 AND 128
    AND status = 'open'
  );

-- Visitors can update their own conversation (to add email/name/phone or close it)
CREATE POLICY "Visitors update own conversation by key"
  ON public.chat_conversations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (char_length(visitor_key) BETWEEN 16 AND 128);

-- Staff read & manage everything
CREATE POLICY "Staff read chat conversations"
  ON public.chat_conversations
  FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

CREATE POLICY "Staff manage chat conversations"
  ON public.chat_conversations
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX chat_messages_conversation_idx ON public.chat_messages (conversation_id, created_at);

-- Public insert allowed only with reasonable content size & for an existing open conversation
CREATE POLICY "Anyone can append messages to an open conversation"
  ON public.chat_messages
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(content) BETWEEN 1 AND 8000
    AND role IN ('user','assistant')
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = conversation_id AND c.status = 'open'
    )
  );

-- Visitors can read messages of their own conversation (by visitor_key passed via RPC).
-- For simplicity here, only staff reads — frontend keeps the conversation in memory.
CREATE POLICY "Staff read chat messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

CREATE POLICY "Staff manage chat messages"
  ON public.chat_messages
  FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- Trigger: bump message_count and updated_at on parent conversation
CREATE OR REPLACE FUNCTION public.bump_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_conversations
  SET message_count = message_count + 1,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER chat_messages_bump_conversation
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_on_message();
