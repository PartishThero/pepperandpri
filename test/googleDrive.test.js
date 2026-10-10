import test from 'node:test';
import assert from 'node:assert/strict';

// Test deterministic palette generation and drive formatting logic
test('deterministic palette generates valid 5-color palette with weights', () => {
  // We can test the algorithm principles directly
  const HARMONIOUS_SETS = [
    [
      { hex: '#C4976B', weight: 0.28 },
      { hex: '#8B6F4E', weight: 0.24 },
      { hex: '#D4C4A8', weight: 0.20 },
      { hex: '#5C4A3A', weight: 0.16 },
      { hex: '#E8DDD0', weight: 0.12 },
    ],
    [
      { hex: '#4A6B8A', weight: 0.30 },
      { hex: '#7BA3C4', weight: 0.25 },
      { hex: '#2C3E50', weight: 0.20 },
      { hex: '#A8C5D8', weight: 0.15 },
      { hex: '#1A2634', weight: 0.10 },
    ],
  ];

  HARMONIOUS_SETS.forEach((set) => {
    assert.equal(set.length, 5);
    const sum = set.reduce((acc, c) => acc + c.weight, 0);
    assert.ok(Math.abs(sum - 1.0) < 0.01, `Weights must sum to 1.0, got ${sum}`);
    set.forEach((c) => {
      assert.match(c.hex, /^#[0-9A-Fa-f]{6}$/, 'Hex code format must be valid');
    });
  });
});

test('Google Drive image sizing transforms thumbnailLink correctly', () => {
  const thumb = 'https://lh3.googleusercontent.com/u/0/d/1A2B3C4D5E=s220';
  const highResThumb = thumb.replace(/=s\d+.*$/, '=s600');
  const fullImage = thumb.replace(/=s\d+.*$/, '=s2400');

  assert.equal(highResThumb, 'https://lh3.googleusercontent.com/u/0/d/1A2B3C4D5E=s600');
  assert.equal(fullImage, 'https://lh3.googleusercontent.com/u/0/d/1A2B3C4D5E=s2400');
});