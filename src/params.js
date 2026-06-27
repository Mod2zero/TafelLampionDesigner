// Parameterschema + defaults voor de Lampion J1701-configurator.
// Alle maten in mm. Toleranties en module-afmetingen zijn bewust parametrisch:
// de J1701 varieert per exemplaar → kalibreer met het meetijkje.

export const defaults = {
  // ---- Vorm (draailichaam) ----
  height: 150,
  baseRadius: 40,
  bellyRadius: 62,
  bellyPos: 0.34,
  shoulderRadius: 47,
  shoulderPos: 0.80,
  topRadius: 45,        // = buitenstraal van de schone cilindrische bovenrand (kap ↔ kraag)
  rimHeight: 6,         // hoogte van de rechte cilindrische rand (≥3 mm tegen rafelen)

  // ---- Wand / lichtdoorlaat ----
  // Wanddikte = één nozzlebreedte. 0,4 nozzle → ~0,8 mm · 0,6 nozzle → ~1,0 mm.
  wallThickness: 0.9,

  // ---- Stijl ----
  style: 'organic',     // 'organic' | 'ribbed' | 'faceted'
  twistDeg: 90,         // spiraal-draaiing (organic)
  rippleAmp: 2.0,       // lage-frequentie golf in hoogte (organic) [mm]
  rippleCount: 4,
  fluteAmp: 2.5,        // verticale groeven (ribbed/organic) [mm]
  fluteCount: 22,
  facetCount: 8,        // N-hoek doorsnede (faceted)

  // ---- Resolutie ----
  verticalSegments: 160,
  radialSegments: 200,

  // ---- Kraag / LED-hub ----
  moduleDiameter: 94,   // J1701 nominaal Ø94 (meten!)
  moduleThickness: 10,  // dikte van de modulerand die de clips vastpakken
  clipCount: 4,
  moduleClearance: 0.35,// speling clip ↔ module (default 0,35 mm)
  clampClearance: 0.25, // speling klem ↔ kapbovenrand (0,20–0,30 mm)
  gripLip: 1.0,         // hoe diep de griplip naar binnen haakt (0,8–1,2 mm)
  gripLipHeight: 1.6,
  clipWidth: 9,         // tangentiële breedte van elke clip
  clipThickness: 2.2,   // radiale dikte van de clip-arm
  clipLength: 13,       // lengte van de clip-arm (≈ moduledikte + lip)
  clampDepth: 7,        // hoe ver de klem over de kaprand grijpt
  clampWall: 2.2,       // wanddikte van de klem-skirt
  shelfThickness: 2.4,  // dikte van de draagring waar de module op rust
  moduleSeatWidth: 6,   // breedte van de richel waar de modulerand op steunt

  // ---- Simulatie ----
  ledColor: '#ff9d4d',  // warme LED (~2200 K)
  glow: 1.0,            // globale gloedsterkte
  bloom: true,
  bloomStrength: 0.9,
  shadeColor: '#efe3cf',// kleur van de kap in atelier-modus
};

// UI-secties (de panel-builder leest dit schema).
export const schema = [
  { title: 'Stijl', num: '01', kind: 'style' },
  { title: 'Vorm', num: '02', items: [
    { key: 'height',         label: 'Hoogte',          min: 80,  max: 320, step: 1,   unit: 'mm' },
    { key: 'baseRadius',     label: 'Bodem',           min: 15,  max: 110, step: 1,   unit: 'mm' },
    { key: 'bellyRadius',    label: 'Buik',            min: 25,  max: 140, step: 1,   unit: 'mm' },
    { key: 'bellyPos',       label: 'Buikpositie',     min: 0.08,max: 0.85,step: 0.01,fmt: v => v.toFixed(2) },
    { key: 'shoulderRadius', label: 'Schouder',        min: 15,  max: 120, step: 1,   unit: 'mm' },
    { key: 'shoulderPos',    label: 'Schouderpositie', min: 0.45,max: 0.92,step: 0.01,fmt: v => v.toFixed(2) },
    { key: 'topRadius',      label: 'Bovenrand (Ø/2)', min: 25,  max: 70,  step: 0.5, unit: 'mm' },
    { key: 'rimHeight',      label: 'Randhoogte',      min: 3,   max: 16,  step: 0.5, unit: 'mm' },
  ]},
  { title: 'Lichtdoorlaat', num: '03', items: [
    { key: 'wallThickness',  label: 'Wanddikte (1 nozzle)', min: 0.4, max: 1.6, step: 0.05, unit: 'mm' },
    { key: 'glow',           label: 'Gloed',           min: 0.2, max: 2.0, step: 0.05, fmt: v => v.toFixed(2) },
  ]},
  { title: 'Textuur', num: '04', items: [
    { key: 'twistDeg',    label: 'Draaiing',        min: -360, max: 360, step: 5, unit: '°' },
    { key: 'rippleAmp',   label: 'Golf (hoogte)',   min: 0, max: 12, step: 0.5, unit: 'mm' },
    { key: 'rippleCount', label: 'Aantal golven',   min: 1, max: 14, step: 1 },
    { key: 'fluteAmp',    label: 'Groeven',         min: 0, max: 10, step: 0.5, unit: 'mm' },
    { key: 'fluteCount',  label: 'Aantal groeven',  min: 4, max: 48, step: 1 },
    { key: 'facetCount',  label: 'Facetten (N-hoek)', min: 3, max: 24, step: 1 },
  ]},
  { title: 'Kraag / LED-hub', num: '05', items: [
    { key: 'moduleDiameter',  label: 'Module Ø (J1701)', min: 80, max: 110, step: 0.5, unit: 'mm' },
    { key: 'moduleThickness', label: 'Module dikte',     min: 5,  max: 25,  step: 0.5, unit: 'mm' },
    { key: 'clipCount',       label: 'Aantal clips',     min: 3,  max: 6,   step: 1 },
    { key: 'moduleClearance', label: 'Speling module',   min: 0.1,max: 0.7, step: 0.05, unit: 'mm' },
    { key: 'clampClearance',  label: 'Speling klem',     min: 0.1,max: 0.6, step: 0.05, unit: 'mm' },
    { key: 'gripLip',         label: 'Griplip',          min: 0.6,max: 1.8, step: 0.1, unit: 'mm' },
    { key: 'clampDepth',      label: 'Klemdiepte',       min: 4,  max: 14,  step: 0.5, unit: 'mm' },
  ]},
  { title: 'Simulatie', num: '06', items: [
    { key: 'bloomStrength', label: 'Bloom',  min: 0, max: 2.0, step: 0.05, fmt: v => v.toFixed(2) },
  ]},
];

export function makeParams() {
  return { ...defaults };
}
