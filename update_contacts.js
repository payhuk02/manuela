import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 1. Footer.tsx
const footerPath = path.join('src', 'components', 'Footer.tsx');
replaceInFile(footerPath, /const DEFAULT_ADDRESS = ".*";/, 'const DEFAULT_ADDRESS = "47 Rue Rémy-DUMONCEL 75014 PARIS";');
replaceInFile(footerPath, /const DEFAULT_PHONE = ".*";/, 'const DEFAULT_PHONE = "06 59 76 42 51";');
replaceInFile(footerPath, /const DEFAULT_WHATSAPP = ".*";/, 'const DEFAULT_WHATSAPP = "06 59 76 42 51";');
replaceInFile(footerPath, /const DEFAULT_EMAIL = ".*";/, 'const DEFAULT_EMAIL = "manuela.diabate@mdi-avocats.com";');
if (fs.existsSync(footerPath)) {
  let footer = fs.readFileSync(footerPath, 'utf8');
  if (!footer.includes('const INSTAGRAM')) {
    footer = footer.replace(/const LINKEDIN_CABINET = ".*";/, 'const LINKEDIN_CABINET = "https://www.linkedin.com/company/109573759";\nconst INSTAGRAM = "https://instagram.com/manuela.diabate";');
  }
  if (!footer.includes('Instagram')) {
    footer = footer.replace(/import {([^}]*)Linkedin([^}]*)} from "lucide-react";/, 'import { $1Linkedin, Instagram $2} from "lucide-react";');
  }
  if (!footer.includes('aria-label="Instagram"')) {
    footer = footer.replace(/(\{linkedin && \([\s\S]*?<\/a>\n              \}\))/, '$1\n              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors"><Instagram className="h-4 w-4" strokeWidth={1.5} /></a>');
  }
  fs.writeFileSync(footerPath, footer, 'utf8');
}

// 2. Contact.tsx
const contactPath = path.join('src', 'pages', 'Contact.tsx');
replaceInFile(contactPath, /const ADDRESS = ".*";/, 'const ADDRESS = "47 Rue Rémy-DUMONCEL 75014 PARIS";');
replaceInFile(contactPath, /const PHONE = ".*";/, 'const PHONE = "06 59 76 42 51";');
replaceInFile(contactPath, /const WHATSAPP = ".*";/, 'const WHATSAPP = "06 59 76 42 51";');
replaceInFile(contactPath, /const EMAIL = ".*";/, 'const EMAIL = "manuela.diabate@mdi-avocats.com";');
replaceInFile(contactPath, /Lundi – Vendredi : 9h00 – 19h00/g, 'Lundi au vendredi de 9 heures- 20 heures');
replaceInFile(contactPath, /Monday – Friday: 9:00 – 19:00/g, 'Monday to Friday, 9:00 AM - 8:00 PM');
if (fs.existsSync(contactPath)) {
  let contact = fs.readFileSync(contactPath, 'utf8');
  if (!contact.includes('Instagram')) {
    contact = contact.replace(/import {([^}]*)Linkedin([^}]*)} from "lucide-react";/, 'import { $1Linkedin, Instagram, IdCard $2} from "lucide-react";');
  }
  if (!contact.includes('Instagram</a>')) {
     contact = contact.replace(/Icon: Linkedin,\n[\s\S]*?Sylvestre Manuela Diabate\n[\s\S]*?<\/a>\n                  \),/, 'Icon: Linkedin,\n                  label: "Réseaux Sociaux",\n                  content: (\n                    <div className="flex gap-4">\n                      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-foreground link-underline">\n                        LinkedIn\n                      </a>\n                      <a href="https://instagram.com/manuela.diabate" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground link-underline">\n                        Instagram\n                      </a>\n                    </div>\n                  ),');
  }
  if (!contact.includes('label: "Carte de visite numérique"')) {
     contact = contact.replace(/(Icon: Linkedin,[\s\S]*?<\/div>\n                  \),\n                },)/, '$1\n                {\n                  Icon: IdCard,\n                  label: "Carte de visite numérique",\n                  content: (\n                    <a href="/carte" target="_blank" className="font-bold text-foreground link-underline text-accent">\n                      Télécharger la carte de visite\n                    </a>\n                  ),\n                },');
  }
  fs.writeFileSync(contactPath, contact, 'utf8');
}

// 3. Carte.tsx
const cartePath = path.join('src', 'pages', 'Carte.tsx');
replaceInFile(cartePath, /address: ".*",/, 'address: "47 Rue Rémy-DUMONCEL 75014 PARIS",');
replaceInFile(cartePath, /phone: ".*",/, 'phone: "06 59 76 42 51",');
replaceInFile(cartePath, /whatsapp: ".*",/, 'whatsapp: "06 59 76 42 51",');
replaceInFile(cartePath, /email: ".*",/, 'email: "manuela.diabate@mdi-avocats.com",');
replaceInFile(cartePath, /hours: ".*",/, 'hours: "Lundi au vendredi de 9 heures- 20 heures",');
if (fs.existsSync(cartePath)) {
  let carte = fs.readFileSync(cartePath, 'utf8');
  if (!carte.includes('instagram: "https://instagram.com')) {
    carte = carte.replace(/linkedin: "(.*)",/, 'linkedin: "$1",\n  instagram: "https://instagram.com/manuela.diabate",');
  }
  if (!carte.includes('Instagram')) {
    carte = carte.replace(/import {([^}]*)Linkedin([^}]*)} from "lucide-react";/, 'import { $1Linkedin, Instagram $2} from "lucide-react";');
  }
  // Check if data.instagram is in the hooks setup
  if (!carte.includes('instagram: get(')) {
     carte = carte.replace(/linkedin: get\(.*\),/, 'linkedin: get("card.linkedin", (ci as any).linkedin_url || (fm as any).linkedin_url || DEFAULTS.linkedin),\n        instagram: get("card.instagram", DEFAULTS.instagram),');
  }
  
  if (!carte.includes('label="Instagram"')) {
    carte = carte.replace(/(\{data\.linkedin && \([\s\S]*?external\n            \/>\n          \}\))/, '$1\n          {data.instagram && (\n            <Row\n              href={data.instagram}\n              icon={<Instagram className="h-4 w-4" />}\n              label="Instagram"\n              value="@manuela.diabate"\n              external\n            />\n          )}');
  }
  carte = carte.replace(/value="Sylvestre Manuela Diabate"/, 'value="LinkedIn"');
  fs.writeFileSync(cartePath, carte, 'utf8');
}

console.log("Updated files!");
