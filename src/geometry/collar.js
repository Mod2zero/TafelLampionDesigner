// KRAAG (LED-hub) en MEETIJKJE — opgebouwd uit samengevoegde primitieven.
// Geen CSG/boolean-library: overlappende primitieven slicen prima voor een
// normaal-geprint onderdeel (de slicer verenigt de volumes).
//
// Opbouw (print-oriëntatie = functionele oriëntatie, bodem op het bed):
//   • klem-skirt  — grijpt over de bovenrand van de kap (binnen-Ø = kaprand + speling)
//   • draagring   — de modulerand rust hierop; centrale opening laat de LED door
//   • clips       — 3–6 cantilevers met griplip die de J1701 van bovenaf vastklikken
//
// De kap zit eronder (rand omhoog in de skirt), de module bovenop de draagring,
// LED naar beneden door de centrale opening de kap in.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Annulaire cilinder (buis/ring/schijf) via revolve van een rechthoekprofiel.
function tube(innerR, outerR, height, segments = 96) {
  const pts = [
    new THREE.Vector2(innerR, 0),
    new THREE.Vector2(outerR, 0),
    new THREE.Vector2(outerR, height),
    new THREE.Vector2(innerR, height),
    new THREE.Vector2(innerR, 0),
  ];
  return new THREE.LatheGeometry(pts, segments);
}

// Normaliseer naar niet-geïndexeerd met enkel 'position' zodat merge attributen matchen.
function prep(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const src = g.getAttribute('position');
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(src.array.slice(0), 3));
  if (g !== geo) g.dispose();
  return out;
}

// Eén clip = arm (box) + naar-binnen-haakende griplip (box), geroteerd rond Y.
// De arm steekt `embed` mm onder `shelfTop` de draagring in zodat de primitieven
// volumetrisch overlappen (een echte las, geen los rakend vlak); boven de ring
// rijst hij `clipLength` op.
function clipParts(p, clipInnerR, shelfTop, embed) {
  const out = [];
  const n = Math.max(3, Math.round(p.clipCount));
  const { clipThickness: tC, clipWidth: wC, clipLength: len, gripLip: lip, gripLipHeight: lipH } = p;
  const armBottom = shelfTop - embed;
  const armH = len + embed;
  const armTop = shelfTop + len;

  for (let k = 0; k < n; k++) {
    const ang = (k / n) * Math.PI * 2;
    const rot = new THREE.Matrix4().makeRotationY(ang);

    const arm = new THREE.BoxGeometry(tC, armH, wC);
    arm.translate(clipInnerR + tC / 2, armBottom + armH / 2, 0);
    arm.applyMatrix4(rot);
    out.push(prep(arm));

    // Griplip: haakje aan de top dat naar binnen steekt over de modulerand.
    // Buitenvlak ligt binnen de arm (volledig ingebed → geen los rakend vlak).
    const hookW = lip + tC / 2;
    const hook = new THREE.BoxGeometry(hookW, lipH, wC);
    hook.translate(clipInnerR - lip + hookW / 2, armTop - lipH / 2, 0);
    hook.applyMatrix4(rot);
    out.push(prep(hook));
  }
  return out;
}

// Afgeleide maten van de kraag (ook gebruikt voor visualisatie/assemblage).
export function collarMetrics(p) {
  const kapTopOuterR = p.topRadius;
  const clampInnerR = kapTopOuterR + p.clampClearance;
  const clampOuterR = clampInnerR + p.clampWall;
  const moduleR = p.moduleDiameter / 2;
  const clipInnerR = moduleR + p.moduleClearance;
  const clipOuterR = clipInnerR + p.clipThickness;
  const shelfInnerR = Math.max(8, Math.min(clampInnerR - 1, moduleR - p.moduleSeatWidth));
  const shelfOuterR = clipOuterR + 0.8;
  return {
    kapTopOuterR, clampInnerR, clampOuterR, moduleR,
    clipInnerR, clipOuterR, shelfInnerR, shelfOuterR,
    clampDepth: p.clampDepth,
    shelfThickness: p.shelfThickness,
    shelfTop: p.clampDepth + p.shelfThickness,
    totalHeight: p.clampDepth + p.shelfThickness + p.clipLength,
    ledOpeningDiameter: shelfInnerR * 2,
  };
}

const OVERLAP = 0.8; // mm volumetrische overlap tussen primitieven → robuuste las

export function buildCollarGeometry(p) {
  const m = collarMetrics(p);
  const parts = [];

  // Klem-skirt (grijpt de kaprand)
  parts.push(prep(tube(m.clampInnerR, m.clampOuterR, m.clampDepth)));

  // Draagring (module rust hierop; centrale opening = LED-doorgang).
  // Start iets onder de skirt-top zodat ze volumetrisch overlappen.
  const shelf = tube(m.shelfInnerR, m.shelfOuterR, m.shelfThickness + OVERLAP);
  shelf.translate(0, m.clampDepth - OVERLAP, 0);
  parts.push(prep(shelf));

  // Clips — ingebed in de draagring (embed = volledige ringdikte)
  clipParts(p, m.clipInnerR, m.shelfTop, m.shelfThickness).forEach((g) => parts.push(g));

  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.translate(0, -merged.boundingBox.min.y, 0);
  return merged;
}

// MEETIJKJE: enkel de clipzone als ring. Klein, omkeerbaar testprintje om de
// module-speling te kalibreren vóór een volledige print.
export function buildGaugeGeometry(p) {
  const m = collarMetrics(p);
  const ringT = 3;
  const ringInnerR = Math.max(4, m.clipInnerR - 4);
  const parts = [];
  parts.push(prep(tube(ringInnerR, m.clipOuterR + 0.8, ringT)));
  clipParts(p, m.clipInnerR, ringT, ringT - 0.5).forEach((g) => parts.push(g));

  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.translate(0, -merged.boundingBox.min.y, 0);
  return merged;
}
