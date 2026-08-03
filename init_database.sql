-- Initialisation de la base de données (Cabinet Manuela DIABATE)

-- Migration: 20260421021534_909700b8-15d5-4f5f-bc3e-6c144c5ff723.sql
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'))
$$;

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Site content (key/lang/value)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('fr','en')),
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, lang)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_content" ON public.site_content;
CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff write site_content" ON public.site_content;
CREATE POLICY "Staff write site_content" ON public.site_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- News
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL CHECK (lang IN ('fr','en')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published news" ON public.news_articles;
CREATE POLICY "Public read published news" ON public.news_articles FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Staff read all news" ON public.news_articles;
CREATE POLICY "Staff read all news" ON public.news_articles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff manage news" ON public.news_articles;
CREATE POLICY "Staff manage news" ON public.news_articles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Team
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_fr TEXT NOT NULL DEFAULT '',
  role_en TEXT NOT NULL DEFAULT '',
  bio_fr TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  presentation_fr TEXT NOT NULL DEFAULT '',
  presentation_en TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  cv_url TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  office_address TEXT,
  is_founder BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read team" ON public.team_members;
CREATE POLICY "Public read team" ON public.team_members FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Staff read all team" ON public.team_members;
CREATE POLICY "Staff read all team" ON public.team_members FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff manage team" ON public.team_members;
CREATE POLICY "Staff manage team" ON public.team_members FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_team_updated BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Contact info (singleton row)
CREATE TABLE public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL DEFAULT '',
  hours_fr TEXT NOT NULL DEFAULT '',
  hours_en TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  appointment_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read contact" ON public.contact_info;
CREATE POLICY "Public read contact" ON public.contact_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage contact" ON public.contact_info;
CREATE POLICY "Staff manage contact" ON public.contact_info FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_contact_updated BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.contact_info (address, hours_fr, hours_en, email, phone, whatsapp_number, appointment_url)
VALUES ('12 avenue Foch, 75116 Paris', 'Lun – Ven · 9h – 19h', 'Mon – Fri · 9am – 7pm', 'contact@maison-aurelius.fr', '+33 1 00 00 00 00', '33600000000', 'https://calendly.com/maison-aurelius');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images','site-images', true);

DROP POLICY IF EXISTS "Public read site-images" ON storage.objects;
CREATE POLICY "Public read site-images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
DROP POLICY IF EXISTS "Staff upload site-images" ON storage.objects;
CREATE POLICY "Staff upload site-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff update site-images" ON storage.objects;
CREATE POLICY "Staff update site-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff delete site-images" ON storage.objects;
CREATE POLICY "Staff delete site-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));


-- Migration: 20260421021547_ecd3e165-ea9a-427d-b95c-23828cde19aa.sql
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- The lint flags broad SELECT on storage.objects for public bucket. 
-- Files are still accessible by direct URL via the public CDN endpoint regardless of RLS.
-- We keep SELECT restricted to staff to prevent enumeration; public access uses /object/public/ URLs.
DROP POLICY IF EXISTS "Public read site-images" ON storage.objects;
DROP POLICY IF EXISTS "Staff list site-images" ON storage.objects;
CREATE POLICY "Staff list site-images" ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));


-- Migration: 20260421043823_ae24500d-75b1-4a9c-8af7-1feb6c7d231c.sql
-- Create expertises table
CREATE TABLE public.expertises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  tagline TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  conclusion TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  approach TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  methodology JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expertises ENABLE ROW LEVEL SECURITY;

-- Public can read published expertises
DROP POLICY IF EXISTS "Public read published expertises" ON public.expertises;
CREATE POLICY "Public read published expertises"
  ON public.expertises FOR SELECT
  USING (published = true);

-- Staff can read all expertises (drafts included)
DROP POLICY IF EXISTS "Staff read all expertises" ON public.expertises;
CREATE POLICY "Staff read all expertises"
  ON public.expertises FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

-- Staff can manage expertises
DROP POLICY IF EXISTS "Staff manage expertises" ON public.expertises;
CREATE POLICY "Staff manage expertises"
  ON public.expertises FOR ALL
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

-- Auto-update updated_at
CREATE TRIGGER set_expertises_updated_at
  BEFORE UPDATE ON public.expertises
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_set_updated_at();

-- Index on slug for fast lookups
CREATE INDEX idx_expertises_slug ON public.expertises(slug);
CREATE INDEX idx_expertises_sort_order ON public.expertises(sort_order);


-- Migration: 20260421045206_f4c83eef-42fd-4b3c-a1bf-e8694270804e.sql
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id text,
  target_email text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX idx_audit_log_actor ON public.audit_log (actor_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read audit log" ON public.audit_log;
CREATE POLICY "Admins read audit log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No insert/update/delete policies: only service role (edge functions) writes.


-- Migration: 20260421092736_f56b06b3-4d51-4aac-b872-feb0ccb7a2d5.sql
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '';

-- Migration: 20260421094103_730b1ef2-0dd5-4563-b289-a02e6413a62f.sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'agenceedigit@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Migration: 20260422041101_177e5ac9-1538-49e0-b5ca-85583fede746.sql
-- Supprimer l'expertise vide actuelle
DELETE FROM public.expertises WHERE slug = 'nouvelle-expertise-1776776055062';

-- Restaurer les 8 expertises par défaut
INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, methodology, faq, sort_order, published) VALUES
(
  'droit-des-affaires',
  'Droit des Affaires',
  'Briefcase',
  'Sécuriser et structurer vos opérations économiques',
  'Le Cabinet accompagne entrepreneurs, dirigeants et investisseurs dans la structuration, la sécurisation et le développement de leurs activités économiques. De la création à la transmission, chaque décision juridique est pensée comme un levier stratégique.',
  'Notre approche conjugue rigueur juridique et compréhension des enjeux économiques. Nous intervenons en conseil comme en contentieux, avec un souci constant de pragmatisme et de confidentialité.',
  'Faire du droit un atout au service de la performance et de la pérennité de votre entreprise.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  1, true
),
(
  'droit-bancaire-et-financier',
  'Droit Bancaire et Financier',
  'Landmark',
  'Maîtriser la complexité des opérations bancaires et financières',
  'Le Cabinet conseille banques, établissements financiers, entreprises et particuliers sur l''ensemble des problématiques bancaires, du financement à la résolution des contentieux les plus complexes.',
  'Une expertise pointue couplée à une connaissance fine des pratiques de place et des régulateurs, pour des solutions sur mesure et opérationnelles.',
  'Sécuriser vos opérations financières et défendre efficacement vos intérêts dans un environnement réglementaire exigeant.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  2, true
),
(
  'surendettement-et-procedure-collective',
  'Surendettement et Procédures Collectives',
  'AlertTriangle',
  'Anticiper, prévenir et traiter les difficultés des entreprises',
  'Le Cabinet intervient à toutes les étapes des difficultés économiques : prévention, conciliation, sauvegarde, redressement et liquidation judiciaire, aux côtés des dirigeants, créanciers ou repreneurs.',
  'Une intervention rapide, stratégique et discrète, pour préserver la valeur de l''entreprise et protéger les intérêts en présence.',
  'Transformer une situation de crise en opportunité de redressement durable.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  3, true
),
(
  'droit-ohada',
  'Droit OHADA',
  'Globe2',
  'Naviguer les Actes uniformes au service de vos opérations africaines',
  'Le Cabinet maîtrise l''ensemble du corpus OHADA et accompagne ses clients dans leurs opérations transfrontalières au sein des 17 États membres : sociétés, sûretés, recouvrement, arbitrage, voies d''exécution.',
  'Une lecture experte des Actes uniformes et de la jurisprudence de la CCJA, au service de stratégies juridiques adaptées au contexte africain.',
  'Faire de l''espace OHADA un terrain de croissance maîtrisée pour vos investissements.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  4, true
),
(
  'droit-immobilier',
  'Droit Immobilier',
  'Building2',
  'Sécuriser vos projets immobiliers, du foncier à la gestion',
  'Acquisitions, baux, copropriété, promotion immobilière, contentieux locatifs ou de construction : le Cabinet accompagne particuliers, investisseurs et professionnels dans toutes leurs problématiques immobilières.',
  'Une approche transversale alliant droit civil, fiscal et administratif, pour des opérations immobilières maîtrisées.',
  'Donner à vos projets immobiliers la sécurité juridique qu''ils méritent.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  5, true
),
(
  'droit-penal-et-droit-penal-des-affaires',
  'Droit Pénal et Pénal des Affaires',
  'Gavel',
  'Défendre vos droits avec rigueur, discrétion et engagement',
  'Le Cabinet assure la défense de personnes physiques et morales dans des dossiers pénaux classiques comme dans des contentieux pénaux des affaires sensibles : abus de biens sociaux, blanchiment, corruption, fraude fiscale.',
  'Une stratégie de défense construite, anticipée et adaptée à chaque dossier, dans le respect absolu du secret professionnel.',
  'Faire valoir vos droits avec détermination, à chaque étape de la procédure.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  6, true
),
(
  'droit-des-etrangers',
  'Droit des Étrangers',
  'Scale',
  'Accompagner vos démarches de séjour, de travail et de nationalité',
  'Le Cabinet conseille particuliers et entreprises sur les questions d''immigration : titres de séjour, regroupement familial, naturalisation, contentieux administratifs et recours.',
  'Une connaissance approfondie de la pratique administrative et juridictionnelle, pour des dossiers traités avec humanité et efficacité.',
  'Sécuriser votre projet de vie ou de mobilité internationale.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  7, true
),
(
  'droit-petrolier-et-minier',
  'Droit Pétrolier et Minier',
  'Flame',
  'Conseiller les acteurs des industries extractives',
  'Le Cabinet accompagne opérateurs, États et investisseurs sur l''ensemble du cycle des projets pétroliers, gaziers et miniers : contrats d''exploration, partage de production, fiscalité, contentieux et arbitrage.',
  'Une expertise sectorielle pointue, à l''interface du droit, de la finance et de la géopolitique.',
  'Sécuriser vos investissements dans un secteur stratégique et hautement régulé.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  8, true
) ON CONFLICT (slug) DO NOTHING;

-- Migration: 20260422041955_e03a9455-105c-4292-a0be-42d697a3657b.sql
UPDATE public.expertises SET sections = '[{"title":"Création et structuration","items":["Choix de la forme sociale (SARL, SA, SAS, SCI)","Rédaction des statuts et pactes d''associés","Constitution et formalités d''immatriculation","Conventions de financement et apports en compte courant"]},{"title":"Vie sociale et gouvernance","items":["Assemblées générales ordinaires et extraordinaires","Cession de parts sociales et d''actions","Restructurations, fusions, acquisitions","Conventions réglementées et conflits d''intérêts"]},{"title":"Contrats commerciaux","items":["Contrats de distribution, agence et franchise","Conditions générales de vente et d''achat","Partenariats stratégiques et joint-ventures","Négociation et rédaction sur mesure"]},{"title":"Contentieux des affaires","items":["Litiges entre associés et dirigeants","Recouvrement de créances commerciales","Concurrence déloyale et parasitisme","Responsabilité civile et pénale du dirigeant"]}]'::jsonb, methodology = '[{"title":"Audit initial","description":"Analyse approfondie de votre situation, de vos enjeux économiques et de vos objectifs stratégiques."},{"title":"Stratégie sur mesure","description":"Élaboration d''un plan d''action juridique adapté à votre activité et au contexte de votre marché."},{"title":"Mise en œuvre","description":"Rédaction des actes, négociation et accompagnement opérationnel à chaque étape clé."},{"title":"Suivi continu","description":"Veille juridique, conseil récurrent et anticipation des risques tout au long du cycle de vie de l''entreprise."}]'::jsonb, faq = '[{"question":"Quel statut juridique choisir pour créer mon entreprise en Côte d''Ivoire ?","answer":"Le choix dépend de votre activité, du nombre d''associés, de vos besoins de financement et du régime fiscal recherché. La SARL convient aux PME, la SA aux structures importantes, la SAS offre une grande souplesse statutaire."},{"question":"Quand faut-il rédiger un pacte d''associés ?","answer":"Dès la constitution ou lors de l''entrée d''un nouvel investisseur. Le pacte organise la gouvernance, les conditions de cession des titres, les clauses de sortie et de protection des minoritaires."},{"question":"Comment sécuriser mes contrats commerciaux ?","answer":"Une rédaction rigoureuse intégrant clauses de responsabilité, de résiliation, de force majeure, de propriété intellectuelle et de règlement des litiges est indispensable."},{"question":"Que faire en cas de litige avec un associé ?","answer":"Nous privilégions une approche graduée : médiation, négociation transactionnelle, puis si nécessaire procédure contentieuse devant les juridictions compétentes ou arbitrage CCJA."}]'::jsonb WHERE slug = 'droit-des-affaires';

UPDATE public.expertises SET sections = '[{"title":"Financement et crédit","items":["Conventions de crédit et lignes de financement","Crédits syndiqués et financements structurés","Sûretés réelles et personnelles (hypothèques, cautions, nantissements)","Financement de projet et financement export"]},{"title":"Réglementation bancaire","items":["Conformité BCEAO et réglementation prudentielle","Lutte contre le blanchiment et financement du terrorisme","Protection du consommateur de services financiers","Agréments et licences bancaires"]},{"title":"Marchés financiers","items":["Émissions obligataires et opérations de marché","Documentation BRVM et opérations boursières","Contrats de placement et produits dérivés","Gouvernance des établissements financiers"]},{"title":"Contentieux bancaire","items":["Recouvrement de créances et voies d''exécution","Contentieux du crédit et responsabilité du banquier","Réalisation des sûretés","Défense en procédure de saisie immobilière"]}]'::jsonb, methodology = '[{"title":"Cadrage réglementaire","description":"Identification du cadre juridique applicable (UMOA, BCEAO, droit national) et des contraintes prudentielles."},{"title":"Structuration","description":"Conception de l''architecture juridique et fiscale de l''opération bancaire ou financière."},{"title":"Documentation","description":"Rédaction et négociation des conventions, sûretés et garanties associées."},{"title":"Sécurisation post-closing","description":"Suivi des conditions suspensives, formalités de publicité et accompagnement en cas de défaut."}]'::jsonb, faq = '[{"question":"Quelles sûretés privilégier pour garantir un crédit important ?","answer":"Hypothèque conventionnelle pour l''immobilier, nantissement de fonds de commerce ou de titres, cautionnement personnel ou solidaire, gage sans dépossession : nous structurons un dispositif sur mesure conforme aux Actes uniformes OHADA."},{"question":"Comment contester une décision de la banque ?","answer":"Tout dépend du grief : rupture abusive de crédit, manquement au devoir de mise en garde, taux usuraire, refus discriminatoire. Nous évaluons les fondements juridiques et engageons une démarche amiable ou contentieuse."},{"question":"Quelles sont les obligations LCB-FT pour mon établissement ?","answer":"Connaissance client (KYC), classification des risques, déclaration de soupçon à la CENTIF, formation du personnel et fonction conformité dédiée. Nous accompagnons la rédaction des procédures internes et les audits."},{"question":"Comment réaliser efficacement une garantie en cas de défaillance ?","answer":"La réalisation d''une sûreté obéit à des règles strictes (commandement, sommation, vente forcée). Une mauvaise procédure peut faire perdre la garantie. Notre cabinet pilote l''ensemble du processus."}]'::jsonb WHERE slug = 'droit-bancaire-et-financier';

