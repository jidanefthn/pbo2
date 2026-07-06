import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import logoImage from '../assets/logo.png';

interface Movie {
  id: number;
  title: string;
  genre: string;
  posterUrl: string;
}

export default function AllMoviesPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mengambil semua data film dari API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/movies');
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        const data = await response.json();

        if (data.success && data.movies) {
          setMovies(data.movies);
        } else {
          throw new Error('Format data tidak sesuai');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="app-container" style={{ minHeight: '100vh' }}>
      {/* Navbar Atas */}
      <nav className="booking-nav">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Semua Film</h2>
        <img src={logoImage} alt="Logo" className="nav-logo-booking" />
      </nav>

      {/* Konten Utama */}
      <main className="all-movies-container">
        {isLoading ? (
          <div className="loading-state" style={{ marginTop: '100px' }}>
            <Loader2 className="spinner" size={40} />
            <p>Memuat semua film...</p>
          </div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="all-movies-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <div className="movie-poster">
                  <img src={movie.posterUrl || 'https://placehold.co/400x600/eeeeee/999999?text=NO+POSTER'} alt={movie.title} />
                </div>
                <h3 className="movie-title">{movie.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>{movie.genre}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}