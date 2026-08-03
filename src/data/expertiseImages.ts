import imgAffaires from "@/assets/expertise-affaires.jpg";
import imgBancaire from "@/assets/expertise-bancaire.jpg";

import imgOhada from "@/assets/expertise-ohada.jpg";
import imgImmobilier from "@/assets/expertise-immobilier.jpg";
import imgPenal from "@/assets/expertise-penal.jpg";
import imgEtrangers from "@/assets/expertise-etrangers.jpg";
import imgPetrolier from "@/assets/expertise-petrolier.jpg";
import imgTravail from "@/assets/expertise-travail.png";
import imgDommage from "@/assets/expertise-dommage.png";
import imgFamille from "@/assets/expertise-famille.png";
import imgAdmin from "@/assets/expertise-administratif.png";

export const EXPERTISE_TO_HERO: Record<string, string> = {
  "droit-des-affaires": "hero.s2.image",
  "droit-du-travail": "hero.s3.image",
  "droit-du-dommage-corporel": "hero.s4.image",
  "droit-de-la-famille": "hero.s5.image",
  "droit-administratif-et-de-la-fonction-publique": "hero.s6.image",
  "droit-des-etrangers": "hero.s7.image",
  "droit-immobilier": "hero.s8.image",
  "droit-ohada": "hero.s9.image",
};

export const EXPERTISE_IMAGES: Record<string, string> = {
  "droit-des-affaires": imgAffaires,
  "droit-bancaire-et-financier": imgBancaire,

  "droit-ohada": imgOhada,
  "droit-immobilier": imgImmobilier,
  "droit-penal-et-droit-penal-des-affaires": imgPenal,
  "droit-des-etrangers": imgEtrangers,
  "droit-petrolier-et-minier": imgPetrolier,
  "droit-du-travail": imgTravail,
  "droit-du-dommage-corporel": imgDommage,
  "droit-de-la-famille": imgFamille,
  "droit-administratif-et-de-la-fonction-publique": imgAdmin,
};
