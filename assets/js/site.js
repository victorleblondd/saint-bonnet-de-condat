/* Saint-Bonnet-de-Condat — petits comportements du site (le site reste lisible sans JavaScript) */
(function () {
  'use strict';

  /* ----- Textes dans la langue de la page (bloc JSON écrit par _layouts/default.html depuis _data/langues.yml) ----- */
  var TEXTES = {};
  var SUGGESTIONS = {};
  try {
    var bloc = JSON.parse(document.getElementById('textes-site').textContent);
    TEXTES = bloc.textes || {};
    SUGGESTIONS = bloc.suggestions || {};
  } catch (err) { /* textes français par défaut */ }
  function texte(cle, defaut) { return TEXTES[cle] || defaut; }

  /* ----- Menu principal sur mobile ----- */
  var bouton = document.querySelector('.bouton-menu');
  var menu = document.getElementById('menu-principal');
  if (bouton && menu) {
    bouton.addEventListener('click', function () {
      var ouvert = bouton.getAttribute('aria-expanded') === 'true';
      bouton.setAttribute('aria-expanded', String(!ouvert));
      menu.classList.toggle('ouverte', !ouvert);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bouton.getAttribute('aria-expanded') === 'true') {
        bouton.setAttribute('aria-expanded', 'false');
        menu.classList.remove('ouverte');
        bouton.focus();
      }
    });
  }

  /* ----- Date du jour à Saint-Bonnet (fuseau Europe/Paris) ----- */
  function maintenantParis() {
    try {
      var parts = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var jours = { 'lun.': 1, 'mar.': 2, 'mer.': 3, 'jeu.': 4, 'ven.': 5, 'sam.': 6, 'dim.': 7 };
      return {
        iso: o.year + '-' + o.month + '-' + o.day,
        jour: jours[o.weekday] || ((new Date().getDay() + 6) % 7) + 1
      };
    } catch (err) {
      var d = new Date();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      return { iso: d.getFullYear() + '-' + m + '-' + String(d.getDate()).padStart(2, '0'), jour: ((d.getDay() + 6) % 7) + 1 };
    }
  }
  var ici = maintenantParis();

  function ajouterJours(iso, n) {
    var p = iso.split('-');
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
    return d.toISOString().slice(0, 10);
  }

  /* ----- Bandeau d'alerte de l'accueil : affiché pendant 3 jours, ou jusqu'à la date indiquée ----- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-bandeau-date]'), function (el) {
    var debut = el.getAttribute('data-bandeau-date');
    var fin = el.getAttribute('data-bandeau-fin') || ajouterJours(debut, 3);
    if (ici.iso >= debut && ici.iso <= fin) { el.hidden = false; }
  });

  /* ----- Horaires : met en évidence le jour en cours (couleur et mention « aujourd'hui ») ----- */
  Array.prototype.forEach.call(document.querySelectorAll('dl.horaires [data-jour]'), function (ligne) {
    if (+ligne.getAttribute('data-jour') !== ici.jour) { return; }
    ligne.classList.add('aujourdhui');
    var jour = ligne.querySelector('dt');
    if (jour) {
      var virgule = document.createElement('span');
      virgule.className = 'visuellement-cache';
      virgule.textContent = ', ';
      var mention = document.createElement('span');
      mention.className = 'mention-jour';
      mention.textContent = texte('aujourdhui', "aujourd'hui");
      jour.appendChild(virgule);
      jour.appendChild(mention);
    }
  });

  /* ----- Message de statut lu par les lecteurs d'écran (vidé puis rempli, pour être relu à chaque fois) ----- */
  function annoncer(zone, texte) {
    if (!zone) { return; }
    zone.textContent = '';
    setTimeout(function () { zone.textContent = texte; }, 100);
  }

  /* ----- Infos & Alertes : filtres ----- */
  var filtres = document.querySelector('[data-filtres]');
  if (filtres) {
    var boutons = Array.prototype.slice.call(filtres.querySelectorAll('button[data-filtre]'));
    var avis = Array.prototype.slice.call(document.querySelectorAll('.liste-avis .avis'));
    var mois = Array.prototype.slice.call(document.querySelectorAll('.liste-avis .mois'));
    var vide = document.querySelector('[data-aucun-resultat]');
    var statutAvis = document.querySelector('.liste-avis [data-statut-filtres]');
    filtres.hidden = false;
    var appliquer = function (valeur) {
      boutons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtre') === valeur)); });
      var visibles = 0;
      avis.forEach(function (a) {
        var ok = valeur === 'tout' || a.getAttribute('data-type') === valeur || a.getAttribute('data-theme') === valeur;
        a.hidden = !ok;
        if (ok) { visibles++; }
      });
      mois.forEach(function (titre) {
        var el = titre.nextElementSibling, garde = false;
        while (el && !el.classList.contains('mois')) {
          if (el.classList.contains('avis') && !el.hidden) { garde = true; }
          el = el.nextElementSibling;
        }
        titre.hidden = !garde;
      });
      if (vide) { vide.hidden = visibles !== 0; }
      annoncer(statutAvis, visibles === 0 ? texte('aucune_actualite', 'Aucune actualité dans cette catégorie.') :
        visibles + (visibles > 1 ? texte('actualites_affichees', ' actualités affichées.') : texte('actualite_affichee', ' actualité affichée.')));
    };
    boutons.forEach(function (b) {
      b.addEventListener('click', function () { appliquer(b.getAttribute('data-filtre')); });
    });
  }

  /* ----- Affichage légal : filtres par type et par année ----- */
  var filtresActes = document.querySelector('[data-filtres-actes]');
  if (filtresActes) {
    var actes = Array.prototype.slice.call(document.querySelectorAll('.liste-actes .acte'));
    var titresAnnees = Array.prototype.slice.call(document.querySelectorAll('.liste-actes .annee'));
    var videActes = document.querySelector('[data-actes-vide]');
    var statutActes = document.querySelector('.liste-actes [data-statut-filtres]');
    var choix = { type: 'tout', annee: 'tout' };
    var boutonsActes = Array.prototype.slice.call(filtresActes.querySelectorAll('button[data-critere]'));
    filtresActes.hidden = false;
    var appliquerActes = function () {
      var visibles = 0;
      actes.forEach(function (a) {
        var ok = (choix.type === 'tout' || a.getAttribute('data-type') === choix.type) &&
                 (choix.annee === 'tout' || a.getAttribute('data-annee') === choix.annee);
        a.hidden = !ok;
        if (ok) { visibles++; }
      });
      titresAnnees.forEach(function (titre) {
        var el = titre.nextElementSibling, garde = false;
        while (el && !el.classList.contains('annee')) {
          if (el.classList.contains('acte') && !el.hidden) { garde = true; }
          el = el.nextElementSibling;
        }
        titre.hidden = !garde;
      });
      if (videActes) { videActes.hidden = visibles !== 0; }
      annoncer(statutActes, visibles === 0 ? texte('aucun_document', 'Aucun document ne correspond à cette sélection.') :
        visibles + (visibles > 1 ? texte('documents_affiches', ' documents affichés.') : texte('document_affiche', ' document affiché.')));
    };
    boutonsActes.forEach(function (b) {
      b.addEventListener('click', function () {
        var critere = b.getAttribute('data-critere');
        choix[critere] = b.getAttribute('data-valeur');
        boutonsActes.forEach(function (x) {
          if (x.getAttribute('data-critere') === critere) { x.setAttribute('aria-pressed', String(x === b)); }
        });
        appliquerActes();
      });
    });
  }

  /* ----- Tableaux larges : quand le tableau déborde (petit écran, texte agrandi), sa zone défilante
           devient atteignable au clavier pour pouvoir le faire défiler ----- */
  Array.prototype.forEach.call(document.querySelectorAll('.tableau-defilant'), function (zone) {
    var legende = zone.querySelector('caption');
    var verifier = function () {
      if (zone.scrollWidth > zone.clientWidth + 1) {
        zone.setAttribute('tabindex', '0');
        zone.setAttribute('role', 'region');
        if (legende) { zone.setAttribute('aria-label', legende.textContent.trim()); }
      } else {
        zone.removeAttribute('tabindex');
        zone.removeAttribute('role');
        zone.removeAttribute('aria-label');
      }
    };
    verifier();
    if (window.ResizeObserver) { new ResizeObserver(verifier).observe(zone.firstElementChild || zone); }
    else { window.addEventListener('resize', verifier); }
  });

  /* ----- Ouvrir l'avis ciblé par un lien (#ancre) ----- */
  function ouvrirCible() {
    if (!location.hash) { return; }
    var cible = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!cible) { return; }
    if (cible.hidden && filtres) {
      var tout = filtres.querySelector('[data-filtre="tout"]');
      if (tout) { tout.click(); }
    }
    var details = cible.querySelector('details');
    if (details) { details.open = true; }
  }
  ouvrirCible();
  window.addEventListener('hashchange', ouvrirCible);

  /* ----- Accueil : diaporama des photos du bandeau (une photo toutes les 6 secondes) ----- */
  var diaporama = document.querySelector('[data-diaporama]');
  var commandes = diaporama && diaporama.querySelector('.heros-commandes');
  if (commandes) {
    var diapos = Array.prototype.slice.call(diaporama.querySelectorAll('.heros-diapo'));
    var points = Array.prototype.slice.call(commandes.querySelectorAll('[data-diapo]'));
    var boutonPause = commandes.querySelector('[data-pause]');
    var DUREE = 6000;
    var actuelle = 0;
    var minuteur = null;
    /* Arrêté d'office si le visiteur a demandé moins d'animations ou d'économiser les données */
    var arret = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      !!(navigator.connection && navigator.connection.saveData);
    var survol = false; /* souris sur le bandeau : pause le temps du survol */
    var focusClavier = false; /* commandes atteintes au clavier : pause aussi */

    /* Charge la photo d'une diapositive avant de l'afficher */
    var charger = function (diapo) {
      var url = diapo.getAttribute('data-photo');
      if (!url) { return Promise.resolve(); }
      return new Promise(function (fini) {
        var image = new Image();
        image.onload = image.onerror = function () {
          diapo.style.setProperty('--photo', 'url("' + url + '")');
          diapo.removeAttribute('data-photo');
          fini();
        };
        image.src = url;
      });
    };
    var montrer = function (n) {
      actuelle = n;
      diapos.forEach(function (d, i) { d.classList.toggle('heros-diapo--active', i === n); });
      points.forEach(function (p, i) {
        if (i === n) { p.setAttribute('aria-current', 'true'); } else { p.removeAttribute('aria-current'); }
      });
    };
    var enMarche = function () { return !arret && !survol && !focusClavier && !document.hidden; };
    var planifier = function () {
      clearTimeout(minuteur);
      if (!enMarche()) { return; }
      minuteur = setTimeout(function () {
        var suivante = (actuelle + 1) % diapos.length;
        charger(diapos[suivante]).then(function () {
          if (!enMarche()) { return; }
          montrer(suivante);
          planifier();
          charger(diapos[(suivante + 1) % diapos.length]);
        });
      }, DUREE);
    };
    var majPause = function () {
      commandes.classList.toggle('est-en-pause', arret);
      boutonPause.setAttribute('aria-label', arret ? texte('lancer_diaporama', 'Lancer le diaporama') : texte('pause_diaporama', 'Mettre en pause le diaporama'));
    };

    boutonPause.addEventListener('click', function () {
      arret = !arret;
      majPause();
      planifier();
    });
    /* Choisir une photo arrête le défilement (le bouton le relance) */
    points.forEach(function (p) {
      p.addEventListener('click', function () {
        var n = +p.getAttribute('data-diapo');
        arret = true;
        majPause();
        planifier();
        charger(diapos[n]).then(function () { montrer(n); });
      });
    });
    diaporama.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { survol = true; planifier(); }
    });
    diaporama.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') { survol = false; planifier(); }
    });
    commandes.addEventListener('focusin', function (e) {
      var clavier = true;
      try { clavier = e.target.matches(':focus-visible'); } catch (err) { /* navigateur ancien */ }
      if (clavier) { focusClavier = true; planifier(); }
    });
    commandes.addEventListener('focusout', function (e) {
      if (!commandes.contains(e.relatedTarget)) { focusClavier = false; planifier(); }
    });
    document.addEventListener('visibilitychange', planifier);

    commandes.hidden = false;
    majPause();
    /* Les photos suivantes se chargent une fois la page affichée */
    var demarrer = function () {
      if (!arret) { charger(diapos[1]); }
      planifier();
    };
    if (document.readyState === 'complete') { demarrer(); } else { window.addEventListener('load', demarrer); }
  }

  /* ----- Langues : Français · English · Nederlands ----- */
  /* Le choix du visiteur est gardé dans son navigateur (localStorage : sbc-langue), seulement s'il clique sur une langue. */
  var LANGUE = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2);
  var CODES = ['fr', 'en', 'nl'];
  function lireStockage(cle) {
    try { return window.localStorage.getItem(cle); } catch (err) { return null; }
  }
  function ecrireStockage(cle, valeur) {
    try {
      if (valeur === null) { window.localStorage.removeItem(cle); } else { window.localStorage.setItem(cle, valeur); }
    } catch (err) { /* navigation privée : le choix n'est pas gardé */ }
  }
  function choisirLangue(code) {
    ecrireStockage('sbc-langue', code);
    ecrireStockage('sbc-suggestion-ignoree', null);
  }
  var liensLangues = Array.prototype.slice.call(document.querySelectorAll('.langues a[hreflang]'));
  liensLangues.forEach(function (lien) {
    lien.addEventListener('click', function () {
      choisirLangue(lien.getAttribute('hreflang'));
      /* Même section ou même actualité dans l'autre langue : les ancres sont identiques dans les trois versions */
      if (location.hash && lien.hasAttribute('data-version')) { lien.hash = location.hash; }
    });
  });

  /* Proposer la page dans la langue du visiteur : langue choisie auparavant, sinon celle du navigateur.
     Le bandeau s'affiche en haut de la page, sans rien masquer ; « Non merci » le retire pour de bon. */
  function langueNavigateur() {
    var liste = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < liste.length; i++) {
      var code = String(liste[i]).toLowerCase().split('-')[0];
      if (CODES.indexOf(code) !== -1) { return code; }
    }
    return null;
  }
  var preferee = lireStockage('sbc-langue');
  if (CODES.indexOf(preferee) === -1) { preferee = langueNavigateur(); }
  var versionPreferee = null;
  liensLangues.forEach(function (lien) {
    if (lien.getAttribute('hreflang') === preferee && lien.hasAttribute('data-version')) { versionPreferee = lien; }
  });
  var suggestion = SUGGESTIONS[preferee];
  if (preferee && preferee !== LANGUE && versionPreferee && suggestion && lireStockage('sbc-suggestion-ignoree') !== preferee) {
    var bandeauLangue = document.createElement('div');
    bandeauLangue.className = 'suggestion-langue';
    bandeauLangue.setAttribute('role', 'region');
    bandeauLangue.setAttribute('aria-label', suggestion.region);
    bandeauLangue.setAttribute('lang', preferee);
    var interieur = document.createElement('div');
    interieur.className = 'conteneur';
    var phrase = document.createElement('p');
    var globe = document.querySelector('.langues > .icone');
    if (globe) { phrase.appendChild(globe.cloneNode(true)); }
    var libelle = document.createElement('span');
    libelle.textContent = suggestion.texte;
    phrase.appendChild(libelle);
    var actions = document.createElement('p');
    actions.className = 'suggestion-langue-actions';
    var lire = document.createElement('a');
    lire.setAttribute('href', versionPreferee.getAttribute('href').split('#')[0] + location.hash);
    lire.setAttribute('hreflang', preferee);
    lire.textContent = suggestion.lien;
    lire.addEventListener('click', function () { choisirLangue(preferee); });
    var nonMerci = document.createElement('button');
    nonMerci.type = 'button';
    nonMerci.className = 'bouton-discret';
    nonMerci.textContent = suggestion.fermer;
    nonMerci.addEventListener('click', function () {
      ecrireStockage('sbc-suggestion-ignoree', preferee);
      var suivant = document.querySelector('.bandeau-haut a');
      bandeauLangue.parentNode.removeChild(bandeauLangue);
      if (suivant) { suivant.focus(); }
    });
    actions.appendChild(lire);
    actions.appendChild(nonMerci);
    interieur.appendChild(phrase);
    interieur.appendChild(actions);
    bandeauLangue.appendChild(interieur);
    var evitement = document.querySelector('.lien-evitement');
    document.body.insertBefore(bandeauLangue, evitement ? evitement.nextSibling : document.body.firstChild);
  }

  /* ----- Application web (écran d'accueil) : service worker des notifications ----- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }

  /* ----- Site ouvert depuis l'icône de l'écran d'accueil : inviter à activer les notifications ----- */
  var invitation = document.querySelector('[data-invitation-notifications]');
  var depuisEcranAccueil = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (invitation && depuisEcranAccueil && 'PushManager' in window && 'Notification' in window && Notification.permission === 'default') {
    invitation.hidden = false;
  }
})();
