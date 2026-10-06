# Saint-Bonnet-de-Condat — site de la commune

Site officiel de la commune de Saint-Bonnet-de-Condat (Cantal, 15190), publié avec GitHub Pages :
https://victorleblondd.github.io/saint-bonnet-de-condat/

GitHub construit le site automatiquement (Jekyll) à chaque modification de la branche `main`.
Aucune installation n'est nécessaire.

## Ajouter un avis « Infos & Alertes »

1. Déposer le PDF dans le dossier `documents/infos-alertes/`, nommé `AAAA-MM-JJ-sujet-court.pdf`
   (sans accents ni espaces).
2. Ouvrir `_data/infos_alertes.yml` et copier le modèle (en tête du fichier) **tout en haut de la liste** :
   date, type (`alerte` ou `info`), thème, titre, résumé, nom du PDF.

L'avis apparaît alors sur la page Infos & Alertes et sur l'accueil ; son titre et son bouton ouvrent le PDF.
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
   numéro (facultatif), titre, nom du PDF.

Les années proposées dans le filtre se règlent dans le même fichier (`annees`).
Un document disponible en ligne peut aussi être récupéré par `outils/fichiers-a-recuperer.txt`.

## Publier une version (Release)

Pour marquer une version importante, ajouter un fichier `outils/versions/vX.Y.Z.md`
(par exemple `v1.1.0.md`) sur le modèle de `v1.0.0.md` : titre, commit marqué, puis les notes.
GitHub crée alors la Release correspondante (`.github/workflows/publier-version.yml`).

## Modifier les informations

| À modifier | Fichier |
|---|---|
| Adresse, téléphone, horaires de la mairie, page Facebook | `_data/mairie.yml` |
| Élus, permanences, personnel communal | `_data/elus.yml` |
| Menu principal | `_data/navigation.yml` |
| Articles du bulletin municipal | `_posts/AAAA-MM-JJ-titre.html` (un fichier par article) |
| Pages | `mairie.html`, `vie-pratique.html`, `vie-locale.html`, `decouvrir.html`… |
| Apparence | `assets/css/site.css` |

## Organisation

- `_layouts/` : gabarits communs (en-tête, pied de page, pages, articles)
- `_includes/` : éléments réutilisés (avis, cartes, horaires, icônes, dates en français)
- `assets/images/` : photos du site
- `documents/infos-alertes/` : avis en PDF
- `documents/affichage-legal/` : documents de l'affichage légal en PDF

## Nom de domaine

Pour relier un nom de domaine (par exemple `saint-bonnet-de-condat.fr`), indiquer l'adresse dans
**Settings → Pages → Custom domain**, puis dans `_config.yml` : `url: "https://saint-bonnet-de-condat.fr"` et `baseurl: ""`.
Si l'hébergeur change, mettre à jour la rubrique « Hébergement » des mentions légales.

## Crédits

Blason du Cantal : dessin de Gretaz et contributeurs (Wikimedia Commons), licence CC BY-SA 3.0, image adaptée.
