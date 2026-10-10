/**
 * PEPPERANDPRI — FlexCarousel Configuration
 * 
 * Customize any properties below to adjust the visual curvature,
 * physics, dimensions, and behavior of the carousel rows.
 */

export const CAROUSEL_CONFIG = {
  // Lens distortion preset: 'liquid' | 'ribbon' | 'vortex' | 'arch'
  preset: 'liquid',

  // Entrance animation: 'rise' | 'bloom' | 'spin' | 'deal' | 'none'
  intro: 'rise',

  // Card height as a fraction of the row height (0.1 to 1.0)
  cardHeight: 0.8,

  // Gap between cards in px
  gap: 18,

  // Corner radius of the cards in px
  radius: 10,

  // Card cropping: 'natural' (preserves photo aspect) | 'portrait' | 'square' | 'landscape'
  fit: 'natural',

  // Squeeze compression during fast dragging (0.0 to 1.0)
  squeeze: 0.18,

  // Clicking an image centers and expands it with focus mode
  focusOnClick: true,

  // Advance automatically
  autoplay: false,

  // Seconds between autoplay transitions (if autoplay: true)
  interval: 4,

  // Display title / index counter underneath the centered item
  captions: true,

  // Capture vertical mouse wheel to glide through the row
  captureWheel: true,

  // --- Advanced Lens Customization (leave undefined to use the preset defaults) ---
  lensWidth: 1.2,
  lensHeight: 1.5,
  tilt: -90,
  // roundness: 1,
  // bend: 0.34,
  // reach: 0.38,
  // curl: 'twist',      // 'twist' | 'rise' | 'fall'
  // dispersion: 0.45,   // chromatic aberration / rainbow prism split
  // liquid: 0,          // liquid wobble factor
  // followCursor: false // lens drifts towards cursor
};

export default CAROUSEL_CONFIG;
