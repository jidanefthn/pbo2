import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";

interface BookingHistory {
  id: number;
  movieTitle: string;
  studio: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: "pending" | "confirmed" | "rejected" | string;
  createdAt: string;
}

const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
  pending: { text: "Menunggu Konfirmasi", color: "#facc15", bg: "#3f3a1f" },
  confirmed: { text: "Terkonfirmasi", color: "#82ebd5", bg: "#123832" },
  rejected: { text: "Ditolak", color: "#ef4444", bg: "#3a1f1f" },
};

export default function RiwayatPesanan() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchHistory = () => {
    setLoading(true);
    setError("");
    fetch("http://localhost:3000/api/bookings/history", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success === false) {
          setError(data.message || "Gagal memuat riwayat pesanan");
          return;
        }
        setBookings(data.bookings || data.data || []);
      })
      .catch((err) => {
        console.error("Gagal ambil riwayat:", err);
        setError("Terjadi kesalahan saat memuat riwayat pesanan");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0f19", color: "#fff" }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
          padding: "16px 24px",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0 }}>Riwayat Pesanan</h2>
      </nav>

      <div style={{ padding: "20px 24px", maxWidth: 720, margin: "0 auto" }}>
        {loading && <p style={{ color: "#9ca3af" }}>Memuat riwayat...</p>}

        {!loading && error && (
          <div
            style={{
              background: "#3a1f1f",
              color: "#ef4444",
              padding: 15,
              borderRadius: 10,
              marginBottom: 15,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p style={{ color: "#9ca3af" }}>Belum ada pesanan.</p>
        )}

        {!loading &&
          !error &&
          bookings.map((b) => {
            const s = statusLabel[b.status] || {
              text: b.status,
              color: "#9ca3af",
              bg: "#1f2937",
            };
            return (
              <div
                key={b.id}
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  padding: 18,
                  borderRadius: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <h3 style={{ margin: 0, color: "#f3f4f6" }}>{b.movieTitle}</h3>
                  <span
                    style={{
                      color: s.color,
                      backgroundColor: s.bg,
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.text}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 15,
                    color: "#9ca3af",
                    fontSize: 14,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={14} color="#82ebd5" /> {b.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={14} color="#82ebd5" /> {b.time} WIB
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={14} color="#82ebd5" /> {b.studio}
                  </span>
                </div>

                <p style={{ margin: "0 0 6px 0", color: "#d1d5db", fontSize: 14 }}>
                  Kursi: {b.seats?.join(", ")}
                </p>

                <p style={{ margin: 0, fontSize: 16 }}>
                  Total:{" "}
                  <strong style={{ color: "#82ebd5" }}>
                    Rp {b.totalPrice?.toLocaleString("id-ID")}
                  </strong>
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
