import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, LayoutGrid, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import logoImage from '../assets/logo.png'; 

export default function AdminMoviePage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil data film dari database saat halaman dimuat
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/movies');
      const data = await response.json();
      if (data.success) {
        setMovies(data.movies);
      }
    } catch (error) {
      console.error("Gagal memuat film:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. FUNGSI UNTUK MENGHAPUS FILM
  const handleDelete = async (id: number, title: string) => {
    const isConfirm = window.confirm(`Apakah Anda yakin ingin menghapus film "${title}"?`);
    
    if (isConfirm) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:3000/api/movies/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.ok) {
          setMovies(movies.filter((m: any) => m.id !== id));
          alert('Film berhasil dihapus!');
        } else if (response.status === 401 || response.status === 403) {
          alert('Sesi Anda telah habis. Silakan login kembali.');
        } else {
          alert('Gagal menghapus film. Coba lagi.');
        }
      } catch (error) {
        console.error("Error saat menghapus:", error);
        alert('Terjadi kesalahan koneksi jaringan.');
      }
    }
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR KIRI */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={logoImage} alt="TIXCO Logo" onClick={() => navigate('/')} />
        </div>
        
        <nav className="sidebar-menu">
          <button className="active" onClick={() => navigate('/admin/movies')}>
            <Film size={20} /> Kelola Film
          </button>
          <button onClick={() => navigate('/admin/studios')}>
            <LayoutGrid size={20} /> Kelola Studio & Jadwal
          </button>
        </nav>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="admin-content">
        <header className="admin-header">
          <h1>Kelola Film</h1>
          <button className="btn-add" onClick={() => navigate('/admin/add-movie')}>
            <Plus size={18} /> Tambah Film
          </button>
        </header>

        <div className="table-container">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
              <Loader2 className="spinner" size={40} />
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Judul Film</th>
                  <th>Genre</th>
                  <th>Durasi (Menit)</th>
                  <th>Harga (Rp)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m: any) => (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>{m.genre}</td>
                    <td>{m.duration}</td>
                    <td>{Number(m.price || 0).toLocaleString('id-ID')}</td>
                    <td className="actions">
                      <button 
                        className="btn-edit" 
                        onClick={() => navigate(`/admin/edit-movie/${m.id}`)}
                        title="Edit Film"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(m.id, m.title)}
                        title="Hapus Film"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}