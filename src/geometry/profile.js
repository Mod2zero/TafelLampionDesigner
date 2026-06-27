// Keypoint-profiel + smooth interpolatie.
// Geport uit het vaas-prototype (smoothstep tussen sleutelpunten) en uitgebreid
// met een schone, rechte cilindrische bovenrand — vereist voor vase-mode.

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Sleutelpunten [tHoogte (0..1), straal] van bodem → top.
export function profileKeys(p) {
  // Sorteer buik/schouder zodat de hoogteposities altijd oplopen.
  const middle = [
    [p.bellyPos, p.bellyRadius],
    [p.shoulderPos, p.shoulderRadius],
  ].sort((a, b) => a[0] - b[0]);

  const rimFrac = clamp(p.rimHeight / p.height, 0, 0.4);
  // Begin van de rechte rand; altijd boven de schouder.
  const rimStart = clamp(1 - rimFrac, middle[1][0] + 0.02, 0.985);

  return [
    [0, p.baseRadius],
    middle[0],
    middle[1],
    [rimStart, p.topRadius],
    [1, p.topRadius],     // identieke straal → perfect rechte cilindrische rand
  ];
}

// Smoothstep-interpolatie tussen de sleutelpunten (geport).
// Smoothstep heeft nul-helling aan elk sleutelpunt → schone overgang naar de rand.
export function baseProfileRadius(t, keys) {
  let i = 0;
  for (let j = 0; j < keys.length - 1; j++) {
    if (t >= keys[j][0] && t <= keys[j + 1][0]) { i = j; break; }
  }
  if (t > keys[keys.length - 1][0]) i = keys.length - 2;
  const [t0, r0] = keys[i];
  const [t1, r1] = keys[i + 1];
  if (t1 === t0) return r0;
  const s = (t - t0) / (t1 - t0);
  const sm = s * s * (3 - 2 * s);
  return r0 + (r1 - r0) * sm;
}
