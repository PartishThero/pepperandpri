import { useState, useRef, useEffect } from 'react';

/**
 * Atmos Gallery Style Palette Block.
 * Instead of a full-width slim line, this is a compact, taller block (~32px height, ~210px width)
 * with rounded corners and interactive swatches that dynamically expand under the mouse cursor.
 */
export default function PaletteBlock({ colors, isActive, paletteName }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [touchedIndex, setTouchedIndex] = useState(null);
  const containerRef = useRef(null);

  // Close touch tooltip on outside click
  useEffect(() => {
    if (touchedIndex === null) return;
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setTouchedIndex(null);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [touchedIndex]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : touchedIndex;
  const activeColor = activeIndex !== null ? colors[activeIndex] : null;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center shrink-0 group/palette select-none"
    >
      {/* — Compact Atmos Swatch Capsule — */}
      <div
        className={`relative flex h-[32px] max-md:h-[28px] w-[210px] max-sm:w-[170px] rounded-[6px] overflow-hidden border border-[rgba(44,40,37,0.15)] shadow-sm transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-bg-warm ${
          isActive
            ? 'opacity-100 ring-1 ring-[rgba(44,40,37,0.12)] shadow-soft'
            : 'opacity-75 hover:opacity-100'
        }`}
        role="img"
        aria-label={`${paletteName || 'Colour'} palette`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {colors.map((c, i) => {
          const isHovered = activeIndex === i;
          // Dynamically expand the hovered swatch while smoothly flexing others
          const flexFactor = isHovered
            ? c.weight * 2.2
            : activeIndex !== null
            ? c.weight * 0.75
            : c.weight;

          return (
            <div
              key={`${c.hex}-${i}`}
              className="relative cursor-pointer transition-[flex,filter] duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] h-full"
              style={{
                backgroundColor: c.hex,
                flex: `${flexFactor} 0 0`,
                filter: isHovered ? 'brightness(1.08)' : 'none',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={(e) => {
                e.stopPropagation();
                setTouchedIndex((prev) => (prev === i ? null : i));
              }}
              role="button"
              tabIndex={0}
              aria-label={`${c.name || c.hex}, ${Math.round(c.weight * 100)}%`}
            >
              {/* Subtle inner highlight border on hover */}
              {isHovered && (
                <div className="absolute inset-0 ring-1 ring-inset ring-white/30 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* — Interactive Floating Color Detail Tooltip — */}
      {activeColor && (
        <div
          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-0 z-30 flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] bg-primary text-bg font-sans shadow-medium animate-[modalFadeIn_0.18s_ease-out] whitespace-nowrap before:content-[''] before:absolute before:-bottom-1 before:left-6 before:border-4 before:border-transparent before:border-t-primary"
        >
          <span
            className="w-2.5 h-2.5 rounded-[2px] shadow-sm shrink-0 border border-white/20"
            style={{ backgroundColor: activeColor.hex }}
          />
          <div className="flex items-baseline gap-1.5 leading-none">
            {activeColor.name && (
              <span className="text-[0.68rem] font-medium tracking-wide text-bg">
                {activeColor.name}
              </span>
            )}
            <span className="text-[0.65rem] font-mono opacity-80 tabular-nums">
              {activeColor.hex}
            </span>
            <span className="text-[0.62rem] text-accent font-semibold ml-0.5">
              {Math.round(activeColor.weight * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
