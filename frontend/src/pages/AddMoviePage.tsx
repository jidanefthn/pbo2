import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddMoviePage() {
  const navigate = useNavigate();
  
  // State untuk menyimpan data inputan form
  const [movie, setMovie] = useState({
    title: '',
    genre: '',
    duration: '',
    posterUrl: '',
    description: '',
    price: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/movies', {
        method: 'POST', // Menggunakan POST untuk membuat data baru
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...movie,
          // Pastikan durasi dan harga dikonversi menjadi angka (Number)
          duration: Number(movie.duration),
          price: Number(movie.price)
        })
      });

      if (response.ok) {
        alert('Film berhasil ditambahkan ke database!');
        navigate('/admin/movies'); // Kembali ke halaman utama admin
      } else if (response.status === 401 || response.status === 403) {
        alert('Gagal: Sesi Anda habis atau tidak memiliki akses (Unauthorized).');
      } else {
        alert('Gagal menambahkan film. Pastikan semua data terisi dengan benar.');
      }
    } catch (err) {
      console.error("Error adding movie:", err);
      alert('Terjadi kesalahan koneksi ke server.');
    }
  };

  return (
    <div className="admin-form-container">
      <h1>Tambah Film Baru</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>Judul Film</label>
        <input 
          value={movie.title} 
          onChange={e => setMovie({...movie, title: e.target.value})} 
          placeholder="Contoh: Petaka Gunung Welirang"
          required 
        />
        
        <div className="form-row">
          <div>
            <label>Genre</label>
            <input 
              value={movie.genre} 
              onChange={e => setMovie({...movie, genre: e.target.value})} 
              placeholder="Contoh: Horror"
              required 
            />
          </div>
          <div>
            <label>Durasi (Menit)</label>
            <input 
              type="number"
              value={movie.duration} 
              onChange={e => setMovie({...movie, duration: e.target.value})} 
              placeholder="Contoh: 120"
              required 
            />
          </div>
          <div>
            <label>Harga (Rp)</label>
            <input 
              type="number" 
              value={movie.price} 
              onChange={e => setMovie({...movie, price: e.target.value})} 
              placeholder="Contoh: 50000"
              required 
            />
          </div>
        </div>

        <label>Tautan Poster (URL)</label>
        <input 
          value={movie.posterUrl} 
          onChange={e => setMovie({...movie, posterUrl: e.target.value})} 
          placeholder="https://contoh.com/poster.jpg"
        />

        <label>Sinopsis</label>
        <textarea 
          value={movie.description} 
          onChange={e => setMovie({...movie, description: e.target.value})} 
          rows={5} 
          placeholder="Tuliskan sinopsis singkat film di sini..."
        />

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin/movies')}>
            Batal
          </button>
          <button type="submit" className="btn-save">
            Tambah Film
          </button>
        </div>
      </form>
    </div>
  );
}