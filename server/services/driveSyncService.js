import sharp from 'sharp';
import CONFIG, { getDriveConfig } from '../config/index.js';
import db from '../storage/dbAdapter.js';
import { extractPalette } from '../core/paletteExtractor.js';
import { getPaletteDistance } from '../core/paletteDistance.js';
import { evolvePalette } from '../core/groupEvolution.js';
import { namePalette } from '../core/paletteNaming.js';

async function fetchDriveFileList(folderId, apiKey) {
  let allFiles = [];
  let pageToken = null;
  const query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`;
  const fields = 'nextPageToken, files(id, name, mimeType, thumbnailLink, createdTime)';

  do {
    let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=${encodeURIComponent(fields)}&orderBy=createdTime desc&pageSize=1000&key=${apiKey}`;

    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Google Drive API error: ${errorData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      allFiles.push(...data.files);
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return allFiles;
}

async function analyzeDriveImage(file) {
  // Use fast Google CDN thumbnail (JPEG, ~5KB) for instant perceptual extraction
  const downloadUrl = file.thumbnailLink
    ? file.thumbnailLink.replace(/=s\d+.*$/, '=s160')
    : `https://lh3.googleusercontent.com/d/${file.id}=s160`;

  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download Drive image ${file.id}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const rawPixels = await sharp(buffer)
    .rotate()
    .resize(CONFIG.ANALYSIS_WIDTH, CONFIG.ANALYSIS_HEIGHT, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();

  return extractPalette(rawPixels, 3, CONFIG.PALETTE_SIZE);
}

export async function syncGoogleDrive(options = {}) {
  const config = getDriveConfig();
  const folderId = options.folderId || config.folderId;
  const apiKey = options.apiKey || config.apiKey;

  if (!folderId || !apiKey) {
    return { syncedCount: 0, message: 'Google Drive credentials missing' };
  }

  // Purge memory when folder changes or force flag is passed
  if (db.currentFolderId !== folderId || options.force) {
    db.reset(folderId);
  }

  const driveFiles = await fetchDriveFileList(folderId, apiKey);
  if (driveFiles.length === 0) {
    return { syncedCount: 0, message: 'No images found in Google Drive folder', folderId };
  }

  let syncedCount = 0;
  const allPhotos = await db.getAllPhotos();
  const existingIds = new Set(allPhotos.map((p) => p.driveId));

  for (const file of driveFiles) {
    if (existingIds.has(file.id)) continue;

    try {
      const palette = await analyzeDriveImage(file);
      const existingGroups = await db.getAllGroups();
      const currentAll = await db.getAllPhotos();
      const currentMap = new Map();
      currentAll.forEach((p) => currentMap.set(p.id, p));

      let bestGroup = null;
      let minDistance = Infinity;

      for (const group of existingGroups) {
        const dRep = getPaletteDistance(palette, group.colors);

        // Cohesion guard: prevent gradual drift from swallowing unrelated photos
        const foundingId = group.memberPhotoIds?.[0];
        const foundingPhoto = foundingId ? currentMap.get(foundingId) : null;
        const dOrigin = foundingPhoto ? getPaletteDistance(palette, foundingPhoto.palette) : dRep;
        const effectiveDist = Math.max(dRep, dOrigin * 0.9);

        if (effectiveDist < minDistance) {
          minDistance = effectiveDist;
          bestGroup = group;
        }
      }

      let targetGroup;
      if (bestGroup && minDistance < CONFIG.SIMILARITY_THRESHOLD) {
        targetGroup = bestGroup;
      } else {
        const dynamicName = namePalette(palette);
        targetGroup = {
          id: `group-${Date.now()}-${file.id.slice(0, 5)}`,
          name: dynamicName,
          label: dynamicName,
          revision: 1,
          colors: palette,
          memberPhotoIds: [],
          createdAt: file.createdTime || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      const imageUrl = file.thumbnailLink
        ? file.thumbnailLink.replace(/=s\d+.*$/, '=s2400')
        : `https://lh3.googleusercontent.com/d/${file.id}=s2400`;

      const thumbnailUrl = file.thumbnailLink
        ? file.thumbnailLink.replace(/=s\d+.*$/, '=s800')
        : `https://lh3.googleusercontent.com/d/${file.id}=s800`;

      const photo = {
        id: `gdrive-${file.id}`,
        driveId: file.id,
        title: file.name ? file.name.replace(/\.[^/.]+$/, '') : `Drive Photo ${file.id.slice(0, 4)}`,
        originalFilename: file.name,
        imageUrl,
        thumbnailUrl,
        palette,
        groupId: targetGroup.id,
        paletteName: targetGroup.name,
        assignmentDistance: minDistance === Infinity ? 0 : minDistance,
        createdAt: file.createdTime || new Date().toISOString(),
      };

      targetGroup.memberPhotoIds = [...targetGroup.memberPhotoIds, photo.id];

      currentMap.set(photo.id, photo);
      const members = targetGroup.memberPhotoIds.map((id) => currentMap.get(id)).filter(Boolean);
      targetGroup.colors = evolvePalette(members);
      targetGroup.name = namePalette(targetGroup.colors);
      targetGroup.label = targetGroup.name;
      targetGroup.revision = (targetGroup.revision || 1) + 1;
      targetGroup.updatedAt = new Date().toISOString();

      await db.savePhoto(photo);
      await db.saveGroup(targetGroup);
      existingIds.add(file.id);
      syncedCount++;
    } catch (err) {
      console.error(`[SYNC] Error analyzing ${file.name}:`, err.message);
    }
  }

  return { syncedCount, totalFiles: driveFiles.length, folderId };
}

export const syncGoogleDriveFolder = syncGoogleDrive;
