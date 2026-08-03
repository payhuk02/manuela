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