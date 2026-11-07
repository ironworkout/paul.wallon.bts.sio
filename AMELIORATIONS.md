# 🧸 Améliorations proposées — Championnat des Peluches

Liste d'idées pour faire évoluer le projet, classées par thème et par impact/effort.

**Légende** : ✅ = fait et vérifié. Dernière vérification : **7 novembre 2026**. Les chiffres cités
(nombre de lignes de `index.html`, nombre d'assertions des tests) sont ceux mesurés à cette date.
Une case ne se coche que si l'idée est réellement implémentée **et** vérifiée.

---

## 🎯 Priorité haute — fonctionnalités de jeu

### 1. Matchs avec prolongations et tirs au but en CDF/LDC
Actuellement, un match à égalité est départagé par tirs au but *aléatoires*.
- **Idée** : ajouter un mini-écran « Prolongations + Tirs au but » avec des boutons (ex. tir de chaque équipe, penalty raté/réussi).
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐⭐ (le suspense du jeu !)
- [ ] **Statut (7 nov. 2026)** : partiel. Le pile ou face est remplacé par une **séance de tirs au but simulée**
  (`simulatePenaltyShootout` : 5 tirs par équipe puis mort subite), avec un score réel enregistré
  (`penaltyScore1` / `penaltyScore2`) et affiché sur la carte (« aux tirs au but (4-3) »).
  La demie CDF à 3 clubs n'est plus départagée au hasard non plus (ordre du tirage conservé à égalité parfaite).
  Reste à faire : le mini-écran interactif « tir par tir » (le modèle existe dans les barrages).

### 2. Statistiques de saison par club (meilleur buteur, passeurs)
- **Idée** : pour chaque match saisi, demander les buteurs et ajouter un classement des buteurs dans chaque ligue (comme un Soulier d'Or des Peluches).
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐

### 3. Calendrier complet en aller-retour
La L1/L2 semblent générer des journées de championnat ; vérifier que chaque équipe joue bien un aller **et** un retour (aller-retour), et afficher les résultats sur les deux journées.
- **Effort** : faible à moyen · **Impact** : ⭐⭐⭐⭐

### 4. Tirage CDF/LDC avec boules animées (comme la L3)
La L3 a une superbe **roulette canvas animée** ; le tirage CDF est automatique (texte) et le tirage LDC utilise des boules simples. On pourrait unifier l'expérience avec l'animation de la roulette.
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐

---

## 🏆 Palmarès & Classement

### 5. Filtre « seulement les médaillés » dans le Classement
- **Idée** : un bouton/checkbox pour n'afficher que les clubs ayant au moins 1 trophée (actuellement tout le monde apparaît, même avec 0).
- **Effort** : très faible · **Impact** : ⭐⭐⭐⭐

### 6. Lien vers le Classement dans le footer
Les autres onglets ont un lien `data-tab-link-footer` ; le Classement n'en a pas encore.
- **Effort** : très faible · **Impact** : ⭐⭐

### 7. Historique des champions par saison (Hall of Fame)
- **Idée** : dans le Palmarès, un sous-bloc listant, saison par saison, le champion L1, L2, LDC, CDF (avec logos).
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐ (très fun à regarder)

### 8. Export / import du palmarès en JSON manuellement
Un bouton « Exporter JSON » qui télécharge le palmarès (et un « Importer ») pour sauvegarder en local en plus de Drive.
- **Effort** : faible · **Impact** : ⭐⭐⭐

---

## 🎨 UI / UX

### 9. Mode sombre général
Le site est clair avec quelques sections sombres (palmarès). Un bouton bascule clair/sombre apporterait une vraie cohérence visuelle.
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐

### ✅ 10. Animations de célébration améliorées (confettis sur les trophées)
La DNCG utilise déjà des confettis ; on pourrait déclencher un **lâcher de confettis** à chaque trophée remporté (fin de saison, champion CDF/LDC).
- **Effort** : faible · **Impact** : ⭐⭐⭐
- [x] **Fait et vérifié (7 nov. 2026)** : `launchConfetti(trophyType)` avec une palette par compétition
  (`CONFETTI_PALETTES`) est appelée à l'attribution du trophée en Ligue 1, Ligue 2, CDF et LDC.
  CSS `.confetti` + `@keyframes confetti-fall` en place, réutilisés de l'ancienne section DNCG.

### 11. Sons / hymnes pour CDF et LDC
Il y a des hymnes pour L1 et L2 (`ligue1.mp3`, `ligue2.mp3`) ; l'hymne L3 a été supprimé (fichier introuvable) et le doublon `ligue3.mp3` a été retiré du dépôt le 7 nov. 2026.
- **Effort** : faible · **Impact** : ⭐⭐⭐
- [x] **Statut (7 nov. 2026)** : `ldc.mp3` (1 Mo) est désormais **joué par l'onglet LDC** — bouton « Hymne LDC »
  (`data-league-audio="ldc"`) et `<audio id="audio-ldc" src="ldc.mp3" loop preload="none">`, sur le modèle de L1 et L2.
  `champions.html` garde son propre lecteur. Reste à trouver un hymne pour la CDF.

### 12. Page mobile : défilement horizontal du tableau CDF
Vérifier que le bracket CDF/LDC (qui utilise `overflow-x: auto`) soit bien utilisable sur téléphone (déjà stylé, à tester).
- [ ] **Statut (7 nov. 2026)** : des ajustements mobiles ont été ajoutés (bloc `@media (max-width: 768px)` :
  bracket plus compact, tableaux de classement en 0,78 rem, modales scrollables à 88 vh) ;
  il reste à valider le rendu sur un vrai tél.

---

## 🛠️ Technique / robustesse

### 13. Découper le fichier `index.html` (6 786 lignes au 7 nov. 2026)
Tout est dans un seul fichier (HTML + CSS + JS). Le découper en `style.css`, `app.js` et `index.html` réduirait le risque de bugs et faciliterait la maintenance.
- **Effort** : élevé · **Impact** : ⭐⭐⭐⭐ (qualité de code)
- [ ] **Statut (7 nov. 2026)** : non fait. Aucun CSS/JS externe : les anciens `style.css` et `app.js`,
  jamais chargés, ont été retirés du dépôt le 7 nov. 2026. `index.html` reste à 6 786 lignes.

### ✅ 14. Créer un `.gitignore` avec `.freebuff/`
Le dossier `.freebuff/` (base de données interne de l'app) apparaît constamment en untracked. L'ajouter au `.gitignore` éviterait tout risque de le committer par erreur.
- **Effort** : très faible · **Impact** : ⭐⭐⭐
- [x] **Fait et vérifié (7 nov. 2026)** : `.gitignore` présent et suivi par git ; il ignore `.freebuff/`,
  `.DS_Store`, `Thumbs.db`, `*.tmp` et `*.log`.

### 15. Centraliser les données des équipes
Les clubs sont définis dans plusieurs endroits (données initiales, base clubs, GitHub logos). Une source de vérité unique (un seul objet `teams` par ligue + fallback logos GitHub) simplifierait les ajouts/suppressions.
- **Effort** : moyen · **Impact** : ⭐⭐⭐

### 16. Tests automatisés plus complets
Le fichier `cdf_format_test.js` teste déjà la CDF et le Classement. Étendre aux saisons (création, switch, suppression, migration) et à la LDC sécuriserait les évolutions futures.
- **Effort** : faible · **Impact** : ⭐⭐⭐⭐
- [ ] **Statut (7 nov. 2026)** : partiellement fait. La suite compte désormais **122 assertions**
  (et non 26) et couvre la CDF, la LDC (tirage, BYE, vainqueurs, trophée), le Classement, le tri,
  les swap, le catalogue de logos et l'univers des saisons passées. Restent à couvrir : création,
  bascule, suppression et migration d'une saison.

### 17. Gestion d'erreur Drive plus douce
Quand la session Drive expire, tout est protégé par des messages — mais les boutons restent actifs. Une déconnexion auto plus visible (ex. overlay) améliorerait l'expérience.
- **Effort** : faible · **Impact** : ⭐⭐⭐

---

## 🚀 Idées « ambitieuses » (au-delà du scope actuel)

### 18. Simulation automatique des matchs (IA)
Un bouton « Simuler la journée » qui génère des scores aléatoires réalistes (pondérés par la force des équipes) pour jouer toute une saison en quelques clics.
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐⭐ (transformerait le site en vrai simulateur)

### 19. Multijoueur / partage
Un lien public de lecture seule (ou édition partagée) pour montrer le championnat à des amis sans leur donner l'accès Drive.
- **Effort** : élevé · **Impact** : ⭐⭐⭐⭐

### 20. Génération d'un récapitulatif de fin de saison
Un « Journal de la saison » auto-généré : classements finaux, champions, meilleurs buteurs, montées/descentes, en mode récap imprimable.
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐

---

*Fichier généré pour servir de feuille de route. Les items sont classés par ordre d'impact décroissant dans chaque section — à toi de choisir ce qui te tente !*
