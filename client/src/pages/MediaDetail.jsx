import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function MediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await api.get(`/media/${id}`);
      setMedia(res.data);
    } catch (err) {
      setError("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      setUnlocking(true);
      await api.post(`/media/${id}/unlock`);
      await fetchMedia();
    } catch (err) {
      setError(err.response?.data?.error || "Unlock failed");
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  const canSeeOriginal = media.is_owner || media.is_unlocked;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/feed")} style={styles.back}>
        ← Back
      </button>

      <div style={styles.card}>
        <img
          src={canSeeOriginal ? media.original_url : media.blurred_url}
          alt={media.title}
          style={styles.image}
        />

        <div style={styles.info}>
          <h2>{media.title}</h2>
          <p style={styles.price}>Unlock price: {media.unlock_price} coins</p>

          <p style={styles.status}>
            {media.is_owner
              ? "✅ Your upload"
              : media.is_unlocked
                ? "🔓 Unlocked"
                : "🔒 Locked"}
          </p>

          {!media.is_owner && !media.is_unlocked && (
            <button
              style={styles.button}
              onClick={handleUnlock}
              disabled={unlocking}
            >
              {unlocking
                ? "Unlocking..."
                : `Unlock for ${media.unlock_price} coins`}
            </button>
          )}

          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "0 auto", padding: "2rem" },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  back: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  image: { width: "100%", height: "350px", objectFit: "cover" },
  info: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  price: { color: "#555", fontSize: "14px" },
  status: { fontSize: "14px" },
  button: {
    padding: "0.75rem",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
  },
  error: { color: "red", fontSize: "13px" },
};

export default MediaDetail;
