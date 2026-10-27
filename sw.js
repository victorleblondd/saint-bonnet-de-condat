/* Saint-Bonnet-de-Condat — service worker : affiche les notifications de la mairie.
   Il n'intercepte pas les pages : le site s'affiche toujours dans sa dernière version. */
'use strict';
importScripts('/assets/js/notifications-commun.js?v=2');

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

/* Textes par défaut, dans chaque langue */
var DEFAUTS = {
  fr: { corps: 'Nouvelle actualité de la mairie.', lien: '/infos-alertes/' },
  en: { corps: 'New notice from the town hall.', lien: '/en/news-and-alerts/' },
  nl: { corps: 'Nieuw bericht van het gemeentehuis.', lien: '/nl/nieuws-en-waarschuwingen/' }
};

/* Réception d'une notification : { title, body, url, tag, langues: { en: { title, body, url, lang }, nl: {…} } }.
   La notification s'affiche dans la langue choisie sur la page « Notifications » de cet appareil (français par défaut). */
self.addEventListener('push', function (event) {
  var donnees = {};
  if (event.data) {
    try { donnees = event.data.json(); } catch (erreur) { donnees = { body: event.data.text() }; }
  }
  var n = self.NOTIFICATIONS;
  var langue = n && n.lireLangue ? n.lireLangue() : Promise.resolve(null);
  event.waitUntil(langue.catch(function () { return null; }).then(function (code) {
    code = code || 'fr';
    var traduction = (code !== 'fr' && donnees.langues && donnees.langues[code]) || null;
    var defauts = DEFAUTS[traduction ? code : 'fr'];
    var choix = traduction || donnees;
    return self.registration.showNotification(choix.title || donnees.title || 'Saint-Bonnet-de-Condat', {
      body: choix.body || donnees.body || defauts.corps,
      icon: '/assets/icones/icone-192.png',
      tag: donnees.tag || undefined,
      lang: (traduction && traduction.lang) || (traduction ? code : 'fr'),
      data: { url: choix.url || donnees.url || defauts.lien }
    });
  }));
});

/* Toucher la notification ouvre la page de l'avis (toujours sur ce site) */
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var cible = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin);
  if (cible.origin !== self.location.origin) { cible = new URL('/', self.location.origin); }
  event.waitUntil(self.clients.openWindow(cible.href));
});

/* Le navigateur renouvelle l'abonnement : on met à jour la liste des abonnés */
self.addEventListener('pushsubscriptionchange', function (event) {
  var n = self.NOTIFICATIONS;
  if (!n || !n.pret) { return; }
  event.waitUntil(
    (event.newSubscription
      ? Promise.resolve(event.newSubscription)
      : self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: n.cle() }))
      .then(function (abonnement) {
        var taches = [n.enregistrer(abonnement)];
        if (event.oldSubscription) { taches.push(n.retirer(event.oldSubscription.endpoint)); }
        return Promise.all(taches);
      })
      .catch(function () {})
  );
});
