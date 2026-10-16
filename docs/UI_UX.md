# UI/UX Design

Le système visuel et le comportement de chaque écran. Claude Code s'en sert pour que tout le site reste cohérent.

## Principes de design

1. **Mobile d'abord** : 90 % des visites viendront de WhatsApp, TikTok et Instagram sur téléphone. Chaque écran est dessiné à 375 px de large, puis agrandi.
2. **Algérien, pas générique** : couleurs mesurées sur notre patrimoine (voir PRD), motifs zellige, arcs de la Casbah, calligraphie.
3. **Une seule action principale par écran** : un gros bouton clair (« Voir les modèles », « Personnaliser », « Je confirme »).
4. **Bilingue à égalité** : l'arabe n'est pas une traduction ajoutée après, chaque écran est vérifié en droite-à-gauche.
5. **Le spectacle sur la vitrine et l'ouverture, le calme ailleurs** : animations fortes au héro et à l'ouverture de l'invitation, interface sobre dans l'assistant, l'espace client et l'admin.
6. **Lisible par les aînés** : texte de 16 px minimum, gros boutons (48 px de haut), contrastes forts.

## Design tokens

Ces valeurs vont dans `src/styles/tokens.css`. Les couleurs du site viennent des palettes Casbah et baie d'Alger mesurées sur photos ; les valeurs marquées « dérivée » sont éclaircies ou foncées à partir d'elles pour l'interface. Chaque modèle d'invitation a ses propres couleurs (palettes du PRD).

**Couleurs du site et de l'interface**

| Token | Valeur | Origine | Usage |
| --- | --- | --- | --- |
| `--bg` | #EDEAE4 | dérivée de la chaux #DCD8CF | Fond des pages |
| `--surface` | #FFFFFF | — | Cartes, champs, feuilles |
| `--wall` | #DCD8CF | chaux mesurée (Casbah) | Bandes, arches, séparations |
| `--ink` | #2B140A | dérivée du cèdre #421A0C | Texte principal |
| `--ink-soft` | #6B5A50 | dérivée | Texte secondaire |
| `--cedar` | #421A0C | bois de cèdre mesuré (Casbah) | Titres, pied de page |
| `--sea` | #045588 | bleu Méditerranée mesuré (baie d'Alger) | Boutons principaux, liens |
| `--sea-light` | #A8C7DE | bleu ciel mesuré | Fonds d'accent, sélection |
| `--brass` | #D7C099 | laiton mesuré (Casbah) | Détails, badges, filets |
| `--zellige` | #16544E | vert zellige mesuré (Tlemcen) | Succès, « Présent » |
| `--coral` | #DB7456 | corail mesuré (bijoux kabyles) | Alertes douces, badges « Nouveau » |
| `--danger` | #A3302A | dérivée du corail | Erreurs, « Absent » |

Contrastes calculés (minimum exigé : 4,5:1) : `--ink` sur `--bg` 14,5:1 · blanc sur `--sea` 7,9:1 · `--sea` sur `--bg` 6,6:1 · `--ink-soft` sur `--bg` 5,5:1 · blanc sur `--zellige` 8,7:1 · blanc sur `--danger` 7,0:1. Attention : sur `--coral`, écrire en `--ink` (5,5:1), jamais en blanc (3,2:1, illisible).

**Typographie**

| Rôle | Français | Arabe | Taille mobile / bureau |
| --- | --- | --- | --- |
| Titre héro | Marcellus | Reem Kufi 700 | 36 / 64 px |
| Titre de section | Marcellus | Reem Kufi 500 | 28 / 40 px |
| Sous-titre | Tajawal 700 | Tajawal 700 | 20 / 24 px |
| Texte | Tajawal 400 | Tajawal 400 | 16 / 18 px |
| Petit texte, étiquettes | Tajawal 500 | Tajawal 500 | 14 px |
| Prénoms dans les invitations | Pinyon Script | Aref Ruqaa | 56 à 96 px |
| Lettres tifinagh (modèles amazighs) | — | Noto Sans Tifinagh | comme le texte |

Interligne : 1,6 pour le texte, 1,1 pour les titres latins, 1,4 pour les titres arabes (les lettres arabes montent et descendent plus).

**Espacements, rayons, ombres**

- Espacements : 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Marge des côtés sur mobile : 16 px.
- Rayons : 8 px (champs), 16 px (cartes), 999 px (boutons), arche pour les cadres de photo (rayon complet en haut).
- Une seule ombre douce pour les éléments qui flottent : `0 12px 32px -12px rgba(43,20,10,.25)`.
- Grille : 4 colonnes sur mobile, 8 sur tablette, 12 sur ordinateur, largeur maximale 1 180 px.

## Composants

