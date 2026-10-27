# Grille d'évaluation RGAA 4.1.2 — 27 octobre 2026

Auto-évaluation du site saint-bonnet-de-condat.fr après l'ajout des versions anglaise et néerlandaise, réalisée sur
**toutes les pages, dans les trois langues** : 70 pages.

- Français (24) : accueil, Infos & Alertes, Notifications, La mairie, Le conseil municipal, Affichage légal,
  Vie pratique, Vie locale, Tourisme, Découvrir, Le bulletin municipal et ses 9 articles, Mentions légales,
  Accessibilité, Plan du site, page « Page introuvable » (en trois langues).
- Anglais (23) et néerlandais (23) : les mêmes pages (`/en/`, `/nl/`) et les 9 articles traduits.

**Résultat : 61 critères conformes, 0 non conforme, 45 non applicables. Taux de conformité : 100 %.
État : totalement conforme.**

Changements par rapport à la grille du 16 octobre 2026 : les critères 8.7 et 8.8 (changements de langue) deviennent
applicables et conformes.

C = conforme · NC = non conforme · NA = non applicable

## Environnement et outils

- Chromium 141 : ordinateur (1 280 px), téléphone simulé (375 px et 320 px), tablette (768 px), thèmes clair et sombre.
- axe-core 4.14 : 70 pages × 4 configurations (ordinateur et téléphone, clair et sombre), avec un navigateur réglé dans
  une autre langue que la page (bandeau de proposition affiché) et dans la même langue : 376 passages, aucune
  violation. Les cas « à vérifier » (textes sur dégradés et sur photos) ont été mesurés à part.
