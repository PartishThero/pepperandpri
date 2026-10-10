import { toColor, toRgb, rgbToHex, colorDistance } from './colorSpace.js';
import CONFIG from '../config/index.js';

/**
 * Extracts representative colors with weights summing to 1.0.
 */
export function extractPalette(pixelBuffer, channels = 3, k = CONFIG.PALETTE_SIZE) {
  const points = [];

  for (let i = 0; i < pixelBuffer.length; i += channels) {
    if (channels === 4 && pixelBuffer[i + 3] < 32) continue;
    points.push(toColor(pixelBuffer[i], pixelBuffer[i + 1], pixelBuffer[i + 2]));
  }

  if (points.length === 0) {
    return [{ hex: '#808080', color: toColor(128, 128, 128), weight: 1.0 }];
  }

  const centroids = [];
  const stride = Math.floor(points.length / k);
  for (let i = 0; i < k; i++) {
    const idx = Math.min(i * stride, points.length - 1);
    centroids.push([...points[idx]]);
  }

  let assignments = new Int32Array(points.length);
  const clusterCounts = new Int32Array(k);

  for (let iter = 0; iter < CONFIG.KMEANS_MAX_ITERATIONS; iter++) {
    clusterCounts.fill(0);
    let changed = false;

    for (let p = 0; p < points.length; p++) {
      const pt = points[p];
      let bestDist = Infinity;
      let bestCluster = 0;

      for (let c = 0; c < k; c++) {
        const dist = colorDistance(pt, centroids[c]);
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }

      if (assignments[p] !== bestCluster) {
        assignments[p] = bestCluster;
        changed = true;
      }
      clusterCounts[bestCluster]++;
    }

    if (!changed) break;

    const sum0 = new Float64Array(k);
    const sum1 = new Float64Array(k);
    const sum2 = new Float64Array(k);

    for (let p = 0; p < points.length; p++) {
      const c = assignments[p];
      const pt = points[p];
      sum0[c] += pt[0];
      sum1[c] += pt[1];
      sum2[c] += pt[2];
    }

    for (let c = 0; c < k; c++) {
      const count = clusterCounts[c];
      if (count > 0) {
        centroids[c] = [sum0[c] / count, sum1[c] / count, sum2[c] / count];
      }
    }
  }

  const total = points.length;
  const rawPalette = centroids.map((c, idx) => {
    const weight = clusterCounts[idx] / total;
    const [r, g, b] = toRgb(c);
    return {
      hex: rgbToHex(r, g, b),
      color: c,
      oklab: c,
      weight: Number(weight.toFixed(4)),
    };
  });

  rawPalette.sort((a, b) => b.weight - a.weight);

  const sumWeights = rawPalette.reduce((acc, c) => acc + c.weight, 0);
  if (sumWeights > 0) {
    rawPalette.forEach((c) => {
      c.weight = Number((c.weight / sumWeights).toFixed(3));
    });
  }

  return rawPalette;
}

export const extractPaletteFromPixels = extractPalette;
