# Plan de construction avec Claude Code

L'ordre de construction, le fichier CLAUDE.md du projet et les prompts à copier-coller dans Claude Code.

**Les 6 documents avant de coder** : 1. PRD · 2. TRD · 3. App Flow · 4. UI/UX Design · 5. Backend Schema · 6. ce plan d'implémentation. Les onglets Marque, Animations, Marketing et Business les complètent.

## Les phases

On construit d'abord une invitation qui se vend, puis la vitrine, puis la commande. Chaque phase se termine par quelque chose de montrable.

| Phase | Ce qu'on construit | Terminé quand | Durée estimée |
| --- | --- | --- | --- |
| 0 — Fondations | Projet Next.js sur Cloudflare (OpenNext), D1 + schéma fourni, R2, Better Auth, FR/AR avec RTL, tokens UI/UX, polices, CLAUDE.md, CI GitHub | Le site vide est en ligne sur une URL Cloudflare, bascule FR/AR, la migration D1 passe en local et en ligne, la CI est verte | 1 à 2 jours |
| 1 — Moteur d'invitation + thème Karakou | Sections communes, ouverture Enveloppe, musique + bouton son, compte à rebours, date hégire, Maps/Waze, calendrier, RSVP, livre d'or, mode hors ligne | `/i/demo-karakou` s'ouvre en moins de 2 s en 4G simulée, un RSVP s'enregistre dans D1, tout est vérifié en FR et AR à 375 px | 1 semaine |
| 2 — Site vitrine animé | Héro 3D, comment ça marche, catalogue + fiche modèle + démo, comparatif, tarifs, avis, FAQ, contact, pages légales | Lighthouse mobile ≥ 85 sur l'accueil, version sans 3D sur téléphone faible, tous les écrans « Site public » MVP de l'App Flow existent en FR et AR | 1 semaine |
| 3 — Commande et admin | Assistant (formulaire 6 étapes), aperçu avec filigrane, paiement par reçu, suivi par code, back-office (commandes, paiements, modèles, publication) | Une commande test va de l'accueil à « Livrée » sans intervention dans la base ; refuser un reçu renvoie le client vers un nouvel envoi | 1 à 2 semaines |
| 4 — Espace client | Lien magique, édition avec aperçu, invités (ajout, import Excel), liens nominatifs, envoi WhatsApp, réponses, export | Un client importe 100 invités, envoie les liens, voit les réponses arriver et exporte la liste en Excel | 1 semaine |
| 5 — Catalogue de lancement | 5 thèmes de plus (voir « Les 6 premiers modèles »), mode discret, version image à transférer | 6 modèles publiés, chacun testé sur un vrai Android et un iPhone, dans WhatsApp, en FR et AR | 1 à 2 semaines |
| 6 — Préparation du lancement | Tests Playwright des 3 parcours, Lighthouse en CI, Sentry, analytics, domaine, CGV, politique de confidentialité | Tous les tests passent en FR et AR, une restauration D1 (Time Travel) a été essayée, le domaine pointe vers le site | 3 à 5 jours |
| V2 | Chargily (Edahabia/CIB), QR d'entrée + scan, fêtes femmes/hommes, relances, codes partenaires, assistant en mode chat, blog, page entreprises, statistiques | — | Dans les 3 mois |
| V3 | Album photo partagé, vidéo story générée, tamazight, cagnotte, quiz | — | Plus tard |

Durées estimées pour deux personnes à temps partiel avec Claude Code ; elles servent à repérer un retard, pas à promettre une date.

**Les 6 premiers modèles** (répond à la question ouverte du PRD, à valider) : 1. Mariage Karakou (velours bordeaux, or fetla) · 2. Mariage Zellige de Tlemcen · 3. Mariage Casbah (chaux, cèdre, laiton) · 4. Fiançailles Bijoux kabyles (argent, corail, turquoise) · 5. Anniversaire Ciel, dans l'esprit de la vidéo Canva (bougie, cadeau, polaroids) · 6. Naissance Baie d'Alger. Les palettes viennent du PRD (Identité algérienne).

## Le fichier CLAUDE.md

À copier à la racine du projet : Claude Code le lit à chaque session et suit ces règles. Exporte aussi ce doc en Markdown et range-le dans `docs/` (un fichier par onglet : PRD, TRD, APP\_FLOW, UI\_UX, BACKEND\_SCHEMA, IMPLEMENTATION\_PLAN, ANIMATIONS) pour que Claude Code puisse s'y référer.

