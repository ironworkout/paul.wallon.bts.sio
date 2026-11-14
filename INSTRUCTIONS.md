# 🧸 INSTRUCTIONS — Championnat des Peluches

Document de travail à lire avant toute intervention sur ce dépôt.
Créé le **7 novembre 2026**, après une vérification complète du dépôt et du clone local (voir § 1).

---

## 1. Le dépôt (valeurs vérifiées, pas supposées)

| Élément | Valeur constatée le 7 nov. 2026 |
|---|---|
| Dépôt | `https://github.com/ironworkout/paul.wallon.bts.sio` |
| Visibilité | publique |
| Branches | `main` uniquement (branche par défaut) |
| Tête de `main` | `c5dbd37` — « Merge remote-tracking branch 'origin/main' », 6 août 2026 11:52 UTC |
| `index.html` | 325 192 octets, **6 786 lignes** (HTML + CSS + JS tout-en-un) |
| Suite de tests | `cdf_format_test.js` → **149 réussis, 0 échec** |
| Taille du dépôt | ~22 Mo |
| Build | **aucun** (pas de bundler) ; Node ne sert qu'aux tests |

Le dossier de travail doit être un clone de `main`. Il ne l'était pas au départ : il ne contenait qu'un
prototype de juin 2025 (index.html de 60 Ko, sans CDF ni LDC). Ce prototype a été archivé dans
`.freebuff/_ancien_proto_2025/` (dossier ignoré par git) avant d'installer le vrai clone.

Contrôle d'intégrité du clone : `git hash-object index.html` doit renvoyer le SHA du blob distant
(`4de1b909268e6f41beb4b48fbec072e255b68dd3` pour la tête ci-dessus).

---

## 2. Protocole avant d'écrire du code

À dérouler dans cet ordre, à chaque tâche :

1. **Suis-je dans le dépôt ?** `pwd`, `git remote -v`, `git status -sb`, `git log --oneline -1`.
   Si `fatal: not a git repository` → ne rien coder, localiser ou installer le clone d'abord.
2. **L'arbre est-il propre ?** `git status --porcelain` vide (sinon identifier ce qui traîne avant).
3. **Le clone est-il à jour ?** comparer `git hash-object <fichier>` au blob de `origin/main`.
4. **La base est-elle verte ?** `node cdf_format_test.js` **avant** toute modification.
5. **La fonctionnalité existe-t-elle déjà ?** grep des marqueurs précis avant d'écrire
   (ex. `data-theme`, `data-tab-link-footer="classement"`, `Blob`, `FileReader`, `medaill`).
6. **Les noms que je vais appeler existent-ils ?** grep des fonctions/ids concernés
   (`startCDFDraw`, `advanceLDCWinner`, `getSeasonTeamUniverse`…). Jamais de fonction inventée.
