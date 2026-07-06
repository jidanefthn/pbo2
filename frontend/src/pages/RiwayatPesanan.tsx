import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket } from "lucide-react";

export default function RiwayatPesanan() {
  const navigate = useNavigate();
  
  // --- STATE UNTUK DATA MASTER & RIWAYAT ---
  const [bookings, setBookings] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError("");
      try {
        // 🌟 TRIK FRONTEND: Tarik semua data secara paralel agar cepat
        const [moviesRes, studiosRes, schedulesRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:3000/api/movies').catch(() => null),
          fetch('http://localhost:3000/api/studios').catch(() => null),
          fetch('http://localhost:3000/api/schedules').catch(() => null),
          fetch('http://localhost:3000/api/bookings/history', {
            headers: { Authorization: `Bearer ${getToken()}` },
          }).catch(() => null)
        ]);

        // Parsing JSON
        const moviesData = moviesRes ? await moviesRes.json() : {};
        const studiosData = studiosRes ? await studiosRes.json() : {};
        const schedulesData = schedulesRes ? await schedulesRes.json() : {};
        const bookingsData = bookingsRes ? await bookingsRes.json() : {};

        // Simpan ke State
        if (moviesData.success || moviesData.movies) setMovies(moviesData.movies || moviesData.data || []);
        if (studiosData.success || studiosData.studios) setStudios(studiosData.studios || studiosData.data || []);
        if (schedulesData.success || schedulesData.schedules) setSchedules(schedulesData.schedules || schedulesData.data || []);

        if (bookingsData.success === false) {
          setError(bookingsData.message || "Gagal memuat riwayat pesanan");
        } else {
          setBookings(bookingsData.bookings || bookingsData.data || []);
        }

      } catch (err) {
        console.error("Gagal tarik data:", err);
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 🌟 FUNGSI PENCARI NAMA (Menerjemahkan ID menjadi Teks Asli)
  const getBookingDetails = (scheduleId: number) => {
    const sch = schedules.find(s => s.id === scheduleId);
    if (!sch) return { title: "Jadwal Tidak Ditemukan", studio: "N/A", date: "N/A", time: "N/A" };

    const movie = movies.find(m => m.id === sch.movieId);
    const studio = studios.find(st => st.id === sch.studioId);

    return {
      title: movie ? movie.title : `ID Film: ${sch.movieId}`, // Berhasil jadi Nama Film!
      studio: studio ? studio.name : `ID Studio: ${sch.studioId}`, // Berhasil jadi Nama Studio!
      date: sch.showDate || sch.date || "N/A",
      time: (sch.showTime || sch.time || "N/A").substring(0, 5) // Potong format detik
    };
  };

  const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
    pending: { text: "Menunggu", color: "#facc15", bg: "#3f3a1f" },
    confirmed: { text: "Berhasil", color: "#82ebd5", bg: "#123832" },
    rejected: { text: "Dibatalkan", color: "#ef4444", bg: "#3a1f1f" },
  };

  return (
    
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0f19", color: "#fff", paddingBottom: "50px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 15, padding: "20px 24px", borderBottom: "1px solid #1f2937", backgroundColor: "#111827" }}>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Ticket color="#82ebd5" size={24} /> Riwayat Tiket
        </h2>
      </nav>

      <div style={{ padding: "30px 24px", maxWidth: 700, margin: "0 auto" }}>
        {loading && <div style={{ color: "#82ebd5", textAlign: "center", padding: "40px" }}>Menarik data dari server...</div>}
        {!loading && error && <div style={{ color: "#ef4444", padding: 15, border: "1px solid #ef4444", borderRadius: 8 }}>{error}</div>}
        {!loading && !error && bookings.length === 0 && <p style={{ textAlign: "center", color: "#9ca3af" }}>Belum ada pesanan tiket.</p>}

        {!loading && !error && bookings.map((b) => {
          // Panggil fungsi pencari nama
          const details = getBookingDetails(b.scheduleId);
          const s = statusLabel[b.status?.toLowerCase()] || statusLabel.confirmed;

          return (
            <div key={b.id} style={{ background: "#111827", border: "1px solid #1f2937", padding: 20, borderRadius: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, borderBottom: "1px dashed #374151", paddingBottom: 15 }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{details.title}</h3>
                <span style={{ color: s.color, backgroundColor: s.bg, padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold" }}>{s.text}</span>
              </div>
              
              <div style={{ display: "flex", gap: 15, color: "#d1d5db", fontSize: 14, marginBottom: 15, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={14} color="#82ebd5" /> {details.date}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={14} color="#82ebd5" /> {details.time} WIB</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={14} color="#82ebd5" /> {details.studio}</span>
              </div>

              <div style={{ background: "rgba(130,235,213,0.05)", padding: 15, borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: 12, textTransform: "uppercase" }}>ID Tiket</p>
                  <p style={{ margin: 0, fontSize: 14, color: "#f3f4f6", fontWeight: "bold" }}>#{b.id.toString().padStart(5, '0')}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: 12, textTransform: "uppercase" }}>Total Pembayaran</p>
                  <p style={{ margin: 0, fontSize: 18, color: "#82ebd5", fontWeight: "bold" }}>Rp {b.totalPrice?.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}