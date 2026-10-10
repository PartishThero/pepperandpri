import { useEffect, useState } from 'react';

/**
 * Ultra-modern, gallery-grade exhibition lightbox.
 * Matches the floating liquid glass aesthetic of the FlexCarousel.
 * Replaces the rigid 2-column modal with an immersive cinema presentation,
 * featuring interactive harmonic color swatches with one-click hex copying.
 */
export default function PhotoModal({ photo, onClose }) {
  const [copiedHex, setCopiedHex] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  if (!photo) return null;

  const palette = photo.palette || [];
  const dominantColor = palette[0]?.hex || '#a08060';

  const copyToClipboard = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-between p-4 md:p-8 bg-[#0e0d0c]/90 backdrop-blur-2xl animate-[modalFadeIn_0.35s_cubic-bezier(0.16,1,0.3,1)] select-none overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photograph colour inspection"
    >
      {/* — Ambient Dynamic Aura Glow — */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse 65% 50% at 50% 45%, ${dominantColor} 0%, transparent 75%)`,
        }}
      />

      {/* — Top Bar: Brand & Minimalist Floating Close Pill — */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto py-2">
        <div className="flex items-center gap-3">
          <span className="font-serif italic text-lg text-white/90">
            pepper<span className="text-accent mx-0.5">&</span>pri
          </span>
          <span className="text-white/20 text-xs">/</span>
          <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-white/50">
            {photo.paletteName || 'Archive Study'}
          </span>
        </div>

        {/* Floating Glass Close Button */}
        <button
          onClick={onClose}
          className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white backdrop-blur-md transition-all duration-200 cursor-pointer text-[12px] font-sans tracking-widest uppercase active:scale-95 shadow-sm"
          aria-label="Close photo view"
        >
          <span>Close</span>
          <span className="text-white/40 group-hover:text-white transition-colors">ESC</span>
        </button>
      </header>

      {/* — Hero Image Centerpiece — */}
      <main
        className="relative z-10 flex-1 flex items-center justify-center my-4 md:my-6 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[64vh] max-w-[90vw] flex items-center justify-center rounded-[6px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] border border-white/15 bg-black/40">
          <img
            src={photo.imageUrl || photo.thumbnailUrl}
            alt={photo.title || photo.name || 'Photograph from archive'}
            referrerPolicy="no-referrer"
            className="w-auto h-auto max-h-[64vh] max-w-[90vw] object-contain block transition-transform duration-500 ease-out"
          />
        </div>
      </main>

      {/* — Bottom Floating Glass Capsule Bar — */}
      <footer
        className="relative z-10 w-full max-w-4xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.09] backdrop-blur-xl border border-white/15 shadow-2xl transition-all duration-300">
          {/* Photograph Metadata */}
          <div className="min-w-0">
            <h2 className="font-serif italic text-xl md:text-2xl text-white font-normal truncate">
              {photo.title || photo.name?.replace(/\.[^/.]+$/, '') || 'Archive Photographic Study'}
            </h2>
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mt-0.5">
              {photo.paletteName ? `${photo.paletteName} Palette Family` : 'Chromatographic Distribution'}
            </p>
          </div>

          {/* Interactive Spectrum Color Swatches */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 [scrollbar-width:none]">
            {palette.map((color, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(color.hex)}
                className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-white/25 transition-all duration-200 cursor-pointer active:scale-95"
                title={`Copy hex ${color.hex}`}
              >
                {/* Color Dot */}
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-black/20 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                />

                {/* Hex Code & Weight */}
                <span className="font-mono text-[11px] text-white/80 tabular-nums">
                  {copiedHex === color.hex ? (
                    <span className="text-[#8bc34a] font-medium">COPIED</span>
                  ) : (
                    color.hex
                  )}
                </span>

                <span className="font-sans text-[10px] text-white/40 tabular-nums">
                  {Math.round(color.weight * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
