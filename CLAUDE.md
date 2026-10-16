# Lou'lou'a (nom provisoire) — Plateforme d'invitations digitales (Algérie)

## Contexte

Invitations-sites animées (mariage, fiançailles, anniversaire, naissance...) vendues en DA,
en français et en arabe. Public : téléphones Android moyens en 4G, ouverts depuis WhatsApp.

## Documents (à lire avant toute grosse tâche)

docs/PRD.md · docs/TRD.md · docs/APP_FLOW.md · docs/UI_UX.md · docs/BACKEND_SCHEMA.md
· docs/IMPLEMENTATION_PLAN.md · docs/ANIMATIONS.md
· docs/DEPLOIEMENT.md (mise en ligne) · docs/LANCEMENT.md (reste à faire, choix faits)
En cas de contradiction : BACKEND_SCHEMA (données) et UI_UX (design) font foi.
Prototypes de référence : design/references/hero-3d.html, invitation-envelope.html.

## Stack (tout sur Cloudflare)

Next.js (App Router) + TypeScript strict, déployé sur Cloudflare Workers via
@opennextjs/cloudflare. Tailwind, shadcn/ui (admin), GSAP + ScrollTrigger + SplitText,
Lenis, React Three Fiber (héro + Prestige uniquement), next-intl (fr, ar).
Cloudflare D1 + Drizzle (schéma : src/db/schema.ts), R2 (fichiers), Better Auth,
Turnstile, Cron Triggers, zod.

## Commandes

- pnpm dev / pnpm build / pnpm lint / pnpm typecheck / pnpm test / pnpm test:e2e
- pnpm check (lint + typecheck + tests + build) · pnpm format
- pnpm db:generate / pnpm db:migrate:local / pnpm db:migrate:remote
- pnpm auth:generate (régénère src/db/auth-schema.ts) · pnpm cf-typegen (types des bindings)
- pnpm db:seed:local / pnpm db:seed:remote (modèles + démos, depuis src/invitation/demos.ts)
- pnpm admin:create -- email "mot de passe" "Nom" [--remote]
- pnpm preview (Wrangler, conditions Cloudflare réelles) / pnpm deploy
- pnpm budget <url> (JS et polices d'une invitation < 150 Ko)

## Organisation du code

- src/app/[locale]/(site)/ : site public, commande (/commander), suivi, connexion, espace
  client (/compte) · src/app/[locale]/(admin)/admin/ : back-office · src/app/i/ : invitations
- src/invitation/ : moteur (engine/), ouvertures (openers/), sections/, themes/<slug>/,
  server/ (chargement D1, rendu) · src/actions/ : Server Actions (public, client/, admin/)
- src/lib/ : auth (garde admin + 2FA, accès client), commandes, invités, médias R2, sécurité
- worker.ts : entrée Cloudflare (site OpenNext + Cron de purge) ; logique dans src/lib/purge.ts

## Pièges déjà rencontrés

- next-intl sans middleware : chaque layout ET page appelle setRequestLocale(locale) avant
  toute traduction, sinon la requête entière reste en français.
- Textes côté navigateur : seulement les namespaces utiles (ClientMessages par section).
- D1 : 100 variables SQL max par requête → insérer par lots (10 invités par INSERT).
- Classes conditionnelles : `nom ${cond ? "x" : ""}` (espace hors des guillemets).
- Le Worker gratuit est limité à 3 Mo compressés (≈ 2,3 Mo aujourd'hui) : pas de grosse
  librairie côté serveur (next/og, SDK lourds).

## Règles de code

- Tout texte visible passe par messages/fr.json et messages/ar.json. Jamais de texte en dur.
- RTL : propriétés logiques Tailwind seulement (ms-, me-, ps-, pe-, start-, end-).
  Interdit : ml-, mr-, pl-, pr-, left-, right-.
- Ne jamais modifier src/db/schema.ts sans générer la migration (pnpm db:generate).
- Chaque requête D1 vérifie côté serveur qui a le droit de lire/écrire (voir les règles
  d'accès de BACKEND_SCHEMA). Aucun accès direct à la base depuis le navigateur.
- Écritures via Server Actions validées par zod + Turnstile + limite de requêtes.
- Secrets via wrangler secret, jamais dans le code ni dans le dépôt.
- Les thèmes vivent dans src/invitation/themes/<slug>/ (theme.ts, schema.ts) + aperçu dans
  public/themes/<slug>/preview.svg, et ne lisent jamais la base : ils reçoivent une config
  validée par zod. Nouveau thème : l'ajouter dans themes/index.ts et dans demos.ts, puis
  vérifier les contrastes (≥ 4,5:1) et lancer tests/e2e/themes.spec.ts.
- WhatsApp : uniquement des liens wa.me pré-remplis ouverts par l'utilisateur.
  Aucun envoi automatique (pas d'API WhatsApp au MVP).
- Invitations en noindex. Codes invités aléatoires (10 caractères).
- Démos du catalogue : date = aujourd'hui + 60 jours, calculée à l'affichage.
- Jamais de faux avis ni de faux chiffres dans le site.

## Performance (bloquant)

- Invitation : JS initial < 150 Ko compressé, LCP < 2 s en 4G simulée, pas de Three.js
  sauf ouverture 3D Prestige chargée à la demande.
- Site : LCP < 2,5 s, INP < 200 ms, CLS < 0,1, Lighthouse mobile >= 85.
- Images compressées en WebP dans le navigateur avant envoi (max 1600 px).
- Animations : 60 i/s, version allégée sur téléphone faible, prefers-reduced-motion,
  sens inversé en arabe, contenu lisible si l'animation ne se lance pas.
- Musique uniquement après le geste "Ouvrir", bouton son toujours visible.
- Rester dans l'offre gratuite Cloudflare : signaler toute fonction qui risque de dépasser
  D1 100 000 écritures/jour ou Workers 100 000 requêtes/jour.

## Design

Tokens dans src/styles/tokens.css, valeurs exactes dans docs/UI_UX.md (fond #EDEAE4,
texte #2B140A, principal bleu Méditerranée #045588, détails laiton #D7C099).
Polices : Marcellus + Tajawal (FR), Reem Kufi + Tajawal (AR), Pinyon Script / Aref Ruqaa
pour les prénoms des invitations. Palettes des thèmes : PRD, « Identité algérienne ».
Mobile d'abord (375 px), zones tactiles de 48 px, texte 16 px minimum.

## Définition de « terminé »

lint + typecheck + tests + build OK, vérifié en fr ET ar à 375x812, critères
« Terminé quand » de la phase remplis (docs/IMPLEMENTATION_PLAN.md).
