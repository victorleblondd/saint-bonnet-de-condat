#!/usr/bin/env python3
"""Randonnées de la page Tourisme : fabrique les fichiers du site à partir des données de Destination Haut Cantal.

Entrées :
- le dernier fichier outils/randonnees/source/destination-haut-cantal-AAAA-MM-JJ.json
  (fiches Apidae de l'office de tourisme, tracés GPX simplifiés, randonnées du Parc ;
  voir outils/randonnees/extraire.js) ;
- outils/randonnees/traductions.yml (textes anglais et néerlandais).

Sorties :
- _data/randonnees.json : les fiches, dans l'ordre de distance depuis Saint-Bonnet-de-Condat,
  avec les valeurs mises en forme dans les trois langues (lues par Jekyll comme site.data.randonnees) ;
- assets/data/randonnees.json : les tracés pour la carte.

Rien n'est inventé : les valeurs viennent des fiches de l'office de tourisme. La difficulté vient,
dans l'ordre, du niveau donné par l'office de tourisme, du niveau du Parc naturel régional des Volcans
d'Auvergne pour la même randonnée, ou d'une expression de la description de l'office de tourisme
(citée telle quelle) ; sinon, elle est « non précisée ».

Usage : python3 outils/randonnees/generer.py [fichier-source.json]
"""
import glob
import hashlib
import html
import json
import math
import os
import re
import sys
import unicodedata

import yaml

DEPOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REPERE = (45.27904, 2.78795)      # mairie de Saint-Bonnet-de-Condat (lien Google Maps du pied de page)
INSEE = "15173"
LANGUES = ("fr", "en", "nl")
SOURCE_URL = "https://www.destinationhautcantal.fr/jy-suis/activites-de-pleine-nature/randonnees/"
ESPACE = " "  # espace insécable

# Niveaux de l'office de tourisme (critère « type de clientèle » des fiches Apidae)
NIVEAUX_DHC = {
    "Niveau vert - Facile": ("facile", {"fr": "Facile (niveau vert)", "en": "Easy (green level)", "nl": "Makkelijk (groen niveau)"}),
    "Niveau bleu - Modéré": ("moyen", {"fr": "Modéré (niveau bleu)", "en": "Moderate (blue level)", "nl": "Gemiddeld (blauw niveau)"}),
    "Niveau orange - Assez difficile": ("difficile", {"fr": "Assez difficile (niveau orange)", "en": "Fairly difficult (orange level)", "nl": "Vrij moeilijk (oranje niveau)"}),
    "Niveau rouge - Difficile": ("difficile", {"fr": "Difficile (niveau rouge)", "en": "Difficult (red level)", "nl": "Moeilijk (rood niveau)"}),
    "Niveau noir - Très difficile": ("difficile", {"fr": "Très difficile (niveau noir)", "en": "Very difficult (black level)", "nl": "Zeer moeilijk (zwart niveau)"}),
}
# Niveaux du Parc naturel régional des Volcans d'Auvergne (Geotrek)
NIVEAUX_PARC = {
    1: ("facile", {"fr": "Très facile", "en": "Very easy", "nl": "Zeer makkelijk"}),
    2: ("facile", {"fr": "Facile", "en": "Easy", "nl": "Makkelijk"}),
    3: ("moyen", {"fr": "Moyen", "en": "Medium", "nl": "Gemiddeld"}),
    4: ("difficile", {"fr": "Difficile", "en": "Difficult", "nl": "Moeilijk"}),
    5: ("difficile", {"fr": "Très difficile", "en": "Very difficult", "nl": "Zeer moeilijk"}),
}
PRATIQUE_PEDESTRE = 4
# Expressions de difficulté reprises des descriptions de l'office de tourisme (citées telles quelles)
EXPRESSIONS = [
    ("petite randonnée facile", "facile", {"en": "short, easy hike", "nl": "korte, makkelijke wandeling"}),
    ("promenade facile", "facile", {"en": "easy walk", "nl": "makkelijke wandeling"}),
    ("randonnée accessible à tout public", "facile", {"en": "hike suitable for everyone", "nl": "wandeling die voor iedereen geschikt is"}),
]
FAMILLE = "Spécial famille avec enfants"
TROUPEAUX = "Présence de troupeaux et chiens de protection"


def norm(s):
    s = (s or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    return "\n".join(ligne.rstrip() for ligne in s.split("\n"))


def libelle(x):
    return norm((x or {}).get("libelleFr", ""))


def empreinte(s):
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:8]


