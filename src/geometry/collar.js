// LED-RUSTHUIZING ("houder") en MEETIJKJE — opgebouwd uit samengevoegde primitieven.
// Geen CSG/boolean-library: overlappende primitieven slicen prima voor een
// normaal-geprint onderdeel (de slicer verenigt de volumes).
//
// De houder is een cupje dat VERZONKEN in de mond van de kap zakt:
//   • randlip   — rust op de bovenrand van de kap (verbergt de naad)
//   • cupwand   — zakt in de kapmond (pasvorm) en centreert de module zijdelings
//   • steunrichel (bodem) — de J1701 RUST met zijn Ø102-rand hierop (zwaartekracht)
//   • centrale opening — de LED schijnt door de Ø94-opening naar beneden de kap in
// Optioneel: kleine borgnokjes over de rand voor transport.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Normaliseer naar niet-geïndexeerd met enkel 'position' zodat merge attributen matchen.
function prep(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const src = g.getAttribute('position');
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(src.array.slice(0), 3));
  if (g !== geo) g.dispose();
  return out;
}

// Afgeleide maten van de rusthuizing (ook gebruikt voor visualisatie/assemblage).
export function collarMetrics(p) {
  const wall = p.wallThickness;
  const Rko = p.topRadius;          // kap buitenstraal (bovenrand)
  const Rki = Rko - wall;           // kap binnenstraal (de mond)

  const flangeR = p.moduleFlangeDiameter / 2;
  const boreR = p.moduleBoreDiameter / 2;

  // Cup: buiten past in de kapmond, binnen omhult de module-rand.
  const cupOuterR = Rki - p.houderPlugClearance;
  const cupInnerR = flangeR + p.moduleClearance;
  const houderWall = Math.max(1.4, cupOuterR - cupInnerR); // afgeleid; min. 1,4 mm

  // Steunrichel: opening laat de LED door, richel draagt de rand.
  const openingR = Math.min(cupInnerR - 0.8, Math.max(boreR + 1.0, flangeR - p.ledgeWidth));

  const ledgeT = p.ledgeThickness;
  const cupDepth = p.cupDepth;
  const lipT = p.lipThickness;
  const totalHeight = ledgeT + cupDepth;

  return {
    Rko, Rki, flangeR, boreR,
    cupOuterR, cupInnerR, houderWall,
    openingR, ledgeT, cupDepth, lipT,
    lipOuterR: Rko,                 // lip ligt gelijk met de kap-buitenrand
    totalHeight,
    fits: cupOuterR > cupInnerR + 1.0, // genoeg wand? (anders kap-bovenrand te klein)
    ledOpeningDiameter: openingR * 2,
  };
}

// Optionele borgnokjes (kleine inwaartse boxjes net boven de richel-zone).
function retentionParts(p, m) {
  const out = [];
  const n = Math.round(p.retentionTabs);
  if (n < 1) return out;
  const tabW = 8, tabH = 2.2, tabReach = 1.4;
  const yTop = m.ledgeT + Math.min(m.cupDepth - 1, p.moduleHeight); // net boven de module-rand
  for (let k = 0; k < n; k++) {
    const ang = (k / n) * Math.PI * 2;
    const rot = new THREE.Matrix4().makeRotationY(ang);
    const tab = new THREE.BoxGeometry(tabReach + m.houderWall, tabH, tabW);
    // buitenvlak ingebed in de wand, steekt `tabReach` naar binnen over de rand
    tab.translate(m.cupInnerR - tabReach + (tabReach + m.houderWall) / 2, yTop + tabH / 2, 0);
    tab.applyMatrix4(rot);
    out.push(prep(tab));
  }
  return out;
}

function assemble(parts) {
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.translate(0, -merged.boundingBox.min.y, 0);
  return merged;
}

// Doorsnede van het cup-massief, één gesloten polygoon → één revolve = watertight
// manifold (geen overlappende primitieven). `depth` = cup-binnendiepte.
function cupProfile(m, depth) {
  const totalH = m.ledgeT + depth;
  return [
    new THREE.Vector2(m.openingR, 0),               // opening, bodem
    new THREE.Vector2(m.openingR, m.ledgeT),        // omhoog langs de LED-opening
    new THREE.Vector2(m.cupInnerR, m.ledgeT),       // de steunrichel (module rust hier)
    new THREE.Vector2(m.cupInnerR, totalH),         // omhoog langs de binnenwand
    new THREE.Vector2(m.lipOuterR, totalH),         // randlip-bovenkant naar buiten
    new THREE.Vector2(m.lipOuterR, totalH - m.lipT),// lip-buitenkant omlaag
    new THREE.Vector2(m.cupOuterR, totalH - m.lipT),// terug naar de cupwand
    new THREE.Vector2(m.cupOuterR, 0),              // omlaag langs de buitenwand
    new THREE.Vector2(m.openingR, 0),               // sluit de doorsnede
  ];
}

function buildCup(m, depth, withTabs, p) {
  // Omgekeerde doorsnede-volgorde → revolve-normalen wijzen naar buiten.
  const cup = new THREE.LatheGeometry(cupProfile(m, depth).reverse(), 160);
  const parts = [prep(cup)];
  if (withTabs) retentionParts(p, m).forEach((g) => parts.push(g));
  return assemble(parts);
}

// Volledige rusthuizing. Print-oriëntatie: lip plat op het bed, opening omhoog.
export function buildCollarGeometry(p) {
  const m = collarMetrics(p);
  return buildCup(m, m.cupDepth, p.retentionTabs >= 1, p);
}

// MEETIJKJE: korte cup om de pasvorm te testen — rust de module op de richel?
// zakt de cup in de kapmond? — vóór een volledige print.
export function buildGaugeGeometry(p) {
  const m = collarMetrics(p);
  return buildCup(m, Math.min(m.cupDepth, 6), false, p);
}
