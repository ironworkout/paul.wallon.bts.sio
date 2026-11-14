# 🎨 VISUELS — direction artistique LDC & CDF

Document de référence pour les visuels des deux coupes. Il fixe les identités, la liste des images à
produire, leurs caractéristiques techniques et les prompts à utiliser. Créé le 7 novembre 2026.

---

## 1. Identités retenues

Les deux compétitions racontent deux univers de télévision différents : **premium nocturne** pour la LDC,
**énergie colorée** pour la CDF.

| | LDC — « premium » (esprit Canal+) | CDF — « énergie » (esprit BeIN Sports) |
|---|---|---|
| Couleur principale | `#101c3a` (noir bleuté) | `#5b2a86` (violet) |
| Accent | `#d4af37` (or) | `#c724b1` (magenta) |
| Fond | noir / bleu nuit, projecteurs, halo | violet → magenta, diagonales, mouvement |
| Typographie | `Oswald` capitales, interlettrage large | `Oswald` capitales, plus condensé et dense |
| Sensation | calme, or, nuit de gala | vitesse, foule, confettis |

Ces valeurs sont les variables CSS `--nav-ldc-color` / `--nav-ldc-accent` et
`--nav-cdf-color` / `--nav-cdf-accent`, désormais utilisées par les bordures, les bandeaux et les halos.

> ⚠️ Aucun logo officiel (Canal+, beIN Sports, Ligue des Champions, FFF) : ce sont des marques déposées.
> On reprend le **langage graphique** (palette, lumière, grain, composition), jamais les identités.

## 2. Images à produire

Format cible : **WebP q80**, PNG-24 uniquement pour ce qui doit être détouré.
Budget total visé : **≤ 1,6 Mo**. Conversion : `cwebp -q 80 -m 6 source.png -o sortie.webp`.

### LDC

| Fichier | Dimensions | Poids cible | Emplacement |
|---|---|---|---|
| `ldc-hero.webp` | 1920×640 | ~140 Ko | haut de `#ldc-content`, avant `.section-header` |
| `ldc-trophy.webp` (transparent) | 800×800 | ~90 Ko | près du titre, et écran champion |
| `ldc-draw.webp` | 1200×800 | ~110 Ko | `#ldc-draw-section` |
| `ldc-empty.webp` | 1200×600 | ~90 Ko | état « aucune saison » |
| `ldc-champion.webp` | 1600×900 | ~200 Ko | célébration du champion LDC |

### CDF

| Fichier | Dimensions | Poids cible | Emplacement |
|---|---|---|---|
| `cdf-hero.webp` | 1920×640 | ~140 Ko | haut de `#cdf-content` |
| `cdf-trophy.webp` (transparent) | 800×800 | ~90 Ko | `#cdf-final-badge`, `#cdf-champion-celebration` |
| `cdf-draw.webp` | 1200×800 | ~110 Ko | `#cdf-draw-section` |
| `cdf-empty.webp` | 1200×600 | ~90 Ko | état « aucune saison » |
| `cdf-champion.webp` | 1600×900 | ~200 Ko | `#cdf-champion-celebration` |

### Transverse

| Fichier | Dimensions | Poids cible | Usage |
|---|---|---|---|
| `peluches-tv-studio.webp` | 1600×900 | ~180 Ko | plateau TV, réutilisable barrages / palmarès |

Les pastilles de tours (32es → finale) et les bandeaux de compétition **ne sont pas des images** : ils se
font en CSS (cercle bordé or ou violet, bande dégradée), pour rester nets sur mobile et ne rien peser.

## 3. Contraintes de production

- Les illustrations doivent rester **cohérentes avec l'univers peluches** : ce sont des jouets en feutrine,
  pas des humains. Même si l'éclairage est « TV », la texture feutrine doit rester visible.
- Pas de texte dans les images (le texte est en HTML, sinon il devient illisible sur mobile).
- Pas de visages réalistes ni de marques, pas de sponsors, pas de logos de clubs.
- Toujours livrer en 16:9 ou 3:1, jamais en portrait (les portraits cassent les bandeaux).
- Vérifier chaque visuel à 375 px de large : le sujet doit rester identifiable une fois réduit.

## 4. Prompts prêts à l'emploi

### LDC — hero (1920×640)
> Cinematic wide photograph of a nighttime football stadium seen from pitch level, filled with plush toys
> as spectators. Dramatic floodlights, deep black and midnight blue shadows, thin golden rim light on the
> plush silhouettes. A soft golden haze in the air, subtle film grain, premium broadcast look. Shallow
> depth of field, focus on a few plush toys in the foreground. Palette: #101c3a, #d4af37, warm white.
> No text, no logos, no human faces.

