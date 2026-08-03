-- Script de mise à jour massive pour remplacer les anciens noms restants dans la base de données
-- Remplace "VANGAH" par "DIABATE" et "Sylvestre" par "Maître"

-- Table: team_members
UPDATE public.team_members
SET 
  name = REPLACE(REPLACE(REPLACE(REPLACE(name, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  bio_fr = REPLACE(REPLACE(REPLACE(REPLACE(bio_fr, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  bio_en = REPLACE(REPLACE(REPLACE(REPLACE(bio_en, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  presentation_fr = REPLACE(REPLACE(REPLACE(REPLACE(presentation_fr, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  presentation_en = REPLACE(REPLACE(REPLACE(REPLACE(presentation_en, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître');

-- Table: site_content
UPDATE public.site_content
SET 
  value = REPLACE(REPLACE(REPLACE(REPLACE(value, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître');

-- Table: expertises
UPDATE public.expertises
SET 
  title = REPLACE(REPLACE(REPLACE(REPLACE(title, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  tagline = REPLACE(REPLACE(REPLACE(REPLACE(tagline, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  intro = REPLACE(REPLACE(REPLACE(REPLACE(intro, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  conclusion = REPLACE(REPLACE(REPLACE(REPLACE(conclusion, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  approach = REPLACE(REPLACE(REPLACE(REPLACE(approach, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître');

-- Table: news_articles
UPDATE public.news_articles
SET 
  title = REPLACE(REPLACE(REPLACE(REPLACE(title, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  excerpt = REPLACE(REPLACE(REPLACE(REPLACE(excerpt, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  body = REPLACE(REPLACE(REPLACE(REPLACE(body, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître');

-- Table: contact_info
UPDATE public.contact_info
SET 
  cabinet_name_fr = REPLACE(REPLACE(REPLACE(REPLACE(cabinet_name_fr, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître'),
  cabinet_name_en = REPLACE(REPLACE(REPLACE(REPLACE(cabinet_name_en, 'VANGAH', 'DIABATE'), 'Vangah', 'Diabate'), 'Sylvestre', 'Maître'), 'SYLVESTRE', 'Maître');

-- Note: Ce script garantit que même les données précédemment insérées dans la base de données 
-- et protégées par les clauses ON CONFLICT sont mises à jour.
