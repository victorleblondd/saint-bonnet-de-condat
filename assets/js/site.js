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
})();
