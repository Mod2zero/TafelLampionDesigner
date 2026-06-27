# Lampion J1701

Een browser-gebaseerde **parametrische configurator** voor een 3D-printbare
tafellampion die een gerecupereerde **IKEA SOLVINDEN J1701** zonne-LED-module
hergebruikt (de ronde module waar de lichtsnoeren aan vastklikken; snoeren
verwijderd). De module zit bovenop, **LED naar beneden**, en verlicht de lampion
van binnenuit. De zonnecel kijkt door de centrale opening naar boven en laadt
overdag op.

De app exporteert **twee printbare onderdelen** (plus een meetijkje):

| Onderdeel | Print | Functie |
|---|---|---|
| **KAP** | spiral/vase-mode | het lampionlichaam — één doorlopende, lichtdoorlatende wand |
| **KRAAG** (LED-hub) | normaal | klemt over de kapbovenrand en houdt de J1701 met cantilever-clips |
| **MEETIJKJE** | normaal | enkel de clipzone als ring, om de module-speling te kalibreren |

![twee modi: atelier om te ontwerpen, nacht om de gloed te simuleren]

## Functies

- **Parametrisch draailichaam** — bodem, buik (+positie), schouder (+positie), hoogte,
  bovenrand. Smoothstep-profiel met een schone, rechte cilindrische bovenrand.
- **Drie stijlfamilies** — *organisch/spiraal* (twist + lage-frequentie golf),
  *geribd* (verticale groeven, klassieke lampion) en *gefacetteerd* (N-hoek-doorsnede).
- **Wanddikte als "lichtdoorlaat"** — default afgestemd op vase-mode (één nozzlebreedte).
- **Parametrische kraag** — module-Ø, aantal clips, griplip, speling (default 0,35 mm);
  de klem-binnen-Ø wordt afgeleid van de kapbovenrand.
- **Realtime nacht-simulator** — donkere scène, warme LED-puntbron van bovenaf,
  gloeiende wand (dunner = feller, groeven feller), bloom-halo, warme lichtplas op tafel.
- **Atelier-modus** — neutrale studiobelichting om rustig te ontwerpen.
- **Export per onderdeel** als STL + aanbevolen printinstellingen.
- **Manifold-validatie** — controleer in de browser of de kap watertight is
  (ook headless via `npm run validate`).

## Snel starten

```bash
npm install
npm run dev          # ontwikkelserver (Vite)
npm run build        # statische build → dist/
npm run build:single # alles inline in één dist-standalone/index.html
npm run preview      # bekijk de build lokaal
npm run validate     # headless geometrie-validatie + sample-STL's in samples/
```

Open de dev-URL, kies een preset, stem de vorm/stijl af, schakel tussen
**Atelier** en **Nacht**, en exporteer.

## De app bekijken

Je hebt **GitHub niet nodig** om de app te zien. Drie manieren:

1. **Lokaal ontwikkelen** — `npm run dev`, open `http://localhost:5173`.
   (Dubbelklikken op `index.html` werkt *niet*: een Vite-app heeft de server of een
   build nodig.)
2. **Eén bestand, dubbelklikken** — `npm run build:single` bouwt alles (JS + CSS)
   inline in **`dist-standalone/index.html`**. Dat ene bestand open je rechtstreeks
   in Chrome (dubbelklik, `file://`), zet je op een USB-stick, of plak je in een
   claude.ai-artifact. Werkt offline; enkel de lettertypes laden extern (met
   serif/mono-fallback). Three.js zit volledig ingebakken.
3. **Statisch hosten (optioneel)** — `npm run build` → upload `dist/` naar
   GitHub Pages, Cloudflare Pages of Netlify (zie *Deploy* onderaan).

## Architectuur

