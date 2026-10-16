# Grille d'évaluation RGAA 4.1.2 — 16 octobre 2026

Auto-évaluation du site saint-bonnet-de-condat.fr, réalisée sur **toutes les pages** (24 pages : accueil, Infos & Alertes,
Notifications, La mairie, Le conseil municipal, Affichage légal, Vie pratique, Vie locale, Tourisme, Découvrir,
Le bulletin municipal et ses 9 articles, Mentions légales, Accessibilité, Plan du site, page « Page introuvable »).

**Résultat : 59 critères conformes, 0 non conforme, 47 non applicables. Taux de conformité : 100 %.
État : totalement conforme.**

C = conforme · NC = non conforme · NA = non applicable

## Environnement et outils

- Chromium 141 : ordinateur (1 280 px), téléphone simulé (375 px et 320 px), tablette (768 px), thèmes clair et sombre.
- axe-core 4.14 : 24 pages × 4 configurations, aucune violation ; les cas « à vérifier » (textes sur dégradés et sur
  photos) ont été mesurés à part.
- Nu Html Checker (vnu 26.10.12) : aucune erreur sur les 24 pages.
- Scripts Playwright : parcours au clavier de chaque page, contraste du focus (570 éléments, tous au moins 3:1),
  affichage à 320 px, zoom 200 % (640 px), taille du texte à 200 %, espacement du texte (320 px et 1 280 px),
  hauteur 256 px, téléphone en paysage, contraste du titre et de la phrase de l'accueil sur les 4 photos à 15 largeurs.
- Arbre d'accessibilité de Chromium (instantanés ARIA) : noms, rôles et états des menus, filtres, messages de statut.
- Pas de test avec un lecteur d'écran (VoiceOver, NVDA, TalkBack) : à faire lors d'une prochaine vérification.

## 1. Images

| Critère | Statut | Remarque |
|---|---|---|
| 1.1 Alternative des images porteuses d'information | C | Blason, logo du Cézallier, logos de la page Tourisme |
| 1.2 Images de décoration ignorées | C | Icônes SVG en `aria-hidden="true"`, photos du diaporama en fond CSS dans un bloc masqué |
| 1.3 Pertinence des alternatives | C | |
| 1.4 CAPTCHA et images-test | NA | |
| 1.5 Accès alternatif au CAPTCHA | NA | |
| 1.6 Description détaillée | NA | Aucune image complexe |
| 1.7 Pertinence de la description détaillée | NA | |
| 1.8 Images texte | NA | Seuls des logos contiennent du texte (cas particulier) |
| 1.9 Légendes d'images | NA | Aucune image légendée (le gabarit des articles est prêt : `role="figure"` et `aria-label`) |

## 2. Cadres

| Critère | Statut | Remarque |
|---|---|---|
| 2.1 Titre de cadre | NA | Aucun cadre |
| 2.2 Pertinence du titre de cadre | NA | |

## 3. Couleurs

| Critère | Statut | Remarque |
|---|---|---|
| 3.1 Information pas donnée uniquement par la couleur | C | Jour en cours des horaires : mention « aujourd'hui » ajoutée |
| 3.2 Contraste des textes | C | Voile du bandeau d'accueil renforcé entre 701 et 1 179 px ; chiffres des filtres sans transparence |
| 3.3 Contraste des composants d'interface | C | Focus bleu #0B5ED7 sur fond clair, ambre sur fond sombre, couleur du texte sur le bandeau d'alerte |

## 4. Multimédia

