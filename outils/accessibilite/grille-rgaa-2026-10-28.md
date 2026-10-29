# Grille d'évaluation RGAA 4.1.2 — 28 octobre 2026

Auto-évaluation du site saint-bonnet-de-condat.fr après l'ajout, sur la page Tourisme, des randonnées
(liste, filtres et carte), de la météo, de la qualité de l'air et de leurs cartes, des drapeaux du sélecteur de langue
et du lien de l'adresse de la mairie sur l'accueil. Réalisée sur **toutes les pages, dans les trois langues** : 70 pages.

- Français (24) : accueil, Infos & Alertes, Notifications, La mairie, Le conseil municipal, Affichage légal,
  Vie pratique, Vie locale, Tourisme, Découvrir, Le bulletin municipal et ses 9 articles, Mentions légales,
  Accessibilité, Plan du site, page « Page introuvable » (en trois langues).
- Anglais (23) et néerlandais (23) : les mêmes pages (`/en/`, `/nl/`) et les 9 articles traduits.

**Résultat : 72 critères conformes, 0 non conforme, 34 non applicables. Taux de conformité : 100 %.
État : totalement conforme.**

Changements par rapport à la grille du 27 octobre 2026 : les critères 1.9 (légendes d'images), 11.1 à 11.8
(champs de formulaire et leurs regroupements), 12.10 (raccourcis clavier à une touche) et 13.10 (gestes complexes)
deviennent applicables et conformes, avec la page Tourisme.

Mise à jour du 29 octobre 2026 : la liste des randonnées montre cinq fiches au plus, avec un bouton « Afficher les
N randonnées » ; le bouton « Tout afficher » des filtres devient « Effacer les filtres ». Vérifié sur la page Tourisme
dans les trois langues (axe-core sur ses états, validateur sur le code généré, clavier et focus, 320 px, texte espacé,
mode sombre) : critères 7.1, 7.3, 7.5 et 10.7 toujours conformes ; résultat inchangé.

C = conforme · NC = non conforme · NA = non applicable

## Environnement et outils

- Chromium 141 : ordinateur (1 280 px), téléphone simulé (375 px et 320 px), tablette (768 px), thèmes clair et sombre.
- axe-core 4.14 : 70 pages × 4 configurations (ordinateur et téléphone, clair et sombre), avec un navigateur réglé dans
  une autre langue que la page (bandeau de proposition affiché) et dans la même langue : 376 passages, aucune violation ; puis la page
  Tourisme dans ses états (filtres, randonnée choisie, carte agrandie, fond en photos aériennes, cartes météo et
  qualité de l'air sur chaque couche, tableau ouvert, pannes des services, sans JavaScript) : 72 passages (6 états × 4 configurations × 3 langues), aucune violation. Les cas
  « à vérifier » (textes sur dégradés et sur photos) ont été mesurés à part ; les boutons « + » et « − » des cartes
  (« Zoom avant », « Zoom arrière ») sont signalés parce que leur nom ne reprend pas le symbole affiché : c'est admis
  pour un symbole, qui n'est pas un texte visible.
- Nu Html Checker (vnu 26.10.12) : aucune erreur ni avertissement sur les 70 pages, ni sur le code généré par les scripts de la page Tourisme
  (15 états enregistrés dans les trois langues, sur ordinateur et téléphone). Messages d'information seulement : « Article lacks
  heading » (6, le titre de ces articles est le `h1` de l'en-tête de page) et « The figure role is unnecessary » (profils
  d'altitude : `role="figure"` est demandé par le critère 1.9).
- Scripts Playwright : parcours au clavier de chaque page, contraste du focus (3 830 éléments sur les 70 pages, tous au moins 3:1 ; le lien « Destination Haut Cantal » des mentions légales,
  coupé en fin de ligne, a été gardé sur une ligne), affichage à 320 px, zoom 200 %
  (640 px), taille du texte à 200 %, espacement du texte (320 px et 1 280 px), hauteur 256 px, téléphone en paysage.
- Tests de la page Tourisme (269 vérifications, dans les trois langues) : météo, qualité de l'air, carte
  météo (jours, moments, couches, liste des lieux, prévision d'un point au clic et au clavier, tableau), carte de la
  qualité de l'air (jours, polluants, légende), randonnées (filtres, tri, statut, carte, choix d'un tracé, liens),
  pannes de chaque service, page sans JavaScript, téléphone.
- Tests de l'accueil et du sélecteur de langue (460 vérifications : lien de l'adresse, drapeaux, nom de
  chaque langue, langue en cours, taille des zones cliquables, à 1 280 et 320 px, en thèmes clair et sombre) ; tests du
  choix de langue (34 vérifications).
- Contrôle des pages construites : langue de chaque page, liens internes et ancres, sélecteur de langue
  (3 liens, langue en cours), liens `hreflang` réciproques, textes français restés dans les pages traduites.
- Arbre d'accessibilité de Chromium (instantanés ARIA) : noms, rôles et états des menus, du sélecteur de langue,
  des filtres, des cartes et des messages de statut.
- Pas de test avec un lecteur d'écran (VoiceOver, NVDA, TalkBack) : à faire lors d'une prochaine vérification.

## 1. Images

| Critère | Statut | Remarque |
|---|---|---|
| 1.1 Alternative des images porteuses d'information | C | Blason, logo du Cézallier, logos de la page Tourisme, logos de la page Vie locale ; profil d'altitude des randonnées (`role="img"`, « Profil d'altitude ») ; alternatives traduites dans les pages anglaises et néerlandaises |
| 1.2 Images de décoration ignorées | C | Icônes SVG en `aria-hidden="true"` (dont le globe et les drapeaux du sélecteur de langue : le nom de la langue est donné en texte), photos du diaporama en fond CSS dans un bloc masqué ; tuiles et marqueurs des cartes dans des calques masqués (`aria-hidden="true"`), leurs informations étant données en texte (liste des randonnées, tableau de la carte météo, indice de la commune) |
| 1.3 Pertinence des alternatives | C | |
| 1.4 CAPTCHA et images-test | NA | |
| 1.5 Accès alternatif au CAPTCHA | NA | |
| 1.6 Description détaillée | NA | Aucune image complexe : le profil d'altitude est résumé par sa légende (altitudes minimale et maximale), le dénivelé et l'itinéraire sont donnés en texte dans la fiche |
| 1.7 Pertinence de la description détaillée | NA | |
| 1.8 Images texte | NA | Seuls des logos contiennent du texte (cas particulier) |
| 1.9 Légendes d'images | C | Profil d'altitude de chaque randonnée : `figure` avec `role="figure"`, `aria-label` identique à la légende (`figcaption`) |

## 2. Cadres

| Critère | Statut | Remarque |
|---|---|---|
| 2.1 Titre de cadre | NA | Aucun cadre (les cartes de Météo-France et d'Atmo ne sont pas intégrées : liens vers leurs sites) |
| 2.2 Pertinence du titre de cadre | NA | |

## 3. Couleurs

| Critère | Statut | Remarque |
|---|---|---|
| 3.1 Information pas donnée uniquement par la couleur | C | Jour en cours des horaires : « aujourd'hui » / « today » / « vandaag » ; langue en cours du sélecteur : fond, soulignement et `aria-current` ; niveaux de qualité de l'air : nom du niveau écrit à côté de chaque couleur (panneau et légende de la carte) ; indice UV : niveau écrit dans le tableau et le détail ; choix des cartes (jour, moment, couche, polluant) : boutons radio, choix en cours rempli |
| 3.2 Contraste des textes | C | Bandeau de proposition : texte foncé sur fond clair (thème clair) et clair sur fond foncé (thème sombre) ; titre et phrase de l'accueil vérifiés dans les trois langues ; étiquettes des marqueurs de la carte météo sur fond blanc opaque ; pastilles de l'indice UV « très élevé » et « extrême » en texte blanc |
| 3.3 Contraste des composants d'interface | C | Focus bleu #0B5ED7 sur fond clair, ambre sur fond sombre (bandeau du haut et sélecteur de langue compris) ; bordure des boutons de choix des cartes et des boutons de zoom ; repère du centre de la carte météo au focus |

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
| 5.4 Titre de tableau associé | C | Tableau des restrictions d'eau (Vie pratique) et tableau de la carte météo (Tourisme : « Prévisions : jour, moment »), dans les trois langues : `caption` |
| 5.5 Pertinence du titre | C | Le titre du tableau de la carte météo suit le jour et le moment choisis |
| 5.6 En-têtes déclarés | C | `th` en colonne et en ligne |
| 5.7 Association cellules / en-têtes | C | `scope` |
| 5.8 Pas d'éléments de données dans un tableau de mise en forme | NA | |

## 6. Liens

| Critère | Statut | Remarque |
|---|---|---|
| 6.1 Liens explicites | C | « Lire l'article » complété par un texte masqué ; liens PDF : « nouvel onglet » annoncé ; liens de langue (drapeaux) : nom de la langue dans cette langue, en texte masqué, repris par l'infobulle (`title`) ; adresse de la mairie (accueil et pied de page) : « (ouvrir dans Google Maps) » en texte masqué ; liens « Tracé GPX », « Topoguide (PDF) » et « Plus d'informations » des randonnées complétés par le nom de la randonnée en texte masqué ; sites en français seulement signalés « (in French) » / « (in het Frans) » dans les pages traduites |
| 6.2 Intitulé de lien | C | |

## 7. Scripts

| Critère | Statut | Remarque |
|---|---|---|
| 7.1 Compatibilité avec les technologies d'assistance | C | Menu (`aria-expanded`), filtres (`aria-pressed`), diaporama (étiquettes), `details` natifs ; bandeau de proposition : région nommée ; cartes : régions nommées (« Carte des randonnées », « Carte météo », « Carte de la qualité de l'air ») reliées à leur aide (`aria-describedby`), focalisables ; bouton « Agrandir la carte » (`aria-pressed`) ; choix des cartes en boutons radio natifs ; profil d'altitude en `role="img"` |
| 7.2 Pertinence des alternatives | C | Sans JavaScript, toutes les actualités, les documents et les 42 randonnées restent affichés (fiches complètes, liens GPX et PDF), le sélecteur de langue reste un ensemble de liens ; messages `noscript` (notifications, météo, qualité de l'air, cartes) avec les liens des sites officiels ; les informations des cartes sont aussi données en texte (liste des randonnées, tableau de la carte météo, indice de la commune) |
| 7.3 Contrôle au clavier et à la souris | C | Boutons et liens natifs ; après « Non merci », le focus passe au premier lien du bandeau du haut ; cartes : flèches pour déplacer, + et − pour zoomer ; carte météo : Entrée ou Espace pour la prévision du centre de la carte (un repère marque le centre au focus), liste des lieux ; randonnées : bouton « Voir sur la carte » de chaque fiche, puis lien « Voir la fiche » ; bouton « Afficher les N randonnées », qui place le focus sur le titre de la première fiche qui apparaît ; un lien vers une fiche cachée (`#rando-…`) affiche toute la liste |
| 7.4 Changement de contexte | C | Aucune redirection automatique selon la langue du navigateur ; les filtres, le tri et les choix des cartes mettent à jour la page sans changer de contexte (le focus reste sur le champ) |
| 7.5 Messages de statut | C | Filtres des actualités : « N actualités affichées » ; filtres des randonnées : « N randonnées trouvées, 5 affichées. » puis, avec toute la liste, « N randonnées affichées. » (« N hikes found, 5 shown. », « N wandelingen gevonden, 5 getoond. »…, `role="status"`) ; messages des cartes (chargement, panne, position) en `role="status"` ; détail de la prévision et randonnée choisie en `aria-live="polite"` ; état des notifications dans la langue de la page |

## 8. Éléments obligatoires

| Critère | Statut | Remarque |
|---|---|---|
| 8.1 Type de document | C | |
| 8.2 Code valide | C | 0 erreur au validateur du W3C sur les 70 pages, ni sur le code généré par les scripts de la page Tourisme |
| 8.3 Langue par défaut | C | `lang="fr"`, `lang="en"` sur les pages anglaises, `lang="nl"` sur les pages néerlandaises |
| 8.4 Code de langue pertinent | C | |
| 8.5 Titre de page | C | |
| 8.6 Pertinence du titre de page | C | Titres traduits, uniques dans chaque langue |
| 8.7 Changements de langue | C | Passages dans une autre langue que la page signalés par `lang` : noms des langues du sélecteur, bandeau de proposition (dans la langue proposée), noms et projets en français dans les pages traduites, actualités pas encore traduites, sections anglaise et néerlandaise de la page « Page introuvable » ; page Tourisme : noms des randonnées, itinéraires pas à pas, descriptions, adresses de départ, titres de documents et niveaux de difficulté cités, restés en français dans les pages anglaise et néerlandaise |
| 8.8 Code des changements de langue | C | Codes valides et pertinents : `fr`, `en`, `nl` |
| 8.9 Balises non utilisées à des fins de présentation | C | |
| 8.10 Sens de lecture | NA | |

## 9. Structuration

| Critère | Statut | Remarque |
|---|---|---|
| 9.1 Titres | C | Un seul `h1` par page, aucun saut de niveau, dans les trois langues ; page Tourisme : `h2` des sections, `h3` des fiches, des filtres et des cartes, `h4` du détail de la prévision |
| 9.2 Structure du document | C | `header` (bandeau du haut et sélecteur de langue inclus), `nav`, `main`, `footer` |
| 9.3 Listes | C | Sélecteur de langue, randonnées, étiquettes des fiches, moments de la prévision et légende de la carte de la qualité de l'air en listes |
| 9.4 Citations | C | Commémoration du 8 mai : `blockquote` |

## 10. Présentation de l'information

| Critère | Statut | Remarque |
|---|---|---|
| 10.1 Feuilles de styles | C | |
| 10.2 Contenu visible sans styles | C | |
| 10.3 Information compréhensible sans styles | C | |
| 10.4 Texte lisible à 200 % | C | Zoom 200 % et taille du texte 200 % |
| 10.5 Couleurs de fond et de texte déclarées ensemble | C | |
| 10.6 Liens visibles dans le texte | C | Liens soulignés (attributions des cartes comprises) |
| 10.7 Focus visible | C | Contour de focus des drapeaux, des boutons radio des cartes (sur l'étiquette) et des cartes |
| 10.8 Contenus cachés | C | |
| 10.9 Information pas donnée par la forme, la taille ou la position | C | |
| 10.10 Idem, implémentation | C | |
| 10.11 Affichage à 320 px sans défilement horizontal | C | Bandeau du haut, bandeau de proposition, filtres et choix des cartes passent à la ligne ; tableaux des restrictions d'eau et de la carte météo : défilement dans leur zone (cas particulier des tableaux), zone atteignable au clavier et nommée par la légende du tableau |
| 10.12 Espacement du texte | C | Étiquettes des randonnées : coupure des mots longs (mot composé néerlandais « kuddebeschermingshonden » avec césures conditionnelles), qui dépassaient de la page à 320 px avec le texte espacé |
| 10.13 Contenus additionnels au survol ou au focus | NA | Seule l'infobulle native du navigateur (`title`) des drapeaux et des marqueurs de la carte météo, hors du champ du critère |
| 10.14 Contenus additionnels en CSS | C | Lien d'évitement visible au focus |

## 11. Formulaires

| Critère | Statut | Remarque |
|---|---|---|
| 11.1 Étiquette des champs | C | Page Tourisme : recherche, distance, durée, difficulté, tri, cases des options, fond de carte, jour, moment, affichage, lieu, polluant : chaque champ a son `label` |
| 11.2 Pertinence des étiquettes | C | |
| 11.3 Étiquettes cohérentes | C | « Jour » pour les deux cartes ; mêmes libellés dans les trois langues |
| 11.4 Étiquette accolée au champ | C | |
| 11.5 Regroupement des champs de même nature | C | Options des randonnées, fond de carte, jour, moment, affichage et polluant : `fieldset` |
| 11.6 Légende de chaque regroupement | C | `legend` |
| 11.7 Pertinence des légendes | C | |
| 11.8 Items de même nature d'une liste de choix regroupés | C | Listes courtes et homogènes (distances, durées, difficultés, tris, lieux) : pas de groupe nécessaire |
| 11.9 Intitulé des boutons | C | Boutons des filtres, du menu, du diaporama et des notifications, « Non merci », « Effacer les filtres », « Afficher les N randonnées » (nombre à jour), « Vue d'ensemble », « Me localiser », « Agrandir la carte », « Voir sur la carte » et « Itinéraire pas à pas » (avec le nom de la randonnée), boutons de zoom (« Zoom avant », « Zoom arrière », traduits) |
| 11.10 à 11.13 | NA | Aucun contrôle de saisie, aucune donnée personnelle demandée |

## 12. Navigation

| Critère | Statut | Remarque |
|---|---|---|
| 12.1 Deux systèmes de navigation | C | Menu principal et plan du site, dans chaque langue |
| 12.2 Menu toujours à la même place | C | Menu principal et sélecteur de langue au même endroit sur toutes les pages |
| 12.3 Plan du site pertinent | C | Un plan par langue, avec les liens vers les plans des autres langues |
| 12.4 Plan du site accessible de façon identique | C | Lien en bas de chaque page |
| 12.5 Moteur de recherche | NA | La recherche de la page Tourisme filtre seulement la liste des randonnées |
| 12.6 Zones atteignables ou évitables | C | Régions ARIA et lien d'évitement ; sélecteur de langue : `nav` nommée ; cartes : régions nommées |
| 12.7 Lien d'évitement | C | Premier lien de chaque page, avant le bandeau de proposition |
| 12.8 Ordre de tabulation | C | Lien d'évitement, bandeau de proposition, bandeau du haut (contacts, langues), en-tête, menu, contenu ; sur les cartes : choix, carte, puis tableau ou fiche |
| 12.9 Pas de piège au clavier | C | Cartes : Tab sort de la carte |
| 12.10 Raccourcis clavier à une touche | C | Touches + et − des cartes : actives seulement quand la carte a le focus |
| 12.11 Contenus additionnels atteignables au clavier | C | Menu mobile, textes dépliables, tableau de la carte météo, itinéraires pas à pas |

## 13. Consultation

| Critère | Statut | Remarque |
|---|---|---|
| 13.1 Limites de temps | NA | |
| 13.2 Nouvelle fenêtre sans action de l'utilisateur | C | La demande de position (« Me localiser ») ne s'ouvre qu'après un clic |
| 13.3 Version accessible des documents bureautiques | C | Affiches PDF (images, en français) : texte complet sur la page, en français, et traduit sur les pages anglaise et néerlandaise ; topoguides PDF des randonnées : contenus de tiers (Destination Haut Cantal), l'itinéraire et les informations pratiques sont aussi sur la page ; fiche PDF du Parc des Volcans : contenu de tiers |
| 13.4 Même information dans la version accessible | C | Traductions des 21 actualités vérifiées avec toutes les informations de l'affiche (dates, heures, lieux, numéros) |
| 13.5 Alternative aux contenus cryptiques | C | Symboles ⋯ et ⋮ (page Notifications) : texte masqué ; abréviations des polluants (O₃, NO₂, PM2,5, PM10, SO₂) précédées de leur nom |
| 13.6 Pertinence de l'alternative | C | |
| 13.7 Flashs | NA | |
| 13.8 Contenus en mouvement contrôlables | C | Diaporama : bouton pause, arrêt au survol, au focus et si l'animation est réduite ; cartes : aucun mouvement automatique |
| 13.9 Orientation de l'écran | C | |
| 13.10 Gestes complexes | C | Cartes : le zoom à deux doigts a les boutons « + » et « − » ; la carte se déplace d'un doigt ou au clavier ; le choix d'une randonnée se fait aussi par le bouton de sa fiche |
| 13.11 Annulation des actions au pointeur | C | Clic sur la carte : l'action part au relâchement |
| 13.12 Mouvements de l'appareil | NA | |

## Pour garder la conformité

- Chaque affiche publiée en PDF (Infos & Alertes, Affichage légal) doit avoir son texte complet dans le champ
  `texte` de `_data/infos_alertes.yml` ou `_data/affichage_legal.yml`, et ses traductions (`en:`, `nl:`) doivent
  reprendre toutes ses informations.
- Une image ajoutée à une page doit avoir une alternative (`alt`) dans chaque langue ; une image décorative, `alt=""`.
- Un passage dans une autre langue que celle de la page porte l'attribut `lang` (par exemple
  `<span lang="fr">…</span>` dans une page anglaise).
- Page Tourisme : une carte ou une couche ajoutée doit garder ses informations en texte (liste, tableau ou texte de la
  commune), une région nommée et son aide au clavier ; un lieu ajouté à `_data/meteo_lieux.yml` apparaît aussi dans la
  liste et dans le tableau.
- Après des changements importants, refaire l'évaluation et mettre à jour `_data/accessibilite.yml`
  (état affiché en bas de chaque page et sur la page Accessibilité, dans les trois langues).