7. **Quelle est la cible exacte de l'édition ?** lire la fenêtre de lignes autour de l'ancre.
8. **Ai-je besoin de demander ?** seulement si l'action est destructive ou irréversible pour le dépôt
   (écraser un fichier local, réécrire l'historique, pousser). Sinon, avancer et annoncer l'hypothèse.

---

## 3. Règles de code

- **Tout reste dans `index.html`** (HTML + CSS + JS), sauf raison forte (idée 13 de `AMELIORATIONS.md`).
  Aucun CSS/JS externe : les anciens `style.css` et `app.js`, jamais chargés par la page, ont été retirés
  du dépôt le 7 nov. 2026. Ne pas les ressusciter sans décision explicite.
- **Navigation par onglets** : liens `data-tab-link="ligue1|ligue2|ligue3|ldc|cdf|barrages|palmares|classement|base"`,
  conteneurs `#<id>-content`, classe `.tab-content.active`, liens de pied de page `data-tab-link-footer`.
- **CSS** : réutiliser les variables déjà définies dans `:root` (`--bg-color`, `--card-bg`, `--text-color-dark`,
  `--border-color`, couleurs par onglet) au lieu de recoder des couleurs.
- **`.freebuff/` est ignoré par git** : ne jamais le committer (il contient aussi la sauvegarde de l'ancien prototype).
- **Pas de nouvelle image lourde non compressée** (le dépôt pèse déjà ~22 Mo).
- **`main` uniquement**, et **pas de `git push` sans demande explicite**.
- Ne pas casser les données existantes : toute évolution de structure (`cdfData`, `ldcData`, `seasons`,
  `palmarès`) doit rester lisible par les sauvegardes déjà présentes (migration douce).

---

## 4. Vérification obligatoire

```
node cdf_format_test.js
```

Doit finir par **`RESULTAT: 149 reussis, 0 echecs`** (référence du 7 nov. 2026).
À relancer après **toute** modification touchant CDF, LDC, classement, palmarès, saisons, logos ou le
moteur de match. Le test charge `index.html` et l'exécute dans un contexte simulé : il fournit
`googleAccessToken = 'fake-token'` mais **aucun `fetch`**, donc les appels Drive échouent silencieusement
et ne doivent jamais toucher le vrai Drive.

Ne jamais « faire passer » un test en l'affaiblissant : si une assertion casse, c'est le code qu'on corrige.

---

## 5. Modèle de données (vérifié dans le code et les tests)

- `cdfData = { participants, currentRound, rounds, champion, _trophyAwarded, seasons, active_season_id }`
  - `rounds[0]` 8es (6 matchs), `rounds[1]` quarts (3), `rounds[2]` demie **à 3 clubs**
    (`team1..team3`, `score1..score3`, `finalists`), `rounds[3]` finale.
  - Match : `{ team1, team2, score1, score2, winner }`.
  - Fonctions : `startCDFDraw`, `buildCDFDemies`, `resolveCDFDemies`, `advanceCDFWinner`,
    `updateCDFScore(round, idx, slot, value)`, `renderCDFBracket`, `populateCDF`.
- `ldcData` : même schéma, `rounds[0..4]` = 32es → Finale, `LDC_ROUND_NAMES` (5 tours),
  `LDC_TARGET_CLUBS = 32`, BYE résolu par `resolveLDCByeMatch`, `startLDCDraw`, `renderLDCBracket`,
  `advanceLDCWinner(round, idx, winner)`.
- Saisons par compétition : `seasons[]` + `active_season_id`, via `syncActiveCompSeason`,
  `loadCompSeason`, `ensureCompActiveSeason`, `deleteCompSeason` ; sélecteurs `#cdf-season-selector`
  / `#ldc-season-selector` (`data-comp`).
- `palmaresData[club] = { 'Ligue 1': n, 'Ligue 2': n, 'LDC': n, 'CDF': n }` ; `_trophyAwarded` évite le double comptage.
- Classement : `getClassementData()`, `sortClassementBy('official'|'total'|'Ligue 1'|…)`,
  `populateClassement()`, tableau `.classement-table`, cellule `.classement-total`.
- Ligues : `leagueDataStore.l1.teams`, `.l2.teams`, `.l3.clubs` ; saisons avec `fixtures[][]`
  (`{home, away, scoreHome, scoreAway}`) et `standings`.
- Joueurs : `playersData = { players: [{ id, name, number, position: 'ATT'|'GB', clubId, active, createdAt }], clubs }`,
  fichier Drive `peluches_joueurs.json`, champ `photo` ; buteurs stockés sur le match (`match.scorers`),
  `computePlayerStats`, `collectPlayerMatchSheets`, `freezeMatchScorers`, `savePlayersToDrive`,
  `renderPlayerFlops` (anti-trophées) et `buildActuItems` / `refreshActuTickers` (bandeaux L1-L2) ; arrêts =
  `max(0, round(3,5 × matchs) − buts encaissés)` (`GOALKEEPER_SHOTS_FACED_PER_MATCH`).
- Utilitaires : `showMessage(msg, durée, estErreur)`, `resolveLogoUrl`, `BASE_URL`, `getClubLogo`,
  `getClubTrophiesHTML`, `getSeasonTeamUniverse`, `calculateStandings` ; Drive via `googleAccessToken`
  + `saveDataToDrive` / `saveCompToDrive(compId)` / `saveLDCToDrive`, protégé par `isSavingDriveData`.

---

## 6. Pièges connus

- Le classement d'une saison passée doit rester basé sur **son propre** univers de clubs
  (`getSeasonTeamUniverse`), jamais sur l'effectif actuel.
- Demie CDF = 1 match à **3 clubs** ; la finale se construit dès la saisie du 3e score.
- CDF : 12 clubs réels, aucun BYE ; LDC : complétée à 32 avec BYE résolus automatiquement.
- Drive : le sandbox de test fournit `googleAccessToken = 'fake-token'` sans `fetch` : ne jamais compter
  sur un succès Drive pendant les tests, et ne jamais déclencher d'écriture vers le vrai compte.
- Un match à égalité en CDF/LDC est aujourd'hui départagé **aléatoirement** (idée 1 de la feuille de route).
- Certaines cartes (`.cdf-match-card`, `.add-club-form`) ont des couleurs codées en dur (blanc, `#f8f9fa`,
  `#f1f3f5`) : à convertir avant, ou pendant, la mise en place du mode sombre.

---

## 7. Feuille de route et suivi

`AMELIORATIONS.md` contient les 20 idées numérotées ; les cases se cochent **uniquement** quand l'idée
est réellement implémentée et vérifiée. Ordre de travail recommandé (dépendances) :

1. Mode sombre (tokeniser les couleurs une fois pour toutes) — idée 9.
2. Prolongations + tirs au but en CDF/LDC — idée 1.
3. Calendrier aller-retour L1/L2 — idée 3.
4. Statistiques de saison par club (buteurs) — idée 2, dépend du moteur de match.
5. Tirage animé unifié CDF/LDC — idée 4.
6. Hall of Fame par saison — idée 7.
7. Export/import étendu — idée 8, format à figer en dernier.
8. Items rapides : filtre médaillés (5), lien de pied de page Classement (6).

Après chaque chantier : cocher l'idée concernée dans `AMELIORATIONS.md` et mettre à jour ce fichier
si une règle ou une valeur de référence change (nombre de tests, taille de `index.html`, tête de `main`).
