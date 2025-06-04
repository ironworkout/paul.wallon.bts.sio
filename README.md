# Documentation du site Championnat des Peluches

Ce document explique la structure et le fonctionnement du site "Championnat des Peluches" qui regroupe la Ligue 1 Peluches, le Teddy Championship (Ligue 2) et la DNCG dans une interface unique avec navigation par onglets.

## Structure du projet

```
peluches-football-documentation/
├── index.html              # Fichier principal du site
├── *.png                   # Images et logos utilisés dans le site
└── data/                   # Dossier contenant les données JSON
    ├── l1-classement.json  # Données de classement de la Ligue 1
    └── l1-results.json     # Données des résultats de la Ligue 1
```

## Fonctionnement général

Le site est une application web statique qui utilise HTML, CSS et JavaScript pour créer une expérience interactive. Il est organisé autour de trois sections principales accessibles via des onglets :

1. **Ligue 1 Peluches** - La première division du championnat
2. **Teddy Championship** - La deuxième division (Ligue 2)
3. **DNCG** - Direction Nationale du Contrôle de Gestion des Peluches

Chaque section a sa propre identité visuelle tout en maintenant une cohérence globale.

## Détail des fichiers

### index.html

Ce fichier contient l'intégralité du code HTML, CSS et JavaScript du site. Il est structuré comme suit :

- **En-tête (`<head>`)** : Métadonnées, titre et styles CSS intégrés
- **Corps (`<body>`)** : 
  - Header avec logo et navigation principale
  - Onglets de navigation entre les trois sections
  - Contenu spécifique à chaque section (caché/affiché via JavaScript)
  - Footer avec liens et informations complémentaires
  - Scripts JavaScript pour les fonctionnalités interactives

### Fichiers d'images

- **Logos d'équipes** :
  - `vafc.png` - Valenciennes Footbalours Club
  - `tfc.png` - Toulours Football Club
  - `pfc.png` - Peluche Football Club
  - `psg.png` - Peluche Saint-Germours
  - `oo.png` - Olympique d'Ours FC
  - `ascl.png` - Associations Carrotes Lapines
  - `l2.png` - Logo générique pour les équipes de Ligue 2

- **Images générées** :
  - `teddy-crowd.png` - Tribune remplie de peluches supporters
  - `teddy-shooting.png` - Ours en peluche tirant un ballon
  - `peluches-celebration.png` - Peluches célébrant un but
  - `rabbit-goalkeeper.png` - Lapin gardien de but
  - `peluches-bras-dessus-bras-dessous.png` - Peluches se tenant par les bras
  - `tifo-peluches.png` - Tribune déployant un tifo coloré
  - `peluches-entree-joueurs.png` - Haie d'honneur de peluches
  - `teddy-championship-logo.png` - Logo du Teddy Championship
  - `valenciennes-supporters.png` - Supporters de Valenciennes

### Fichiers de données

- **l1-classement.json** : Contient les données de classement de la Ligue 1 avec la structure suivante :
  ```json
  {
    "Nom de l'équipe": {
      "logo": "<chemin vers le logo>",
      "points": <nombre de points>,
      "matchs": <nombre de matchs joués>,
      "butsPour": <nombre de buts marqués>,
      "butsContre": <nombre de buts encaissés>
    },
    ...
  }
  ```

- **l1-results.json** : Contient les résultats des matchs de la Ligue 1 avec la structure suivante :
  ```json
  [
    [
      {
        "Équipe 1": <score>,
        "Équipe 2": <score>
      },
      ...
    ],
    ...
  ]
  ```

## Fonctionnalités principales

### 1. Navigation par onglets

Le site utilise un système d'onglets pour naviguer entre les trois sections principales. Le code JavaScript associé est le suivant :

```javascript
// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.getElementById(`${tabId}-content`).classList.add('active');
    });
});
```

### 2. Carrousels interactifs

Chaque section principale dispose d'un carrousel d'images avec navigation automatique et manuelle. Le code JavaScript associé est le suivant :

```javascript
// Carousel
const carousels = document.querySelectorAll('.carousel');

carousels.forEach(carousel => {
    const inner = carousel.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    
    let currentSlide = 0;
    const slideCount = items.length;
    
    // Set initial position
    updateCarousel();
    
    // Event listeners
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });
    
    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateCarousel();
    });
    
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateCarousel();
    });
    
    // Auto slide
    let interval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateCarousel();
    }, 5000);
    
    carousel.addEventListener('mouseenter', () => {
        clearInterval(interval);
    });
    
    carousel.addEventListener('mouseleave', () => {
        interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slideCount;
            updateCarousel();
        }, 5000);
    });
    
    function updateCarousel() {
        inner.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
});
```

### 3. Tableaux de classement dynamiques

Les tableaux de classement sont générés dynamiquement à partir des données JSON. Pour la Ligue 1, le code JavaScript associé est le suivant :

