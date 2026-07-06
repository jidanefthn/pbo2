import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditMoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState({
    title: '',
    genre: '',
    duration: '',
    posterUrl: '',
    description: '',
    price: ''
  });

  // Ambil data film saat halaman dimuat
  useEffect(() => {
    fetch(`http://localhost:3000/api/movies/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMovie(data.movie);
        }
      })
      .catch(err => console.error("Gagal memuat data:", err));
  }, [id]);

  // Fungsi submit yang sudah diperketat
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/movies/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(movie)
      });

      // Validasi apakah server benar-benar menyimpan data
      if (response.ok) {
        alert('Film berhasil diperbarui!');
        navigate('/admin/movies'); // Hanya pindah halaman jika sukses
      } else if (response.status === 401 || response.status === 403) {
        alert('Gagal: Sesi Anda habis atau tidak memiliki akses (Unauthorized).');
      } else {
        alert('Gagal memperbarui film. Pastikan format data sudah benar.');
      }
    } catch (err) {
      console.error("Error updating movie:", err);
      alert('Terjadi kesalahan koneksi ke server.');
    }
  };

  return (
    <div className="admin-form-container">
      <h1>Edit Film</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>Judul Film</label>
        <input value={movie.title} onChange={e => setMovie({...movie, title: e.target.value})} required />
        
        <div className="form-row">
          <div>
            <label>Genre</label>
            <input value={movie.genre} onChange={e => setMovie({...movie, genre: e.target.value})} />
          </div>
          <div>
            <label>Durasi (Menit)</label>
            <input value={movie.duration} onChange={e => setMovie({...movie, duration: e.target.value})} />
          </div>
          <div>
            <label>Harga (Rp)</label>
            <input type="number" value={movie.price} onChange={e => setMovie({...movie, price: e.target.value})} />
          </div>
        </div>

        <label>Tautan Poster (URL)</label>
        <input value={movie.posterUrl} onChange={e => setMovie({...movie, posterUrl: e.target.value})} />

        <label>Sinopsis</label>
        <textarea value={movie.description} onChange={e => setMovie({...movie, description: e.target.value})} rows={5} />

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin/movies')}>Batal</button>
          <button type="submit" className="btn-save">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  );
}