UPDATE public.expertises SET sections = '[{"title":"Prévention des difficultés","items":["Audit de la situation financière et juridique","Mandat ad hoc et mission de conciliation","Renégociation amiable de la dette","Plans de restructuration opérationnelle"]},{"title":"Procédures collectives","items":["Règlement préventif (Acte uniforme OHADA)","Redressement judiciaire et plan de continuation","Liquidation des biens","Cession totale ou partielle d''entreprise"]},{"title":"Défense des créanciers","items":["Déclaration et vérification des créances","Contestation des décisions du syndic","Revendication de biens et actions en restitution","Suivi des répartitions et clôture"]},{"title":"Responsabilité des dirigeants","items":["Action en comblement de passif","Faillite personnelle et interdiction de gérer","Banqueroute et infractions assimilées","Stratégie de défense individuelle"]}]'::jsonb, methodology = '[{"title":"Diagnostic d''urgence","description":"Évaluation rapide de la trésorerie, du passif exigible et des options légales encore ouvertes."},{"title":"Choix de la procédure","description":"Sélection de l''outil juridique adapté : conciliation, règlement préventif, redressement ou liquidation."},{"title":"Pilotage de la procédure","description":"Représentation devant le tribunal, négociation avec les créanciers et le syndic, élaboration du plan."},{"title":"Sortie et reconstruction","description":"Accompagnement de la mise en œuvre du plan, levée des interdictions et relance d''activité."}]'::jsonb, faq = '[{"question":"Quand déclencher une procédure collective ?","answer":"Dès l''apparition de difficultés sérieuses, et au plus tard dans les 30 jours suivant la cessation des paiements. Plus l''intervention est précoce, plus les options de sauvetage sont nombreuses."},{"question":"Quelle différence entre règlement préventif, redressement et liquidation ?","answer":"Le règlement préventif intervient avant la cessation des paiements et reste confidentiel. Le redressement vise la sauvegarde d''une entreprise viable. La liquidation organise la vente des actifs."},{"question":"Comment protéger ma responsabilité personnelle en tant que dirigeant ?","answer":"En agissant tôt, en documentant les décisions de gestion, en respectant l''obligation de déclaration de cessation des paiements et en évitant toute confusion de patrimoine."},{"question":"En tant que créancier, comment maximiser mes chances de recouvrement ?","answer":"Déclarer la créance dans les délais avec justificatifs complets, faire valoir les sûretés ou privilèges, suivre activement la procédure et contester les décisions défavorables."}]'::jsonb WHERE slug = 'surendettement-et-procedure-collective';

UPDATE public.expertises SET sections = '[{"title":"Droit des sociétés OHADA","items":["Constitution et transformation de sociétés","Augmentations et réductions de capital","Fusions, scissions et apports partiels d''actifs","Gouvernance et responsabilité des dirigeants"]},{"title":"Sûretés et garanties","items":["Hypothèques, nantissements et gages","Cautionnement et garantie autonome","Privilèges et droits de rétention","Inscription et publicité des sûretés au RCCM"]},{"title":"Recouvrement et voies d''exécution","items":["Injonction de payer et procédures simplifiées","Saisies conservatoires et saisies-attribution","Saisie immobilière et adjudication","Exécution transfrontalière des décisions"]},{"title":"Arbitrage CCJA","items":["Rédaction de clauses compromissoires","Représentation devant la CCJA","Recours en cassation contre les arrêts d''appel","Exequatur des sentences arbitrales"]}]'::jsonb, methodology = '[{"title":"Cartographie juridictionnelle","description":"Identification des Actes uniformes applicables et des juridictions compétentes selon les États concernés."},{"title":"Stratégie OHADA","description":"Conception de solutions tenant compte des spécificités locales et de la jurisprudence CCJA."},{"title":"Exécution coordonnée","description":"Mise en œuvre des opérations dans plusieurs États membres avec correspondants locaux qualifiés."},{"title":"Veille jurisprudentielle","description":"Suivi continu des évolutions de la CCJA et adaptation des stratégies en conséquence."}]'::jsonb, faq = '[{"question":"Quels sont les pays membres de l''OHADA ?","answer":"L''OHADA regroupe 17 États africains : Bénin, Burkina Faso, Cameroun, Centrafrique, Comores, Congo, Côte d''Ivoire, Gabon, Guinée, Guinée-Bissau, Guinée Équatoriale, Mali, Niger, RDC, Sénégal, Tchad et Togo."},{"question":"Quel est le rôle de la CCJA ?","answer":"La Cour Commune de Justice et d''Arbitrage est juridiction suprême en matière d''interprétation des Actes uniformes et institution d''arbitrage. Ses arrêts s''imposent dans les 17 États membres."},{"question":"Comment recouvrer une créance dans plusieurs pays OHADA ?","answer":"L''Acte uniforme sur les voies d''exécution prévoit des procédures harmonisées (injonction de payer, saisies). Les décisions bénéficient d''une circulation facilitée moyennant exequatur."},{"question":"Faut-il privilégier l''arbitrage CCJA ou une juridiction étatique ?","answer":"L''arbitrage CCJA offre confidentialité, célérité et exécution facilitée dans toute la zone OHADA. Il convient particulièrement aux contrats d''affaires internationaux."}]'::jsonb WHERE slug = 'droit-ohada';

UPDATE public.expertises SET sections = '[{"title":"Acquisition et vente","items":["Audit juridique et titre de propriété","Promesses et compromis de vente","Sécurisation du financement et des conditions suspensives","Acte authentique et formalités foncières"]},{"title":"Promotion et construction","items":["Vente en l''état futur d''achèvement (VEFA)","Contrats de construction et marchés de travaux","Garanties d''achèvement et de parfait achèvement","Contentieux de la construction et expertises"]},{"title":"Baux et gestion locative","items":["Baux d''habitation, professionnels et commerciaux","Renouvellement, résiliation et indemnité d''éviction","Recouvrement des loyers et expulsion","Copropriété et syndic"]},{"title":"Foncier et urbanisme","items":["Régime des terres coutumières et titres fonciers","Permis de construire et autorisations administratives","Expropriation pour cause d''utilité publique","Servitudes et bornage"]}]'::jsonb, methodology = '[{"title":"Vérification du titre","description":"Audit complet du titre de propriété, des inscriptions hypothécaires et de la conformité urbanistique."},{"title":"Sécurisation contractuelle","description":"Rédaction d''actes adaptés intégrant toutes les garanties nécessaires à votre projet."},{"title":"Accompagnement notarial","description":"Coordination avec le notaire et suivi des formalités de publicité foncière."},{"title":"Défense en cas de litige","description":"Représentation devant les juridictions civiles et administratives pour tout contentieux immobilier."}]'::jsonb, faq = '[{"question":"Comment vérifier qu''un terrain est libre de tout litige avant achat ?","answer":"Une consultation du livre foncier et du Registre du Commerce permet de vérifier le titre, les hypothèques et les inscriptions. Pour les terres coutumières, des vérifications complémentaires auprès des autorités locales sont indispensables."},{"question":"Quels recours en cas de malfaçon dans une construction neuve ?","answer":"Selon la nature du désordre : garantie de parfait achèvement (1 an), garantie biennale ou décennale. Une expertise judiciaire est souvent nécessaire pour caractériser et chiffrer les désordres."},{"question":"Comment résilier un bail commercial ?","answer":"La résiliation suit des règles strictes selon le motif (impayés, manquement, non-renouvellement). Un congé donné dans les formes légales et un éventuel recours au juge sont nécessaires."},{"question":"Que faire en cas d''expropriation de mon bien ?","answer":"Vous pouvez contester tant le principe (utilité publique) que l''indemnité proposée. Des recours administratifs et juridictionnels sont possibles. Il est crucial d''agir dans les délais."}]'::jsonb WHERE slug = 'droit-immobilier';

UPDATE public.expertises SET sections = '[{"title":"Pénal général","items":["Garde à vue et défense en première heure","Instruction préparatoire et débats","Procès devant le tribunal correctionnel et la cour d''assises","Recours en appel et en cassation"]},{"title":"Pénal des affaires","items":["Abus de biens sociaux et abus de confiance","Escroquerie, faux et usage de faux","Délits boursiers et manipulation de cours","Corruption et trafic d''influence"]},{"title":"Délinquance économique et financière","items":["Blanchiment de capitaux et financement du terrorisme","Fraude fiscale et douanière","Banqueroute et infractions à la législation des sociétés","Cybercriminalité et atteintes aux STAD"]},{"title":"Droits des victimes","items":["Dépôt de plainte et constitution de partie civile","Évaluation et chiffrage du préjudice","Représentation à l''audience","Exécution de la décision et indemnisation"]}]'::jsonb, methodology = '[{"title":"Intervention immédiate","description":"Présence dès la garde à vue ou les premières auditions pour préserver vos droits fondamentaux."},{"title":"Analyse du dossier","description":"Étude exhaustive de la procédure, identification des nullités et des moyens de défense."},{"title":"Stratégie de défense","description":"Construction d''une ligne de défense cohérente, choix des expertises et des témoins."},{"title":"Plaidoirie et recours","description":"Représentation à l''audience avec une plaidoirie engagée et exercice de toutes les voies de recours."}]'::jsonb, faq = '[{"question":"Que faire en cas de garde à vue ?","answer":"Demandez immédiatement l''assistance d''un avocat. Vous avez droit au silence, à un examen médical, à prévenir un proche et à un interprète. Notre cabinet intervient sur appel d''urgence dès la première heure."},{"question":"Mon entreprise fait l''objet d''une enquête pénale, comment réagir ?","answer":"Faites immédiatement appel à un conseil pour piloter les réquisitions, perquisitions et auditions. Une stratégie globale doit être mise en place pour préserver l''activité et limiter les risques pour les dirigeants."},{"question":"Comment me constituer partie civile ?","answer":"Soit par voie d''action (plainte avec constitution devant le doyen des juges d''instruction), soit par voie d''intervention au cours du procès. Cette démarche permet de demander réparation."},{"question":"Quelle différence entre abus de biens sociaux et abus de confiance ?","answer":"L''abus de biens sociaux concerne les dirigeants de sociétés commerciales qui usent des biens sociaux à des fins personnelles. L''abus de confiance vise plus largement le détournement d''un bien remis à charge de le restituer."}]'::jsonb WHERE slug = 'droit-penal-et-droit-penal-des-affaires';

UPDATE public.expertises SET sections = '[{"title":"Titres de séjour","items":["Visa long séjour et premier titre","Carte de résident et carte permanente","Renouvellement et changement de statut","Régularisation administrative"]},{"title":"Famille et regroupement","items":["Regroupement familial et procédure consulaire","Mariage avec un ressortissant national","Reconnaissance d''enfant et autorité parentale","Protection des conjoints et enfants"]},{"title":"Travail et investissement","items":["Autorisation de travail pour salariés expatriés","Carte de commerçant étranger","Investisseurs et créateurs d''entreprise","Mobilité intra-groupe et détachement"]},{"title":"Contentieux et recours","items":["Recours contre les refus de titre","Contestation des obligations de quitter le territoire","Référés-suspension et référés-liberté","Demandes de nationalité et naturalisation"]}]'::jsonb, methodology = '[{"title":"Évaluation du dossier","description":"Analyse de votre situation personnelle, professionnelle et familiale pour identifier la voie juridique optimale."},{"title":"Constitution du dossier","description":"Préparation rigoureuse des pièces, traductions assermentées et formalités préalables."},{"title":"Suivi administratif","description":"Dépôt, suivi et relances auprès des autorités compétentes (préfecture, consulat, ministère)."},{"title":"Recours en cas de refus","description":"Engagement des procédures gracieuses et contentieuses dans les délais légaux."}]'::jsonb, faq = '[{"question":"Quel titre de séjour demander selon ma situation ?","answer":"Le choix dépend du motif (travail, études, famille, investissement) et de votre durée d''installation. Carte temporaire, résident, titre pluriannuel : chaque catégorie obéit à des conditions précises."},{"question":"Que faire après un refus de titre de séjour ?","answer":"Vous disposez de deux mois pour exercer un recours gracieux ou hiérarchique, et d''un délai parallèle pour saisir le tribunal administratif. Un référé-suspension peut être engagé si l''exécution est imminente."},{"question":"Comment obtenir la naturalisation ?","answer":"La naturalisation suppose une résidence régulière prolongée, l''assimilation à la communauté nationale, des ressources stables et l''absence de condamnations. La procédure est longue et discrétionnaire."},{"question":"Quelles démarches pour faire venir ma famille ?","answer":"Le regroupement familial concerne le conjoint et les enfants mineurs. Il suppose des conditions de ressources, de logement et d''ancienneté de séjour."}]'::jsonb WHERE slug = 'droit-des-etrangers';

UPDATE public.expertises SET sections = '[{"title":"Titres miniers et pétroliers","items":["Permis de recherche et de prospection","Concessions et contrats de partage de production","Renouvellement, extension et cession de titres","Conventions d''établissement avec l''État"]},{"title":"Contrats opérationnels","items":["Joint Operating Agreements (JOA)","Contrats de services pétroliers et miniers","Accords de farm-in / farm-out","Contrats de construction et d''ingénierie (EPC)"]},{"title":"Fiscalité et redevances","items":["Régime fiscal des hydrocarbures et des mines","Redevances superficiaires et de production","Conventions fiscales et stabilisation","Optimisation fiscale internationale"]},{"title":"Environnement et communautés","items":["Études d''impact environnemental et social","Plans de gestion environnementale","Relations avec les communautés locales","Réhabilitation des sites et garanties financières"]}]'::jsonb, methodology = '[{"title":"Due diligence sectorielle","description":"Audit juridique, technique et fiscal des titres, contrats et passifs environnementaux."},{"title":"Négociation avec l''État","description":"Représentation lors des négociations de conventions et obtention des autorisations administratives."},{"title":"Structuration contractuelle","description":"Architecture juridique optimisée pour la fiscalité, le financement et la gestion des risques."},{"title":"Gestion des contentieux","description":"Arbitrage international (CIRDI, CCI), médiation et défense devant les juridictions étatiques."}]'::jsonb, faq = '[{"question":"Comment obtenir un permis de recherche pétrolier ou minier ?","answer":"L''obtention suppose le dépôt d''un dossier technique et financier, la négociation d''une convention avec l''État et la signature d''un décret d''attribution. Notre cabinet pilote l''ensemble du processus."},{"question":"Quelle structure juridique pour un projet extractif ?","answer":"La constitution d''une société locale dédiée est généralement requise. Le choix entre filiale, joint-venture ou consortium dépend de la fiscalité, du partage des risques et des contraintes de financement."},{"question":"Comment gérer les obligations environnementales et sociales ?","answer":"Les obligations couvrent l''étude d''impact préalable, le plan de gestion environnementale, la consultation des communautés, le contenu local et la réhabilitation des sites."},{"question":"Que faire en cas de différend avec l''État ou un partenaire ?","answer":"Les contrats prévoient généralement une clause d''arbitrage international (CIRDI, CCI, CCJA). Notre cabinet assure la représentation tant en phase pré-contentieuse qu''arbitrale."}]'::jsonb WHERE slug = 'droit-petrolier-et-minier';

