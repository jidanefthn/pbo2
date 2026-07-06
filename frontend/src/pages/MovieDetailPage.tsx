import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import logoImage from "../assets/logo.png";

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  description: string;
  posterUrl: string;
  price: number;
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE UNTUK JADWAL TAYANG DARI BACKEND ---
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const [availableDates, setAvailableDates] = useState<
    { date: string; label: string }[]
  >([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchMovieAndSchedules = async () => {
      try {
        // 1. Ambil Data Detail Film
        const movieRes = await fetch(`http://localhost:3000/api/movies/${id}`);
        const movieData = await movieRes.json();
        let currentMovie = null;

        if (movieData.success && movieData.movie) {
          currentMovie = movieData.movie;
          setMovie(currentMovie);
        }

        // 2. Ambil Data Jadwal Semuanya dari Backend
        const scheduleRes = await fetch("http://localhost:3000/api/schedules");
        const scheduleData = await scheduleRes.json();

        // Mengantisipasi jika format response pembungkusnya .schedules atau .data
        const allSchedules = scheduleData.schedules || scheduleData.data || [];

        if (Array.isArray(allSchedules)) {
          // 🌟 PERBAIKAN 1: Filter jadwal mencocokkan ID angka (movieId) sesuai backend, bukan teks judul
          const movieSchedules = allSchedules.filter(
            (s: any) => Number(s.movieId) === Number(id)
          );
          setSchedules(movieSchedules);

          // 🌟 PERBAIKAN 2: Menggunakan field 'showDate' sesuai spesifikasi Swagger backend
          const uniqueDates = Array.from(
            new Set(movieSchedules.map((s: any) => s.showDate || s.date))
          )
            .filter(Boolean)
            .sort() as string[];

          const formattedDates = uniqueDates.map((dateStr) => {
            const targetDate = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkTarget = new Date(dateStr);
            checkTarget.setHours(0, 0, 0, 0);

            const diffTime = checkTarget.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

            let label = "";
            if (diffDays === 0) label = "Hari Ini";
            else if (diffDays === 1) label = "Besok";
            else if (diffDays === 2) label = "Lusa";
            else {
              label = targetDate.toLocaleDateString("id-ID", {
                weekday: "long",
              });
            }

            return { date: dateStr, label: label };
          });

          setAvailableDates(formattedDates);

          if (formattedDates.length > 0) {
            setSelectedDate(formattedDates[0].date);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data dari API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieAndSchedules();
  }, [id]);

  // Memfilter jadwal aktif berdasarkan tanggal yang dipilih oleh user
  const filteredSchedules = schedules.filter(
    (sch) => (sch.showDate || sch.date) === selectedDate
  );

  // Mengelompokkan jam tayang berdasarkan nama/ID studio secara reaktif
  const schedulesByStudio = filteredSchedules.reduce((acc, curr) => {
    // Karena backend mengirim studioId, kita buat label teksnya secara aman
    const studioLabel = curr.studioName || `Studio ${curr.studioId}`;

    if (!acc[studioLabel]) acc[studioLabel] = [];

    // Simpan data jam (showTime) beserta ID jadwalnya agar tidak tertukar saat klik order
    acc[studioLabel].push({
      id: curr.id,
      time: curr.showTime || curr.time,
    });
    return acc;
  }, {} as Record<string, { id: number; time: string }[]>);

  const handleTimeSelect = (studio: string, time: string, schId: number) => {
    setSelectedStudio(studio);
    setSelectedTime(time);
    setSelectedScheduleId(schId);
  };

  const handleOrder = () => {
    if (!selectedTime || !selectedStudio || !selectedScheduleId) {
      alert("Silakan pilih jadwal tayang terlebih dahulu!");
      return;
    }
    const currentSchedule = schedules.find(
      (s) => Number(s.id) === Number(selectedScheduleId)
    );
    navigate("/booking", {
      state: {
        scheduleId: selectedScheduleId,
        selectedDate,
        selectedStudio,
        selectedTime,
        movie: {
          ...movie,
          price: currentSchedule?.price || movie?.price || 0,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div
        className="loading-text"
        style={{ padding: "50px", textAlign: "center", color: "#82ebd5" }}
      >
        Memuat detail film dan jadwal...
      </div>
    );
  }

  return (
    <div className="movie-layout-modern">
      <nav className="navbar-detail">
        <img
          src={logoImage}
          alt="Logo"
          className="nav-logo-short"
          onClick={() => navigate("/")}
        />
      </nav>

      {movie && (
        <>
          <div
            className="hero-backdrop"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
          >
            <div className="backdrop-overlay"></div>
          </div>

          <div className="modern-content-container">
            <div className="movie-header-row">
              <div className="poster-small-wrapper">
                <img
                  src={
                    movie.posterUrl ||
                    "https://placehold.co/400x600/111827/ffffff?text=NO+POSTER"
                  }
                  alt={movie.title}
                  className="poster-small"
                />
              </div>

              <div className="movie-info-right">
                <h1 className="modern-movie-title">{movie.title}</h1>
                <div className="modern-movie-meta">
                  <span className="meta-genre-badge">{movie.genre}</span>
                  <div className="meta-duration">
                    <Clock size={16} className="icon-cyan" />
                    <span>{movie.duration} Menit</span>
                  </div>
                </div>

                <div
                  className="modern-synopsis-section"
                  style={{ marginBottom: "20px" }}
                >
                  <h3>Sinopsis</h3>
                  <p className="modern-synopsis-text">{movie.description}</p>
                </div>
              </div>
            </div>

            {/* --- KOTAK PEMILIHAN JADWAL --- */}
            <div
              style={{
                backgroundColor: "rgba(11, 15, 25, 0.6)",
                padding: "30px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.05)",
                marginTop: "20px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "20px",
                  color: "#f3f4f6",
                  margin: "0 0 25px 0",
                }}
              >
                <CalendarIcon size={20} className="icon-cyan" /> Pilih Jadwal
                Tayang
              </h3>

              {/* Slider Pilihan Tanggal */}
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "30px",
                  overflowX: "auto",
                  paddingBottom: "10px",
                }}
              >
                {availableDates.length > 0 ? (
                  availableDates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => {
                        setSelectedDate(d.date);
                        setSelectedTime(null);
                        setSelectedStudio(null);
                        setSelectedScheduleId(null);
                      }}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "10px",
                        border:
                          selectedDate === d.date
                            ? "1px solid #82ebd5"
                            : "1px solid #374151",
                        backgroundColor:
                          selectedDate === d.date
                            ? "rgba(130, 235, 213, 0.1)"
                            : "transparent",
                        color: selectedDate === d.date ? "#82ebd5" : "#d1d5db",
                        cursor: "pointer",
                        minWidth: "110px",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          marginBottom: "4px",
                          textTransform: "capitalize",
                        }}
                      >
                        {d.label}
                      </div>
                      <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                        {d.date.split("-").reverse().join("/")}
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ color: "#9ca3af", padding: "10px 0" }}>
                    Tidak ada tanggal tayang aktif dari admin untuk film ini.
                  </div>
                )}
              </div>

              {/* Render Jam Tayang per Studio */}
              {Object.keys(schedulesByStudio).length > 0
                ? Object.keys(schedulesByStudio).map((studio) => (
                    <div key={studio} style={{ marginBottom: "25px" }}>
                      <h4
                        style={{
                          color: "#9ca3af",
                          fontSize: "15px",
                          marginBottom: "12px",
                          fontWeight: "normal",
                        }}
                      >
                        {studio}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        {schedulesByStudio[studio].map((item) => {
                          // Memotong format detik bawaan MySQL jika ada (contoh 19:00:00 -> 19:00)
                          const cleanTime = item.time.substring(0, 5);
                          const isSelected =
                            selectedStudio === studio &&
                            selectedTime === cleanTime;

                          return (
                            <button
                              key={item.id}
                              onClick={() =>
                                handleTimeSelect(studio, cleanTime, item.id)
                              }
                              style={{
                                padding: "10px 24px",
                                borderRadius: "8px",
                                border: isSelected
                                  ? "none"
                                  : "1px solid #374151",
                                backgroundColor: isSelected
                                  ? "#82ebd5"
                                  : "#1f2937",
                                color: isSelected ? "#0b0f19" : "white",
                                fontWeight: "bold",
                                fontSize: "15px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              {cleanTime}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                : availableDates.length > 0 && (
                    <div
                      style={{
                        color: "#ef4444",
                        padding: "15px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    >
                      Belum ada jam tayang untuk tanggal yang Anda pilih.
                    </div>
                  )}
            </div>

            {/* --- ACTION MENU --- */}
            <div className="modern-action-menu">
              <button
                className="btn-action-cancel"
                onClick={() => navigate("/")}
              >
                Batalkan
              </button>

              <button
                className="btn-action-order"
                onClick={handleOrder}
                disabled={!selectedTime}
                style={{
                  opacity: selectedTime ? 1 : 0.5,
                  cursor: selectedTime ? "pointer" : "not-allowed",
                }}
              >
                Buat Pesanan {selectedTime ? `(${selectedTime})` : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
