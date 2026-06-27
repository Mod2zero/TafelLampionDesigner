// KAP-geometrie.
//   buildPreviewGeometry → DUBBELWAND (mooi, accuraat, voor de simulator)
//                          geport uit het vaas-prototype (lathe + radius-gebaseerde
//                          wanddetectie voor de groeven).
//   buildExportGeometry  → ÉÉN buitenoppervlak als watertight manifold-solid
//                          (massieve bodem + top), geschikt voor slicer spiral/vase-mode.
//                          NOOIT de dubbelwand exporteren.

import * as THREE from 'three';
import { profileKeys, baseProfileRadius, clamp } from './profile.js';
import { makeStyle } from './styles.js';

// ---------- gedeelde sampler ----------
export function sampleOuterProfile(p) {
  const keys = profileKeys(p);
  const style = makeStyle(p);
  const steps = Math.max(24, Math.round(p.verticalSegments));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const baseR = Math.max(0.8, baseProfileRadius(t, keys));
    pts.push({ t, y: t * p.height, r: style.radiusAt(t, baseR) });
  }
  return { pts, style };
}

// Tekenvolume controleren en zo nodig de winding omkeren zodat normalen naar
// buiten wijzen (positief getekend volume).
function ensureOutward(positions, index) {
  let vol = 0;
  for (let i = 0; i < index.length; i += 3) {
    const a = index[i] * 3, b = index[i + 1] * 3, c = index[i + 2] * 3;
    const ax = positions[a], ay = positions[a + 1], az = positions[a + 2];
    const bx = positions[b], by = positions[b + 1], bz = positions[b + 2];
    const cx = positions[c], cy = positions[c + 1], cz = positions[c + 2];
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
  }
  if (vol < 0) {
    for (let i = 0; i < index.length; i += 3) {
      const t = index[i + 1]; index[i + 1] = index[i + 2]; index[i + 2] = t;
    }
  }
  return Math.abs(vol);
}

// ---------- EXPORT: watertight manifold-solid ----------
export function buildExportGeometry(p) {
  const { pts, style } = sampleOuterProfile(p);
  const R = pts.length;
  const S = style.segments(Math.max(3, Math.round(p.radialSegments)));

  const positions = [];
  // Ringen — géén naad-duplicatie (wrap mod S) → elke rand deelt exact 2 driehoeken.
  for (let i = 0; i < R; i++) {
    const { t, y, r: baseR } = pts[i];
    for (let j = 0; j < S; j++) {
      const ang = (j / S) * Math.PI * 2;
      const v = style.vertexAt(t, baseR, ang, y);
      positions.push(v.r * Math.cos(v.angle), y, v.r * Math.sin(v.angle));
    }
  }
  const bottomCenter = positions.length / 3; positions.push(0, pts[0].y, 0);
  const topCenter = positions.length / 3;    positions.push(0, pts[R - 1].y, 0);

  const index = [];
  // Zijwand
  for (let i = 0; i < R - 1; i++) {
    for (let j = 0; j < S; j++) {
      const j2 = (j + 1) % S;
      const a = i * S + j, b = i * S + j2;
      const c = (i + 1) * S + j2, d = (i + 1) * S + j;
      index.push(a, c, b, a, d, c);
    }
  }
  // Massieve bodem (gesloten)
  for (let j = 0; j < S; j++) index.push(bottomCenter, j, (j + 1) % S);
  // Top-cap (maakt het een gesloten manifold; vase-mode negeert de toplagen)
  const top0 = (R - 1) * S;
  for (let j = 0; j < S; j++) index.push(topCenter, top0 + (j + 1) % S, top0 + j);

  ensureOutward(positions, index);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  g.computeBoundingBox();
  g.translate(0, -g.boundingBox.min.y, 0);
  return g;
}

// ---------- PREVIEW: dubbelwand (geport prototype) ----------
export function buildPreviewGeometry(p) {
  const keys = profileKeys(p);
  const style = makeStyle(p);
  const wt = p.wallThickness;
  const vSeg = Math.max(24, Math.round(p.verticalSegments));
  const rSeg = style.segments(Math.max(3, Math.round(p.radialSegments)));

  const baseOuterR = (t) => Math.max(wt + 0.6, baseProfileRadius(t, keys));
  const outerR = (t) => style.radiusAt(t, baseOuterR(t));

  // Buitenprofiel (bodem → top)
  const outerPts = [];
  for (let i = 0; i <= vSeg; i++) {
    const t = i / vSeg;
    outerPts.push(new THREE.Vector2(outerR(t), t * p.height));
  }
  // Binnenprofiel (top → bodem) — radiale offset + verticale shift (geport)
  const innerPts = [];
  for (let i = vSeg; i >= 0; i--) {
    const tInner = i / vSeg;
    const y = wt + tInner * (p.height - wt);
    const innerRr = Math.max(0.5, outerR(y / p.height) - wt);
    innerPts.push(new THREE.Vector2(innerRr, y));
  }
  const profile = [
    new THREE.Vector2(0, 0),
    ...outerPts,
    ...innerPts,
    new THREE.Vector2(0, wt),
  ];

  const geom = new THREE.LatheGeometry(profile, rSeg);
  const pos = geom.attributes.position;
  const bright = new Float32Array(pos.count);
  const twistRad = (p.twistDeg * Math.PI) / 180;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    let angle = Math.atan2(z, x);
    let r = Math.sqrt(x * x + z * z);

    // Radius-gebaseerde wanddetectie (geport): zit deze vertex op de buitenwand?
    const tNorm = clamp(y / p.height, 0, 1);
    const expOuter = baseOuterR(tNorm);
    const expInner = Math.max(0.5, expOuter - wt);
    const isOuter = r > (expInner + expOuter) * 0.5;

    let b = 0.3;
    if (isOuter && y > wt * 0.5) {
      const v = style.vertexAt(tNorm, r, angle, y);
      r = v.r; angle = v.angle; b = v.brightness;
    } else {
      angle += (y / p.height) * twistRad; // binnenwand draait mee zodat hij niet scheurt
      b = 0.28;
    }
    pos.setX(i, r * Math.cos(angle));
    pos.setZ(i, r * Math.sin(angle));
    bright[i] = b;
  }

  pos.needsUpdate = true;
  geom.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
  geom.computeVertexNormals();
  geom.computeBoundingBox();
  geom.translate(0, -geom.boundingBox.min.y, 0);
  return geom;
}

// Buitenstraal van de bovenrand (voor de kraag-klem afgeleid van de kap).
export function topRimOuterRadius(p) {
  return p.topRadius;
}
