/**
 * Dynamic color palette naming based on perceptual color attributes.
 * Derives exhibition-grade palette family names from swatches.
 */

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

function srgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function toOklab(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

function describeColor(colorObj) {
  let [L, a, b] = colorObj.color || colorObj.oklab || [0, 0, 0];
  if (!colorObj.color && !colorObj.oklab && colorObj.hex) {
    const [r, g, b_val] = hexToRgb(colorObj.hex);
    [L, a, b] = toOklab(r, g, b_val);
  }

  const chroma = Math.sqrt(a * a + b * b);
  const deg = (Math.atan2(b, a) * (180 / Math.PI) + 360) % 360;

  if (chroma < 0.035) {
    if (L < 0.22) return 'Obsidian';
    if (L < 0.38) return 'Charcoal';
    if (L < 0.55) return 'Slate';
    if (L < 0.75) return 'Stone';
    return 'Alabaster';
  }

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

  let prefix = '';
  if (L < 0.25) prefix = 'Deep ';
  else if (L < 0.40) prefix = 'Dark ';
  else if (L > 0.75) prefix = 'Soft ';
  else if (chroma > 0.12) prefix = 'Vibrant ';
  else if (chroma < 0.065) prefix = 'Muted ';

  return `${prefix}${hueName}`.trim();
}

export function namePalette(palette) {
  if (!palette || palette.length === 0) return 'Untitled Harmony';

  const sorted = [...palette].sort((x, y) => (y.weight || 0) - (x.weight || 0));
  const primary = describeColor(sorted[0]);

  if (sorted.length < 2) return primary;

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