| Critère | Statut | Remarque |
|---|---|---|
| 4.1 à 4.13 | NA | Aucun contenu audio, vidéo ou multimédia (le diaporama de l'accueil relève du critère 13.8) |

## 5. Tableaux

| Critère | Statut | Remarque |
|---|---|---|
| 5.1 Résumé des tableaux complexes | NA | |
| 5.2 Pertinence du résumé | NA | |
| 5.3 Tableaux de mise en forme linéarisés | NA | |
| 5.4 Titre de tableau associé | C | Tableau des restrictions d'eau (Vie pratique) : `caption` |
| 5.5 Pertinence du titre | C | |
| 5.6 En-têtes déclarés | C | `th` en colonne et en ligne |
| 5.7 Association cellules / en-têtes | C | `scope` |
| 5.8 Pas d'éléments de données dans un tableau de mise en forme | NA | |

## 6. Liens

| Critère | Statut | Remarque |
|---|---|---|
| 6.1 Liens explicites | C | « Lire l'article » complété par un texte masqué ; liens PDF : « nouvel onglet » annoncé |
| 6.2 Intitulé de lien | C | |

## 7. Scripts

| Critère | Statut | Remarque |
|---|---|---|
| 7.1 Compatibilité avec les technologies d'assistance | C | Menu (`aria-expanded`), filtres (`aria-pressed`), diaporama (étiquettes), `details` natifs |
| 7.2 Pertinence des alternatives | C | Sans JavaScript, toutes les actualités et tous les documents restent affichés ; message `noscript` pour les notifications |
| 7.3 Contrôle au clavier et à la souris | C | Boutons et liens natifs |
| 7.4 Changement de contexte | C | Aucun changement de contexte automatique |
| 7.5 Messages de statut | C | Filtres : « N actualités affichées » / « N documents affichés » (`role="status"`) ; état des notifications |

## 8. Éléments obligatoires

| Critère | Statut | Remarque |
|---|---|---|
| 8.1 Type de document | C | |
| 8.2 Code valide | C | 0 erreur au validateur du W3C |
| 8.3 Langue par défaut | C | `lang="fr"` |
| 8.4 Code de langue pertinent | C | |
| 8.5 Titre de page | C | |
| 8.6 Pertinence du titre de page | C | Titres uniques |
| 8.7 Changements de langue | NA | Aucun passage en langue étrangère (noms propres seulement) |
| 8.8 Code des changements de langue | NA | |
| 8.9 Balises non utilisées à des fins de présentation | C | |
| 8.10 Sens de lecture | NA | |

## 9. Structuration

| Critère | Statut | Remarque |
|---|---|---|
| 9.1 Titres | C | Un seul `h1` par page, aucun saut de niveau (encadrés passés en `h2`) |
| 9.2 Structure du document | C | `header` (bandeau du haut inclus), `nav`, `main`, `footer` |
| 9.3 Listes | C | |
| 9.4 Citations | C | Commémoration du 8 mai : `blockquote` |

## 10. Présentation de l'information

| Critère | Statut | Remarque |
|---|---|---|
| 10.1 Feuilles de styles | C | |
| 10.2 Contenu visible sans styles | C | |
| 10.3 Information compréhensible sans styles | C | |
| 10.4 Texte lisible à 200 % | C | Zoom 200 % et taille du texte 200 % |
| 10.5 Couleurs de fond et de texte déclarées ensemble | C | |
| 10.6 Liens visibles dans le texte | C | Liens soulignés |
| 10.7 Focus visible | C | Cartes d'articles : contour tracé sur la carte (auparavant coupé) |
| 10.8 Contenus cachés | C | |
| 10.9 Information pas donnée par la forme, la taille ou la position | C | |
| 10.10 Idem, implémentation | C | |
| 10.11 Affichage à 320 px sans défilement horizontal | C | Boutons à la ligne, mots longs coupés ; tableau des restrictions : défilement dans sa zone (cas particulier des tableaux), zone atteignable au clavier |
| 10.12 Espacement du texte | C | |
| 10.13 Contenus additionnels au survol ou au focus | NA | |
| 10.14 Contenus additionnels en CSS | C | Lien d'évitement visible au focus |

## 11. Formulaires

| Critère | Statut | Remarque |
|---|---|---|
| 11.1 à 11.8 | NA | Aucun champ de formulaire |
| 11.9 Intitulé des boutons | C | Boutons des filtres, du menu, du diaporama et des notifications |
| 11.10 à 11.13 | NA | |

## 12. Navigation

| Critère | Statut | Remarque |
|---|---|---|
| 12.1 Deux systèmes de navigation | C | Menu principal et plan du site |
| 12.2 Menu toujours à la même place | C | |
| 12.3 Plan du site pertinent | C | Page /plan-du-site/ créée |
| 12.4 Plan du site accessible de façon identique | C | Lien en bas de chaque page |
| 12.5 Moteur de recherche | NA | |
| 12.6 Zones atteignables ou évitables | C | Régions ARIA et lien d'évitement |
| 12.7 Lien d'évitement | C | « Aller au contenu », premier lien de chaque page |
| 12.8 Ordre de tabulation | C | |
| 12.9 Pas de piège au clavier | C | |
| 12.10 Raccourcis clavier à une touche | NA | |
| 12.11 Contenus additionnels atteignables au clavier | C | Menu mobile, textes dépliables |

## 13. Consultation

| Critère | Statut | Remarque |
|---|---|---|
| 13.1 Limites de temps | NA | |
| 13.2 Nouvelle fenêtre sans action de l'utilisateur | C | |
| 13.3 Version accessible des documents bureautiques | C | Affiches PDF (images) : texte complet sur la page ; fiche PDF du Parc des Volcans : contenu de tiers |
| 13.4 Même information dans la version accessible | C | 9 affiches comparées ; France Services : liste des organismes partenaires ajoutée |
| 13.5 Alternative aux contenus cryptiques | C | Symboles ⋯ et ⋮ (page Notifications) : texte masqué « trois points » |
| 13.6 Pertinence de l'alternative | C | |
| 13.7 Flashs | NA | |
| 13.8 Contenus en mouvement contrôlables | C | Diaporama : bouton pause, arrêt au survol, au focus et si l'animation est réduite |
| 13.9 Orientation de l'écran | C | |
| 13.10 Gestes complexes | NA | |
| 13.11 Annulation des actions au pointeur | C | |
| 13.12 Mouvements de l'appareil | NA | |

## Pour garder la conformité

- Chaque affiche publiée en PDF (Infos & Alertes, Affichage légal) doit avoir son texte complet dans le champ
  `texte` de `_data/infos_alertes.yml` ou `_data/affichage_legal.yml`.
- Une image ajoutée à une page doit avoir une alternative (`alt`) ; une image décorative, `alt=""`.
- Après des changements importants, refaire l'évaluation et mettre à jour `_data/accessibilite.yml`
  (état affiché en bas de chaque page et sur la page Accessibilité).
