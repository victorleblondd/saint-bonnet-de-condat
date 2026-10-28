/* Randonnées de la page Tourisme : extraction des données de l'office de tourisme Destination Haut Cantal.

   À lancer dans la console du navigateur, sur la page de l'office de tourisme
   https://www.destinationhautcantal.fr/jy-suis/activites-de-pleine-nature/randonnees/
   (son widget Apidae n'est lisible que depuis son site : il refuse les autres adresses).

   Le script lit les 42 itinéraires du widget (fiches Apidae de l'office de tourisme), les fichiers GPX
   de chaque itinéraire, la liste des randonnées du Parc naturel régional des Volcans d'Auvergne (pour son
   niveau de difficulté) et le contour de la commune. Il ne modifie rien : le résultat est rangé dans
   window.extraitRandonnees, puis enregistré dans le dépôt sous
   outils/randonnees/source/destination-haut-cantal-AAAA-MM-JJ.json ;
   python3 outils/randonnees/generer.py fabrique ensuite les fichiers du site.

   extraireRandonnees().then(r => console.log(r.resume)) ; telechargerExtrait() enregistre le fichier. */
(function () {
  'use strict';
  var WIDGET = 246, SELECTION = 139716, INSEE = '15173';
  var CHAMPS = ['id', 'nom', 'presentation', 'localisation', 'prestations', 'ouverture', 'multimedias', 'informationsEquipement', 'informations'];
  var PARC = 'https://geotrekadmin.parcdesvolcans.fr/api/v2/trek/?language=fr&page_size=300' +
    '&fields=id,name,difficulty,duration,length_2d,ascent,departure,departure_geom,practice,published';
  var CONTOUR = 'https://geo.api.gouv.fr/communes/' + INSEE + '?fields=nom,contour&format=json';
  var TOLERANCE_M = 6;        // simplification du tracé (mètres)
  var POINTS_PROFIL = 120;    // points du profil d'altitude

  async function json(url) {
    var r = await fetch(url, { credentials: 'omit' });
    if (!r.ok) { throw new Error(url + ' : HTTP ' + r.status); }
    return r.json();
  }

  /* Garde, des éléments de référence Apidae, seulement l'identifiant et le libellé */
  function alleger(v) {
    if (Array.isArray(v)) { return v.map(alleger); }
    if (!v || typeof v !== 'object') { return v; }
    if (v.elementReferenceType) { return { type: v.elementReferenceType, id: v.id, libelleFr: v.libelleFr }; }
    var o = {};
    Object.keys(v).forEach(function (k) {
      if (/^surcharge/.test(k) || k === 'periodesOuvertures' || k === 'indicationsPeriode' || k === 'identifiantTechnique') { return; }
      o[k] = alleger(v[k]);
    });
    return o;
  }

  /* Distance en mètres entre deux points [lat, lon] */
  function distance(a, b) {
    var R = 6371008.8, rad = Math.PI / 180;
    var dLat = (b[0] - a[0]) * rad, dLon = (b[1] - a[1]) * rad;
    var s = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.pow(Math.sin(dLon / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  /* Ramer-Douglas-Peucker sur une projection locale en mètres */
  function simplifier(pts, tol) {
    if (pts.length < 3) { return pts.slice(); }
    var lat0 = pts[0][0] * Math.PI / 180, kx = 111320 * Math.cos(lat0), ky = 110540;
    var xy = pts.map(function (p) { return [p[1] * kx, p[0] * ky]; });
    var garder = new Uint8Array(pts.length); garder[0] = 1; garder[pts.length - 1] = 1;
    var pile = [[0, pts.length - 1]];
    while (pile.length) {
      var seg = pile.pop(), i0 = seg[0], i1 = seg[1], dmax = 0, imax = -1;
      var ax = xy[i0][0], ay = xy[i0][1], bx = xy[i1][0], by = xy[i1][1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      for (var i = i0 + 1; i < i1; i++) {
        var px = xy[i][0], py = xy[i][1], t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
        t = Math.max(0, Math.min(1, t));
        var ex = ax + t * dx - px, ey = ay + t * dy - py, d = Math.sqrt(ex * ex + ey * ey);
        if (d > dmax) { dmax = d; imax = i; }
      }
      if (dmax > tol && imax > 0) { garder[imax] = 1; pile.push([i0, imax], [imax, i1]); }
    }
    return pts.filter(function (p, i) { return garder[i]; });
  }

  /* Encodage « polyline » (précision 5, environ 1 m) */
  function encoder(pts) {
    var sortie = '', plat = 0, plon = 0;
    function valeur(v) {
      v = v < 0 ? ~(v << 1) : (v << 1);
      var s = '';
      while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
      return s + String.fromCharCode(v + 63);
    }
    pts.forEach(function (p) {
      var lat = Math.round(p[0] * 1e5), lon = Math.round(p[1] * 1e5);
      sortie += valeur(lat - plat) + valeur(lon - plon); plat = lat; plon = lon;
    });
    return sortie;
  }

  function dansAnneau(p, anneau) {
    var x = p[1], y = p[0], dedans = false;
    for (var i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
      var xi = anneau[i][0], yi = anneau[i][1], xj = anneau[j][0], yj = anneau[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) { dedans = !dedans; }
    }
    return dedans;
  }
  function dansCommune(p, contour) {
    var polys = contour.type === 'Polygon' ? [contour.coordinates] : contour.coordinates;
    return polys.some(function (poly) { return dansAnneau(p, poly[0]) && !poly.slice(1).some(function (trou) { return dansAnneau(p, trou); }); });
  }

  async function lireTrace(url, contour) {
    var texte = await (await fetch(url, { credentials: 'omit' })).text();
    var xml = new DOMParser().parseFromString(texte, 'application/xml');
    var segments = [];
    xml.querySelectorAll('trkseg').forEach(function (seg) {
      var pts = Array.prototype.map.call(seg.querySelectorAll('trkpt'), function (p) {
        var e = p.querySelector('ele');
        return [parseFloat(p.getAttribute('lat')), parseFloat(p.getAttribute('lon')), e ? parseFloat(e.textContent) : null];
      });
      if (pts.length) { segments.push(pts); }
    });
    if (!segments.length) {
      var rte = Array.prototype.map.call(xml.querySelectorAll('rtept'), function (p) {
        var e = p.querySelector('ele');
        return [parseFloat(p.getAttribute('lat')), parseFloat(p.getAttribute('lon')), e ? parseFloat(e.textContent) : null];
      });
      if (rte.length) { segments.push(rte); }
    }
    var tous = [].concat.apply([], segments), cumul = [0], total = 0, dPlus = 0, ref = null, dedans = 0;
    for (var i = 1; i < tous.length; i++) { total += distance(tous[i - 1], tous[i]); cumul.push(total); }
    tous.forEach(function (p) {
      if (contour && dansCommune(p, contour)) { dedans++; }
      if (p[2] === null || isNaN(p[2])) { return; }
      if (ref === null) { ref = p[2]; } else if (p[2] - ref >= 5) { dPlus += p[2] - ref; ref = p[2]; } else if (ref - p[2] >= 5) { ref = p[2]; }
    });
    var alts = tous.map(function (p) { return p[2]; }).filter(function (a) { return a !== null && !isNaN(a); });
    var profil = [];
    if (alts.length === tous.length && total > 0) {
      for (var k = 0, j = 0; k < POINTS_PROFIL; k++) {
        var cible = total * k / (POINTS_PROFIL - 1);
        while (j < cumul.length - 2 && cumul[j + 1] < cible) { j++; }
        var t = cumul[j + 1] > cumul[j] ? (cible - cumul[j]) / (cumul[j + 1] - cumul[j]) : 0;
        t = Math.max(0, Math.min(1, t));
        profil.push(Math.round(tous[j][2] + t * (tous[j + 1][2] - tous[j][2])));
      }
    }
    var lats = tous.map(function (p) { return p[0]; }), lons = tous.map(function (p) { return p[1]; });
    return {
      segments: segments.map(function (s) { return encoder(simplifier(s, TOLERANCE_M)); }),
      points_origine: tous.length,
      points_garde: segments.reduce(function (n, s) { return n + simplifier(s, TOLERANCE_M).length; }, 0),
      longueur_km: Math.round(total / 10) / 100,
      denivele_positif_calcule: Math.round(dPlus),
      altitude_min: alts.length ? Math.round(Math.min.apply(null, alts)) : null,
      altitude_max: alts.length ? Math.round(Math.max.apply(null, alts)) : null,
      profil: profil,
      emprise: [Math.min.apply(null, lats), Math.min.apply(null, lons), Math.max.apply(null, lats), Math.max.apply(null, lons)],
      points_dans_commune: dedans,
      depart_trace: [tous[0][0], tous[0][1]],
      arrivee_trace: [tous[tous.length - 1][0], tous[tous.length - 1][1]]
    };
  }

  window.extraireRandonnees = async function () {
    var requete = { selectionIds: [SELECTION], responseFields: CHAMPS, locales: ['fr'], first: 0, count: 200, identifiantsIgnores: [], order: 'IDENTIFIANT', asc: true };
    var apidae = await json('https://api.apidae-tourisme.com/api/v002/public/widgets/' + WIDGET + '/objets?query=' + encodeURIComponent(JSON.stringify(requete)));
    var objets = (apidae.objetsTouristiques || []).map(alleger);
    var parc = [], url = PARC;
    while (url) { var page = await json(url); parc = parc.concat(page.results || []); url = page.next; }
    var contour = (await json(CONTOUR)).contour;
    var traces = {}, erreurs = [];
    await Promise.all(objets.map(async function (o) {
      var gpx = (o.multimedias || []).filter(function (m) { return ((m.traductionFichiers || [])[0] || {}).extension === 'gpx'; })[0];
      if (!gpx) { erreurs.push(o.id + ' : pas de GPX'); return; }
      try { traces[o.id] = await lireTrace(gpx.traductionFichiers[0].url, contour); }
      catch (e) { erreurs.push(o.id + ' : ' + e); }
    }));
    window.extraitRandonnees = {
      extrait_le: new Date().toISOString(),
      source: location.href.split('#')[0],
      apidae: { widget: WIDGET, selection: SELECTION, numFound: apidae.numFound },
      objets: objets,
      parc_volcans: parc,
      traces: traces,
      erreurs: erreurs
    };
    return { resume: objets.length + ' itinéraires, ' + Object.keys(traces).length + ' tracés, ' + parc.length + ' randonnées du Parc, ' + erreurs.length + ' erreur(s)', erreurs: erreurs };
  };

  window.telechargerExtrait = function () {
    var texte = JSON.stringify(window.extraitRandonnees, null, 1);
    var lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }));
    lien.download = 'destination-haut-cantal-' + window.extraitRandonnees.extrait_le.slice(0, 10) + '.json';
    document.body.appendChild(lien); lien.click(); lien.remove();
  };
}());
