/* Saint-Bonnet-de-Condat — page Tourisme : météo et qualité de l'air en direct (panneaux et cartes interactives),
   carte et liste des randonnées. Fonds de carte OpenStreetMap ; cartes chargées quand elles arrivent à l'écran.
   Sans JavaScript, la page renvoie aux sites officiels (Météo-France, Atmo Auvergne-Rhône-Alpes) et la liste
   des randonnées reste entièrement lisible. Textes : bloc JSON #textes-tourisme, tiré de _data/langues.yml. */
(function () {
  'use strict';

  var T = {};
  try { T = JSON.parse(document.getElementById('textes-tourisme').textContent) || {}; } catch (err) { T = {}; }
  var LANGUE = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2);
  var LOCALE = { fr: 'fr-FR', en: 'en-GB', nl: 'nl-NL' }[LANGUE] || 'fr-FR';
  var ESP = ' ';                  /* espace insécable */
  var VILLAGE = [45.27904, 2.78795];   /* mairie de Saint-Bonnet-de-Condat */
  var MOUVEMENT_REDUIT = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Outils ---------- */
  function texte(cle) { return T[cle] !== undefined && T[cle] !== null ? T[cle] : ''; }
  function remplir(modele, valeurs) {
    return String(modele || '').replace(/\{(\w+)\}/g, function (m, cle) { return valeurs[cle] !== undefined ? valeurs[cle] : m; });
  }
  function creer(nom, attributs, contenu) {
    var e = document.createElement(nom);
    Object.keys(attributs || {}).forEach(function (k) {
      if (attributs[k] !== null && attributs[k] !== undefined && attributs[k] !== false) { e.setAttribute(k, attributs[k]); }
    });
    [].concat(contenu === undefined ? [] : contenu).forEach(function (c) {
      if (c === null || c === undefined || c === '') { return; }
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }
  function chargerJSON(url, delai) {
    var controle = window.AbortController ? new AbortController() : null;
    var minuteur = controle ? setTimeout(function () { controle.abort(); }, delai || 15000) : null;
    return fetch(url, { credentials: 'omit', signal: controle ? controle.signal : undefined })
      .then(function (r) { if (!r.ok) { throw new Error('HTTP ' + r.status); } return r.json(); })
      .then(function (j) { clearTimeout(minuteur); return j; }, function (e) { clearTimeout(minuteur); throw e; });
  }
  function sansAccents(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\xad/g, '').toLowerCase();
  }
  function defiler(element) {
    if (element && element.scrollIntoView) { element.scrollIntoView({ behavior: MOUVEMENT_REDUIT ? 'auto' : 'smooth', block: 'start' }); }
  }
  function quandVisible(element, action) {                /* lance l'action quand l'élément approche de l'écran */
    if (!element) { return; }
    if (!('IntersectionObserver' in window)) { action(); return; }
    var observateur = new IntersectionObserver(function (entrees) {
      if (entrees.some(function (e) { return e.isIntersecting; })) { observateur.disconnect(); action(); }
    }, { rootMargin: '400px 0px' });
    observateur.observe(element);
  }
  function cocher(form, nom, valeur) {
    var champ = form.querySelector('input[name="' + nom + '"][value="' + valeur + '"]');
    if (champ) { champ.checked = true; }
  }
  /* Tableau plus large que sa zone (téléphone, texte agrandi) : la zone défilante devient atteignable au clavier,
     comme le tableau de la page Vie pratique (site.js) ; nommée par la légende du tableau. */
  function zoneDefilante(zone) {
    var verifier = function () {
      var legende = zone.querySelector('caption');
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
    if (window.ResizeObserver) { new ResizeObserver(verifier).observe(zone); }
    else { window.addEventListener('resize', verifier); }
    return verifier;
  }

  /* ---------- Cartes (Leaflet) : réglages communs, fond OpenStreetMap ---------- */
  var LIMITES_COMMUNE = [[45.25592, 2.766644], [45.301366, 2.852255]];   /* emprise de la commune (geo.api.gouv.fr) */
  function creerCarte(conteneur, reglages) {
    var L = window.L;
    conteneur.textContent = '';
    var carte = L.map(conteneur, Object.assign({ zoomControl: false, attributionControl: false, scrollWheelZoom: false,
      minZoom: 6, maxZoom: 18, zoomSnap: 0.5, keyboardPanDelta: 120 }, reglages || {}));
    L.control.zoom({ position: 'topright', zoomInTitle: texte('carte_zoom_plus'), zoomOutTitle: texte('carte_zoom_moins') }).addTo(carte);
    L.control.attribution({ prefix: '<a href="https://leafletjs.com" hreflang="en">Leaflet</a>' }).addTo(carte);
    L.control.scale({ imperial: false, maxWidth: 110 }).addTo(carte);
    ['overlayPane', 'markerPane', 'shadowPane', 'tooltipPane', 'popupPane'].forEach(function (nom) {
      var pane = carte.getPane(nom);
      if (pane) { pane.setAttribute('aria-hidden', 'true'); }
    });
    /* Molette : zoom seulement après un clic sur la carte, pour ne pas gêner le défilement de la page */
    carte.on('click focus', function () { carte.scrollWheelZoom.enable(); });
    carte.on('blur mouseout', function () { carte.scrollWheelZoom.disable(); });
    return carte;
  }
  function fondOSM() {
    return window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: texte('osm_html') });
  }
  function repereVillage(carte) {
    return window.L.marker(VILLAGE, { icon: window.L.divIcon({ className: 'rando-repere', html: '<span>Saint-Bonnet-de-Condat</span>', iconSize: null }),
      interactive: false, keyboard: false }).addTo(carte);
  }
  function messageCarte(conteneur, t) {
    conteneur.textContent = '';
    conteneur.appendChild(creer('p', { 'class': 'note rando-carte-attente' }, t));
  }

  /* Nombres, unités, heures et dates dans la langue de la page */
  function nombre(x, decimales) {
    var d = decimales || 0;
    var s = (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
    if (/^-0(\.0+)?$/.test(s)) { s = s.slice(1); }
    if (d && /\.0+$/.test(s)) { s = s.replace(/\.0+$/, ''); }
    return LANGUE === 'en' ? s : s.replace('.', ',');
  }
  function degres(x) { return x === null || x === undefined ? '–' : nombre(x) + ESP + '°C'; }
  function kmh(x) { return x === null || x === undefined ? '–' : nombre(x) + ESP + 'km/h'; }
  function mm(x) { return x === null || x === undefined ? '–' : nombre(x, 1) + ESP + 'mm'; }
  function pourcent(x) { return x === null || x === undefined ? '–' : nombre(x) + (LANGUE === 'fr' ? ESP + '%' : '%'); }
  function heure(iso) {                                  /* « 2026-10-27T15:15 » (heure de Paris) */
    var m = /T(\d{2}):(\d{2})/.exec(iso || '');
    if (!m) { return ''; }
    var h = parseInt(m[1], 10);
    if (LANGUE === 'fr') { return m[2] === '00' ? h + ESP + 'h' : h + ESP + 'h' + ESP + m[2]; }
    if (LANGUE === 'nl') { return h + '.' + m[2] + ESP + 'uur'; }
    return m[1] + ':' + m[2];
  }
  function dateParis(date) {                             /* AAAA-MM-JJ à Paris */
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }
  function heureParis(date) {
    return 'T' + new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  }
  function enDate(jour) { var p = jour.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  function ecartJours(jour) { return Math.round((enDate(jour) - enDate(dateParis(new Date()))) / 86400000); }
  function nomJour(jour) {
    var ecart = ecartJours(jour);
    if (ecart === 0) { return texte('meteo_aujourdhui'); }
    if (ecart === 1) { return texte('meteo_demain'); }
    var s = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(enDate(jour));
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function dateCourte(date) {
    return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(date);
  }

  /* ---------- Météo : Open-Meteo, modèles de Météo-France ---------- */
  var NUAGE = 'M7 15h10.5a3.6 3.6 0 0 0 .5-7.2 5.5 5.5 0 0 0-10.6 1.4A3 3 0 0 0 7 15z';
  var ICONES = {
    soleil: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
    lune: '<path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z"/>',
    eclaircie: '<path d="M8.6 2.8v1.5M3.4 8h1.5M4.9 4.3l1 1M12.3 4.3l-1 1"/><path d="M5.8 10.6a3.4 3.4 0 1 1 5.9-3.1"/><path d="M8.6 20.5h9a3.6 3.6 0 0 0 .4-7.2 5.2 5.2 0 0 0-10 1.3 3 3 0 0 0 .6 5.9z"/>',
    nuage: '<path d="M7 19h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.6 1.6A3.3 3.3 0 0 0 7 19z"/>',
    brouillard: '<path d="' + NUAGE + '"/><path d="M4 18.5h16M6 21.5h12"/>',
    bruine: '<path d="' + NUAGE + '"/><path d="M8.5 18.5v.5M12.5 19v.5M16.5 18.5v.5M10.5 21.5v.5M14.5 21.5v.5"/>',
    pluie: '<path d="' + NUAGE + '"/><path d="M8.8 18l-1.1 3M12.8 18l-1.1 3M16.8 18l-1.1 3"/>',
    neige: '<path d="' + NUAGE + '"/><path d="M8.5 18.8v2.4M7.3 20h2.4M15.5 18.8v2.4M14.3 20h2.4M12 20.6v1.6"/>',
    orage: '<path d="' + NUAGE + '"/><path d="M12.8 15.5l-2.3 3.4h3l-2.3 3.4"/>'
  };
  function svgIcone(nom) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONES[nom] || ICONES.nuage) + '</svg>';
  }
  function icone(nom) {
    var cadre = creer('span', { 'class': 'meteo-icone' });
    cadre.innerHTML = svgIcone(nom);
    return cadre;
  }
  function typeTemps(code, jour) {
    if (code === 0) { return jour === 0 ? 'lune' : 'soleil'; }
    if (code === 1 || code === 2) { return jour === 0 ? 'nuage' : 'eclaircie'; }
    if (code === 45 || code === 48) { return 'brouillard'; }
    if (code >= 51 && code <= 57) { return 'bruine'; }
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) { return 'pluie'; }
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) { return 'neige'; }
    if (code >= 95) { return 'orage'; }
    return 'nuage';
  }
  function libelleTemps(code) { return (texte('codes') || {})[String(code)] || ''; }
  function direction(degres) {
    var liste = texte('directions') || [];
    return degres === null || degres === undefined ? '' : (liste[Math.round(degres / 45) % 8] || '');
  }
  function urlMeteo(lat, lon, jours) {
    return 'https://api.open-meteo.com/v1/meteofrance?latitude=' + lat.toFixed(4) + '&longitude=' + lon.toFixed(4) +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset' +
      '&timezone=Europe%2FParis&forecast_days=' + jours;
  }
  function detail(dl, terme, valeur) {
    if (!valeur) { return; }
    dl.appendChild(creer('div', null, [creer('dt', null, terme), creer('dd', null, valeur)]));
  }
  function listeJours(u, combien) {
    var ul = creer('ul', { 'class': 'meteo-jours' });
    var aujourdhui = dateParis(new Date());
    var n = 0;
    for (var i = 0; i < (u.time || []).length && n < combien; i++) {
      if (u.time[i] < aujourdhui || u.weather_code[i] === null || u.weather_code[i] === undefined ||
          u.temperature_2m_max[i] === null || u.temperature_2m_min[i] === null) { continue; }
      n++;
      ul.appendChild(creer('li', null, [
        creer('p', { 'class': 'meteo-jour' }, nomJour(u.time[i])),
        creer('p', { 'class': 'meteo-ciel' }, [icone(typeTemps(u.weather_code[i], 1)), creer('span', null, libelleTemps(u.weather_code[i]))]),
        creer('p', { 'class': 'meteo-minmax' }, remplir(texte('meteo_min_max'), { min: degres(u.temperature_2m_min[i]), max: degres(u.temperature_2m_max[i]) })),
        creer('p', { 'class': 'note' }, remplir(texte('meteo_pluie_vent'), {
          pluie: mm(u.precipitation_sum[i]), vent: kmh(u.wind_speed_10m_max[i]), rafales: kmh((u.wind_gusts_10m_max || [])[i]) }))
      ]));
    }
    return ul;
  }
  function afficherMeteo(zone, d) {
    var c = d.current || {}, u = d.daily || {};
    var dl = creer('dl', { 'class': 'meteo-details' });
    detail(dl, texte('meteo_ressenti'), degres(c.apparent_temperature));
    detail(dl, texte('meteo_vent'), remplir(texte('meteo_vent_valeur'), { vitesse: kmh(c.wind_speed_10m), direction: direction(c.wind_direction_10m), rafales: kmh(c.wind_gusts_10m) }));
    detail(dl, texte('meteo_precipitations'), mm(c.precipitation));
    detail(dl, texte('meteo_humidite'), pourcent(c.relative_humidity_2m));
    var i = (u.time || []).indexOf(dateParis(new Date()));
    if (i >= 0 && u.sunrise && u.sunset) {
      detail(dl, texte('meteo_soleil'), remplir(texte('meteo_soleil_valeur'), { lever: heure(u.sunrise[i]), coucher: heure(u.sunset[i]) }));
    }
    zone.textContent = '';
    zone.appendChild(creer('h4', null, texte('meteo_maintenant')));
    zone.appendChild(creer('div', { 'class': 'meteo-actuel' }, [
      icone(typeTemps(c.weather_code, c.is_day)),
      creer('p', { 'class': 'meteo-temperature' }, [creer('span', { 'class': 'meteo-valeur' }, degres(c.temperature_2m)), ' ', creer('span', { 'class': 'meteo-libelle' }, libelleTemps(c.weather_code))])
    ]));
    zone.appendChild(dl);
    zone.appendChild(creer('p', { 'class': 'note' }, remplir(texte('meteo_estimation'), { heure: heure(c.time) })));
    zone.appendChild(creer('h4', null, texte('meteo_jours')));
    zone.appendChild(listeJours(u, 4));
  }
  function initMeteo() {
    var zone = document.querySelector('[data-meteo]');
    if (!zone) { return; }
    chargerJSON(urlMeteo(VILLAGE[0], VILLAGE[1], 5))
      .then(function (d) { afficherMeteo(zone, d); })
      .catch(function () { zone.textContent = ''; zone.appendChild(creer('p', { 'class': 'note' }, texte('meteo_erreur'))); })
      .then(function () { zone.removeAttribute('aria-busy'); });
  }

  /* ---------- Carte météo : modèles de Météo-France pour les communes voisines (indice UV : modèle GFS) ---------- */
  var HORAIRES_METEO = 'weather_code,temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day';
  function urlLieux(lieux, horaires, api) {
    return 'https://api.open-meteo.com/v1/' + (api || 'meteofrance') +
      '?latitude=' + lieux.map(function (l) { return l.lat.toFixed(4); }).join(',') +
      '&longitude=' + lieux.map(function (l) { return l.lon.toFixed(4); }).join(',') +
      '&hourly=' + horaires + '&timezone=Europe%2FParis&forecast_days=4';
  }
  function niveauUV(x) { return x <= 2 ? 0 : x <= 5 ? 1 : x <= 7 ? 2 : x <= 10 ? 3 : 4; }   /* échelle de l'OMS */
  function heureParisNombre() {
    return parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' }).format(new Date()), 10);
  }
  function nomJourCourt(jour) {
    var ecart = ecartJours(jour);
    if (ecart === 0) { return texte('meteo_aujourdhui'); }
    if (ecart === 1) { return texte('meteo_demain'); }
    var s = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', timeZone: 'Europe/Paris' }).format(enDate(jour));
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function deuxPoints() { return LANGUE === 'fr' ? ESP + ': ' : ': '; }

  function initCarteMeteo() {
    var bloc = document.querySelector('[data-carte-meteo]');
    if (!bloc) { return; }
    var form = bloc.querySelector('[data-cm-commandes]');
    var conteneur = document.getElementById('carte-meteo');
    var select = form.querySelector('select');
    var zoneJours = form.querySelector('[data-cm-jours]');
    var detail = bloc.querySelector('[data-cm-detail]');
    var tableau = bloc.querySelector('[data-cm-tableau]');
    var verifierTableau = tableau ? zoneDefilante(tableau) : function () {};
    var legende = bloc.querySelector('[data-cm-legende]');
    var message = bloc.querySelector('[data-cm-message]');
    var sourceUV = bloc.querySelector('[data-cm-source-uv]');
    var moments = texte('cm_moments') || [];
    var lieux = [].slice.call(select.options).map(function (o, i) {
      return { i: i, nom: o.textContent.trim(), lat: parseFloat(o.getAttribute('data-lat')), lon: parseFloat(o.getAttribute('data-lon')) };
    });
    var etat = { jour: null, heure: null, couche: 'temps', lieu: 0 };
    var donnees = null, uv = null, chargementUV = null, carte = null, marqueurs = [], point = null, reperePoint = null;

    function indiceHeure(h, jour, heureH) { return (h.time || []).indexOf(jour + 'T' + String(heureH).padStart(2, '0') + ':00'); }
    function valeurs(h, k) {
      return { code: h.weather_code[k], temp: h.temperature_2m[k], vent: h.wind_speed_10m[k], dir: h.wind_direction_10m[k],
        rafales: h.wind_gusts_10m[k], jour: h.is_day[k] };
    }
    function libelleMoment(heureH, court) {
      var m = moments.filter(function (x) { return Number(x.heure) === Number(heureH); })[0];
      return m ? (court ? m.court : m.nom) : '';
    }
    function texteVent(v) {
      if (v.vent === null || v.vent === undefined) { return '–'; }
      return remplir(texte('meteo_vent_valeur'), { vitesse: kmh(v.vent), direction: direction(v.dir), rafales: kmh(v.rafales) });
    }
    function valeurUV(i, k) {
      if (!uv || !uv[i] || k < 0) { return null; }
      var x = (uv[i].hourly || {}).uv_index;
      x = x ? x[k] : null;
      return x === null || x === undefined ? null : Math.round(x);
    }
    function texteUV(x) { return x === null ? '–' : x + ' (' + ((texte('cm_uv_niveaux') || [])[niveauUV(x)] || '') + ')'; }
    function coordonneesPoint(lat, lon) {
      return nombre(lat, 2) + ' N, ' + nombre(lon, 2) + (LANGUE === 'nl' ? ' O' : ' E');
    }

    /* Marqueurs (texte court sur la carte ; le détail et le tableau donnent les mêmes valeurs en clair) */
    function htmlMarque(i, k) {
      var h = donnees[i].hourly, v = valeurs(h, k);
      var classe = 'cm-marque' + (i === etat.lieu && !point ? ' cm-marque--choisie' : '');
      if (k < 0 || v.temp === null || v.temp === undefined) { return '<span class="' + classe + '"><span>–</span></span>'; }
      if (etat.couche === 'vent') {
        var rotation = Math.round(((v.dir || 0) + 180) % 360);
        return '<span class="' + classe + ' cm-marque--vent"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" style="transform:rotate(' + rotation +
          'deg)"><path d="M12 2.5l6.5 10H14v9h-4v-9H5.5z" fill="currentColor"/></svg><span>' + Math.round(v.vent) + '</span></span>';
      }
      if (etat.couche === 'uv') {
        var x = valeurUV(i, k);
        return x === null ? '<span class="' + classe + ' cm-marque--uv"><span>–</span></span>' :
          '<span class="' + classe + ' cm-marque--uv cm-uv-' + niveauUV(x) + '"><span>' + x + '</span></span>';
      }
      return '<span class="' + classe + '">' + svgIcone(typeTemps(v.code, v.jour)) + '<span>' + Math.round(v.temp) + '°</span></span>';
    }
    function eviterChevauchements() {             /* un lieu qui en recouvre un autre, plus important, attend le zoom */
      if (!carte) { return; }
      var boites = [];
      lieux.slice().sort(function (a, b) { return (b.i === etat.lieu) - (a.i === etat.lieu) || a.i - b.i; }).forEach(function (l) {
        var m = marqueurs[l.i], el = m && m.getElement(), contenu = el && el.firstElementChild;
        if (!contenu) { return; }
        var p = carte.latLngToContainerPoint(m.getLatLng()), w = contenu.offsetWidth / 2 + 3, hh = contenu.offsetHeight / 2 + 3;
        var b = [p.x - w, p.y - hh, p.x + w, p.y + hh];
        var cache = boites.some(function (c) { return b[0] < c[2] && b[2] > c[0] && b[1] < c[3] && b[3] > c[1]; });
        el.classList.toggle('cm-masque', cache);
        if (!cache) { boites.push(b); }
      });
    }
    function rendreMarques() {
      var L = window.L;
      lieux.forEach(function (l) {
        var k = indiceHeure(donnees[l.i].hourly, etat.jour, etat.heure);
        marqueurs[l.i].setIcon(L.divIcon({ className: 'cm-icone', html: htmlMarque(l.i, k), iconSize: null }));
      });
      eviterChevauchements();
    }
    function afficherDetail() {
      var h, titreLieu, iUV = null;
      if (point) {
        if (!point.donnees) { return; }
        h = point.donnees.hourly;
        titreLieu = remplir(texte('cm_point'), { coordonnees: coordonneesPoint(point.lat, point.lon), altitude: nombre(point.donnees.elevation || 0) + ESP + 'm' });
      } else {
        h = donnees[etat.lieu].hourly;
        titreLieu = lieux[etat.lieu].nom;
        iUV = etat.lieu;
      }
      detail.textContent = '';
      detail.appendChild(creer('h4', { 'class': 'cm-detail-titre' }, remplir(texte('cm_detail_titre'), { lieu: titreLieu, jour: nomJour(etat.jour) })));
      var ul = creer('ul', { 'class': 'cm-moments' });
      moments.forEach(function (m) {
        var k = indiceHeure(h, etat.jour, m.heure);
        if (k < 0) { return; }
        var v = valeurs(h, k), x = iUV === null ? null : valeurUV(iUV, k);
        var elements = [
          creer('p', { 'class': 'cm-moment' }, m.nom),
          creer('p', { 'class': 'meteo-ciel' }, [icone(typeTemps(v.code, v.jour)), creer('span', null, libelleTemps(v.code))]),
          creer('p', { 'class': 'meteo-minmax' }, degres(v.temp)),
          creer('p', { 'class': 'note' }, texte('meteo_vent') + deuxPoints() + texteVent(v))
        ];
        if (x !== null) { elements.push(creer('p', { 'class': 'note' }, texte('cm_uv') + deuxPoints() + texteUV(x))); }
        ul.appendChild(creer('li', { 'class': Number(m.heure) === Number(etat.heure) ? 'cm-moment-choisi' : null }, elements));
      });
      detail.appendChild(ul);
    }
    function afficherTableau() {
      var avecUV = !!uv, table = creer('table', { 'class': 'cm-table' });
      table.appendChild(creer('caption', null, remplir(texte('cm_tableau_titre'), { jour: nomJour(etat.jour), moment: libelleMoment(etat.heure, true) })));
      var entetes = [texte('cm_col_lieu'), texte('cm_col_temps'), texte('cm_col_temperature'), texte('cm_col_vent')].concat(avecUV ? [texte('cm_col_uv')] : []);
      table.appendChild(creer('thead', null, creer('tr', null, entetes.map(function (t) { return creer('th', { scope: 'col' }, t); }))));
      var corps = creer('tbody');
      lieux.forEach(function (l) {
        var h = donnees[l.i].hourly, k = indiceHeure(h, etat.jour, etat.heure);
        if (k < 0) { return; }
        var v = valeurs(h, k);
        var cellules = [creer('th', { scope: 'row' }, l.nom), creer('td', null, libelleTemps(v.code) || '–'), creer('td', null, degres(v.temp)), creer('td', null, texteVent(v))];
        if (avecUV) { cellules.push(creer('td', null, texteUV(valeurUV(l.i, k)))); }
        corps.appendChild(creer('tr', null, cellules));
      });
      table.appendChild(corps);
      tableau.textContent = '';
      tableau.appendChild(table);
      verifierTableau();
    }
    function rendreTout() { rendreMarques(); afficherDetail(); afficherTableau(); }

    function choisirLieu(i, depuisCarte) {
      etat.lieu = i;
      point = null;
      if (reperePoint) { carte.removeLayer(reperePoint); reperePoint = null; }
      select.value = String(i);
      if (!depuisCarte) { carte.panTo([lieux[i].lat, lieux[i].lon], { animate: !MOUVEMENT_REDUIT }); }
      rendreMarques();
      afficherDetail();
    }
    function prevoirPoint(ll) {                     /* clic n'importe où sur la carte */
      var L = window.L, demande = { lat: ll.lat, lon: ll.lng, donnees: null };
      point = demande;
      if (reperePoint) { carte.removeLayer(reperePoint); }
      reperePoint = L.circleMarker(ll, { radius: 7, color: '#FFFFFF', weight: 3, fillColor: '#1E2B5E', fillOpacity: 1, interactive: false }).addTo(carte);
      rendreMarques();
      detail.textContent = '';
      detail.appendChild(creer('p', { 'class': 'note' }, texte('cm_point_chargement')));
      chargerJSON(urlLieux([demande], HORAIRES_METEO), 15000).then(function (d) {
        if (point !== demande) { return; }
        demande.donnees = Array.isArray(d) ? d[0] : d;
        afficherDetail();
      }).catch(function () {
        if (point !== demande) { return; }
        detail.textContent = '';
        detail.appendChild(creer('p', { 'class': 'note' }, texte('cm_point_erreur')));
      });
    }
    function chargerUV() {
      if (uv || chargementUV) { return; }
      chargementUV = chargerJSON(urlLieux(lieux, 'uv_index', 'forecast') + '&models=gfs_seamless', 20000).then(function (d) {
        uv = [].concat(d);
        if (sourceUV) { sourceUV.hidden = false; }
        rendreTout();
      }).catch(function () {
        chargementUV = null;
        if (message) { message.textContent = texte('cm_uv_erreur'); }
      });
    }
    function preparerJours() {
      var h = donnees[0].hourly, aujourdhui = dateParis(new Date()), jours = [];
      (h.time || []).forEach(function (t) { var j = t.slice(0, 10); if (j >= aujourdhui && jours.indexOf(j) < 0) { jours.push(j); } });
      jours = jours.filter(function (j) {
        return moments.some(function (m) { var k = indiceHeure(h, j, m.heure); return k >= 0 && h.weather_code[k] !== null && h.temperature_2m[k] !== null; });
      }).slice(0, 4);
      zoneJours.textContent = '';
      jours.forEach(function (j) {
        zoneJours.appendChild(creer('label', null, [creer('input', { type: 'radio', name: 'cm-jour', value: j }), creer('span', null, nomJourCourt(j))]));
      });
      return jours;
    }
    function echec() {
      messageCarte(conteneur, texte('cm_erreur'));
      form.hidden = true;
      [].slice.call(bloc.querySelectorAll('[data-cm-legende], .cm-aide, .cm-tableau')).forEach(function (e) { e.hidden = true; });
    }

    quandVisible(bloc, function () {
      var L = window.L;
      if (!L) { echec(); return; }
      chargerJSON(urlLieux(lieux, HORAIRES_METEO), 20000).then(function (d) {
        donnees = [].concat(d);
        if (donnees.length !== lieux.length || !donnees[0].hourly) { throw new Error('réponse incomplète'); }
        var jours = preparerJours();
        if (!jours.length) { throw new Error('prévision absente'); }
        etat.jour = jours[0];
        etat.heure = Number((moments[Math.min(moments.length - 1, Math.floor(heureParisNombre() / 6))] || moments[0]).heure);
        cocher(form, 'cm-jour', etat.jour);
        cocher(form, 'cm-moment', etat.heure);
        carte = creerCarte(conteneur, { center: [lieux[0].lat, lieux[0].lon], zoom: 11 });
        fondOSM().addTo(carte);
        marqueurs = lieux.map(function (l) {
          var m = L.marker([l.lat, l.lon], { icon: L.divIcon({ className: 'cm-icone', html: '', iconSize: null }), keyboard: false, title: l.nom, riseOnHover: true });
          m.on('click', function () { choisirLieu(l.i, true); });
          return m.addTo(carte);
        });
        carte.on('zoomend', eviterChevauchements);
        carte.on('click', function (e) { prevoirPoint(e.latlng); });
        /* Au clavier : Entrée (ou Espace) sur la carte donne la prévision du centre de la carte (repère visible au focus) */
        carte.on('keydown', function (e) {
          var ev = e.originalEvent || {};
          if (ev.target !== conteneur || (ev.key !== 'Enter' && ev.key !== ' ')) { return; }
          if (ev.preventDefault) { ev.preventDefault(); }
          prevoirPoint(carte.getCenter());
        });
        form.addEventListener('submit', function (e) { e.preventDefault(); });
        form.addEventListener('change', function (e) {
          var nom = e.target.name;
          if (nom === 'cm-lieu') { choisirLieu(Number(e.target.value), false); return; }
          if (nom === 'cm-jour') { etat.jour = e.target.value; }
          if (nom === 'cm-moment') { etat.heure = Number(e.target.value); }
          if (nom === 'cm-couche') {
            etat.couche = e.target.value;
            if (legende) { legende.textContent = texte('cm_legende_' + etat.couche); }
            if (etat.couche === 'uv') { chargerUV(); }
          }
          rendreTout();
        });
        rendreTout();
      }).catch(echec);
    });
  }

  /* ---------- Qualité de l'air : indice ATMO d'Atmo Auvergne-Rhône-Alpes (commune 15173) ---------- */
  var AIR_URL = 'https://sig.atmo-auvergnerhonealpes.fr/geoserver/ind_aura/wfs?service=WFS&version=2.0.0&request=GetFeature' +
    '&typeNames=ind_aura:agol_indices_2021_7J&outputFormat=application/json&srsName=EPSG:4326' +
    '&bbox=45.275,2.783,45.283,2.793,urn:ogc:def:crs:EPSG::4326' +
    '&propertyName=date_ech,code_qual,lib_qual,coul_qual,date_dif,code_zone';
  function afficherAir(zone, d) {
    var parJour = {};
    (d.features || []).forEach(function (f) {
      var p = f.properties || {};
      if (p.code_zone !== '15173' || !p.date_ech) { return; }
      var jour = p.date_ech.slice(0, 10);
      if (!parJour[jour] || (p.date_dif || '') > (parJour[jour].date_dif || '')) { parJour[jour] = p; }
    });
    var aujourdhui = dateParis(new Date());
    var jours = Object.keys(parJour).filter(function (j) { return j >= aujourdhui; }).sort().slice(0, 3);
    if (!jours.length) { throw new Error('indice absent'); }
    var niveaux = texte('air_niveaux') || {};
    var ul = creer('ul', { 'class': 'air-jours' });
    var publication = '';
    jours.forEach(function (jour) {
      var p = parJour[jour], code = Number(p.code_qual);
      if ((p.date_dif || '') > publication) { publication = p.date_dif; }
      var niveau = creer('p', { 'class': 'air-niveau' }, [
        creer('span', { 'class': 'air-pastille', 'aria-hidden': 'true', style: /^#[0-9a-f]{6}$/i.test(p.coul_qual || '') ? 'background-color:' + p.coul_qual : null }),
        creer('strong', null, niveaux[String(code)] || p.lib_qual || ''),
        code >= 1 && code <= 6 ? ' (' + remplir(texte('air_niveau_sur'), { n: code }) + ')' : ''
      ]);
      ul.appendChild(creer('li', null, [creer('p', { 'class': 'air-date' }, nomJour(jour)), niveau]));
    });
    zone.textContent = '';
    zone.appendChild(ul);
    if (publication) {
      var date = new Date(publication);
      zone.appendChild(creer('p', { 'class': 'note' }, remplir(texte('air_publie'), { date: dateCourte(date), heure: heure(heureParis(date)) })));
    }
  }
  function initAir() {
    var zone = document.querySelector('[data-air]');
    if (!zone) { return; }
    chargerJSON(AIR_URL, 20000)
      .then(function (d) { afficherAir(zone, d); })
      .catch(function () { zone.textContent = ''; zone.appendChild(creer('p', { 'class': 'note' }, texte('air_erreur'))); })
      .then(function () { zone.removeAttribute('aria-busy'); });
  }

  /* ---------- Carte de la qualité de l'air : couches de prévision d'Atmo Auvergne-Rhône-Alpes ----------
     « jp0 » = aujourd'hui, « jp1 » = demain, comme sur le site d'Atmo ; indice ATMO (style max_atmo) ou un polluant. */
  function urlAtmo(jour, polluant) {
    var couche = polluant === 'multi' ? ['atmo_aura_jp' + jour, 'max_atmo'] : [polluant + 'hd_aura_jp' + jour, polluant + '_atmo'];
    return 'https://sig.atmo-auvergnerhonealpes.fr/geoserver/gwc/service/wmts/rest/aura:' + couche[0] + '/' + couche[1] +
      '/EPSG:900913/EPSG:900913:{z}/{y}/{x}?format=image/png';
  }
  function initCarteAir() {
    var bloc = document.querySelector('[data-carte-air]');
    if (!bloc) { return; }
    var form = bloc.querySelector('[data-ca-commandes]');
    var conteneur = document.getElementById('carte-air');
    var message = bloc.querySelector('[data-ca-message]');
    quandVisible(bloc, function () {
      var L = window.L;
      if (!L) { messageCarte(conteneur, texte('ca_erreur')); form.hidden = true; return; }
      var carte = creerCarte(conteneur, { center: VILLAGE, zoom: 11 }), couche = null, signale = false;
      fondOSM().addTo(carte);
      repereVillage(carte);
      function afficher() {
        var jour = (form.querySelector('[name="ca-jour"]:checked') || {}).value || '0';
        var polluant = (form.querySelector('[name="ca-polluant"]:checked') || {}).value || 'multi';
        if (couche) { carte.removeLayer(couche); }
        couche = L.tileLayer(urlAtmo(jour, polluant), { opacity: 0.7, maxZoom: 18, maxNativeZoom: 14, attribution: texte('ca_attribution_html') });
        couche.on('tileerror', function () { if (!signale && message) { signale = true; message.textContent = texte('ca_erreur'); } });
        couche.on('tileload', function () { if (signale && message) { signale = false; message.textContent = ''; } });
        couche.addTo(carte);
      }
      form.addEventListener('submit', function (e) { e.preventDefault(); });
      form.addEventListener('change', afficher);
      afficher();
    });
  }

  /* ---------- Randonnées : filtres, tri et carte ---------- */
  var COULEUR = '#A1186A';
  var COULEUR_CHOIX = '#6E0F49';

  function decoder(chaine) {                              /* tracé encodé (« polyline », précision 5) */
    var points = [], i = 0, lat = 0, lon = 0;
    function valeur() {
      var b, decalage = 0, resultat = 0;
      do { b = chaine.charCodeAt(i++) - 63; resultat |= (b & 0x1f) << decalage; decalage += 5; } while (b >= 0x20);
      return (resultat & 1) ? ~(resultat >> 1) : (resultat >> 1);
    }
    while (i < chaine.length) { lat += valeur(); lon += valeur(); points.push([lat / 1e5, lon / 1e5]); }
    return points;
  }
  function kilometres(a, b) {
    var rad = Math.PI / 180, dlat = (b[0] - a[0]) * rad, dlon = (b[1] - a[1]) * rad;
    var s = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.pow(Math.sin(dlon / 2), 2);
    return 12742.0176 * Math.asin(Math.sqrt(s));
  }

  function initRandonnees() {
    var racine = document.querySelector('[data-rando]');
    var formulaire = document.querySelector('[data-rando-filtres]');
    if (!racine || !formulaire) { return; }
    var liste = racine.querySelector('[data-rando-liste]');
    var statut = document.querySelector('[data-rando-statut]');
    var message = racine.querySelector('[data-carte-message]');
    var panneau = racine.querySelector('[data-rando-selection]');
    var conteneurCarte = document.getElementById('rando-carte');
    var colonneCarte = racine.querySelector('.rando-carte-colonne');
    var tri = formulaire.querySelector('[name="tri"]');
    var fiches = [].slice.call(liste.querySelectorAll('.rando')).map(function (li, i) {
      var d = li.dataset;
      return {
        li: li, slug: d.slug, ordre: i, recherche: sansAccents(d.nom),
        distance: parseFloat(d.distance) || 0, duree: parseInt(d.duree, 10) || 0, jours: parseInt(d.jours, 10) || 0,
        denivele: parseInt(d.denivele, 10) || 0, difficulte: d.difficulte, chiens: d.chiens,
        famille: !!d.famille, parking: !!d.parking, commune: !!d.commune, eloignement: parseFloat(d.eloignement) || 0,
        lat: parseFloat(d.lat), lon: parseFloat(d.lon), altitude: d.altitude || '',
        titre: (li.querySelector('h3') || {}).textContent || '', couche: null
      };
    });
    var parSlug = {};
    fiches.forEach(function (f) { parSlug[f.slug] = f; });
    var position = null, carte = null, fonds = {}, choisie = null, repereVous = null;

    /* Filtres et tri */
    function criteres() {
      var v = function (nom) { var e = formulaire.elements[nom]; return e ? e.value : ''; };
      var c = function (nom) { var e = formulaire.elements[nom]; return !!(e && e.checked); };
      return { recherche: sansAccents(v('recherche')).trim(), distance: v('distance'), duree: v('duree'), difficulte: v('difficulte'),
        chiens: c('chiens'), famille: c('famille'), parking: c('parking'), commune: c('commune'), tri: v('tri') };
    }
    function dansIntervalle(valeur, intervalle) {
      var p = intervalle.split('-'), bas = parseFloat(p[0]), haut = p[1] === '' ? Infinity : parseFloat(p[1]);
      return valeur >= bas && valeur <= haut;
    }
    function correspond(f, k) {
      if (k.recherche && f.recherche.indexOf(k.recherche) === -1) { return false; }
      if (k.distance && !dansIntervalle(f.distance, k.distance)) { return false; }
      if (k.duree === 'jours' && !f.jours) { return false; }
      if (k.duree && k.duree !== 'jours' && (f.jours || !f.duree || !dansIntervalle(f.duree, k.duree))) { return false; }
      if (k.difficulte && f.difficulte !== k.difficulte) { return false; }
      if (k.chiens && f.chiens !== 'oui') { return false; }
      if (k.famille && !f.famille) { return false; }
      if (k.parking && !f.parking) { return false; }
      if (k.commune && !f.commune) { return false; }
      return true;
    }
    var ordres = {
      proches: function (a, b) { return a.eloignement - b.eloignement || a.ordre - b.ordre; },
      courtes: function (a, b) { return a.distance - b.distance || a.ordre - b.ordre; },
      longues: function (a, b) { return b.distance - a.distance || a.ordre - b.ordre; },
      denivele: function (a, b) { return a.denivele - b.denivele || a.ordre - b.ordre; },
      nom: function (a, b) { return a.titre.localeCompare(b.titre, 'fr', { sensitivity: 'base' }); },
      position: function (a, b) { return kilometres(position, [a.lat, a.lon]) - kilometres(position, [b.lat, b.lon]); }
    };
    var minuteurStatut = null;
    function appliquer(delaiAnnonce) {
      var k = criteres(), visibles = 0;
      fiches.forEach(function (f) {
        f.visible = correspond(f, k);
        f.li.hidden = !f.visible;
        if (f.visible) { visibles++; }
        if (carte && f.couche) {
          if (f.visible && !carte.hasLayer(f.couche.groupe)) { f.couche.groupe.addTo(carte); }
          if (!f.visible && carte.hasLayer(f.couche.groupe)) { carte.removeLayer(f.couche.groupe); }
        }
      });
      if (choisie && !choisie.visible) { retirer(); }
      var ordre = ordres[k.tri === 'position' && !position ? 'proches' : k.tri] || ordres.proches;
      fiches.slice().sort(ordre).forEach(function (f) { liste.appendChild(f.li); });
      var annonce = visibles === 0 ? texte('statut_aucune') : visibles === 1 ? texte('statut_une') : remplir(texte('statut_plusieurs'), { n: visibles });
      clearTimeout(minuteurStatut);
      minuteurStatut = setTimeout(function () { if (statut) { statut.textContent = annonce; } }, delaiAnnonce || 0);
    }
    formulaire.addEventListener('submit', function (e) { e.preventDefault(); });
    formulaire.addEventListener('input', function (e) { if (e.target.name === 'recherche') { appliquer(700); } });
    formulaire.addEventListener('change', function (e) { if (e.target.name !== 'recherche') { appliquer(0); } });
    formulaire.addEventListener('reset', function () { setTimeout(function () { appliquer(0); }, 0); });

    /* Panneau de la randonnée choisie */
    function panneauVide() {
      panneau.textContent = '';
      panneau.appendChild(creer('p', { 'class': 'note' }, texte('selection_aucune')));
    }
    function afficherChoix(f) {
      var chiffres = f.li.querySelector('.rando-chiffres');
      var lien = creer('a', { href: '#rando-' + f.slug }, [texte('selection_fiche'),
        creer('span', { 'class': 'visuellement-cache', lang: LANGUE !== 'fr' ? 'fr' : null }, ' – ' + f.titre)]);
      var bouton = creer('button', { type: 'button', 'class': 'bouton-discret' }, texte('selection_retirer'));
      lien.addEventListener('click', function (e) {
        e.preventDefault();
        var titre = f.li.querySelector('h3');
        defiler(f.li);
        if (titre) { titre.setAttribute('tabindex', '-1'); titre.focus({ preventScroll: true }); }
      });
      bouton.addEventListener('click', function () { retirer(); if (conteneurCarte) { conteneurCarte.focus(); } });
      panneau.textContent = '';
      panneau.appendChild(creer('p', { 'class': 'rando-selection-titre' }, [
        creer('span', { 'class': 'surtitre' }, texte('selection_titre')),
        creer('strong', { lang: LANGUE !== 'fr' ? 'fr' : null }, f.titre)
      ]));
      if (chiffres) { panneau.appendChild(chiffres.cloneNode(true)); }
      panneau.appendChild(creer('p', { 'class': 'rando-selection-actions' }, [lien, bouton]));
    }

    /* Carte (Leaflet) : fond OpenStreetMap ou photographies aériennes de l'IGN */
    function styleNormal(f, attenue) {
      if (!f || !f.couche) { return; }
      f.couche.halo.setStyle({ weight: 6, opacity: attenue ? 0.45 : 0.9 });
      f.couche.ligne.setStyle({ color: COULEUR, weight: 3.5, opacity: attenue ? 0.5 : 0.95 });
      f.couche.depart.setStyle({ radius: 5.5, fillColor: COULEUR, fillOpacity: attenue ? 0.6 : 1 });
    }
    function styleChoisi(f) {
      f.couche.halo.setStyle({ weight: 10, opacity: 1 });
      f.couche.ligne.setStyle({ color: COULEUR_CHOIX, weight: 6, opacity: 1 });
      f.couche.depart.setStyle({ radius: 8, fillColor: COULEUR_CHOIX, fillOpacity: 1 });
      f.couche.groupe.bringToFront();
    }
    function choisir(slug, options) {
      var f = parSlug[slug];
      if (!f || !carte || !f.couche) { return; }
      options = options || {};
      choisie = f;
      fiches.forEach(function (g) { if (g !== f) { styleNormal(g, true); } });
      styleChoisi(f);
      /* Carte au-dessus de la liste (petit écran, carte agrandie) : la page remonte jusqu'à la carte, qui reçoit le focus */
      if (options.defiler && colonneCarte && window.getComputedStyle(colonneCarte).position !== 'sticky') {
        defiler(colonneCarte);
        if (conteneurCarte) { conteneurCarte.focus({ preventScroll: true }); }
      }
      carte.fitBounds(f.couche.limites, { padding: [28, 28], maxZoom: 15, animate: !MOUVEMENT_REDUIT });
      afficherChoix(f);
      if (options.adresse !== false && window.history && history.replaceState) { history.replaceState(null, '', '#rando-' + slug); }
    }
    function retirer() {
      choisie = null;
      fiches.forEach(function (g) { styleNormal(g, false); });
      panneauVide();
    }
    function vueEnsemble() {
      if (!carte) { return; }
      var limites = null;
      fiches.forEach(function (f) {
        if (f.visible === false || !f.couche) { return; }
        limites = limites ? limites.extend(f.couche.limites) : window.L.latLngBounds(f.couche.limites.getSouthWest(), f.couche.limites.getNorthEast());
      });
      if (limites) { carte.fitBounds(limites, { padding: [20, 20], animate: !MOUVEMENT_REDUIT }); }
    }
    function annoncer(t) { if (message) { message.textContent = t; } }
    function echecCarte() {
      if (conteneurCarte) {
        conteneurCarte.textContent = '';
        conteneurCarte.appendChild(creer('p', { 'class': 'note rando-carte-attente' }, texte('carte_erreur')));
      }
      [].slice.call(racine.querySelectorAll('[data-voir-carte], .rando-carte-outils')).forEach(function (e) { e.hidden = true; });
    }
    function dessiner(donnees) {
      var L = window.L;
      (donnees.randonnees || []).forEach(function (t) {
        var f = parSlug[t.s];
        if (!f || !t.g || !t.g.length) { return; }
        var segments = t.g.map(decoder);
        var halo = L.polyline(segments, { color: '#FFFFFF', weight: 6, opacity: 0.9, interactive: false, lineCap: 'round', lineJoin: 'round' });
        var ligne = L.polyline(segments, { color: COULEUR, weight: 3.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round', bubblingMouseEvents: false });
        var depart = L.circleMarker([f.lat, f.lon], { radius: 5.5, color: '#FFFFFF', weight: 2, fillColor: COULEUR, fillOpacity: 1, bubblingMouseEvents: false });
        var limites = L.latLngBounds(t.b && t.b.length === 4 ? [[t.b[0], t.b[1]], [t.b[2], t.b[3]]] : ligne.getBounds()).extend([f.lat, f.lon]);
        f.couche = { groupe: L.featureGroup([halo, ligne, depart]), halo: halo, ligne: ligne, depart: depart, limites: limites };
        [ligne, depart].forEach(function (c) {
          c.on('click', function () { choisir(f.slug, {}); });
          c.on('mouseover', function () { if (choisie !== f) { ligne.setStyle({ weight: 5.5 }); } });
          c.on('mouseout', function () { if (choisie !== f) { ligne.setStyle({ weight: 3.5 }); } });
        });
        if (f.visible !== false) { f.couche.groupe.addTo(carte); }
      });
      repereVillage(carte);
      var cible = /^#rando-([a-z0-9-]+)$/.exec(location.hash || '');
      if (cible && parSlug[cible[1]]) { choisir(cible[1], { adresse: false }); }
      /* Lien interne vers une fiche (« #rando-… ») : la randonnée est aussi choisie sur la carte */
      window.addEventListener('hashchange', function () {
        var c = /^#rando-([a-z0-9-]+)$/.exec(location.hash || '');
        if (c && parSlug[c[1]] && parSlug[c[1]].visible !== false) { choisir(c[1], { adresse: false }); }
      });
    }
    function initCarte() {
      var L = window.L;
      if (!conteneurCarte || !L) { echecCarte(); return; }
      /* Vue de départ : la commune entière, comme sur OpenStreetMap ; « Vue d'ensemble » montre toutes les randonnées */
      carte = creerCarte(conteneurCarte, { minZoom: 7 });
      carte.fitBounds(LIMITES_COMMUNE, { padding: [12, 12], animate: false });
      fonds.plan = fondOSM();
      fonds.photo = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS' +
        '&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        { attribution: '© <a href="https://www.ign.fr/">IGN</a> – ' + texte('carte_photo'), maxZoom: 18 });
      fonds.plan.addTo(carte);
      var lienOSM = racine.querySelector('[data-carte-osm]');
      function majLienOSM() {
        if (!lienOSM) { return; }
        var c = carte.getCenter();
        lienOSM.href = 'https://www.openstreetmap.org/#map=' + Math.round(carte.getZoom()) + '/' + c.lat.toFixed(5) + '/' + c.lng.toFixed(5);
      }
      carte.on('moveend', majLienOSM);
      majLienOSM();
      chargerJSON(conteneurCarte.getAttribute('data-traces')).then(dessiner).catch(function () { annoncer(texte('carte_erreur')); });

      [].slice.call(racine.querySelectorAll('[name="rando-fond"]')).forEach(function (radio) {
        radio.addEventListener('change', function () {
          if (!radio.checked) { return; }
          Object.keys(fonds).forEach(function (k) { if (carte.hasLayer(fonds[k])) { carte.removeLayer(fonds[k]); } });
          fonds[radio.value].addTo(carte);
        });
      });
      var ensemble = racine.querySelector('[data-carte-ensemble]');
      if (ensemble) { ensemble.addEventListener('click', vueEnsemble); }
      var agrandir = racine.querySelector('[data-carte-agrandir]');
      if (agrandir) {
        agrandir.addEventListener('click', function () {
          var actif = agrandir.getAttribute('aria-pressed') !== 'true';
          agrandir.setAttribute('aria-pressed', String(actif));
          racine.classList.toggle('rando-explorateur--agrandi', actif);
          setTimeout(function () { carte.invalidateSize(); if (choisie) { carte.fitBounds(choisie.couche.limites, { padding: [28, 28], maxZoom: 15 }); } }, 60);
        });
      }
      var localiser = racine.querySelector('[data-carte-position]');
      if (localiser) {
        if (!navigator.geolocation) { localiser.hidden = true; }
        localiser.addEventListener('click', function () {
          annoncer(texte('position_recherche'));
          navigator.geolocation.getCurrentPosition(function (p) {
            position = [p.coords.latitude, p.coords.longitude];
            if (repereVous) { carte.removeLayer(repereVous); }
            repereVous = L.layerGroup([
              L.circle(position, { radius: Math.min(p.coords.accuracy || 0, 2000), color: '#0B5ED7', weight: 1, fillOpacity: 0.12, interactive: false }),
              L.circleMarker(position, { radius: 7, color: '#FFFFFF', weight: 3, fillColor: '#0B5ED7', fillOpacity: 1, interactive: false })
            ]).addTo(carte);
            carte.setView(position, Math.max(carte.getZoom(), 12), { animate: !MOUVEMENT_REDUIT });
            if (tri && !tri.querySelector('option[value="position"]')) {
              tri.appendChild(creer('option', { value: 'position' }, texte('tri_position')));
            }
            if (tri) { tri.value = 'position'; }
            appliquer(0);
            annoncer(texte('position_trouvee'));
          }, function () { annoncer(texte('position_erreur')); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
        });
      }
    }

    [].slice.call(liste.querySelectorAll('[data-voir-carte]')).forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        var li = bouton.closest('.rando');
        if (li) { choisir(li.dataset.slug, { defiler: true }); }
      });
    });

    /* Météo au départ d'une randonnée (à la demande) */
    [].slice.call(liste.querySelectorAll('[data-rando-meteo]')).forEach(function (bloc) {
      var bouton = bloc.querySelector('button'), zone = bloc.querySelector('[data-rando-meteo-contenu]');
      bouton.addEventListener('click', function () {
        var f = parSlug[(bloc.closest('.rando') || {}).dataset.slug];
        if (!f) { return; }
        bouton.disabled = true;
        zone.textContent = texte('meteo_depart_chargement');
        chargerJSON(urlMeteo(f.lat, f.lon, 3)).then(function (d) {
          var jours = listeJours(d.daily || {}, 3);
          if (!jours.children.length) { throw new Error('prévision absente'); }
          var titre = creer('p', { 'class': 'rando-meteo-titre', tabindex: '-1' },
            f.altitude ? remplir(texte('meteo_depart_titre'), { altitude: f.altitude }) : texte('meteo_depart'));
          zone.textContent = '';
          zone.appendChild(titre);
          zone.appendChild(jours);
          bouton.hidden = true;
          titre.focus();
        }).catch(function () {
          zone.textContent = texte('meteo_erreur');
          bouton.disabled = false;
        });
      });
    });

    appliquer(0);
    panneauVide();
    initCarte();
  }

  initMeteo();
  initAir();
  initCarteMeteo();
  initCarteAir();
  initRandonnees();
}());
