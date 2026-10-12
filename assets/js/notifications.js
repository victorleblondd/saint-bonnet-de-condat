/* Saint-Bonnet-de-Condat — page « Notifications » : activer ou désactiver les notifications sur cet appareil.
   Réglages et fonctions communes : notifications-commun.js. Réception : /sw.js. */
(function () {
  'use strict';
  var zone = document.querySelector('[data-notifications]');
  if (!zone) { return; }
  var etat = zone.querySelector('[data-etat]');
  var activer = zone.querySelector('[data-activer]');
  var desactiver = zone.querySelector('[data-desactiver]');
  var n = window.NOTIFICATIONS || {};
  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var installe = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var compatible = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  var enregistrement = null;

  var textes = {
    chargement: 'Vérification…',
    bientot: 'Les notifications seront bientôt disponibles.',
    ios: 'Sur iPhone et iPad, ajoutez d\'abord le site à l\'écran d\'accueil (étapes ci-dessous), puis ouvrez-le avec son icône pour activer les notifications.',
    incompatible: 'Ce navigateur ne permet pas de recevoir les notifications. Essayez avec Safari sur iPhone ou Chrome sur Android.',
    pret: 'Les notifications ne sont pas activées sur cet appareil.',
    activation: 'Activation…',
    actif: 'Les notifications sont activées sur cet appareil.',
    refuse: 'Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages de votre appareil, puis revenez sur cette page.',
    erreur: 'L\'activation n\'a pas abouti. Vérifiez votre connexion internet, puis réessayez.'
  };

  function afficher(statut) {
    zone.setAttribute('data-statut', statut);
    etat.textContent = textes[statut];
    activer.hidden = !(statut === 'pret' || statut === 'erreur');
    desactiver.hidden = statut !== 'actif';
    activer.disabled = false;
    desactiver.disabled = false;
  }

  activer.addEventListener('click', function () {
    if (!enregistrement) { afficher('erreur'); return; }
    activer.disabled = true;
    etat.textContent = textes.activation;
    /* Appel direct dans le clic : Safari n'affiche la demande d'autorisation qu'après un geste */
    enregistrement.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: n.cle() })
      .then(function (abonnement) { return n.enregistrer(abonnement); })
      .then(function () {
        afficher('actif');
        return enregistrement.showNotification('Notifications activées', {
          body: 'Vous recevrez les avis de la mairie de Saint-Bonnet-de-Condat.',
          icon: '/assets/icones/icone-192.png',
          tag: 'bienvenue',
          lang: 'fr'
        });
      })
      .catch(function () {
        afficher(Notification.permission === 'denied' ? 'refuse' : 'erreur');
      });
  });

  desactiver.addEventListener('click', function () {
    desactiver.disabled = true;
    enregistrement.pushManager.getSubscription()
      .then(function (abonnement) {
        if (!abonnement) { return null; }
        return n.retirer(abonnement.endpoint)
          .catch(function () {})
          .then(function () { return abonnement.unsubscribe(); });
      })
      .then(function () { afficher('pret'); }, function () { afficher('erreur'); });
  });

  if (!n.pret) { afficher('bientot'); return; }
  if (!compatible) { afficher(ios && !installe ? 'ios' : 'incompatible'); return; }
  if (Notification.permission === 'denied') { afficher('refuse'); return; }
  afficher('chargement');
  navigator.serviceWorker.register('/sw.js')
    .then(function () { return navigator.serviceWorker.ready; })
    .then(function (reg) {
      enregistrement = reg;
      return reg.pushManager.getSubscription();
    })
    .then(function (abonnement) {
      if (abonnement && Notification.permission === 'granted') {
        afficher('actif');
        n.enregistrer(abonnement).catch(function () {}); /* remet l'abonnement dans la liste si besoin */
      } else {
        afficher('pret');
      }
    })
    .catch(function () { afficher('erreur'); });
})();
