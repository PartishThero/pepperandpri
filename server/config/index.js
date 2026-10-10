import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

export function getDriveConfig() {
  try {
    process.loadEnvFile(envPath);
  } catch {
    // Ignored if missing
  }
  return {
    folderId: process.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '',
    apiKey: process.env.VITE_GOOGLE_API_KEY || '',
  };
}

export const CONFIG = {
  PORT: process.env.PORT || 5001,
  ANALYSIS_WIDTH: 80,
  ANALYSIS_HEIGHT: 80,
  PALETTE_SIZE: 5,
  KMEANS_MAX_ITERATIONS: 25,
  SIMILARITY_THRESHOLD: Number(process.env.SIMILARITY_THRESHOLD) || 0.052,
};

export default CONFIG;
