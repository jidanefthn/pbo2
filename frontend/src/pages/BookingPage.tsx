import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Minus, Plus } from "lucide-react";
import logoImage from "../assets/logo.png";

interface Seat {
  id: number;
  seatNumber: string;
  status: "available" | "booked";
}

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedDate, selectedStudio, selectedTime, scheduleId, movie } =
    location.state || {};

  const [seatList, setSeatList] = useState<Seat[]>([]);
  const [jumlahKursi, setJumlahKursi] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    if (!scheduleId || !selectedTime || !selectedStudio) {
      alert("Silakan pilih jadwal tayang terlebih dahulu!");
      navigate("/");
      return;
    }

    fetch(`http://localhost:3000/api/seats/${scheduleId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const seats = data.seats || data.data || [];
        setSeatList(seats);
      })
      .catch((err) => console.error("Gagal ambil data kursi:", err))
      .finally(() => setLoading(false));
  }, [scheduleId, selectedTime, selectedStudio, navigate]);

  const availableSeats = seatList.filter((s) => s.status === "available");
  const maxKursi = availableSeats.length;

  const handleJumlahChange = (delta: number) => {
    setJumlahKursi((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (maxKursi > 0 && next > maxKursi) return maxKursi;
      return next;
    });
  };

  const handleShowQR = () => {
    if (jumlahKursi < 1 || maxKursi === 0 || jumlahKursi > maxKursi) return;
    setShowQRModal(true);
  };

  // Dipanggil pas klik "Saya Sudah Bayar" di dalam modal QRIS.
  // Booking dibuat dengan status "pending" di backend (menunggu
  // konfirmasi admin), bukan langsung dianggap sukses/confirmed.
  const processBooking = async () => {
    const autoSelectedSeatIds = availableSeats
      .slice(0, jumlahKursi)
      .map((s) => s.id);
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        // Backend disarankan langsung men-set status booking ini
        // menjadi "pending" saat record dibuat.
        body: JSON.stringify({ scheduleId, seatIds: autoSelectedSeatIds }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Booking gagal");
        setSubmitting(false);
        return;
      }
      setShowQRModal(false);
      navigate("/riwayat", {
        state: {
          booking: data.booking,
          movieTitle: movie?.title,
          selectedDate,
          selectedStudio,
          selectedTime,
          // status booking baru dibuat: menunggu konfirmasi admin.
          // Gunakan status dari response backend kalau tersedia,
          // fallback ke "pending" kalau backend belum mengirimnya.
          status: data.booking?.status || "pending",
        },
      });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const totalPrice = jumlahKursi * (movie?.price || 0);

  if (loading) {
    return <div style={{ color: "#fff", padding: 40 }}>Memuat data...</div>;
  }

  return (
    <div className="booking-layout page-transition">
      <nav className="booking-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Konfirmasi Tiket & Bayar</h2>
        <img src={logoImage} alt="Logo" className="nav-logo-booking" />
      </nav>

      <div
        style={{
          backgroundColor: "#111827",
          padding: "15px 40px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 8px 0", color: "#f3f4f6" }}>
            {movie?.title || "Memuat..."}
          </h3>
          <div
            style={{
              display: "flex",
              gap: "15px",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={16} color="#82ebd5" />{" "}
              {selectedDate?.split("-").reverse().join("/")}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Clock size={16} color="#82ebd5" /> {selectedTime} WIB
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <MapPin size={16} color="#82ebd5" /> {selectedStudio}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          gap: "20px",
        }}
      >
        <p style={{ color: "#9ca3af", margin: 0 }}>
          {maxKursi > 0
            ? `Kursi tersedia: ${maxKursi}`
            : "Kursi untuk jadwal ini belum tersedia"}
        </p>

        <p style={{ color: "#f3f4f6", fontSize: "18px", margin: 0 }}>
          Jumlah Kursi
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button
            onClick={() => handleJumlahChange(-1)}
            disabled={jumlahKursi <= 1}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid #374151",
              backgroundColor: "#1f2937",
              color: "#fff",
              cursor: jumlahKursi <= 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Minus size={18} />
          </button>

          <span
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#82ebd5",
              minWidth: 40,
              textAlign: "center",
            }}
          >
            {jumlahKursi}
          </span>

          <button
            onClick={() => handleJumlahChange(1)}
            disabled={maxKursi > 0 && jumlahKursi >= maxKursi}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1px solid #374151",
              backgroundColor: "#1f2937",
              color: "#fff",
              cursor:
                maxKursi > 0 && jumlahKursi >= maxKursi
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="booking-footer">
        <div className="summary">
          <p style={{ margin: "0 0 5px 0", color: "#9ca3af" }}>
            Jumlah Tiket:{" "}
            <strong style={{ color: "#fff" }}>{jumlahKursi}</strong>
          </p>
          <p style={{ margin: 0, fontSize: "18px" }}>
            Total Harga:{" "}
            <strong style={{ color: "#82ebd5" }}>
              Rp {totalPrice.toLocaleString("id-ID")}
            </strong>
          </p>
        </div>
        <button
          className="btn-pay"
          disabled={maxKursi === 0 || submitting}
          onClick={handleShowQR}
          style={{
            backgroundColor: maxKursi === 0 ? "#374151" : "#82ebd5",
            color: maxKursi === 0 ? "#9ca3af" : "#0b0f19",
            padding: "12px 30px",
            borderRadius: "8px",
            fontWeight: "bold",
            border: "none",
            cursor: maxKursi === 0 ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>

      {showQRModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#1f2937",
              padding: "30px",
              borderRadius: "16px",
              textAlign: "center",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ color: "#fff", margin: "0 0 20px 0" }}>
              Scan untuk Membayar
            </h3>
            <div
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "12px",
                display: "inline-block",
                marginBottom: "20px",
              }}
            >
              <img
                src={"/qris1.jpg"}
                alt="QR Payment"
                style={{ width: "310px", height: "310px" }}
              />
            </div>
            <h2 style={{ color: "#82ebd5", margin: "0 0 20px 0" }}>
              Rp {totalPrice.toLocaleString("id-ID")}
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px 0" }}>
              Setelah membayar, pesanan akan berstatus{" "}
              <strong style={{ color: "#facc15" }}>menunggu konfirmasi</strong>{" "}
              dari admin.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                onClick={processBooking}
                disabled={submitting}
                style={{
                  backgroundColor: "#82ebd5",
                  color: "#0b0f19",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {submitting ? "Memproses..." : "Saya Sudah Bayar"}
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                disabled={submitting}
                style={{
                  backgroundColor: "transparent",
                  color: "#ef4444",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  border: "1px solid #ef4444",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
