// Parameterschema + defaults voor de Lampion J1701-configurator.
// Alle maten in mm.
//
// TWEE printbare delen:
//   1) LAMPION (kap) — vase-mode, één doorlopende lichtdoorlatende wand.
//   2) LED-RUSTHUIZING — een cupje dat verzonken in de kapmond zakt; de J1701
//      RUST met zijn Ø102-rand op een richel (zwaartekracht), LED schijnt door
//      de centrale opening naar beneden. Geen clips nodig.
// Het meetijkje is enkel een los kalibratie-testprintje, geen product-onderdeel.
//
// Opgemeten J1701: rand/kraag Ø102 · onderkant-binnen (LED-opening) Ø94 · hoogte 12 mm.
// Maten blijven parametrisch (exemplaren variëren) → kalibreer met het meetijkje.

export const defaults = {
  // ---- Vorm (draailichaam) ----
  height: 170,
  baseRadius: 46,
  bellyRadius: 72,
  bellyPos: 0.38,
  shoulderRadius: 56,
  shoulderPos: 0.80,
  topRadius: 56,        // buitenstraal bovenrand (Ø112) — breed genoeg om de Ø102-module te verzinken
  rimHeight: 6,         // rechte cilindrische rand (≥3 mm tegen rafelen)

  // ---- Wand / lichtdoorlaat ----
  wallThickness: 0.9,   // = één nozzlebreedte (0,4 nozzle → ~0,8 · 0,6 nozzle → ~1,0)

  // ---- Stijl ----
  style: 'organic',     // 'organic' | 'ribbed' | 'faceted'
  twistDeg: 90,
  rippleAmp: 2.0,
  rippleCount: 4,
  fluteAmp: 2.5,
  fluteCount: 24,
  facetCount: 8,

  // ---- Resolutie ----
  verticalSegments: 160,
  radialSegments: 200,

  // ---- J1701-module (opgemeten) ----
  moduleFlangeDiameter: 102, // Ø van de rand die op de richel rust
  moduleBoreDiameter: 94,    // Ø onderkant-binnen = LED-opening
  moduleHeight: 12,          // hoogte van de module

  // ---- LED-rusthuizing (cupje) ----
  moduleClearance: 0.4,      // speling rand ↔ cupwand (zijdelings centreren)
  houderPlugClearance: 0.4,  // speling cup ↔ kapmond (verzonken pasvorm)
  ledgeWidth: 3.0,           // breedte van de steunrichel onder de rand
  ledgeThickness: 2.6,       // dikte van de bodemrichel (vloer onder de module)
  cupDepth: 13.0,            // binnendiepte rond de module (≈ moduledikte + speling)
  lipThickness: 2.2,         // randlip die op de kapbovenrand rust
  retentionTabs: 0,          // optionele borgnokjes over de rand (0 = puur rusten)

  // ---- Simulatie ----
  ledColor: '#ff9d4d',
  glow: 1.0,
  bloom: true,
  bloomStrength: 0.9,
  shadeColor: '#efe3cf',
};

// UI-secties (de panel-builder leest dit schema).
export const schema = [
  { title: 'Stijl', num: '01', kind: 'style' },
  { title: 'Vorm', num: '02', items: [
    { key: 'height',         label: 'Hoogte',          min: 90,  max: 340, step: 1,   unit: 'mm' },
    { key: 'baseRadius',     label: 'Bodem',           min: 20,  max: 120, step: 1,   unit: 'mm' },
    { key: 'bellyRadius',    label: 'Buik',            min: 30,  max: 150, step: 1,   unit: 'mm' },
    { key: 'bellyPos',       label: 'Buikpositie',     min: 0.08,max: 0.85,step: 0.01,fmt: v => v.toFixed(2) },
    { key: 'shoulderRadius', label: 'Schouder',        min: 30,  max: 130, step: 1,   unit: 'mm' },
    { key: 'shoulderPos',    label: 'Schouderpositie', min: 0.45,max: 0.92,step: 0.01,fmt: v => v.toFixed(2) },
    { key: 'topRadius',      label: 'Bovenrand (Ø/2)', min: 53,  max: 80,  step: 0.5, unit: 'mm' },
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
  { title: 'LED-rusthuizing', num: '05', items: [
    { key: 'moduleFlangeDiameter', label: 'Module rand-Ø', min: 90, max: 120, step: 0.5, unit: 'mm' },
    { key: 'moduleBoreDiameter',   label: 'LED-opening Ø',  min: 70, max: 110, step: 0.5, unit: 'mm' },
    { key: 'moduleHeight',         label: 'Module hoogte',  min: 6,  max: 25,  step: 0.5, unit: 'mm' },
    { key: 'moduleClearance',      label: 'Speling module', min: 0.1,max: 0.8, step: 0.05, unit: 'mm' },
    { key: 'houderPlugClearance',  label: 'Speling kapmond', min: 0.1,max: 0.7, step: 0.05, unit: 'mm' },
    { key: 'ledgeWidth',           label: 'Steunrichel',    min: 1.5,max: 6,   step: 0.5, unit: 'mm' },
    { key: 'retentionTabs',        label: 'Borgnokjes',     min: 0,  max: 4,   step: 1 },
  ]},
  { title: 'Simulatie', num: '06', items: [
    { key: 'bloomStrength', label: 'Bloom',  min: 0, max: 2.0, step: 0.05, fmt: v => v.toFixed(2) },
  ]},
];

export function makeParams() {
  return { ...defaults };
}
