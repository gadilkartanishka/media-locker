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
        <h2>Media Feed</h2>
        <div style={styles.headerRight}>
          {user && <span>💰 {user.coins} coins</span>}
          <button onClick={() => navigate("/upload")} style={styles.button}>
            Upload
          </button>
          <button onClick={logout} style={styles.outlineButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {media.map((item) => (
          <div
            key={item.id}
            style={styles.card}
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
            </div>
            <div style={styles.info}>
              <p style={styles.title}>{item.title}</p>
              <p style={styles.price}>{item.unlock_price} coins</p>
              <p style={styles.status}>
                {item.is_owner
                  ? "Your upload"
                  : item.is_unlocked
                    ? "Unlocked"
                    : "Locked"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto", padding: "2rem" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  button: {
    padding: "0.5rem 1rem",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
  outlineButton: {
    padding: "0.5rem 1rem",
    background: "transparent",
    border: "1px solid #111",
    borderRadius: "6px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  imageBox: {
    height: "150px",
    background: "#eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  locked: { fontSize: "2rem" },
  info: { padding: "0.75rem" },
  title: { fontWeight: "600", marginBottom: "0.25rem" },
  price: { fontSize: "13px", color: "#555" },
  status: { fontSize: "12px", color: "#888", marginTop: "0.25rem" },
  imageBox: { height: "150px", overflow: "hidden" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
};

export default Feed;
