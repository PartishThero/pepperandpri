import { useEffect, useState } from 'react';

/**
 * Returns the index of the row currently in the spotlight:
 * the row whose center is closest to the center of the scroll container.
 */
export function useSpotlight(scrollRef, count) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const centerY = box.top + box.height / 2;
      const rows = el.querySelectorAll('[data-index]');

      let current = 0;
      let best = Infinity;
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - centerY);
        if (dist < best) {
          best = dist;
          current = i;
        }
      });

      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [scrollRef, count]);

  return active;
}