-- Migration: 20260422063143_950d512c-d4be-471a-acad-2acd7746c8a0.sql
ALTER TABLE public.contact_info
  ADD COLUMN IF NOT EXISTS cabinet_name_fr text NOT NULL DEFAULT 'Cabinet Manuela Diabate — Avocat au Barreau de Paris',
  ADD COLUMN IF NOT EXISTS cabinet_name_en text NOT NULL DEFAULT 'Manuela Diabate Law Firm — Attorney at the Paris Bar';

-- Migration: 20260423024422_c77095d2-217b-4214-a287-f1c4891cf272.sql
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE u.email = 'agenceedigit@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Migration: 20260423044552_3903bd69-5e6a-4cfa-a3e6-d006c2243109.sql
ALTER TABLE public.contact_info ADD COLUMN IF NOT EXISTS linkedin_url text NOT NULL DEFAULT '';

-- Migration: 20260425030051_contact_messages.sql
-- Table to store contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  lang text NOT NULL DEFAULT 'fr',
  user_agent text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can insert a message
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read messages
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update (e.g. mark as read)
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);


-- Migration: 20260426020117_858721e2-469a-4243-a095-a9eb801e97fd.sql
-- =========================================
-- PROFILES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- Migration: 20260426020417_c2cf2f56-8930-45a2-bd21-d41b4511c0f6.sql
-- =========================================================
-- 1) ROLES SYSTEM
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  )
$$;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 2) AUDIT LOG
-- =========================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  target_email TEXT,
  details JSONB
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read audit log" ON public.audit_log;
CREATE POLICY "Admins read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 3) SITE CONTENT (i18n key/value)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  lang TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key, lang)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_content readable by everyone" ON public.site_content;
CREATE POLICY "site_content readable by everyone"
  ON public.site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage site_content" ON public.site_content;
CREATE POLICY "Staff manage site_content"
  ON public.site_content FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 4) CONTACT INFO (single row, cabinet coordinates)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT DEFAULT '',
  hours_fr TEXT DEFAULT '',
  hours_en TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  appointment_url TEXT DEFAULT '',
  cabinet_name_fr TEXT DEFAULT '',
  cabinet_name_en TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_info readable by everyone" ON public.contact_info;
CREATE POLICY "contact_info readable by everyone"
  ON public.contact_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage contact_info" ON public.contact_info;
CREATE POLICY "Staff manage contact_info"
  ON public.contact_info FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- Seed one row so the admin has something to edit
INSERT INTO public.contact_info DEFAULT VALUES;

-- =========================================================
-- 5) NEWS ARTICLES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL DEFAULT 'fr',
  title TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published articles readable by everyone" ON public.news_articles;
CREATE POLICY "Published articles readable by everyone"
  ON public.news_articles FOR SELECT
  USING (published = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff manage news" ON public.news_articles;
CREATE POLICY "Staff manage news"
  ON public.news_articles FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 6) TEAM MEMBERS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  role_fr TEXT NOT NULL DEFAULT '',
  role_en TEXT NOT NULL DEFAULT '',
  bio_fr TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  presentation_fr TEXT NOT NULL DEFAULT '',
  presentation_en TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  cv_url TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  office_address TEXT,
  is_founder BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published team members readable by everyone" ON public.team_members;
CREATE POLICY "Published team members readable by everyone"
  ON public.team_members FOR SELECT
  USING (published = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff manage team" ON public.team_members;
CREATE POLICY "Staff manage team"
  ON public.team_members FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 7) EXPERTISES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.expertises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  tagline TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  approach TEXT NOT NULL DEFAULT '',
  conclusion TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  methodology JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expertises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published expertises readable by everyone" ON public.expertises;
CREATE POLICY "Published expertises readable by everyone"
  ON public.expertises FOR SELECT
  USING (published = true OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff manage expertises" ON public.expertises;
CREATE POLICY "Staff manage expertises"
  ON public.expertises FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- =========================================================
-- 8) CONTACT MESSAGES (form submissions)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'fr',
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);
DROP POLICY IF EXISTS "Admins read contact messages" ON public.contact_messages;
CREATE POLICY "Admins read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 9) Re-attach updated_at triggers
-- =========================================================
DO $$ BEGIN
  CREATE TRIGGER trg_site_content_updated_at BEFORE UPDATE ON public.site_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_contact_info_updated_at BEFORE UPDATE ON public.contact_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_news_articles_updated_at BEFORE UPDATE ON public.news_articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_team_members_updated_at BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_expertises_updated_at BEFORE UPDATE ON public.expertises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- 10) STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read site-images" ON storage.objects;
CREATE POLICY "Public read site-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');
DROP POLICY IF EXISTS "Staff write site-images" ON storage.objects;
CREATE POLICY "Staff write site-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff update site-images" ON storage.objects;
CREATE POLICY "Staff update site-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff delete site-images" ON storage.objects;
CREATE POLICY "Staff delete site-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
CREATE POLICY "Public read documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');
DROP POLICY IF EXISTS "Staff write documents" ON storage.objects;
CREATE POLICY "Staff write documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff update documents" ON storage.objects;
CREATE POLICY "Staff update documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff delete documents" ON storage.objects;
CREATE POLICY "Staff delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff(auth.uid()));


-- Migration: 20260426020449_e78c357c-1cbf-449f-b2a9-046ccbfbb576.sql
-- Tighten contact_messages INSERT (no longer "WITH CHECK (true)")
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(trim(name)) > 0
    AND length(trim(email)) > 0
    AND length(trim(message)) > 0
    AND length(message) <= 5000
    AND status = 'new'
  );

-- Storage: replace broad SELECT (which lets clients enumerate all object names)
-- Public URLs still work because they go through the storage CDN, not the listing API.
DROP POLICY IF EXISTS "Public read site-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;

DROP POLICY IF EXISTS "Staff list site-images" ON storage.objects;
CREATE POLICY "Staff list site-images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site-images' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff list documents" ON storage.objects;
CREATE POLICY "Staff list documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.is_staff(auth.uid()));


-- Migration: 20260426022000_625a2081-9199-487e-8111-1c417a013abc.sql
INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sort_order, published) VALUES
('droit-des-affaires','Droit des affaires','Briefcase','Conseil et contentieux pour entreprises, dirigeants et investisseurs.','Le cabinet accompagne les entreprises et leurs dirigeants à toutes les étapes de leur vie sociale, du conseil stratégique au contentieux complexe.','Une approche pragmatique combinant maîtrise technique du droit et compréhension des enjeux économiques de nos clients.','',1,true),
('droit-bancaire-et-financier','Droit bancaire et financier','Landmark','Financements, sûretés, contentieux bancaires et conformité.','Conseil et représentation auprès des établissements bancaires, emprunteurs et investisseurs, en France et à l''international.','Une expertise pointue des opérations de financement et des contentieux bancaires.','',2,true),
('surendettement-et-procedure-collective','Surendettement et procédure collective','AlertTriangle','Restructuration, sauvegarde, redressement et liquidation.','Accompagnement des entreprises en difficulté et des particuliers surendettés à travers les procédures amiables et judiciaires.','Une intervention rapide pour préserver les intérêts du débiteur et négocier avec les créanciers.','',3,true),
('droit-ohada','Droit OHADA','Scale','Maîtrise approfondie du droit harmonisé des affaires en Afrique.','Le cabinet conseille investisseurs et opérateurs économiques sur l''ensemble des Actes uniformes OHADA.','Une parfaite connaissance des juridictions et procédures dans les 17 États membres.','',4,true),
('droit-immobilier','Droit immobilier','Building2','Acquisition, transactions et contentieux immobiliers complexes.','Conseil aux propriétaires, promoteurs et investisseurs sur l''ensemble des opérations immobilières.','Sécurisation juridique des opérations et résolution efficace des litiges.','',5,true),
('droit-penal-et-droit-penal-des-affaires','Droit pénal et droit pénal des affaires','Gavel','Défense pénale, infractions économiques et financières.','Défense des personnes physiques et morales mises en cause dans des procédures pénales, notamment en matière économique.','Une défense rigoureuse, fondée sur l''analyse minutieuse du dossier et la stratégie procédurale.','',6,true),
('droit-des-etrangers','Droit des étrangers','Globe2','Titres de séjour, naturalisation, regroupement familial et recours.','Accompagnement des particuliers dans toutes leurs démarches en droit des étrangers et de la nationalité.','Une écoute attentive et un suivi personnalisé de chaque dossier.','',7,true),
('droit-petrolier-et-minier','Droit pétrolier et minier','Flame','Accompagnement des opérateurs et États sur les industries extractives.','Conseil aux compagnies pétrolières et minières, ainsi qu''aux États, sur les contrats et la régulation du secteur.','Une expertise sectorielle rare, à la croisée du droit, de la finance et des enjeux régaliens.','',8,true) ON CONFLICT (slug) DO NOTHING;

-- Migration: 20260426023115_ab135210-ec39-4af6-8b49-1c329e25694c.sql

-- 1. DROIT DES AFFAIRES
UPDATE public.expertises SET
  intro = 'Le cabinet accompagne entreprises, dirigeants et investisseurs à toutes les étapes de la vie sociale : constitution, gouvernance, opérations de croissance, restructurations et contentieux. Notre approche associe rigueur juridique et compréhension fine des enjeux économiques.',
  approach = 'Nous privilégions une démarche pragmatique fondée sur l''écoute, l''anticipation des risques et la recherche de solutions opérationnelles. Chaque dossier fait l''objet d''une stratégie sur mesure, alignée avec les objectifs commerciaux du client.',
  conclusion = 'Que vous soyez en phase de création, de développement ou de restructuration, le cabinet vous accompagne avec réactivité et confidentialité. Contactez-nous pour un premier échange.',
  sections = '[
    {"title":"Conseil aux entreprises","items":["Constitution et structuration de sociétés","Pactes d''associés et gouvernance","Rédaction et négociation de contrats commerciaux","Conseil aux dirigeants et responsabilité"]},
    {"title":"Opérations sur capital","items":["Cessions et acquisitions (M&A)","Augmentations de capital et levées de fonds","Restructurations et fusions","Due diligence juridique"]},
    {"title":"Contentieux des affaires","items":["Litiges entre associés","Ruptures de relations commerciales","Concurrence déloyale","Recouvrement de créances commerciales"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Analyse","description":"Étude approfondie du dossier, identification des risques et opportunités juridiques."},
    {"title":"Stratégie","description":"Définition d''une feuille de route adaptée à vos objectifs économiques."},
    {"title":"Action","description":"Rédaction des actes, négociation et représentation devant les juridictions compétentes."},
    {"title":"Suivi","description":"Accompagnement continu et reporting régulier jusqu''à la résolution complète."}
  ]'::jsonb,
  faq = '[
    {"question":"Quand consulter un avocat en droit des affaires ?","answer":"Dès la création de votre société, lors de toute opération significative (cession, levée de fonds, contrat stratégique) ou en cas de litige avec un partenaire."},
    {"question":"Le cabinet intervient-il en France et en Afrique ?","answer":"Oui. Le cabinet dispose d''une double expertise France/Afrique de l''Ouest et accompagne des opérations transfrontalières."},
    {"question":"Comment se déroule la première consultation ?","answer":"Un rendez-vous initial confidentiel permet d''analyser votre situation, définir le périmètre d''intervention et établir un devis transparent."}
  ]'::jsonb
WHERE slug = 'droit-des-affaires';

-- 2. DROIT BANCAIRE ET FINANCIER
UPDATE public.expertises SET
  intro = 'Le cabinet conseille établissements bancaires, emprunteurs, investisseurs institutionnels et entreprises sur l''ensemble des opérations de financement, des sûretés et du contentieux bancaire, en France comme à l''international.',
  approach = 'Notre expertise couvre la structuration des financements complexes, la sécurisation des garanties et la défense en cas de contentieux. Nous combinons technicité juridique et compréhension des enjeux financiers.',
  conclusion = 'De la négociation d''un crédit à la défense d''un contentieux bancaire, nous mettons à votre service une expertise reconnue. Prenons rendez-vous pour étudier votre situation.',
  sections = '[
    {"title":"Financements","items":["Crédits syndiqués et financements structurés","Financements de projet","Crédit-bail et leasing","Restructuration de dette"]},
    {"title":"Sûretés et garanties","items":["Hypothèques et nantissements","Cautions et garanties autonomes","Cessions Dailly et fiducie-sûreté","Réalisation des garanties"]},
    {"title":"Contentieux bancaire","items":["Contestation de TEG et clauses abusives","Responsabilité du banquier","Procédures de surendettement","Litiges sur instruments financiers"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Audit","description":"Analyse des contrats, garanties et historique de la relation bancaire."},
    {"title":"Stratégie","description":"Définition de la position juridique et des leviers de négociation."},
    {"title":"Négociation","description":"Échanges avec les établissements bancaires pour obtenir un accord favorable."},
    {"title":"Contentieux","description":"Représentation devant les juridictions civiles et commerciales si nécessaire."}
  ]'::jsonb,
  faq = '[
    {"question":"Puis-je contester un crédit déjà signé ?","answer":"Oui, sous certaines conditions : erreur sur le TEG, manquement au devoir de mise en garde, clauses abusives. Une analyse préalable est indispensable."},
    {"question":"Le cabinet défend-il les particuliers ?","answer":"Oui, nous accompagnons particuliers et professionnels dans leurs litiges avec les établissements bancaires."},
    {"question":"Quels délais pour agir contre une banque ?","answer":"Les délais varient selon la nature du litige (5 ans en général). Il est essentiel de consulter rapidement."}
  ]'::jsonb
WHERE slug = 'droit-bancaire-et-financier';

