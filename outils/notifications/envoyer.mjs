// Saint-Bonnet-de-Condat — envoi des notifications aux habitants abonnés.
// Lancé par .github/workflows/notifications.yml :
//  - push sur main : une notification par nouvel avis de _data/infos_alertes.yml
//    (rien si le message du commit contient « [sans notification] ») ;
//  - lancement à la main (workflow_dispatch) : le titre et le message saisis ;
//  - programmation (schedule) : simple lecture des abonnements, pour garder Supabase actif.
// Réglages publics : _config.yml (rubrique notifications). Secrets : SUPABASE_SECRET_KEY, VAPID_PRIVATE_KEY.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import webpush from 'web-push';
import { messageAvis, nouveauxAvis, raccourcir } from './avis.mjs';

const env = process.env;
const SUJET_VAPID = 'https://saint-bonnet-de-condat.fr'; // contact déclaré aux services de notification
const SITE = env.SITE_URL || SUJET_VAPID;
const reglages = (yaml.load(readFileSync('_config.yml', 'utf8')) || {}).notifications || {};
const SUPABASE = String(reglages.supabase_url || '').replace(/\/+$/, '');
const CLE_SECRETE = cleSupabase(env.SUPABASE_SECRET_KEY || '');
const VAPID_PRIVEE = (env.VAPID_PRIVATE_KEY || '').trim();

function fin(message) {
  console.log(message);
  process.exit(0);
}

// Le secret SUPABASE_SECRET_KEY doit contenir la clé seule, sur une ligne. S'il contient autre chose
// (nom de la clé, adresse…), on garde la seule clé qu'il contient et on le signale.
// Le journal des actions est public : on n'y décrit que la forme des lignes, jamais leur contenu.
function genreLigne(ligne) {
  if (/sb_secret_/.test(ligne)) return 'clé secrète (sb_secret_…)';
  if (/sb_publishable_/.test(ligne)) return 'clé publique (sb_publishable_…), pas la bonne';
  if (/^eyJ/.test(ligne)) return 'clé JWT (eyJ…)';
  if (/^https?:\/\//.test(ligne)) return 'adresse web';
  return 'autre texte';
}

function cleSupabase(valeur) {
  const texte = valeur.trim();
  if (!texte || /^(sb_secret_|eyJ)\S*$/.test(texte)) return texte;
  const cles = [...new Set(texte.match(/sb_secret_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || [])];
  const forme = texte
    .split(/\s*[\r\n]+\s*/)
    .map((ligne, i) => `ligne ${i + 1} : ${genreLigne(ligne)}, ${ligne.length} caractères`)
    .join(' ; ');
  if (cles.length === 1) {
    console.log(`::warning::Le secret SUPABASE_SECRET_KEY contient autre chose que la clé (${forme}) : seule la clé est utilisée. Le recoller seul, sur une ligne.`);
    return cles[0];
  }
  console.log(`::error::Le secret SUPABASE_SECRET_KEY doit contenir seulement la clé secrète (sb_secret_…), sur une ligne (${forme}).`);
  process.exit(1);
}

if (!SUPABASE || !reglages.cle_vapid || !CLE_SECRETE || !VAPID_PRIVEE) {
  fin('Notifications pas encore configurées (Supabase ou clés manquantes) : rien à envoyer.');
}

// ---------- Service des abonnements (Supabase) ----------
const entetes = { apikey: CLE_SECRETE, 'Content-Type': 'application/json' };
if (CLE_SECRETE.startsWith('eyJ')) entetes.Authorization = `Bearer ${CLE_SECRETE}`;

async function supabase(chemin, options = {}) {
  const reponse = await fetch(`${SUPABASE}/rest/v1/${chemin}`, {
    ...options,
    headers: { ...entetes, ...(options.headers || {}) },
  });
  if (!reponse.ok) throw new Error(`Supabase ${reponse.status} : ${await reponse.text()}`);
  return reponse.status === 204 ? null : reponse.json();
}
const lireAbonnements = () => supabase('abonnements?select=endpoint,p256dh,auth');
const supprimer = (endpoint) =>
  supabase(`abonnements?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });

// ---------- Avis ajoutés par le push ----------
function avisA(ref) {
  if (!ref || /^0+$/.test(ref)) return null;
  try {
    const texte = execFileSync('git', ['show', `${ref}:_data/infos_alertes.yml`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return yaml.load(texte) || [];
  } catch {
    return null;
  }
}

// Attend que le site en ligne affiche l'avis (publication GitHub Pages), 10 minutes au plus.
async function attendreSite(ancre) {
  for (let essai = 0; essai < 30; essai += 1) {
    try {
      const reponse = await fetch(`${SITE}/infos-alertes/?v=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
      if (reponse.ok && (await reponse.text()).includes(`id="${ancre}"`)) return true;
    } catch {
      // le site n'est pas encore joignable : on réessaie
    }
    await new Promise((r) => setTimeout(r, Number(env.ATTENTE_MS || 20000)));
  }
  return false;
}

