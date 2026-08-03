
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
