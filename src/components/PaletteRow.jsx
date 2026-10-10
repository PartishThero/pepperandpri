import { useEffect, useRef, useState, useMemo } from 'react';
import PaletteLabel from './PaletteLabel';
import PaletteBlock from './PaletteBlock';
import FlexCarousel from './FlexCarousel';
import CAROUSEL_CONFIG from '../config/carouselConfig';

const REST_COL = 72;   // column width when the number is small
const REST_FONT = 20;  // number size when not in the spotlight
const LINE = 0.72;     // must match leading in PaletteLabel
const GLYPH_W = 0.56;  // approx digit width in em

export default function PaletteRow({ group, index, isActive, style, onPhotoSelect }) {
  const gridRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setBox({ w: entry.contentRect.width, h: entry.contentRect.height })
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const digits = String(index + 1).length;
  const maxCol = Math.min(box.h * 0.5, box.w * 0.3) || REST_COL;
  const colWidth = isActive ? Math.max(maxCol, REST_COL) : REST_COL;
  const fontSize = isActive
    ? Math.min(box.h / LINE, colWidth / (GLYPH_W * digits))
    : REST_FONT;

  // Format photographs for FlexCarousel
  const carouselItems = useMemo(() => {
    if (!group.photos || group.photos.length === 0) return [];
    return group.photos.map((photo) => ({
      src: photo.imageUrl || photo.thumbnailUrl,
      alt: photo.title || photo.name || 'Photograph',
      title: photo.title || photo.name?.replace(/\.[^/.]+$/, '') || '',
      subtitle: group.name || '',
      rawPhoto: photo,
    }));
  }, [group.photos, group.name]);

  return (
    <article
      id={`palette-row-${group.id}`}
      data-index={index}
      style={style}
      className={`min-h-[480px] md:min-h-[540px] py-8
  transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
  snap-center snap-always
  ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-75'}`}
    >
      <div
        ref={gridRef}
        className="grid h-full items-start gap-[clamp(1rem,2.5vw,2.5rem)] transition-[grid-template-columns] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateColumns: `${colWidth}px minmax(0,1fr)` }}
      >
        {/* Left of the barrier: number only */}
        <PaletteLabel index={index} fontSize={fontSize} isActive={isActive} />

        {/* Right of the barrier: palette + name, then FlexCarousel */}
        <div className="min-w-0 h-full flex flex-col justify-center">
          <div className="flex items-center gap-[clamp(0.8rem,2vw,1.8rem)] mb-3">
            <PaletteBlock
              colors={group.colors}
              isActive={isActive}
              paletteName={group.name}
            />
            <h2 className="cursor-default font-serif text-[clamp(1.25rem,2.2vw,1.75rem)] font-normal text-primary tracking-[0.02em] leading-none">
              {group.name || `Palette Family ${index + 1}`}
            </h2>
          </div>

          {/* WebGL Liquid/Ribbon FlexCarousel */}
          <div className="relative w-full h-[360px] md:h-[440px] overflow-hidden rounded-[4px]">
            <FlexCarousel
              items={carouselItems}
              {...CAROUSEL_CONFIG}
              onSelect={(idx, item) => {
                if (onPhotoSelect && item?.rawPhoto) {
                  onPhotoSelect({
                    ...item.rawPhoto,
                    palette: group.colors,
                    groupId: group.id,
                    paletteName: group.name,
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}