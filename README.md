# 🧸 Championnat des Peluches

Simulateur de championnat de football de peluches : un site **statique**, sans build, sans dépendance,
où l'on saisit les scores et où le site calcule classements, tableaux à élimination directe et palmarès.

**Site en ligne :** <https://ironworkout.github.io/paul.wallon.bts.sio/> (GitHub Pages, branche `main`, racine du dépôt)

---

## Compétitions

Navigation par onglets, une page unique :

| Onglet | Contenu |
|---|---|
| Ligue 1 / Ligue 2 / Ligue 3 | Championnats avec journées, classements et anecdotes de clubs |
| LDC | Coupe à 32 clubs (32es → finale), complétée à 32 par des BYE résolus automatiquement |
| CDF | Coupe à 12 clubs : 8es (6 matchs) → quarts (3) → demie **à 3 clubs** → finale |
| Barrages | Accession / maintien, avec échanges de places entre ligues |
| Palmarès | Trophées par club (Ligue 1, Ligue 2, LDC, CDF) |
| Classement | Classement général, triable (officiel, total, par compétition) |
| Base | Base de clubs, logos et saisons archivées |

Saisons séparées pour la CDF et la LDC (sélecteur de saison par compétition).

## Lancer le site en local

Aucune installation : tout est dans `index.html`.

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Un serveur local est préférable à une ouverture directe du fichier (`file://`), qui bloque certaines
requêtes et la lecture des ressources audio.

## Tests

```bash
node cdf_format_test.js
```

Le script charge `index.html`, extrait son JavaScript et l'exécute dans un contexte simulé, puis affiche :

```
RESULTAT: 122 reussis, 0 echecs
```

Il sort en **code 1** dès qu'une assertion échoue, et tourne automatiquement en CI
(`.github/workflows/tests.yml`) à chaque push et pull request sur `main`.
À lancer après toute modification touchant la CDF, la LDC, le classement, le palmarès, les saisons ou les logos.

## Structure du dépôt

```
index.html            # TOUT le site : HTML + CSS + JS (325 Ko, ~6 800 lignes)
cdf_format_test.js    # Suite de tests Node (122 assertions)
AMELIORATIONS.md      # Feuille de route : 20 idées, cases cochées quand c'est fait
INSTRUCTIONS.md       # Consignes de travail : conventions, modèle de données, vérifications
VISUELS.md            # Direction artistique LDC/CDF et prompts des visuels à produire
.github/workflows/    # CI : tests à chaque push
*.png / *.webp        # Logos des clubs (PNG) et illustrations (WebP)
*.mp3                 # Hymnes (ligue1.mp3, ligue2.mp3, ldc.mp3, hymne-cdf.mp3)
```

Deux pages annexes subsistent, non liées depuis `index.html` : `champions.html` (page historique) et
`dgfip.html` (guide de préparation d'entretien DGFiP, sans rapport avec le championnat).
Les anciens fichiers `style.css`, `app.js`, `server.py`, `index2.html`, `truc.html`, `envahissement.jpg`
ainsi que le doublon `ligue3.mp3` ont été retirés du dépôt (l'historique git les conserve).

## Données et sauvegarde

- L'état vit en mémoire dans la page (`leagueDataStore`, `cdfData`, `ldcData`, `palmaresData`, saisons).
- La sauvegarde passe par **Google Drive** (`saveDataToDrive`, `saveCompToDrive`, `saveLDCToDrive`),
  après connexion (`googleAccessToken`), protégée par `isSavingDriveData`.
- Aucun fichier `data/*.json` n'est versionné : il n'existe pas de dossier `data/` dans ce dépôt.
- Les modifications de logos sont enregistrées puis poussées en ligne, et persistent au rechargement.

## Conventions de code

- **Tout reste dans `index.html`**, sauf raison forte (voir l'idée 13 de la feuille de route).
- Réutiliser les variables CSS déjà définies dans `:root` plutôt que recoder des couleurs.
- Onglets : `data-tab-link="…"` / conteneurs `#<id>-content` / classe `.tab-content-active`.
- Ne jamais committer `.freebuff/` (ignoré par git).

## Feuille de route

Les idées d'évolution et leur avancement sont dans **[AMELIORATIONS.md](AMELIORATIONS.md)** ;
les consignes de travail (modèle de données, pièges, protocole de vérification) dans
**[INSTRUCTIONS.md](INSTRUCTIONS.md)**.

## Poids du dépôt

Les médias pèsent ~6,9 Mo : WebP pour les illustrations, PNG pour les logos, MP3 pour les hymnes.
Les 6 illustrations ont été converties en WebP le 7 novembre 2026 (11,8 Mo → 0,7 Mo, −94 %).
Toute nouvelle image doit arriver en WebP compressé (`cwebp -q 80`), jamais en PNG de plusieurs Mo.
