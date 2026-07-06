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
} from "lucide-react";
import logoImage from "../assets/logo.png";

export default function AdminStudioPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"studio" | "jadwal">("studio");
  const [isLoading, setIsLoading] = useState(false);
  const [generatingSeatsId, setGeneratingSeatsId] = useState<number | null>(
    null
  );

  // --- STATE UNTUK DATA MASTER ---
  const [movies, setMovies] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([
    { id: 1, name: "Studio 1 Ultra XD", status: "Tersedia" },
    { id: 2, name: "Studio 2 Gold VIP", status: "Tidak Tersedia" },
    { id: 3, name: "Studio 3 Dolby Atmos", status: "Tersedia" },
  ]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // --- FETCH DATA SAAT HALAMAN DIMUAT ---
  useEffect(() => {
    fetchMoviesAndSchedules();
  }, []);

  const fetchMoviesAndSchedules = async () => {
    setIsLoading(true);
    try {
      // Ambil daftar film
      const movieRes = await fetch("http://localhost:3000/api/movies");
      const movieData = await movieRes.json();
      if (movieData.success) setMovies(movieData.movies);

      // Ambil daftar jadwal dari backend
      const scheduleRes = await fetch("http://localhost:3000/api/schedules");
      const scheduleData = await scheduleRes.json();

      // Sesuaikan jika format response API Anda berbeda
      if (scheduleData.success || scheduleData.data) {
        setSchedules(scheduleData.schedules || scheduleData.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data dari API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STATE MODAL STUDIO (Tetap lokal sementara) ---
  const [showStudioForm, setShowStudioForm] = useState(false);
  const [studioFormData, setStudioFormData] = useState({
    name: "",
    status: "Tersedia",
  });

  // --- STATE MODAL JADWAL (Disesuaikan dengan Backend) ---
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    movieId: "",
    studioId: "",
    showDate: "",
    showTime: "",
    price: "",
  });

  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState({
    id: 0,
    movieId: "",
    studioId: "",
    showDate: "",
    showTime: "",
    price: "",
  });

  const getToken = () => localStorage.getItem("token");

  // --- 🌟 INTEGRASI API: TAMBAH JADWAL ---
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          movieId: Number(scheduleFormData.movieId),
          studioId: Number(scheduleFormData.studioId),
          showDate: scheduleFormData.showDate,
          showTime: scheduleFormData.showTime,
          price: Number(scheduleFormData.price),
        }),
      });

      if (response.ok || response.status === 201) {
        alert("Jadwal berhasil ditambahkan!");
        setScheduleFormData({
          movieId: "",
          studioId: "",
          showDate: "",
          showTime: "",
          price: "",
        });
        setShowScheduleForm(false);
        fetchMoviesAndSchedules(); // Refresh tabel
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Gagal menambah jadwal.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // --- 🌟 INTEGRASI API: UPDATE JADWAL ---
  const handleOpenEditSchedule = (sch: any) => {
    setEditingSchedule({
      id: sch.id,
      movieId: sch.movieId,
      studioId: sch.studioId,
      showDate: sch.showDate || sch.date, // Antisipasi penamaan field dari DB
      showTime: sch.showTime || sch.time,
      price: sch.price,
    });
    setShowEditScheduleModal(true);
  };

  const handleEditScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3000/api/schedules/${editingSchedule.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            movieId: Number(editingSchedule.movieId),
            studioId: Number(editingSchedule.studioId),
            showDate: editingSchedule.showDate,
            showTime: editingSchedule.showTime,
            price: Number(editingSchedule.price),
          }),
        }
      );

      if (response.ok) {
        alert("Jadwal berhasil diperbarui!");
        setShowEditScheduleModal(false);
        fetchMoviesAndSchedules();
      } else {
        alert("Gagal memperbarui jadwal.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // --- 🌟 INTEGRASI API: HAPUS JADWAL ---
  const handleDeleteSchedule = async (id: number) => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus jadwal tayang ini?")
    ) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/schedules/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (response.ok) {
          fetchMoviesAndSchedules(); // Refresh otomatis setelah dihapus
        } else {
          alert("Gagal menghapus jadwal.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan jaringan.");
      }
    }
  };

  // --- Fungsi Bantuan untuk Render Tabel ---
  const getMovieTitle = (mId: number) =>
    movies.find((m) => m.id === mId)?.title || `ID Film: ${mId}`;
  const getStudioName = (sId: number) =>
    studios.find((s) => s.id === sId)?.name || `ID Studio: ${sId}`;

  // --- FUNGSI STUDIO (Lokal Sementara) ---
  const handleStudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudios([
      ...studios,
      {
        id: Date.now(),
        name: studioFormData.name,
        status: studioFormData.status,
      },
    ]);
    setStudioFormData({ name: "", status: "Tersedia" });
    setShowStudioForm(false);
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    const nextStatus =
      currentStatus === "Tersedia" ? "Tidak Tersedia" : "Tersedia";
    setStudios(
      studios.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
  };
  const handleDeleteStudio = (id: number, name: string) => {
    if (window.confirm(`Hapus ${name}?`))
      setStudios(studios.filter((s) => s.id !== id));
  };

  const generateSeatsForSchedule = async (scheduleId: number) => {
    // Cek dulu, jangan sampe generate dobel kalo udah ada kursinya
    try {
      const checkRes = await fetch(
        `http://localhost:3000/api/seats/${scheduleId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const checkData = await checkRes.json();
      if (checkData.success && checkData.seats && checkData.seats.length > 0) {
        alert(
          `Jadwal ini sudah punya ${checkData.seats.length} kursi. Tidak perlu generate ulang.`
        );
        return;
      }
    } catch (err) {
      console.error("Gagal cek kursi existing:", err);
    }

    if (!window.confirm("Generate 120 kursi (A1-J12) untuk jadwal ini?"))
      return;

    setGeneratingSeatsId(scheduleId);
    try {
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      const seatNumbers: string[] = [];
      rows.forEach((row) => {
        for (let i = 1; i <= 12; i++) {
          seatNumbers.push(`${row}${i}`);
        }
      });

      const results = await Promise.all(
        seatNumbers.map((seatNumber) =>
          fetch("http://localhost:3000/api/seats", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({
              scheduleId,
              seatNumber,
              status: "available",
            }),
          })
        )
      );

      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        alert(
          `Selesai, tapi ${failed} kursi gagal dibuat. Cek console untuk detail.`
        );
      } else {
        alert("120 kursi berhasil dibuat untuk jadwal ini!");
      }
    } catch (err) {
      console.error("Gagal generate kursi:", err);
      alert("Terjadi kesalahan saat generate kursi.");
    } finally {
      setGeneratingSeatsId(null);
    }
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={logoImage} alt="TIXCO Logo" onClick={() => navigate("/")} />
        </div>
        <nav className="sidebar-menu">
          <button onClick={() => navigate("/admin/movies")}>
            <Film size={20} /> Kelola Film
          </button>
          <button className="active" onClick={() => navigate("/admin/studios")}>
            <LayoutGrid size={20} /> Kelola Studio & Jadwal
          </button>
          <button onClick={() => navigate('/admin/report')}>
            <BarChart3 size={20} /> Laporan Penjualan
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-content" style={{ position: "relative" }}>
        <header className="admin-header" style={{ marginBottom: "10px" }}>
          <h1>Dashboard Studio & Jadwal</h1>
        </header>

        <div
          className="admin-tabs"
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "30px",
            borderBottom: "1px solid #1f2937",
            paddingBottom: "10px",
          }}
        >
          <button
            onClick={() => setActiveTab("studio")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "studio" ? "#82ebd5" : "#9ca3af",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              padding: "5px 10px",
              borderBottom:
                activeTab === "studio" ? "2px solid #82ebd5" : "none",
            }}
          >
            Manajemen Studio
          </button>
          <button
            onClick={() => setActiveTab("jadwal")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "jadwal" ? "#82ebd5" : "#9ca3af",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              padding: "5px 10px",
              borderBottom:
                activeTab === "jadwal" ? "2px solid #82ebd5" : "none",
            }}
          >
            Manajemen Jadwal Film
          </button>
        </div>

        {/* TAB 1: STUDIO */}
        {activeTab === "studio" && (
          <div className="page-transition">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>Daftar Studio Bioskop</h3>
              <button
                className="btn-add"
                onClick={() => setShowStudioForm(true)}
              >
                <Plus size={18} /> Tambah Studio
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nama Studio</th>
                    <th>Status Ketersediaan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {studios.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            backgroundColor:
                              s.status === "Tersedia" ? "#064e3b" : "#7f1d1d",
                            color:
                              s.status === "Tersedia" ? "#34d399" : "#f87171",
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          style={{
                            backgroundColor: "#1e293b",
                            color: "#38bdf8",
                          }}
                        >
                          {s.status === "Tersedia" ? (
                            <X size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteStudio(s.id, s.name)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: JADWAL */}
        {activeTab === "jadwal" && (
          <div className="page-transition">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>Jadwal Penayangan Aktif</h3>
              <button
                className="btn-add"
                onClick={() => setShowScheduleForm(true)}
              >
                <Plus size={18} /> Tambah Jadwal
              </button>
            </div>

            <div className="table-container">
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "50px",
                  }}
                >
                  <Loader2 className="spinner" size={40} />
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Judul Film</th>
                      <th>Studio</th>
                      <th>Tanggal</th>
                      <th>Jam Tayang</th>
                      <th>Harga (Rp)</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((sch) => (
                      <tr key={sch.id}>
                        {/* Menerjemahkan ID menjadi Nama untuk tabel */}
                        <td style={{ fontWeight: "bold" }}>
                          {getMovieTitle(sch.movieId)}
                        </td>
                        <td>{getStudioName(sch.studioId)}</td>
                        <td>{sch.showDate || sch.date}</td>
                        <td style={{ color: "#82ebd5", fontWeight: "bold" }}>
                          {sch.showTime || sch.time} WIB
                        </td>
                        <td>
                          {Number(sch.price || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="actions">
                          <button
                            className="btn-edit"
                            onClick={() => generateSeatsForSchedule(sch.id)}
                            disabled={generatingSeatsId === sch.id}
                            style={{
                              backgroundColor: "#1e293b",
                              color: "#fbbf24",
                            }}
                            title="Generate 120 kursi"
                          >
                            {generatingSeatsId === sch.id ? (
                              <Loader2 size={16} className="spinner" />
                            ) : (
                              <Armchair size={16} />
                            )}
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleOpenEditSchedule(sch)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteSchedule(sch.id)}
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
          </div>
        )}

        {/* MODAL STUDIO */}
        {showStudioForm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#0b0f19",
                padding: "30px",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "500px",
                border: "1px solid #1f2937",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
                Tambah Studio Baru
              </h2>
              <form onSubmit={handleStudioSubmit} className="admin-form">
                <label>Nama Studio</label>
                <input
                  type="text"
                  value={studioFormData.name}
                  onChange={(e) =>
                    setStudioFormData({
                      ...studioFormData,
                      name: e.target.value,
                    })
                  }
                  required
                  style={{ marginBottom: "20px" }}
                />
                <label>Status Ketersediaan</label>
                <select
                  value={studioFormData.status}
                  onChange={(e) =>
                    setStudioFormData({
                      ...studioFormData,
                      status: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#1f2937",
                    color: "white",
                    border: "1px solid #374151",
                    outline: "none",
                    marginBottom: "30px",
                  }}
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Tidak Tersedia">Tidak Tersedia</option>
                </select>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowStudioForm(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-save">
                    Simpan Studio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL JADWAL */}
        {showScheduleForm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#0b0f19",
                padding: "30px",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "500px",
                border: "1px solid #1f2937",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
                Tambah Jadwal Tayang
              </h2>
              <form onSubmit={handleScheduleSubmit} className="admin-form">
                <label>Pilih Judul Film</label>
                <select
                  value={scheduleFormData.movieId}
                  onChange={(e) =>
                    setScheduleFormData({
                      ...scheduleFormData,
                      movieId: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#1f2937",
                    color: "white",
                    border: "1px solid #374151",
                    outline: "none",
                    marginBottom: "15px",
                  }}
                >
                  <option value="" disabled>
                    -- Pilih Film --
                  </option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>

                <label>Pilih Studio</label>
                <select
                  value={scheduleFormData.studioId}
                  onChange={(e) =>
                    setScheduleFormData({
                      ...scheduleFormData,
                      studioId: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#1f2937",
                    color: "white",
                    border: "1px solid #374151",
                    outline: "none",
                    marginBottom: "15px",
                  }}
                >
                  <option value="" disabled>
                    -- Pilih Studio --
                  </option>
                  {studios
                    .filter((s) => s.status === "Tersedia")
                    .map((studio) => (
                      <option key={studio.id} value={studio.id}>
                        {studio.name}
                      </option>
                    ))}
                </select>

                <label>Harga Tiket (Rp)</label>
                <input
                  type="number"
                  value={scheduleFormData.price}
                  onChange={(e) =>
                    setScheduleFormData({
                      ...scheduleFormData,
                      price: (e.target.value),
                    })
                  }
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#1f2937",
                    color: "white",
                    border: "1px solid #374151",
                    outline: "none",
                    marginBottom: "15px",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{ display: "flex", gap: "15px", marginBottom: "30px" }}
                >
                  <div style={{ flex: 1 }}>
                    <label>Tanggal Tayang</label>
                    <input
                      type="date"
                      value={scheduleFormData.showDate}
                      onChange={(e) =>
                        setScheduleFormData({
                          ...scheduleFormData,
                          showDate: e.target.value,
                        })
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "#1f2937",
                        color: "white",
                        border: "1px solid #374151",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Jam Tayang</label>
                    {/* Input jam dikasih format step="1" (bila butuh detik), jika tidak default HH:MM cukup */}
                    <input
                      type="time"
                      value={scheduleFormData.showTime}
                      onChange={(e) =>
                        setScheduleFormData({
                          ...scheduleFormData,
                          showTime: e.target.value,
                        })
                      }
                      step="1"
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "#1f2937",
                        color: "white",
                        border: "1px solid #374151",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowScheduleForm(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-save">
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDIT JADWAL */}
        {showEditScheduleModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#0b0f19",
                padding: "30px",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "500px",
                border: "1px solid #1f2937",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
                Edit Jadwal Tayang
              </h2>
              <form onSubmit={handleEditScheduleSubmit} className="admin-form">
                <label>Pilih Judul Film</label>
                <select
                  value={editingSchedule.movieId}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      movieId: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#1f2937",
                    color: "white",
                    border: "1px solid #374151",
                    outline: "none",
                    marginBottom: "15px",
                  }}
                >
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>

                <label>Pilih Studio</label>
                <select
                  value={editingSchedule.studioId}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      studioId: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#1f2937",
                    color: "white",
                    border: "1px solid #374151",
                    outline: "none",
                    marginBottom: "15px",
                  }}
                >
                  {studios.map((studio) => (
                    <option
                      key={studio.id}
                      value={studio.id}
                      disabled={
                        studio.status !== "Tersedia" &&
                        studio.id !== Number(editingSchedule.studioId)
                      }
                    >
                      {studio.name}{" "}
                      {studio.status !== "Tersedia" ? "(Nonaktif)" : ""}
                    </option>
                  ))}
                </select>

                <label>Harga Tiket (Rp)</label>
                <input
                  type="number"
                  value={editingSchedule.price}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      price: (e.target.value),
                    })
                  }
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#1f2937",
                    color: "white",
                    border: "1px solid #374151",
                    outline: "none",
                    marginBottom: "15px",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{ display: "flex", gap: "15px", marginBottom: "30px" }}
                >
                  <div style={{ flex: 1 }}>
                    <label>Tanggal Tayang</label>
                    <input
                      type="date"
                      value={editingSchedule.showDate}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          showDate: e.target.value,
                        })
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "#1f2937",
                        color: "white",
                        border: "1px solid #374151",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Jam Tayang</label>
                    <input
                      type="time"
                      value={editingSchedule.showTime}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          showTime: e.target.value,
                        })
                      }
                      step="1"
                      required
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "#1f2937",
                        color: "white",
                        border: "1px solid #374151",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditScheduleModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    style={{ backgroundColor: "#38bdf8", color: "#0b0f19" }}
                  >
                    Update Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
