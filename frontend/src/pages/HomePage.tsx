import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Ticket, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png'; 
import promo1 from '../assets/promo1.jpg';
import promo2 from '../assets/promo2.jpg';
import promo3 from '../assets/promo3.jpg';
import promo4 from '../assets/promo4.jpg';
import promo5 from '../assets/promo5.jpg';
import promo6 from '../assets/promo6.jpg';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  description: string;
  posterUrl: string;
}

export default function HomePage() {
  const navigate = useNavigate(); 
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllMovies, setShowAllMovies] = useState(false);

  // 🌟 STATE UNTUK PENCARIAN FILM
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // 1. STATE UNTUK MENGECEK STATUS LOGIN
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const triggerLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token'); 
    setIsLoggedIn(false); 
    setShowLogoutConfirm(false); 
    navigate('/'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  // ==========================================
  // 2. REFERENSI & LOGIKA SLIDER PROMO
  // ==========================================
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleNextPromo = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (Math.ceil(scrollLeft) >= scrollWidth - clientWidth - 5) {
        const firstChild = carouselRef.current.firstElementChild;
        if (firstChild) {
          carouselRef.current.style.scrollBehavior = 'auto';
          carouselRef.current.appendChild(firstChild);
          carouselRef.current.scrollLeft -= 295;
          void carouselRef.current.offsetWidth;
          carouselRef.current.style.scrollBehavior = 'smooth';
        }
      }
      carouselRef.current.scrollBy({ left: 295 });
    }
  };

  const handlePrevPromo = () => {
    if (carouselRef.current) {
      if (carouselRef.current.scrollLeft <= 5) {
        const lastChild = carouselRef.current.lastElementChild;
        if (lastChild) {
          carouselRef.current.style.scrollBehavior = 'auto';
          carouselRef.current.prepend(lastChild);
          carouselRef.current.scrollLeft += 295;
          void carouselRef.current.offsetWidth;
          carouselRef.current.style.scrollBehavior = 'smooth';
        }
      }
      carouselRef.current.scrollBy({ left: -295 });
    }
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      handleNextPromo();
    }, 5000); 
    return () => clearInterval(slideInterval);
  }, []);

  // ==========================================
  // 3. REFERENSI & LOGIKA SLIDER FILM
  // ==========================================
  const movieGridRef = useRef<HTMLDivElement>(null);

  const handleNextMovies = () => {
    if (movieGridRef.current) {
      movieGridRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handlePrevMovies = () => {
    if (movieGridRef.current) {
      movieGridRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // ==========================================
  // 4. FETCH DATA FILM
  // ==========================================
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/movies');
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        const data = await response.json();

        if (data.success && data.movies) {
          setMovies(data.movies);
        } else {
          throw new Error('Format data dari server tidak sesuai');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // 🌟 LOGIKA UNTUK MENYARING FILM BERDASARKAN PENCARIAN
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">

      {/* NAVBAR */}
      <nav className="navbar" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 40px', 
        backgroundColor: '#0b0f19',
        borderBottom: '1px solid #1f2937'
      }}>
        
        <img 
          src={logoImage} 
          alt="TIXCO Logo" 
          className="nav-logo" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer', height: '40px' }}
        />

        <div className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#d1d5db' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
              <path d="M9 15c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1Z"/>
              <path d="M15 9c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1Z"/>
              <path d="m9 9 6 6"/>
            </svg>
            <span>Promo</span>
          </div>

          {isLoggedIn ? (
            <>
              <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={20} />
                <span>Logout</span>
              </div>
              
              <button className="btn-register-nav" onClick={() => navigate('/riwayat')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#82ebd5', color: '#0b0f19', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Ticket size={18} />
                Riwayat Tiket
              </button>
            </>
          ) : (
            <>
              <div className="nav-item" onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#d1d5db' }}>
                <span>Login</span>
              </div>
              <button className="btn-register-nav" onClick={() => navigate('/login')} style={{ padding: '10px 20px', background: '#82ebd5', color: '#0b0f19', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Buat akun
              </button>
            </>
          )}
        </div>
      </nav>

      {/* AREA PENCARIAN */}
      <section className="hero-search-section" style={{ padding: '40px', textAlign: 'center' }}>
        <h1 className="hero-title" style={{ fontSize: '36px', marginBottom: '20px', color: '#fff' }}>Feel the meanings beyond</h1>
        <div className="search-input-wrapper" style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <svg className="search-icon" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Cari judul film..." 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '25px', border: '1px solid #374151', background: '#1f2937', color: '#fff', fontSize: '16px', outline: 'none' }} 
          />
        </div>
      </section>

      {/* ==========================================
          PROMO SLIDER SECTION 
          ========================================== */}
      <section className="promo-section" style={{ padding: '0 40px 40px 40px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <div className="carousel-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '850px' }}>
          
          <button 
            className="carousel-btn prev-btn" 
            onClick={handlePrevPromo}
            style={{ position: 'absolute', left: -25, zIndex: 10, background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div 
            className="carousel-track" 
            ref={carouselRef}
            style={{ display: 'flex', gap: '15px', overflowX: 'hidden', scrollBehavior: 'smooth', width: '100%', padding: '10px 0' }}
          >
            <div className="carousel-item" style={{ minWidth: '250px', flexShrink: 0 }}>
              <img src={promo1} alt="Promo 1" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            </div>
            <div className="carousel-item" style={{ minWidth: '250px', flexShrink: 0 }}>
              <img src={promo2} alt="Promo 2" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            </div>
            <div className="carousel-item" style={{ minWidth: '250px', flexShrink: 0 }}>
              <img src={promo3} alt="Promo 3" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            </div>
            <div className="carousel-item" style={{ minWidth: '250px', flexShrink: 0 }}>
              <img src={promo4} alt="Promo 4" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            </div>
            <div className="carousel-item" style={{ minWidth: '250px', flexShrink: 0 }}>
              <img src={promo5} alt="Promo 5" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            </div>
            <div className="carousel-item" style={{ minWidth: '250px', flexShrink: 0 }}>
              <img src={promo6} alt="Promo 6" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
            </div>
          </div>

          <button 
            className="carousel-btn next-btn" 
            onClick={handleNextPromo}
            style={{ position: 'absolute', right: -25, zIndex: 10, background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
          >
            <ChevronRight size={24} />
          </button>
          
        </div>
      </section>

      {/* NOW SHOWING IN CINEMAS */}
      <section className="movies-section" style={{ padding: '0 40px 60px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title" style={{ margin: 0, color: '#fff', fontSize: '24px' }}>NOW SHOWING IN CINEMAS</h2>
          
          <button 
            onClick={() => setShowAllMovies(!showAllMovies)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#82ebd5', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              cursor: 'pointer' 
            }}
          >
            {showAllMovies ? 'Tampilkan Lebih Sedikit' : 'Show All'}
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#82ebd5', padding: '40px 0' }}>
            <Loader2 className="spinner" size={40} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '15px' }}>Memuat film...</p>
          </div>
        ) : error ? (
          <div className="error-state" style={{ color: '#ef4444', textAlign: 'center', padding: '40px 0', border: '1px solid #ef4444', borderRadius: '12px' }}>{error}</div>
        ) : (
          <div className="movies-container" style={{ position: 'relative' }}>
            
            {/* 🌟 CEK APAKAH HASIL PENCARIAN ADA */}
            {filteredMovies.length > 0 ? (
              <>
                <div 
                  className={showAllMovies ? "all-movies-grid page-transition" : "movie-grid page-transition"} 
                  ref={!showAllMovies ? movieGridRef : null}
                  style={{
                    display: showAllMovies ? 'grid' : 'flex',
                    gridTemplateColumns: showAllMovies ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'none',
                    gap: '20px',
                    overflowX: showAllMovies ? 'visible' : 'hidden',
                    scrollBehavior: 'smooth',
                    padding: '10px 0'
                  }}
                >
                  {filteredMovies.map((movie) => (
                    <div 
                      key={movie.id} 
                      className="movie-card" 
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      style={{ minWidth: showAllMovies ? 'auto' : '220px', cursor: 'pointer', transition: 'transform 0.2s' }}
                    >
                      <div className="movie-poster" style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '2/3', background: '#1f2937' }}>
                        <img src={movie.posterUrl || 'https://placehold.co/400x600/eeeeee/999999?text=NO+POSTER'} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <h3 className="movie-title" style={{ color: '#fff', fontSize: '16px', marginTop: '12px', fontWeight: '600' }}>{movie.title}</h3>
                    </div>
                  ))}
                </div>

                {!showAllMovies && filteredMovies.length > 4 && (
                  <div className="slider-nav page-transition" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                    <button className="nav-btn" onClick={handlePrevMovies} style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '50%', padding: '12px', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                    <button className="nav-btn" onClick={handleNextMovies} style={{ background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '50%', padding: '12px', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                  </div>
                )}
              </>
            ) : (
              /* 🌟 TAMPILAN JIKA FILM TIDAK DITEMUKAN */
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#111827', borderRadius: '16px', border: '1px dashed #374151', marginTop: '20px' }}>
                <h3 style={{ color: '#fff', fontSize: '22px', marginBottom: '10px' }}>Film Tidak Ditemukan</h3>
                <p style={{ color: '#9ca3af', fontSize: '16px' }}>
                  Maaf, kami tidak dapat menemukan film dengan kata kunci "<span style={{ color: '#82ebd5', fontWeight: 'bold' }}>{searchQuery}</span>". 
                  Coba gunakan judul lain.
                </p>
              </div>
            )}
            
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer" style={{ backgroundColor: '#111827', padding: '60px 40px 20px 40px', borderTop: '1px solid #1f2937', color: '#d1d5db' }}>
        <div className="footer-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div className="footer-brand" style={{ maxWidth: '400px' }}>
            <img src={logoImage} alt="TIXCO Logo" className="footer-logo" style={{ height: '40px', marginBottom: '20px' }} />
            <p style={{ lineHeight: '1.6' }}>Platform hiburan terdepan di Indonesia. Pesan tiket bioskop dan acara favoritmu dengan cepat, mudah, dan aman tanpa harus antre.</p>
          </div>
          <div className="footer-links">
            <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '16px' }}>PERUSAHAAN</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Tentang Kami</a></li>
              <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Karir</a></li>
              <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Hubungi Kami</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '16px' }}>DUKUNGAN</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pusat Bantuan</a></li>
              <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Syarat & Ketentuan</a></li>
              <li><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom" style={{ borderTop: '1px solid #374151', paddingTop: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
          <p>&copy; 2026 Nontonyuk. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}