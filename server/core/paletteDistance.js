import { colorDistance } from './colorSpace.js';

/**
 * Calculates perceptual distance between two palettes (0.0 to 1.0).
 */
export function getPaletteDistance(p1, p2) {
  if (!p1 || !p2 || p1.length === 0 || p2.length === 0) return 1.0;

  let cost1 = 0;
  let weightSum1 = 0;
  for (const c1 of p1) {
    let minDist = Infinity;
    const col1 = c1.color || c1.oklab;
    for (const c2 of p2) {
      const col2 = c2.color || c2.oklab;
      const d = colorDistance(col1, col2);
      if (d < minDist) minDist = d;
    }
    const w = c1.weight || 0.2;
    cost1 += minDist * w;
    weightSum1 += w;
  }

  let cost2 = 0;
  let weightSum2 = 0;
  for (const c2 of p2) {
    let minDist = Infinity;
    const col2 = c2.color || c2.oklab;
    for (const c1 of p1) {
      const col1 = c1.color || c1.oklab;
      const d = colorDistance(col2, col1);
      if (d < minDist) minDist = d;
    }
    const w = c2.weight || 0.2;
    cost2 += minDist * w;
    weightSum2 += w;
  }

  const avgCost1 = weightSum1 > 0 ? cost1 / weightSum1 : cost1;
  const avgCost2 = weightSum2 > 0 ? cost2 / weightSum2 : cost2;

  return Number(((avgCost1 + avgCost2) / 2).toFixed(4));
}

export const computePaletteDistance = getPaletteDistance;
