import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Landing from './pages/Landing';
import Catalogue from './pages/Catalogue';
import Palettewise from './pages/Palettewise';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Nav />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/palettewise" element={<Palettewise />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
