# Plateforme d'invitations digitales — PRD & TRD

Oct 16, 2026 · @ramzi

Une plateforme algérienne d'invitations-sites animées (mariage, fiançailles, anniversaire, naissance…), en français et en arabe, payée en dinars, avec RSVP, carte, musique et QR d'entrée. Ce premier onglet est le PRD (quoi et pour qui). Les autres onglets : Marque (nom, couleurs), TRD (comment on le construit, tout sur Cloudflare), App Flow (parcours et écrans), UI/UX Design (design system), Backend Schema (base de données), Animations (prototypes 3D et prompts), Plan de construction (pour Claude Code), Marketing (trouver des clients) et Business (coûts, rentabilité, statut légal, service après-vente).

## Vision et objectifs

Devenir la référence algérienne de l'invitation digitale : le client choisit un modèle, voit son invitation avant de payer, paie en dinars et reçoit son lien en moins de 24 h.

Nom de la marque : à décider, noté \[Marque\] dans tout le doc.

**Objectifs de la première année** (hypothèses à ajuster)

| Objectif | Cible | Échéance |
| --- | --- | --- |
| Site vitrine + 6 modèles en ligne | 6 modèles (3 mariage, 1 fiançailles, 1 anniversaire, 1 naissance) | Fin du MVP |
| Premiers clients | 10 clients, dont 5 à prix réduit contre un avis | 2 mois après le lancement |
| Rythme de vente | 30 invitations / mois | Saison des mariages (été) |
| Catalogue | 20 modèles | 6 mois après le lancement |
| Taux de réponse RSVP des invités | 70 % ou plus | Mesuré sur chaque événement |
| Délai de livraison | Moins de 24 h (pack Essentiel) | Dès le lancement |

**Ce qui nous différencie**

1. Pensé pour l'Algérie : prix et paiement en DA, modèles à identité algérienne, fêtes séparées femmes/hommes, henné, khotba, date de l'hégire.
2. Expérience animée haut de gamme (ouverture 3D, scroll animé), là où les concurrents ont des animations CSS simples.
3. Mode discret : invitation sans photo de la mariée, lien privé non indexé, code d'accès possible.
4. Pensé pour tous les invités, y compris les personnes âgées : bouton appeler, version image à transférer, gros texte.

## Identité algérienne

Chaque modèle doit être reconnu comme algérien au premier coup d'œil : couleurs, motifs, écritures, musiques et mots viennent de notre patrimoine, pas des tendances européennes. Les couleurs ci-dessous ont été **mesurées pixel par pixel sur 15 vraies photos** libres de droits (Wikimedia Commons) : karakous du musée d'Alger, bijoux kabyles, zellige de Tlemcen, portes de la Casbah, Ghardaïa, baie d'Alger, Tassili, tissages des Aurès. Elles sont souvent plus terreuses et plus douces que des couleurs inventées, et c'est ce qui les rend vraies.

**Palettes inspirées du patrimoine**

| Palette | Photos mesurées | Couleurs relevées (hex) | Pour quels modèles |
| --- | --- | --- | --- |
| Karakou | Karakous exposés à Alger | Velours bordeaux #4D1919, brique #73392F, or fetla #B49068, or vieilli #9E6D3A, ivoire #D0B8A2, bleu nuit #546E8D | Mariage prestige, henné, tasdira |
| Bijoux kabyles | Fibules et parures en argent émaillé | Argent #B4B6B6, argent sombre #4F4940, corail #DB7456, émail turquoise #578993, laiton #C1A37A | Mariage kabyle, fiançailles |
| Zellige de Tlemcen | Médersa Tachfiniya, porte de la médersa, plaque de zellige | Plâtre #C6BBAF, vert zellige #16544E, ocre #A88861, sable #CBB59A, brun #6E4719, noir #2B3130 | Mariage, khotba, retour du hajj |
| Casbah d'Alger | Vieilles portes de la Casbah | Chaux #DCD8CF, pierre #BAAE9E, bois de cèdre #421A0C, bois ciré #633525, laiton #D7C099 | Mariage algérois, site vitrine |
| M'zab et Ghardaïa | Vue de Ghardaïa et ruelles du ksar | Rose sable #EEC7AF, ocre #B89173, abricot #E2A770, terre #704B3C, mur pastel #C6B9B5 | Mariage du Sud, anniversaires |
| Baie d'Alger | Baie vue du ciel | Bleu Méditerranée #045588, bleu moyen #4F8DBB, bleu ciel #A8C7DE, brume #D2DBDE, bleu profond #274958 | Naissance, anniversaire, été |
| Nuit du Tassili | Rochers et dunes du Tassili n'Ajjer | Nuit #122B3C, nuit profonde #182834, grès #473119, sable #B89376 | Soirées, galas, anniversaires chic |
| Tissages des Aurès | Tissages chaouis à Menâa | Bordeaux #5E2837, framboise #BB485A, vieux rose #A77C6D, beige #CAA18C, bleu #40778D | Mariage chaoui, fêtes colorées |