def sans_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def slug(s, longueur=48):
    s = re.sub(r"[^a-z0-9]+", "-", sans_accents(s).lower().replace("'", " ").replace("’", " ")).strip("-")
    if len(s) > longueur:
        s = s[:longueur].rsplit("-", 1)[0]
    return s


def distance_km(a, b):
    r, rad = 6371.0088, math.pi / 180
    dlat, dlon = (b[0] - a[0]) * rad, (b[1] - a[1]) * rad
    s = math.sin(dlat / 2) ** 2 + math.cos(a[0] * rad) * math.cos(b[0] * rad) * math.sin(dlon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(s))


def nombre(x, langue, decimales=2):
    """6.2 → « 6,2 » (fr, nl) ou « 6.2 » (en) ; 3950 → « 3 950 », « 3,950 », « 3.950 »."""
    texte = f"{x:.{decimales}f}".rstrip("0").rstrip(".") if isinstance(x, float) else str(x)
    entier, _, dec = texte.partition(".")
    sep_milliers = {"fr": ESPACE, "en": ",", "nl": "."}[langue]
    if len(entier) > 3:
        entier = f"{int(entier):,}".replace(",", sep_milliers)
    if dec:
        return entier + ("." if langue == "en" else ",") + dec
    return entier


def duree(minutes, jours, langue):
    if jours:
        return f"{jours}{ESPACE}" + {"fr": "jours", "en": "days", "nl": "dagen"}[langue]
    if not minutes:
        return None
    h, m = divmod(int(minutes), 60)
    unite = {"fr": "h", "en": "h", "nl": "u"}[langue]
    if not h:
        return f"{m}{ESPACE}min"
    if not m:
        return f"{h}{ESPACE}{unite}"
    return f"{h}{ESPACE}{unite}{ESPACE}{m:02d}" + ("" if langue == "fr" else f"{ESPACE}min")


def vers_html(texte, lignes_separees=False):
    """Texte brut → paragraphes HTML (texte échappé) ; les lignes « - … » deviennent une liste."""
    if not texte:
        return ""
    blocs = [b for b in re.split(r"\n\s*\n", texte) if b.strip()]
    sortie = []
    for bloc in blocs:
        lignes = [l.strip() for l in bloc.split("\n") if l.strip()]
        if all(l.startswith("- ") for l in lignes):
            sortie.append("<ul>" + "".join(f"<li>{html.escape(l[2:], quote=False)}</li>" for l in lignes) + "</ul>")
        elif lignes_separees:
            sortie.extend(f"<p>{html.escape(l, quote=False)}</p>" for l in lignes)
        else:
            sortie.append("<p>" + "<br>".join(html.escape(l, quote=False) for l in lignes) + "</p>")
    return "".join(sortie)


def profil(valeurs, points=61):
    """Profil d'altitude (tiré du tracé GPX) → chemins SVG dans un cadre de 120 × 60 (coordonnées entières)."""
    if not valeurs or any(v is None or v < -500 or v > 6000 for v in valeurs):
        return None
    bas, haut = min(valeurs), max(valeurs)
    ecart = (haut - bas) or 1
    morceaux = []
    for i in range(points):
        v = valeurs[round(i * (len(valeurs) - 1) / (points - 1))]
        morceaux.append(f"{round(120 * i / (points - 1))} {round(57 - (v - bas) / ecart * 52)}")
    ligne = "M" + "L".join(morceaux)
    return {"ligne": ligne, "aire": ligne + "L120 60L0 60Z", "min": int(bas), "max": int(haut)}


def entiers(v):
    """Écrit 10 plutôt que 10.0 dans les fichiers JSON (nombres entiers)."""
    if isinstance(v, float) and v.is_integer():
        return int(v)
    if isinstance(v, dict):
        return {k: entiers(x) for k, x in v.items()}
    if isinstance(v, list):
        return [entiers(x) for x in v]
    return v


def charger(chemin):
    with open(chemin, encoding="utf-8") as f:
        return json.load(f)


