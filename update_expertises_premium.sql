DELETE FROM public.expertises;

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-des-etrangers-et-asile', 
  'Droit des étrangers et Droit de l''Asile', 
  'Globe', 
  'Accompagnement et défense de vos droits fondamentaux sur le territoire français.', 
  'Notre cabinet vous accompagne dans toutes vos démarches d''immigration, d''asile et de nationalité. Que ce soit pour une régularisation, un contentieux ou une urgence, nous mettons notre expertise au service de vos droits.', 
  'Une approche humaine, réactive et stratégique face aux complexités de l''administration française.', 
  'N''attendez pas qu''une situation se dégrade, contactez-nous pour sécuriser votre statut en France.', 
  '[{"title":"Demandes de titres et regroupement familial","content":"Nous vous assistons pour toute demande de visa d''entrée, de titre de séjour, de régularisation, ainsi que pour l''introduction d''une demande de regroupement familial. Nous gérons également les dossiers de nationalité et de naturalisation."},{"title":"Mesures d''éloignement et urgences","content":"Intervention rapide pour contester un refus de titre, une Obligation de Quitter le Territoire Français (OQTF), une Interdiction de Retour sur le Territoire Français (IRTF) ou un Signalement dans le Système Schengen (SIS). Nous vous assistons en rétention administrative, devant le Juge des libertés et de la détention (JLD), et les tribunaux administratifs."},{"title":"Droit d''asile","content":"Préparation de l''entretien à l''OFPRA, rédaction du recours devant la Cour Nationale du Droit d''Asile (CNDA) et assistance à l''audience. Nous vous défendons pour l''obtention du statut de réfugié, la protection subsidiaire, et la demande de réexamen."}]'::jsonb, 
  0, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-de-la-famille', 
  'Droit de la famille', 
  'Heart', 
  'Protection de vos intérêts et de ceux de vos enfants dans les moments clés de la vie familiale.', 
  'Le droit de la famille touche à votre intimité. Notre cabinet vous garantit un accompagnement rigoureux et bienveillant pour toutes les procédures liées à la séparation, à la filiation et à l''autorité parentale.', 
  'Privilégier l''apaisement tout en défendant fermement vos droits patrimoniaux et parentaux.', 
  'Confiez-nous votre situation familiale pour une résolution juste et équilibrée.', 
  '[{"title":"Divorce et séparation","content":"Assistance dans tous types de divorces : divorce par consentement mutuel, divorce pour faute, divorce pour altération définitive du lien conjugal, et divorce pour acceptation du principe de la rupture."},{"title":"Droit des enfants","content":"Organisation de la résidence habituelle, fixation des droits de visite et d''hébergement, et calcul de la contribution à l''éducation et à l''entretien de l''enfant. Nous veillons aux droits et devoirs des parents vis-à-vis de leur enfant mineur."},{"title":"Adoption et filiation","content":"Accompagnement dans les procédures d''adoption (simple ou plénière) et les actions relatives à l''établissement ou la contestation de la filiation."}]'::jsonb, 
  1, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-administratif-et-fonction-publique', 
  'Droit administratif et Fonction Publique', 
  'Building', 
  'Votre bouclier face à l''administration et la défense de votre carrière publique.', 
  'Nous intervenons pour protéger les droits des citoyens et des agents publics face aux décisions de l''État, des collectivités ou des établissements hospitaliers, que ce soit en conseil ou en contentieux.', 
  'Une maîtrise technique des rouages administratifs pour faire plier l''arbitraire ou négocier efficacement.', 
  'Ne restez pas seul face à l''administration. Contactez-nous pour faire valoir vos droits.', 
  '[{"title":"Contentieux administratif et urgences","content":"Recours gracieux, RAPO, recours pour excès de pouvoir, annulation de décisions, procédures d''urgence (référé suspension, référé liberté, référé provision). Nous agissons devant le Tribunal administratif, la Cour administrative d''appel et le Conseil d''État."},{"title":"Responsabilité administrative et médicale","content":"Action en indemnisation pour illégalité fautive, préjudices causés par l''administration, défaut d''entretien d''un ouvrage public. Nous défendons également les victimes d''erreurs ou fautes médicales impliquant les établissements publics de santé."},{"title":"Droit de la fonction publique","content":"Assistance sur le déroulement de carrière, la rémunération, la rupture conventionnelle, et les sanctions disciplinaires. Nous contestons les licenciements pour inaptitude, les refus de CITIS ou maladie professionnelle, et agissons contre le harcèlement ou la discrimination au travail."},{"title":"Agréments et police administrative","content":"Recours contre les refus d''agrément ou cartes professionnelles (CNAPS, sécurité privée). Contestation des mesures de police administrative (arrêtés municipaux, décisions préfectorales, interdictions diverses)."}]'::jsonb, 
  2, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-du-travail', 
  'Droit du travail', 
  'Briefcase', 
  'Défense de vos intérêts professionnels et résolution des conflits au travail.', 
  'Que vous soyez cadre ou employé, le monde du travail peut générer des situations complexes et conflictuelles. Nous vous accompagnons pour sécuriser votre départ ou faire valoir vos droits en justice.', 
  'Combativité devant le Conseil de prud''hommes et recherche d''accords transactionnels optimisés.', 
  'Un conflit au travail ? Parlons-en pour définir la meilleure stratégie de défense.', 
  '[{"title":"Rupture du contrat de travail","content":"Accompagnement stratégique pour la négociation d''une rupture conventionnelle ou d''un accord amiable, afin de garantir vos intérêts financiers et professionnels."},{"title":"Contentieux prud''homal","content":"Contestation de licenciement (abusif, économique, pour faute), action en résiliation judiciaire du contrat de travail, et défense de vos droits devant le Conseil de prud''hommes et la Cour d''appel."},{"title":"Souffrance au travail","content":"Assistance et actions en justice dans les situations de harcèlement moral ou sexuel, ainsi que pour la reconnaissance des discriminations au travail."}]'::jsonb, 
  3, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-du-dommage-corporel', 
  'Droit du dommage corporel', 
  'Shield', 
  'Obtenir la réparation intégrale de vos préjudices après un accident.', 
  'Être victime d''un accident ou d''une agression bouleverse une vie. Notre rôle est de vous soulager du fardeau administratif et judiciaire pour obtenir la juste et complète indemnisation de l''ensemble de vos préjudices.', 
  'Indépendance totale vis-à-vis des compagnies d''assurance et collaboration avec des médecins-conseils.', 
  'Nous mettons notre force juridique au service de votre reconstruction.', 
  '[{"title":"Accidents de la route et de la vie","content":"Indemnisation des victimes d''accidents de la circulation (loi Badinter) et des accidents de la vie courante. Nous vous assistons lors des expertises médicales pour chiffrer précisément vos préjudices."},{"title":"Agressions et attentats","content":"Accompagnement des victimes devant les juridictions pénales (constitution de partie civile) et devant la Commission d''Indemnisation des Victimes d''Infractions (CIVI) ou le FGTI."},{"title":"Accidents médicaux","content":"Assistance dans le cadre d''erreurs médicales, d''infections nosocomiales ou d''aléas thérapeutiques, tant devant les tribunaux que devant les Commissions de Conciliation et d''Indemnisation (CCI)."}]'::jsonb, 
  4, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-ohada', 
  'Droit OHADA', 
  'Scale', 
  'Sécurisation de vos investissements et de vos activités commerciales en Afrique.', 
  'Le droit OHADA (Organisation pour l''Harmonisation en Afrique du Droit des Affaires) offre un cadre juridique unifié dans 17 pays africains. Nous vous accompagnons pour y investir et opérer en toute sécurité juridique.', 
  'Une expertise pointue des Actes uniformes couplée à une connaissance fine du tissu économique ouest-africain.', 
  'Votre projet d''investissement mérite la meilleure ingénierie juridique. Consultons-nous.', 
  '[{"title":"Structuration et création de sociétés","content":"Conseil dans le choix de la forme sociale, rédaction des statuts, et immatriculation (RCCM). Nous accompagnons les investisseurs étrangers pour leur implantation en zone OHADA (notamment en Côte d''Ivoire)."},{"title":"Contrats et sûretés commerciales","content":"Rédaction et audit de vos contrats d''affaires, constitution et réalisation des sûretés (gages, hypothèques) pour garantir vos transactions."},{"title":"Recouvrement et voies d''exécution","content":"Procédures rapides de recouvrement de créances (injonction de payer) et mesures d''exécution forcée (saisies) pour protéger votre trésorerie face aux débiteurs défaillants."}]'::jsonb, 
  5, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-penal-et-affaires', 
  'Droit pénal et Pénal des affaires', 
  'Gavel', 
  'Une défense pénale implacable, pour les particuliers comme pour les dirigeants.', 
  'Le risque pénal est omniprésent, tant dans la vie privée que dans la sphère de l''entreprise. Notre cabinet assure une défense combative et stratégique à tous les stades de la procédure, que vous soyez mis en cause ou victime.', 
  'Rigueur procédurale absolue et préparation minutieuse des audiences.', 
  'Face à l''urgence pénale, le temps est un facteur clé. Sollicitez notre intervention immédiate.', 
  '[{"title":"Droit pénal général","content":"Assistance en garde à vue, lors des auditions libres, devant le Juge d''instruction et devant les juridictions de jugement (Tribunal de Police, Tribunal Correctionnel, Cour d''Assises)."},{"title":"Droit pénal des affaires","content":"Défense des dirigeants et des entreprises face aux infractions financières et astucieuses : abus de biens sociaux, abus de confiance, escroquerie, faux et usage de faux, corruption et blanchiment."},{"title":"Défense des victimes","content":"Constitution de partie civile, accompagnement durant l''instruction et à l''audience, pour garantir que votre voix soit entendue et vos souffrances indemnisées."}]'::jsonb, 
  6, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-immobilier', 
  'Droit Immobilier', 
  'Home', 
  'Protection de vos actifs immobiliers et résolution de vos litiges fonciers.', 
  'L''immobilier représente souvent l''investissement de toute une vie ou le cœur de votre activité commerciale. Nous sécurisons vos opérations et défendons vos droits face aux locataires, constructeurs ou copropriétaires.', 
  'Pragmatisme et réactivité pour préserver la rentabilité et l''intégrité de votre patrimoine.', 
  'Un litige immobilier ne doit pas s''enliser. Intervenons dès maintenant.', 
  '[{"title":"Baux commerciaux et d''habitation","content":"Rédaction et renouvellement de baux, procédures d''expulsion, fixation et révision de loyers, contentieux des charges et réparations locatives."},{"title":"Droit de la construction","content":"Assistance lors d''expertises judiciaires, recours en garantie décennale, biennale ou de parfait achèvement face aux malfaçons et retards de livraison."},{"title":"Copropriété et propriété foncière","content":"Recouvrement de charges impayées, contestation d''assemblées générales, troubles anormaux du voisinage, et actions en revendication de propriété ou servitudes."}]'::jsonb, 
  7, 
  true
);

INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  'droit-des-affaires', 
  'Droit des affaires', 
  'TrendingUp', 
  'Le partenaire juridique de la croissance et de la pérennité de votre entreprise.', 
  'La vie des affaires exige une sécurisation constante de vos relations commerciales et sociétaires. De la création à la transmission, nous sommes à vos côtés pour prévenir les risques et résoudre vos contentieux stratégiques.', 
  'Une vision business orientée solutions, alliée à une rigueur juridique intraitable.', 
  'Sécurisons ensemble vos projets commerciaux pour vous permettre d''entreprendre sereinement.', 
  '[{"title":"Droit des sociétés","content":"Création d''entreprise, rédaction de statuts sur mesure, secrétariat juridique (AG), rédaction de pactes d''actionnaires et opérations sur le capital."},{"title":"Fusions, cessions et acquisitions","content":"Audits juridiques, lettres d''intention, garanties d''actif et de passif (GAP), et accompagnement complet dans les opérations de cession de droits sociaux ou de fonds de commerce."},{"title":"Contentieux commercial","content":"Recouvrement de créances complexes, litiges entre associés, concurrence déloyale, rupture brutale des relations commerciales, et exécution fautive de contrats."}]'::jsonb, 
  8, 
  true
);

