# 🧸 Améliorations proposées — Championnat des Peluches

Liste d'idées pour faire évoluer le projet, classées par thème et par impact/effort.

---

## 🎯 Priorité haute — fonctionnalités de jeu

### 1. Matchs avec prolongations et tirs au but en CDF/LDC
Actuellement, un match à égalité est départagé par tirs au but *aléatoires*.
- **Idée** : ajouter un mini-écran « Prolongations + Tirs au but » avec des boutons (ex. tir de chaque équipe, penalty raté/réussi).
- **Effort** : moyen · **Impact** : ⭐⭐⭐⭐⭐ (le suspense du jeu !)

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

### 10. Animations de célébration améliorées (confettis sur les trophées)
La DNCG utilise déjà des confettis ; on pourrait déclencher un **lâcher de confettis** à chaque trophée remporté (fin de saison, champion CDF/LDC).
- **Effort** : faible · **Impact** : ⭐⭐⭐

### 11. Sons / hymnes pour CDF et LDC
Il y a des hymnes pour L1/L2/L3 (`ligue1.mp3`, `ligue2.mp3`, `ligue3.mp3`) — ajouter des hymnes LDC et CDF (ou les réutiliser).
- **Effort** : faible · **Impact** : ⭐⭐⭐

### 12. Page mobile : défilement horizontal du tableau CDF
Vérifier que le bracket CDF/LDC (qui utilise `overflow-x: auto`) soit bien utilisable sur téléphone (déjà stylé, à tester).

---

## 🛠️ Technique / robustesse

### 13. Découper le fichier `index.html` (~5 500 lignes)
Tout est dans un seul fichier (HTML + CSS + ~2 500 lignes de JS). Le découper en `style.css`, `app.js` et `index.html` réduirait le risque de bugs et faciliterait la maintenance.
- **Effort** : élevé · **Impact** : ⭐⭐⭐⭐ (qualité de code)

### 14. Créer un `.gitignore` avec `.freebuff/`
Le dossier `.freebuff/` (base de données interne de l'app) apparaît constamment en untracked. L'ajouter au `.gitignore` éviterait tout risque de le committer par erreur.
- **Effort** : très faible · **Impact** : ⭐⭐⭐

### 15. Centraliser les données des équipes
Les clubs sont définis dans plusieurs endroits (données initiales, base clubs, GitHub logos). Une source de vérité unique (un seul objet `teams` par ligue + fallback logos GitHub) simplifierait les ajouts/suppressions.
- **Effort** : moyen · **Impact** : ⭐⭐⭐

### 16. Tests automatisés plus complets
Le fichier `cdf_format_test.js` teste déjà la CDF et le Classement (26 assertions). Étendre aux saisons (création, switch, suppression, migration) et à la LDC sécuriserait les évolutions futures.
- **Effort** : faible · **Impact** : ⭐⭐⭐⭐

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