```
index.html              # shell + atelier-styling
src/
  main.js               # bootstrap, render-loop, mode-switch
  params.js             # parameterschema + defaults
  presets.js            # stijlpresets + kleurstalen
  ui/panel.js           # sliders, toggles, presets, kleuren, export
  geometry/profile.js   # keypoint-profiel + smooth interpolatie (rechte rand)
  geometry/styles.js    # organic/spiral · ribbed · faceted modifiers + gloed-helderheid
  geometry/shade.js     # PREVIEW (dubbelwand) + EXPORT (watertight single-solid)
  geometry/collar.js    # LED-hub + meetijkje uit samengevoegde primitieven
  sim/lighting.js       # atelier + nacht, glow-shader, bloom-pipeline
  export/stl.js         # STL per onderdeel + instellingen-sheet
  print/validate.js     # manifold-check + tolerantietabel
scripts/validate.mjs    # headless validatie (Node)
public/fit-gauge.md     # uitleg meetijkje
```

### Vase-mode ≠ dubbelwand (de kern)

De **preview** is een dubbelwand (mooi en accuraat voor de simulator). De
**KAP-export** is iets anders: één buitenoppervlak als **watertight manifold-solid**
met een massieve bodem en een propere cilindrische bovenrand. De slicer maakt de
enkele wand (spiralize); jij levert enkel een schone manifold. De dubbelwand-mesh
wordt **nooit** als kap-STL geëxporteerd.

De kraag is opgebouwd uit **samengevoegde primitieven** (`BufferGeometryUtils.mergeGeometries`)
— geen CSG/boolean-library. Overlappende primitieven slicen prima voor een
normaal-geprint onderdeel.

## Printinstellingen

### KAP — vase / spiral-mode
- **Spiralize outer contour / Spiral vase: AAN**
- Wanddikte = 1 perimeter = de ingestelde wanddikte (0,8–1,0 mm; 0,4 nozzle → ~0,8 mm, 0,6 nozzle → ~1,0 mm)
- Laaghoogte 0,20–0,28 mm · 4–5 bodemlagen · 0 toplagen · 0 % infill · geen supports
- Materiaal: **wit/naturel PLA of PETG** geeft de warmste gloed

### KRAAG — normaal
- Oriëntatie: **platte ring op het bed, clips omhoog**
- 3 perimeters · laaghoogte 0,16–0,20 mm · 20–30 % infill · geen supports (griplip-overhang is bridgebaar)
- Materiaal: **PETG aanbevolen** (clips minder bros dan PLA)

### MEETIJKJE
- Zelfde instellingen als de kraag. Zie [`public/fit-gauge.md`](public/fit-gauge.md).

## Toleranties (startwaarden, mm)

| Tolerantie | Bereik | Parameter |
|---|---|---|
| Module-speling (clip ↔ J1701) | 0,30 – 0,40 | `Speling module` |
| Klem-speling (kraag ↔ kapbovenrand) | 0,20 – 0,30 | `Speling klem` |
| Griplip (haakdiepte) | 0,8 – 1,2 | `Griplip` |

De J1701-maten variëren per exemplaar → **meet je module** en **print eerst het meetijkje**.

## Montage

1. Print de **KAP** (vase-mode) en de **KRAAG** (normaal, PETG).
2. Zet de kraag met de **klem-skirt over de bovenrand** van de kap (lichte pasdruk).
3. Plaats de **J1701** met de **LED naar beneden** in de kraag; de clips klikken
   over de modulerand. De zonnecel kijkt naar boven door de centrale opening.
4. Klaar — de LED schijnt naar beneden de kap in en de wand gloeit.

## Deploy (statische hosting)

`npm run build` levert een statische `dist/`. De `base` in `vite.config.js` staat op
`./` zodat het ook onder een subpad werkt.

- **GitHub Pages** — publiceer `dist/` (bv. via een action of de `gh-pages`-branch).
- **Cloudflare Pages / Netlify** — build command `npm run build`, output `dist/`.

Geen backend, geen accounts — pure statische site.

## Stack

Vite · vanilla JS-modules · three.js (r160) · STLExporter · postprocessing (UnrealBloom).

## Herkomst

Geport en gerefactord vanuit een single-file Three.js-vaas-prototype: de
profiel-wiskunde (smoothstep-keypoints), de **radius-gebaseerde groefdetectie**
en de twist/ripple-modifiers zijn hergebruikt en uitgebreid naar een lampion met
vase-mode-export, kraag, nacht-simulator en meetijkje.
