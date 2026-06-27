// Stijlpresets: elk afgestemd om mooi te printen in vase-mode én mooi te gloeien.

export const presets = {
  organisch: {
    label: 'Organisch',
    values: {
      style: 'organic',
      height: 180, baseRadius: 46, bellyRadius: 74, bellyPos: 0.42,
      shoulderRadius: 56, shoulderPos: 0.82, topRadius: 56, rimHeight: 6,
      twistDeg: 140, rippleAmp: 3, rippleCount: 4, fluteAmp: 2, fluteCount: 9,
      facetCount: 8, wallThickness: 0.9,
    },
  },
  geribd: {
    label: 'Geribd',
    values: {
      style: 'ribbed',
      height: 165, baseRadius: 50, bellyRadius: 70, bellyPos: 0.32,
      shoulderRadius: 56, shoulderPos: 0.80, topRadius: 56, rimHeight: 6,
      twistDeg: 0, rippleAmp: 0, rippleCount: 4, fluteAmp: 2.5, fluteCount: 28,
      facetCount: 8, wallThickness: 0.9,
    },
  },
  gefacetteerd: {
    label: 'Gefacetteerd',
    values: {
      style: 'faceted',
      height: 165, baseRadius: 48, bellyRadius: 68, bellyPos: 0.30,
      shoulderRadius: 56, shoulderPos: 0.82, topRadius: 56, rimHeight: 6,
      twistDeg: 0, rippleAmp: 0, rippleCount: 4, fluteAmp: 0, fluteCount: 22,
      facetCount: 8, wallThickness: 1.0,
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
