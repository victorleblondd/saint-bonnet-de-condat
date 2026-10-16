/* Saint-Bonnet-de-Condat — service worker : affiche les notifications de la mairie.
   Il n'intercepte pas les pages : le site s'affiche toujours dans sa dernière version. */
'use strict';
importScripts('/assets/js/notifications-commun.js');

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

/* Réception d'une notification : { title, body, url, tag } */
self.addEventListener('push', function (event) {
  var donnees = {};
  if (event.data) {
    try { donnees = event.data.json(); } catch (erreur) { donnees = { body: event.data.text() }; }
  }
  event.waitUntil(self.registration.showNotification(donnees.title || 'Saint-Bonnet-de-Condat', {
    body: donnees.body || 'Nouvelle actualité de la mairie.',
    icon: '/assets/icones/icone-192.png',
    tag: donnees.tag || undefined,
    lang: 'fr',
    data: { url: donnees.url || '/infos-alertes/' }
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