// ---------- Envoi ----------
async function envoyer(messages) {
  webpush.setVapidDetails(SUJET_VAPID, reglages.cle_vapid, VAPID_PRIVEE);
  const abonnes = await lireAbonnements();
  console.log(`${abonnes.length} abonné(s).`);
  const retires = new Set();
  let tentatives = 0;
  let erreursTotales = 0;
  for (const m of messages) {
    const charge = JSON.stringify({ title: m.title, body: m.body, url: m.url, tag: m.tag });
    let envoyees = 0;
    let expires = 0;
    let erreurs = 0;
    for (const s of abonnes) {
      if (retires.has(s.endpoint)) continue;
      tentatives += 1;
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, charge, {
          TTL: 4 * 24 * 3600,
          urgency: m.urgent ? 'high' : 'normal',
        });
        envoyees += 1;
      } catch (erreur) {
        if (erreur.statusCode === 404 || erreur.statusCode === 410) {
          await supprimer(s.endpoint);
          retires.add(s.endpoint);
          expires += 1;
        } else {
          erreurs += 1;
          console.log(`::warning::Échec d'envoi : ${erreur.statusCode || ''} ${erreur.body || erreur.message}`.trim());
        }
      }
    }
    erreursTotales += erreurs;
    console.log(`« ${m.title} » : ${envoyees} envoyée(s), ${expires} abonnement(s) expiré(s) retiré(s), ${erreurs} erreur(s).`);
  }
  if (tentatives > 0 && erreursTotales === tentatives) {
    console.log("::error::Aucune notification n'a pu être envoyée.");
    process.exit(1);
  }
}

// ---------- Programme principal ----------
async function principal() {
  const evenement = env.EVENEMENT || '';
  if (evenement === 'schedule') {
    const abonnes = await lireAbonnements();
    fin(`Service des abonnements actif : ${abonnes.length} abonné(s).`);
  }

  let messages = [];
  if (evenement === 'workflow_dispatch') {
    const titre = (env.TITRE || '').trim();
    const texte = (env.MESSAGE || '').trim();
    if (!titre || !texte) fin('Titre et message obligatoires : rien à envoyer.');
    let lien = (env.LIEN || '/infos-alertes/').trim();
    if (!lien.startsWith('/')) {
      try {
        const u = new URL(lien);
        lien = u.origin === SITE ? `${u.pathname}${u.search}${u.hash}` : '/';
      } catch {
        lien = '/';
      }
    }
    messages = [{ title: raccourcir(titre, 80), body: raccourcir(texte, 200), url: lien, tag: `message-${Date.now()}`, urgent: false }];
  } else if (evenement === 'push') {
    if (/\[sans notification\]/i.test(env.MESSAGE_COMMIT || '')) fin('Commit marqué [sans notification] : rien à envoyer.');
    messages = nouveauxAvis(avisA(env.AVANT), avisA(env.APRES)).map(messageAvis);
    if (messages.length === 0) fin('Aucun nouvel avis : rien à envoyer.');
    for (const m of messages) {
      const enLigne = await attendreSite(m.ancre);
      console.log(enLigne ? `Avis en ligne : ${m.ancre}` : `::warning::Avis pas encore visible en ligne (${m.ancre}) : envoi quand même.`);
    }
  } else {
    fin(`Événement « ${evenement} » : rien à envoyer.`);
  }

  await envoyer(messages);
}

principal().catch((erreur) => {
  console.log(`::error::${erreur && erreur.message ? erreur.message : erreur}`);
  process.exit(1);
});
