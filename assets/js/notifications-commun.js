---
layout: null
---
/* Saint-Bonnet-de-Condat — notifications : réglages publics (dans _config.yml, rubrique notifications)
   et fonctions communes à la page « Notifications » et au service worker (/sw.js). */
(function (racine) {
  'use strict';
  var reglages = {
    cleVapid: {{ site.notifications.cle_vapid | default: "" | jsonify }},
    supabaseUrl: {{ site.notifications.supabase_url | default: "" | jsonify }},
    supabaseCle: {{ site.notifications.supabase_cle | default: "" | jsonify }}
  };

  function entetes() {
    var e = { 'Content-Type': 'application/json', apikey: reglages.supabaseCle };
    if (reglages.supabaseCle.indexOf('eyJ') === 0) { e.Authorization = 'Bearer ' + reglages.supabaseCle; }
    return e;
  }

  function appel(fonction, corps) {
    return fetch(reglages.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/' + fonction, {
      method: 'POST', headers: entetes(), body: JSON.stringify(corps)
    }).then(function (reponse) {
      if (!reponse.ok) { throw new Error('Service des abonnements : erreur ' + reponse.status); }
    });
  }

  /* Langue des notifications de cet appareil (fr, en ou nl) : gardée dans le navigateur (Cache Storage),
     écrite par la page « Notifications » et lue par le service worker à l'arrivée de chaque notification. */
  var CACHE_REGLAGES = 'sbc-reglages';
  var CLE_LANGUE = '/__reglages/langue-notifications';
  function lireLangue() {
    if (!racine.caches) { return Promise.resolve(null); }
    return racine.caches.open(CACHE_REGLAGES)
      .then(function (cache) { return cache.match(CLE_LANGUE); })
      .then(function (reponse) { return reponse ? reponse.text() : null; })
      .then(function (code) { return ['fr', 'en', 'nl'].indexOf(code) !== -1 ? code : null; })
      .catch(function () { return null; });
  }
  function ecrireLangue(code) {
    if (!racine.caches) { return Promise.resolve(); }
    return racine.caches.open(CACHE_REGLAGES)
      .then(function (cache) { return cache.put(CLE_LANGUE, new Response(code, { headers: { 'Content-Type': 'text/plain' } })); })
      .catch(function () {});
  }

  racine.NOTIFICATIONS = {
    pret: Boolean(reglages.cleVapid && reglages.supabaseUrl && reglages.supabaseCle),
    /* Clé publique VAPID, au format attendu par pushManager.subscribe() */
    cle: function () {
      var b64 = reglages.cleVapid.replace(/-/g, '+').replace(/_/g, '/');
      b64 += '===='.slice(0, (4 - b64.length % 4) % 4);
      var brut = atob(b64), octets = new Uint8Array(brut.length);
      for (var i = 0; i < brut.length; i++) { octets[i] = brut.charCodeAt(i); }
      return octets;
    },
    enregistrer: function (abonnement) {
      var j = abonnement.toJSON();
      return appel('abonner', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
    },
    retirer: function (endpoint) {
      return appel('desabonner', { p_endpoint: endpoint });
    },
    lireLangue: lireLangue,
    ecrireLangue: ecrireLangue
  };
})(self);