**Pour le site vitrine**, je recommande maintenant un mélange Casbah + baie d'Alger : chaux #DCD8CF en fond, bois de cèdre #421A0C pour le texte, bleu Méditerranée #045588 en couleur principale, laiton #D7C099 pour les détails. Le bleu Casbah #1F4E79 utilisé dans le prototype était inventé : les photos montrent des portes en bois sombre sur fond de chaux, et le bleu vient de la mer.

**Comment ces couleurs ont été obtenues** : chaque photo réduite à 140 px, bords retirés, puis regroupement des pixels en 6 couleurs dominantes (algorithme k-means), avec une deuxième passe sur les seuls pixels colorés pour faire ressortir les accents (corail, turquoise, vert zellige). Avant usage, ajustez la clarté si le texte manque de contraste.

Photos (Wikimedia Commons, licences CC BY, CC BY-SA, CC0 ou domaine public) : [Karakou exposé à Alger](https://commons.wikimedia.org/wiki/File:Karakou_expos%C3%A9_%C3%A0_Alger.jpg), [Karakou Algerois](https://commons.wikimedia.org/wiki/File:Karakou_Algerois.jpg), [Kabyle belt clasp](https://commons.wikimedia.org/wiki/File:Kabyle_belt_clasp.jpg), [Bijoux traditionnels algériens](https://commons.wikimedia.org/wiki/File:Bijoux_traditionnels_alg%C3%A9riens.jpg), [Zellige de la Madrasa Tachfiniya](https://commons.wikimedia.org/wiki/File:Zellige_de_la_Madrasa_Tachfiniya_de_Tlemcen.jpg), [Médersa de Tlemcen, zellige de la porte](https://commons.wikimedia.org/wiki/File:M%C3%A9dersa_de_Tlemcen_-_Zellige_d%C3%A9coratif_de_la_porte_d%27entr%C3%A9e.jpg), [Plaque décorative de zellige](https://commons.wikimedia.org/wiki/File:Plaque_d%C3%A9corative_de_Zellige,_Tlemcen.jpg), [Casbah of Algiers, old door](https://commons.wikimedia.org/wiki/File:Casbah_of_Algiers,_old_door.jpg), [Casbah heritage 6](https://commons.wikimedia.org/wiki/File:Architectural_and_Cultural_Heritage_of_the_Casbah_of_Algiers_6.jpg), [Casbah heritage 30](https://commons.wikimedia.org/wiki/File:Architectural_and_Cultural_Heritage_of_the_Casbah_of_Algiers_30.jpg), [Algerie Ghardaia 09](https://commons.wikimedia.org/wiki/File:Algerie_Ghardaia_09.jpg), [Vue Ghardaia Melika](https://commons.wikimedia.org/wiki/File:Vue_Ghardaia_Melika.jpg), [Baie d'Alger vue du ciel](<https://commons.wikimedia.org/wiki/File:La_baie_d%27Alger_vue_du_ciel_(2012).jpg>), [Tassili n'Ajjer, Tamghit](https://commons.wikimedia.org/wiki/File:Tassili_n%27Ajjer-Tamghit_02.jpg), [Fête du Tifeswin à Menâa](https://commons.wikimedia.org/wiki/File:F%C3%AAte_du_Tifeswin_a_Men%C3%A2a_dans_les_Aures_2013.JPG).

**Motifs et décors**

- Étoiles et rosaces du zellige (fonds, cadres, compte à rebours).
- Arcs de la Casbah et portes cloutées (ouverture « porte de la Casbah »).
- Losanges et triangles des poteries et tapis kabyles (bordures, séparateurs).
- Arabesques de la broderie fetla (cadres des prénoms).
- Jasmin, fleur d'oranger, grenade (illustrations florales au lieu des roses européennes).
- Moucharabieh (transitions, voiles).

**Écritures**

- Arabe : calligraphie pour les prénoms, en privilégiant un style maghrébin quand une police libre de droits le permet.
- Tamazight en tifinagh (police Noto Sans Tifinagh) pour les modèles kabyles et chaouis, avec la formule « ⴰⵣⵓⵍ » (Azul).
- Français : une calligraphie latine sobre pour les prénoms.

**Musiques (libres de droits ou fournies par le client)** : andalou (nouba), chaâbi, zorna et karkabou, kabyle, malouf de Constantine, chant du Sud.

**Mots et formules** : « Mabrouk », « Allah ytemem bel khir », « Bessaha », « Azul », et les youyous en animation au RSVP « Je serai là ».

**Trouver nos propres couleurs**

1. Réunir des photos réelles : un karakou, des bijoux kabyles, du zellige de Tlemcen, une porte de la Casbah, Ghardaïa au coucher du soleil.
2. Extraire la palette de chaque photo avec [Adobe Color](https://color.adobe.com/create/image) (onglet « extraire le thème »), [Coolors](https://coolors.co/image-picker) (sélecteur depuis image) ou l'outil palette de Canva.
3. Garder 4 à 5 couleurs par palette : un fond, un texte, un accent, un détail.
4. Vérifier la lisibilité du texte sur le fond (contraste) avant de valider.
5. Mettre chaque palette validée dans `src/styles/tokens.css` pour que Claude Code l'applique.

Règle : pas de drapeau ni de symbole national sur les invitations de fêtes familiales. On les réserve éventuellement à des modèles d'événements patriotiques (5 Juillet, 1er Novembre).

## Cibles et personas

Cinq profils achètent ou utilisent l'invitation. Le sixième, le partenaire, nous ramène des clients.

| Persona | Qui | Ce qu'il veut | Ce qui le bloque |
| --- | --- | --- | --- |
| Les mariés | 22–35 ans, sur TikTok et Instagram, souvent la mariée ou sa sœur qui commande | Une invitation qui impressionne, moins chère que le papier, savoir combien de personnes viennent | Peur du « cheap », paiement en ligne, photos privées exposées |
| Les parents | 45–65 ans, ce sont eux qui invitent souvent | Une invitation respectueuse (verset, noms des familles), simple à envoyer | Pas à l'aise avec la technologie |
| L'invité | Tous âges, sur WhatsApp | Voir vite la date, l'heure, le lieu, répondre en un geste | Lien lent, musique qui gêne, page trop longue |
| Le fêtard (anniversaire, naissance, bac) | 16–30 ans ou jeunes parents | Une surprise originale à petit prix, livrée vite | Budget serré |
| L'entreprise | Commerces, agences, écoles | Inauguration, séminaire, gala avec inscription | Facture, image de marque |
| Le partenaire | Salles des fêtes, photographes, neggafat, pâtissiers, wedding planners | Une commission ou un service en plus pour ses clients | Aucun, si c'est simple |

## Événements couverts et packs

On couvre tous les événements familiaux algériens dès le départ, avec trois packs uniques pour tous. Les prix sont des hypothèses à tester auprès des premiers clients.

**Événements** : mariage (fête femmes, fête hommes, ou mixte), fiançailles, khotba, henné, tasdira, walima, anniversaire, naissance et aqiqa, circoncision, réussite au bac ou diplôme, retour du hajj ou omra, Aïd et Ramadan (iftar), événements d'entreprise (inauguration, séminaire, gala).

| Pack | Prix (hypothèse) | Ce qu'il contient | Délai |
| --- | --- | --- | --- |
| Essentiel | 2 500 DA | Un modèle du catalogue personnalisé (noms, date, lieu, musique, 3 photos), carte et itinéraire, compte à rebours, lien + QR à partager, 1 modification | 24 h |
| Premium | 5 000 DA | Essentiel + RSVP avec tableau de bord, lien au prénom de chaque invité, galerie, livre d'or, programme multi-événements, version image à transférer, modifications illimitées | 24 h |
| Prestige | à partir de 10 000 DA | Premium + design sur mesure, ouverture 3D sur mesure, QR d'entrée par invité avec scan à la porte, vidéo d'annonce pour les réseaux, support prioritaire | 3 à 5 jours |

**Options à la carte** : vidéo « story » 9:16 de l'invitation (pour WhatsApp et Instagram), nom de domaine personnalisé, impression de quelques cartes papier avec le QR, livraison express en 6 h, offre Entreprise sur devis.

**Règles** : pas de fausse réduction permanente. Une vraie promo de lancement datée est possible.

## Fonctionnalités des invitations

Toutes les fonctions vues chez les concurrents sont reprises, plus 18 nouveautés marquées « Nouveau ». MVP = indispensable au lancement, V2 = dans les 3 mois suivants, V3 = plus tard.

| Domaine | Fonction | Vu chez | Pack | Priorité |
| --- | --- | --- | --- | --- |
| Ouverture | Animation d'ouverture (enveloppe, porte, sceau, rideau) qui lance la musique | Farhetna, Mar7ba, vidéo Canva | Tous | MVP |
| Ouverture | Écran de chargement aux prénoms | Farhetna | Tous | MVP |
| Ouverture | Ouverture 3D sur mesure | Farhetna VIP | Prestige | V2 |
| Contenu | Verset, basmala ou formule au choix, noms des familles | Farhetna | Tous | MVP |
| Contenu | Date grégorienne + date de l'hégire | Nouveau | Tous | MVP |
| Contenu | Programme horaire, et plusieurs événements (henné, fête femmes, fête hommes) avec lieux différents | Farhetna (horaire) + Nouveau (multi-événements) | Premium | MVP |
| Contenu | Version « fête des femmes » et « fête des hommes » du même lien, selon l'invité | Nouveau | Premium | V2 |
| Contenu | Galerie photo / polaroids, vidéo | Farhetna VIP, vidéo Canva | Premium | MVP |
| Contenu | Sections fun pour anniversaire : bougie à souffler, cadeau à ouvrir, mots-clés, lettre | Vidéo Canva | Tous (modèles anniversaire) | MVP |
| Contenu | Dress code, parking, navette | Farhetna VIP | Premium | V2 |
| Contenu | Liste de cadeaux ou cagnotte (optionnelle) | Farhetna VIP, Douce Invitation | Prestige | V3 |
| Infos pratiques | Compte à rebours, qui devient « Merci d'être venus » après la date | Farhetna + Nouveau (après-date) | Tous | MVP |
| Infos pratiques | Google Maps + Waze en un clic | Farhetna, Mar7ba | Tous | MVP |
| Infos pratiques | Ajouter au calendrier (Google, iPhone) | Farhetna | Tous | MVP |
| Infos pratiques | Bouton appeler / WhatsApp la famille | Nouveau | Tous | MVP |
| Musique | Bibliothèque de musiques + musique envoyée par le client, bouton couper le son toujours visible | Farhetna + Nouveau (bouton) | Tous | MVP |
| Langue | Bouton FR / عربي dans l'invitation, arabe en droite-à-gauche | Mar7ba | Tous | MVP |
| Langue | Tamazight (tifinagh ou latin) en troisième langue | Nouveau | Tous | V3 |
| RSVP | Confirmation en 2 taps : présent / absent + nombre de personnes + message | Farhetna, Mar7ba, Kart | Premium | MVP |
| RSVP | Lien au prénom de chaque invité (« Cher Karim »), nombre de places limité par lien | Kart + Nouveau (places) | Premium | MVP |
| RSVP | Date limite de réponse, puis RSVP fermé | Nouveau | Premium | V2 |
| RSVP | Relances : liste des invités sans réponse avec bouton WhatsApp pré-rempli | Kart (auto) + Nouveau (version simple) | Premium | V2 |
| Entrée | QR code par invité, scanné à la porte avec un téléphone, un code = une entrée | Mar7ba, Kart | Prestige | V2 |
| Après la fête | Livre d'or : vœux et dédicaces des invités | Kart, Farhetna | Premium | MVP |
| Après la fête | Album partagé : les invités déposent leurs photos via un QR posé sur les tables | GuestPix + Nouveau | Prestige | V3 |
| Après la fête | Lien de direct vidéo pour la famille à l'étranger | Nouveau | Premium | V2 |
| Vie privée | Mode discret : aucune photo des mariés, illustrations à la place | Nouveau | Tous | MVP |
| Vie privée | Lien non indexé par Google, code d'accès optionnel, expiration du lien | Nouveau | Tous | MVP |
| Accessibilité | Version image (carte PNG) à transférer aux personnes âgées | Nouveau | Premium | MVP |
| Accessibilité | Gros texte, contrastes forts, animations coupées si le téléphone le demande | Nouveau | Tous | MVP |
| Partage | Lien court + QR code + message WhatsApp pré-rédigé FR/AR, aperçu joli quand on colle le lien (image + titre) | Farhetna, Mar7ba + Nouveau (aperçu) | Tous | MVP |
| Partage | Vidéo story 9:16 générée à partir de l'invitation | Farhetna (Story) | Option | V3 |
| Suivi | Nombre de vues de l'invitation, qui l'a ouverte (liens nominatifs) | Greenvelope + Nouveau | Premium | V2 |

**Fonctions IA (V2)** — aucun concurrent ne les propose, et elles vous font gagner du temps sur chaque commande :

- **Texte de l'invitation généré** à partir de 3 infos (type d'événement, ton, familles), en français, arabe ou darja, avec 3 propositions au choix.
- **Traduction FR ↔ AR** automatique des textes du client, relue par vous avant publication.
- **Palette depuis une photo** : le client envoie la photo de sa robe, de sa salle ou de ses fleurs, l'invitation prend ses couleurs.
- **Choix du verset ou de la formule** adapté à l'événement, dans une liste validée par vous (jamais de texte religieux inventé).
- **Résumé des vœux** du livre d'or en une jolie page souvenir après la fête.

**Nouvelles fonctionnalités trouvées en octobre 2026** — vues sur les plateformes internationales, adaptées aux fêtes algériennes :

| Fonction | Pourquoi ça compte ici | Pack | Priorité |
| --- | --- | --- | --- |
| Invitation qui marche sans réseau (adresse, programme, QR gardés sur le téléphone) | Beaucoup de salles des fêtes captent mal | Tous | MVP |
| « Trouver ma table » : QR à l'entrée de la salle, l'invité tape son nom et voit sa table | Fini les listes papier au mur | Prestige | V2 |
| Cortège : heure et point de départ du cortège de voitures, itinéraire | Tradition algérienne que personne ne propose | Premium | V2 |
| Message vocal ou vidéo des mariés ou des parents dans l'invitation | Rend le lien très personnel | Premium | V2 |
| Vœux vocaux des invités dans le livre d'or | Plus facile que d'écrire pour les aînés | Prestige | V3 |
| Rappel la veille : message WhatsApp prérempli (itinéraire et heure) que le client envoie en un clic à ses invités | Moins de retards et d'invités perdus | Premium | V2 |
| Texte différent selon le groupe (famille, amis, collègues) | Ton adapté sans faire deux invitations | Premium | V2 |
| Demandes de chansons pour le DJ ou la troupe | Les jeunes adorent, le DJ aussi | Premium | V2 |
| Quiz « Connaissez-vous les mariés ? » avec classement | Fait vivre l'invitation avant la fête, partagé en story | Prestige | V3 |
| Pack complet : annonce (save-the-date), invitation, carte de remerciement après la fête | Trois ventes au lieu d'une | Option | V2 |
| Inspiration dress code (karakou, caftan, blouza, couleurs du thème) | Question que tout le monde pose | Premium | V2 |
| Météo du jour J sur l'invitation | Utile pour les fêtes en plein air | Tous | V3 |
| Petites cartes imprimées avec QR pour les grands-parents | Le papier rassure les aînés | Option | V2 |

Sources : [The Digital Yes](https://blog.thedigitalyes.com/blog/premium-wedding-invitations-features-that-elevate-2026), [1Invites](https://blog.1invites.com/top-wedding-invitation-trends/), [Sven Studios](https://svenstudios.com/2026/06/qr-code-wedding-seating-chart/), [Appy Pie](https://www.appypie.com/blog/wedding-app-feature-guide).

## Site vitrine et tunnel de commande

Le site vitrine doit faire « waouh » en 3 secondes sur téléphone, puis amener le visiteur à commander en moins de 5 minutes.

**Pages et sections**

| Page / section | Contenu | Vu chez | Priorité |
| --- | --- | --- | --- |
| Héro 3D | Téléphone 3D qui tourne au scroll et fait défiler nos invitations, cartes flottantes RSVP / GPS / musique / compte à rebours autour | Farhetna (version plate) + Nouveau (3D) | MVP |
| Comment ça marche | 3 étapes animées : choisir, personnaliser, partager | Nouveau | MVP |
| Catalogue | Filtres par événement et par style, badges (Nouveau, Populaire), aperçu au survol, démo dans un téléphone | Farhetna, Mar7ba | MVP |
| Démos | Chaque démo est datée automatiquement dans le futur (jamais périmée), lien démo partageable | Nouveau (corrige Farhetna) | MVP |
| Comparatif | Digital vs papier : prix, RSVP, GPS, musique, délai, écologie | Farhetna | MVP |
| Tarifs | Les 3 packs, options, FAQ des prix | Farhetna, Mar7ba | MVP |
| Avis | Uniquement de vrais avis (captures WhatsApp avec accord), vidéos TikTok intégrées | Nouveau | MVP |
| Partenaires | Page pour salles des fêtes, photographes, neggafat : code partenaire et commission | Nouveau | V2 |
| Entreprises | Page dédiée : inauguration, séminaire, gala, formulaire de devis | Kart Business, Mar7ba | V2 |
| Blog | Articles SEO en FR et AR (« modèle texte invitation mariage algérien », « نص دعوة عرس »…) | Nouveau | V2 |
| Contact | Bouton WhatsApp flottant (discret, ne cache pas le contenu), Instagram, TikTok, e-mail | Farhetna (corrigé) | MVP |
| Pages légales | Conditions de vente, confidentialité, remboursement | Mar7ba | MVP |

**Tunnel de commande**

1. Le client choisit un modèle (ou « je ne sais pas encore »).
2. Assistant en formulaire étape par étape, en arabe ou en français : type d'événement, noms, familles, date(s), lieu(x), photos, musique, texte, options de vie privée. Brouillon gardé si la page se ferme. Le mode « chat » en darja (idée de Farhetna) arrive en V2.
3. Aperçu gratuit en direct sur son téléphone, avec un filigrane « Aperçu » (idée de Mar7ba).
4. Choix du pack et paiement : BaridiMob / CCP avec envoi du reçu au lancement, puis Edahabia / CIB en ligne via Chargily (V2). Espèces possible pour les partenaires.
5. Code de suivi de commande + e-mail de confirmation + bouton WhatsApp (lien `wa.me` prérempli) pour nous écrire.
6. Livraison : lien final, QR code, message WhatsApp prêt, carte image, accès à l'espace client.

**Fidélisation** : code parrainage (réduction pour le parrain et le filleul), code promo par partenaire, relance « anniversaire de mariage » un an après (V3).

## Espace client et back-office admin

Le client gère ses invités seul. Vous deux gérez commandes, modèles et paiements depuis un seul back-office.

**Espace client** (connexion sans mot de passe par lien magique envoyé par e-mail ; si le client n'a pas d'e-mail, nous lui transmettons le lien à la main sur WhatsApp)

- Voir et modifier son invitation (textes, date, lieu, photos, musique) avec aperçu en direct — MVP
- Liste des invités : ajout un par un ou import depuis un fichier Excel/CSV, nombre de places par invité, groupe (famille marié, famille mariée, amis) — MVP
- Générer le lien nominatif de chaque invité et l'envoyer par WhatsApp en un clic — MVP
- Tableau des réponses : présents, absents, sans réponse, total de personnes, messages — MVP
- Ajouter à la main une réponse reçue par téléphone — MVP
- Export Excel/PDF de la liste (pour le traiteur et la salle) — MVP
- Co-gestionnaire : inviter un proche à gérer la liste — V2
- Scanner les QR à l'entrée depuis le téléphone, compteur d'entrées en direct — V2
- Modérer le livre d'or et l'album photo — V2

**Back-office admin**

- Tableau de bord : commandes du jour, chiffre d'affaires du mois, commandes en retard, modèles les plus vendus — MVP
- Commandes : statuts (nouvelle, paiement en attente, payée, en création, livrée, terminée, annulée), assignation à l'un de vous deux, notes internes — MVP
- Paiements : vérification des reçus BaridiMob/CCP, validation en un clic, remboursements — MVP
- Modèles : ajouter un modèle, son aperçu, ses tags, son prix, l'activer ou le masquer — MVP
- Bibliothèque : musiques, versets et formules, polices, illustrations — MVP
- Clients : historique, invitations, contact — MVP
- Codes promo, codes partenaires et commissions à verser — V2
- Avis clients : demande automatique après l'événement, publication après validation — V2
- Statistiques : visites, taux de conversion, sources (TikTok, Instagram, partenaires) — V2
- Journal d'activité (qui a modifié quoi) — V2

## Parcours utilisateurs

Trois parcours doivent marcher parfaitement dès le MVP.

**1. Le client commande**

1. Voit une vidéo TikTok, clique sur le lien en bio.
2. Arrive sur le héro 3D, descend vers le catalogue, ouvre 2 ou 3 démos.
3. Clique « Créer mon invitation », remplit l'assistant en 3 minutes.
4. Voit l'aperçu sur son téléphone, choisit Premium, paie par BaridiMob et envoie le reçu.
5. Reçoit un code de suivi et un e-mail ; peut nous écrire sur WhatsApp en un clic.
6. Nous validons le paiement, finalisons et livrons en moins de 24 h.

**2. Le client gère ses invités**

1. Ouvre son espace client avec le lien magique reçu par e-mail.
2. Importe sa liste, envoie chaque lien nominatif par WhatsApp.
3. Suit les réponses, relance les invités sans réponse, exporte la liste pour le traiteur.

**3. L'invité reçoit l'invitation**

1. Reçoit le lien sur WhatsApp, voit un joli aperçu (image + « Mariage de Amine & Sara »).
2. Ouvre, touche l'enveloppe : animation + musique, bouton couper le son visible.
3. Voit « Cher Karim », la date, l'heure, le lieu dans le premier écran.
4. Répond « Présent, 3 personnes » en 2 taps, laisse un vœu.
5. Ajoute au calendrier, ouvre l'itinéraire le jour J.

Cas particuliers à gérer : invité qui change sa réponse, lien transféré à quelqu'un d'autre (places limitées par lien), connexion lente, iPhone en mode silencieux, date dépassée.

## Critères d'acceptation du MVP

Le MVP est livrable quand chacun de ces scénarios passe en français et en arabe, sur un Android moyen et un iPhone, y compris dans le navigateur intégré de WhatsApp.

| En tant que… | Je veux… | C'est accepté quand… |
| --- | --- | --- |
| Visiteur | découvrir les modèles | le premier texte s'affiche en moins de 2,5 s ; chaque démo s'ouvre depuis le catalogue avec une date toujours future |
| Client | commander sans compte | l'assistant se remplit en moins de 5 minutes, garde le brouillon si je ferme la page, et me montre un aperçu avec filigrane avant de payer |
| Client | payer par BaridiMob/CCP | j'envoie mon reçu (photo ou PDF, 5 Mo max), je reçois un code de suivi et je vois le statut sur `/suivi` |
| Admin | valider un paiement | le reçu s'affiche à côté du montant attendu ; valider ou refuser (avec motif) prend un clic et change le statut côté client |
| Admin | publier une invitation | le lien `/i/[slug]` devient public, l'image d'aperçu WhatsApp est générée, et le client reçoit ses liens et son QR |
| Client | gérer mes invités | j'importe un CSV de 300 lignes avec rapport d'erreurs, et chaque invité a un lien nominatif et un bouton WhatsApp prérempli |
| Invité | ouvrir l'invitation | l'enveloppe s'ouvre au toucher, la musique ne démarre qu'après ce geste et se coupe en un tap, mon prénom s'affiche |
| Invité | répondre | je réponds en 2 taps, je ne peux pas dépasser mes places, et je peux modifier ma réponse jusqu'à la date limite |
| Client | suivre les réponses | je vois présents, absents, sans réponse et total de personnes, j'ajoute une réponse reçue par téléphone et j'exporte la liste |
| Invité | venir le jour J | j'ajoute l'événement à mon calendrier et j'ouvre l'itinéraire Maps ou Waze, même si le réseau coupe dans la salle |

## Hors périmètre du MVP

Ce qu'on ne construit volontairement pas au lancement, pour sortir vite :

- Paiement en ligne Edahabia/CIB (Chargily) : V2.
- Assistant de commande en mode chat, co-gestionnaire, scan QR à l'entrée, modération de l'album : V2.
- Envoi automatique de messages WhatsApp ou SMS : jamais au MVP, uniquement des liens `wa.me` que le client ouvre lui-même.
- Éditeur libre type Canva pour le client : non ; le client remplit des champs, le design reste maîtrisé par nous.
- Application mobile native : non, le site est une PWA.
- Faux avis, faux compteurs ou textes et images copiés de concurrents : jamais.

## Exigences non fonctionnelles et indicateurs

La règle numéro un : une invitation doit s'ouvrir vite sur un Android moyen en 4G algérienne.

| Exigence | Cible |
| --- | --- |
| Ouverture d'une invitation (premier affichage) | LCP < 2 s en 4G ; JavaScript < 150 Ko, images < 400 Ko, polices < 150 Ko ; musique (< 3 Mo) chargée après l'ouverture |
| Site vitrine | Lighthouse mobile ≥ 85 ; Core Web Vitals : LCP < 2,5 s, INP < 200 ms, CLS < 0,1 ; héro 3D chargé après le texte |
| Animations | 60 images/s sur téléphone récent, version allégée automatique sur téléphone faible |
| Navigateurs | Chrome Android, Safari iPhone, navigateur intégré de WhatsApp, Instagram, TikTok et Facebook |
| Langues | FR et AR complets dès le MVP, arabe en droite-à-gauche sans défaut |
| Disponibilité | 99,5 % (les invitations ne doivent jamais tomber pendant la saison) |
| Données | Restauration possible à la minute près sur 7 jours (D1 Time Travel) + export complet hebdomadaire ; données invités supprimées 6 mois après l'événement sauf demande |

**Indicateurs suivis chaque semaine** : visites du site, taux visite → commande, panier moyen, délai moyen de livraison, taux de réponse RSVP par événement, part des ventes par source (TikTok, Instagram, partenaires, bouche-à-oreille), avis reçus.

## Questions ouvertes

- [ ] Nom de la marque et nom de domaine (.com ou .dz)
- [ ] Prix définitifs des packs, après avoir interrogé 10 personnes autour de vous
- [ ] Qui fait quoi entre vous deux : design des modèles, développement, vente et réseaux sociaux
- [ ] Statut légal pour encaisser (auto-entrepreneur, registre de commerce) — nécessaire pour Chargily et les factures entreprises
- [ ] Musiques : utiliser uniquement des musiques libres de droits ou fournies par le client
- [ ] Valider les 6 premiers modèles proposés dans le Plan de construction (Karakou, Zellige de Tlemcen, Casbah, Bijoux kabyles, Ciel, Baie d'Alger)
