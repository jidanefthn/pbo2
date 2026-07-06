import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Sesuaikan "logo.png" dengan nama file gambar Anda di folder assets
import logoImage from '../assets/logo.png'; 

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isLoginMode 
      ? 'http://localhost:3000/api/auth/login' 
      : 'http://localhost:3000/api/auth/register/user';

    const payload = isLoginMode 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginMode) {
          localStorage.setItem('token', data.token);
          const userRole = data.user?.role || data.role; 
          
          if (userRole === 'admin') navigate('/admin/movies');
          else navigate('/');
        } else {
          alert('Pendaftaran berhasil! Silakan masuk menggunakan akun tersebut.');
          setIsLoginMode(true); 
          setFormData({ name: '', email: '', password: '' }); 
        }
      } else {
        throw new Error(data.message || 'Proses gagal. Silakan periksa kembali data Anda.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="centered-login-container animate-fade-up">
      {/* Logo di Kiri Atas */}
      <img src={logoImage} alt="Logo" className="logo-top-left" />

      {/* Pembungkus Judul */}
      <div className="login-heading">
        <h2>{isLoginMode ? 'Hai, senang ketemu lagi!' : 'Mari bergabung bersama kami!'}</h2>
      </div>

      {/* Kotak Form */}
      <div className="centered-card">
        {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!isLoginMode && (
            <div>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Nama Lengkap" 
                className="mtix-input"
                required 
              />
            </div>
          )}

          <div>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Email Anda" 
              className="mtix-input"
              required 
            />
          </div>
          
          <div>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Masukkan Password kamu" 
              className="mtix-input"
              required 
              minLength={6} 
            />
          </div>

          <button type="submit" className="btn-navy" disabled={isLoading}>
            {isLoading ? 'Memproses...' : (isLoginMode ? 'Login' : 'Daftar')}
          </button>

          {isLoginMode && (
            <span className="forgot-pin">Lupa Password?</span>
          )}
        </form>
      </div>

      <div className="toggle-text">
        {isLoginMode ? (
          <p>Gak punya akun? <span onClick={() => { setIsLoginMode(false); setError(''); }}>Yuk, buat akun</span></p>
        ) : (
          <p>Sudah punya akun? <span onClick={() => { setIsLoginMode(true); setError(''); }}>Login di sini</span></p>
        )}
      </div>
    </div>
  );
}