import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [entered, setEntered] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    // Staggered entrance
    const timer = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg" id="landing-page" aria-label="pepperandpri home">
      {/* — Top line — */}
      <div
        className={`absolute top-0 left-0 right-0 h-[1px] bg-[rgba(44,40,37,0.18)] origin-left transition-all duration-[1600ms] delay-[600ms] ease-out ${
          entered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`}
      />

      {/* — Hero — */}
      <div className="flex flex-col items-center text-center px-[var(--content-pad)] max-w-5xl mx-auto" ref={heroRef}>
        <h1
          className={`font-serif text-hero font-light tracking-[0.06em] leading-tight text-primary select-none transition-all duration-[1400ms] delay-[200ms] ease-out ${
            entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'
          }`}
        >
          pepper<span className="italic text-accent font-light mx-[0.02em]">&</span>pri
        </h1>

        <p
          className={`font-sans text-micro tracking-wide uppercase text-faint mt-[clamp(1rem,2.5vw,2rem)] transition-opacity duration-[1200ms] delay-[600ms] ease-out ${
            entered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          A Photographic Archive
        </p>

        <p
          className={`font-serif text-tagline font-light italic leading-[1.85] text-secondary mt-[clamp(1.5rem,3vw,2.5rem)] max-w-[34rem] transition-all duration-[1200ms] delay-[900ms] ease-out ${
            entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10px]'
          }`}
        >
          Photographs arranged not by when they were taken,
          <br />
          but by the colours they share.
        </p>

        <div
          className={`flex flex-col items-center gap-[0.6rem] mt-[clamp(2rem,4vw,3.5rem)] transition-opacity duration-[1200ms] delay-[1300ms] ease-out ${
            entered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Link
            to="/catalogue"
            className="group relative py-[0.3em] font-sans text-micro tracking-wide uppercase text-faint hover:text-primary transition-colors duration-500 ease-out"
            id="landing-cta-catalogue"
          >
            Catalogue
            <span className="absolute -bottom-[1px] left-1/2 right-1/2 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:left-0 group-hover:right-0" />
          </Link>
          <Link
            to="/palettewise"
            className="group relative py-[0.3em] font-sans text-[0.72rem] tracking-wide uppercase text-primary transition-colors duration-500 ease-out"
            id="landing-cta-palettewise"
          >
            Palettewise
            <span className="absolute -bottom-[1px] left-1/2 right-1/2 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:left-0 group-hover:right-0" />
          </Link>
        </div>
      </div>

      {/* — Bottom line — */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[rgba(44,40,37,0.18)] origin-right transition-all duration-[1600ms] delay-[800ms] ease-out ${
          entered ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
        }`}
      />

      {/* — Scroll hint — */}
      <div
        className={`absolute bottom-[clamp(2rem,4vh,3.5rem)] left-1/2 -translate-x-1/2 transition-opacity duration-1000 delay-[2000ms] ease-out ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-[3px] h-[3px] bg-faint rounded-full animate-[scrollPulse_2.5s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
      </div>
    </section>
  );
}