```markdown
# Lou'lou'a (nom provisoire) — Plateforme d'invitations digitales (Algérie)

## Contexte
Invitations-sites animées (mariage, fiançailles, anniversaire, naissance...) vendues en DA,
en français et en arabe. Public : téléphones Android moyens en 4G, ouverts depuis WhatsApp.

## Documents (à lire avant toute grosse tâche)
docs/PRD.md · docs/TRD.md · docs/APP_FLOW.md · docs/UI_UX.md · docs/BACKEND_SCHEMA.md
· docs/IMPLEMENTATION_PLAN.md · docs/ANIMATIONS.md
En cas de contradiction : BACKEND_SCHEMA (données) et UI_UX (design) font foi.
Prototypes de référence : design/references/hero-3d.html, invitation-envelope.html.

## Stack (tout sur Cloudflare)
Next.js (App Router) + TypeScript strict, déployé sur Cloudflare Workers via
@opennextjs/cloudflare. Tailwind, shadcn/ui (admin), GSAP + ScrollTrigger + SplitText,
Lenis, React Three Fiber (héro + Prestige uniquement), next-intl (fr, ar).
Cloudflare D1 + Drizzle (schéma : src/db/schema.ts), R2 (fichiers), Better Auth,
Turnstile, Cron Triggers, zod.

## Commandes
- pnpm dev / pnpm build / pnpm lint / pnpm test / pnpm test:e2e
- pnpm db:generate / pnpm db:migrate:local / pnpm db:migrate:remote
- pnpm preview (Wrangler, conditions Cloudflare réelles) / pnpm deploy

## Règles de code
- Tout texte visible passe par messages/fr.json et messages/ar.json. Jamais de texte en dur.
- RTL : propriétés logiques Tailwind seulement (ms-, me-, ps-, pe-, start-, end-).
  Interdit : ml-, mr-, pl-, pr-, left-, right-.
- Ne jamais modifier src/db/schema.ts sans générer la migration (pnpm db:generate).
- Chaque requête D1 vérifie côté serveur qui a le droit de lire/écrire (voir les règles
  d'accès de BACKEND_SCHEMA). Aucun accès direct à la base depuis le navigateur.
- Écritures via Server Actions validées par zod + Turnstile + limite de requêtes.
- Secrets via wrangler secret, jamais dans le code ni dans le dépôt.
- Les thèmes vivent dans src/invitation/themes/<slug>/ (theme.ts, schema.ts, preview.jpg)
  et ne lisent jamais la base : ils reçoivent une config validée par zod.
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
```

## Les prompts pour Claude Code

Un prompt par phase, à coller tel quel. Commence chaque phase en mode plan (Maj+Tab dans Claude Code), valide le plan, puis laisse-le coder.

**Phase 0**

```text
Lis CLAUDE.md puis les 6 documents de docs/. Initialise le projet :
- Next.js App Router + TypeScript strict + Tailwind + pnpm, déploiement Cloudflare via
  @opennextjs/cloudflare, wrangler.jsonc avec les bindings D1 (louloua-db) et R2.
- D1 + Drizzle avec le schéma fourni : copie src/db/schema.ts et drizzle/0000_init.sql,
  règle migrations_dir pour Wrangler, applique la migration en local.
- Better Auth (tables générées dans src/db/auth-schema.ts), lien magique par e-mail.
- next-intl avec /fr et /ar (dir rtl pour ar), polices FR et AR auto-hébergées.
- src/styles/tokens.css avec les tokens exacts de docs/UI_UX.md.
- ESLint + Prettier + Vitest + Playwright + GitHub Actions (lint, typecheck, tests, build).
Résultat attendu : une page d'accueil vide qui bascule FR/AR, déployée sur Cloudflare.
Vérifie les critères « Terminé quand » de la phase 0. Montre-moi le plan avant de coder.
```

**Phase 1**

```text
Construis le moteur d'invitation (TRD : Moteur de modèles) en partant de
design/references/invitation-envelope.html et du prompt Enveloppe de docs/ANIMATIONS.md :
- sections communes, ouverture Envelope, musique MP3 + bouton son, compte à rebours
  (merci après la date), date hégire, Google Maps + Waze, ajout calendrier (.ics),
  RSVP (oui/non + places limitées par le lien + message), livre d'or, mode hors ligne ;
- utilise les tables existantes du schéma (invitations, events, guests, rsvps, wishes),
  avec les règles d'accès de docs/BACKEND_SCHEMA.md ;
- premier thème "karakou" avec la palette Karakou du PRD ;
- routes /i/[slug] et /i/[slug]/[code], invitation démo /i/demo-karakou.
Tests : Vitest (places, dates, après-date), Playwright (ouvrir + RSVP) en fr et ar à 375x812.
Vérifie les critères « Terminé quand » de la phase 1.
```

