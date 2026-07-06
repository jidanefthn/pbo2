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

const API_BASE = "http://localhost:3000/api";
const DEFAULT_TOTAL_SEATS = 120;

export default function AdminStudioPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"studio" | "jadwal">("studio");
  const [isLoading, setIsLoading] = useState(false);
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [generatingSeatsId, setGeneratingSeatsId] = useState<number | null>(
    null
  );

  // --- STATE UNTUK DATA MASTER ---
  const [movies, setMovies] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const getToken = () => localStorage.getItem("token");

  // --- FETCH DATA SAAT HALAMAN DIMUAT ---
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchMovies(), fetchStudios(), fetchSchedules()]);
  };

  const fetchMovies = async () => {
    try {
      const movieRes = await fetch(`${API_BASE}/movies`);
      const movieData = await movieRes.json();
      if (movieData.success) setMovies(movieData.movies);
    } catch (error) {
      console.error("Gagal mengambil data film:", error);
    }
  };

  // --- 🌟 STUDIO SEKARANG BENERAN DARI BACKEND ---
  const fetchStudios = async () => {
    setIsStudioLoading(true);
    try {
      const studioRes = await fetch(`${API_BASE}/studios`);
      const studioData = await studioRes.json();
      if (studioData.success) setStudios(studioData.studios);
    } catch (error) {
      console.error("Gagal mengambil data studio:", error);
    } finally {
      setIsStudioLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const scheduleRes = await fetch(`${API_BASE}/schedules`);
      const scheduleData = await scheduleRes.json();
      if (scheduleData.success || scheduleData.data) {
        setSchedules(scheduleData.schedules || scheduleData.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data jadwal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STATE MODAL STUDIO ---
  const [showStudioForm, setShowStudioForm] = useState(false);
  const [studioFormData, setStudioFormData] = useState({
    name: "",
    isActive: true,
  });

  const [showEditStudioModal, setShowEditStudioModal] = useState(false);
  const [editingStudio, setEditingStudio] = useState({
    id: 0,
    name: "",
    isActive: true,
  });

  // --- STATE MODAL JADWAL ---
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

  // --- 🌟 INTEGRASI API: TAMBAH STUDIO ---
  const handleStudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioFormData.name) {
      alert("Nama studio wajib diisi.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/studios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: studioFormData.name,
          totalSeats: DEFAULT_TOTAL_SEATS,
          isActive: studioFormData.isActive,
        }),
      });

      if (response.ok || response.status === 201) {
        alert("Studio berhasil ditambahkan!");
        setStudioFormData({ name: "", isActive: true });
        setShowStudioForm(false);
        fetchStudios();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Gagal menambah studio.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // --- 🌟 INTEGRASI API: EDIT / TOGGLE STATUS STUDIO ---
  const handleOpenEditStudio = (studio: any) => {
    setEditingStudio({
      id: studio.id,
      name: studio.name,
      isActive: studio.isActive,
    });
    setShowEditStudioModal(true);
  };

  const handleEditStudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentStudio = studios.find((s) => s.id === editingStudio.id);
    try {
      const response = await fetch(`${API_BASE}/studios/${editingStudio.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: editingStudio.name,
          totalSeats: currentStudio?.totalSeats ?? DEFAULT_TOTAL_SEATS,
          isActive: editingStudio.isActive,
        }),
      });

      if (response.ok) {
        alert("Studio berhasil diperbarui!");
        setShowEditStudioModal(false);
        fetchStudios();
      } else {
        alert("Gagal memperbarui studio.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // Toggle cepat aktif/nonaktif langsung dari tabel (tanpa buka modal)
  const handleToggleStatus = async (studio: any) => {
    try {
      const response = await fetch(`${API_BASE}/studios/${studio.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: studio.name,
          totalSeats: studio.totalSeats ?? DEFAULT_TOTAL_SEATS,
          isActive: !studio.isActive,
        }),
      });

      if (response.ok) {
        fetchStudios();
      } else {
        alert("Gagal mengubah status studio.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // --- 🌟 INTEGRASI API: HAPUS STUDIO ---
  const handleDeleteStudio = async (id: number, name: string) => {
    if (!window.confirm(`Hapus ${name}?`)) return;
    try {
      const response = await fetch(`${API_BASE}/studios/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        fetchStudios();
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || "Gagal menghapus studio.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // --- 🌟 INTEGRASI API: TAMBAH JADWAL ---
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/schedules`, {
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
        fetchSchedules(); // Refresh tabel
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
        `${API_BASE}/schedules/${editingSchedule.id}`,
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
        fetchSchedules();
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
        const response = await fetch(`${API_BASE}/schedules/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (response.ok) {
          fetchSchedules(); // Refresh otomatis setelah dihapus
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

  const generateSeatsForSchedule = async (scheduleId: number) => {
    // Cek dulu, jangan sampe generate dobel kalo udah ada kursinya
    try {
      const checkRes = await fetch(`${API_BASE}/seats/${scheduleId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
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
          fetch(`${API_BASE}/seats`, {
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
          <button onClick={() => navigate("/admin/report")}>
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
              {isStudioLoading ? (
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
                              backgroundColor: s.isActive
                                ? "#064e3b"
                                : "#7f1d1d",
                              color: s.isActive ? "#34d399" : "#f87171",
                            }}
                          >
                            {s.isActive ? "Tersedia" : "Tidak Tersedia"}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleToggleStatus(s)}
                            title={s.isActive ? "Nonaktifkan" : "Aktifkan"}
                            style={{
                              backgroundColor: "#1e293b",
                              color: "#38bdf8",
                            }}
                          >
                            {s.isActive ? <X size={16} /> : <Check size={16} />}
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleOpenEditStudio(s)}
                            title="Edit studio"
                          >
                            <Edit2 size={16} />
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
              )}
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

        {/* MODAL TAMBAH STUDIO */}
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
                <label>Status Ketersediaan</label>
                <select
                  value={studioFormData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setStudioFormData({
                      ...studioFormData,
                      isActive: e.target.value === "true",
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
                  <option value="true">Tersedia</option>
                  <option value="false">Tidak Tersedia</option>
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

        {/* MODAL EDIT STUDIO */}
        {showEditStudioModal && (
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
                Edit Studio
              </h2>
              <form onSubmit={handleEditStudioSubmit} className="admin-form">
                <label>Nama Studio</label>
                <input
                  type="text"
                  value={editingStudio.name}
                  onChange={(e) =>
                    setEditingStudio({
                      ...editingStudio,
                      name: e.target.value,
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
                    boxSizing: "border-box",
                  }}
                />
                <label>Status Ketersediaan</label>
                <select
                  value={editingStudio.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setEditingStudio({
                      ...editingStudio,
                      isActive: e.target.value === "true",
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
                  <option value="true">Tersedia</option>
                  <option value="false">Tidak Tersedia</option>
                </select>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditStudioModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    style={{ backgroundColor: "#38bdf8", color: "#0b0f19" }}
                  >
                    Update Studio
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
                    .filter((s) => s.isActive)
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
                      price: e.target.value,
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
                        !studio.isActive &&
                        studio.id !== Number(editingSchedule.studioId)
                      }
                    >
                      {studio.name} {!studio.isActive ? "(Nonaktif)" : ""}
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
                      price: e.target.value,
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
