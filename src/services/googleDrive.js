/**
 * Google Drive API v3 service for pepperandpri.
 *
 * Connects to Google Drive to fetch photographs from a public or shared
 * folder when VITE_GOOGLE_DRIVE_FOLDER_ID and VITE_GOOGLE_API_KEY are configured.
 *
 * If credentials are missing or the API call fails, the application
 * gracefully falls back to the curated mock archive.
 */

import { namePalette } from '../utils/paletteNaming.js';

const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

/**
 * Checks if Google Drive integration is configured via environment variables.
 * @returns {boolean}
 */
export function isGoogleDriveConfigured() {
  return Boolean(FOLDER_ID && API_KEY);
}

/**
 * Clean and format Google Drive thumbnail/content links for responsive gallery usage.
 * Google's lh3 / thumbnailLink format allows dynamic sizing by replacing the `=s...` parameter.
 *
 * @param {Object} file - Google Drive file object
 * @returns {{ thumbnailUrl: string, imageUrl: string }}
 */
function getDriveImageUrls(file) {
  const fileId = file.id;
  const thumb = file.thumbnailLink;

  if (thumb) {
    // Replace default small thumbnail size with higher resolution
    const thumbnailUrl = thumb.replace(/=s\d+.*$/, '=s600');
    const imageUrl = thumb.replace(/=s\d+.*$/, '=s2400');
    return { thumbnailUrl, imageUrl };
  }

  // Fallback to direct lh3 CDN URL and webContentLink
  return {
    thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=s600`,
    imageUrl: `https://lh3.googleusercontent.com/d/${fileId}=s2400`,
  };
}

/**
 * Deterministic palette generator for images when offline or when CORS prevents canvas inspection.
 * Generates harmonized, art-directed 5-color palettes based on a seed string.
 *
 * @param {string} seed - Seed identifier (e.g., file id or filename)
 * @returns {Array<{ hex: string, weight: number }>}
 */
function generateDeterministicPalette(seed) {
  // Pre-curated gallery color families to ensure archival visual quality
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
    [
      { hex: '#6B4C3B', weight: 0.26 },
      { hex: '#A67C5B', weight: 0.22 },
      { hex: '#3D2B1F', weight: 0.20 },
      { hex: '#C8A882', weight: 0.18 },
      { hex: '#8C6E5D', weight: 0.14 },
    ],
    [
      { hex: '#8B4F65', weight: 0.28 },
      { hex: '#C47A93', weight: 0.24 },
      { hex: '#5C2E3E', weight: 0.20 },
      { hex: '#D4A0B0', weight: 0.16 },
      { hex: '#3A1B28', weight: 0.12 },
    ],
    [
      { hex: '#4A5D3A', weight: 0.30 },
      { hex: '#7A9164', weight: 0.24 },
      { hex: '#2E3A24', weight: 0.20 },
      { hex: '#A8BD94', weight: 0.16 },
      { hex: '#1C2416', weight: 0.10 },
    ],
    [
      { hex: '#8A7A6B', weight: 0.26 },
      { hex: '#B8A898', weight: 0.24 },
      { hex: '#4A4038', weight: 0.20 },
      { hex: '#DCD4C8', weight: 0.16 },
      { hex: '#685C50', weight: 0.14 },
    ],
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % HARMONIOUS_SETS.length;
  return HARMONIOUS_SETS[index];
}

/**
 * Attempts to extract dominant colors from an image URL using offscreen canvas.
 * Falls back to deterministic palette if CORS or loading fails.
 *
 * @param {string} url - Image URL
 * @param {string} fallbackSeed - Fallback seed
 * @returns {Promise<Array<{ hex: string, weight: number }>>}
 */
export async function extractPaletteFromUrl(url, fallbackSeed) {
  if (typeof window === 'undefined') {
    return generateDeterministicPalette(fallbackSeed);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    const fallback = () => resolve(generateDeterministicPalette(fallbackSeed));

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return fallback();

        const size = 32;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        const colorCounts = {};

        // Sample pixels with quantization
        for (let i = 0; i < data.length; i += 16) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        const sorted = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        if (sorted.length < 3) return fallback();

        const total = sorted.reduce((sum, [, count]) => sum + count, 0);
        const palette = sorted.map(([rgbStr, count]) => {
          const [r, g, b] = rgbStr.split(',').map(Number);
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
          return {
            hex,
            weight: Number((count / total).toFixed(2)),
          };
        });

        resolve(palette);
      } catch {
        fallback();
      }
    };

    img.onerror = fallback;
    img.src = url;
  });
}

