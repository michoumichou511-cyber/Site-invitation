# Lou'lou'a (nom provisoire)

Invitations digitales animées pour l'Algérie : mariage, fiançailles, anniversaire, naissance… en français et en arabe, payées en dinars, avec RSVP, carte, musique et QR.

- **Démarrer** : `COMMENCER-ICI.md`
- **Règles du projet** : `CLAUDE.md`
- **Mettre en ligne** : `docs/DEPLOIEMENT.md`
- **Reste à faire avant le lancement** : `docs/LANCEMENT.md`

```bash
pnpm install && cp .dev.vars.example .dev.vars
pnpm db:migrate:local && pnpm db:seed:local
pnpm dev   # http://localhost:3000/fr · démo : /i/demo-karakou
```

Stack : Next.js 16 + TypeScript sur Cloudflare Workers (OpenNext), D1 + Drizzle, R2, Better Auth, next-intl, Tailwind, GSAP, Lenis, React Three Fiber.