### LDC — trophée (800×800, transparent)
> Studio product shot of a stylized silver and gold cup trophy, tall handles, polished metal, soft golden
> halo behind it, pure black background to be removed. Ultra clean edges, no reflections of a room, no
> text, no real club crest. Premium sports broadcast trophy aesthetic.

### LDC — tirage (1200×800)
> Close-up of plush paws drawing small golden balls from a glass bowl, dark velvet table, single warm
> spotlight from above, deep shadows, golden bokeh, cinematic broadcast aesthetic. Palette #101c3a with
> gold #d4af37. No text, no logos.

### LDC — champion (1600×900)
> Plush toys lifting a golden trophy together under falling golden confetti, dark stadium background with
> floodlights flaring, dramatic backlight, film grain, wide cinematic framing, celebration and joy.
> Palette: black, midnight blue, gold. No text, no logos.

### CDF — hero (1920×640)
> Dynamic wide shot of plush toy footballers running across a bright pitch, magenta and violet stage
> lighting washing the scene, motion blur on the sidelines, swirling particles, energetic sports broadcast
> opener aesthetic. Palette: #5b2a86, #c724b1, white. High contrast, clean diagonal light streaks.
> No text, no logos.

### CDF — trophée (800×800, transparent)
> Studio shot of a modern silver cup trophy with a wide bowl and short handles, violet and magenta rim
> lighting, clean white-to-transparent background for removal, crisp edges, glossy metal. Energetic modern
> sports aesthetic. No text, no crest.

### CDF — tirage (1200×800)
> Plush paws mixing violet and magenta balls in a bowl, bright studio lighting with magenta gradient
> background, confetti specks in the air, dynamic diagonal composition. Palette: #5b2a86, #c724b1, white.
> No text, no logos.

### CDF — champion (1600×900)
> Plush toys celebrating on the pitch with magenta confetti explosion, violet stadium lighting, raised
> arms and trophy lift, wide dynamic angle, bright highlights, joyful energy. Palette: violet, magenta,
> white. No text, no logos.

## 5. Étapes suivantes

1. Couleurs et habillage CSS : **fait** (identités permutées, bandeaux et halos en place).
2. Compression des illustrations existantes : **fait** (6 visuels passés en WebP).
3. Produire les 10 visuels ci-dessus, puis les brancher aux emplacements indiqués.
4. Après chaque ajout : `node cdf_format_test.js` et vérifier que le poids total des médias ne dépasse pas
   ~8 Mo.

---

## Habillage TV 2026 — cartes clubs et tableaux de score

### Les stades intégrés aux cartes clubs
Chaque club parodié affiche désormais son stade sur sa propre carte, dans la compétition où il évolue
(L1, L2, L3) et dans la liste des clubs internationaux pour la LDC. Les galeries séparées ont disparu :
l'image est rattachée au club, pas à une page.

| Club | Visuel | Ligue |
| --- | --- | --- |
| Valenciennes FC | `stade-vafc` | L1 |
| Toulours FC | `foule-toulours` | L1 |
| PSG Peluches | `tifo-psg` | L1 |
| Olympique Ours | `foule-olympique-ours` | L1 |
| AS Carrotes | `foule-orange-blanc` | L1 |
| AS Saint-Ettours | `stade-saint-ettours` | L2 |
| Patapouf FC | `tifo-patapouf` | L2 |
| Tours FC | `foule-tours` | L2 |
| FC Poussins | `tifo-poussins` | L2 |
| Clermandala 63 | `foule-clermandala` | L2 |
| Oursons FC | `stade-oursons` | L3 |
| FC Doudou | `tifo-doudou` | L3 |
| Real Madrours | `stade-madrours` | LDC |
| Dourstmund | `tifo-dourstmund` | LDC |
| PopoGlimt | `tribune-popolglimt` | LDC |

Les bannières sont résolues par le nom du club, puis par son logo : un club renommé (par exemple
« Peluche SG ») conserve ainsi le visuel de son logo, et les variantes Peluche SG/PSG sans logo connu
retombent sur `tifo-psg`.

Chaque visuel existe en deux tailles : `*.webp` (1600 × 900, ~120–260 Ko) et `*-card.webp`
(760 px, ~40–75 Ko) servi via `srcset` pour les cartes. Les clubs sans photo gardent une carte
sobre : écusson sur dégradé nuit.

### Tableaux de score
Un gabarit unique (`buildScorebug`) sert les deux diffuseurs :

- **Canal Plours** (LDC) : fond nuit, liseré et chiffres or, marque « + », pastille DIRECT rouge,
  bande de stade en tête de match, ligne du qualifié surlignée.
- **bePeluche Sports** (CDF) : dégradé violet, accents magenta, mêmes codes de lecture.

Le trophée de la LDC porte désormais une **étoile** gravée en or sur la panse, reprise à côté du
bandeau « Champion LDC ».
