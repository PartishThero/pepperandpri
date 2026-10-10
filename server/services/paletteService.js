import db from '../storage/dbAdapter.js';

const PALETTE_FAMILY_NAMES = [
  'Roman Auditorium',
  'Frozen Slate',
  'Forged Midfield',
  'Scarlet Diffusion',
  'Verdant Canopy',
  'Scorched Clear Morning',
  'Dry Season',
  'High Key',
  'Hard Gunmetal',
  'Amber Solitude',
];

/**
 * Service providing formatted palette families for the frontend.
 */
export async function getFormattedPaletteGroups() {
  const groups = await db.getAllGroups();
  const allPhotos = await db.getAllPhotos();

  // Map photo lookup by ID
  const photoMap = new Map();
  allPhotos.forEach((p) => photoMap.set(p.id, p));

  return groups.map((g, index) => {
    const memberPhotos = (g.memberPhotoIds || [])
      .map((id) => photoMap.get(id))
      .filter(Boolean);

    const name = g.name || PALETTE_FAMILY_NAMES[index % PALETTE_FAMILY_NAMES.length];

    return {
      id: g.id,
      name,
      label: name,
      revision: g.revision || 1,
      photoCount: memberPhotos.length,
      colors: g.colors,
      photos: memberPhotos.map((p) => ({
        id: p.id,
        title: p.title || p.originalFilename?.replace(/\.[^/.]+$/, '') || 'Archive Photo',
        thumbnailUrl: p.thumbnailUrl,
        imageUrl: p.imageUrl,
        palette: p.palette,
        groupId: g.id,
        paletteName: name,
      })),
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  });
}

export async function getPaletteGroupById(id) {
  const groups = await getFormattedPaletteGroups();
  return groups.find((g) => g.id === id) || null;
}
