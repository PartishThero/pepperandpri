import { useState, useEffect, useRef } from 'react';

/**
 * Horizontal colour swatch strip for a palette group.
 * Each swatch width is proportional to its colour weight.
 * Supports both desktop hover tooltips and mobile touch tap toggles.
 */
export default function PaletteStrip({ colors, isActive }) {
  const [touchedIndex, setTouchedIndex] = useState(null);
  const stripRef = useRef(null);

  // Close touch tooltip on outside click / tap
  useEffect(() => {
    if (touchedIndex === null) return;

    const handlePointerDown = (e) => {
      if (stripRef.current && !stripRef.current.contains(e.target)) {
        setTouchedIndex(null);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [touchedIndex]);

  const handleSwatchTap = (index, e) => {
    // Only toggle if triggered by touch or click
    e.stopPropagation();
    setTouchedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div
      ref={stripRef}
      className={`relative flex w-full rounded-[3px] overflow-visible transition-all duration-500 ease-out ${
        isActive ? 'h-2 max-sm:h-[7px] opacity-100' : 'h-[6px] max-sm:h-[5px] opacity-60'
      }`}
      role="img"
      aria-label="Colour palette"
    >
      <div className="flex w-full h-full rounded-[3px] overflow-hidden">
        {colors.map((c, i) => {
          const isSelected = touchedIndex === i;

          return (
            <div
              key={`${c.hex}-${i}`}
              className={`group relative min-w-[4px] cursor-pointer transition-all duration-200 ease-out hover:scale-y-[1.8] hover:z-[2] hover:brightness-110 ${
                isSelected ? 'scale-y-[1.8] z-[3] brightness-110 ring-1 ring-primary/40' : ''
              }`}
              style={{
                backgroundColor: c.hex,
                flex: `${c.weight} 0 0`,
              }}
              title={`${c.hex} (${Math.round(c.weight * 100)}%)`}
              onClick={(e) => handleSwatchTap(i, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSwatchTap(i, e);
                }
              }}
              aria-label={`Color ${c.hex}, ${Math.round(c.weight * 100)} percent`}
            >
              {/* Tooltip: works on desktop hover and mobile touch toggle */}
              <span
                className={`pointer-events-none absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-primary text-bg font-sans text-[0.6rem] tracking-[0.06em] px-[0.7em] py-[0.4em] rounded whitespace-nowrap text-center leading-normal transition-all duration-200 ease-out z-20 before:content-[''] before:absolute before:-top-1 before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-primary ${
                  isSelected
                    ? 'opacity-100 translate-y-0 scale-100 shadow-md'
                    : 'opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 max-sm:group-hover:opacity-0'
                }`}
              >
                {c.hex}
                <br />
                {Math.round(c.weight * 100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
