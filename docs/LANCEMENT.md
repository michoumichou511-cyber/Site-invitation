# Avant d'ouvrir aux clients

État au 16 octobre 2026 : les phases 0 à 6 du plan sont construites et testées automatiquement (34 tests unitaires, 33 parcours Playwright en fr et ar à 375×812). Ce qui suit demande une décision, un compte ou une vérification humaine.

## À faire par vous (bloquant)

- [ ] **Nom de la marque** : « Lou'lou'a » est provisoire. Dire à Claude Code : « Remplace le nom provisoire Lou'lou'a par [NOM] partout » (textes `messages/*.json`, `src/config/site.ts`, e-mails, métadonnées).
- [ ] **Coordonnées réelles** dans `src/config/site.ts` : numéro WhatsApp, e-mail, Instagram, TikTok, compte CCP, RIP, BaridiMob (aujourd'hui des valeurs d'exemple).
- [ ] **Comptes et secrets Cloudflare** : suivre `docs/DEPLOIEMENT.md` (D1, KV, Turnstile, Resend, domaine).
- [ ] **Pages légales** : CGV, confidentialité et remboursement sont des brouillons (bandeau « à faire valider »). Les faire relire par un juriste, en particulier sur la loi 18-07 et l'hébergement des données hors d'Algérie, puis retirer le bandeau (`legal.draft` dans `messages/*.json` et `src/app/[locale]/(site)/legal/[page]/page.tsx`).
- [ ] **Prix des packs** (2 500 / 5 000 / 10 000 DA) : hypothèses du PRD, à confirmer. Ils sont dans `src/lib/orders/pricing.ts` et `messages/*.json` (`packs`).
- [ ] **Délai « sous 2 h »** pour vérifier les reçus : à confirmer avec votre organisation réelle (`order.thanksText`, `emails.receiptBody`).
- [ ] **Textes arabes** : rédigés pour le lancement, à faire relire par un arabophone (UI/UX : « jamais traduits mot à mot »).
- [ ] **Statut légal** pour encaisser (auto-entrepreneur, registre de commerce).

## À vérifier à la main (une fois en ligne)

- [ ] Chaque modèle sur un **Android moyen** et un **iPhone**, en fr et en ar, **ouvert depuis WhatsApp** (navigateur intégré) : ouverture, musique après le geste, bouton son, RSVP, Maps/Waze, calendrier.
- [ ] Lighthouse mobile sur le vrai domaine (la CI mesure en local, sans compression Cloudflare) : objectif ≥ 85, LCP < 2,5 s.
- [ ] Une restauration D1 Time Travel (commandes dans `docs/DEPLOIEMENT.md`, section 6).
- [ ] Un vrai e-mail de lien magique reçu (Resend + domaine d'envoi vérifié).
- [ ] Une commande test de bout en bout en production : commande → reçu → validation admin → publication → lien client → import d'invités → RSVP.
- [ ] Aperçu WhatsApp d'un lien d'invitation (titre « Mariage de … »).

## Choix faits pendant la construction (à connaître)

- **Pas de middleware** : les routes `/fr` et `/ar` sont gérées par Next.js et next-intl sans `proxy.ts` (plus simple sur Cloudflare). La racine `/` redirige vers `/fr`.
- **Invitations rendues à chaque visite** (lecture D1 rapide) plutôt qu'en cache : la réponse de l'invité et les compteurs d'ouverture sont toujours à jour. Le cache de périphérie pourra être ajouté si le trafic grossit.
- **Musique** : si le client ne fournit pas de MP3, une mélodie andalouse (gamme hijaz) est générée par le navigateur, sans fichier ni droits d'auteur. Aucune bibliothèque de musiques n'est livrée : n'ajoutez que des titres libres de droits.
- **Téléphone 3D du héro** : modèle dessiné en code (pas de fichier glTF), chargé au premier geste du visiteur ; version plate sur téléphone modeste, sans WebGL ou en « moins d'animations ».
- **Image d'aperçu WhatsApp** : titre personnalisé (« Mariage de Amine & Sara ») ; l'image générée par invitation n'est pas faite (elle alourdirait le Worker, proche de la limite gratuite de 3 Mo).
- **Sentry** : envoi direct sans SDK (léger). Il suffit de mettre `SENTRY_DSN`.
- **Export PDF** des réponses : via « Imprimer / PDF » du navigateur (mise en page d'impression dédiée).

## Prévu pour la V2 (non construit)

Paiement Chargily (Edahabia/CIB), QR d'entrée et scan à la porte, fêtes femmes/hommes du même lien, relances programmées, codes promo et partenaires (tables déjà prêtes), assistant en mode chat, blog, page entreprises, statistiques, « Trouver ma table », ouverture 3D Prestige sur mesure, image d'aperçu WhatsApp générée.
