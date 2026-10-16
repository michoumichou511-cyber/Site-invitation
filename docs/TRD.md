# TRD — Document technique

Comment on construit le PRD : la stack, les données, les routes et les règles techniques que Claude Code devra suivre.

## Stack technique

Next.js + TypeScript, tout hébergé chez Cloudflare (site, code serveur, base de données, fichiers). L'offre gratuite de Cloudflare autorise l'usage commercial et couvre largement le lancement ; le forfait payant coûte 5 $/mois si un jour les limites sont dépassées.

| Couche | Choix | Pourquoi |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript, déployé sur Cloudflare Workers via l'adaptateur OpenNext | Pages rapides et bien référencées, un seul code front + back |
| Style | Tailwind CSS + composants shadcn/ui pour l'admin | Rapide à écrire, support RTL natif |
| Animations | GSAP + ScrollTrigger + SplitText, Lenis (scroll fluide), Motion pour les petites transitions | Standard du web animé haut de gamme |
| 3D | Three.js via React Three Fiber + drei (site vitrine et pack Prestige seulement) | Téléphone 3D du héro, ouvertures 3D |
| Langues | next-intl, routes /fr et /ar | FR/AR avec bascule de direction |
| Base de données | Cloudflare D1 (SQLite) + Drizzle ORM | Gratuit : 5 Go, 5 M lectures et 100 000 écritures par jour, sans mise en pause |
| Fichiers | Cloudflare R2 (photos, musiques), images en WebP | Gratuit jusqu'à 10 Go, sans frais de téléchargement |
| Connexion | Better Auth sur D1 : lien magique e-mail (client), e-mail + mot de passe + 2FA (admin) | Gratuit, pas de mot de passe à retenir pour le client |
| Paiement | MVP : reçu BaridiMob/CCP validé à la main. V2 : Chargily Pay (Edahabia, CIB) avec webhook | Moyens de paiement algériens |
| E-mails | Resend (offre gratuite) | Confirmations, lien magique |
| Anti-abus | Cloudflare Turnstile + limites de requêtes Cloudflare | Protège RSVP et commandes contre le spam, gratuit |
| Tâches planifiées | Cloudflare Cron Triggers | Purges, rappels |
| QR codes | Librairie qrcode (génération), lecture caméra via le navigateur | Pas d'app à installer |
| Hors ligne | Service worker (PWA) sur les invitations | L'adresse et le programme restent visibles sans réseau |
| Suivi | Cloudflare Web Analytics + Sentry (erreurs) | Gratuits, voir les bugs avant les clients |

Alternatives écartées : Vercel + Supabase (environ 45 $/mois dès la première vente, l'offre gratuite de Vercel interdit l'usage commercial) et Laravel + React (deux projets à maintenir).

## Architecture

Une seule application Next.js découpée en quatre zones, qui parlent toutes à Cloudflare D1 (données) et R2 (fichiers). Les invitations publiques sont pré-rendues et mises en cache pour s'ouvrir instantanément.

| Zone | URL | Rendu | Parle à |
| --- | --- | --- | --- |
| Site vitrine | /fr, /ar (+ /modeles, /tarifs, /blog…) | Statique, revalidé quand un modèle change | D1 (lecture modèles) |
| Invitations publiques | /i/\[slug\] et /i/\[slug\]/\[codeInvité\] | Statique + cache, RSVP envoyé par Server Action | D1 (lecture invitation, écriture RSVP), R2, Turnstile |
| Espace client | /compte/… | Dynamique, connecté | D1 + R2 (chaque requête vérifie que le client ne touche que ses données) |
| Back-office | /admin/… | Dynamique, connecté, rôle admin | D1, R2, Resend, Chargily |
| Webhooks | /api/webhooks/chargily | Serveur | Chargily → met la commande à « payée » |
| Tâches planifiées | Cloudflare Cron Triggers, chaque nuit | Serveur | Purge des données expirées, rappels de date limite RSVP |

