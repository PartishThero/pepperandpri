import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchPhotos } from '../services/api';
import { useInView } from '../hooks/useAnimations';
import PhotoModal from '../components/PhotoModal';

export default function Catalogue() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [headerRef, headerVisible] = useInView({}, true);

  useEffect(() => {
    fetchPhotos()
      .then(setPhotos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="min-h-screen pt-catalogue-pt pb-2xl" id="catalogue-page" aria-label="Photo catalogue">
      {/* — Header — */}
      <div className="content-wrapper mb-xl" ref={headerRef}>
        <div className={`transition-all duration-[1200ms] ease-out ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[14px]'}`}>
          <h1 className="font-serif text-h1 font-light tracking-[0.04em] text-primary leading-heading">Catalogue</h1>
          <p className="font-serif text-h3 font-light italic text-secondary mt-xs">
            Every photograph in the archive, indexed by tonal distribution.
          </p>
          <Link to="/palettewise" className="inline-block mt-sm font-sans text-micro tracking-wide uppercase text-muted transition-colors duration-200 hover:text-primary" id="catalogue-to-palettewise">
            View by palette families →
          </Link>
        </div>
      </div>

      {/* — Grid with Larger Editorial Cards — */}
      <div className="content-wrapper grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-sm:grid-cols-1 gap-[clamp(1.5rem,3vw,2.5rem)]">
        {loading ? (
          <div className="col-span-full flex items-center justify-center min-h-[40vh]">
            <div className="w-6 h-6 border-[1.5px] border-[rgba(44,40,37,0.18)] border-t-primary rounded-full animate-[spinnerRotate_1s_linear_infinite]" />
          </div>
        ) : photos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center min-h-[40vh] text-center text-muted">
            <p>No photographs yet.</p>
            <p className="text-small text-faint mt-xs">
              Upload images to start building your colour archive.
            </p>
          </div>
        ) : (
          photos.map((photo, i) => (
            <CatalogueItem
              key={photo.id}
              photo={photo}
              index={i}
              onSelect={setSelectedPhoto}
            />
          ))
        )}
      </div>

      {/* — Photo Detail Modal — */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </section>
  );
}

function CatalogueItem({ photo, index, onSelect }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [itemRef, isVisible] = useInView({ threshold: 0.05 }, true);

  return (
    <figure
      ref={itemRef}
      className={`group cursor-pointer outline-none transition-opacity duration-700 ease-out focus-visible:ring-2 focus-visible:ring-accent ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${(index % 6) * 40}ms` }}
      id={`catalogue-photo-${photo.id}`}
      onClick={() => onSelect(photo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(photo);
        }
      }}
      aria-label={`View details for photograph ${photo.title || photo.name || photo.id}`}
    >
      {/* Clean image frame without hover distortion */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[3px] bg-bg-deep border border-[rgba(44,40,37,0.1)] select-none">
        {!error ? (
          <img
            src={photo.thumbnailUrl}
            alt=""
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
          <div className="w-full h-full flex items-center justify-center text-faint text-2xl select-none">×</div>
        )}
      </div>

      {/* — Title and Mini Atmos Swatch Capsule — */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-serif italic text-[1.1rem] text-primary group-hover:text-accent transition-colors duration-200">
            {photo.title || 'Archival Study'}
          </h3>
          <span className="font-sans text-[0.62rem] text-faint tracking-wider uppercase">
            {photo.paletteName || 'Colour Archive'}
          </span>
        </div>

        {/* Atmos style mini swatch pill */}
        <div className="flex h-[18px] w-[90px] rounded-[3px] overflow-hidden border border-[rgba(44,40,37,0.15)] shadow-2xs shrink-0">
          {(photo.palette || []).slice(0, 5).map((c, i) => (
            <div
              key={i}
              className="h-full transition-transform duration-200 group-hover:brightness-110"
              style={{
                backgroundColor: c.hex,
                flex: `${c.weight || 0.2} 0 0`,
              }}
              title={c.hex}
            />
          ))}
        </div>
      </div>
    </figure>
  );
}
