/* Saint-Bonnet-de-Condat — petits comportements du site (le site reste lisible sans JavaScript) */
(function () {
  'use strict';

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

  /* ----- Horaires : met en évidence le jour en cours ----- */
  Array.prototype.forEach.call(document.querySelectorAll('dl.horaires [data-jour]'), function (ligne) {
    if (+ligne.getAttribute('data-jour') === ici.jour) { ligne.classList.add('aujourdhui'); }
  });

  /* ----- Infos & Alertes : filtres ----- */
  var filtres = document.querySelector('[data-filtres]');
  if (filtres) {
    var boutons = Array.prototype.slice.call(filtres.querySelectorAll('button[data-filtre]'));
    var avis = Array.prototype.slice.call(document.querySelectorAll('.liste-avis .avis'));
    var mois = Array.prototype.slice.call(document.querySelectorAll('.liste-avis .mois'));
    var vide = document.querySelector('[data-aucun-resultat]');
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
      boutonPause.setAttribute('aria-label', arret ? 'Lancer le diaporama' : 'Mettre en pause le diaporama');
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
