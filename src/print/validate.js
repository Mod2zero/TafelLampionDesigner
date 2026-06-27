// Manifold-check + tolerantie-info.
// Last coïncidente vertices samen (kwantisatie) en telt per rand het aantal
// driehoeken. Een gesloten manifold-solid heeft élke rand precies 2× → watertight.

export function analyzeGeometry(geo) {
  const pos = geo.getAttribute('position');
  const idxAttr = geo.getIndex();
  const triCount = idxAttr ? idxAttr.count / 3 : pos.count / 3;
  const getIndex = idxAttr ? (i) => idxAttr.getX(i) : (i) => i;

  // Vertices lassen op een rooster van 1e-4 mm.
  const Q = 1e4;
  const map = new Map();
  const idOf = (vi) => {
    const x = Math.round(pos.getX(vi) * Q);
    const y = Math.round(pos.getY(vi) * Q);
    const z = Math.round(pos.getZ(vi) * Q);
    const key = `${x},${y},${z}`;
    let id = map.get(key);
    if (id === undefined) { id = map.size; map.set(key, id); }
    return id;
  };

  const edges = new Map();
  let degenerate = 0;
  let signedVol = 0;

  for (let t = 0; t < triCount; t++) {
    const a = idOf(getIndex(t * 3));
    const b = idOf(getIndex(t * 3 + 1));
    const c = idOf(getIndex(t * 3 + 2));
    if (a === b || b === c || a === c) { degenerate++; continue; }

    // Getekend volume voor oriëntatie (positief = normalen naar buiten).
    const i0 = getIndex(t * 3) * 3, i1 = getIndex(t * 3 + 1) * 3, i2 = getIndex(t * 3 + 2) * 3;
    const ax = pos.array[i0], ay = pos.array[i0 + 1], az = pos.array[i0 + 2];
    const bx = pos.array[i1], by = pos.array[i1 + 1], bz = pos.array[i1 + 2];
    const cx = pos.array[i2], cy = pos.array[i2 + 1], cz = pos.array[i2 + 2];
    signedVol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;

    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      const key = u < v ? `${u}_${v}` : `${v}_${u}`;
      edges.set(key, (edges.get(key) || 0) + 1);
    }
  }

  let openEdges = 0, nonManifold = 0;
  for (const count of edges.values()) {
    if (count === 1) openEdges++;
    else if (count > 2) nonManifold++;
  }

  return {
    triangles: triCount,
    weldedVertices: map.size,
    edges: edges.size,
    openEdges,
    nonManifoldEdges: nonManifold,
    degenerate,
    watertight: openEdges === 0 && nonManifold === 0,
    signedVolume: signedVol,
    volumeCm3: Math.abs(signedVol) / 1000,
    outwardNormals: signedVol > 0,
  };
}

// Tolerantie-startwaarden (mm) — afgestemd op de plan-brief.
export const toleranceTable = [
  { name: 'Module-speling (clip ↔ J1701)', range: '0,30 – 0,40', param: 'moduleClearance' },
  { name: 'Klem-speling (kraag ↔ kapbovenrand)', range: '0,20 – 0,30', param: 'clampClearance' },
  { name: 'Griplip (haakdiepte)', range: '0,8 – 1,2', param: 'gripLip' },
];

export function formatReport(name, r) {
  const flag = (ok, label) => `${ok ? '✓' : '✗'} ${label}`;
  const lines = [
    `${name}`,
    `  ${r.triangles.toLocaleString('nl-BE')} driehoeken · ${r.weldedVertices.toLocaleString('nl-BE')} vertices`,
    `  ${flag(r.watertight, r.watertight ? 'watertight manifold' : `${r.openEdges} open / ${r.nonManifoldEdges} non-manifold randen`)}`,
    `  ${flag(r.outwardNormals, 'normalen naar buiten')}`,
    `  volume ≈ ${r.volumeCm3.toFixed(1)} cm³`,
  ];
  return lines.join('\n');
}
