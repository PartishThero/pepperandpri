import { useState, useRef } from 'react';

/**
 * Large, cinematic photo card with 3D mouse parallax tilt and interactive lighting.
 * Built for high visual impact — significantly larger dimensions than traditional thumbnails.
 * Every movement of the mouse tilts and illuminates the card fluidly.
 */
export default function PhotoTile({
  photo,
  isActive,
  index = 0,
  onClick,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <figure
      className={`shrink-0 snap-start transition-opacity duration-500 ease-out ${
        isActive ? 'opacity-100' : 'opacity-75 hover:opacity-100'
      } ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        transitionDelay: isActive ? `${(index % 6) * 45}ms` : '0ms',
      }}
      id={`photo-${photo.id}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={`View photo ${photo.title || photo.id}`}
    >
      <div className="relative w-[clamp(320px,34vw,480px)] max-md:w-[clamp(260px,65vw,360px)] aspect-[16/10] overflow-hidden rounded-[3px] bg-bg-deep border border-[rgba(44,40,37,0.08)] select-none">
        {!error ? (
          <img
            src={photo.thumbnailUrl}
            alt={photo.title || ''}
            draggable={false}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-opacity duration-500 ease-out pointer-events-none ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              if (photo.driveId && !e.currentTarget.dataset.fallbackTried) {
                e.currentTarget.dataset.fallbackTried = 'true';
                e.currentTarget.src = `https://drive.google.com/uc?export=view&id=${photo.driveId}`;
              } else {
                setError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-faint text-2xl select-none">
            <span>×</span>
          </div>
        )}
      </div>
    </figure>
  );
}