def trouver_parc(objet, parc):
    """Même randonnée au Parc des Volcans : même départ (moins de 150 m) et même longueur (10 %),
    ou nom semblable, départ à moins de 500 m et longueur à 15 % près."""
    point = objet["localisation"]["geolocalisation"].get("geoJson", {}).get("coordinates")
    longueur = (objet["informationsEquipement"].get("itineraire") or {}).get("distance")
    if not point or not longueur:
        return None
    nom = slug(objet["nom"]["libelleFr"]).replace("-", " ")
    meilleur = None
    for t in parc:
        if t.get("practice") != PRATIQUE_PEDESTRE or not t.get("departure_geom") or not t.get("difficulty"):
            continue
        d = distance_km((point[1], point[0]), (t["departure_geom"][1], t["departure_geom"][0])) * 1000
        ecart = abs(t["length_2d"] / 1000 - longueur) / longueur
        nom_parc = slug(re.sub(r"\(.*?\)", "", t["name"])).replace("-", " ")
        semblable = nom_parc in nom or nom in nom_parc
        if (d < 150 and ecart <= 0.10) or (semblable and d < 500 and ecart <= 0.15):
            if meilleur is None or d < meilleur[0]:
                meilleur = (d, t)
    return meilleur[1] if meilleur else None


def main():
    sources = sorted(glob.glob(os.path.join(DEPOT, "outils/randonnees/source/destination-haut-cantal-*.json")))
    chemin = sys.argv[1] if len(sys.argv) > 1 else sources[-1]
    donnees = charger(chemin)
    with open(os.path.join(DEPOT, "outils/randonnees/traductions.yml"), encoding="utf-8") as f:
        trad = yaml.safe_load(f)
    resumes = {int(k): v for k, v in (trad.get("resumes") or {}).items()}
    textes = {str(k): v for k, v in (trad.get("textes") or {}).items()}
    libelles = trad.get("libelles") or {}
    manques = []

    def traduire_texte(fr, contexte):
        if not fr:
            return None
        cle = empreinte(fr)
        if cle not in textes:
            manques.append(f'textes « {cle} » ({contexte}) : {fr[:70]!r}')
            return {"fr": vers_html(fr), "en": vers_html(fr), "nl": vers_html(fr)}
        return {"fr": vers_html(fr), "en": vers_html(norm(textes[cle]["en"])), "nl": vers_html(norm(textes[cle]["nl"]))}

    def traduire_libelle(fr):
        if fr not in libelles:
            manques.append(f"libelles « {fr} »")
            return {"fr": fr, "en": fr, "nl": fr}
        return {"fr": fr, "en": libelles[fr]["en"], "nl": libelles[fr]["nl"]}

    fiches, traces = [], []
    sources_difficulte = {"dhc": 0, "parc": 0, "dhc-texte": 0, "aucune": 0}
    for o in donnees["objets"]:
        ident = o["id"]
        nom = o["nom"]["libelleFr"].strip()
        it = o["informationsEquipement"].get("itineraire") or {}
        pres, prest, ouv, loc = o["presentation"], o["prestations"], o["ouverture"], o["localisation"]
        adresse = loc["adresse"]
        commune = adresse["commune"]
        point = loc["geolocalisation"]["geoJson"]["coordinates"]
        lat, lon = point[1], point[0]
        trace = donnees["traces"].get(str(ident)) or {}
        resume = libelle(pres.get("descriptifCourt"))
        if ident not in resumes:
            manques.append(f"resumes {ident} ({nom})")

        # Difficulté, avec sa source
        types_clientele = [libelle(t) for t in prest.get("typesClientele", [])]
        difficulte = None
        niveau = next((n for n in types_clientele if n in NIVEAUX_DHC), None)
        if niveau:
            cle, textes_niveau = NIVEAUX_DHC[niveau]
            difficulte = {"cle": cle, "source": "dhc", **textes_niveau}
        else:
            t = trouver_parc(o, donnees.get("parc_volcans", []))
            if t:
                cle, textes_niveau = NIVEAUX_PARC[t["difficulty"]]
                difficulte = {"cle": cle, "source": "parc", "parc_id": t["id"], "parc_nom": t["name"], **textes_niveau}
            else:
                for expression, cle, traductions in EXPRESSIONS:
                    position = resume.lower().find(expression)
                    if position >= 0:
                        citation = resume[position:position + len(expression)]
                        difficulte = {"cle": cle, "source": "dhc-texte", "fr": citation, **traductions}
                        break
        sources_difficulte[difficulte["source"] if difficulte else "aucune"] += 1

        minutes = it.get("dureeJournaliere") or ouv.get("dureeSeance")
        jours = it.get("dureeItinerance") or ouv.get("nombreJours")
        distance = it.get("distance")
        denivele = it.get("denivellationPositive")
        type_parcours = {"BOUCLE": "boucle", "ALLER_RETOUR": "aller-retour"}.get(it.get("itineraireType"))
        balise = {"BALISE": True, "NON_BALISE": False}.get(it.get("itineraireBalise"))
        couleur = libelle(it.get("precisionsBalisage"))
        chiens = {"ACCEPTES": "oui", "NON_ACCEPTES": "non"}.get(prest.get("animauxAcceptes"))
        equipements = [libelle(e) for e in prest.get("equipements", [])]
        environnements = [libelle(e) for e in loc.get("environnements", [])]
        terrains = [libelle(n) for n in it.get("naturesTerrain", [])]
        theme = {libelle(d["theme"]) if isinstance(d.get("theme"), dict) else "": libelle(d.get("description")) for d in pres.get("descriptifsThematises", [])}
        topo = theme.get("Topo/pas à pas", "")
        points_forts = libelle(pres.get("bonsPlans")) or theme.get("Conseils et suggestions", "")
        depart_rue = ", ".join(x.strip() for x in [adresse.get("adresse1"), adresse.get("adresse2"), adresse.get("adresse3")] if x and x.strip())
        dans_commune = commune.get("code") == INSEE
        eloignement = distance_km(REPERE, (lat, lon))

        fichiers = []
        for m in o.get("multimedias", []):
            f = (m.get("traductionFichiers") or [{}])[0]
            ext = (f.get("extension") or "").lower()
            if ext not in ("gpx", "kml", "pdf") or not f.get("url"):
                continue
            titre = re.sub(r"_[^_]*$", "", libelle(m.get("nom"))).strip() or nom
            nom_fichier = (f.get("fileName") or "").lower()
            if ext == "pdf":
                if titre.startswith(("HEB ", "Hébergements")) or "heberg" in sans_accents(nom_fichier):
                    generique = "hebergements"
                elif titre.lower().startswith(("topoguide", "gpx ")):
                    generique = "topoguide"
                else:
                    generique = None
            else:
                generique = ext
            fichiers.append({"format": ext, "url": f["url"], "titre": titre, "generique": generique})
        fichiers.sort(key=lambda f: {"gpx": 0, "kml": 1, "pdf": 2}[f["format"]])
        credit = next((libelle(m.get("copyright")) for m in o.get("multimedias", [])
                       if m.get("type") == "PLAN" and libelle(m.get("copyright"))), "")

        fiche = {
            "id": ident,
            "slug": slug(" ".join([nom.split(" - ")[0], nom.split(" - ")[-1]]) if " - " in nom else nom),
            "nom": nom,
            "commune": commune["nom"],
            "code_postal": adresse.get("codePostal") or commune.get("codePostal"),
            "depart": depart_rue,
            "lat": round(lat, 6),
            "lon": round(lon, 6),
            "altitude_depart": loc["geolocalisation"].get("altitude"),
            "dans_commune": dans_commune,
            "passe_commune": bool(trace.get("points_dans_commune")),
            "eloignement_km": round(eloignement, 1),
            "distance_km": distance,
            "duree_min": minutes,
            "jours": jours,
            "denivele": denivele,
            "type": type_parcours,
            "balise": balise,
            "couleur": traduire_libelle(couleur) if couleur else None,
            "difficulte": difficulte,
            "famille": FAMILLE in types_clientele,
            "troupeaux": TROUPEAUX in environnements,
            "chiens": chiens,
            "chiens_texte": traduire_texte(libelle(prest.get("descriptifAnimauxAcceptes")), f"chiens {ident}"),
            "parking": any("Parking" in e for e in equipements),
            "equipements": [traduire_libelle(e) for e in equipements],
            "environnements": [traduire_libelle(e) for e in environnements if e != TROUPEAUX],
            "terrains": [traduire_libelle(t) for t in terrains],
            "periode": traduire_texte(libelle(ouv.get("periodeEnClair")), f"période {ident}"),
            "passages_delicats": traduire_texte(libelle(it.get("passagesDelicats")), f"passages délicats {ident}"),
            "conseils": traduire_texte(libelle(prest.get("complementAccueil")), f"conseils {ident}"),
            "points_forts": traduire_texte(points_forts, f"points forts {ident}"),
            "topoguide": traduire_texte(libelle(it.get("referencesTopoguides")), f"topoguide {ident}"),
            "carte_ign": traduire_texte(libelle(it.get("referencesCartographiques")), f"carte {ident}"),
            "resume": {"fr": resume, "en": (resumes.get(ident) or {}).get("en", resume), "nl": (resumes.get(ident) or {}).get("nl", resume)},
            "topo_html": vers_html(topo, lignes_separees=True),
            "description_html": vers_html(libelle(pres.get("descriptifDetaille"))),
            "fichiers": fichiers,
            "credit_trace": credit or None,
            "profil": profil(trace.get("profil")),
            "texte": {},
        }
        for langue in LANGUES:
            if dans_commune:
                loin = {"fr": "Départ sur la commune", "en": "Starts in the municipality", "nl": "Vertrek in de gemeente"}[langue]
            else:
                valeur = nombre(round(eloignement, 1) if eloignement < 10 else round(eloignement), langue, 1)
                loin = {"fr": f"À {valeur}{ESPACE}km à vol d’oiseau", "en": f"{valeur}{ESPACE}km away as the crow flies",
                        "nl": f"Op {valeur}{ESPACE}km in vogelvlucht"}[langue]
            fiche["texte"][langue] = {
                "distance": f"{nombre(distance, langue)}{ESPACE}km" if distance else None,
                "duree": duree(minutes, jours, langue),
                "denivele": f"{nombre(denivele, langue)}{ESPACE}m" if denivele is not None else None,
                "altitude_depart": f"{nombre(fiche['altitude_depart'], langue)}{ESPACE}m" if fiche["altitude_depart"] else None,
                "eloignement": loin,
                "coordonnees": "{} N, {} {}".format(
                    nombre(round(lat, 5), langue, 5), nombre(round(lon, 5), langue, 5), "O" if langue == "nl" else "E"),
                "profil": None if not fiche["profil"] else {
                    "min": f"{nombre(fiche['profil']['min'], langue)}{ESPACE}m",
                    "max": f"{nombre(fiche['profil']['max'], langue)}{ESPACE}m"},
            }
        fiches.append(fiche)
        traces.append({
            "s": fiche["slug"],
            "d": [fiche["lat"], fiche["lon"]],
            "b": [round(v, 5) for v in trace.get("emprise", [])],
            "g": trace.get("segments", []),
        })

    fiches.sort(key=lambda f: (f["eloignement_km"], f["nom"]))
    ordre = {f["slug"]: i for i, f in enumerate(fiches)}
    traces.sort(key=lambda t: ordre[t["s"]])
    doublons = {f["slug"] for f in fiches if sum(g["slug"] == f["slug"] for g in fiches) > 1}
    if doublons:
        sys.exit(f"Identifiants en double : {sorted(doublons)}")

    extrait = donnees["extrait_le"][:10]
    contenu = {
        "_note": ("Randonnées de la page Tourisme : fichier fabriqué par outils/randonnees/generer.py à partir des fiches "
                  "de l'office de tourisme Destination Haut Cantal. Ne pas modifier à la main : voir le README, « Page Tourisme »."),
        "source": {
            "nom": "Destination Haut Cantal",
            "url": SOURCE_URL,
            "telephone": "04 71 78 07 37",
            "telephone_lien": "+33471780737",
            "extrait_le": extrait,
            "nombre": len(fiches),
            "fichier": os.path.relpath(chemin, DEPOT),
        },
        "liste": fiches,
    }
    with open(os.path.join(DEPOT, "_data/randonnees.json"), "w", encoding="utf-8") as f:
        json.dump(entiers(contenu), f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.makedirs(os.path.join(DEPOT, "assets/data"), exist_ok=True)
    with open(os.path.join(DEPOT, "assets/data/randonnees.json"), "w", encoding="utf-8") as f:
        json.dump(entiers({"extrait_le": extrait, "repere": list(REPERE), "randonnees": traces}), f, ensure_ascii=False, separators=(",", ":"))

    print(f"{len(fiches)} randonnées (source : {os.path.relpath(chemin, DEPOT)}, extraite le {extrait})")
    print("Difficulté : " + ", ".join(f"{k} {v}" for k, v in sources_difficulte.items()))
    if manques:
        print("Traductions manquantes :")
        for m in manques:
            print("  - " + m)
        sys.exit(1)


if __name__ == "__main__":
    main()
