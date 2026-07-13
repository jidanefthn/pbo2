import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Film, LayoutGrid, DollarSign, Ticket, Loader2, LogOutIcon } from "lucide-react";
import logoImage from "../assets/logo.png"; // Pastikan path logo benar

export default function SalesReportPage() {
  const navigate = useNavigate();
  
  // --- STATE DATA ---
  const [bookings, setBookings] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        if (!token) {
          alert("Token tidak ditemukan, silakan login ulang!");
          setIsLoading(false);
          return;
        }

        // 🌟 KITA PISAH FETCH BOOKINGS UNTUK CEK ERROR-NYA
        const bResRaw = await fetch("http://localhost:3000/api/bookings/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bRes = await bResRaw.json();
        
        // Cekikikan data di console browser! (Tekan F12)
        console.log("HASIL FETCH BOOKINGS ALL:", bRes); 

        if (!bResRaw.ok || bRes.success === false) {
          alert(`Gagal mengambil data transaksi: ${bRes.message || 'Error Server'}`);
        }

        const [moviesRes, studiosRes, schedulesRes] = await Promise.all([
          fetch("http://localhost:3000/api/movies").then((res) => res.json()),
          fetch("http://localhost:3000/api/studios").then((res) => res.json()),
          fetch("http://localhost:3000/api/schedules").then((res) => res.json()),
        ]);

        setMovies(moviesRes.movies || moviesRes.data || []);
        setStudios(studiosRes.studios || studiosRes.data || []);
        setSchedules(schedulesRes.schedules || schedulesRes.data || []);
        setBookings(bRes.bookings || bRes.data || []); 
        
      } catch (err) {
        console.error("Gagal memuat data laporan:", err);
        alert("Terjadi kesalahan jaringan, cek console browser (F12)");
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, []);

  // --- LOGIKA MENJAHIT DATA JADWAL, FILM, DAN STUDIO ---
  const getTransactionDetails = (scheduleId: number, totalPrice: number) => {
    const sch = schedules.find((s) => s.id === scheduleId);
    if (!sch) {
      return { movieTitle: "Jadwal Dihapus", studioName: "-", ticketsCount: 0 };
    }

    const movie = movies.find((m) => m.id === sch.movieId);
    const studio = studios.find((st) => st.id === sch.studioId);
    
    // Trick hitung jumlah tiket: Total Harga dibagi Harga per tiket jadwal
    const ticketsCount = sch.price > 0 ? Math.round(totalPrice / sch.price) : 0;

    return {
      movieTitle: movie ? movie.title : `ID Film: ${sch.movieId}`,
      studioName: studio ? studio.name : `ID Studio: ${sch.studioId}`,
      ticketsCount: ticketsCount,
    };
  };

  // --- HITUNG RINGKASAN TOTAL ---
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalTicketsSold = bookings.reduce((sum, b) => {
    const sch = schedules.find((s) => s.id === b.scheduleId);
    const count = sch && sch.price > 0 ? Math.round(b.totalPrice / sch.price) : 0;
    return sum + count;
  }, 0);

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR ADMIN */}
      <aside className="admin-sidebar" style={{ width: "250px", background: "#111827", padding: "20px" }}>
        <div className="sidebar-logo">
          <img src={logoImage} alt="TIXCO Logo" onClick={() => navigate("/")} style={{ width: "65%", cursor: "pointer" }} />
        </div>
        <nav className="sidebar-menu" style={{ marginTop: "0px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => navigate("/admin/movies")} style={{ background: "none", border: "none", color: "#9ca3af", display: "flex", alignItems: "center", gap: "10px", padding: "12px", cursor: "pointer", width: "100%", textAlign: "left" }}>
            <Film size={20} /> Kelola Film
          </button>
          <button onClick={() => navigate("/admin/studios")} style={{ background: "none", border: "none", color: "#9ca3af", display: "flex", alignItems: "center", gap: "10px", padding: "12px", cursor: "pointer", width: "100%", textAlign: "left" }}>
            <LayoutGrid size={20} /> Kelola Studio & Jadwal
          </button>
          <button className="active" onClick={() => navigate("/admin/report")} style={{ background: "none", border: "none", color: "#82ebd5", display: "flex", alignItems: "center", gap: "10px", padding: "12px", fontWeight: "bold", width: "100%", textAlign: "left", borderLeft: "4px solid #82ebd5" }}>
            <BarChart3 size={20} /> Laporan Penjualan
          </button>
          <button onClick={() => navigate('/login')}>
            <LogOutIcon size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-content" style={{ flex: 1, backgroundColor: "#0b0f19", color: "#fff", padding: "40px" }}>
        <header className="admin-header" style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>Laporan Penjualan Tiket Global</h1>
          <p style={{ color: "#9ca3af", marginTop: "5px" }}>Memantau seluruh riwayat transaksi penjualan tiket bioskop</p>
        </header>

        {/* KARTU STATISTIK RINGKASAN */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937", flex: 1, display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "rgba(130, 235, 213, 0.1)", padding: "12px", borderRadius: "10px" }}>
              <DollarSign size={24} color="#82ebd5" />
            </div>
            <div>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: "14px" }}>Total Pendapatan</p>
              <h2 style={{ fontSize: "24px", margin: "5px 0 0 0", color: "#82ebd5", fontWeight: "bold" }}>
                Rp {totalRevenue.toLocaleString("id-ID")}
              </h2>
            </div>
          </div>

          <div style={{ background: "#111827", padding: "20px", borderRadius: "12px", border: "1px solid #1f2937", flex: 1, display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "rgba(251, 191, 36, 0.1)", padding: "12px", borderRadius: "10px" }}>
              <Ticket size={24} color="#fbbf24" />
            </div>
            <div>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: "14px" }}>Total Tiket Terjual</p>
              <h2 style={{ fontSize: "24px", margin: "5px 0 0 0", color: "#fbbf24", fontWeight: "bold" }}>
                {totalTicketsSold} Tiket
              </h2>
            </div>
          </div>
        </div>

        {/* TABEL TRANSAKSI LENGKAP */}
        <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px", gap: "10px", color: "#82ebd5" }}>
              <Loader2 className="spinner" size={24} /> Memuat seluruh data transaksi...
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #374151", background: "#1f2937", color: "#9ca3af", fontSize: "14px" }}>
                  <th style={{ padding: "15px", textAlign: "left" }}>ID TRANSAKSI</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>JUDUL FILM</th>
                  <th style={{ padding: "15px", textAlign: "left" }}>STUDIO</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>JUMLAH TIKET</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>STATUS</th>
                  <th style={{ padding: "15px", textAlign: "right" }}>TOTAL BAYAR</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((b) => {
                    const details = getTransactionDetails(b.scheduleId, b.totalPrice);
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #1f2937", fontSize: "15px" }}>
                        <td style={{ padding: "15px", color: "#9ca3af" }}>#{b.id.toString().padStart(5, "0")}</td>
                        <td style={{ padding: "15px", fontWeight: "bold", color: "#f3f4f6" }}>{details.movieTitle}</td>
                        <td style={{ padding: "15px", color: "#d1d5db" }}>{details.studioName}</td>
                        <td style={{ padding: "15px", textAlign: "center", fontWeight: "500" }}>{details.ticketsCount} Tiket</td>
                        <td style={{ padding: "15px", textAlign: "center" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", background: b.status === "confirmed" ? "#123832" : "#3f3a1f", color: b.status === "confirmed" ? "#82ebd5" : "#facc15" }}>
                            {b.status?.toUpperCase() || 'CONFIRMED'}
                          </span>
                        </td>
                        <td style={{ padding: "15px", textAlign: "right", color: "#82ebd5", fontWeight: "bold" }}>
                          Rp {b.totalPrice?.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>
                      Belum ada riwayat data penjualan tiket yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}