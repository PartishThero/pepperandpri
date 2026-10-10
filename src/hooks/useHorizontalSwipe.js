import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Enhanced hook for horizontal swipe and drag physics on gallery rows.
 *
 * Features:
 * - Native 60fps hardware-accelerated touch swipe with momentum on touch devices.
 * - Desktop click-and-drag mouse scrolling with inertia momentum gliding.
 * - Dynamic scroll indicator state (hasOverflowLeft, hasOverflowRight).
 * - Distinguishes between drags and clicks so photo selection isn't triggered on drag.
 *
 * @returns {{
 *   containerRef: React.RefObject,
 *   isDragging: boolean,
 *   hasOverflowLeft: boolean,
 *   hasOverflowRight: boolean,
 *   scrollLeft: () => void,
 *   scrollRight: () => void,
 * }}
 */
export function useHorizontalSwipe() {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasOverflowLeft, setHasOverflowLeft] = useState(false);
  const [hasOverflowRight, setHasOverflowRight] = useState(false);

  // Drag physics state refs (avoid unnecessary re-renders)
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const momentumAnimId = useRef(null);
  const dragDistance = useRef(0);

  // Check scroll boundary state for fade cues
  const updateOverflowState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setHasOverflowLeft(el.scrollLeft > 6);
    setHasOverflowRight(el.scrollLeft < maxScroll - 6);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateOverflowState();

    const handleScroll = () => {
      updateOverflowState();
    };

    const handleResize = () => {
      updateOverflowState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateOverflowState]);

  // Mouse drag & momentum gliding handlers for desktop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const stopMomentum = () => {
      if (momentumAnimId.current) {
        cancelAnimationFrame(momentumAnimId.current);
        momentumAnimId.current = null;
      }
    };

    const onMouseDown = (e) => {
      // Only handle primary left click
      if (e.button !== 0) return;

      stopMomentum();
      isPointerDown.current = true;
      startX.current = e.pageX;
      lastX.current = e.pageX;
      lastTime.current = performance.now();
      scrollStart.current = el.scrollLeft;
      velocity.current = 0;
      dragDistance.current = 0;
    };

    const onMouseMove = (e) => {
      if (!isPointerDown.current) return;

      const delta = e.pageX - startX.current;
      dragDistance.current = Math.abs(delta);

      if (dragDistance.current > 4) {
        setIsDragging(true);
      }

      el.scrollLeft = scrollStart.current - delta;

      // Track velocity for momentum release
      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt > 10) {
        velocity.current = (e.pageX - lastX.current) / dt;
        lastX.current = e.pageX;
        lastTime.current = now;
      }
    };

    const onMouseUp = () => {
      if (!isPointerDown.current) return;
      isPointerDown.current = false;

      // Release momentum glide
      if (Math.abs(velocity.current) > 0.15) {
        let v = velocity.current * 14;
        const decay = 0.92;

        const glide = () => {
          if (!containerRef.current || Math.abs(v) < 0.2) {
            momentumAnimId.current = null;
            return;
          }
          containerRef.current.scrollLeft -= v;
          v *= decay;
          momentumAnimId.current = requestAnimationFrame(glide);
        };

        momentumAnimId.current = requestAnimationFrame(glide);
      }

      // Reset isDragging after next tick to prevent triggering clicks
      setTimeout(() => {
        setIsDragging(false);
      }, 50);
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      stopMomentum();
    };
  }, []);

  const scrollByAmount = useCallback((amount) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  const scrollLeft = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    scrollByAmount(-Math.max(260, el.clientWidth * 0.7));
  }, [scrollByAmount]);

  const scrollRight = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    scrollByAmount(Math.max(260, el.clientWidth * 0.7));
  }, [scrollByAmount]);

  return {
    containerRef,
    isDragging,
    hasOverflowLeft,
    hasOverflowRight,
    scrollLeft,
    scrollRight,
  };
}
