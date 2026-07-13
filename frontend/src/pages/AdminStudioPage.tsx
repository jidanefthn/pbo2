import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Film,
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Armchair,
  BarChart3,
  Info,
  CheckCircle2,
  LogOutIcon
} from "lucide-react";
import logoImage from "../assets/logo.png";

export default function AdminStudioPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"studio" | "jadwal">("studio");
  const [isLoading, setIsLoading] = useState(false);
  const [generatingSeatsId, setGeneratingSeatsId] = useState<number | null>(null);

  // --- STATE UNTUK DATA MASTER ---
  const [movies, setMovies] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // --- STATE MODAL ---
  const [showStudioForm, setShowStudioForm] = useState(false);
  const [studioFormData, setStudioFormData] = useState({ name: "", status: "Tersedia" });
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({ movieId: "", studioId: "", showDate: "", showTime: "", price: "" });
  
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState({ id: 0, movieId: "", studioId: "", showDate: "", showTime: "", price: "" });

  // --- 🌟 STATE MODAL DETAIL ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const getToken = () => localStorage.getItem("token");

  // --- 🌟 FETCH DATA TERPUSAT ---
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [mRes, schRes, stRes] = await Promise.all([
        fetch("http://localhost:3000/api/movies").then(r => r.json()),
        fetch("http://localhost:3000/api/schedules").then(r => r.json()),
        fetch("http://localhost:3000/api/studios").then(r => r.json()),
      ]);

      if (mRes.success) setMovies(mRes.movies || []);
      if (schRes.success || schRes.data) setSchedules(schRes.schedules || schRes.data || []);
      if (stRes.success || stRes.data) setStudios(stRes.studios || stRes.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- INTEGRASI API STUDIO ---
  const handleStudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/studios", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ 
          name: studioFormData.name, 
          totalSeats: 120, 
          isActive: studioFormData.status === "Tersedia" 
        }),
      });
      if (response.ok) {
        setStudioFormData({ name: "", status: "Tersedia" });
        setShowStudioForm(false);
        fetchAllData();
      } else {
        alert("Gagal menambahkan studio.");
      }
    } catch (error) { alert("Terjadi kesalahan jaringan."); }
  };

  const handleDeleteStudio = async (id: number, name: string) => {
    if (window.confirm(`Yakin ingin menghapus ${name}?`)) {
      await fetch(`http://localhost:3000/api/studios/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      fetchAllData();
    }
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    alert("Fitur update status studio dapat disambungkan ke backend PUT /api/studios/:id");
  };

  // --- INTEGRASI API JADWAL ---
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          movieId: Number(scheduleFormData.movieId),
          studioId: Number(scheduleFormData.studioId),
          showDate: scheduleFormData.showDate,
          showTime: scheduleFormData.showTime,
          price: Number(scheduleFormData.price),
        }),
      });
      if (response.ok) {
        setShowScheduleForm(false);
        setScheduleFormData({ movieId: "", studioId: "", showDate: "", showTime: "", price: "" });
        fetchAllData();
      } else { alert("Gagal menambah jadwal."); }
    } catch (error) { alert("Terjadi kesalahan jaringan."); }
  };

  const handleOpenEditSchedule = (sch: any) => {
    setEditingSchedule({
      id: sch.id,
      movieId: sch.movieId,
      studioId: sch.studioId,
      showDate: sch.showDate || sch.date,
      showTime: sch.showTime || sch.time,
      price: sch.price,
    });
    setShowEditScheduleModal(true);
  };

  const handleEditScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`http://localhost:3000/api/schedules/${editingSchedule.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        movieId: Number(editingSchedule.movieId),
        studioId: Number(editingSchedule.studioId),
        showDate: editingSchedule.showDate,
        showTime: editingSchedule.showTime,
        price: Number(editingSchedule.price),
      }),
    });
    setShowEditScheduleModal(false);
    fetchAllData();
  };

  const handleDeleteSchedule = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus jadwal tayang ini sepenuhnya?")) {
      await fetch(`http://localhost:3000/api/schedules/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      fetchAllData();
    }
  };

  // --- AKSI KURSI ---
  const generateSeatsForSchedule = async (scheduleId: number) => {
    try {
      const checkRes = await fetch(`http://localhost:3000/api/seats/${scheduleId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const checkData = await checkRes.json();
      if (checkData.success && checkData.seats && checkData.seats.length > 0) {
        alert(`Jadwal ini sudah punya ${checkData.seats.length} kursi. Tidak perlu generate ulang.`);
        return;
      }
    } catch (err) { console.error("Gagal cek kursi:", err); }

    if (!window.confirm("Generate 120 kursi (A1-J12) untuk jadwal ini?")) return;

    setGeneratingSeatsId(scheduleId);
    try {
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      const seatNumbers: string[] = [];
      rows.forEach((row) => {
        for (let i = 1; i <= 12; i++) {
          seatNumbers.push(`${row}${i}`);
        }
      });

      await Promise.all(
        seatNumbers.map((seatNumber) =>
          fetch("http://localhost:3000/api/seats", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ scheduleId, seatNumber, status: "available" }),
          })
        )
      );
      alert("120 kursi berhasil dibuat!");
    } catch (err) {
      alert("Terjadi kesalahan saat generate kursi.");
    } finally {
      setGeneratingSeatsId(null);
    }
  };

  // 🌟 Fungsi Baru: Selesaikan Jadwal (Hapus Tiket & Kursi)
  const handleSelesaikanJadwal = async (scheduleId: number) => {
    if (!window.confirm("Tandai film ini sebagai SELESAI DITAYANGKAN? Tindakan ini akan menghapus SEMUA TIKET yang sudah dibeli beserta semua kursi pada jadwal ini!")) return;
    
    setIsLoading(true);
    try {
      // 1. Ambil data semua tiket/booking dari backend
      const bookingRes = await fetch("http://localhost:3000/api/bookings/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const bookingData = await bookingRes.json();

      // 2. Filter tiket yang sesuai dengan scheduleId ini lalu hapus satu per satu
      if (bookingData.success && bookingData.bookings) {
        const relatedBookings = bookingData.bookings.filter((b: any) => Number(b.scheduleId) === scheduleId);
        
        if (relatedBookings.length > 0) {
          await Promise.all(
            relatedBookings.map((booking: any) =>
              fetch(`http://localhost:3000/api/bookings/${booking.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
              })
            )
          );
        }
      }

      // 3. Ambil daftar kursi
      const checkRes = await fetch(`http://localhost:3000/api/seats/${scheduleId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const checkData = await checkRes.json();

      if (!checkData.success || !checkData.seats || checkData.seats.length === 0) {
        alert("Jadwal diselesaikan. (Tidak ada data kursi tersisa yang perlu dihapus).");
        setIsLoading(false);
        return;
      }

      // 4. Kumpulkan ID Kursi
      const seatIds = checkData.seats.map((seat: any) => seat.id);

      // 5. Hapus massal kursi (Sekarang database tidak akan memblokir karena tiket sudah dihapus)
      const results = await Promise.all(
        seatIds.map((seatId: number) =>
          fetch(`http://localhost:3000/api/seats/${seatId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
          })
        )
      );

      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        alert(`Status Selesai! Tapi ${failed} kursi gagal dihapus. Pastikan Backend Anda memiliki rute DELETE /api/bookings/:id`);
      } else {
        alert("Jadwal diselesaikan! Semua tiket dan riwayat kursi berhasil di-reset/dihapus bersih.");
      }

    } catch (error) {
      console.error("Gagal selesaikan jadwal:", error);
      alert("Terjadi kesalahan jaringan saat menghapus kursi & tiket.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fungsi Bantuan untuk Render ---
  const getMovieTitle = (mId: number) => movies.find((m) => m.id === mId)?.title || `ID Film: ${mId}`;
  const getStudioName = (sId: number) => studios.find((s) => s.id === sId)?.name || `ID Studio: ${sId}`;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo"><img src={logoImage} alt="Logo" onClick={() => navigate("/")} /></div>
        <nav className="sidebar-menu">
          <button onClick={() => navigate("/admin/movies")}><Film size={20} /> Kelola Film</button>
          <button className="active"><LayoutGrid size={20} /> Kelola Studio & Jadwal</button>
          <button onClick={() => navigate('/admin/report')}><BarChart3 size={20} /> Laporan Penjualan</button>
          <button onClick={() => navigate('/login')}><LogOutIcon size={20} /> Logout</button>
        </nav>
      </aside>

      <main className="admin-content">
        <header className="admin-header"><h1>Dashboard Studio & Jadwal</h1></header>
        
        <div className="admin-tabs" style={{ display: "flex", gap: "20px", marginBottom: "30px", borderBottom: "1px solid #1f2937" }}>
          <button onClick={() => setActiveTab("studio")} style={{ color: activeTab === "studio" ? "#82ebd5" : "#9ca3af", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", paddingBottom: "10px", borderBottom: activeTab === "studio" ? "2px solid #82ebd5" : "none" }}>Manajemen Studio</button>
          <button onClick={() => setActiveTab("jadwal")} style={{ color: activeTab === "jadwal" ? "#82ebd5" : "#9ca3af", background: "none", border: "none", cursor: "pointer", fontWeight: "bold", paddingBottom: "10px", borderBottom: activeTab === "jadwal" ? "2px solid #82ebd5" : "none" }}>Manajemen Jadwal</button>
        </div>

        {activeTab === "studio" ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3>Daftar Studio Bioskop</h3>
              <button className="btn-add" onClick={() => setShowStudioForm(true)}><Plus size={18}/> Tambah Studio</button>
            </div>
            <table>
              <thead><tr><th>Nama Studio</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>
                {studios.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", backgroundColor: s.status === "Tersedia" || s.isActive ? "#064e3b" : "#7f1d1d", color: s.status === "Tersedia" || s.isActive ? "#34d399" : "#f87171" }}>
                        {s.status === "Tersedia" || s.isActive ? "Tersedia" : "Tidak Tersedia"}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleToggleStatus(s.id, s.status)} style={{ backgroundColor: "#1e293b", color: "#38bdf8" }}>
                        {s.status === "Tersedia" || s.isActive ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteStudio(s.id, s.name)}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3>Jadwal Penayangan Aktif</h3>
              <button className="btn-add" onClick={() => setShowScheduleForm(true)}><Plus size={18}/> Tambah Jadwal</button>
            </div>
            {isLoading ? <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}><Loader2 className="spinner" size={40} /></div> : (
              <table>
                <thead><tr><th>Film</th><th>Studio</th><th>Tanggal</th><th>Jam</th><th>Harga</th><th>Aksi</th></tr></thead>
                <tbody>
                  {schedules.map(sch => (
                    <tr key={sch.id}>
                      <td style={{ fontWeight: "bold" }}>{getMovieTitle(sch.movieId)}</td>
                      <td>{getStudioName(sch.studioId)}</td>
                      <td>{sch.showDate || sch.date}</td>
                      <td style={{ color: "#82ebd5", fontWeight: "bold" }}>{sch.showTime || sch.time} WIB</td>
                      <td>Rp {Number(sch.price || 0).toLocaleString("id-ID")}</td>
                      <td className="actions">
                        <button 
                          onClick={() => { setSelectedSchedule(sch); setShowDetailModal(true); }}
                          style={{ backgroundColor: "#0284c7", color: "white", padding: "6px 16px", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          <Info size={16} /> Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MODAL STUDIO */}
        {showStudioForm && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#0b0f19", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "500px", border: "1px solid #1f2937" }}>
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Tambah Studio Baru</h2>
              <form onSubmit={handleStudioSubmit} className="admin-form">
                <label>Nama Studio</label>
                <input type="text" value={studioFormData.name} onChange={(e) => setStudioFormData({ ...studioFormData, name: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "20px", outline: "none", boxSizing: "border-box" }} />
                
                <label>Status Ketersediaan</label>
                <select value={studioFormData.status} onChange={(e) => setStudioFormData({ ...studioFormData, status: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "30px", outline: "none", boxSizing: "border-box" }}>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Tidak Tersedia">Tidak Tersedia</option>
                </select>
                
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowStudioForm(false)} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid #374151", cursor: "pointer" }}>Batal</button>
                  <button type="submit" style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#82ebd5", color: "#0b0f19", border: "none", cursor: "pointer", fontWeight: "bold" }}>Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL TAMBAH JADWAL */}
        {showScheduleForm && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#0b0f19", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "500px", border: "1px solid #1f2937" }}>
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Tambah Jadwal Tayang</h2>
              <form onSubmit={handleScheduleSubmit} className="admin-form">
                <label>Pilih Judul Film</label>
                <select value={scheduleFormData.movieId} onChange={(e) => setScheduleFormData({ ...scheduleFormData, movieId: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "15px", outline: "none", boxSizing: "border-box" }}>
                  <option value="" disabled>-- Pilih Film --</option>
                  {movies.map((movie) => (<option key={movie.id} value={movie.id}>{movie.title}</option>))}
                </select>

                <label>Pilih Studio</label>
                <select value={scheduleFormData.studioId} onChange={(e) => setScheduleFormData({ ...scheduleFormData, studioId: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "15px", outline: "none", boxSizing: "border-box" }}>
                  <option value="" disabled>-- Pilih Studio --</option>
                  {studios.filter((s) => s.status === "Tersedia" || s.isActive).map((studio) => (<option key={studio.id} value={studio.id}>{studio.name}</option>))}
                </select>

                <label>Harga Tiket (Rp)</label>
                <input type="number" value={scheduleFormData.price} onChange={(e) => setScheduleFormData({ ...scheduleFormData, price: e.target.value })} min="0" required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "15px", outline: "none", boxSizing: "border-box" }} />

                <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
                  <div style={{ flex: 1 }}>
                    <label>Tanggal Tayang</label>
                    <input type="date" value={scheduleFormData.showDate} onChange={(e) => setScheduleFormData({ ...scheduleFormData, showDate: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Jam Tayang</label>
                    <input type="time" step="1" value={scheduleFormData.showTime} onChange={(e) => setScheduleFormData({ ...scheduleFormData, showTime: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowScheduleForm(false)} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid #374151", cursor: "pointer" }}>Batal</button>
                  <button type="submit" style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#82ebd5", color: "#0b0f19", border: "none", cursor: "pointer", fontWeight: "bold" }}>Simpan Jadwal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDIT JADWAL */}
        {showEditScheduleModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#0b0f19", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "500px", border: "1px solid #1f2937" }}>
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Edit Jadwal Tayang</h2>
              <form onSubmit={handleEditScheduleSubmit} className="admin-form">
                <label>Pilih Judul Film</label>
                <select value={editingSchedule.movieId} onChange={(e) => setEditingSchedule({ ...editingSchedule, movieId: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "15px", outline: "none", boxSizing: "border-box" }}>
                  {movies.map((movie) => (<option key={movie.id} value={movie.id}>{movie.title}</option>))}
                </select>

                <label>Pilih Studio</label>
                <select value={editingSchedule.studioId} onChange={(e) => setEditingSchedule({ ...editingSchedule, studioId: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "15px", outline: "none", boxSizing: "border-box" }}>
                  {studios.map((studio) => (
                    <option key={studio.id} value={studio.id} disabled={(studio.status !== "Tersedia" && !studio.isActive) && studio.id !== Number(editingSchedule.studioId)}>
                      {studio.name} {(!studio.isActive && studio.status !== "Tersedia") ? "(Nonaktif)" : ""}
                    </option>
                  ))}
                </select>

                <label>Harga Tiket (Rp)</label>
                <input type="number" value={editingSchedule.price} onChange={(e) => setEditingSchedule({ ...editingSchedule, price: e.target.value })} min="0" required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", marginBottom: "15px", outline: "none", boxSizing: "border-box" }} />

                <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
                  <div style={{ flex: 1 }}>
                    <label>Tanggal Tayang</label>
                    <input type="date" value={editingSchedule.showDate} onChange={(e) => setEditingSchedule({ ...editingSchedule, showDate: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Jam Tayang</label>
                    <input type="time" step="1" value={editingSchedule.showTime} onChange={(e) => setEditingSchedule({ ...editingSchedule, showTime: e.target.value })} required style={{ width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "#1f2937", color: "white", border: "1px solid #374151", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowEditScheduleModal(false)} style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid #374151", cursor: "pointer" }}>Batal</button>
                  <button type="submit" style={{ padding: "10px 20px", borderRadius: "8px", backgroundColor: "#38bdf8", color: "#0b0f19", border: "none", cursor: "pointer", fontWeight: "bold" }}>Update Jadwal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🌟 MODAL DETAIL & AKSI CARD */}
        {showDetailModal && selectedSchedule && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#0b0f19", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "450px", border: "1px solid #1f2937" }}>
              
              <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#f3f4f6", display: "flex", alignItems: "center", gap: "8px" }}>
                <Info size={24} color="#82ebd5" /> Detail Jadwal
              </h2>

              {/* Info Jadwal Singkat */}
              <div style={{ backgroundColor: "#111827", padding: "15px", borderRadius: "8px", border: "1px solid #1f2937", marginBottom: "25px", color: "#d1d5db", fontSize: "15px", lineHeight: "1.8" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Film:</span> <strong style={{ color: "#fff" }}>{getMovieTitle(selectedSchedule.movieId)}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Studio:</span> <strong style={{ color: "#fff" }}>{getStudioName(selectedSchedule.studioId)}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Tanggal:</span> <strong style={{ color: "#fff" }}>{selectedSchedule.showDate || selectedSchedule.date}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Jam:</span> <strong style={{ color: "#82ebd5" }}>{selectedSchedule.showTime || selectedSchedule.time} WIB</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Harga:</span> <strong style={{ color: "#fff" }}>Rp {Number(selectedSchedule.price).toLocaleString("id-ID")}</strong></div>
              </div>

              {/* Opsi Aksi */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                
                <button 
                  onClick={() => { setShowDetailModal(false); handleSelesaikanJadwal(selectedSchedule.id); }}
                  style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#064e3b", color: "#34d399", border: "1px solid #10b981", cursor: "pointer", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                >
                  <CheckCircle2 size={18} /> Selesaikan Jadwal (Clear Kursi)
                </button>

                <button 
                  onClick={() => { setShowDetailModal(false); handleOpenEditSchedule(selectedSchedule); }}
                  style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#1e293b", color: "#38bdf8", border: "1px solid #38bdf8", cursor: "pointer", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                >
                  <Edit2 size={18} /> Edit Jadwal Tayang
                </button>

                <button 
                  onClick={() => { setShowDetailModal(false); generateSeatsForSchedule(selectedSchedule.id); }}
                  disabled={generatingSeatsId === selectedSchedule.id}
                  style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#1e293b", color: "#fbbf24", border: "1px solid #fbbf24", cursor: "pointer", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s", opacity: generatingSeatsId === selectedSchedule.id ? 0.5 : 1 }}
                >
                  {generatingSeatsId === selectedSchedule.id ? <Loader2 size={18} className="spinner" /> : <Armchair size={18} />} Tambah Kursi (Generate)
                </button>

                <button 
                  onClick={() => { setShowDetailModal(false); handleDeleteSchedule(selectedSchedule.id); }}
                  style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#450a0a", color: "#f87171", border: "1px solid #ef4444", cursor: "pointer", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                >
                  <X size={18} /> Hapus Jadwal Ini
                </button>
              </div>

              <button onClick={() => setShowDetailModal(false)} style={{ marginTop: "20px", width: "100%", padding: "12px", borderRadius: "8px", backgroundColor: "transparent", color: "#9ca3af", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                Tutup Menu
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}