-- 3. SURENDETTEMENT ET PROCÉDURE COLLECTIVE
UPDATE public.expertises SET
  intro = 'Le cabinet accompagne les entreprises en difficulté et les particuliers surendettés à travers les procédures amiables (mandat ad hoc, conciliation) et judiciaires (sauvegarde, redressement, liquidation, rétablissement personnel).',
  approach = 'Notre intervention vise à préserver l''activité et les intérêts du débiteur tout en négociant équitablement avec les créanciers. La rapidité d''action est souvent déterminante.',
  conclusion = 'Face aux difficultés financières, agir tôt change tout. Le cabinet vous oriente vers la procédure la mieux adaptée à votre situation.',
  sections = '[
    {"title":"Procédures amiables","items":["Mandat ad hoc","Conciliation","Négociation avec les créanciers","Plan d''apurement"]},
    {"title":"Procédures collectives","items":["Sauvegarde judiciaire","Redressement judiciaire","Liquidation judiciaire","Plan de continuation ou de cession"]},
    {"title":"Surendettement des particuliers","items":["Saisine de la commission de surendettement","Plan conventionnel de redressement","Rétablissement personnel","Recours contre les décisions"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Diagnostic","description":"Évaluation de la situation économique et juridique du débiteur."},
    {"title":"Choix de la procédure","description":"Sélection de la voie amiable ou judiciaire la plus adaptée."},
    {"title":"Mise en œuvre","description":"Préparation des actes, saisine des juridictions, représentation aux audiences."},
    {"title":"Exécution du plan","description":"Suivi de l''exécution et défense en cas de difficulté."}
  ]'::jsonb,
  faq = '[
    {"question":"À quel moment déclarer la cessation des paiements ?","answer":"Dans les 45 jours suivant la cessation, sauf si une procédure de conciliation est ouverte. Tarder expose le dirigeant à des sanctions."},
    {"question":"La sauvegarde est-elle réservée aux grandes entreprises ?","answer":"Non, toute entreprise pas encore en cessation des paiements peut en bénéficier, quelle que soit sa taille."},
    {"question":"Un particulier peut-il vraiment effacer ses dettes ?","answer":"Oui, via la procédure de rétablissement personnel, sous conditions de bonne foi et d''insolvabilité avérée."}
  ]'::jsonb
WHERE slug = 'surendettement-et-procedure-collective';

-- 4. DROIT OHADA
UPDATE public.expertises SET
  intro = 'Le cabinet conseille investisseurs, entreprises et institutions sur l''ensemble des Actes uniformes OHADA, droit harmonisé des affaires applicable dans 17 États d''Afrique. Notre expertise couvre tant le conseil que le contentieux devant les juridictions nationales et la CCJA.',
  approach = 'Nous combinons une connaissance fine des textes harmonisés et une pratique réelle des juridictions africaines, indispensable pour sécuriser vos opérations sur le continent.',
  conclusion = 'Pour vos investissements et opérations en Afrique, le cabinet vous offre une expertise OHADA reconnue. Contactez-nous pour sécuriser vos projets.',
  sections = '[
    {"title":"Sociétés et investissement","items":["Constitution de sociétés OHADA","Pactes d''associés et gouvernance","Investissements transfrontaliers","Joint-ventures et partenariats"]},
    {"title":"Sûretés et recouvrement","items":["Sûretés mobilières et immobilières OHADA","Procédures simplifiées de recouvrement","Voies d''exécution","Saisies et mesures conservatoires"]},
    {"title":"Procédures collectives OHADA","items":["Règlement préventif","Redressement judiciaire","Liquidation des biens","Procédures transfrontalières"]},
    {"title":"Arbitrage CCJA","items":["Conseil et représentation","Rédaction de clauses compromissoires","Exécution des sentences"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Cartographie","description":"Identification des juridictions compétentes et du droit applicable."},
    {"title":"Structuration","description":"Choix de la forme sociale, des sûretés et de la clause de règlement des litiges."},
    {"title":"Mise en œuvre","description":"Rédaction des actes conformes aux Actes uniformes et accompagnement local."},
    {"title":"Contentieux","description":"Représentation devant les juridictions nationales et la CCJA."}
  ]'::jsonb,
  faq = '[
    {"question":"Quels pays sont couverts par l''OHADA ?","answer":"17 États africains, principalement d''Afrique de l''Ouest et Centrale (Côte d''Ivoire, Sénégal, Cameroun, Gabon, etc.)."},
    {"question":"L''arbitrage CCJA est-il fiable ?","answer":"Oui, c''est une institution reconnue dont les sentences sont exécutoires de plein droit dans tous les États membres."},
    {"question":"Le cabinet plaide-t-il devant les juridictions africaines ?","answer":"Oui, en collaboration avec un réseau de correspondants locaux dans les principaux États OHADA."}
  ]'::jsonb
WHERE slug = 'droit-ohada';

-- 5. DROIT IMMOBILIER
UPDATE public.expertises SET
  intro = 'Le cabinet conseille propriétaires, promoteurs, investisseurs et locataires sur l''ensemble des opérations immobilières : acquisition, construction, baux, copropriété et contentieux.',
  approach = 'Nous sécurisons juridiquement vos opérations en amont et défendons efficacement vos intérêts en cas de litige. Notre maîtrise du droit immobilier français et de l''OHADA est un atout pour les investissements transfrontaliers.',
  conclusion = 'De l''acquisition à la résolution d''un litige, faites sécuriser vos opérations immobilières par un cabinet expérimenté. Prenons contact.',
  sections = '[
    {"title":"Transactions immobilières","items":["Promesses et compromis de vente","Audit juridique des biens","Acquisitions et reventes","Opérations de promotion immobilière"]},
    {"title":"Baux","items":["Baux d''habitation et commerciaux","Baux professionnels et ruraux","Renouvellement et résiliation","Loyers impayés et expulsions"]},
    {"title":"Copropriété et construction","items":["Litiges de copropriété","Assemblées générales et règlement","Garanties décennale et biennale","Désordres et malfaçons"]},
    {"title":"Contentieux immobilier","items":["Vices cachés","Troubles de voisinage","Servitudes et bornage","Saisie immobilière"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Audit","description":"Vérification du titre, des servitudes, des autorisations et des risques."},
    {"title":"Sécurisation","description":"Rédaction et négociation des actes assurant la protection de vos droits."},
    {"title":"Suivi","description":"Accompagnement jusqu''à la signature notariée et la prise de possession."},
    {"title":"Contentieux","description":"Représentation devant les juridictions civiles et commerciales."}
  ]'::jsonb,
  faq = '[
    {"question":"Faut-il un avocat en plus du notaire pour acheter ?","answer":"Pour les opérations complexes (investissement, marchand de biens, dossiers transfrontaliers), l''avocat apporte un conseil stratégique distinct du notaire."},
    {"question":"Que faire en cas de loyers impayés ?","answer":"Agir vite : commandement de payer, puis assignation. Le cabinet vous accompagne jusqu''à l''expulsion si nécessaire."},
    {"question":"Combien de temps pour faire valoir un vice caché ?","answer":"Deux ans à compter de la découverte du vice. Une expertise judiciaire est souvent indispensable."}
  ]'::jsonb
WHERE slug = 'droit-immobilier';

-- 6. DROIT PÉNAL ET DROIT PÉNAL DES AFFAIRES
UPDATE public.expertises SET
  intro = 'Le cabinet assure la défense des personnes physiques et morales mises en cause dans des procédures pénales, avec une expertise particulière en matière économique et financière : abus de biens sociaux, escroquerie, blanchiment, corruption, fraude fiscale.',
  approach = 'Notre défense repose sur une analyse minutieuse du dossier, une stratégie procédurale rigoureuse et une présence active à toutes les étapes : garde à vue, instruction, audience, voies de recours.',
  conclusion = 'Face à une accusation pénale, la réactivité et l''expertise font la différence. Le cabinet est joignable en urgence.',
  sections = '[
    {"title":"Défense pénale générale","items":["Garde à vue et auditions libres","Instruction et mise en examen","Audiences correctionnelles et criminelles","Voies de recours (appel, cassation)"]},
    {"title":"Droit pénal des affaires","items":["Abus de biens sociaux","Escroquerie et abus de confiance","Blanchiment et corruption","Délits boursiers et concurrence"]},
    {"title":"Droit pénal fiscal et douanier","items":["Fraude fiscale","Blanchiment de fraude fiscale","Infractions douanières","Coopération avec les autorités"]},
    {"title":"Victimes","items":["Plainte simple et avec constitution de partie civile","Indemnisation du préjudice","Suivi de l''enquête"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Urgence","description":"Intervention immédiate dès la garde à vue ou la convocation."},
    {"title":"Analyse","description":"Étude exhaustive de la procédure et identification des nullités."},
    {"title":"Stratégie","description":"Définition de la ligne de défense la mieux adaptée."},
    {"title":"Audience","description":"Plaidoirie rigoureuse et exercice systématique des voies de recours."}
  ]'::jsonb,
  faq = '[
    {"question":"Puis-je être assisté dès la garde à vue ?","answer":"Oui, c''est un droit fondamental. Contactez le cabinet immédiatement, jour et nuit en cas d''urgence."},
    {"question":"Une convocation police = poursuite pénale ?","answer":"Pas nécessairement, mais ne vous y rendez jamais sans avoir consulté un avocat au préalable."},
    {"question":"Que risque une entreprise mise en cause ?","answer":"Amendes lourdes, dissolution, exclusion des marchés publics, atteinte à la réputation. Une défense organisée est indispensable."}
  ]'::jsonb
WHERE slug = 'droit-penal-et-droit-penal-des-affaires';

-- 7. DROIT DES ÉTRANGERS
UPDATE public.expertises SET
  intro = 'Le cabinet accompagne particuliers et familles dans toutes leurs démarches en droit des étrangers et de la nationalité : titres de séjour, regroupement familial, naturalisation, asile, recours contre les refus et obligations de quitter le territoire (OQTF).',
  approach = 'Une écoute attentive, un suivi personnalisé et une parfaite maîtrise du CESEDA et de la jurisprudence administrative permettent d''optimiser vos chances de succès.',
  conclusion = 'Quel que soit votre statut administratif, le cabinet vous accompagne avec discrétion et détermination. Prenons rendez-vous.',
  sections = '[
    {"title":"Titres de séjour","items":["Cartes de séjour temporaire et pluriannuelles","Cartes de résident","Titre de séjour étudiant et salarié","Passeport talent"]},
    {"title":"Vie familiale","items":["Regroupement familial","Conjoint de Français","Parent d''enfant français","Visas long séjour"]},
    {"title":"Nationalité","items":["Naturalisation par décret","Déclaration de nationalité","Recours contre les refus","Réintégration dans la nationalité française"]},
    {"title":"Contentieux","items":["Recours contre les OQTF","Refus de visa et de titre de séjour","Rétention administrative","Asile et protection subsidiaire"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Bilan","description":"Évaluation de votre situation personnelle et administrative."},
    {"title":"Constitution du dossier","description":"Préparation rigoureuse des pièces et de l''argumentaire juridique."},
    {"title":"Suivi préfectoral","description":"Échanges avec les préfectures et accompagnement aux convocations."},
    {"title":"Recours","description":"Saisine du tribunal administratif et de la CNDA en cas de refus."}
  ]'::jsonb,
  faq = '[
    {"question":"Quel délai pour contester une OQTF ?","answer":"Selon le cas, 48 heures à 30 jours. Il est impératif de consulter immédiatement un avocat."},
    {"question":"Combien de temps pour obtenir la nationalité française ?","answer":"De 12 à 24 mois en moyenne, selon les préfectures et la complexité du dossier."},
    {"question":"Le cabinet intervient-il en aide juridictionnelle ?","answer":"Oui, sous conditions de ressources, pour permettre l''accès au droit à tous."}
  ]'::jsonb
WHERE slug = 'droit-des-etrangers';

-- 8. DROIT PÉTROLIER ET MINIER
UPDATE public.expertises SET
  intro = 'Le cabinet conseille compagnies pétrolières, sociétés minières, États et institutions publiques sur l''ensemble du cycle des industries extractives : octroi de titres, contrats de partage de production, fiscalité spécifique, contenu local, contentieux et arbitrage international.',
  approach = 'À la croisée du droit, de la finance et des enjeux régaliens, notre expertise sectorielle s''appuie sur une connaissance fine des codes pétroliers et miniers africains et des pratiques de l''industrie.',
  conclusion = 'Les industries extractives exigent une expertise juridique pointue. Le cabinet vous accompagne sur l''ensemble de vos projets et contentieux.',
  sections = '[
    {"title":"Titres et autorisations","items":["Permis de recherche et d''exploitation","Conventions d''établissement","Renouvellement et cession de titres","Conformité environnementale"]},
    {"title":"Contrats","items":["Contrats de partage de production (CPP)","Joint operating agreements (JOA)","Contrats de services pétroliers","Contrats miniers et redevances"]},
    {"title":"Régulation et fiscalité","items":["Fiscalité pétrolière et minière","Contenu local et emploi","Régime douanier des hydrocarbures","Relations avec les autorités de régulation"]},
    {"title":"Contentieux et arbitrage","items":["Arbitrage CIRDI et CCI","Différends investisseur-État","Litiges entre partenaires","Contentieux environnemental"]}
  ]'::jsonb,
  methodology = '[
    {"title":"Compréhension","description":"Analyse du cadre légal applicable et des spécificités du projet."},
    {"title":"Structuration","description":"Choix du véhicule, négociation des contrats et sécurisation des titres."},
    {"title":"Conformité","description":"Mise en place d''une compliance adaptée (HSE, contenu local, lutte anti-corruption)."},
    {"title":"Défense","description":"Représentation en arbitrage international et devant les juridictions étatiques."}
  ]'::jsonb,
  faq = '[
    {"question":"Le cabinet conseille-t-il les États ?","answer":"Oui, le cabinet conseille tant les opérateurs privés que les autorités publiques sur la régulation du secteur extractif."},
    {"question":"Quels arbitrages internationaux maîtrisez-vous ?","answer":"CIRDI, CCI, CCJA et arbitrage ad hoc selon les règles UNCITRAL."},
    {"question":"Comment gérer un différend avec une autorité étatique ?","answer":"Privilégier la négociation, puis recourir à l''arbitrage prévu par le contrat ou les traités d''investissement."}
  ]'::jsonb
WHERE slug = 'droit-petrolier-et-minier';


-- Migration: 20260426025842_8500abbf-afc9-4a0b-bc09-3a725dc94bdb.sql
-- Add optional expertise_slug to contact_messages so we can route requests by domain
ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS expertise_slug text;

CREATE INDEX IF NOT EXISTS idx_contact_messages_expertise_slug
ON public.contact_messages (expertise_slug);

-- Replace insert policy to allow optional expertise_slug while keeping validation
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(TRIM(BOTH FROM name)) > 0
  AND length(TRIM(BOTH FROM email)) > 0
  AND length(TRIM(BOTH FROM message)) > 0
  AND length(message) <= 5000
  AND status = 'new'
  AND (expertise_slug IS NULL OR length(expertise_slug) <= 100)
);

-- Migration: 20260426034556_22b227ea-f97e-4113-9047-7a85c93df9b3.sql
-- Ajout d'un type de contenu pour distinguer Actualités vs Articles
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'news';

