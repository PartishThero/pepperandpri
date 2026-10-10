import { Router } from 'express';
import db from '../storage/dbAdapter.js';

const router = Router();

// GET /api/photos — List all photos (for Catalogue)
router.get('/', async (req, res, next) => {
  try {
    const photos = await db.getAllPhotos();
    res.json({ photos, total: photos.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/photos/:id — Single photo detail
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await db.getPhotoById(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: { message: 'Photo not found' } });
    }
    res.json({ photo });
  } catch (err) {
    next(err);
  }
});

export default router;
