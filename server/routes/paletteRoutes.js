import { Router } from 'express';
import { getFormattedPaletteGroups, getPaletteGroupById } from '../services/paletteService.js';
import { syncGoogleDriveFolder } from '../services/driveSyncService.js';
import { getDriveConfig } from '../config/index.js';
import db from '../storage/dbAdapter.js';

const router = Router();

// POST /api/palettes/sync-drive — Trigger fresh Google Drive sync & in-memory palette extraction
router.post('/sync-drive', async (req, res, next) => {
  try {
    const config = getDriveConfig();
    const folderId = req.body?.folderId || config.folderId;
    const result = await syncGoogleDriveFolder({ folderId, force: true });
    const groups = await getFormattedPaletteGroups();
    res.json({ result, groups, total: groups.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/palettes — Get evolving palette groups directly reflecting active Google Drive folder
router.get('/', async (req, res, next) => {
  try {
    const { folderId } = getDriveConfig();

    // If folder changed in .env or no groups yet loaded, sync directly from Drive
    if (folderId && db.currentFolderId !== folderId) {
      await syncGoogleDriveFolder({ folderId, force: true }).catch((err) =>
        console.error('[DRIVE AUTO-SYNC ERROR]', err.message)
      );
    } else {
      let groups = await getFormattedPaletteGroups();
      if (groups.length === 0 && folderId) {
        await syncGoogleDriveFolder({ folderId }).catch((err) =>
          console.error('[DRIVE AUTO-SYNC ERROR]', err.message)
        );
      }
    }

    const groups = await getFormattedPaletteGroups();
    res.json({ groups, total: groups.length, folderId: db.currentFolderId });
  } catch (err) {
    next(err);
  }
});

// GET /api/palettes/:id — Single palette group with its members
router.get('/:id', async (req, res, next) => {
  try {
    const group = await getPaletteGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: { message: 'Palette group not found' } });
    }
    res.json({ group });
  } catch (err) {
    next(err);
  }
});

export default router;
