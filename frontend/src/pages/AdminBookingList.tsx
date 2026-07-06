import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Check, X } from "lucide-react";

interface AdminBooking {
  id: number;
  userName: string;
  movieTitle: string;
  studio: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminBookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchPending = () => {
    setLoading(true);
    setError("");
    fetch("http://localhost:3000/api/admin/bookings?status=pending", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success === false) {
          setError(data.message || "Gagal memuat data pesanan");
          return;
        }
        setBookings(data.bookings || data.data || []);
      })
      .catch((err) => {
        console.error("Gagal ambil data booking:", err);
        setError("Terjadi kesalahan saat memuat data pesanan");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleConfirm = async (id: number) => {
    setActingId(id);
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/bookings/${id}/confirm`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await res.json();
      if (data.success === false) {
        alert(data.message || "Gagal konfirmasi pesanan");
        return;
      }
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat konfirmasi");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Yakin mau tolak pesanan ini?")) return;
    setActingId(id);
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/bookings/${id}/reject`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await res.json();
      if (data.success === false) {
        alert(data.message || "Gagal menolak pesanan");
        return;
      }
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menolak pesanan");
    } finally {
      setActingId(null);
    }
  };

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
        <h2 style={{ margin: 0 }}>Konfirmasi Pembayaran</h2>
      </nav>

      <div style={{ padding: "20px 24px", maxWidth: 800, margin: "0 auto" }}>
        {loading && <p style={{ color: "#9ca3af" }}>Memuat data...</p>}

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
          <p style={{ color: "#9ca3af" }}>
            Tidak ada pesanan yang menunggu konfirmasi.
          </p>
        )}

        {!loading &&
          !error &&
          bookings.map((b) => (
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
                  marginBottom: 8,
                }}
              >
                <div>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>
                    Pemesan
                  </p>
                  <h3 style={{ margin: "2px 0 0 0", color: "#f3f4f6" }}>
                    {b.userName}
                  </h3>
                </div>
                <span
                  style={{
                    color: "#facc15",
                    backgroundColor: "#3f3a1f",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  Menunggu Konfirmasi
                </span>
              </div>

              <p style={{ margin: "0 0 8px 0", color: "#d1d5db", fontWeight: 600 }}>
                {b.movieTitle}
              </p>

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

              <p style={{ margin: "0 0 14px 0", fontSize: 16 }}>
                Total:{" "}
                <strong style={{ color: "#82ebd5" }}>
                  Rp {b.totalPrice?.toLocaleString("id-ID")}
                </strong>
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleConfirm(b.id)}
                  disabled={actingId === b.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#82ebd5",
                    color: "#0b0f19",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: "bold",
                    cursor: actingId === b.id ? "not-allowed" : "pointer",
                  }}
                >
                  <Check size={16} />
                  {actingId === b.id ? "Memproses..." : "Konfirmasi"}
                </button>
                <button
                  onClick={() => handleReject(b.id)}
                  disabled={actingId === b.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "transparent",
                    color: "#ef4444",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #ef4444",
                    fontWeight: "bold",
                    cursor: actingId === b.id ? "not-allowed" : "pointer",
                  }}
                >
                  <X size={16} />
                  Tolak
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