- Nu Html Checker (vnu 26.10.12) : aucune erreur sur les 70 pages (6 messages d'information « Article lacks heading » :
  le titre de ces articles est le `h1` de l'en-tête de page).
- Scripts Playwright : parcours au clavier de chaque page, contraste du focus (2 060 éléments, tous au moins 3:1),
  affichage à 320 px, zoom 200 % (640 px), taille du texte à 200 %, espacement du texte (320 px et 1 280 px),
  hauteur 256 px, téléphone en paysage, contraste du titre et de la phrase de l'accueil sur les 4 photos à 15 largeurs
  (en français, en anglais et en néerlandais).
- Tests du choix de langue (34 vérifications) : bandeau de proposition (langue, nom de la région, place, refus mémorisé,
  focus après « Non merci »), changement de langue sur la même page et la même actualité, mémorisation du choix,
  navigateur dans une autre langue (aucune proposition), textes des scripts traduits, fonctionnement sans JavaScript.
- Contrôle des pages construites : langue de chaque page, liens internes et ancres, sélecteur de langue
  (3 liens, langue en cours), liens `hreflang` réciproques, textes français restés dans les pages traduites.
- Arbre d'accessibilité de Chromium (instantanés ARIA) : noms, rôles et états des menus, du sélecteur de langue,
  du bandeau de proposition, des filtres et des messages de statut.
- Pas de test avec un lecteur d'écran (VoiceOver, NVDA, TalkBack) : à faire lors d'une prochaine vérification.

## 1. Images

| Critère | Statut | Remarque |
|---|---|---|
| 1.1 Alternative des images porteuses d'information | C | Blason, logo du Cézallier, logos de la page Tourisme, logos de la page Vie locale ; alternatives traduites dans les pages anglaises et néerlandaises |
| 1.2 Images de décoration ignorées | C | Icônes SVG en `aria-hidden="true"` (dont le globe du sélecteur de langue), photos du diaporama en fond CSS dans un bloc masqué |
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
| 3.1 Information pas donnée uniquement par la couleur | C | Jour en cours des horaires : « aujourd'hui » / « today » / « vandaag » ; langue en cours du sélecteur : fond, gras, soulignement et `aria-current` |
| 3.2 Contraste des textes | C | Bandeau de proposition : texte foncé sur fond clair (thème clair) et clair sur fond foncé (thème sombre) ; titre et phrase de l'accueil vérifiés dans les trois langues |
| 3.3 Contraste des composants d'interface | C | Focus bleu #0B5ED7 sur fond clair, ambre sur fond sombre (bandeau du haut et sélecteur de langue compris) |

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
| 5.4 Titre de tableau associé | C | Tableau des restrictions d'eau (Vie pratique, dans les trois langues) : `caption` |
| 5.5 Pertinence du titre | C | |
| 5.6 En-têtes déclarés | C | `th` en colonne et en ligne |
| 5.7 Association cellules / en-têtes | C | `scope` |
| 5.8 Pas d'éléments de données dans un tableau de mise en forme | NA | |

## 6. Liens

| Critère | Statut | Remarque |
|---|---|---|
| 6.1 Liens explicites | C | « Lire l'article » complété par un texte masqué ; liens PDF : « nouvel onglet » annoncé ; liens de langue : nom de la langue dans cette langue ; sites en français seulement signalés « (in French) » / « (in het Frans) » dans les pages traduites |
| 6.2 Intitulé de lien | C | |

## 7. Scripts

| Critère | Statut | Remarque |
|---|---|---|
| 7.1 Compatibilité avec les technologies d'assistance | C | Menu (`aria-expanded`), filtres (`aria-pressed`), diaporama (étiquettes), `details` natifs ; bandeau de proposition : région nommée (« Choix de la langue » / « Language choice » / « Taalkeuze »), lien et bouton natifs |
| 7.2 Pertinence des alternatives | C | Sans JavaScript, toutes les actualités et tous les documents restent affichés, le sélecteur de langue reste un ensemble de liens ; message `noscript` pour les notifications |
| 7.3 Contrôle au clavier et à la souris | C | Boutons et liens natifs ; après « Non merci », le focus passe au premier lien du bandeau du haut |
| 7.4 Changement de contexte | C | Aucune redirection automatique selon la langue du navigateur : le bandeau propose la page, le visiteur choisit |
| 7.5 Messages de statut | C | Filtres : « N actualités affichées » / « N notices shown » / « N berichten getoond » (`role="status"`) ; état des notifications dans la langue de la page |

## 8. Éléments obligatoires

| Critère | Statut | Remarque |
|---|---|---|
| 8.1 Type de document | C | |
| 8.2 Code valide | C | 0 erreur au validateur du W3C sur les 70 pages |
| 8.3 Langue par défaut | C | `lang="fr"`, `lang="en"` sur les pages anglaises, `lang="nl"` sur les pages néerlandaises |
| 8.4 Code de langue pertinent | C | |
| 8.5 Titre de page | C | |
| 8.6 Pertinence du titre de page | C | Titres traduits, uniques dans chaque langue |
| 8.7 Changements de langue | C | Passages dans une autre langue que la page signalés par `lang` : noms des langues du sélecteur, bandeau de proposition (dans la langue proposée), noms et projets en français dans les pages traduites (« Raconte-moi Saint-Bonnet », Défenseur des droits…), actualités pas encore traduites (affichées en français avec la mention « In French » / « In het Frans »), sections anglaise et néerlandaise de la page « Page introuvable » |
| 8.8 Code des changements de langue | C | Codes valides et pertinents : `fr`, `en`, `nl` |
| 8.9 Balises non utilisées à des fins de présentation | C | |
| 8.10 Sens de lecture | NA | |

## 9. Structuration

| Critère | Statut | Remarque |
|---|---|---|
| 9.1 Titres | C | Un seul `h1` par page, aucun saut de niveau, dans les trois langues |
| 9.2 Structure du document | C | `header` (bandeau du haut et sélecteur de langue inclus), `nav`, `main`, `footer` |
| 9.3 Listes | C | Sélecteur de langue en liste |
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
| 10.7 Focus visible | C | Lien de licence des mentions légales traduites gardé sur une ligne (contour complet) |
| 10.8 Contenus cachés | C | |
| 10.9 Information pas donnée par la forme, la taille ou la position | C | |
| 10.10 Idem, implémentation | C | |
| 10.11 Affichage à 320 px sans défilement horizontal | C | Bandeau du haut et bandeau de proposition passent à la ligne ; tableau des restrictions en néerlandais : coupures possibles dans les mots longs, il tient à 320 px ; avec l'espacement du texte agrandi, défilement dans sa zone (cas particulier des tableaux), zone atteignable au clavier |
| 10.12 Espacement du texte | C | |
| 10.13 Contenus additionnels au survol ou au focus | NA | |
| 10.14 Contenus additionnels en CSS | C | Lien d'évitement visible au focus |

## 11. Formulaires

| Critère | Statut | Remarque |
|---|---|---|
| 11.1 à 11.8 | NA | Aucun champ de formulaire |
| 11.9 Intitulé des boutons | C | Boutons des filtres, du menu, du diaporama et des notifications, « Non merci » / « No thanks » / « Nee, bedankt », bouton de changement de la langue des notifications |
| 11.10 à 11.13 | NA | |

## 12. Navigation

| Critère | Statut | Remarque |
|---|---|---|
| 12.1 Deux systèmes de navigation | C | Menu principal et plan du site, dans chaque langue |
| 12.2 Menu toujours à la même place | C | Menu principal et sélecteur de langue au même endroit sur toutes les pages |
| 12.3 Plan du site pertinent | C | Un plan par langue, avec les liens vers les plans des autres langues |
| 12.4 Plan du site accessible de façon identique | C | Lien en bas de chaque page |
| 12.5 Moteur de recherche | NA | |
| 12.6 Zones atteignables ou évitables | C | Régions ARIA et lien d'évitement ; sélecteur de langue : `nav` nommée (« Langue du site » / « Site language » / « Taal van de website ») |
| 12.7 Lien d'évitement | C | Premier lien de chaque page, avant le bandeau de proposition |
| 12.8 Ordre de tabulation | C | Lien d'évitement, bandeau de proposition, bandeau du haut (contacts, langues), en-tête, menu, contenu |
| 12.9 Pas de piège au clavier | C | |
| 12.10 Raccourcis clavier à une touche | NA | |
| 12.11 Contenus additionnels atteignables au clavier | C | Menu mobile, textes dépliables |

## 13. Consultation

| Critère | Statut | Remarque |
|---|---|---|
| 13.1 Limites de temps | NA | |
| 13.2 Nouvelle fenêtre sans action de l'utilisateur | C | |
| 13.3 Version accessible des documents bureautiques | C | Affiches PDF (images, en français) : texte complet sur la page, en français, et traduit sur les pages anglaise et néerlandaise ; fiche PDF du Parc des Volcans : contenu de tiers |
| 13.4 Même information dans la version accessible | C | Traductions des 21 actualités vérifiées avec toutes les informations de l'affiche (dates, heures, lieux, numéros) |
| 13.5 Alternative aux contenus cryptiques | C | Symboles ⋯ et ⋮ (page Notifications) : texte masqué « trois points » / « three dots » / « drie puntjes » |
| 13.6 Pertinence de l'alternative | C | |
| 13.7 Flashs | NA | |
| 13.8 Contenus en mouvement contrôlables | C | Diaporama : bouton pause, arrêt au survol, au focus et si l'animation est réduite |
| 13.9 Orientation de l'écran | C | |
| 13.10 Gestes complexes | NA | |
| 13.11 Annulation des actions au pointeur | C | |
| 13.12 Mouvements de l'appareil | NA | |

## Pour garder la conformité

- Chaque affiche publiée en PDF (Infos & Alertes, Affichage légal) doit avoir son texte complet dans le champ
  `texte` de `_data/infos_alertes.yml` ou `_data/affichage_legal.yml`, et ses traductions (`en:`, `nl:`) doivent
  reprendre toutes ses informations.
- Une image ajoutée à une page doit avoir une alternative (`alt`) dans chaque langue ; une image décorative, `alt=""`.
- Un passage dans une autre langue que celle de la page porte l'attribut `lang` (par exemple
  `<span lang="fr">…</span>` dans une page anglaise).
- Après des changements importants, refaire l'évaluation et mettre à jour `_data/accessibilite.yml`
  (état affiché en bas de chaque page et sur la page Accessibilité, dans les trois langues).
