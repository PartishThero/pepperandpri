# PEPPERANDPRI — Continuation Plan & Architecture Log

> **Send this entire file as your first message to pick up where we left off without having to re-analyze the codebase.**
> **Last updated:** 2026-10-11 (FlexCarousel WebGL Integration, Google Drive Fix, 2-Step Zoom & Liquid Exhibition Lightbox)

---

## PROJECT CONTEXT & ARCHITECTURE

- **Project:** Photographic archive organised by colour composition rather than subject or date.
- **Root Directory:** `/Users/partish/Downloads/VS Code/Pri's projects/pepperandpri`
- **Tech Stack:** React 19, Vite, React Router DOM v7, Tailwind CSS v4 (`@tailwindcss/vite`), OGL (WebGL), `@theme` first-class token architecture.
- **Design Aesthetic:** Warm gallery minimalism (`#f5f2ed` bg, `#2c2825` primary, `#a08060` accent, frosted glassmorphism `#0e0d0c/90`, WebGL liquid lens distortion).
- **Typography:** `Cormorant Garamond` (display serif, headings, italic accents) + `Inter` (neutral clean UI sans).

---

## COMPLETED IN THIS SESSION

### 1. Google Drive v3 Live Connection & Referrer Fix
- Fixed environment variable loading (`.env` file created with `VITE_GOOGLE_DRIVE_FOLDER_ID` and `VITE_GOOGLE_API_KEY`).
- Added `<meta name="referrer" content="no-referrer" />` and `referrerPolicy="no-referrer"` to resolve Google CDN hotlink blocking (HTTP 429/403).
- Added automatic fallback to direct Drive view endpoints.

### 2. FlexCarousel Integration (`src/components/FlexCarousel.jsx`)
- Integrated React Bits WebGL `<FlexCarousel />` powered by `ogl`.
- Added customizable presets (`liquid`, `ribbon`, `vortex`, `arch`), physics easing, and shaders.
- Replaced the horizontal scroll rows in `PaletteRow.jsx` with full WebGL carousels.

### 3. Centralized Carousel Configuration (`src/config/carouselConfig.js`)
- Created single config file controlling: `preset`, `intro`, `cardHeight`, `gap`, `radius`, `fit`, `squeeze`, `lensWidth`, `lensHeight`, `tilt`, etc.

### 4. Two-Step Zoom Interaction
- **Click 1:** Centers the card and expands into WebGL carousel focus/zoom state. The carousel zoom stays open.
- **Click 2:** Clicking the focused card launches the full exhibition modal.
- Clicking outside or pressing `Escape` resets the carousel.

### 5. Liquid Exhibition Lightbox Redesign (`src/components/PhotoModal.jsx`)
- Replaced the rigid 2-column e-commerce modal with a modern cinema lightbox.
- Added ambient colored aura cast by the photograph's dominant color tone.
- Floating translucent glass capsule bar with Cormorant Garamond typography and one-click copyable hex swatches.
- Removed legacy 3D mouse tilt and spotlight glow effects across all cards for a cleaner, high-end feel.

### 6. Backend Pipeline (`server/`)
- **Direct Google Drive Integration & Dynamic In-Memory Streaming:**
  - Removed local disk database files (`db.json`) — no local photo or palette persistence.
  - Dynamically reads `.env` on every request (`getDriveConfig()`). When `VITE_GOOGLE_DRIVE_FOLDER_ID` changes, the server automatically purges in-memory state and streams photos directly from the new Google Drive folder.
  - **Full Google Drive Pagination (`nextPageToken` & `pageSize=1000`):**
    - Removed the 100-image single-page cap.
    - Server and client paginate through all images in the folder (indexed all 343 photos in the current active folder).
  - **Perceptual Threshold & Drift Protection:**
    - Tuned `SIMILARITY_THRESHOLD` to `0.052` (configurable via `.env`).
    - Added algorithm cohesion guard: candidates must match both the evolving representative palette and the founding member of the group, preventing unbounded drift.
    - Result: Distinct, beautiful color families (24 separate palette rows across the 343 photos).
  - **Dynamic Palette Naming Engine (`server/core/paletteNaming.js` & `src/utils/paletteNaming.js`):**
    - Zero hardcoded palette arrays or preset names.
    - Derived mathematically from OKLab color science: computes dominant swatches' Lightness ($L$), Chroma ($C$), and Hue angle ($h$).
    - Produces fine-art titles reflecting the actual photographs in each row (e.g. *"Slate & Charcoal"*, *"Muted Amber & Soft Ochre"*, *"Terracotta & Deep Terracotta"*, *"Alabaster & Stone"*).
    - Titles evolve dynamically as member photos join each group.
  - Uses Google CDN's high-speed thumbnail stream (`s160`) for rapid Sharp perceptual palette extraction (processing photos in milliseconds without downloading heavy raw files).
  - Modular, single-responsibility architecture:
    - `server/core/colorSpace.js`: `toColor`, `toRgb`, `colorDistance`, `rgbToHex`, `hexToRgb`.
    - `server/core/paletteExtractor.js`: `extractPalette(pixelBuffer, channels, k)`.
    - `server/core/paletteDistance.js`: `getPaletteDistance(p1, p2)`.
    - `server/core/paletteNaming.js`: `namePalette(palette)`.
    - `server/core/groupEvolution.js`: `evolvePalette(memberPhotos, k)`.
    - `server/storage/dbAdapter.js`: Pure in-memory session store (`MemoryStore`).
    - `server/services/driveSyncService.js`: Dynamic Drive sync streaming into memory.
- **Tests & Verification:**
  - `npm test`: 100% passing tests (8/8 suites).
  - `npm run build`: Production build passes in 112ms.
- **Run Command:**
  - `npm run server` or `npm run server:dev` to launch on port 5001.

---

## NEXT STEPS (ROADMAP)

1. **Next Step A — Live Ingestion & Sync Status Indicator**:
   - Subtle, minimal UI indicator on Palettewise / Catalogue showing active photo count and sync state.
2. **Next Step B — Performance & Virtualization for Catalogue**:
   - Virtualized grid or lazy-rendering for the 343+ images in Catalogue to maintain smooth 60fps scrolling.
3. **Next Step C — Deep-Link & Shareable Palette URLs**:
   - Shareable routes for specific photos and palette families (e.g. `/palettewise?family=slate-charcoal&photo=...`).

