# Saint-Bonnet-de-Condat — site de la commune

Site officiel de la commune de Saint-Bonnet-de-Condat (Cantal, 15190), publié avec GitHub Pages :
https://saint-bonnet-de-condat.fr/

GitHub construit le site automatiquement (Jekyll) à chaque modification de la branche `main`.
Aucune installation n'est nécessaire.

## Ajouter une actualité « Infos & Alertes »

1. Déposer le PDF dans le dossier `documents/infos-alertes/`, nommé `AAAA-MM-JJ-sujet-court.pdf`
   (sans accents ni espaces).
2. Ouvrir `_data/infos_alertes.yml` et copier le modèle (en tête du fichier) **tout en haut de la liste** :
   date, type (`alerte` ou `info`), thème, titre, résumé, nom du PDF, et le texte complet de l'affiche
   dans `texte` (accessibilité : une affiche en image n'est pas lisible par les lecteurs d'écran).
3. Ajouter sous l'actualité ses traductions `en:` (anglais) et `nl:` (néerlandais) : titre, résumé et texte
   (voir « Langues » plus bas). Sans traduction, l'actualité s'affiche en français sur les pages anglaise et
   néerlandaise, avec la mention « In French » / « In het Frans ».

L'actualité apparaît alors sur la page Infos & Alertes (son titre et son bouton ouvrent le PDF, son texte s'affiche
sous le bouton) et sur l'accueil (son titre mène à ce texte, son bouton ouvre le PDF).
Une alerte récente s'affiche aussi en bandeau rouge sur l'accueil pendant 3 jours
(ou jusqu'à la date indiquée dans `bandeau_jusquau`).

**Affiche disponible en ligne (image ou PDF) :** au lieu de déposer le fichier, ajouter une ligne
`adresse  documents/infos-alertes/AAAA-MM-JJ-sujet.pdf` dans `outils/fichiers-a-recuperer.txt`.
GitHub télécharge le fichier, convertit une image en PDF A4 et l'ajoute au site
(`.github/workflows/recuperer-fichiers.yml`).

## Ajouter un document à l'affichage légal

1. Déposer le PDF dans le dossier `documents/affichage-legal/`, nommé `AAAA-MM-JJ-sujet-court.pdf`.
2. Ouvrir `_data/affichage_legal.yml` et copier le modèle **en tête de la liste `documents`** :
   date, type (`arrete-municipal`, `arrete-prefectoral`, `deliberation`, `proces-verbal` ou `divers`),
   numéro (facultatif), titre, nom du PDF. Si le PDF est scanné ou en image, recopier le texte du document
   dans `texte` (accessibilité).

Les années proposées dans le filtre se règlent dans le même fichier (`annees`).
Un document disponible en ligne peut aussi être récupéré par `outils/fichiers-a-recuperer.txt`.

## Publier une version (Release)

Pour marquer une version importante, ajouter un fichier `outils/versions/vX.Y.Z.md`
(par exemple `v1.1.0.md`) sur le modèle de `v1.0.0.md` : titre, commit marqué, puis les notes.
GitHub crée alors la Release correspondante (`.github/workflows/publier-version.yml`).

## Écran d'accueil et notifications

Les habitants peuvent ajouter le site à l'écran d'accueil de leur téléphone (icône dans `assets/icones/`,
réglages dans `manifest.webmanifest`) et recevoir les actualités de la mairie en notification (page `/notifications/`).

- **Envoi automatique** : chaque nouvelle actualité ajoutée dans `_data/infos_alertes.yml` part en notification
  (`.github/workflows/notifications.yml`, programme `outils/notifications/envoyer.mjs`).
  Pour corriger une actualité sans renvoyer de notification, écrire `[sans notification]` dans le message du commit.
- **Langue** : chaque appareil reçoit les notifications dans la langue de la page où elles ont été activées
  (français, anglais ou néerlandais). Ce réglage reste sur l'appareil ; rien n'est ajouté dans Supabase.
  Une actualité sans traduction part en français et ouvre la page Infos & Alertes dans la langue de l'appareil.
- **Envoi à la main** : onglet Actions > « Envoyer les notifications » > « Run workflow » : titre, message et page à ouvrir
  (en français pour tous les abonnés).
- **Abonnements** : base Supabase (région Paris), créée avec `outils/notifications/supabase.sql`.
  Adresse et clés publiques dans `_config.yml` (rubrique `notifications`) ; clés secrètes dans les secrets
  GitHub du dépôt : `SUPABASE_SECRET_KEY` et `VAPID_PRIVATE_KEY`.
- Deux fois par semaine, le workflow lit la liste des abonnés pour garder le projet Supabase actif
  (un projet gratuit s'arrête après 7 jours sans activité). Si le dépôt reste 60 jours sans modification,
  GitHub suspend cette tâche : la réactiver dans l'onglet Actions.

## Modifier les informations

| À modifier | Fichier |
|---|---|
| Adresse, téléphone, horaires de la mairie, page Facebook | `_data/mairie.yml` |
| Élus, permanences, personnel communal | `_data/elus.yml` |
| Menu principal (en français, anglais et néerlandais) | `_data/navigation.yml` |
| Textes communs en trois langues (en-tête, pied de page, boutons, messages) et adresses des pages | `_data/langues.yml` |
| Pages en anglais et en néerlandais | dossiers `en/` et `nl/` |
| Bandeau d'annonce temporaire de l'accueil (texte, dernier jour d'affichage) | `_data/annonce.yml` |
| Photos du diaporama de l'accueil (mairie, camping, village sous la neige, coucher de soleil) | `index.html` (rubrique `heros`), photos dans `assets/images/`, cadrage dans `assets/css/site.css` |
| Notifications : adresse Supabase et clés publiques | `_config.yml` (rubrique `notifications`) |
| Articles du bulletin municipal | `_posts/AAAA-MM-JJ-titre.html` (un fichier par article), traductions dans `_posts/en/` et `_posts/nl/` |
| Professionnels de santé et de bien-être | `vie-locale.html` (rubrique `sante-bien-etre`), logos dans `assets/images/vie-locale/` |
| Établissements de la page Tourisme | `tourisme.html`, logos dans `assets/images/tourisme/` |
| Randonnées de la page Tourisme | ne pas modifier à la main : voir « Page Tourisme : randonnées, météo et qualité de l'air » |
| Textes de la météo, de la qualité de l'air et des randonnées (trois langues) | `_data/langues.yml` (rubrique `tourisme`) |
| Lieux de la carte météo (nom, coordonnées de la mairie, ordre d'affichage) | `_data/meteo_lieux.yml` |
| Pages | `mairie.html`, `vie-pratique.html`, `vie-locale.html`, `tourisme.html`, `decouvrir.html`… |
| Apparence | `assets/css/site.css` |
| État d'accessibilité (bas de chaque page, page Accessibilité) | `_data/accessibilite.yml` |

## Accessibilité

Le site suit le référentiel RGAA 4.1.2. Dernière évaluation : 28 octobre 2026, en français, en anglais et en
néerlandais, **totalement conforme** (grille détaillée dans `outils/accessibilite/`). La déclaration d'accessibilité est la page `/accessibilite/`
(`accessibilite.html`) ; son état et ses chiffres, comme la mention « Accessibilité : … » en bas de chaque page,
viennent de `_data/accessibilite.yml`. Le plan du site (`plan-du-site.html`) se met à jour tout seul.

Pour garder la conformité :

- chaque affiche en PDF doit avoir son texte complet (champ `texte`) ;
- chaque image ajoutée doit avoir une alternative (`alt`), vide (`alt=""`) pour une image décorative ;
- un passage dans une autre langue que celle de la page porte l'attribut `lang` (par exemple
  `<span lang="fr">Raconte-moi Saint-Bonnet</span>` sur une page anglaise) ;
- après un changement important, refaire l'évaluation et mettre à jour `_data/accessibilite.yml`.

## Langues : français, anglais, néerlandais

Le site existe en français (langue principale, aux adresses habituelles), en anglais (`/en/`) et en néerlandais
(`/nl/`). Les drapeaux du bandeau du haut (français, britannique, néerlandais ; `_includes/drapeau.html`) ouvrent la même page dans l'autre langue
(et la même actualité). Le choix est gardé sur l'appareil. Si le navigateur du visiteur est réglé en anglais ou en
néerlandais, un bandeau lui propose la page dans sa langue (jamais de redirection automatique).

- **Lien entre les versions** : chaque page a une langue (`lang`, `fr` par défaut) et une référence (`ref`) ;
  les trois versions d'une page ont la même `ref`. Le sélecteur de langue et les liens `hreflang` s'en servent.
- **Pages** : les pages anglaises sont dans `en/`, les néerlandaises dans `nl/`. Après une modification d'une page
  française, modifier aussi ses deux versions (même `ref`). L'accueil, Infos & Alertes, le Conseil municipal,
  l'Affichage légal et le Plan du site partagent leur code dans `_includes/` (`accueil.html`, `page-….html`).
- **Articles du bulletin** : traductions dans `_posts/en/` et `_posts/nl/`, avec la même `ref` que l'article
  français et leur adresse dans `permalink`.
- **Textes communs** (en-tête, pied de page, boutons, messages des scripts, notifications, adresses des pages) :
  `_data/langues.yml`. Menu : `_data/navigation.yml`. Élus et horaires : blocs `en:` et `nl:` de `_data/elus.yml`
  et `horaires_court` de `_data/mairie.yml`.
- **Actualités et documents** : blocs `en:` et `nl:` (titre, résumé, texte) dans `_data/infos_alertes.yml` ;
  titre et texte, facultatifs, dans `_data/affichage_legal.yml`. Les affiches PDF restent en français.
  Les ancres des actualités viennent du titre français : elles sont les mêmes dans les trois langues.
- **Notifications** : voir « Écran d'accueil et notifications » ; textes de la page dans `_data/langues.yml`
  (rubrique `notifications`), manifestes dans `en/manifest.webmanifest` et `nl/manifest.webmanifest`.

## Page Tourisme : randonnées, météo et qualité de l'air

La page Tourisme (et ses versions anglaise et néerlandaise) montre la météo et la qualité de l'air du jour, et une
carte des 42 randonnées de l'office de tourisme Destination Haut Cantal, avec des filtres et une fiche par randonnée.
Sans JavaScript, la liste des randonnées reste complète ; la météo et la qualité de l'air renvoient alors aux sites
de Météo-France et d'Atmo Auvergne-Rhône-Alpes.

- **Randonnées** : relevé des fiches Apidae de Destination Haut Cantal (dernier relevé : 28 octobre 2026). Elles ne
  sont pas lues en direct, car le service Apidae de l'office de tourisme refuse les autres sites. Pour mettre le
  relevé à jour :
  1. ouvrir https://www.destinationhautcantal.fr/jy-suis/activites-de-pleine-nature/randonnees/ dans un navigateur ;
  2. dans la console du navigateur, coller le contenu de `outils/randonnees/extraire.js`, puis lancer
     `extraireRandonnees()` et, quand il a fini, `telechargerExtrait()` ;
  3. ranger le fichier téléchargé (`destination-haut-cantal-AAAA-MM-JJ.json`) dans `outils/randonnees/source/` ;
  4. lancer `python3 outils/randonnees/generer.py` (Python 3 et PyYAML) : il écrit `_data/randonnees.json` (fiches)
     et `assets/data/randonnees.json` (tracés de la carte). S'il manque la traduction d'un nouveau texte, il s'arrête
     et le nomme : l'ajouter dans `outils/randonnees/traductions.yml` (résumés par numéro de fiche, autres textes
     par empreinte, libellés).
- **Difficulté** : niveau donné par l'office de tourisme ; sinon, niveau du Parc naturel régional des Volcans
  d'Auvergne pour la même randonnée (même départ, même longueur à 10 % près) ; sinon, expression de la description
  de l'office de tourisme, citée telle quelle (« promenade facile »…) ; sinon, « non précisée ». Le site n'estime rien.
- **Traductions** : les résumés, les périodes, les conseils et les libellés sont traduits dans
  `outils/randonnees/traductions.yml` ; l'itinéraire pas à pas et la présentation restent en français.
- **Liste** : cinq fiches au plus (les premières selon les filtres et le tri) ; le bouton « Afficher les N randonnées »
  montre les autres, jusqu'au changement suivant des filtres ou du tri. Une adresse ou un lien vers une fiche cachée
  (`#rando-…`) affiche toute la liste. La carte montre toujours toutes les randonnées retenues par les filtres ; sans
  JavaScript, les 42 fiches s'affichent.
- **Cartes** : Leaflet 1.9.4 (`assets/leaflet/`, licence BSD-2-Clause). Fond de carte OpenStreetMap
  (`tile.openstreetmap.org`, règles d'usage : mention « © les contributeurs d'OpenStreetMap » visible sur la carte,
  pas de téléchargement en masse) ; photographies aériennes de l'IGN (Géoplateforme, sans clé, licence ouverte
  Etalab 2.0). La carte des randonnées s'ouvre sur la commune ; « Vue d'ensemble » montre les 42 randonnées.
  Les cartes météo et de la qualité de l'air ne se chargent que lorsqu'elles arrivent à l'écran.
- **Météo** : Open-Meteo, modèles de Météo-France (gratuit pour un usage non commercial, licence CC BY 4.0 : la
  mention « Données Open-Meteo.com… » doit rester à côté des données). Les prévisions vont jusqu'à 4 jours.
  La carte météo montre, pour chaque jour et chaque moment de la journée (3 h, 9 h, 15 h, 21 h), le temps et la
  température, le vent ou l'indice UV des lieux de `_data/meteo_lieux.yml` (coordonnées des mairies,
  geo.api.gouv.fr ; l'ordre fixe la priorité d'affichage quand deux lieux se chevauchent). L'indice UV vient du
  modèle GFS (Open-Meteo, `models=gfs_seamless`) : les modèles de Météo-France ne le donnent pas.
