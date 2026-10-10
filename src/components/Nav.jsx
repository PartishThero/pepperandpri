import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  const [currentPath, setCurrentPath] = useState(location.pathname);
  if (currentPath !== location.pathname) {
    setCurrentPath(location.pathname);
    setMenuOpen(false);
  }

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] py-sm transition-all duration-500 ease-out border-b ${
        scrolled
          ? 'bg-[#f5f2ed]/85 backdrop-blur-md backdrop-saturate-150 border-[rgba(44,40,37,0.1)]'
          : 'border-transparent'
      }`}
      id="main-nav"
    >
      <div className="content-wrapper flex items-center justify-between">
        <NavLink
          to="/"
          className="font-serif text-h3 font-normal tracking-[0.06em] text-primary transition-opacity duration-200 hover:opacity-65"
          id="nav-logo"
        >
          pepperandpri
        </NavLink>

        {/* 44x44px touch target mobile menu toggle */}
        <button
          className="hidden max-sm:flex flex-col justify-center items-center w-11 h-11 gap-[5px] z-[110] cursor-pointer rounded-full active:bg-[rgba(44,40,37,0.06)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          id="nav-menu-toggle"
        >
          <span
            className={`block w-[22px] h-[1px] bg-primary transition-all duration-300 ${
              menuOpen ? 'translate-y-[3px] rotate-45' : ''
            }`}
          />
          <span
            className={`block w-[22px] h-[1px] bg-primary transition-all duration-300 ${
              menuOpen ? '-translate-y-[3px] -rotate-45' : ''
            }`}
          />
        </button>

        <nav
          className={`flex items-center gap-[clamp(1.5rem,3vw,3rem)] max-sm:fixed max-sm:inset-0 max-sm:h-[100dvh] max-sm:flex-col max-sm:justify-center max-sm:gap-10 max-sm:bg-bg/95 max-sm:backdrop-blur-lg max-sm:z-[105] max-sm:transition-all max-sm:duration-500 ${
            menuOpen
              ? 'max-sm:opacity-100 max-sm:pointer-events-auto'
              : 'max-sm:opacity-0 max-sm:pointer-events-none'
          }`}
          role="navigation"
          aria-label="Main navigation"
        >
          <NavLink
            to="/catalogue"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `group relative py-[0.2em] font-sans text-micro uppercase tracking-wide max-sm:font-serif max-sm:text-3xl max-sm:italic max-sm:tracking-normal max-sm:lowercase max-sm:first-letter:uppercase transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted hover:text-primary'
              }`
            }
            id="nav-catalogue"
          >
            {({ isActive }) => (
              <>
                Catalogue
                <span
                  className={`absolute -bottom-[2px] left-0 right-0 h-[1px] bg-primary transition-transform duration-500 origin-left max-sm:hidden ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </>
            )}
          </NavLink>
          <NavLink
            to="/palettewise"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `group relative py-[0.2em] font-sans text-micro uppercase tracking-wide max-sm:font-serif max-sm:text-3xl max-sm:italic max-sm:tracking-normal max-sm:lowercase max-sm:first-letter:uppercase transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted hover:text-primary'
              }`
            }
            id="nav-palettewise"
          >
            {({ isActive }) => (
              <>
                Palettewise
                <span
                  className={`absolute -bottom-[2px] left-0 right-0 h-[1px] bg-primary transition-transform duration-500 origin-left max-sm:hidden ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
