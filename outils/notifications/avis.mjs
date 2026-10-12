// Saint-Bonnet-de-Condat — notifications : repérer les nouveaux avis et préparer leur message.
// Utilisé par envoyer.mjs (sans accès au réseau : testable seul).

// Jour courant à Paris, au format AAAA-MM-JJ
export function jourParis(date = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

export const dateIso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));

// Même ancre que le site : {{ date }}-{{ titre | slugify: "latin" }}
export function slug(texte) {
  return String(texte)
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/æ/g, 'ae').replace(/Æ/g, 'AE').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function raccourcir(texte, max) {
  const t = String(texte).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

// Un avis garde la même clé si son titre change, tant qu'il a un PDF.
export const cleAvis = (a) => `${dateIso(a.date)}|${a.pdf || a.titre}`;

// Avis présents dans « recents » et absents de « anciens », datés de moins de 3 jours (3 au plus).
export function nouveauxAvis(anciens, recents, maintenant = new Date()) {
  if (!Array.isArray(anciens) || !Array.isArray(recents)) return [];
  const connus = new Set(anciens.filter(Boolean).map(cleAvis));
  const limite = jourParis(new Date(maintenant.getTime() - 3 * 24 * 3600 * 1000));
  return recents
    .filter((a) => a && a.date && a.titre && !connus.has(cleAvis(a)) && dateIso(a.date) >= limite)
    .slice(0, 3);
}

export function messageAvis(a) {
  const ancre = `${dateIso(a.date)}-${slug(a.titre)}`;
  return {
    title: (a.type === 'alerte' ? 'Alerte : ' : '') + a.titre,
    body: raccourcir(a.resume || '', 200),
    url: `/infos-alertes/#${ancre}`,
    tag: ancre,
    urgent: a.type === 'alerte',
    ancre,
  };
}
