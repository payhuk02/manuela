## Objectif

Corriger définitivement les 404 sur `/cabinet`, `/carte`, `/expertises`, `/contact`, `/equipe` (et toutes les autres) en migrant l'app de **Vite + react-router-dom + BrowserRouter** vers **TanStack Start file-based routing**, qui est la stack supportée nativement par l'hébergeur Lovable.

## Pourquoi cette migration est nécessaire

L'audit de prod a montré que les 404 viennent du Worker Cloudflare de Lovable, qui ne fait pas de SPA fallback pour les apps non-TanStack. Aucune config (`vercel.json`, `_redirects`, `404.html`) ne peut le contourner — le 404 est émis avant d'atteindre les fichiers statiques. Seule une migration vers la stack supportée résout le problème côté code.

## Phases d'exécution

Je travaillerai par phases, en gardant l'app fonctionnelle entre chaque, pour pouvoir valider en preview au fur et à mesure.

### Phase 1 — Scaffolding TanStack Start
- Installer `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`
- Mettre à jour `vite.config.ts` (plugin TanStack Start)
- Créer `src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx` minimal
- Vérifier que le scaffold démarre (build + preview de `/`)
- Garder l'ancien `App.tsx` + `BrowserRouter` temporairement inactif

### Phase 2 — Migration des pages publiques (les plus critiques)
Créer les fichiers de routes pour les pages 404 actuelles :
- `src/routes/cabinet.tsx`
- `src/routes/carte.tsx` + `src/routes/carte-de-visite.tsx`
- `src/routes/expertises.tsx`
- `src/routes/expertises.$slug.tsx`
- `src/routes/expertises.$slug.faq.tsx`
- `src/routes/contact.tsx`
- `src/routes/equipe.tsx` + `src/routes/team.tsx`
- `src/routes/actualites.tsx` + `src/routes/news.tsx`
- `src/routes/actualites.$id.tsx` + `src/routes/news.$id.tsx`

Chaque route importe le composant existant de `src/pages/` (réutilisation maximale).

### Phase 3 — Migration des pages auth/admin/landing
- `src/routes/auth.tsx`, `src/routes/reset-password.tsx`
- `src/routes/admin.tsx`
- `src/routes/403.tsx`
- `src/routes/$slug.tsx` (catch-all pour les landing SEO)
- `notFoundComponent` global sur `__root.tsx` pour le 404

### Phase 4 — Remplacement des imports `react-router-dom`
Dans tous les fichiers (`src/pages/*`, `src/components/Footer.tsx`, etc.) :
- `import { Link } from "react-router-dom"` → `import { Link } from "@tanstack/react-router"`
- `useNavigate`, `useLocation`, `useParams`, `Navigate` → équivalents TanStack
- Adapter les `<Link to="/expertises/${slug}">` → `<Link to="/expertises/$slug" params={{slug}}>`
- Adapter les `useParams()` → `useParams({ strict: false })`

### Phase 5 — Nettoyage
- Supprimer `src/App.tsx` (remplacé par `__root.tsx`)
- Mettre à jour `src/main.tsx` pour booter le router TanStack
- Désinstaller `react-router-dom`
- Supprimer `vercel.json`, `public/_redirects`, `postbuild:spa-fallback` (plus nécessaires)
- Mettre à jour `scripts/verify-build.mjs` pour les nouveaux noms de chunks

### Phase 6 — Validation prod
- Build local OK
- Demande de re-publication
- Test `curl` sur les 6 routes principales → toutes en 200

## Risques connus

- **Admin (`src/pages/Admin.tsx`)** : code lourd avec sous-onglets ; je le migre tel quel sans toucher à la logique métier.
- **SEO (`buildLangAlternates`, `useSeo`)** : continue de marcher côté client ; les `head()` TanStack ne sont pas requis pour la première itération (je les ajouterai en phase 6 si tout va bien).
- **Hooks contextuels** (`useAuth`, `useLanguage`, `useSiteData`) : déplacés dans `__root.tsx` au lieu de `App.tsx`.
- **Temps** : ~30-60 min de travail réel + 2 cycles de build à valider.

## Ce qui ne change pas

- Apparence visuelle des pages (composants identiques)
- Logique métier, données Supabase, i18n, auth
- URLs publiques (mêmes chemins, donc SEO préservé)