| Composant | Variantes et états | Où |
| --- | --- | --- |
| Bouton | Principal (`--sea`), secondaire (contour), discret (texte), WhatsApp (vert WhatsApp) · normal, survol, appuyé, chargement, désactivé · 48 px de haut minimum | Partout |
| Carte modèle | Image d'aperçu en arche, nom FR/AR, événement, prix « à partir de », badges (Nouveau, Populaire) · survol : légère inclinaison 3D | Catalogue, accueil |
| Filtres en pastilles | Une ligne qui défile horizontalement sur mobile, pastille active pleine | Catalogue |
| Téléphone de démo | Cadre de téléphone avec la vraie invitation jouable dedans, bouton plein écran | Fiche modèle |
| Barre de progression | 6 étapes nommées, étape en cours, étapes faites cliquables | Assistant |
| Champ texte | Libellé au-dessus, aide en dessous, erreur en `--danger` avec la solution | Formulaires |
| Champ date | Calendrier + date de l'hégire affichée automatiquement dessous | Assistant |
| Champ lieu | Nom de la salle + adresse + lien Google Maps collé ou point sur la carte | Assistant |
| Dépôt de photos | Glisser ou choisir, recadrage carré ou arche, compression automatique | Assistant, espace client |
| Choix de musique | Liste avec écoute de 15 s, ou envoi de son MP3 | Assistant |
| Compteur de places | Boutons − / +, maximum affiché | RSVP |
| Badge de statut | Nouvelle, Paiement en attente, Payée, En création, Livrée, Annulée (couleur + icône + mot) | Admin, suivi |
| Tableau des réponses | Compteurs en haut, filtres (Présent, Absent, Sans réponse), recherche, action WhatsApp par ligne | Espace client |
| Bouton son | Rond, fixe en haut à droite (à gauche en arabe), toujours visible | Invitations |
| Sélecteur de langue | FR / ع en pastille | En-tête, invitations |
| Bouton WhatsApp flottant | Petit, en bas, ne recouvre jamais un bouton ni le contenu | Site public |
| Notification | Bandeau bref en bas (« Réponse envoyée ») | Partout |
| Squelette de chargement | Formes grises à la place du contenu | Listes, catalogue |
| État vide | Illustration légère + phrase + bouton d'action | Listes vides |

## Écrans clés sur mobile

De haut en bas, ce que contient chaque écran à 375 px de large. Les prototypes de l'onglet Animations montrent le style de l'accueil et d'une invitation.

| Écran | Contenu, de haut en bas | Action principale |
| --- | --- | --- |
| Accueil | En-tête (logo, FR/ع, menu) → titre + phrase + bouton → téléphone 3D et cartes flottantes → « Comment ça marche » en 3 étapes → 6 modèles phares → comparatif digital / papier → 3 packs → avis → FAQ → pied de page | Voir les modèles |
| Catalogue | Titre → pastilles d'événements → pastilles de style → grille de cartes (1 colonne sur mobile, 2 en paysage) → « Voir plus » | Ouvrir un modèle |
| Fiche modèle | Nom + badges → téléphone de démo jouable → ce qui est inclus → packs compatibles → 3 autres modèles | Personnaliser ce modèle (barre fixée en bas) |
| Assistant (une étape) | Barre de progression → question en grand → 1 à 4 champs → aide → boutons Retour / Suivant fixés en bas → lien « Je préfère WhatsApp » | Suivant |
| Aperçu | Invitation en plein écran avec filigrane → barre en bas : Modifier / Choisir mon pack | Choisir mon pack |
| Paiement | Récapitulatif (modèle, pack, prix) → RIP CCP et numéro BaridiMob avec boutons copier → dépôt du reçu → numéro WhatsApp | Envoyer mon reçu |
| Invitation | Ouverture → prénoms + date + lieu + « Je confirme » visibles d'un coup → compte à rebours → programme → lieu (Maps, Waze) → galerie → RSVP → livre d'or → fin. Bouton son et langue fixés en haut | Je confirme |
| Espace client : Réponses | 4 compteurs (Présents, Absents, Sans réponse, Total personnes) → filtres → liste (nom, réponse, places, message, bouton WhatsApp) → Exporter | Relancer les sans-réponse |
| Admin : Paiements | Liste des reçus à vérifier (client, montant attendu, date) → détail avec la photo du reçu en grand | Valider / Refuser |

Sur ordinateur, l'accueil passe en deux colonnes (texte à gauche, téléphone à droite, inversé en arabe), le catalogue en 3 colonnes, l'espace client et l'admin gardent une barre de navigation à gauche (à droite en arabe).

## RTL, accessibilité et textes

**Arabe en droite-à-gauche**

- Toute la page bascule (`dir="rtl"`) : menus, flèches, barres de progression, bouton son, carrousels, sens des animations.
- Les chiffres, les dates et les numéros de téléphone restent dans le bon ordre (isolation bidirectionnelle).
- Les icônes qui indiquent une direction (flèche suivant) sont retournées ; les autres (son, calendrier) ne bougent pas.
- Les textes arabes sont écrits par un arabophone, jamais traduits mot à mot.

**Accessibilité**

- Contraste minimum 4,5:1 (tokens vérifiés plus haut), texte 16 px minimum, zones tactiles de 48 px.
- Tout est utilisable au clavier sur ordinateur, avec un contour visible au focus.
- Images avec texte alternatif, icônes seules avec un libellé lisible par le lecteur d'écran.
- Animations coupées si le téléphone demande moins de mouvement ; musique jamais automatique.

**Textes de l'interface (ton : chaleureux, simple, vouvoiement)**

| Moment | Français | Arabe |
| --- | --- | --- |
| Bouton principal accueil | Voir les modèles | شاهد النماذج |
| Personnaliser | Personnaliser ce modèle | خصّص هذا النموذج |
| Ouvrir l'invitation | Touchez pour ouvrir | المس للفتح |
| RSVP | Je confirme ma présence | أؤكّد حضوري |
| RSVP envoyé | Merci ! Votre réponse est bien notée. | شكراً! تم تسجيل ردّكم. |
| Paiement envoyé | Reçu bien reçu. Nous le vérifions sous 2 h. | وصلنا الوصل. سنتحقق منه خلال ساعتين. |
| Félicitations | Mabrouk ! Votre invitation est en ligne. | مبروك! دعوتكم جاهزة. |

Le délai « sous 2 h » est à confirmer avec votre organisation réelle avant le lancement.
