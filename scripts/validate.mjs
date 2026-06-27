// Headless validatie: bouwt de export-geometrie met three.js in Node, controleert
// dat de KAP een watertight manifold-solid is (per stijl) en schrijft sample-STL's.
//   npm run validate

import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { writeFileSync, mkdirSync } from 'node:fs';

import { makeParams } from '../src/params.js';
import { buildExportGeometry } from '../src/geometry/shade.js';
import { buildCollarGeometry, buildGaugeGeometry } from '../src/geometry/collar.js';
import { analyzeGeometry, formatReport } from '../src/print/validate.js';
import { presets } from '../src/presets.js';

const outDir = new URL('../samples/', import.meta.url);
mkdirSync(outDir, { recursive: true });

function writeSTL(geo, file) {
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
  const data = new STLExporter().parse(mesh, { binary: true });
  const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  writeFileSync(new URL(file, outDir), buf);
}

let failures = 0;
function check(label, geo, requireWatertight, file) {
  const r = analyzeGeometry(geo);
  console.log(formatReport(label, r));
  if (file) { writeSTL(geo, file); console.log(`  → samples/${file}`); }
  if (requireWatertight && !r.watertight) { failures++; console.log('  !! NIET watertight'); }
  if (requireWatertight && !r.outwardNormals) { failures++; console.log('  !! normalen wijzen naar binnen'); }
  console.log('');
}

console.log('=== Lampion J1701 — geometrie-validatie ===\n');

for (const [name, preset] of Object.entries(presets)) {
  const p = { ...makeParams(), ...preset.values };
  const geo = buildExportGeometry(p);
  check(`KAP (${preset.label})`, geo, true, name === 'organisch' ? 'lampion-kap.stl' : null);
}

const base = makeParams();
check('KRAAG', buildCollarGeometry(base), false, 'lampion-kraag.stl');
check('MEETIJKJE', buildGaugeGeometry(base), false, 'lampion-meetijkje.stl');

if (failures) {
  console.error(`✗ ${failures} controle(s) gefaald`);
  process.exit(1);
}
console.log('✓ Alle KAP-exports zijn watertight manifold-solids.');
