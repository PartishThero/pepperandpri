/**
 * Dynamic color palette naming based on perceptual OKLab color science.
 * Dynamically derives exhibition-grade palette family names from swatches.
 */

function describeColor(colorObj) {
  const [L, a, b] = colorObj.color || colorObj.oklab || [0.5, 0, 0];
  const chroma = Math.sqrt(a * a + b * b);
  const deg = (Math.atan2(b, a) * (180 / Math.PI) + 360) % 360;

  // Achromatic / neutral tones
  if (chroma < 0.035) {
    if (L < 0.22) return 'Obsidian';
    if (L < 0.38) return 'Charcoal';
    if (L < 0.55) return 'Slate';
    if (L < 0.75) return 'Stone';
    return 'Alabaster';
  }

  // Hue classification
  let hueName = 'Ochre';
  if (deg >= 345 || deg < 20) hueName = 'Crimson';
  else if (deg < 50) hueName = 'Terracotta';
  else if (deg < 80) hueName = 'Amber';
  else if (deg < 115) hueName = 'Ochre';
  else if (deg < 155) hueName = 'Olive';
  else if (deg < 195) hueName = 'Emerald';
  else if (deg < 235) hueName = 'Cerulean';
  else if (deg < 275) hueName = 'Cobalt';
  else if (deg < 315) hueName = 'Violet';
  else hueName = 'Plum';

  // Lightness and chroma qualifiers
  let prefix = '';
  if (L < 0.25) prefix = 'Deep ';
  else if (L < 0.40) prefix = 'Dark ';
  else if (L > 0.75) prefix = 'Soft ';
  else if (chroma > 0.12) prefix = 'Vibrant ';
  else if (chroma < 0.065) prefix = 'Muted ';

  return `${prefix}${hueName}`.trim();
}

/**
 * Dynamically generates a gallery title for a given palette.
 * @param {Array<{ color?: number[], oklab?: number[], weight?: number }>} palette
 * @returns {string} Dynamic evocative name (e.g. "Deep Umber & Warm Ochre")
 */
export function namePalette(palette) {
  if (!palette || palette.length === 0) return 'Untitled Harmony';

  // Sort swatches by weight to find dominant colors
  const sorted = [...palette].sort((x, y) => (y.weight || 0) - (x.weight || 0));
  const primary = describeColor(sorted[0]);

  if (sorted.length < 2) return primary;

  // Find a distinct secondary color
  let secondary = null;
  for (let i = 1; i < sorted.length; i++) {
    const candidate = describeColor(sorted[i]);
    if (candidate !== primary) {
      secondary = candidate;
      break;
    }
  }

  if (!secondary) {
    return `${primary} Monotone`;
  }

  return `${primary} & ${secondary}`;
}

export default namePalette;
