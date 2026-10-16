# Animations

Deux animations sont déjà prototypées et testées (mobile, FR et AR). Claude Code s'en sert comme référence, les intègre dans le vrai site, puis les améliore.

## Les deux prototypes

| Prototype | Ce qu'il montre | Techno |
| --- | --- | --- |
| [Lou'lou'a Héro 3D](https://claude.ai/artifact/JTAcFLDoqWUoyp3dEDXA7S) | Téléphone 3D qui fait un tour complet au scroll et change de modèle (mariage → anniversaire → naissance), cartes flottantes RSVP / itinéraire / musique / compte à rebours, arche de la Casbah, bascule FR/AR | Three.js + GSAP ScrollTrigger |
| [Amine & Sara Invitation](https://claude.ai/artifact/RrWAGFwocGhPH6jKNneBaW) | Enveloppe à sceau de cire qui s'ouvre en 3D, carte qui sort, pétales dorés, musique avec bouton son, compte à rebours, date de l'hégire, programme, Maps/Waze, ajout au calendrier, RSVP avec nombre de places, lien nominatif (#karim) | CSS 3D + canvas 2D + WebAudio, sans librairie |

Les deux respectent déjà les règles du PRD : démo datée 60 jours dans le futur, arabe en droite-à-gauche, animations coupées si le téléphone demande moins de mouvement, version de secours sans 3D.

**Comment les donner à Claude Code**

1. Ouvre chaque prototype, et télécharge les fichiers HTML que je t'ai envoyés dans la conversation (`hero-3d.html`, `invitation-envelope.html`).
2. Range-les dans le projet sous `design/references/`.
3. Utilise les prompts plus bas : Claude Code lit le fichier, reproduit l'effet dans la vraie stack (React Three Fiber, composants Next.js) et l'améliore.

À savoir : la musique du prototype est générée par le navigateur (gamme hijaz) pour la démo. Dans le vrai site, ce sera le MP3 choisi par le client.

## Catalogue des animations

Seize effets, classés par endroit. La 3D lourde reste sur le site vitrine ; les invitations utilisent du CSS 3D et du canvas léger pour s'ouvrir vite en 4G.

| Effet | Où | Techno | Prototype | Priorité |
| --- | --- | --- | --- | --- |
| Téléphone 3D qui tourne au scroll et change de modèle | Héro du site | React Three Fiber + GSAP ScrollTrigger | Héro 3D | MVP |
| Cartes flottantes (RSVP, itinéraire, musique, compte à rebours) en parallaxe | Héro du site | GSAP | Héro 3D | MVP |
| Scroll fluide sur tout le site | Site | Lenis | À faire | MVP |
| Titres révélés mot par mot | Site | GSAP SplitText | À faire | MVP |
| Galerie de modèles horizontale au scroll, carte qui s'incline en 3D au survol | Catalogue | GSAP + CSS 3D | À faire | MVP |
| Démo qui s'ouvre dans un téléphone réaliste (zoom fluide depuis la carte) | Catalogue | View Transitions API | À faire | V2 |
| Enveloppe à sceau qui s'ouvre, carte qui sort | Ouverture d'invitation | CSS 3D | Invitation | MVP |
| Porte de la Casbah à deux battants en moucharabieh | Ouverture d'invitation | CSS 3D + GSAP | À faire | MVP |
| Parchemin qui se déroule au scroll | Ouverture d'invitation | CSS + GSAP | À faire | V2 |
| Rideau de velours qui se lève | Ouverture d'invitation | CSS clip-path | À faire | V2 |
| Pétales, paillettes dorées ou confettis à l'ouverture et au RSVP | Invitation | Canvas 2D | Invitation | MVP |
| Sections qui apparaissent au scroll | Invitation | IntersectionObserver | Invitation | MVP |
| Compte à rebours façon tableau d'aéroport | Invitation | CSS 3D | À faire | V2 |
| Cadeau qui s'ouvre, ballons qui montent | Invitation anniversaire | CSS 3D + canvas | À faire | MVP |
| Bougie qu'on souffle (toucher, ou micro si accepté) | Invitation anniversaire | Canvas + Web Audio | À faire | V2 |
| Ouverture 3D sur mesure (coffret, écrin à bijoux) | Pack Prestige | React Three Fiber, chargé à la demande | À faire | V2 |

**Règles pour toutes les animations** : 60 images/s visées, version simplifiée sur téléphone faible, `prefers-reduced-motion` respecté, contenu lisible même si une animation ne se lance pas, sens des mouvements inversé en arabe.

## Outils pour dessiner vos propres animations

Vous n'êtes pas obligés de tout décrire avec des mots : dessinez, exportez, et Claude Code intègre.

| Outil | Pour quoi | Ce que vous donnez à Claude Code |
| --- | --- | --- |
| Canva | Illustrations, décors, cadres, fleurs, maquettes d'écran | PNG ou SVG transparents + maquette en image |
| Spline | Scènes 3D sans coder (coffret, écrin, téléphone personnalisé) | Export du modèle 3D (.glb) |
| Rive ou Lottie | Petites animations vectorielles (cadeau, bougie, bébé, alliances) | Fichier .riv ou .json |
| Une vidéo TikTok ou Instagram qui vous plaît | Montrer un effet | 3 à 5 captures + une phrase qui décrit le mouvement |

Vérifiez toujours la licence des éléments (usage commercial autorisé) avant de les mettre dans un modèle vendu.

## Prompts : intégrer puis améliorer

Chaque prompt demande à Claude Code de reproduire l'effet, de l'adapter à notre stack, puis de proposer et faire des améliorations. Valide toujours son plan avant qu'il code.

**Héro 3D (phase 2)**

```text
Lis design/references/hero-3d.html. Reproduis ce héro dans src/components/hero/ avec
React Three Fiber + drei + GSAP ScrollTrigger + Lenis, en respectant CLAUDE.md.
Garde : téléphone qui tourne au scroll, changement de modèle quand il est de profil,
cartes flottantes en parallaxe, FR/AR (rotation inversée en arabe), version de secours
sans WebGL, reduced-motion.
Améliore : vrai modèle de téléphone glTF léger (< 500 Ko), écran qui affiche une
vidéo courte de nos vraies invitations, reflets doux, ombre réaliste, chargement
après le texte. Avant de coder, propose-moi 3 améliorations supplémentaires.
Mesure Lighthouse mobile (objectif >= 85) et montre-moi le résultat.
```

**Enveloppe d'invitation (phase 1)**

```text
Lis design/references/invitation-envelope.html. Transforme-le en ouverture "Envelope"
et en sections du moteur d'invitation (src/invitation/openers et sections), avec les
données venant de la config du thème au lieu d'être en dur.
Garde : sceau qui ouvre, carte qui sort, pétales, bouton son, compte à rebours qui
devient un merci après la date, date hégire, RSVP avec places max, lien nominatif.
Remplace la musique générée par un MP3 chargé après l'ouverture.
Améliore : texture papier, initiales du couple gravées dans le sceau, ouverture plus
fluide au doigt (on peut tirer la carte), vibration légère sur Android à l'ouverture.
Propose 3 améliorations de plus avant de coder. Teste en fr et ar à 375x812.
```

**Nouvelles animations**

```text
Crée l'animation "[nom du catalogue, ex : Porte de la Casbah]" selon l'onglet Animations
du doc. Références : design/[dossier]/ (captures, assets). Fais d'abord un prototype
HTML autonome dans design/references/, montre-le-moi, puis intègre-le dans le moteur.
Respecte les règles : 60 i/s, version allégée, reduced-motion, RTL.
```

**Amélioration continue (à lancer après chaque phase)**

```text
Passe en revue toutes les animations du site et des invitations sur un écran 375x812
et en 4G simulée. Liste ce qui saccade, ce qui charge trop lourd et ce qui pourrait
être plus impressionnant. Propose un classement par impact, puis corrige les 3 premiers.
```
