import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";
import { useText } from "@/hooks/useText";
import { LangSwitcher } from "./LangSwitcher";
import { Link } from "react-router-dom";

import { useLogo } from "@/hooks/useLogos";
import { useExpertises } from "@/hooks/useExpertises";
import {  MapPin, Phone, Mail, Linkedin, Instagram , MessageCircle, Building2 } from "lucide-react";

const DEFAULT_ADDRESS = "47 Rue Rémy-DUMONCEL 75014 PARIS";
const DEFAULT_PHONE = "06 59 76 42 51";
const DEFAULT_WHATSAPP = "06 59 76 42 51";
const DEFAULT_EMAIL = "manuela.diabate@mdi-avocats.com";
const DEFAULT_LINKEDIN_PERSO =
  "https://www.linkedin.com/in/manuela-diabate-88a775220";
const LINKEDIN_CABINET = "https://www.linkedin.com/company/109573759";
const INSTAGRAM = "https://instagram.com/manuela.diabate";

export const Footer = () => {
  const { t, lang } = useLang();
  const { contact } = useSite();
  const logo = useLogo("logo.footer", null);
  const { data: expertises } = useExpertises({ onlyPublished: true });

  const tagline = useText("footer.tagline", t.footer.tagline);
  const rights = useText("footer.rights", t.footer.rights);
  const legal = useText("footer.legal", t.footer.legal);
  const privacy = useText("footer.privacy", t.footer.privacy);
  const terms = useText("footer.terms", lang === "fr" ? "CGU" : "Terms");
  const adminLabel = useText("footer.admin", lang === "fr" ? "Administration" : "Admin");
  const usefulLinksTitle = useText("footer.usefulLinks", lang === "fr" ? "Liens utiles" : "Useful links");
  const expertisesTitle = useText("footer.expertisesTitle", lang === "fr" ? "Nos expertises" : "Our expertises");
  const contactTitle = useText("footer.contactTitle", lang === "fr" ? "Contact" : "Contact");
  const lHome = useText("nav.home", lang === "fr" ? "Accueil" : "Home");
  const lAbout = useText("footer.about", lang === "fr" ? "Notre cabinet" : "About us");
  const lExpertises = useText("footer.expertises", lang === "fr" ? "Nos expertises" : "Expertises");
  const lTeam = useText("footer.team", lang === "fr" ? "Notre équipe" : "Our team");
  const lContact = useText("nav.contact", lang === "fr" ? "Contact" : "Contact");

  const address = contact?.address || DEFAULT_ADDRESS;
  const phone = contact?.phone || DEFAULT_PHONE;
  const whatsapp = contact?.whatsapp_number || DEFAULT_WHATSAPP;
  const email = contact?.email || DEFAULT_EMAIL;
  const linkedin = contact?.linkedin_url || DEFAULT_LINKEDIN_PERSO;
  const waDigits = whatsapp.replace(/[^\d]/g, "");

  const topExpertises = expertises.slice(0, 5);

  const usefulLinks = [
    { to: "/", label: lHome },
    { to: "/cabinet", label: lAbout },
    { to: "/expertises", label: lExpertises },
    { to: "/equipe", label: lTeam },
    { to: "/contact", label: lContact },
  ];

  return (
    <footer className="bg-night text-primary-foreground dark:text-foreground">
      <div className="container-luxe py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Logo + tagline */}
        <div>
          <div className="flex items-center gap-3">
            {logo && (
              <img
                src={logo}
                alt="Logo cabinet"
                className="h-20 md:h-24 w-auto"
              />
            )}
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60 max-w-xs leading-relaxed">
            {tagline}
          </p>
          <div className="mt-6">
            <LangSwitcher variant="dark" />
          </div>
        </div>

        {/* Liens utiles */}
        <div>
          <p className="text-sm font-semibold text-primary-foreground mb-5">
            {usefulLinksTitle}
          </p>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            {usefulLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Nos expertises */}
        <div>
          <p className="text-sm font-semibold text-primary-foreground mb-5">
            {expertisesTitle}
          </p>
          <ul className="space-y-3 text-sm text-primary-foreground/70">
            {topExpertises.length === 0 && (
              <li className="text-primary-foreground/40">—</li>
            )}
            {topExpertises.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/expertises/${e.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold text-primary-foreground mb-5">
            {contactTitle}
          </p>
          <ul className="space-y-4 text-sm text-primary-foreground/70">
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="hover:text-accent transition-colors"
              >
                {phone}
              </a>
            </li>
            {waDigits && (
              <li className="flex items-start gap-3">
                <MessageCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  {whatsapp}{" "}
                  <span className="text-primary-foreground/40">· WhatsApp</span>
                </a>
              </li>
            )}
            <li className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
              <a
                href={`mailto:${email}`}
                className="hover:text-accent transition-colors break-all"
              >
                {email}
              </a>
            </li>
            <li className="pt-2 flex items-center gap-2">
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn — Sylvestre Manuela Diabate"
                  title={lang === "fr" ? "LinkedIn personnel" : "Personal LinkedIn"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" strokeWidth={1.5} />
                </a>
              )}
              <a
                href={LINKEDIN_CABINET}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn — Cabinet"
                title={lang === "fr" ? "LinkedIn du cabinet" : "Firm LinkedIn"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Building2 className="h-4 w-4" strokeWidth={1.5} />
              </a>
              {waDigits && (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-[#25D366] hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.165-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.123-.272-.198-.57-.347zM12.04 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.453 3.488z" />
                  </svg>
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>


      <div className="border-t border-primary-foreground/10">
        <div className="container-luxe py-6 text-xs text-primary-foreground/50 flex flex-col md:flex-row justify-between gap-3 md:items-center">
          <p>
            © {new Date().getFullYear()} Manuela DIABATE. {rights}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="hover:text-accent transition-colors">
              {legal}
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              {privacy}
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              {terms}
            </a>
            <Link to="/admin" className="hover:text-accent transition-colors opacity-60">
              {adminLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-40 border-t border-primary-foreground/10">
        <div className="container-luxe py-4 pb-24 sm:pb-4 text-center text-xs text-primary-foreground/50">
          {lang === "fr" ? "Propulsé par" : "Powered by"}{" "}
          <a
            href="https://wa.me/22668044697"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-40 font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Edigit-Agence Digitale
          </a>
        </div>
      </div>
    </footer>
  );
};