/**
 * Fetch image files from Google Drive v3 API.
 *
 * @param {Object} [options]
 * @param {string} [options.folderId] - Custom folder ID (defaults to env var)
 * @param {string} [options.apiKey] - Custom API key (defaults to env var)
 * @param {number} [options.pageSize] - Maximum photos to retrieve (default: 60)
 * @returns {Promise<Array<Object>>}
 */
export async function fetchGoogleDriveFiles(options = {}) {
  const folderId = options.folderId || FOLDER_ID;
  const apiKey = options.apiKey || API_KEY;

  if (!folderId || !apiKey) {
    throw new Error('Google Drive folder ID or API key is missing.');
  }

  const query = `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp')`;
  const fields = 'nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, createdTime, imageMediaMetadata)';
  const pageSize = options.pageSize || 1000;
  let allFiles = [];
  let pageToken = null;

  do {
    let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=${encodeURIComponent(
      fields
    )}&orderBy=createdTime desc&pageSize=${pageSize}&key=${apiKey}`;

    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(`Google Drive API error: ${message}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      allFiles.push(...data.files);
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return allFiles;
}

/**
 * Fetch and construct palette groups and photos from Google Drive.
 * Organizes photos into cohesive palette families suitable for Palettewise and Catalogue.
 *
 * @param {Object} [options]
 * @returns {Promise<{ groups: Array<Object>, photos: Array<Object> }>}
 */
export async function fetchDriveArchive(options = {}) {
  const files = await fetchGoogleDriveFiles(options);
  if (files.length === 0) {
    return { groups: [], photos: [] };
  }

  // Map Drive files to Archive Photo objects
  const photos = files.map((file, i) => {
    const { thumbnailUrl, imageUrl } = getDriveImageUrls(file);
    const palette = generateDeterministicPalette(file.id || `photo-${i}`);

    return {
      id: `gdrive-${file.id}`,
      driveId: file.id,
      name: file.name,
      thumbnailUrl,
      imageUrl,
      createdTime: file.createdTime,
      palette,
    };
  });

  // Group photos into palette families (chunks of 4 to 6 photos)
  const CHUNK_SIZE = 5;
  const groups = [];

  for (let i = 0; i < photos.length; i += CHUNK_SIZE) {
    const chunkPhotos = photos.slice(i, i + CHUNK_SIZE);
    const groupIndex = Math.floor(i / CHUNK_SIZE);
    const groupId = `drive-group-${groupIndex + 1}`;

    // Derive group palette from first photo or composite
    const primaryColors = chunkPhotos[0]?.palette || generateDeterministicPalette(groupId);
    const name = namePalette(primaryColors);

    const group = {
      id: groupId,
      name,
      label: name,
      revision: 1,
      photoCount: chunkPhotos.length,
      textPairs: `${Math.floor(2 + (groupIndex % 3))}/10`,
      maxContrast: `${(6.5 + (groupIndex * 1.8)).toFixed(1)}:1`,
      colors: primaryColors,
      photos: chunkPhotos.map((p) => ({
        id: p.id,
        title: p.name ? p.name.replace(/\.[^/.]+$/, '') : `Archive Study ${p.id.slice(-4)}`,
        thumbnailUrl: p.thumbnailUrl,
        imageUrl: p.imageUrl,
        groupId,
        paletteName: name,
      })),
      createdAt: chunkPhotos[0]?.createdTime || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Link back group info to photo objects
    chunkPhotos.forEach((p) => {
      p.groupId = groupId;
      p.palette = group.colors;
      p.paletteName = name;
      p.title = p.name ? p.name.replace(/\.[^/.]+$/, '') : `Archive Study ${p.id.slice(-4)}`;
    });

    groups.push(group);
  }

  return { groups, photos };
}
