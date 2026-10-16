# Mettre le site en ligne (Cloudflare)

Tout tourne sur l'offre gratuite de Cloudflare : le site et le code serveur (Workers), la base de données (D1), les fichiers (R2), l'anti-robot (Turnstile) et les statistiques (Web Analytics). À faire une seule fois, dans l'ordre.

## 1. Préparer son ordinateur

```bash
# Node.js 22+ et pnpm
npm i -g pnpm
pnpm install
cp .dev.vars.example .dev.vars   # secrets locaux, jamais commités
pnpm db:migrate:local && pnpm db:seed:local
pnpm admin:create -- vous@exemple.com "un mot de passe de 12 caractères ou plus" "Votre nom"
pnpm dev                          # http://localhost:3000
```

## 2. Créer les ressources Cloudflare

```bash
npx wrangler login
npx wrangler d1 create louloua-db           # copier le "database_id" affiché
npx wrangler r2 bucket create louloua-files
npx wrangler r2 bucket create louloua-opennext-cache
```

Dans `wrangler.jsonc`, remplacer `"database_id": "00000000-…"` par l'identifiant donné par `d1 create`.

## 3. Secrets de production

Chaque commande demande la valeur (elle n'est jamais écrite dans le code) :

```bash
npx wrangler secret put BETTER_AUTH_SECRET     # longue chaîne aléatoire : openssl rand -base64 32
npx wrangler secret put BETTER_AUTH_URL        # https://votre-domaine.com
npx wrangler secret put RESEND_API_KEY         # compte gratuit sur resend.com (e-mails)
npx wrangler secret put EMAIL_FROM             # ex. Lou'lou'a <bonjour@votre-domaine.com>
npx wrangler secret put TURNSTILE_SECRET_KEY   # tableau de bord Cloudflare → Turnstile
npx wrangler secret put SENTRY_DSN             # facultatif : sentry.io, projet JavaScript
```

Dans `wrangler.jsonc` → `vars` :

- `PUBLIC_SITE_URL` : `https://votre-domaine.com`
- `TURNSTILE_SITE_KEY` : la clé publique Turnstile (remplace la clé de test)
- `PUBLIC_CF_BEACON_TOKEN` : jeton Cloudflare Web Analytics (facultatif)

Dans `src/config/site.ts` : vrai numéro WhatsApp, e-mail, Instagram, TikTok, et les coordonnées CCP / BaridiMob affichées à l'étape paiement.

## 4. Base de données en ligne et premier déploiement

```bash
pnpm db:migrate:remote        # crée les tables
pnpm db:seed:remote           # les 6 modèles du catalogue et leurs démos
pnpm admin:create -- vous@exemple.com "mot de passe" "Votre nom" --remote
pnpm deploy                   # build OpenNext + déploiement du Worker
```

Le site est alors en ligne sur `https://louloua.<votre-compte>.workers.dev`. À la première connexion sur `/fr/admin`, la double authentification est demandée : scannez le QR code avec Google Authenticator, Microsoft Authenticator ou 2FAS, et gardez les codes de secours.

## 5. Brancher le domaine

1. Acheter le `.com` dans Cloudflare (Domain Registration, prix coûtant) ou y transférer ses DNS.
2. Workers & Pages → `louloua` → Settings → Domains & Routes → Add → Custom domain → `votre-domaine.com` (et `www` si voulu).
3. Mettre `PUBLIC_SITE_URL` et `BETTER_AUTH_URL` à jour, puis `pnpm deploy`.

## 6. Ce qui tourne tout seul

- **Chaque nuit à 3 h (heure d'Alger)** : purge des données des invités 6 mois après l'événement (`worker.ts` → `src/lib/purge.ts`). Les commandes et paiements restent pour la comptabilité.
- **Sauvegardes D1 (Time Travel)** : Cloudflare garde l'historique de la base à la minute près, 7 jours avec l'offre gratuite (30 jours avec l'offre payante).

### Essayer une restauration (à faire au moins une fois avant le lancement)

```bash
# 1. Noter l'état actuel (renvoie un « bookmark »)
npx wrangler d1 time-travel info louloua-db
# 2. Restaurer la base telle qu'elle était à une date donnée (UTC, format ISO)
npx wrangler d1 time-travel restore louloua-db --timestamp=2026-10-16T18:00:00Z
# 3. En cas d'erreur, revenir au bookmark noté à l'étape 1
npx wrangler d1 time-travel restore louloua-db --bookmark=<bookmark>
```

Pour un export complet en plus (à garder hors de Cloudflare) :

```bash
npx wrangler d1 export louloua-db --remote --output=sauvegarde-$(date +%F).sql
```

## 7. Rester dans l'offre gratuite

| Ressource | Limite gratuite | Où on en est |
| --- | --- | --- |
| Worker (taille compressée) | 3 Mo | ≈ 2,3 Mo : surveiller avant d'ajouter une grosse librairie côté serveur |
| Requêtes Workers | 100 000 / jour | chaque ouverture d'invitation = 1 requête + fichiers statiques (gratuits) |
| Écritures D1 | 100 000 / jour | un RSVP = 1 écriture ; une ouverture = 1 à 2 (compteurs de vues) ; un import de 300 invités = 300 |
| Lectures D1 | 5 millions / jour | large |
| R2 | 10 Go | photos WebP ≈ 200 Ko, musiques < 3 Mo |

Si un jour une limite est dépassée, l'offre Workers Paid coûte 5 $/mois.

## 8. Vérifier avant chaque mise en ligne

```bash
pnpm check                    # lint + types + tests + build
pnpm test:e2e                 # parcours complets en fr et ar (375×812)
pnpm preview                  # le site dans les conditions Cloudflare, http://localhost:8787
pnpm budget http://localhost:8787/i/demo-karakou   # JS et polices < 150 Ko
```

La CI GitHub (`.github/workflows/ci.yml`) refait tout cela à chaque pull request, avec Lighthouse mobile (échec sous 85).