Règle : le code d'un modèle d'invitation ne charge que ce dont il a besoin (pas de Three.js dans une invitation sauf ouverture 3D Prestige, chargée à la demande).

## Modèle de données

La base compte 14 tables (plus les tables de connexion de Better Auth). Leur définition complète, testée, avec contraintes, index, règles d'accès et rétention, est dans l'onglet **Backend Schema** et dans `src/db/schema.ts` : c'est la seule référence. Les points d'architecture à retenir ici :

- Une commande (`orders`) crée exactement une invitation (`invitations`), dont la personnalisation vit dans un champ JSON `config` validé par le schéma zod du thème.
- Les moments de la fête (henné, fête des femmes, cortège…) sont des lignes `events`, chacune avec son lieu ; un invité répond une fois par moment.
- Les invités nominatifs (`guests`) portent un code de 10 caractères qui sert au lien et au QR.
- Les montants sont des entiers en DA ; les dates des entiers en millisecondes ; les textes traduits un JSON `{ fr, ar }`.

**Sauvegardes** : D1 garde automatiquement un historique restaurable à la minute près (Time Travel) sur 7 jours avec l'offre gratuite, 30 jours avec l'offre payante ([doc Cloudflare](https://developers.cloudflare.com/d1/reference/time-travel/)). En plus, un export complet de la base vers R2 chaque semaine par une tâche planifiée.

## Moteur de modèles d'invitation

Chaque modèle est un thème React qui assemble des sections communes. Une nouvelle invitation client = une ligne en base avec sa config, sans toucher au code. C'est ce qui permet de livrer en 10 minutes.

**Organisation du code**

```
src/invitation/
  sections/        Opener, Hero, Verse, Countdown, Program, Venue, Gallery,
                   Rsvp, Guestbook, Wish (bougie), Gift (cadeau), Letter, Closing
  openers/         Envelope, Doors (porte de la Casbah), WaxSeal, Curtain, Envelope3D (lazy)
  themes/
    karakou/       theme.ts (couleurs, polices, décor) + schema.ts + preview.jpg
    zellige-tlemcen/
    casbah/
    bijoux-kabyles/
    ciel/
    baie-alger/
  engine/          renderInvitation(config), validation zod, i18n, musique, hors ligne
```

**Contrat d'un thème**

- `schema.ts` : schéma zod des champs que le client remplit (noms, textes, photos, couleurs autorisées, sections activables). Il sert à la fois à l'assistant de commande, à l'espace client et à la validation serveur.
- `theme.ts` : palette, polices (latine + arabe), ouverture, ordre des sections, décor animé (pétales, paillettes, nuages).
- Le thème ne lit jamais la base : il reçoit une config validée.

**Règles**

- Toute section existe en FR et AR et s'affiche correctement en droite-à-gauche.
- Les démos du catalogue utilisent une config démo dont la date = aujourd'hui + 60 jours, calculée à l'affichage.
- Après la date de l'événement, le compte à rebours devient un message de remerciement et le RSVP se ferme.
- Le filigrane « Aperçu » s'affiche tant que la commande n'est pas payée.

## Bilingue, animations et performance

**Français / arabe**

- Routes `/fr/…` et `/ar/…`, `<html lang dir>` réglé côté serveur (`dir="rtl"` pour l'arabe).
- Tailwind en propriétés logiques uniquement (`ms-`, `me-`, `ps-`, `start-`, `end-`), jamais `ml-`/`mr-`/`left-`/`right-`.
- Polices (détail dans UI/UX Design) : Marcellus et Tajawal pour le français, Reem Kufi et Tajawal pour l'arabe, Pinyon Script et Aref Ruqaa pour les prénoms des invitations, Noto Sans Tifinagh pour les modèles amazighs. Auto-hébergées, en sous-ensembles de caractères, avec `font-display: swap`.
- Animations horizontales inversées en RTL (un glissement depuis la gauche vient de la droite en arabe).
- Chiffres : latins par défaut (usage algérien), option chiffres arabes-indiens.
- Textes de l'interface dans `messages/fr.json` et `messages/ar.json`, darja possible dans l'assistant de commande.

**Animations**

- Site vitrine : Lenis + GSAP ScrollTrigger pour les sections épinglées et la parallaxe ; héro React Three Fiber avec un modèle de téléphone léger (glTF compressé < 500 Ko) dont l'écran affiche une vidéo ou une texture des invitations.
- Invitations : GSAP seul (pas de 3D par défaut), révélations au scroll, décor en canvas 2D léger.
- `prefers-reduced-motion` respecté partout : animations remplacées par de simples fondus.
- Détection des téléphones faibles (mémoire, nombre de cœurs) : la 3D est remplacée par une image animée.

**Musique** : démarre uniquement au geste « Ouvrir » (les navigateurs bloquent la lecture auto), MP3 96 kb/s, chargée après le premier affichage, bouton son fixe dans un coin.

**Budget de performance d'une invitation**

| Élément | Budget |
| --- | --- |
| JavaScript initial | < 150 Ko compressé |
| Images au premier écran | < 400 Ko (WebP/AVIF, tailles adaptées) |
| Polices | < 150 Ko (sous-ensembles) |
| Premier affichage (LCP) en 4G | < 2 s |
| Musique | Chargée après ouverture, < 3 Mo |

## Routes et API

Les écritures passent par des Server Actions Next.js validées avec zod. Seul le webhook de paiement (V2) est une route API publique en écriture. La liste complète des écrans et leur enchaînement font foi dans l'onglet **App Flow** ; ce tableau donne les routes.

| Route | Qui | Rôle |
| --- | --- | --- |
| `/[lang]` | Public | Accueil avec héro 3D |
| `/[lang]/modeles` et `/[lang]/modeles/[slug]` | Public | Catalogue, fiche modèle, démo |
| `/[lang]/tarifs`, `/faq`, `/avis`, `/entreprises`, `/partenaires`, `/blog/[slug]` | Public | Pages de vente |
| `/[lang]/commander` | Public | Assistant de commande + aperçu |
| `/[lang]/suivi` | Public | Suivi par code |
| `/i/[slug]` | Invité | Invitation générique |
| `/i/[slug]/[code]` | Invité | Invitation nominative (prénom, places, QR) |
| `/compte`, `/compte/invitations/[id]`, `/compte/invitations/[id]/invites`, `/reponses`, `/scan` | Client | Espace client |
| `/admin`, `/admin/commandes`, `/admin/paiements`, `/admin/modeles`, `/admin/clients`, `/admin/promos`, `/admin/avis`, `/admin/bibliotheque` | Admin | Back-office |
| `POST /api/webhooks/chargily` | Chargily | Paiement confirmé (signature vérifiée) |
| `GET /api/og/[slug]` | Public | Image d'aperçu WhatsApp générée |
| `GET /api/ics/[slug]` | Public | Fichier calendrier |

**Server Actions** (une par fichier dans `src/actions/`, chacune vérifie le rôle puis valide avec zod) :

- Public : `createOrder`, `uploadReceipt`, `trackOrder`, `requestMagicLink`.
- Invité : `submitRsvp`, `submitWish`.
- Client : `updateInvitation`, `importGuests`, `addManualRsvp`, `exportGuests` (CSV), `checkInGuest`.
- Admin : `validatePayment`, `refusePayment`, `publishInvitation`, `upsertTemplate`, `moderateReview`.

## Sécurité et vie privée

On manipule des noms, des numéros de téléphone et des photos de famille : la confidentialité est une promesse commerciale, pas un détail.

- **Contrôle d'accès côté serveur sur chaque requête D1** : un client ne lit et n'écrit que ses commandes, invitations et invités. Les invités n'accèdent qu'à la lecture de l'invitation publiée et à l'écriture de leur RSVP.
- **Codes invités** aléatoires de 10 caractères (impossibles à deviner), slug d'invitation non séquentiel.
- **Anti-spam** : limite de 10 RSVP par minute et par IP, Turnstile sur commande et livre d'or, taille et type de fichier vérifiés côté serveur.
- **Invitations non indexées** (`noindex`, absentes du sitemap), code d'accès optionnel, expiration automatique.
- **Photos** : métadonnées GPS supprimées à l'envoi, liens signés pour les fichiers privés.
- **Admin** : 2FA obligatoire, journal d'activité, aucune clé ni accès direct à la base depuis le navigateur.
- **Webhook Chargily** : signature vérifiée, traitement idempotent (un paiement ne valide jamais deux fois).
- **Secrets** dans les secrets Cloudflare (wrangler secret), jamais dans le code.
- **Loi algérienne 18-07 sur les données personnelles** : politique de confidentialité claire, consentement à la commande, suppression sur demande, purge des données invités 6 mois après l'événement. À vérifier avec un juriste avant le lancement, notamment l'hébergement des données hors d'Algérie.
- **Musique** : uniquement des titres libres de droits ou fournis par le client, qui en est responsable (dans les conditions de vente).

## Hébergement, déploiement et tests

- **Environnements** : `local` (D1 local avec Wrangler), `preview` (une URL Cloudflare par branche), `production`.
- **Git** : GitHub, branche `main` = production, une branche par fonctionnalité, déploiement automatique.
- **Domaine** : un `.com` (achat simple, sur Cloudflare, au prix coûtant). Le `.dz` demande une structure enregistrée en Algérie, à voir plus tard. Liens courts d'invitation sur le même domaine (`marque.com/i/amine-sara`).
- **Coûts de départ** : 0 $ : offre gratuite Cloudflare (Pages, Workers, D1, R2), usage commercial autorisé. Forfait Workers Paid à 5 $/mois seulement si les limites quotidiennes sont dépassées. Détail dans l'onglet Business.
- **Tests** :
  - Vitest pour la logique (calcul des places, statuts de commande, validation des configs).
  - Playwright pour les parcours : commande complète, RSVP, scan QR, en FR et en AR, sur un écran de téléphone.
  - Vérification visuelle de chaque thème en FR et AR avant publication.
  - Lighthouse CI sur l'accueil et `/i/demo-karakou`, profil mobile 4G : la fusion est bloquée si le score Performance < 85, LCP > 2,5 s, CLS > 0,1 ou si le JavaScript d'une invitation dépasse 150 Ko compressés.
- **Qualité** : ESLint, Prettier, TypeScript strict, GitHub Actions (lint + tests + build) avant chaque fusion.
- **Surveillance** : Sentry pour les erreurs, alerte si le taux d'erreur RSVP dépasse 1 %. Cloudflare Web Analytics (sans cookie) pour l'audience et les Core Web Vitals réels.

## Performance, cache et médias

Les invités ouvrent le lien depuis WhatsApp, souvent en 4G moyenne : la vitesse fait partie du produit.

| Budget par invitation | Limite |
| --- | --- |
| JavaScript (compressé) | < 150 Ko |
| LCP en 4G | < 2 s |
| Images de la première vue | < 400 Ko |
| Polices | < 150 Ko |
| Musique | < 3 Mo, chargée seulement après l'ouverture de l'enveloppe |

- **Rendu** : une invitation publiée est rendue côté serveur puis mise en cache à la périphérie Cloudflare ; la publication ou une modification purge son cache. Les RSVP et le livre d'or sont les seules parties dynamiques.
- **Images** : compressées dans le navigateur avant l'envoi (WebP, 1 600 px maximum, métadonnées supprimées), stockées dans R2, servies avec `Cache-Control: public, max-age=31536000, immutable` (nom de fichier unique à chaque version).
- **3D et animations** : Three.js / React Three Fiber uniquement dans le héro du site et le pack Prestige, chargés à la demande ; repli sans WebGL et respect de `prefers-reduced-motion`.
- **Hors ligne** : l'invitation est mise en cache par un service worker après la première visite (lieu, horaires et QR restent lisibles sans réseau dans la salle).
- **WhatsApp** : uniquement des liens `wa.me` préremplis ouverts par l'utilisateur ; aucune API WhatsApp, aucun envoi automatique.
