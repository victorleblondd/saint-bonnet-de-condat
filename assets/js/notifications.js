/* Saint-Bonnet-de-Condat — page « Notifications » : activer ou désactiver les notifications sur cet appareil.
   Réglages et fonctions communes : notifications-commun.js. Réception : /sw.js.
   Textes dans la langue de la page : bloc JSON #textes-notifications (écrit depuis _data/langues.yml).
   La langue des notifications est celle de la page où elles ont été activées ; elle se change depuis
   la page « Notifications » d'une autre langue. */
(function () {
  'use strict';
  var zone = document.querySelector('[data-notifications]');
  if (!zone) { return; }
  var etat = zone.querySelector('[data-etat]');
  var activer = zone.querySelector('[data-activer]');
  var desactiver = zone.querySelector('[data-desactiver]');
  var zoneLangue = zone.querySelector('[data-langue-notifications]');
  var n = window.NOTIFICATIONS || {};
  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var installe = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  var compatible = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  var enregistrement = null;
  var LANGUE = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2);

  var textes = {
    chargement: 'Vérification…',
    bientot: 'Les notifications seront bientôt disponibles.',
    ios: 'Sur iPhone et iPad, ajoutez d\'abord le site à l\'écran d\'accueil (étapes ci-dessous), puis ouvrez-le avec son icône pour activer les notifications.',
    incompatible: 'Ce navigateur ne permet pas de recevoir les notifications. Essayez avec Safari sur iPhone ou Chrome sur Android.',
    pret: 'Les notifications ne sont pas activées sur cet appareil.',
    activation: 'Activation…',
    actif: 'Les notifications sont activées sur cet appareil.',
    refuse: 'Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages de votre appareil, puis revenez sur cette page.',
    erreur: 'L\'activation n\'a pas abouti. Vérifiez votre connexion internet, puis réessayez.',
    bienvenue_titre: 'Notifications activées',
    bienvenue_texte: 'Vous recevrez les actualités de la mairie de Saint-Bonnet-de-Condat.',
    langue_actuelle: 'Les notifications arrivent en français.',
    langue_changer: 'Recevoir les notifications en français',
    langue_changee: 'Les notifications arriveront désormais en français.'
  };
  try {
    var page = JSON.parse(document.getElementById('textes-notifications').textContent);
    Object.keys(page).forEach(function (cle) { textes[cle] = page[cle]; });
  } catch (err) { /* textes français par défaut */ }

  var lireLangue = n.lireLangue || function () { return Promise.resolve(null); };
  var ecrireLangue = n.ecrireLangue || function () { return Promise.resolve(); };

  /* Langue des notifications : phrase d'information, et bouton si elles arrivent dans une autre langue que celle de la page */
  function afficherLangue(actif) {
    if (!zoneLangue) { return; }
    zoneLangue.textContent = '';
    zoneLangue.hidden = !actif;
    if (!actif) { return; }
    lireLangue().then(function (code) {
      code = code || 'fr';
      if (code === LANGUE) {
        zoneLangue.textContent = textes.langue_actuelle;
        return;
      }
      var bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.className = 'bouton bouton--secondaire';
      bouton.textContent = textes.langue_changer;
      bouton.addEventListener('click', function () {
        bouton.disabled = true;
        ecrireLangue(LANGUE).then(function () {
          /* Confirmation à la place du bouton, qui reçoit le focus pour ne pas le perdre */
          zoneLangue.setAttribute('tabindex', '-1');
          zoneLangue.textContent = textes.langue_changee;
          zoneLangue.focus();
        });
      });
      zoneLangue.appendChild(bouton);
    });
  }

  function afficher(statut) {
    zone.setAttribute('data-statut', statut);
    etat.textContent = textes[statut];
    activer.hidden = !(statut === 'pret' || statut === 'erreur');
    desactiver.hidden = statut !== 'actif';
    activer.disabled = false;
    desactiver.disabled = false;
    afficherLangue(statut === 'actif');
  }

  activer.addEventListener('click', function () {
    if (!enregistrement) { afficher('erreur'); return; }
    activer.disabled = true;
    etat.textContent = textes.activation;
    /* Appel direct dans le clic : Safari n'affiche la demande d'autorisation qu'après un geste */
    enregistrement.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: n.cle() })
      .then(function (abonnement) { return n.enregistrer(abonnement); })
      .then(function () { return ecrireLangue(LANGUE); })
      .then(function () {
        afficher('actif');
        return enregistrement.showNotification(textes.bienvenue_titre, {
          body: textes.bienvenue_texte,
          icon: '/assets/icones/icone-192.png',
          tag: 'bienvenue',
          lang: LANGUE
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
