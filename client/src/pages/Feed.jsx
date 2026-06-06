import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Feed() {
  const [media, setMedia] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    fetchMedia();
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    const res = await api.get("/wallet");
    setUser((prev) => ({ ...prev, coins: res.data.balance }));
  };

  const fetchMedia = async () => {
    const res = await api.get("/media");
    setMedia(res.data.media);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>Media Feed</h2>
        <div style={styles.headerRight}>
          {user && (
            <span style={styles.coinsBadge}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
              </svg>
              {user.coins} coins
            </span>
          )}
          <button onClick={() => navigate("/upload")} style={styles.button}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload
          </button>
          <button onClick={logout} style={styles.outlineButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {media.map((item) => (
          <div
            key={item.id}
            style={styles.card}
            className="feed-card"
            onClick={() => navigate(`/media/${item.id}`)}
          >
            <div style={styles.imageBox}>
              <img
                src={
                  item.is_owner || item.is_unlocked
                    ? item.original_url
                    : item.blurred_url
                }
                alt={item.title}
                style={styles.image}
              />
              {!item.is_owner && !item.is_unlocked && (
                <div style={styles.lockOverlay}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              )}
            </div>
            <div style={styles.info}>
              <p style={styles.title}>{item.title}</p>
              <p style={styles.price}>{item.unlock_price} coins</p>
              <div>
                <p style={
                  item.is_owner
                    ? styles.statusOwner
                    : item.is_unlocked
                      ? styles.statusUnlocked
                      : styles.statusLocked
                }>
                  {item.is_owner
                    ? "Your upload"
                    : item.is_unlocked
                      ? "Unlocked"
                      : "Locked"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1000px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2.5rem",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  coinsBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    background: "#ffe4e6",
    color: "#e11d48",
    border: "1px solid #fecdd3",
    borderRadius: "9999px",
    fontSize: "14px",
    fontWeight: "600",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 1.25rem",
    background: "#e11d48",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "14px",
  },
  outlineButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 1.25rem",
    background: "#fff",
    border: "1px solid #e2e8f0",
    color: "#475569",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
  },
  imageBox: {
    height: "180px",
    overflow: "hidden",
    background: "#f8fafc",
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(15, 23, 42, 0.6)",
    padding: "6px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  info: {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: "0.25rem",
  },
  title: { fontWeight: "600", fontSize: "15px", color: "#0f172a" },
  price: { fontSize: "13px", color: "#e11d48", fontWeight: "600" },
  statusOwner: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#475569",
    background: "#f1f5f9",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "0.25rem",
  },
  statusUnlocked: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#e11d48",
    background: "#ffe4e6",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "0.25rem",
  },
  statusLocked: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "0.25rem",
  },
  image: { width: "100%", height: "100%", objectFit: "cover" },
};

export default Feed;
