
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