```javascript
// Populate standings table
const l1StandingsBody = document.getElementById('l1-standings-body');

// Sort teams by points
const sortedTeams = Object.entries(l1Teams).sort((a, b) => {
    if (b[1].points !== a[1].points) {
        return b[1].points - a[1].points;
    }
    return b[1].butsPour - a[1].butsPour;
});

sortedTeams.forEach((team, index) => {
    const teamName = team[0];
    const teamData = team[1];
    const diff = teamData.butsPour - teamData.butsContre;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${index + 1}</td>
        <td class="team-info">
            <img src="${teamData.logo}" alt="${teamName}" class="team-logo">
            <span>${teamName}</span>
        </td>
        <td>${teamData.points}</td>
        <td>${teamData.matchs}</td>
        <td>${teamData.butsPour}</td>
        <td>${teamData.butsContre}</td>
        <td>${diff > 0 ? '+' + diff : diff}</td>
    `;
    
    l1StandingsBody.appendChild(row);
});
```

### 4. Fonctionnalité DNCG interactive

La section DNCG propose une fonctionnalité interactive pour générer des montants financiers aléatoires selon le résultat sélectionné (victoire, nul, défaite). Le code JavaScript associé est le suivant :

```javascript
// DNCG Functionality
const dncgTabs = document.querySelectorAll('.dncg-tab');
const genererBtn = document.getElementById('generer');
const resultat = document.getElementById('resultat');
let activeTab = 'victoires';

dncgTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        dncgTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.id;
    });
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createParticles(type) {
    const particleCount = type === 'confetti' ? 50 : 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add(type === 'confetti' ? 'confetti' : 'thumbs-down');
        if (type === 'thumbs-down') {
            particle.innerHTML = '👎';
        }
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        if (type === 'confetti') {
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }
}

genererBtn.addEventListener('click', () => {
    let montant, message;
    switch (activeTab) {
        case 'victoires':
            montant = getRandomInt(150, 300);
            message = `${montant}€ - Excellent !`;
            createParticles('confetti');
            break;
        case 'nuls':
            montant = getRandomInt(0, 150);
            message = `${montant}€ - Pas mal !`;
            break;
        case 'defaites':
            montant = getRandomInt(-150, 0);
            message = `${montant}€ - Dommage...`;
            createParticles('thumbs-down');
            break;
    }
    resultat.textContent = message;
    resultat.style.color = getComputedStyle(document.getElementById(activeTab)).color;
    resultat.classList.remove('animate');
    void resultat.offsetWidth; // Force reflow
    resultat.classList.add('animate');
});
```

### 5. Animations et effets visuels

Le site utilise plusieurs animations et effets visuels pour améliorer l'expérience utilisateur :

- **Animations au scroll** : Les sections apparaissent progressivement lors du défilement
- **Transitions fluides** : Entre les onglets et dans les carrousels
- **Effets de survol** : Sur les boutons, cartes et éléments interactifs
- **Animations spéciales** : Confettis et émojis dans la section DNCG

## Adaptation pour différents écrans

Le site est responsive et s'adapte à différentes tailles d'écran grâce à des media queries :

```css
/* Responsive */
@media (max-width: 768px) {
    .header-container {
        flex-direction: column;
    }
    
    nav ul {
        margin-top: 15px;
    }
    
    .hero {
        height: 400px;
    }
    
    .hero-content h2 {
        font-size: 2rem;
    }
    
    .section-title {
        font-size: 1.5rem;
    }
    
    .standings-table th,
    .standings-table td {
        padding: 8px;
    }
    
    .team-info {
        flex-direction: column;
        align-items: center;
    }
    
    .team-logo {
        margin-right: 0;
        margin-bottom: 5px;
    }
}

@media (max-width: 576px) {
    nav ul {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    nav ul li {
        margin: 5px;
    }
    
    .tabs-container {
        flex-direction: column;
    }
    
    .hero {
        height: 300px;
    }
    
    .hero-content h2 {
        font-size: 1.5rem;
    }
    
    .hero-content p {
        font-size: 1rem;
    }
    
    .standings-table {
        font-size: 0.8rem;
    }
}
```

## Intégration des images générées

Les images générées par IA sont intégrées à différents endroits stratégiques du site :

1. **Carrousels** : Images principales en haut de chaque section
2. **Actualités** : Illustrations des articles de news
3. **Arrière-plans** : Certaines sections utilisent les images comme arrière-plan

## Conseils pour la modification

Si vous souhaitez modifier ce site :

1. **Ajouter une équipe** : Ajoutez les données dans l'objet `l1Teams` ou dans la section HTML correspondante pour la Ligue 2
2. **Modifier le style** : Toutes les règles CSS sont intégrées dans la balise `<style>` en haut du fichier HTML
3. **Ajouter une section** : Créez un nouveau bloc dans la structure HTML et ajoutez un onglet correspondant
4. **Modifier les images** : Remplacez les fichiers PNG tout en conservant les mêmes noms

## URL du site déployé

Le site est accessible à l'adresse suivante : https://fvtyehxw.manus.space
