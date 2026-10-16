# Comment démarrer avec Claude Code

> **État du projet** : les phases 0 à 6 sont construites et testées. Pour mettre le site en
> ligne, suivez `docs/DEPLOIEMENT.md` ; la liste de ce qui reste avant d'ouvrir aux
> clients est dans `docs/LANCEMENT.md`.

Ce dossier est le point de départ du projet. Claude Code lit automatiquement
`CLAUDE.md` à chaque session ; les détails sont dans `docs/`.

## Ce qu'il y a dedans

| Dossier / fichier                                   | Contenu                                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                                         | Les règles du projet (stack, code, performance, design). Lu à chaque session.                 |
| `docs/`                                             | Les 6 documents (PRD, TRD, APP_FLOW, UI_UX, BACKEND_SCHEMA, IMPLEMENTATION_PLAN) + ANIMATIONS |
| `design/references/`                                | Les 2 prototypes (héro 3D, invitation enveloppe) que Claude Code doit reproduire et améliorer |
| `src/db/schema.ts`, `drizzle/`, `drizzle.config.ts` | La base de données, déjà écrite et testée (14 tables)                                         |

## Les étapes

1. Installe Node.js 20+ et pnpm (`npm i -g pnpm`), et crée un compte Cloudflare gratuit.
2. Dézippe ce dossier, ouvre un terminal dedans, puis :
   ```
   git init
   claude
   ```
3. Dans Claude Code, active le mode plan (Maj+Tab), puis colle le prompt de la phase 0
   (copié de `docs/IMPLEMENTATION_PLAN.md`) :

   ```text
   Lis CLAUDE.md puis les 6 documents de docs/. Initialise le projet :
   - Next.js App Router + TypeScript strict + Tailwind + pnpm, déploiement Cloudflare via
     @opennextjs/cloudflare, wrangler.jsonc avec les bindings D1 (louloua-db) et R2.
   - D1 + Drizzle avec le schéma fourni : src/db/schema.ts et drizzle/0000_init.sql sont déjà là,
     règle migrations_dir pour Wrangler, applique la migration en local.
   - Better Auth (tables générées dans src/db/auth-schema.ts), lien magique par e-mail.
   - next-intl avec /fr et /ar (dir rtl pour ar), polices FR et AR auto-hébergées.
   - src/styles/tokens.css avec les tokens exacts de docs/UI_UX.md.
   - ESLint + Prettier + Vitest + Playwright + GitHub Actions (lint, typecheck, tests, build).
   Résultat attendu : une page d'accueil vide qui bascule FR/AR, déployée sur Cloudflare.
   Vérifie les critères « Terminé quand » de la phase 0. Montre-moi le plan avant de coder.
   ```

4. Valide son plan, laisse-le coder, vérifie le résultat, puis passe à la phase suivante
   (prompts 1 à 6 dans `docs/IMPLEMENTATION_PLAN.md`).

## Bon à savoir

- Claude Code ne se souvient pas des sessions précédentes : tout ce qu'il doit savoir doit
  être dans `CLAUDE.md` ou `docs/`. Si vous décidez quelque chose (nom de marque, prix...),
  mettez-le à jour dans les docs.
- Le nom « Lou'lou'a » est provisoire. Une fois votre nom choisi, dites à Claude Code :
  « Remplace le nom provisoire Lou'lou'a par [NOM] partout ».
- Faites une phase à la fois, et un commit git à la fin de chaque phase.
