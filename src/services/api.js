/**
 * API service layer for pepperandpri.
 * Isolates data fetching so the application can seamlessly transition between:
 * 1. Google Drive v3 API (when VITE_GOOGLE_DRIVE_FOLDER_ID & VITE_GOOGLE_API_KEY are configured)
 * 2. Curated built-in mock archive (default fallback)
 */

import MOCK_PALETTES from '../data/mockPalettes';
import { isGoogleDriveConfigured, fetchDriveArchive } from './googleDrive';

// In-memory cache to prevent duplicate remote requests
let driveCache = null;
let driveFetchPromise = null;

// Simulated network delay for realistic transitions in mock mode
const simulateDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Loads the active archive dataset, either from Google Drive or mock data.
 * @returns {Promise<{ groups: Array<Object>, photos: Array<Object>, source: string }>}
 */
async function getArchiveData() {
  // First attempt: Connect to pepperandpri backend OKLab clustering engine
  try {
    const res = await fetch('/api/palettes');
    if (res.ok) {
      const data = await res.json();
      if (data.groups && data.groups.length > 0) {
        const flattenedPhotos = data.groups.flatMap((group) => group.photos || []);
        return {
          groups: data.groups,
          photos: flattenedPhotos,
          source: 'backend-oklab',
        };
      }
    }
  } catch {
    // Backend offline; continue to client fallbacks
  }

  if (isGoogleDriveConfigured()) {
    if (driveCache) {
      return { ...driveCache, source: 'google-drive' };
    }

    if (!driveFetchPromise) {
      driveFetchPromise = (async () => {
        try {
          const archive = await fetchDriveArchive();
          if (archive.groups.length > 0) {
            driveCache = archive;
            return { ...driveCache, source: 'google-drive' };
          }
          console.warn('[PEPPERANDPRI] Google Drive returned no images; falling back to mock archive.');
        } catch (err) {
          console.warn(
            '[PEPPERANDPRI] Google Drive fetch failed; falling back to mock archive:',
            err.message
          );
        }
        return null;
      })();
    }

    const driveResult = await driveFetchPromise;
    if (driveResult) return driveResult;
  }

  await simulateDelay(350);
  const flattenedPhotos = MOCK_PALETTES.flatMap((group) =>
    group.photos.map((photo) => ({
      ...photo,
      groupId: group.id,
      palette: group.colors,
      paletteName: group.name,
    }))
  );

  return {
    groups: MOCK_PALETTES,
    photos: flattenedPhotos,
    source: 'mock-archive',
  };
}

/**
 * Fetch all palette groups for the Palettewise page.
 * @returns {Promise<Array>} Array of palette group objects
 */
export async function fetchPaletteGroups() {
  const { groups } = await getArchiveData();
  return groups;
}

/**
 * Fetch a single palette group by ID.
 * @param {string} id - Stable group ID
 * @returns {Promise<Object|null>} Palette group or null
 */
export async function fetchPaletteGroup(id) {
  const { groups } = await getArchiveData();
  return groups.find((g) => g.id === id) || null;
}

/**
 * Fetch all photos for the Catalogue page.
 * @returns {Promise<Array>} Array of photo objects with group and palette info
 */
export async function fetchPhotos() {
  const { photos } = await getArchiveData();
  return photos;
}

/**
 * Fetch a single photo by ID.
 * @param {string} id - Stable photo ID
 * @returns {Promise<Object|null>} Photo with palette info or null
 */
export async function fetchPhoto(id) {
  const { photos, groups } = await getArchiveData();
  const photo = photos.find((p) => p.id === id);
  if (!photo) return null;

  const group = groups.find((g) => g.id === photo.groupId);
  return {
    ...photo,
    palette: photo.palette || group?.colors || [],
    paletteName: group?.name || null,
    groupRevision: group?.revision ?? 1,
  };
}

/**
 * Invalidate cached Drive data (useful for manual refresh or uploads).
 */
export function invalidateArchiveCache() {
  driveCache = null;
  driveFetchPromise = null;
}

/**
 * Triggers backend OKLab Drive synchronization.
 */
export async function syncDriveNow() {
  invalidateArchiveCache();
  const res = await fetch('/api/palettes/sync-drive', { method: 'POST' });
  return res.json();
}
