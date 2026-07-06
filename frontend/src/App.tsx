import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import AdminMoviePage from './pages/AdminMoviePage';
import LoginPage from './pages/LoginPage'; 
import EditMoviePage from './pages/EditMoviePage'; 
import AddMoviePage from './pages/AddMoviePage';
import AllMoviesPage from './pages/AllMoviePage';
import AdminStudioPage from './pages/AdminStudioPage';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Rute Autentikasi Pengguna */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rute Film & Dashboard Admin */}
        <Route path="/movie/:id" element={<MovieDetailPage />} /> 
        <Route path="/admin/movies" element={<AdminMoviePage />} />
        <Route path="/admin/edit-movie/:id" element={<EditMoviePage />} />
        <Route path="/admin/add-movie" element={<AddMoviePage />} />
        <Route path="/all-movies" element={<AllMoviesPage />} />
        <Route path="/admin/studios" element={<AdminStudioPage />} />

        {/* 404 Handler */}
        <Route 
          path="*" 
          element={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h1 style={{ color: 'red' }}>404 - Halaman Tidak Ditemukan</h1>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}