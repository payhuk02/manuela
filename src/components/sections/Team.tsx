import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";
import { RichText } from "@/components/RichText";
const fallbackPhotos: string[] = [];

export const Team = () => {
  const { t, lang } = useLang();
  const { team } = useSite();

  const members =
    team.length > 0
      ? team.map((m, i) => ({
          name: m.name,
          role: lang === "fr" ? m.role_fr : m.role_en,
          bio: lang === "fr" ? m.bio_fr : m.bio_en,
          photo: m.photo_url || fallbackPhotos[i % fallbackPhotos.length],
        }))
      : t.team.members.map((m, i) => ({ ...m, photo: fallbackPhotos[i] }));

  return (
    <section id="team" className="py-28 md:py-36 bg-background">
      <div className="container-luxe text-center">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow flex items-center gap-2 px-[100px] justify-center">{t.team.eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary leading-[1.15] px-[100px]">
            {t.team.title}
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {members.map((m) => (
            <article key={m.name} className="group">
              <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
                <img
                  src={m.photo}
                  alt={m.name}
                  width={640}
                  height={800}
                  loading="lazy"
          decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="pt-6">
                <h3 className="font-serif text-2xl text-primary">{m.name}</h3>
                <p className="mt-1 text-sm text-accent tracking-wide">{m.role}</p>
                <RichText html={m.bio} className="mt-3 text-sm leading-relaxed" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