- **Qualité de l'air** : indice ATMO de la commune (code 15173), publié chaque jour par Atmo Auvergne-Rhône-Alpes
  (couche `ind_aura:agol_indices_2021_7J` de son serveur cartographique). Seul l'indice est demandé : avec les
  sous-indices des polluants, le serveur ne répond pas à temps. La carte reprend les couches de prévision du site
  d'Atmo (WMTS) : `aura:atmo_aura_jp0` (aujourd'hui) et `jp1` (demain), style `max_atmo` pour l'indice ATMO ;
  `aura:o3hd_aura_jp0`, `no2hd`, `pm25hd`, `pm10hd`, `so2hd`, style `o3_atmo`, `no2_atmo`… pour chaque polluant.
  La prévision heure par heure et le commentaire du jour ne sont lisibles que sur le site d'Atmo (lien sous la carte).
- **Code** : `assets/js/tourisme.js`, `_includes/tourisme-meteo.html`, `_includes/tourisme-randonnees.html` et
  `_includes/tourisme-scripts.html` ; textes dans la rubrique `tourisme` de `_data/langues.yml`.
- Les services interrogés par la page sont décrits dans les mentions légales (« Données personnelles »). Si l'un
  d'eux change, mettre à jour les mentions légales et leurs traductions.

## Organisation

