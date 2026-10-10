import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver hook for triggering entrance animations.
 * @param {Object} [options] - IO options
 * @param {number} [options.threshold=0.1] - Observer threshold
 * @param {string} [options.rootMargin='0px'] - Observer rootMargin
 * @param {boolean} [once=true] - If true, unobserve after first intersection
 * @returns {[React.RefObject, boolean]}
 */
export function useInView({ threshold = 0.1, rootMargin = '0px' } = {}, once = true) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, isVisible];
}

/**
 * Staggered entrance animation for a list of items.
 * Returns a callback ref and visibility state per index.
 * @param {number} count - Number of items
 * @param {number} delay - Delay between items in ms
 * @returns {{ containerRef: React.RefObject, visibleItems: boolean[] }}
 */
export function useStaggeredReveal(count, delay = 80) {
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(
    () => new Array(count).fill(false)
  );
  const hasTriggered = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * delay);
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count, delay]);

  return { containerRef, visibleItems };
}

/**
 * Scroll progress within a sticky container.
 * Returns 0-1 representing scroll position through a section.
 * @param {React.RefObject} sectionRef - Ref to the scrollable section
 * @returns {number} 0 to 1 progress value
 */
export function useScrollProgress(sectionRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef?.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sectionHeight = el.offsetHeight - window.innerHeight;

      if (sectionHeight <= 0) {
        setProgress(0);
        return;
      }

      const scrolled = -rect.top;
      const clamped = Math.max(0, Math.min(1, scrolled / sectionHeight));
      setProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionRef]);

  return progress;
}

/**
 * Debounced callback hook.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
