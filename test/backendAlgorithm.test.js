import test from 'node:test';
import assert from 'node:assert/strict';
import { toColor, toRgb, rgbToHex, hexToRgb } from '../server/core/colorSpace.js';
import { extractPalette } from '../server/core/paletteExtractor.js';
import { getPaletteDistance } from '../server/core/paletteDistance.js';
import { evolvePalette } from '../server/core/groupEvolution.js';

test('Color space: RGB <-> perceptual color roundtrip', () => {
  const testColors = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [196, 151, 107], // Terracotta #C4976B
    [245, 242, 237], // Sand #F5F2ED
  ];

  testColors.forEach(([r, g, b]) => {
    const col = toColor(r, g, b);
    const [rOut, gOut, bOut] = toRgb(col);

    assert.ok(Math.abs(r - rOut) <= 2, `Red deviation too high for ${r}`);
    assert.ok(Math.abs(g - gOut) <= 2, `Green deviation too high for ${g}`);
    assert.ok(Math.abs(b - bOut) <= 2, `Blue deviation too high for ${b}`);
  });
});

test('Color space: Hex string parsing', () => {
  assert.equal(rgbToHex(196, 151, 107), '#C4976B');
  assert.deepEqual(hexToRgb('#C4976B'), [196, 151, 107]);
});

test('Palette Extractor: Weights sum approximately to 1.0', () => {
  const length = 80 * 80 * 3;
  const pixels = Buffer.alloc(length);

  for (let i = 0; i < length; i += 3) {
    if (i < length * 0.6) {
      pixels[i] = 196;
      pixels[i + 1] = 151;
      pixels[i + 2] = 107;
    } else {
      pixels[i] = 74;
      pixels[i + 1] = 107;
      pixels[i + 2] = 138;
    }
  }

  const palette = extractPalette(pixels, 3, 5);
  assert.equal(palette.length, 5);

  const sumWeights = palette.reduce((sum, c) => sum + c.weight, 0);
  assert.ok(Math.abs(sumWeights - 1.0) < 0.05, `Weights must sum to ~1.0, got ${sumWeights}`);
});

test('Palette Distance: Identical palettes yield near-zero distance; different palettes yield high distance', () => {
  const terracotta = [
    { color: toColor(196, 151, 107), weight: 0.6 },
    { color: toColor(139, 111, 78), weight: 0.4 },
  ];

  const terracottaVariant = [
    { color: toColor(198, 153, 109), weight: 0.58 },
    { color: toColor(140, 112, 80), weight: 0.42 },
  ];

  const deepBlue = [
    { color: toColor(20, 40, 90), weight: 0.7 },
    { color: toColor(40, 70, 130), weight: 0.3 },
  ];

  const distSimilar = getPaletteDistance(terracotta, terracottaVariant);
  const distDifferent = getPaletteDistance(terracotta, deepBlue);

  assert.ok(distSimilar < 0.05, `Similar palettes should have distance < 0.05, got ${distSimilar}`);
  assert.ok(distDifferent > 0.20, `Different palettes should have distance > 0.20, got ${distDifferent}`);
  assert.ok(distDifferent > distSimilar * 4, 'Distinct palettes should have much larger distance');
});

test('Group Evolution: Palette evolves as member photos join (P1 -> P1\')', () => {
  const photo1 = {
    palette: [
      { hex: '#C4976B', color: toColor(196, 151, 107), weight: 0.7 },
      { hex: '#8B6F4E', color: toColor(139, 111, 78), weight: 0.3 },
    ],
  };

  const photo2 = {
    palette: [
      { hex: '#D4C4A8', color: toColor(212, 196, 168), weight: 0.6 },
      { hex: '#5C4A3A', color: toColor(92, 74, 58), weight: 0.4 },
    ],
  };

  const initialPalette = evolvePalette([photo1], 5);
  const evolvedPalette = evolvePalette([photo1, photo2], 5);

  assert.equal(initialPalette.length, 2);
  assert.equal(evolvedPalette.length, 4);

  const initialHex = initialPalette.map((c) => c.hex).join(',');
  const evolvedHex = evolvedPalette.map((c) => c.hex).join(',');

  assert.notEqual(initialHex, evolvedHex, 'Group palette must evolve when new photo joins');
});

test('Dynamic Palette Naming: Generates descriptive exhibition titles from perceptual colors', async () => {
  const { namePalette } = await import('../server/core/paletteNaming.js');

  const amberPalette = [
    { color: toColor(196, 151, 107), weight: 0.7 },
    { color: toColor(30, 20, 15), weight: 0.3 },
  ];
  const name1 = namePalette(amberPalette);
  assert.ok(typeof name1 === 'string' && name1.length > 0);
  assert.ok(name1.includes('&') || name1.includes('Monotone'));

  const slatePalette = [
    { color: toColor(80, 95, 110), weight: 0.6 },
    { color: toColor(240, 238, 235), weight: 0.4 },
  ];
  const name2 = namePalette(slatePalette);
  assert.ok(typeof name2 === 'string' && name2.length > 0);
});