-- Contrainte de validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'news_articles_content_type_check'
  ) THEN
    ALTER TABLE public.news_articles
      ADD CONSTRAINT news_articles_content_type_check
      CHECK (content_type IN ('news', 'article'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_news_articles_content_type
  ON public.news_articles(content_type);

-- Migration: 20260426044248_2979b906-45bd-459e-8ab3-112229a46efc.sql
-- 1. Sécuriser team_members : créer une vue publique sans PII sensible
-- (email, phone, office_address restent visibles uniquement au staff via la table de base)

CREATE OR REPLACE VIEW public.team_members_public
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  role_fr,
  role_en,
  bio_fr,
  bio_en,
  presentation_fr,
  presentation_en,
  photo_url,
  cv_url,
  linkedin_url,
  is_founder,
  published,
  sort_order,
  created_at,
  updated_at
FROM public.team_members;

-- Bloquer la lecture publique des champs sensibles sur la table de base.
-- On remplace l'ancienne policy publique par une policy staff-only pour SELECT.
DROP POLICY IF EXISTS "Published team members readable by everyone" ON public.team_members;

DROP POLICY IF EXISTS "Staff read team_members full" ON public.team_members;
CREATE POLICY "Staff read team_members full"
ON public.team_members
FOR SELECT
USING (is_staff(auth.uid()));

-- (la policy "Staff manage team" existante couvre INSERT/UPDATE/DELETE)

-- 2. Restreindre la table profiles : plus de SELECT public.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff read all profiles" ON public.profiles;
CREATE POLICY "Staff read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_staff(auth.uid()));

-- Migration: 20260426050530_63da0e9e-432c-44bb-934d-3db61a84ad22.sql
UPDATE auth.users
SET encrypted_password = crypt('TempPass2026!Change', gen_salt('bf')),
    updated_at = now()
WHERE email = 'agenceedigit@gmail.com';

-- Migration: 20260426185611_6916d6c0-0259-4b59-bf7a-a48986bd7b4a.sql
CREATE TABLE public.article_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  visitor_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT article_likes_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE,
  CONSTRAINT article_likes_visitor_key_length CHECK (char_length(visitor_key) BETWEEN 16 AND 128),
  CONSTRAINT article_likes_unique_visitor UNIQUE (article_id, visitor_key)
);

CREATE TABLE public.article_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'native',
  visitor_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT article_shares_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE,
  CONSTRAINT article_shares_platform_length CHECK (char_length(platform) BETWEEN 2 AND 40),
  CONSTRAINT article_shares_visitor_key_length CHECK (visitor_key IS NULL OR char_length(visitor_key) BETWEEN 16 AND 128)
);

CREATE TABLE public.article_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id uuid NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT article_comments_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE,
  CONSTRAINT article_comments_status_valid CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT article_comments_author_name_length CHECK (char_length(trim(author_name)) BETWEEN 2 AND 100),
  CONSTRAINT article_comments_author_email_length CHECK (char_length(trim(author_email)) BETWEEN 5 AND 255),
  CONSTRAINT article_comments_body_length CHECK (char_length(trim(body)) BETWEEN 3 AND 2000)
);

ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_article_likes_article_id ON public.article_likes(article_id);
CREATE INDEX idx_article_shares_article_id ON public.article_shares(article_id);
CREATE INDEX idx_article_comments_article_status_created ON public.article_comments(article_id, status, created_at DESC);

DROP POLICY IF EXISTS "Published article likes readable by everyone" ON public.article_likes;
CREATE POLICY "Published article likes readable by everyone"
ON public.article_likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_likes.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) OR public.is_staff(auth.uid())
);

DROP POLICY IF EXISTS "Anyone can like published articles" ON public.article_likes;
CREATE POLICY "Anyone can like published articles"
ON public.article_likes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_likes.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

DROP POLICY IF EXISTS "Visitors can remove their own article likes" ON public.article_likes;
CREATE POLICY "Visitors can remove their own article likes"
ON public.article_likes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_likes.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

DROP POLICY IF EXISTS "Staff manage article likes" ON public.article_likes;
CREATE POLICY "Staff manage article likes"
ON public.article_likes
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Published article shares readable by everyone" ON public.article_shares;
CREATE POLICY "Published article shares readable by everyone"
ON public.article_shares
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_shares.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) OR public.is_staff(auth.uid())
);

DROP POLICY IF EXISTS "Anyone can share published articles" ON public.article_shares;
CREATE POLICY "Anyone can share published articles"
ON public.article_shares
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_shares.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

DROP POLICY IF EXISTS "Staff manage article shares" ON public.article_shares;
CREATE POLICY "Staff manage article shares"
ON public.article_shares
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Approved comments readable by everyone" ON public.article_comments;
CREATE POLICY "Approved comments readable by everyone"
ON public.article_comments
FOR SELECT
USING (
  status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_comments.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
  OR public.is_staff(auth.uid())
);

DROP POLICY IF EXISTS "Anyone can submit comments on published articles" ON public.article_comments;
CREATE POLICY "Anyone can submit comments on published articles"
ON public.article_comments
FOR INSERT
WITH CHECK (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = article_comments.article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  )
);

DROP POLICY IF EXISTS "Staff manage article comments" ON public.article_comments;
CREATE POLICY "Staff manage article comments"
ON public.article_comments
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER update_article_comments_updated_at
BEFORE UPDATE ON public.article_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.article_interaction_counts
WITH (security_invoker = true) AS
SELECT
  n.id AS article_id,
  COALESCE(l.likes_count, 0)::integer AS likes_count,
  COALESCE(s.shares_count, 0)::integer AS shares_count,
  COALESCE(c.comments_count, 0)::integer AS comments_count
FROM public.news_articles n
LEFT JOIN (
  SELECT article_id, count(*) AS likes_count
  FROM public.article_likes
  GROUP BY article_id
) l ON l.article_id = n.id
LEFT JOIN (
  SELECT article_id, count(*) AS shares_count
  FROM public.article_shares
  GROUP BY article_id
) s ON s.article_id = n.id
LEFT JOIN (
  SELECT article_id, count(*) AS comments_count
  FROM public.article_comments
  WHERE status = 'approved'
  GROUP BY article_id
) c ON c.article_id = n.id
WHERE n.published = true AND n.published_date <= CURRENT_DATE;

-- Migration: 20260426192101_0c0b224d-4908-4136-b842-a1b4a3aca606.sql
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.article_likes FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.article_shares FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.article_comments FROM anon;
REVOKE SELECT ON public.article_interaction_counts FROM anon;

CREATE OR REPLACE FUNCTION public.get_article_interactions(_article_id uuid, _visitor_key text DEFAULT NULL)
RETURNS TABLE (
  likes_count integer,
  shares_count integer,
  comments_count integer,
  liked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::integer FROM public.article_likes l WHERE l.article_id = _article_id) AS likes_count,
    (SELECT count(*)::integer FROM public.article_shares s WHERE s.article_id = _article_id) AS shares_count,
    (SELECT count(*)::integer FROM public.article_comments c WHERE c.article_id = _article_id AND c.status = 'approved') AS comments_count,
    CASE
      WHEN _visitor_key IS NULL THEN false
      ELSE EXISTS (
        SELECT 1 FROM public.article_likes l
        WHERE l.article_id = _article_id AND l.visitor_key = _visitor_key
      )
    END AS liked
  WHERE EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_article_comments(_article_id uuid)
RETURNS TABLE (
  id uuid,
  author_name text,
  body text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.author_name, c.body, c.created_at
  FROM public.article_comments c
  WHERE c.article_id = _article_id
    AND c.status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.news_articles n
      WHERE n.id = _article_id
        AND n.published = true
        AND n.published_date <= CURRENT_DATE
    )
  ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.set_article_like(_article_id uuid, _visitor_key text, _liked boolean)
