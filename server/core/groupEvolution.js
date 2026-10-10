import { toRgb, rgbToHex, colorDistance } from './colorSpace.js';
import CONFIG from '../config/index.js';

/**
 * Evolves a group's representative palette from all current member photos.
 */
export function evolvePalette(memberPhotos, k = CONFIG.PALETTE_SIZE) {
  if (!memberPhotos || memberPhotos.length === 0) return [];
  if (memberPhotos.length === 1) return memberPhotos[0].palette.map((c) => ({ ...c }));

  const pooledPoints = [];
  const pooledWeights = [];
  const photoWeight = 1.0 / memberPhotos.length;

  for (const photo of memberPhotos) {
    for (const color of photo.palette) {
      pooledPoints.push(color.color || color.oklab);
      pooledWeights.push(photoWeight * (color.weight || 0.2));
    }
  }

  const targetK = Math.min(k, pooledPoints.length);
  const centroids = [];
  const stride = Math.max(1, Math.floor(pooledPoints.length / targetK));
  for (let i = 0; i < targetK; i++) {
    const idx = Math.min(i * stride, pooledPoints.length - 1);
    centroids.push([...pooledPoints[idx]]);
  }

  const clusterWeights = new Float64Array(targetK);
  const sum0 = new Float64Array(targetK);
  const sum1 = new Float64Array(targetK);
  const sum2 = new Float64Array(targetK);

  for (let iter = 0; iter < 15; iter++) {
    clusterWeights.fill(0);
    sum0.fill(0);
    sum1.fill(0);
    sum2.fill(0);

    for (let p = 0; p < pooledPoints.length; p++) {
      const pt = pooledPoints[p];
      const w = pooledWeights[p];
      let bestDist = Infinity;
      let bestCluster = 0;

      for (let c = 0; c < targetK; c++) {
        const dist = colorDistance(pt, centroids[c]);
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }

      clusterWeights[bestCluster] += w;
      sum0[bestCluster] += pt[0] * w;
      sum1[bestCluster] += pt[1] * w;
      sum2[bestCluster] += pt[2] * w;
    }

    for (let c = 0; c < targetK; c++) {
      const totalW = clusterWeights[c];
      if (totalW > 0) {
        centroids[c] = [sum0[c] / totalW, sum1[c] / totalW, sum2[c] / totalW];
      }
    }
  }

  const totalWeight = clusterWeights.reduce((acc, w) => acc + w, 0);
  const updatedPalette = centroids.map((c, idx) => {
    const weight = totalWeight > 0 ? clusterWeights[idx] / totalWeight : 1 / targetK;
    const [r, g, b] = toRgb(c);
    return {
      hex: rgbToHex(r, g, b),
      color: c,
      oklab: c,
      weight: Number(weight.toFixed(3)),
    };
  });

  updatedPalette.sort((a, b) => b.weight - a.weight);

  const sum = updatedPalette.reduce((acc, c) => acc + c.weight, 0);
  if (sum > 0) {
    updatedPalette.forEach((c) => {
      c.weight = Number((c.weight / sum).toFixed(3));
    });
  }

  return updatedPalette;
}

export const recomputeGroupPalette = evolvePalette;
