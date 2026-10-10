import { useEffect, useRef, useState } from 'react';
import { fetchPaletteGroups, syncDriveNow } from '../services/api';
import PaletteRow from '../components/PaletteRow';
import PhotoModal from '../components/PhotoModal';
import { useSpotlight } from '../hooks/useSpotlight';

/**
 * Palettewise: the core page.
 * The page scrolls inside <main> with per-row scroll-snap.
 * 60svh headline + row 1 fills the remaining 40svh.
 * Every scroll after that locks the next row to the top.
 */
export default function Palettewise() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const scrollRef = useRef(null);
  const activeIndex = useSpotlight(scrollRef, groups.length);

  const loadGroups = () => {
    fetchPaletteGroups()
      .then(setGroups)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleSyncDrive = async () => {
    setSyncing(true);
    try {
      const data = await syncDriveNow();
      if (data.groups) {
        setGroups(data.groups);
      } else {
        loadGroups();
      }
    } catch {
      loadGroups();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main
      ref={scrollRef}
      id="palettewise-page"
      aria-label="Palettewise colour archive"
      className="relative h-[100svh] overflow-y-auto snap-y snap-mandatory overscroll-y-contain scroll-smooth bg-bg"
    >
      {/* 60% of the screen: the headline */}
      <section className="h-[60svh] snap-start flex items-end justify-center px-[var(--content-pad)] pb-lg">
        <div className="text-center">
          <p className="font-serif text-[clamp(1.1rem,2vw,1.4rem)] font-light italic leading-[1.9] text-secondary max-w-[28rem] mx-auto">
            Colours that live together,
            <br />
            found across different moments.
          </p>

          <div className="flex items-center justify-center gap-3 mt-md">
            <button
              onClick={handleSyncDrive}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-micro tracking-widest uppercase text-muted hover:text-primary border border-[rgba(44,40,37,0.15)] hover:border-primary/40 bg-surface/60 backdrop-blur-sm transition-all duration-300 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span className={`inline-block ${syncing ? 'animate-spin' : ''}`}>↻</span>
              <span>{syncing ? 'Analyzing Drive...' : 'Sync Google Drive'}</span>
            </button>
          </div>

          <div className="w-10 h-[1px] bg-[rgba(44,40,37,0.18)] mx-auto mt-4" />
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-5 h-5 border-[1.5px] border-[rgba(44,40,37,0.18)] border-t-primary rounded-full animate-[spinnerRotate_1s_linear_infinite]" />
        </div>
      )}

      {/* Row 1 fills the remaining 40%. Rows after it lock to the top. */}
      {!loading && groups.length > 0 && (
        <div className="content-wrapper">
          {groups.map((group, i) => (
            <PaletteRow
              key={group.id}
              group={group}
              index={i}
              isActive={i === activeIndex}
              onPhotoSelect={setSelectedPhoto}
            />
          ))}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="content-wrapper flex flex-col items-center justify-center min-h-[40vh] text-center text-muted py-24">
          <p>No palette groups yet.</p>
          <p className="text-small text-faint mt-xs">
            Upload photographs to discover their colour families.
          </p>
        </div>
      )}

      {/* Lets the last row reach the top, then the footer sits below it */}
      {!loading && groups.length > 0 && <div className="h-[30svh]" />}

      <div className="relative z-[2] flex items-center justify-center py-xl px-[var(--content-pad)] border-t border-[rgba(44,40,37,0.1)] bg-bg">
        <p className="font-sans text-micro tracking-wide uppercase text-faint">
          {groups.length} palette{groups.length !== 1 ? ' families' : ' family'} ·{' '}
          {groups.reduce((sum, g) => sum + g.photoCount, 0)} photographs
        </p>
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </main>
  );
}