RETURNS TABLE (likes_count integer, liked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _visitor_key IS NULL OR char_length(_visitor_key) < 16 OR char_length(_visitor_key) > 128 THEN
    RAISE EXCEPTION 'Invalid visitor key';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'Article not available';
  END IF;

  IF _liked THEN
    INSERT INTO public.article_likes(article_id, visitor_key)
    VALUES (_article_id, _visitor_key)
    ON CONFLICT (article_id, visitor_key) DO NOTHING;
  ELSE
    DELETE FROM public.article_likes
    WHERE article_id = _article_id AND visitor_key = _visitor_key;
  END IF;

  RETURN QUERY
  SELECT count(*)::integer, EXISTS (
    SELECT 1 FROM public.article_likes l
    WHERE l.article_id = _article_id AND l.visitor_key = _visitor_key
  )
  FROM public.article_likes l
  WHERE l.article_id = _article_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_article_share(_article_id uuid, _platform text DEFAULT 'native', _visitor_key text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_platform text := lower(trim(coalesce(_platform, 'native')));
  total integer;
BEGIN
  IF char_length(safe_platform) < 2 OR char_length(safe_platform) > 40 THEN
    safe_platform := 'native';
  END IF;

  IF _visitor_key IS NOT NULL AND (char_length(_visitor_key) < 16 OR char_length(_visitor_key) > 128) THEN
    _visitor_key := NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'Article not available';
  END IF;

  INSERT INTO public.article_shares(article_id, platform, visitor_key)
  VALUES (_article_id, safe_platform, _visitor_key);

  SELECT count(*)::integer INTO total
  FROM public.article_shares
  WHERE article_id = _article_id;

  RETURN total;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_article_comment(_article_id uuid, _author_name text, _author_email text, _body text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  safe_name text := trim(coalesce(_author_name, ''));
  safe_email text := lower(trim(coalesce(_author_email, '')));
  safe_body text := trim(coalesce(_body, ''));
BEGIN
  IF char_length(safe_name) < 2 OR char_length(safe_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;

  IF char_length(safe_email) < 5 OR char_length(safe_email) > 255 OR safe_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  IF char_length(safe_body) < 3 OR char_length(safe_body) > 2000 THEN
    RAISE EXCEPTION 'Invalid comment';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.news_articles n
    WHERE n.id = _article_id
      AND n.published = true
      AND n.published_date <= CURRENT_DATE
  ) THEN
    RAISE EXCEPTION 'Article not available';
  END IF;

  INSERT INTO public.article_comments(article_id, author_name, author_email, body, status)
  VALUES (_article_id, safe_name, safe_email, safe_body, 'pending')
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_article_interactions(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_article_comments(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_article_like(uuid, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_article_share(uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_article_comment(uuid, text, text, text) TO anon, authenticated;

-- Migration: 20260427025037_f331fedc-3243-453d-9d4a-9c323b798e7e.sql
insert into storage.buckets (id, name, public)
values ('editor-media', 'editor-media', true)
on conflict (id) do update set public = true;

DROP POLICY IF EXISTS "Editor media is publicly readable" ON storage.objects;
create policy "Editor media is publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'editor-media');

DROP POLICY IF EXISTS "Staff can upload editor media" ON storage.objects;
create policy "Staff can upload editor media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'editor-media' and public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can update editor media" ON storage.objects;
create policy "Staff can update editor media"
on storage.objects
for update
to authenticated
using (bucket_id = 'editor-media' and public.is_staff(auth.uid()))
with check (bucket_id = 'editor-media' and public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete editor media" ON storage.objects;
create policy "Staff can delete editor media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'editor-media' and public.is_staff(auth.uid()));

-- Migration: 20260427025105_29b0ce88-c528-470d-ab1a-9d04a7329366.sql
drop policy if exists "Editor media is publicly readable" on storage.objects;

-- Migration: 20260427081622_14e1953f-56b5-4961-8bde-25130466f758.sql
-- Remove the public SELECT policy that exposed author_email
DROP POLICY IF EXISTS "Approved comments readable by everyone" ON public.article_comments;

-- Keep only staff SELECT (the existing "Staff manage article comments" ALL policy already covers staff)
-- Public reads must now go through the SECURITY DEFINER RPC public.get_article_comments(uuid)
-- which returns only id, author_name, body, created_at (no email).

-- Migration: 20260427104347_a248c776-7e0d-4fdc-85a3-1ca65c824463.sql
-- Remove the overly permissive public DELETE policy that allowed
-- any anonymous visitor to delete any like on a published article.
DROP POLICY IF EXISTS "Visitors can remove their own article likes" ON public.article_likes;

-- Public DELETE is now disallowed entirely. Visitors must go through the
-- existing SECURITY DEFINER RPC `set_article_like(_article_id, _visitor_key, false)`
-- which validates ownership via visitor_key before deleting.
-- Staff retains full management via the existing "Staff manage article likes" policy.

-- Migration: 20260427134636_3bcc8bf2-6eac-45b7-9c70-e6c5ce3470a9.sql
-- Revoke EXECUTE from anon/authenticated on internal-only SECURITY DEFINER functions.
-- These functions are only called by triggers or the auth flow, never directly by clients.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Migration: 20260430101050_562b5337-390b-4a11-a923-9fd7c141ecbb.sql
GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- Migration: 20260430114955_18c4068c-aac3-4cc9-9658-be7e8c852b87.sql
UPDATE public.site_content SET value = '' WHERE key = 'about.portrait';

-- Migration: 20260430115221_866d45d3-9908-47dc-8149-8e3271519b40.sql
UPDATE public.site_content SET value = '' WHERE key = 'about.portrait';

-- Migration: 20260430141519_1f986fac-495f-432f-80e4-f51b9ccab4a7.sql
-- Allow public visitors to read the safe team_members_public view.
-- The view intentionally omits PII columns (email, phone, office_address).
-- With security_invoker=on, anon users hit team_members RLS and get nothing,
-- so we switch the view to definer-style (security_invoker=off) which runs
-- with the view owner's privileges and bypasses the underlying table RLS.

ALTER VIEW public.team_members_public SET (security_invoker = off);

-- Ensure public read access on the view itself.
GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- Migration: 20260430143058_0ad17323-2bf7-448d-bc9c-9163f29356ff.sql
UPDATE public.expertises 
SET title = 'Droit pénal et des affaires' 
WHERE title = 'Droit pénal et droit pénal des affaires';

-- Migration: 20260430143142_496f7cfb-909d-4091-b6b0-63d19cb6e983.sql
UPDATE public.expertises 
SET intro = 'Le cabinet assure la défense des personnes physiques et morales mises en cause dans des procédures pénales, avec une expertise particulière en matière économique et financière : abus de biens sociaux, escroquerie, blanchiment, corruption.' 
WHERE id = '1769e9e5-6fb7-415b-b51a-028fa2c0992a';

-- Migration: 20260430143637_d9d6a502-cc88-4127-aab8-47a021c0909a.sql
UPDATE public.expertises 
SET title = 'Droit des étrangers et de la nationalité' 
WHERE title = 'Droit des étrangers';

-- Migration: 20260430144953_fdcfbb35-fdc7-4d9c-9c1e-5d1aa0e6d9ed.sql
UPDATE public.expertises 
SET title = 'Procédure collective' 
WHERE title = 'Surendettement et procédure collective';

-- Migration: 20260501113956_e45d4d3d-2f28-466e-b066-3e71afc0e194.sql
CREATE TABLE public.founder_profile_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title_fr TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  subtitle_fr TEXT NOT NULL DEFAULT '',
  subtitle_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Circle',
  meta TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_profile_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published founder items readable by everyone" ON public.founder_profile_items;
CREATE POLICY "Published founder items readable by everyone"
ON public.founder_profile_items
FOR SELECT
USING ((published = true) OR is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff manage founder items" ON public.founder_profile_items;
CREATE POLICY "Staff manage founder items"
ON public.founder_profile_items
FOR ALL
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER update_founder_profile_items_updated_at
BEFORE UPDATE ON public.founder_profile_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_founder_profile_items_cat_sort ON public.founder_profile_items(category, sort_order);

-- Migration: 20260501150540_37f8d13c-9102-4c50-a3c6-6c11583af455.sql
UPDATE public.team_members
SET
  presentation_fr = $$<p><strong>Maître Manuela DIABATE</strong> est un avocat inscrit au <strong>Barreau de Paris</strong>, reconnu pour son engagement, sa rigueur et son approche pragmatique du droit. Il accompagne aussi bien les particuliers que les entreprises, en conseil comme en contentieux, avec une capacité à traiter des dossiers complexes, notamment à dimension internationale.</p><p>Fort d'un parcours professionnel entre la <strong>Côte d'Ivoire</strong> et la <strong>France</strong>, il a exercé au sein de cabinets d'avocats de renom ainsi qu'au sein d'entreprises internationales. Ces expériences variées lui ont permis de développer une approche globale et résolument pragmatique des problématiques juridiques contemporaines.</p><p>Diplômé en droit en Côte d'Ivoire, Maître Manuela DIABATE possède une <strong>maîtrise approfondie du droit OHADA</strong> (Organisation pour l'Harmonisation en Afrique du Droit des Affaires). Cette compétence, alliée à sa pratique rigoureuse du droit français, lui confère une capacité unique à concilier les systèmes juridiques africains et européens, et à traiter des dossiers transnationaux exigeants.</p><p>Cette double compétence franco-africaine lui permet d'appréhender avec finesse des problématiques complexes dans plusieurs domaines : <strong>droit des affaires</strong> (sociétés, droit bancaire et financier, conflits entre associés), <strong>droit immobilier</strong> (baux, copropriétés, transactions), ainsi que <strong>droit des étrangers</strong>.</p><p>Maître Manuela DIABATE s'engage à défendre les intérêts de ses clients avec passion, rigueur et détermination, en leur offrant un accompagnement juridique sur mesure, à la hauteur de leurs enjeux.</p>$$,
  presentation_en = $$<p><strong>Manuela DIABATE</strong> is an attorney admitted to the <strong>Paris Bar</strong>, recognised for his commitment, rigour and pragmatic approach to the law. He advises and represents both individuals and companies, in advisory and litigation matters, with a particular ability to handle complex cases — including those with an international dimension.</p><p>Drawing on a professional path between <strong>Côte d'Ivoire</strong> and <strong>France</strong>, he has practised within leading law firms as well as within international corporations. These varied experiences have enabled him to develop a broad and pragmatic understanding of today's legal challenges.</p><p>A law graduate from Côte d'Ivoire, Manuela DIABATE has a <strong>strong command of OHADA law</strong> (Organisation for the Harmonisation of Business Law in Africa). Combined with his French legal practice, this expertise gives him a unique ability to bridge African and European legal systems and to handle demanding cross-border matters.</p><p>This dual Franco-African expertise allows him to address complex issues with precision across several fields: <strong>business law</strong> (corporate, banking and finance, shareholder disputes), <strong>real estate law</strong> (leases, co-ownership, transactions) and <strong>immigration law</strong>.</p><p>Manuela DIABATE is committed to defending his clients' interests with passion, rigour and determination, providing tailored legal support that matches the stakes at hand.</p>$$
WHERE is_founder = true;

-- Migration: 20260503021936_98a25153-a2c5-4c51-a624-f405d62e218c.sql
ALTER TABLE public.news_articles
ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Migration: 20260503024745_be3f9ed5-68d1-4d44-98fd-a8220cb27268.sql
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
DROP POLICY IF EXISTS "Staff manage ai_settings" ON public.ai_settings;
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
DROP POLICY IF EXISTS "Anyone can create a conversation" ON public.chat_conversations;
CREATE POLICY "Anyone can create a conversation"
  ON public.chat_conversations
  FOR INSERT
  TO public
  WITH CHECK (
    char_length(visitor_key) BETWEEN 16 AND 128
    AND status = 'open'
  );

-- Visitors can update their own conversation (to add email/name/phone or close it)
DROP POLICY IF EXISTS "Visitors update own conversation by key" ON public.chat_conversations;
CREATE POLICY "Visitors update own conversation by key"
  ON public.chat_conversations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (char_length(visitor_key) BETWEEN 16 AND 128);

-- Staff read & manage everything
DROP POLICY IF EXISTS "Staff read chat conversations" ON public.chat_conversations;
CREATE POLICY "Staff read chat conversations"
  ON public.chat_conversations
  FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff manage chat conversations" ON public.chat_conversations;
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
DROP POLICY IF EXISTS "Anyone can append messages to an open conversation" ON public.chat_messages;
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
DROP POLICY IF EXISTS "Staff read chat messages" ON public.chat_messages;
CREATE POLICY "Staff read chat messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff manage chat messages" ON public.chat_messages;
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


-- Migration: 20260503025216_bb856c18-e8ce-4e16-a2ef-c1ba0cb20748.sql
-- Remove the overly permissive update policy
DROP POLICY IF EXISTS "Visitors update own conversation by key" ON public.chat_conversations;

-- Secure RPC to let a visitor attach their contact info to THEIR conversation
CREATE OR REPLACE FUNCTION public.attach_visitor_info(
  _conversation_id uuid,
  _visitor_key text,
  _name text DEFAULT NULL,
  _email text DEFAULT NULL,
  _phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_name text := NULLIF(trim(coalesce(_name, '')), '');
  safe_email text := NULLIF(lower(trim(coalesce(_email, ''))), '');
  safe_phone text := NULLIF(trim(coalesce(_phone, '')), '');
BEGIN
  IF _visitor_key IS NULL OR char_length(_visitor_key) < 16 OR char_length(_visitor_key) > 128 THEN
    RAISE EXCEPTION 'Invalid visitor key';
  END IF;

  IF safe_email IS NOT NULL AND (char_length(safe_email) > 255 OR safe_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$') THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  IF safe_name IS NOT NULL AND char_length(safe_name) > 100 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;

  IF safe_phone IS NOT NULL AND char_length(safe_phone) > 40 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;

  UPDATE public.chat_conversations
  SET visitor_name = COALESCE(safe_name, visitor_name),
      visitor_email = COALESCE(safe_email, visitor_email),
      visitor_phone = COALESCE(safe_phone, visitor_phone),
      status = CASE WHEN safe_email IS NOT NULL THEN 'lead' ELSE status END,
      updated_at = now()
  WHERE id = _conversation_id
    AND visitor_key = _visitor_key
    AND status IN ('open','lead');
END;
$$;

REVOKE ALL ON FUNCTION public.attach_visitor_info(uuid, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.attach_visitor_info(uuid, text, text, text, text) TO anon, authenticated;

-- Lock down the internal trigger function — it should never be callable from the API
REVOKE ALL ON FUNCTION public.bump_conversation_on_message() FROM public, anon, authenticated;


-- Migration: 20260503025250_e4131d32-5e0c-44ff-9c31-494e26f7fb8b.sql
DROP VIEW IF EXISTS public.ai_settings_public;

CREATE OR REPLACE FUNCTION public.get_chatbot_public_settings()
RETURNS TABLE (
  enabled boolean,
  welcome_message_fr text,
  welcome_message_en text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT enabled, welcome_message_fr, welcome_message_en
  FROM public.ai_settings
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_chatbot_public_settings() TO anon, authenticated;


-- Migration: 20260503064209_ac52711c-7087-4adb-83a2-0d53cfb725db.sql
ALTER TABLE public.ai_settings
ADD COLUMN IF NOT EXISTS button_color text NOT NULL DEFAULT '#C8A35B',
ADD COLUMN IF NOT EXISTS button_icon_color text NOT NULL DEFAULT '#FFFFFF';

DROP FUNCTION IF EXISTS public.get_chatbot_public_settings();

CREATE OR REPLACE FUNCTION public.get_chatbot_public_settings()
 RETURNS TABLE(enabled boolean, welcome_message_fr text, welcome_message_en text, button_color text, button_icon_color text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT enabled, welcome_message_fr, welcome_message_en, button_color, button_icon_color
  FROM public.ai_settings
  LIMIT 1;
$function$;

-- Migration: 20260503092520_a4df4a9d-9b20-4190-add5-c66106fb19fd.sql
UPDATE public.expertises SET title = 'Droit pénal et droit pénal des affaires' WHERE id = '1769e9e5-6fb7-415b-b51a-028fa2c0992a';

-- Migration: 20260504071343_b6f93b98-0980-4bbf-8272-ef804bd67ade.sql

-- 1. Fix SECURITY DEFINER view: switch team_members_public to security_invoker
ALTER VIEW public.team_members_public SET (security_invoker = true);

-- 2. Add public SELECT policy on team_members for published rows, but
--    restrict column-level access so anon/authenticated cannot read
--    sensitive contact fields (email, phone, office_address, cv_url).
DROP POLICY IF EXISTS "Public can read published team members" ON public.team_members;
CREATE POLICY "Public can read published team members"
ON public.team_members
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Revoke broad SELECT, then grant only safe columns to anon/authenticated.
REVOKE SELECT ON public.team_members FROM anon, authenticated;
GRANT SELECT (
  id, name, role_fr, role_en, bio_fr, bio_en,
  presentation_fr, presentation_en, photo_url,
  linkedin_url, is_founder, published, sort_order,
  created_at, updated_at
) ON public.team_members TO anon, authenticated;

-- 3. Restrict ai_settings.api_key to admins only via column-level privileges.
--    Editors keep access to all other columns through existing RLS policy.
REVOKE SELECT, UPDATE ON public.ai_settings FROM anon, authenticated;
GRANT SELECT (
  id, enabled, provider, model,
  system_prompt_fr, system_prompt_en,
  welcome_message_fr, welcome_message_en,
  button_color, button_icon_color,
  max_messages_per_conversation,
  updated_by, updated_at
) ON public.ai_settings TO authenticated;
GRANT UPDATE (
  enabled, provider, model,
  system_prompt_fr, system_prompt_en,
  welcome_message_fr, welcome_message_en,
  button_color, button_icon_color,
  max_messages_per_conversation,
  updated_by, updated_at
) ON public.ai_settings TO authenticated;

-- Admin-only access to api_key column.
GRANT SELECT (api_key), UPDATE (api_key) ON public.ai_settings TO authenticated;
-- Use a restrictive RLS policy that only allows admins to touch api_key
-- via a row-level rule isn't possible per-column; enforce in app layer
-- by reading/writing api_key only from admin-gated edge functions.
-- We additionally tighten the RLS policy: editors can manage settings
-- but the api_key column is excluded from their column grants below.
-- Reset policies for clarity.
DROP POLICY IF EXISTS "Staff manage ai_settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Editors manage ai_settings (no api_key)" ON public.ai_settings;
CREATE POLICY "Editors manage ai_settings (no api_key)"
ON public.ai_settings
FOR ALL
TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- Revoke api_key column from non-admin staff: implement via separate role grants.
-- Since Postgres has no per-row column policy, we revoke api_key from
-- authenticated and grant only to admins through a SECURITY DEFINER helper.
REVOKE SELECT (api_key), UPDATE (api_key) ON public.ai_settings FROM authenticated;

-- 4. Lock down internal SECURITY DEFINER functions from public execution.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.bump_conversation_on_message() FROM anon, authenticated, public;


-- Migration: 20260504071452_0433ab01-d27f-46ff-89a9-3a102f210f82.sql

GRANT SELECT (api_key), UPDATE (api_key) ON public.ai_settings TO authenticated;


-- Migration: 20260505075124_ef3ee57b-1b4e-4052-9012-2e2bba15d4e3.sql
-- 1) Restrict ai_settings (which contains api_key) to admins only.
-- Editors no longer have direct table access; the public chatbot settings
-- remain available via the existing get_chatbot_public_settings() RPC.
DROP POLICY IF EXISTS "Editors manage ai_settings (no api_key)" ON public.ai_settings;

DROP POLICY IF EXISTS "Admins manage ai_settings" ON public.ai_settings;
CREATE POLICY "Admins manage ai_settings"
ON public.ai_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


-- 2) Stop exposing team_members PII (email, phone, office_address, linkedin)
-- to anonymous visitors. The public site already reads from the
-- team_members_public view, which excludes these columns.
DROP POLICY IF EXISTS "Public can read published team members" ON public.team_members;

-- Recreate the public view without security_invoker so it runs with the
-- view owner's privileges and can serve published team members to anon
-- users without re-exposing the underlying table.
DROP VIEW IF EXISTS public.team_members_public;

CREATE VIEW public.team_members_public
WITH (security_invoker = off) AS
SELECT
  id,
  name,
  role_fr,
  role_en,
  bio_fr,
  bio_en,
  presentation_fr,
  presentation_en,
  photo_url,
  cv_url,
  linkedin_url,
  is_founder,
  published,
  sort_order,
  created_at,
  updated_at
FROM public.team_members
WHERE published = true;

GRANT SELECT ON public.team_members_public TO anon, authenticated;

-- Migration: 20260505084441_4ca7def2-0800-46e9-8ef4-622a333143ce.sql
-- Restrict anonymous insertion into chat_messages.
-- All client message inserts go through the legal-chat edge function (service role),
-- so the public INSERT policy can be dropped to prevent conversation hijacking.
DROP POLICY IF EXISTS "Anyone can append messages to an open conversation" ON public.chat_messages;

-- Migration: 20260506111614_d5208ec9-80d4-4aaa-95ad-ec3ad8a45e4f.sql
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_image_url text;

CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(public.unaccent(coalesce(_input, ''))),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  )
$$;

UPDATE public.news_articles
SET slug = public.slugify(title) || '-' || substr(replace(id::text, '-', ''), 1, 6)
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS news_articles_slug_unique
  ON public.news_articles (slug)
  WHERE slug IS NOT NULL;

ALTER TABLE public.expertises
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_image_url text;

-- Migration: 20260507121938_9132aecf-656d-4b02-a5c9-0c6c627cb6f8.sql

CREATE TABLE public.landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT 'FR',
  expertise_slug text,
  title_fr text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  meta_description_fr text NOT NULL DEFAULT '',
  meta_description_en text NOT NULL DEFAULT '',
  h1_fr text NOT NULL DEFAULT '',
  h1_en text NOT NULL DEFAULT '',
  intro_fr text NOT NULL DEFAULT '',
  intro_en text NOT NULL DEFAULT '',
  content_fr text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  image_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published landing pages readable by everyone" ON public.landing_pages;
CREATE POLICY "Published landing pages readable by everyone"
  ON public.landing_pages FOR SELECT
  USING (published = true OR is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff manage landing pages" ON public.landing_pages;
CREATE POLICY "Staff manage landing pages"
  ON public.landing_pages FOR ALL TO authenticated
  USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER set_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_published ON public.landing_pages(published, sort_order);

-- Seed 12 geo-targeted pages
INSERT INTO public.landing_pages (slug, city, country, country_code, expertise_slug, title_fr, title_en, meta_description_fr, meta_description_en, h1_fr, h1_en, intro_fr, intro_en, content_fr, content_en, sort_order) VALUES

('avocat-droit-affaires-paris', 'Paris', 'France', 'FR', 'droit-des-affaires',
 'Avocat Droit des Affaires à Paris | Cabinet Manuela DIABATE',
 'Business Law Attorney in Paris | Manuela DIABATE Law Firm',
 'Avocat en droit des affaires à Paris : conseil aux entreprises, M&A, contrats, contentieux commercial. Cabinet Manuela DIABATE, expertise franco-africaine.',
 'Business law attorney in Paris: corporate advisory, M&A, contracts, commercial litigation. Manuela DIABATE, French-African expertise.',
 'Avocat en droit des affaires à Paris',
 'Business Law Attorney in Paris',
 'Le Cabinet Manuela DIABATE accompagne entreprises françaises et internationales à Paris en droit des affaires : structuration, opérations de croissance, contrats stratégiques et résolution des litiges commerciaux.',
 'Manuela DIABATE Law Firm assists French and international companies in Paris with business law: structuring, growth operations, strategic contracts and commercial dispute resolution.',
 E'## Nos services en droit des affaires à Paris\n\n- Conseil et structuration juridique des sociétés\n- Fusions-acquisitions (M&A) et opérations de capital\n- Négociation et rédaction de contrats commerciaux\n- Pactes d''associés, gouvernance, restructuration\n- Contentieux commercial et arbitrage\n\n## Pourquoi un avocat d''affaires à Paris ?\n\nParis reste la première place économique francophone. Notre cabinet, situé au cœur du 17e arrondissement, conseille PME, ETI et groupes internationaux sur leurs opérations en France et leur expansion vers l''Afrique francophone (zone OHADA).\n\n## Une expertise franco-africaine unique\n\nNous combinons une parfaite maîtrise du droit français avec une connaissance approfondie du droit OHADA et de la pratique des affaires en Côte d''Ivoire. Idéal pour les groupes opérant entre la France et l''Afrique de l''Ouest.',
 E'## Our business law services in Paris\n\n- Corporate structuring and advisory\n- Mergers and acquisitions (M&A)\n- Commercial contract drafting and negotiation\n- Shareholders agreements, governance, restructuring\n- Commercial litigation and arbitration\n\n## Why a business attorney in Paris?\n\nParis remains the leading francophone economic hub. Our firm, located in the heart of the 17th district, advises SMEs and international groups on their operations in France and expansion into French-speaking Africa (OHADA zone).\n\n## A unique French-African expertise\n\nWe combine deep mastery of French law with extensive knowledge of OHADA law and business practice in Côte d''Ivoire — ideal for groups operating between France and West Africa.',
 1),

('avocat-droit-affaires-abidjan', 'Abidjan', 'Côte d''Ivoire', 'CI', 'droit-des-affaires',
 'Avocat Droit des Affaires à Abidjan | Cabinet Manuela DIABATE',
 'Business Law Attorney in Abidjan | Manuela DIABATE Law Firm',
 'Avocat en droit des affaires à Abidjan : OHADA, M&A, contrats, contentieux. Cabinet international franco-ivoirien Manuela DIABATE.',
 'Business law attorney in Abidjan: OHADA, M&A, contracts, litigation. International French-Ivorian firm Manuela DIABATE.',
 'Avocat en droit des affaires à Abidjan',
 'Business Law Attorney in Abidjan',
 'Conseil juridique aux entreprises à Abidjan : implantation en Côte d''Ivoire, droit OHADA, opérations transfrontalières France-Afrique.',
 'Legal counsel for companies in Abidjan: setup in Côte d''Ivoire, OHADA law, France-Africa cross-border operations.',
 E'## Services pour entreprises à Abidjan\n\n- Création et structuration de sociétés en Côte d''Ivoire (SA, SARL, SAS OHADA)\n- Conformité OHADA et droit ivoirien\n- M&A et joint-ventures\n- Contrats commerciaux et distribution\n- Contentieux et arbitrage CCJA\n\n## Abidjan, hub économique de l''Afrique de l''Ouest\n\nAbidjan concentre les sièges régionaux des groupes internationaux opérant en zone UEMOA. Notre expertise franco-ivoirienne facilite vos investissements et opérations.',
 E'## Services for companies in Abidjan\n\n- Company formation in Côte d''Ivoire (OHADA SA, SARL, SAS)\n- OHADA and Ivorian law compliance\n- M&A and joint-ventures\n- Commercial and distribution contracts\n- Litigation and CCJA arbitration\n\n## Abidjan, West Africa''s economic hub\n\nAbidjan hosts the regional headquarters of international groups in the UEMOA zone. Our French-Ivorian expertise facilitates your investments and operations.',
 2),

('avocat-ohada-cote-divoire', 'Abidjan', 'Côte d''Ivoire', 'CI', 'droit-ohada',
 'Avocat OHADA en Côte d''Ivoire | Cabinet Manuela DIABATE',
 'OHADA Lawyer in Côte d''Ivoire | Manuela DIABATE Law Firm',
 'Avocat spécialiste du droit OHADA en Côte d''Ivoire : sociétés, sûretés, recouvrement, arbitrage CCJA. Cabinet Manuela DIABATE.',
 'OHADA law specialist in Côte d''Ivoire: companies, securities, debt recovery, CCJA arbitration. Manuela DIABATE Law Firm.',
 'Avocat OHADA en Côte d''Ivoire',
 'OHADA Lawyer in Côte d''Ivoire',
 'Expertise complète en droit OHADA pour les entreprises actives en Côte d''Ivoire et dans les 16 autres États membres : actes uniformes, contentieux, arbitrage CCJA.',
 'Full OHADA law expertise for companies operating in Côte d''Ivoire and the 16 other member states: uniform acts, litigation, CCJA arbitration.',
 E'## Notre expertise OHADA\n\n- Acte uniforme sur les sociétés commerciales et le GIE\n- Sûretés et garanties\n- Procédures collectives d''apurement du passif\n- Voies d''exécution et recouvrement\n- Arbitrage CCJA et médiation\n\n## Pourquoi le droit OHADA ?\n\nLe droit OHADA harmonise le droit des affaires dans 17 États africains. Une expertise indispensable pour sécuriser vos opérations en Côte d''Ivoire et au-delà.',
 E'## Our OHADA expertise\n\n- Uniform Act on commercial companies\n- Securities and guarantees\n- Collective insolvency proceedings\n- Enforcement and debt recovery\n- CCJA arbitration and mediation\n\n## Why OHADA law?\n\nOHADA law harmonizes business law across 17 African states — essential to secure your operations in Côte d''Ivoire and beyond.',
 3),

('avocat-droit-etrangers-france', 'Paris', 'France', 'FR', 'droit-des-etrangers',
 'Avocat Droit des Étrangers en France | Cabinet Manuela DIABATE',
 'Immigration Lawyer in France | Manuela DIABATE Law Firm',
 'Avocat en droit des étrangers à Paris : titres de séjour, naturalisation, regroupement familial, OQTF, asile. Cabinet Manuela DIABATE.',
 'Immigration lawyer in Paris: residence permits, naturalization, family reunification, OQTF, asylum. Manuela DIABATE Law Firm.',
 'Avocat en droit des étrangers en France',
 'Immigration Attorney in France',
 'Accompagnement complet en droit des étrangers : démarches préfectorales, contentieux, recours devant les tribunaux administratifs et la CNDA.',
 'Comprehensive immigration law support: prefecture procedures, litigation, appeals before administrative courts and the CNDA.',
 E'## Nos services en droit des étrangers\n\n- Visas et titres de séjour (talent, salarié, vie privée et familiale, étudiant)\n- Naturalisation française\n- Regroupement familial\n- Recours contre OQTF et refus de séjour\n- Demande d''asile et recours CNDA\n\n## Une approche bilingue et internationale\n\nNotre cabinet accompagne particuliers et entreprises (mobilité internationale) en français et en anglais, avec une attention particulière aux ressortissants de Côte d''Ivoire et d''Afrique francophone.',
 E'## Our immigration law services\n\n- Visas and residence permits (talent, employee, private life, student)\n- French naturalization\n- Family reunification\n- Appeals against deportation orders\n- Asylum applications and CNDA appeals\n\n## A bilingual and international approach\n\nWe assist individuals and companies (international mobility) in French and English, with special attention to nationals from Côte d''Ivoire and French-speaking Africa.',
 4),

('avocat-immobilier-paris', 'Paris', 'France', 'FR', 'droit-immobilier',
 'Avocat Droit Immobilier à Paris | Cabinet Manuela DIABATE',
 'Real Estate Attorney in Paris | Manuela DIABATE Law Firm',
 'Avocat en droit immobilier à Paris : transactions, baux, copropriété, contentieux locatif et construction. Cabinet Manuela DIABATE.',
 'Real estate attorney in Paris: transactions, leases, co-ownership, rental and construction litigation.',
 'Avocat en droit immobilier à Paris',
 'Real Estate Attorney in Paris',
 'Conseil et contentieux en droit immobilier à Paris pour particuliers, investisseurs et professionnels.',
 'Real estate advisory and litigation in Paris for individuals, investors and professionals.',
 E'## Nos services en droit immobilier\n\n- Acquisitions et ventes immobilières\n- Baux d''habitation et commerciaux\n- Copropriété et syndic\n- Contentieux locatif et expulsions\n- Droit de la construction et VEFA',
 E'## Our real estate services\n\n- Property acquisitions and sales\n- Residential and commercial leases\n- Co-ownership matters\n- Rental disputes and evictions\n- Construction law and off-plan sales',
 5),

('avocat-fiscaliste-paris', 'Paris', 'France', 'FR', 'droit-fiscal',
 'Avocat Fiscaliste à Paris | Cabinet Manuela DIABATE',
 'Tax Attorney in Paris | Manuela DIABATE Law Firm',
 'Avocat fiscaliste à Paris : optimisation fiscale, contrôles, contentieux, fiscalité internationale France-Afrique. Cabinet Manuela DIABATE.',
 'Tax attorney in Paris: tax optimization, audits, litigation, France-Africa international taxation.',
 'Avocat fiscaliste à Paris',
 'Tax Attorney in Paris',
 'Conseil fiscal stratégique pour entreprises et particuliers, fiscalité internationale et contentieux.',
 'Strategic tax advisory for companies and individuals, international taxation and litigation.',
 E'## Nos services en droit fiscal\n\n- Optimisation et stratégie fiscale\n- Contrôles fiscaux et redressements\n- Contentieux fiscal\n- Fiscalité internationale et conventions\n- Prix de transfert et opérations transfrontalières',
 E'## Our tax law services\n\n- Tax strategy and optimization\n- Tax audits and reassessments\n- Tax litigation\n- International taxation and treaties\n- Transfer pricing and cross-border operations',
 6),

('avocat-arbitrage-international-paris', 'Paris', 'France', 'FR', 'arbitrage',
 'Avocat Arbitrage International à Paris | Cabinet Manuela DIABATE',
 'International Arbitration Attorney in Paris | Manuela DIABATE',
 'Avocat en arbitrage international à Paris : CCI, CCJA OHADA, ad hoc. Représentation et conseil franco-africain.',
 'International arbitration attorney in Paris: ICC, OHADA CCJA, ad hoc. French-African representation and counsel.',
 'Avocat en arbitrage international à Paris',
 'International Arbitration Attorney in Paris',
 'Représentation dans les procédures d''arbitrage commercial international, expertise CCI et CCJA OHADA.',
 'Representation in international commercial arbitration proceedings, ICC and OHADA CCJA expertise.',
 E'## Nos services en arbitrage\n\n- Arbitrage CCI (Chambre de Commerce Internationale)\n- Arbitrage CCJA OHADA\n- Arbitrages ad hoc UNCITRAL\n- Médiation commerciale internationale\n- Exécution des sentences arbitrales',
 E'## Our arbitration services\n\n- ICC arbitration\n- OHADA CCJA arbitration\n- UNCITRAL ad hoc arbitration\n- International commercial mediation\n- Enforcement of arbitral awards',
 7),

('avocat-investissements-afrique-france', 'Paris', 'France', 'FR', 'droit-des-affaires',
 'Avocat Investissements Afrique-France | Cabinet Manuela DIABATE',
 'Africa-France Investment Attorney | Manuela DIABATE Law Firm',
 'Accompagnement juridique des investissements entre l''Afrique et la France : structuration, fiscalité, conformité OHADA.',
 'Legal support for investments between Africa and France: structuring, taxation, OHADA compliance.',
 'Avocat investissements Afrique – France',
 'Africa-France Investment Attorney',
 'Cabinet spécialisé dans les flux d''investissements entre la France et l''Afrique francophone : structuration juridique, fiscalité, conformité.',
 'Firm specialized in investment flows between France and French-speaking Africa: legal structuring, taxation, compliance.',
 E'## Notre accompagnement\n\n- Structuration de holdings franco-africaines\n- Joint-ventures et partenariats\n- Investissements directs étrangers en zone OHADA\n- Levées de fonds et financements\n- Conformité réglementaire (anti-blanchiment, sanctions)\n\n## Pourquoi un cabinet franco-africain ?\n\nLes investissements entre la France et l''Afrique exigent une double expertise. Nous offrons un point de contact unique pour vos opérations dans les deux juridictions.',
 E'## Our support\n\n- Franco-African holding structuring\n- Joint-ventures and partnerships\n- Foreign direct investments in OHADA zone\n- Fundraising and financing\n- Regulatory compliance (AML, sanctions)\n\n## Why a French-African firm?\n\nInvestments between France and Africa require dual expertise. We offer a single point of contact for your operations in both jurisdictions.',
 8),

('avocat-penal-paris', 'Paris', 'France', 'FR', 'droit-penal',
 'Avocat Pénal à Paris | Cabinet Manuela DIABATE',
 'Criminal Defense Attorney in Paris | Manuela DIABATE',
 'Avocat pénaliste à Paris : défense, garde à vue, instruction, comparution immédiate, cour d''assises.',
 'Criminal defense attorney in Paris: custody, investigation, immediate appearance, assize court.',
 'Avocat pénaliste à Paris',
 'Criminal Defense Attorney in Paris',
 'Défense pénale en toutes matières : droit commun, affaires, étrangers.',
 'Criminal defense in all matters: common law, business crime, immigration-related.',
 E'## Nos interventions\n\n- Garde à vue et défense pénale d''urgence\n- Instruction et mise en examen\n- Comparution immédiate et correctionnelle\n- Cour d''assises\n- Droit pénal des affaires',
 E'## Our interventions\n\n- Police custody and emergency criminal defense\n- Judicial investigation\n- Immediate appearance and criminal court\n- Assize court\n- Business criminal law',
 9),

('avocat-france-cote-divoire', 'Paris / Abidjan', 'France & Côte d''Ivoire', 'FR', NULL,
 'Avocat France – Côte d''Ivoire | Cabinet Manuela DIABATE',
 'France – Côte d''Ivoire Lawyer | Manuela DIABATE Law Firm',
 'Cabinet d''avocats France – Côte d''Ivoire : affaires, OHADA, immigration, fiscalité, contentieux transfrontalier.',
 'France – Côte d''Ivoire law firm: business, OHADA, immigration, taxation, cross-border litigation.',
 'Cabinet d''avocats France – Côte d''Ivoire',
 'France – Côte d''Ivoire Law Firm',
 'Le pont juridique entre Paris et Abidjan : un cabinet, deux juridictions, une expertise franco-ivoirienne reconnue.',
 'The legal bridge between Paris and Abidjan: one firm, two jurisdictions, recognized French-Ivorian expertise.',
 E'## Pourquoi nous choisir ?\n\n- Expertise simultanée du droit français et du droit OHADA / ivoirien\n- Équipe bilingue français / anglais\n- Réseau de correspondants en Côte d''Ivoire\n- Accompagnement des particuliers et des entreprises\n\n## Domaines d''intervention\n\n- Droit des affaires & M&A transfrontaliers\n- Investissements et joint-ventures\n- Immigration et mobilité internationale\n- Fiscalité internationale\n- Arbitrage et contentieux',
 E'## Why choose us?\n\n- Combined expertise in French and OHADA / Ivorian law\n- Bilingual French / English team\n- Network of correspondents in Côte d''Ivoire\n- Support for individuals and companies\n\n## Practice areas\n\n- Cross-border business law and M&A\n- Investments and joint-ventures\n- Immigration and international mobility\n- International taxation\n- Arbitration and litigation',
 10),

('avocat-recouvrement-creances-abidjan', 'Abidjan', 'Côte d''Ivoire', 'CI', 'droit-des-affaires',
 'Avocat Recouvrement de Créances à Abidjan | Manuela DIABATE',
 'Debt Recovery Attorney in Abidjan | Manuela DIABATE',
 'Recouvrement amiable et judiciaire de créances en Côte d''Ivoire selon le droit OHADA. Cabinet Manuela DIABATE.',
 'Amicable and judicial debt recovery in Côte d''Ivoire under OHADA law.',
 'Avocat recouvrement de créances à Abidjan',
 'Debt Recovery Attorney in Abidjan',
 'Procédures simplifiées et voies d''exécution OHADA pour récupérer vos créances en Côte d''Ivoire.',
 'OHADA simplified procedures and enforcement to recover your claims in Côte d''Ivoire.',
 E'## Nos services\n\n- Mise en demeure et négociation amiable\n- Procédure d''injonction de payer (OHADA)\n- Saisies et voies d''exécution\n- Procédures collectives\n- Recouvrement transfrontalier France – Afrique',
 E'## Our services\n\n- Formal notice and amicable negotiation\n- OHADA injunction to pay procedure\n- Seizures and enforcement\n- Insolvency proceedings\n- France-Africa cross-border recovery',
 11),

('avocat-creation-entreprise-cote-divoire', 'Abidjan', 'Côte d''Ivoire', 'CI', 'droit-des-affaires',
 'Création d''Entreprise en Côte d''Ivoire — Avocat | Manuela DIABATE',
 'Company Formation in Côte d''Ivoire — Attorney | Manuela DIABATE',
 'Avocat pour la création d''entreprise en Côte d''Ivoire : SA, SARL, SAS OHADA, immatriculation CEPICI.',
 'Attorney for company formation in Côte d''Ivoire: OHADA SA, SARL, SAS, CEPICI registration.',
 'Création d''entreprise en Côte d''Ivoire',
 'Company Formation in Côte d''Ivoire',
 'Accompagnement complet pour créer votre société en Côte d''Ivoire : choix de la forme, statuts, immatriculation, conformité.',
 'Complete support to set up your company in Côte d''Ivoire: form selection, articles, registration, compliance.',
 E'## Étapes de création\n\n1. Choix de la forme sociale (SA, SARL, SAS OHADA, succursale)\n2. Rédaction des statuts conformes à l''Acte uniforme OHADA\n3. Immatriculation au CEPICI (guichet unique)\n4. Ouverture de comptes bancaires\n5. Conformité fiscale et sociale\n\n## Pour qui ?\n\nInvestisseurs étrangers, groupes français souhaitant s''implanter en Afrique de l''Ouest, entrepreneurs ivoiriens.',
 E'## Formation steps\n\n1. Choice of legal form (OHADA SA, SARL, SAS, branch)\n2. Drafting of OHADA-compliant articles\n3. Registration with CEPICI (one-stop shop)\n4. Bank account opening\n5. Tax and social compliance\n\n## For whom?\n\nForeign investors, French groups expanding into West Africa, Ivorian entrepreneurs.',
 12) ON CONFLICT (slug) DO NOTHING;


-- Migration: 20260509005622_f706926e-f3ee-476e-b977-982f8679c0f6.sql

-- Fix invalid expertise_slug references on existing landing pages
UPDATE public.landing_pages SET expertise_slug = 'droit-penal-et-droit-penal-des-affaires'
WHERE slug = 'avocat-penal-paris';

-- droit-fiscal and arbitrage are not in expertises table → set NULL to avoid broken cross-links
UPDATE public.landing_pages SET expertise_slug = NULL
WHERE expertise_slug IN ('droit-fiscal', 'arbitrage');

-- Add 3 missing geo landing pages for the remaining expertises
INSERT INTO public.landing_pages
(slug, city, country, country_code, expertise_slug, title_fr, title_en, meta_description_fr, meta_description_en, h1_fr, h1_en, intro_fr, intro_en, content_fr, content_en, sort_order, published)
VALUES
(
  'avocat-droit-bancaire-financier-paris', 'Paris', 'France', 'FR', 'droit-bancaire-et-financier',
  'Avocat droit bancaire et financier à Paris | Cabinet Manuela DIABATE',
  'Banking & Finance Lawyer in Paris | Manuela DIABATE Law Firm',
  'Avocat en droit bancaire et financier à Paris : financements, sûretés, contentieux bancaires, conformité. Conseil aux banques, emprunteurs et investisseurs.',
  'Banking and finance lawyer in Paris: financing, securities, banking litigation and compliance for banks, borrowers and investors.',
  'Avocat en droit bancaire et financier à Paris',
  'Banking & Finance Lawyer in Paris',
  'Le cabinet Manuela DIABATE conseille à Paris les établissements bancaires, emprunteurs et investisseurs sur l''ensemble des opérations de financement et contentieux bancaires.',
  'Manuela DIABATE Law Firm advises in Paris banks, borrowers and investors on all financing operations and banking disputes.',
  E'## Une expertise pointue en droit bancaire à Paris\n\nNotre cabinet intervient à Paris sur les financements structurés, les sûretés, le contentieux bancaire et la conformité réglementaire (ACPR, AMF).\n\n## Domaines couverts\n\n- Financement d''acquisition, financement de projet, syndication\n- Sûretés réelles et personnelles, garanties internationales\n- Contentieux du crédit, recouvrement bancaire\n- Conformité LCB-FT, sanctions internationales\n\n## Pourquoi choisir notre cabinet à Paris\n\nUne double culture France / Afrique précieuse pour les opérations transfrontalières.',
  E'## Banking law expertise in Paris\n\nWe handle structured financing, securities, banking litigation and regulatory compliance (ACPR, AMF).\n\n## Areas covered\n\n- Acquisition finance, project finance, syndication\n- Personal and real securities, international guarantees\n- Credit litigation, banking recovery\n- AML/CFT compliance, international sanctions',
  20, true
),
(
  'avocat-procedures-collectives-paris', 'Paris', 'France', 'FR', 'surendettement-et-procedure-collective',
  'Avocat procédures collectives & surendettement à Paris',
  'Insolvency & Restructuring Lawyer in Paris',
  'Avocat à Paris en procédures collectives : sauvegarde, redressement, liquidation, surendettement. Accompagnement des entreprises en difficulté et particuliers.',
  'Paris lawyer for insolvency proceedings: safeguard, judicial recovery, liquidation and over-indebtedness for distressed companies and individuals.',
  'Avocat procédures collectives et surendettement à Paris',
  'Insolvency & Restructuring Lawyer in Paris',
  'Le cabinet Manuela DIABATE accompagne à Paris les entreprises en difficulté et les particuliers surendettés à travers les procédures amiables et judiciaires.',
  'We assist Paris distressed companies and over-indebted individuals through amicable and judicial proceedings.',
  E'## Restructuration et procédures collectives à Paris\n\nMandat ad hoc, conciliation, sauvegarde, redressement et liquidation judiciaire devant les tribunaux de Paris.\n\n## Notre intervention\n\n- Diagnostic et stratégie de restructuration\n- Négociation avec les créanciers et établissements bancaires\n- Représentation devant le tribunal de commerce\n- Procédure de surendettement des particuliers (commission Banque de France)',
  E'## Restructuring & insolvency in Paris\n\nAd hoc mandate, conciliation, safeguard, judicial recovery and liquidation before Paris courts.\n\n## Our work\n\n- Restructuring diagnosis and strategy\n- Negotiation with creditors and banks\n- Representation before the Commercial Court\n- Personal over-indebtedness procedure',
  21, true
),
(
  'avocat-petrolier-minier-abidjan', 'Abidjan', 'Côte d''Ivoire', 'CI', 'droit-petrolier-et-minier',
  'Avocat droit pétrolier et minier à Abidjan | Manuela DIABATE',
  'Oil, Gas & Mining Lawyer in Abidjan | Manuela DIABATE',
  'Avocat en droit pétrolier et minier à Abidjan : contrats E&P, codes miniers, fiscalité extractive, contentieux et arbitrages. Conseil opérateurs et États.',
  'Oil, gas and mining lawyer in Abidjan: E&P contracts, mining codes, extractive taxation, disputes and arbitration for operators and States.',
  'Avocat en droit pétrolier et minier à Abidjan',
  'Oil, Gas & Mining Lawyer in Abidjan',
  'Le cabinet Manuela DIABATE conseille à Abidjan les compagnies pétrolières, minières et les États sur les contrats et la régulation du secteur extractif.',
  'We advise in Abidjan oil & mining companies and States on contracts and regulation of the extractive sector.',
  E'## Une expertise rare des industries extractives\n\nNous intervenons sur les contrats de partage de production, conventions minières, joint-ventures et arbitrages internationaux liés aux ressources naturelles.\n\n## Domaines couverts\n\n- Contrats E&P, PSC, conventions minières\n- Fiscalité pétrolière et minière, local content\n- Conformité environnementale et sociale\n- Contentieux et arbitrage CIRDI / CCI\n\n## Pourquoi Abidjan\n\nUne plateforme stratégique pour les opérations en Afrique de l''Ouest et zone OHADA.',
  E'## Rare expertise in extractive industries\n\nWe handle PSCs, mining conventions, joint-ventures and international arbitration related to natural resources.\n\n## Areas covered\n\n- E&P contracts, PSC, mining conventions\n- Oil and mining taxation, local content\n- Environmental & social compliance\n- ICSID / ICC arbitration',
  22, true
) ON CONFLICT (slug) DO NOTHING;


-- Migration: 20260509010127_f42e1b52-e4f2-4066-81c3-738e9f9ea22e.sql

UPDATE public.landing_pages
SET slug = 'avocat-fiscalite-affaires-paris',
    expertise_slug = 'droit-des-affaires'
WHERE slug = 'avocat-fiscaliste-paris';

UPDATE public.landing_pages
SET slug = 'avocat-arbitrage-ohada-paris',
    expertise_slug = 'droit-ohada'
WHERE slug = 'avocat-arbitrage-international-paris';


-- Migration: 20260509020432_81fade47-163c-4099-a32e-542e3952c60a.sql

-- Editorial AI assistant settings (separate from chatbot ai_settings)
CREATE TABLE IF NOT EXISTS public.editorial_ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT true,
  provider text NOT NULL DEFAULT 'lovable',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  api_key text,
  firm_context text NOT NULL DEFAULT '',
  system_prompt_fr text NOT NULL DEFAULT '',
  system_prompt_en text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'professionnel, précis, sobre, accessible',
  target_audience text NOT NULL DEFAULT 'décideurs, chefs d''entreprise, investisseurs',
  brand_keywords text[] NOT NULL DEFAULT ARRAY[]::text[],
  news_min_words integer NOT NULL DEFAULT 180,
  news_max_words integer NOT NULL DEFAULT 400,
  article_min_words integer NOT NULL DEFAULT 600,
  article_max_words integer NOT NULL DEFAULT 1200,
  seo_title_min integer NOT NULL DEFAULT 50,
  seo_title_max integer NOT NULL DEFAULT 60,
  seo_desc_min integer NOT NULL DEFAULT 140,
  seo_desc_max integer NOT NULL DEFAULT 160,
  temperature numeric NOT NULL DEFAULT 0.7,
  max_retries integer NOT NULL DEFAULT 2,
  request_timeout_ms integer NOT NULL DEFAULT 60000,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.editorial_ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage editorial_ai_settings" ON public.editorial_ai_settings;
CREATE POLICY "Admins manage editorial_ai_settings"
ON public.editorial_ai_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff read editorial_ai_settings" ON public.editorial_ai_settings;
CREATE POLICY "Staff read editorial_ai_settings"
ON public.editorial_ai_settings
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE TRIGGER editorial_ai_settings_set_updated_at
BEFORE UPDATE ON public.editorial_ai_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with one row using the previous in-code defaults
INSERT INTO public.editorial_ai_settings (firm_context, system_prompt_fr, system_prompt_en, brand_keywords)
SELECT
  'Tu rédiges pour le Cabinet Manuela DIABATE, cabinet d''avocats international basé à Paris (3 avenue des Ternes, 75017). Domaines : droit des affaires, OHADA, droit bancaire et financier, droit immobilier, droit pénal des affaires, droit des étrangers, fiscalité, arbitrage international. Forte présence France ↔ Côte d''Ivoire / Afrique de l''Ouest.',
  'Reste factuel : pas de citation de jurisprudence inventée, pas de chiffres inventés. Privilégie un ton clair pour des décideurs et chefs d''entreprise.',
  'Stay factual: do not invent case law or figures. Keep a clear, precise tone for executives and decision makers.',
  ARRAY['Cabinet Manuela DIABATE','OHADA','droit des affaires','arbitrage international','Paris','Abidjan']
WHERE NOT EXISTS (SELECT 1 FROM public.editorial_ai_settings);


-- Migration: 20260519180313_fb56e08e-5444-44d9-bf3b-4119b8cccbfa.sql
DROP POLICY IF EXISTS "Public can read published team members" ON public.team_members;
CREATE POLICY "Public can read published team members"
ON public.team_members
FOR SELECT
TO anon, authenticated
USING (published = true);

-- Migration: 20260519182014_e3456c84-d4bd-4108-a569-10335521c8ad.sql
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;

