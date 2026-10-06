"""Télécharge les fichiers listés dans outils/fichiers-a-recuperer.txt et les ajoute au site.

- Une affiche (image) dont le chemin de destination se termine par .pdf est convertie en PDF au format A4.
- Une photo peut être réduite à une largeur maximale (troisième colonne).
- Un fichier déjà présent n'est jamais retéléchargé.

Lancé automatiquement par GitHub (.github/workflows/recuperer-fichiers.yml).
"""
import io
import os
import sys
import urllib.request

import img2pdf
from PIL import Image, ImageOps

LISTE = "outils/fichiers-a-recuperer.txt"
AGENT = "SiteCommuneSaintBonnetDeCondat/1.0 (https://github.com/victorleblondd/saint-bonnet-de-condat)"
A4 = (img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297))


def telecharger(url):
    requete = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(requete, timeout=60) as reponse:
        return reponse.read()


def en_jpeg(donnees, largeur_max=None):
    image = ImageOps.exif_transpose(Image.open(io.BytesIO(donnees))).convert("RGB")
    if largeur_max and image.width > largeur_max:
        hauteur = round(image.height * largeur_max / image.width)
        image = image.resize((largeur_max, hauteur), Image.LANCZOS)
    sortie = io.BytesIO()
    image.save(sortie, "JPEG", quality=82, optimize=True, progressive=True)
    return sortie.getvalue()


def en_pdf(donnees):
    if donnees[:4] == b"%PDF":
        return donnees
    if donnees[:3] != b"\xff\xd8\xff":  # pas un JPEG : on le convertit d'abord
        donnees = en_jpeg(donnees)
    mise_en_page = img2pdf.get_layout_fun(A4, fit=img2pdf.FitMode.into)
    return img2pdf.convert(donnees, layout_fun=mise_en_page)


def recuperer(url, destination, largeur):
    donnees = telecharger(url)
    if destination.lower().endswith(".pdf"):
        donnees = en_pdf(donnees)
    elif destination.lower().endswith((".jpg", ".jpeg")):
        donnees = en_jpeg(donnees, largeur)
    os.makedirs(os.path.dirname(destination) or ".", exist_ok=True)
    with open(destination, "wb") as fichier:
        fichier.write(donnees)
    print(f"Ajouté : {destination} ({len(donnees) // 1024} Ko)")


def main():
    ajoutes, echecs = 0, 0
    with open(LISTE, encoding="utf-8") as liste:
        for ligne in liste:
            ligne = ligne.strip()
            if not ligne or ligne.startswith("#"):
                continue
            morceaux = ligne.split()
            url, destination = morceaux[0], morceaux[1]
            largeur = int(morceaux[2]) if len(morceaux) > 2 else None
            if os.path.exists(destination):
                print(f"Déjà présent : {destination}")
                continue
            try:
                recuperer(url, destination, largeur)
                ajoutes += 1
            except Exception as erreur:  # un fichier en échec ne bloque pas les autres
                print(f"::warning::Échec pour {destination} : {erreur}")
                echecs += 1
    with open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a", encoding="utf-8") as sortie:
        sortie.write(f"ajoutes={ajoutes}\nechecs={echecs}\n")
    print(f"{ajoutes} fichier(s) ajouté(s), {echecs} échec(s).")


if __name__ == "__main__":
    sys.exit(main())
