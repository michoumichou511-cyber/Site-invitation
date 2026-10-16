# Mettre le site en ligne (Cloudflare)

Tout tourne sur l'offre gratuite de Cloudflare : le site et le code serveur (Workers), la base de données (D1), les fichiers (Workers KV), l'anti-robot (Turnstile) et les statistiques (Web Analytics).

## Le plus simple : Cloudflare relié à GitHub (Workers Builds)

Cloudflare construit et publie le site à chaque push. Sur Cloudflare, `pnpm run build` (`scripts/build.mjs` → `scripts/cf-prepare.mjs`) crée tout seul, au premier déploiement, la base D1, le stockage des fichiers (KV), les tables, les 6 modèles et le secret de connexion.

1. Tableau de bord Cloudflare → **Workers & Pages** → **Create** → onglet **Workers** → **Import a repository** → choisir `Site-invitation`. (Pas « Pages » : le site a besoin d'un Worker.)
2. Réglages du projet :
   - **Project name** : `louloua` (doit être identique au `name` de `wrangler.jsonc`)
   - **Production branch** : `main`
   - **Build command** : `pnpm run build` (valeur par défaut)
   - **Deploy command** : `npx wrangler deploy` (valeur par défaut)
   - **Variables de build** : `NODE_VERSION` = `22`
3. **Save and Deploy**. Après quelques minutes, le site est en ligne sur `https://louloua.<votre-sous-domaine>.workers.dev`.
4. Créer le premier compte admin depuis votre ordinateur (une seule fois) :
   `npx wrangler login` puis `pnpm admin:create -- vous@exemple.com "mot de passe de 12 caractères ou plus" "Votre nom" --remote`.

Si le déploiement échoue sur la base ou les stockages (« permission »), donner au jeton de build les droits **D1 : Edit** et **Workers KV Storage : Edit** (Settings → Builds → API token).

Ensuite, les sections ci-dessous servent à compléter : e-mails (Resend), Turnstile, domaine, Sentry. Sans elles, le site fonctionne déjà : les e-mails ne partent pas (les liens de connexion restent disponibles dans l'admin pour WhatsApp) et l'anti-robot est en mode test.

## À la main (sans Workers Builds)

À faire une seule fois, dans l'ordre.

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
```

La base D1 et le stockage KV sont créés par `pnpm deploy` (étape 4). Pour travailler ensuite depuis votre ordinateur sur la base en ligne, copier dans `wrangler.jsonc` le `database_id` affiché pendant le déploiement.

## 3. Secrets de production

Chaque commande demande la valeur (elle n'est jamais écrite dans le code) :

```bash
npx wrangler secret put BETTER_AUTH_SECRET     # créé automatiquement par pnpm deploy s'il manque
npx wrangler secret put BETTER_AUTH_URL        # https://votre-domaine.com (facultatif avant le domaine)
npx wrangler secret put RESEND_API_KEY         # compte gratuit sur resend.com (e-mails)
npx wrangler secret put EMAIL_FROM             # ex. Lou'lou'a <bonjour@votre-domaine.com>
npx wrangler secret put TURNSTILE_SECRET_KEY   # tableau de bord Cloudflare → Turnstile
npx wrangler secret put SENTRY_DSN             # facultatif : sentry.io, projet JavaScript
```

Dans `wrangler.jsonc` → `vars` :

- `PUBLIC_SITE_URL` : `https://votre-domaine.com` (vide = l'adresse par laquelle on visite le site)
- `TURNSTILE_SITE_KEY` : la clé publique Turnstile (remplace la clé de test)
- `PUBLIC_CF_BEACON_TOKEN` : jeton Cloudflare Web Analytics (facultatif)

Dans `src/config/site.ts` : vrai numéro WhatsApp, e-mail, Instagram, TikTok, et les coordonnées CCP / BaridiMob affichées à l'étape paiement.

## 4. Base de données en ligne et premier déploiement

```bash
pnpm deploy                   # crée D1 et KV si besoin, tables, 6 modèles, publication
pnpm admin:create -- vous@exemple.com "mot de passe" "Votre nom" --remote
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
| KV (fichiers) | 1 Go, 1 000 écritures / jour | photos WebP ≈ 200 Ko, musiques < 3 Mo (≈ 5 000 photos). Au-delà : passer sur R2 (10 Go gratuits, à activer dans le tableau de bord) |

Si un jour une limite est dépassée, l'offre Workers Paid coûte 5 $/mois.

## 8. Vérifier avant chaque mise en ligne

```bash
pnpm check                    # lint + types + tests + build
pnpm test:e2e                 # parcours complets en fr et ar (375×812)
pnpm preview                  # le site dans les conditions Cloudflare, http://localhost:8787
pnpm budget http://localhost:8787/i/demo-karakou   # JS et polices < 150 Ko
```

La CI GitHub (`.github/workflows/ci.yml`) refait tout cela à chaque pull request, avec Lighthouse mobile (échec sous 85).
