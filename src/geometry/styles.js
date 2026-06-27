// Stijlmodifiers: organisch/spiraal · geribd (verticale groeven) · gefacetteerd.
// Hergebruikt de prototype-wiskunde: ripple op hoogte, flute (groeven) op hoek,
// twist op hoogte. Faceted = N-hoek-doorsnede. Levert ook een per-vertex
// helderheid voor de nacht-gloed (groeven gloeien feller).

import { clamp } from './profile.js';

export function makeStyle(p) {
  const twistRad = (p.twistDeg * Math.PI) / 180;
  const N = Math.max(3, Math.round(p.facetCount));
  const faceted = p.style === 'faceted';
  const useFlute = !faceted && p.fluteAmp > 0 && p.fluteCount > 0;
  const useRipple = p.rippleAmp > 0 && p.rippleCount > 0;

  return {
    faceted,
    // Aantal radiale segmenten: facetten krijgen exact N (scherpe vlakken).
    segments(defaultSeg) {
      return faceted ? N : defaultSeg;
    },
    // Straal als functie van hoogte (lage-frequentie golf — organisch).
    radiusAt(t, baseR) {
      let r = baseR;
      if (useRipple) r += p.rippleAmp * Math.sin(t * Math.PI * 2 * p.rippleCount);
      return Math.max(0.8, r);
    },
    // Per-vertex modifier: groeven, facetten, twist + helderheid.
    // t = genormaliseerde hoogte, r = (reeds golf-)straal, angle in rad, y in mm.
    vertexAt(t, r, angle, y) {
      let brightness = 0.62;
      const envelope = 0.4 + 0.6 * Math.sin(clamp(t, 0, 1) * Math.PI);

      if (faceted) {
        // Regelmatige N-hoek met dezelfde "hoek"-straal als de cirkel.
        const seg = (Math.PI * 2) / N;
        const a = (((angle % seg) + seg) % seg) - seg / 2;
        r = (r * Math.cos(Math.PI / N)) / Math.cos(a);
        // Ribben (de facet-kanten) gloeien iets feller.
        brightness = 0.55 + 0.5 * Math.pow(Math.abs(a) / (seg / 2), 1.5);
      } else if (useFlute) {
        const s = Math.sin(angle * p.fluteCount);
        r += p.fluteAmp * s * envelope;
        // Diep in de groef (s → -1) is de wand visueel dunner → feller.
        brightness = 0.5 + 0.7 * ((1 - s) * 0.5) * envelope;
      } else {
        brightness = 0.5 + 0.35 * envelope;
      }

      const tw = (y / p.height) * twistRad;
      return {
        r: Math.max(0.5, r),
        angle: angle + tw,
        brightness: clamp(brightness, 0.32, 1.5),
      };
    },
  };
}