**Phase 2**

```text
Construis le site vitrine (PRD : Site vitrine ; App Flow : écrans Site public ;
UI/UX : tokens, composants et écrans clés). Pars de
design/references/hero-3d.html et du prompt Héro 3D de docs/ANIMATIONS.md : héro React Three Fiber avec
un téléphone 3D qui tourne au scroll et affiche nos invitations, cartes flottantes
RSVP / GPS / musique / compte à rebours, Lenis + GSAP ScrollTrigger, sections
Comment ça marche, Catalogue (filtres, démo dans un téléphone, dates démo toujours
futures), Comparatif digital vs papier, Tarifs, FAQ, footer, pages légales.
Version allégée sans 3D sur téléphone faible et reduced-motion. Lighthouse
mobile >= 85.
```

**Phase 3**

```text
Construis la commande et l'admin (PRD : tunnel de commande + back-office ; App Flow :
parcours 1 et 4, écrans Commande et Admin ; états et cas limites) :
- assistant /commander en formulaire 6 étapes (fr, ar), brouillon gardé sur le téléphone,
  aperçu en direct avec filigrane, choix du pack, paiement par reçu BaridiMob/CCP
  (photo compressée envoyée dans R2), page merci + code de suivi, page /suivi ;
- admin avec 2FA : tableau de bord, commandes et statuts, validation / refus des reçus
  avec motif, modèles, publication d'une invitation (le filigrane disparaît) ;
- e-mails Resend et liens wa.me pré-remplis (aucun envoi WhatsApp automatique) ;
- tables existantes orders, payments, media ; chaque action admin écrit dans activity_log.
Tests Playwright : commande complète jusqu'à « Livrée », et reçu refusé puis renvoyé.
Vérifie les critères « Terminé quand » de la phase 3.
```

**Phase 4**

```text
Construis l'espace client (PRD : Espace client) : connexion par lien magique,
modification de l'invitation avec aperçu, table guests, import Excel/CSV, liens
nominatifs /i/[slug]/[code] avec places max, bouton envoi WhatsApp pré-rempli
FR/AR, tableau des réponses, ajout manuel d'une réponse, export Excel et PDF.
```

**Phase 5**

```text
Crée les 5 thèmes suivants, un par un, avec le prompt "Créer un nouveau modèle" :
zellige-tlemcen (mariage), casbah (mariage), bijoux-kabyles (fiançailles),
ciel (anniversaire : bougie, cadeau, polaroids), baie-alger (naissance).
Palettes : PRD, Identité algérienne. Ajoute le mode discret et la version image
(carte PNG générée) à tous les thèmes. Montre-moi chaque thème avant le suivant.
```

**Phase 6**

```text
Prépare le lancement : tests Playwright des 3 parcours du PRD en fr et ar, Lighthouse
en CI (accueil + /i/demo-karakou, échec sous 85), Sentry, Cloudflare Web Analytics,
branchement du domaine, pages CGV et confidentialité, essai de restauration D1 Time Travel.
Donne-moi la liste de ce qui reste avant d'ouvrir aux clients.
```

## Créer un nouveau modèle

Vous dessinez, Claude Code code. Compter 1 à 2 jours par modèle une fois le moteur en place.

1. **Idée** : événement visé, ambiance, 3 inspirations (Pinterest, TikTok, concurrents).
2. **Maquette dans Canva ou Figma** : format téléphone 1080 × 1920, un écran par section (ouverture, héro, date, programme, lieu, RSVP, fin), en FR et en AR.
3. **Exports** : illustrations et décors en PNG ou SVG transparents, codes couleur, noms des polices, et une courte note sur les animations voulues (« les nuages glissent », « la bougie s'allume »).
4. **Code** : donner le tout à Claude Code avec le prompt ci-dessous.
5. **Vérification** : sur 2 vrais téléphones (un Android moyen, un iPhone), en FR et en AR, dans WhatsApp.
6. **Publication** : photo d'aperçu, tags, prix, puis vidéo TikTok de lancement du modèle.

```text
Crée le thème "[slug]" dans src/invitation/themes/ selon le TRD (Moteur de modèles).
Maquettes et assets dans design/[slug]/. Couleurs : [...]. Polices : [...].
Ouverture : [Envelope / Doors / WaxSeal / Curtain]. Sections actives : [...].
Animations : [notes]. Schema zod des champs modifiables par le client.
Teste en fr et ar à 375x812 et respecte le budget de performance.
```

Règle : uniquement des illustrations, polices et musiques que vous avez le droit d'utiliser commercialement (ressources gratuites ou Pro de Canva selon leur licence, polices Google Fonts, créations maison).