- `_layouts/` : gabarits communs (en-tête, pied de page, pages, articles)
- `_includes/` : éléments réutilisés (avis, cartes, horaires, icônes, dates et heures en trois langues)
- `en/`, `nl/` : pages en anglais et en néerlandais
- `assets/images/` : photos du site
- `documents/infos-alertes/` : actualités en PDF
- `documents/affichage-legal/` : documents de l'affichage légal en PDF

## Nom de domaine

Le site répond à l'adresse `saint-bonnet-de-condat.fr`. Le domaine appartient à la commune et se gère chez OVHcloud
(zone DNS : quatre enregistrements A et quatre AAAA vers GitHub Pages, `www` en CNAME vers `victorleblondd.github.io`).
Le fichier `CNAME` à la racine du dépôt et `url` dans `_config.yml` doivent garder cette adresse.
L'ancienne adresse https://victorleblondd.github.io/saint-bonnet-de-condat/ redirige vers le domaine.
Si l'hébergeur change, mettre à jour la rubrique « Hébergement » des mentions légales.

## Crédits

Blason du Cantal : dessin de Gretaz et contributeurs (Wikimedia Commons), licence CC BY-SA 3.0, image adaptée.

Photo du camping (diaporama de l'accueil, `assets/images/camping.jpg`) : [Camping La Santoire](https://www.campinglasantoire.fr/en/),
photo de son site, réduite à 1 400 px. Photos de la mairie, du village sous la neige et du coucher de soleil :
fournies par Victor Leblond.

Randonnées de la page Tourisme : fiches, tracés et documents de l'office de tourisme Destination Haut Cantal (base
Apidae) ; niveaux de difficulté du Parc naturel régional des Volcans d'Auvergne. Cartes : fond © les contributeurs
d'OpenStreetMap, photographies aériennes © IGN (licence ouverte Etalab 2.0), Leaflet (licence BSD-2-Clause,
`assets/leaflet/LICENSE.txt`). Météo : Open-Meteo.com (CC BY 4.0), modèles de Météo-France ; indice UV : modèle GFS
de la NOAA. Qualité de l'air : indice et cartes d'Atmo Auvergne-Rhône-Alpes. Mairies de la carte météo : geo.api.gouv.fr.

Logos de la page Tourisme (`assets/images/tourisme/`) : logos officiels du Camping La Santoire, de NaturÉpure
et de La Maison des Volcans, repris de leurs sites (campinglasantoire.fr, naturepuredetox.fr,
lamaisondesvolcanscantal.fr), réduits et sans marges transparentes.

Logo de L'Instant Libellule (page Vie locale, `assets/images/vie-locale/linstant-libellule.jpg`) : photo de profil
de sa page Facebook, réduite à 360 px. Facebook signale cette image comme « Contenu IA » ; son utilisation a été
validée par Victor Leblond.

Logo de Prestige Nails by Sonia (page Vie locale, `assets/images/vie-locale/prestige-nails-by-sonia.jpg`) : image
de sa page Facebook (959 × 960 px), réduite à 360 px. Elle porte dans son coin inférieur droit l'étoile de Gemini
(image produite avec un outil d'intelligence artificielle) ; son utilisation a été validée par Victor Leblond.
