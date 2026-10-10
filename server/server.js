import createApp from './app.js';
import CONFIG from './config/index.js';
import db from './storage/dbAdapter.js';

async function start() {
  await db.init();

  const app = createApp();

  app.listen(CONFIG.PORT, () => {
    console.log(`[PEPPERANDPRI] Backend running at http://localhost:${CONFIG.PORT}`);
  });
}

start().catch((err) => {
  console.error('[PEPPERANDPRI] Server error:', err);
  process.exit(1);
});
