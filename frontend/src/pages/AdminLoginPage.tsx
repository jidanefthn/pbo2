import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Tambahkan logika autentikasi backend Anda di sini
    // Contoh: const res = await fetch("...", { method: "POST", body: ... });
    
    // Jika berhasil:
    localStorage.setItem("role", "admin");
    navigate("/admin/movies");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0b0f19" }}>
      <form onSubmit={handleLogin} style={{ background: "#111827", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "400px", border: "1px solid #1f2937" }}>
        <h2 style={{ color: "#fff", marginBottom: "20px", textAlign: "center" }}>Admin Login</h2>
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ color: "#9ca3af" }}>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "10px", marginTop: "5px", background: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={{ color: "#9ca3af" }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px", marginTop: "5px", background: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
          />
        </div>

        <button 
          type="submit" 
          style={{ width: "100%", padding: "12px", background: "#82ebd5", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          Masuk sebagai Admin
        </button>
      </form>
    </div>
  );
}