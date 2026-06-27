// Stijlpresets: elk afgestemd om mooi te printen in vase-mode én mooi te gloeien.

export const presets = {
  organisch: {
    label: 'Organisch',
    values: {
      style: 'organic',
      height: 165, baseRadius: 38, bellyRadius: 64, bellyPos: 0.42,
      shoulderRadius: 44, shoulderPos: 0.82, topRadius: 45, rimHeight: 6,
      twistDeg: 140, rippleAmp: 3, rippleCount: 4, fluteAmp: 2, fluteCount: 9,
      facetCount: 8, wallThickness: 0.9,
    },
  },
  geribd: {
    label: 'Geribd',
    values: {
      style: 'ribbed',
      height: 150, baseRadius: 42, bellyRadius: 60, bellyPos: 0.32,
      shoulderRadius: 47, shoulderPos: 0.80, topRadius: 45, rimHeight: 6,
      twistDeg: 0, rippleAmp: 0, rippleCount: 4, fluteAmp: 2.5, fluteCount: 26,
      facetCount: 8, wallThickness: 0.9,
    },
  },
  gefacetteerd: {
    label: 'Gefacetteerd',
    values: {
      style: 'faceted',
      height: 150, baseRadius: 40, bellyRadius: 58, bellyPos: 0.30,
      shoulderRadius: 48, shoulderPos: 0.82, topRadius: 45, rimHeight: 6,
      twistDeg: 0, rippleAmp: 0, rippleCount: 4, fluteAmp: 0, fluteCount: 22,
      facetCount: 7, wallThickness: 1.0,
    },
  },
};

export const ledSwatches = [
  { name: 'Warm wit', hex: '#ffb46b' },
  { name: 'Amber',    hex: '#ff9d4d' },
  { name: 'Kaars',    hex: '#ff8330' },
  { name: 'Honing',   hex: '#ffc785' },
];

export const shadeSwatches = [
  { name: 'Naturel', hex: '#efe3cf' },
  { name: 'Ivoor',   hex: '#f3ecdc' },
  { name: 'Zand',    hex: '#e6d3b0' },
  { name: 'Wit',     hex: '#f6f2ea' },
];
